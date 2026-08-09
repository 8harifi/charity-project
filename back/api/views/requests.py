from decimal import Decimal, InvalidOperation

from django.db.models import F, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import DonationHold, NetworkRequest, Patient, RequestAttachment, RequestStatusLog
from ..permissions import IsBenefactor, IsDoctor, IsHealthAssistant, is_platform_admin
from ..utils import (
    ha_browse_patients,
    ha_can_access_patient,
    ha_orphan_patients,
    ha_patient_list_item,
    ha_search_patients,
    request_type_domain,
)
from ..serializers.profile_update import HealthAssistantPatientUpdateSerializer
from ..services.audit_service import log_audit_event
from ..serializers.requests import (
    NetworkRequestCreateSerializer,
    NetworkRequestEditSerializer,
    NetworkRequestSerializer,
    NetworkRequestStatusSerializer,
    PatientWorkflowRequestSerializer,
    fund_recipient_options,
)
from ..serializers.patient import HealthAssistantPatientSignupSerializer
from ..services.donation_service import DonationError, close_financial_request


ACTIVE_STATUSES = ("pending", "accepted", "in_progress")


def _doctor_patient_ids(doctor):
    """Patients whose requests a doctor may see (via cooperating health assistants)."""
    if doctor.cooperates_with_all_health_assistants():
        return Patient.objects.filter(introducer__isnull=False).values_list("pk", flat=True)
    return Patient.objects.filter(
        introducer__in=doctor.cooperating_health_assistants.all()
    ).values_list("pk", flat=True)


def _doctor_can_access_patient(doctor, patient):
    if not patient.introducer_id:
        return False
    if doctor.cooperates_with_all_health_assistants():
        return True
    return doctor.cooperating_health_assistants.filter(pk=patient.introducer_id).exists()


def _fundable_requests_qs():
    """Requests eligible for benefactor pledges (financial or doctor-flagged medical).

    Status is intentionally not constrained here so that scope filters such as
    "completed" and "rejected" can still reach closed requests; `filter_by_scope`
    applies the active-status floor for the default scope.
    """
    return NetworkRequest.objects.filter(
        Q(request_type="financial")
        | Q(request_type="consultation", amount_needed__gt=0),
        amount_needed__isnull=False,
        ha_approval_status__in=("not_required", "approved"),
    )


#: A financial request only becomes `completed` once its creator closes it and the
#: pledged money is released. Until then a fully funded request keeps the
#: `in_progress` status, which reads as "still ongoing" to benefactors. Treat those
#: as completed for filtering and labelling purposes.
FULLY_FUNDED_Q = Q(
    status__in=ACTIVE_STATUSES,
    amount_needed__isnull=False,
    amount_needed__gt=0,
    collected_amount__gte=F("amount_needed"),
)


def filter_by_scope(queryset, scope):
    if scope == "active":
        return queryset.filter(status__in=ACTIVE_STATUSES).exclude(FULLY_FUNDED_Q)
    if scope == "completed":
        return queryset.filter(Q(status="completed") | FULLY_FUNDED_Q)
    if scope == "rejected":
        return queryset.filter(status="rejected")
    if scope == "cancelled":
        return queryset.filter(status="cancelled")
    return queryset


class NetworkRequestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        scope = request.query_params.get("scope", "active")

        if user.role == "patient":
            try:
                patient = user.patient_profile
            except Patient.DoesNotExist:
                return Response([], status=200)
            qs = NetworkRequest.objects.filter(patient=patient)
        elif user.role == "health_assistant":
            ha = user.health_assistant_profile
            patient_id = request.query_params.get("patient_id")
            if patient_id:
                qs = NetworkRequest.objects.filter(patient_id=patient_id)
            else:
                qs = NetworkRequest.objects.filter(
                    Q(created_by=user) | Q(patient__introducer=ha)
                ).distinct()
        elif user.role == "doctor":
            doctor = user.doctor_profile
            qs = NetworkRequest.objects.filter(
                Q(created_by=user) | Q(patient__introducer__cooperating_doctors=doctor)
            ).distinct()
        else:
            return Response({"detail": msg.FORBIDDEN}, status=403)

        qs = filter_by_scope(qs, scope)
        data = NetworkRequestSerializer(qs, many=True).data
        return Response(data)

    def post(self, request):
        role = request.user.role
        if role not in ("patient", "health_assistant", "doctor"):
            return Response({"detail": msg.FORBIDDEN}, status=403)
        serializer = NetworkRequestCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        network_request = serializer.save()
        for uploaded in request.FILES.getlist("attachments"):
            RequestAttachment.objects.create(
                request=network_request,
                file=uploaded,
                uploaded_by=request.user,
            )
        return Response(
            NetworkRequestSerializer(
                network_request, context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED,
        )


class NetworkRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_request(self, request, pk):
        try:
            return NetworkRequest.objects.get(pk=pk)
        except NetworkRequest.DoesNotExist:
            return None

    def _can_view(self, user, network_request):
        if is_platform_admin(user):
            return True
        if user.role == "patient":
            try:
                return network_request.patient_id == user.patient_profile.pk
            except Patient.DoesNotExist:
                return False
        if user.role == "health_assistant":
            ha = user.health_assistant_profile
            if network_request.created_by_id == user.pk:
                return True
            if network_request.patient_id is None:
                return network_request.request_type == "regional"
            return ha_can_access_patient(ha, network_request.patient)
        if user.role == "doctor":
            doctor = user.doctor_profile
            patient_ids = _doctor_patient_ids(doctor)
            return (
                network_request.handled_by_id == user.pk
                or network_request.created_by_id == user.pk
                or (
                    network_request.request_type == "consultation"
                    and network_request.patient_id in patient_ids
                )
            )
        if user.role == "benefactor":
            if network_request.handled_by_id == user.pk:
                return True
            if network_request.amount_needed and network_request.amount_needed > 0:
                return network_request.status in ("pending", "accepted", "in_progress")
            return (
                network_request.request_type == "financial"
                and network_request.status in ("pending", "accepted", "in_progress")
            )
        return False

    def _can_modify(self, user, network_request):
        """Admins always; the submitter only while the request is still open.

        Once a request is completed or cancelled its money has already moved, so
        rewriting it would desynchronise the ledger from the record.
        """
        if is_platform_admin(user):
            return True
        if network_request.created_by_id != user.pk:
            return False
        return network_request.status not in ("completed", "cancelled")

    def get(self, request, pk):
        network_request = self._get_request(request, pk)
        if not network_request:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        if not self._can_view(request.user, network_request):
            return Response({"detail": msg.FORBIDDEN}, status=403)
        return Response(
            NetworkRequestSerializer(network_request, context={"request": request}).data
        )

    def patch(self, request, pk):
        network_request = self._get_request(request, pk)
        if not network_request:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        if not self._can_modify(request.user, network_request):
            return Response({"detail": msg.FORBIDDEN}, status=403)

        serializer = NetworkRequestEditSerializer(
            network_request, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)

        changes = {}
        for field, new_value in serializer.validated_data.items():
            old_value = getattr(network_request, field)
            if old_value != new_value:
                changes[field] = {"from": str(old_value), "to": str(new_value)}
        if not changes:
            return Response(
                NetworkRequestSerializer(
                    network_request, context={"request": request}
                ).data
            )

        serializer.save()

        summary = "، ".join(sorted(changes))
        RequestStatusLog.objects.create(
            request=network_request,
            status=network_request.status,
            note=f"ویرایش درخواست — فیلدهای تغییریافته: {summary}",
            actor=request.user,
        )
        log_audit_event(
            actor=request.user,
            event_type="request_updated",
            summary=f"ویرایش درخواست #{network_request.pk}",
            target_type="network_request",
            target_id=network_request.pk,
            metadata={"changes": changes},
        )
        return Response(
            NetworkRequestSerializer(network_request, context={"request": request}).data
        )

    def delete(self, request, pk):
        network_request = self._get_request(request, pk)
        if not network_request:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        if not self._can_modify(request.user, network_request):
            return Response({"detail": msg.FORBIDDEN}, status=403)

        open_holds = DonationHold.objects.filter(
            network_request=network_request, status="held"
        )
        if open_holds.exists():
            return Response(
                {
                    "detail": "این درخواست حمایت مالی رزروشده دارد. ابتدا آن را لغو کنید تا وجه به خیرین بازگردد."
                },
                status=400,
            )

        request_id = network_request.pk
        subject = network_request.subject
        network_request.delete()
        log_audit_event(
            actor=request.user,
            event_type="request_deleted",
            summary=f"حذف درخواست #{request_id} — {subject}",
            target_type="network_request",
            target_id=request_id,
            metadata={"subject": subject},
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


class NetworkRequestStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        try:
            network_request = NetworkRequest.objects.get(pk=pk)
        except NetworkRequest.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)

        serializer = NetworkRequestStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        note = serializer.validated_data.get("note", "")
        extra = {
            k: serializer.validated_data.get(k)
            for k in (
                "amount_needed",
                "appointment_date",
                "appointment_time",
                "appointment_place",
                "appointment_phone",
                "confirmation_message",
            )
            if k in serializer.validated_data
        }

        if user.role == "doctor":
            if network_request.request_type == "consultation":
                return self._handle_doctor_medical(
                    user, network_request, action, note, extra
                )
            elif (
                network_request.request_type == "financial"
                and network_request.created_by_id == user.pk
            ):
                return self._handle_financial_close(user, network_request, action, note)
            else:
                return Response({"detail": msg.FORBIDDEN}, status=403)

        elif user.role == "health_assistant":
            if action in ("ha_approve", "ha_reject"):
                return self._handle_ha_approval(user, network_request, action, note)
            if network_request.request_type == "financial" and network_request.created_by_id == user.pk:
                return self._handle_financial_close(user, network_request, action, note)
            return Response({"detail": msg.FORBIDDEN}, status=403)

        elif is_platform_admin(user):
            return self._handle_admin_set_status(
                user, network_request, action, note, serializer.validated_data
            )

        else:
            return Response({"detail": msg.FORBIDDEN}, status=403)

    def _handle_admin_set_status(self, user, network_request, action, note, data):
        """Admin override of any request's status, financial or not.

        Closing a funded request still goes through the donation service so pledged
        money is released or refunded rather than being stranded in holds.
        """
        if action != "set_status":
            return Response(
                {"detail": "مدیر فقط می‌تواند از عملیات set_status استفاده کند."},
                status=400,
            )

        new_status = data.get("status") or ""
        valid = {s for s, _ in NetworkRequest.STATUS_CHOICES}
        if new_status not in valid:
            return Response(
                {"status": f"وضعیت نامعتبر است. مقادیر مجاز: {', '.join(sorted(valid))}"},
                status=400,
            )
        if not note.strip():
            return Response(
                {"note": "برای تغییر وضعیت توسط مدیر، ثبت یادداشت الزامی است."},
                status=400,
            )

        previous = network_request.status
        if previous == new_status:
            return Response({"detail": "وضعیت درخواست تغییری نکرد."}, status=400)

        has_open_holds = DonationHold.objects.filter(
            network_request=network_request, status="held"
        ).exists()
        if has_open_holds and new_status in ("completed", "cancelled"):
            try:
                network_request = close_financial_request(
                    request_id=network_request.pk,
                    closed_by_user=network_request.fund_recipient
                    or network_request.created_by,
                    action="complete" if new_status == "completed" else "cancel",
                    note=note,
                )
            except DonationError as exc:
                return Response({"detail": str(exc)}, status=400)
        else:
            network_request.status = new_status
            network_request.save(update_fields=["status", "updated_at"])
            RequestStatusLog.objects.create(
                request=network_request,
                status=new_status,
                note=note,
                actor=user,
            )

        log_audit_event(
            actor=user,
            event_type="request_status_overridden",
            summary=f"تغییر وضعیت درخواست #{network_request.pk} از {previous} به {new_status}",
            target_type="network_request",
            target_id=network_request.pk,
            metadata={"from": previous, "to": new_status, "note": note},
        )
        return Response(NetworkRequestSerializer(network_request).data)

    def _handle_doctor_medical(self, user, network_request, action, note, extra):
        doctor = user.doctor_profile
        if not _doctor_can_access_patient(doctor, network_request.patient):
            return Response({"detail": msg.FORBIDDEN}, status=403)

        if action == "reject":
            if network_request.status != "pending":
                return Response({"detail": "درخواست قابل تغییر نیست."}, status=400)
            network_request.status = "rejected"
            network_request.save(update_fields=["status", "updated_at"])
            RequestStatusLog.objects.create(
                request=network_request,
                status="rejected",
                note=note or "درخواست رد شد",
                actor=user,
            )
            return Response(NetworkRequestSerializer(network_request).data)

        if action == "accept":
            if network_request.status != "pending":
                return Response({"detail": "درخواست قابل تغییر نیست."}, status=400)
            network_request.handled_by = user
            network_request.status = "accepted"
            network_request.save(update_fields=["handled_by", "status", "updated_at"])
            RequestStatusLog.objects.create(
                request=network_request,
                status="accepted",
                note=note or "درخواست پذیرفته شد",
                actor=user,
            )
            return Response(NetworkRequestSerializer(network_request).data)

        if action == "start":
            if network_request.status not in ("accepted", "pending"):
                return Response({"detail": "درخواست قابل شروع نیست."}, status=400)
            network_request.handled_by = user
            network_request.status = "in_progress"
            network_request.save(update_fields=["handled_by", "status", "updated_at"])
            RequestStatusLog.objects.create(
                request=network_request,
                status="in_progress",
                note=note or "درخواست در حال انجام است",
                actor=user,
            )
            return Response(NetworkRequestSerializer(network_request).data)

        if action == "request_funding":
            if network_request.status != "pending":
                return Response({"detail": "درخواست قابل تغییر نیست."}, status=400)
            amount = extra.get("amount_needed")
            if not amount or amount <= 0:
                return Response(
                    {"detail": "مبلغ مورد نیاز برای تأمین مالی الزامی است."},
                    status=400,
                )
            network_request.handled_by = user
            network_request.fund_recipient = user
            network_request.amount_needed = amount
            network_request.collected_amount = network_request.collected_amount or 0
            network_request.status = "in_progress"
            network_request.save(
                update_fields=[
                    "handled_by",
                    "fund_recipient",
                    "amount_needed",
                    "collected_amount",
                    "status",
                    "updated_at",
                ]
            )
            RequestStatusLog.objects.create(
                request=network_request,
                status="in_progress",
                note=note
                or f"پزشک نیاز مالی {int(amount):,} تومان اعلام کرد — در انتظار حمایت نیکوکاران",
                actor=user,
            )
            return Response(NetworkRequestSerializer(network_request).data)

        if action == "schedule":
            if network_request.status != "pending":
                return Response({"detail": "درخواست قابل تغییر نیست."}, status=400)
            network_request.handled_by = user
            network_request.appointment_date = extra.get("appointment_date") or ""
            network_request.appointment_time = extra.get("appointment_time") or ""
            network_request.appointment_place = extra.get("appointment_place") or ""
            network_request.appointment_phone = extra.get("appointment_phone") or ""
            network_request.confirmation_message = (
                extra.get("confirmation_message") or note or ""
            )
            network_request.status = "completed"
            network_request.save(
                update_fields=[
                    "handled_by",
                    "appointment_date",
                    "appointment_time",
                    "appointment_place",
                    "appointment_phone",
                    "confirmation_message",
                    "status",
                    "updated_at",
                ]
            )
            log_note = network_request.confirmation_message or "زمان‌بندی و جزئیات برای بیمار ارسال شد"
            RequestStatusLog.objects.create(
                request=network_request,
                status="completed",
                note=log_note,
                actor=user,
            )
            return Response(NetworkRequestSerializer(network_request).data)

        if action == "confirm":
            if network_request.handled_by_id != user.pk:
                return Response({"detail": msg.FORBIDDEN}, status=403)
            if network_request.status not in ("accepted", "in_progress"):
                return Response({"detail": "درخواست قابل تأیید نیست."}, status=400)

            if extra.get("appointment_date"):
                network_request.appointment_date = extra["appointment_date"]
            if extra.get("appointment_time"):
                network_request.appointment_time = extra["appointment_time"]
            if extra.get("appointment_place"):
                network_request.appointment_place = extra["appointment_place"]
            if extra.get("appointment_phone"):
                network_request.appointment_phone = extra["appointment_phone"]
            network_request.confirmation_message = (
                extra.get("confirmation_message") or note or network_request.confirmation_message
            )

            holds_exist = DonationHold.objects.filter(
                network_request=network_request, status="held"
            ).exists()
            if holds_exist:
                try:
                    close_financial_request(
                        request_id=network_request.pk,
                        closed_by_user=user,
                        action="complete",
                        note=network_request.confirmation_message
                        or "درخواست با تأیید پزشک تکمیل شد",
                    )
                    network_request.refresh_from_db()
                except DonationError as exc:
                    return Response({"detail": str(exc)}, status=400)
            else:
                network_request.status = "completed"
                network_request.save(
                    update_fields=[
                        "appointment_date",
                        "appointment_time",
                        "appointment_place",
                        "appointment_phone",
                        "confirmation_message",
                        "status",
                        "updated_at",
                    ]
                )
                RequestStatusLog.objects.create(
                    request=network_request,
                    status="completed",
                    note=network_request.confirmation_message or "درخواست تکمیل شد",
                    actor=user,
                )
            return Response(NetworkRequestSerializer(network_request).data)

        return Response({"detail": f"عملیات نامعتبر: {action}"}, status=400)

    def _handle_financial_close(self, user, network_request, action, note):
        if action not in ("complete", "cancel"):
            return Response(
                {"detail": "برای درخواست مالی فقط complete یا cancel مجاز است."},
                status=400,
            )
        try:
            req = close_financial_request(
                request_id=network_request.pk,
                closed_by_user=user,
                action=action,
                note=note,
            )
        except DonationError as exc:
            return Response({"detail": str(exc)}, status=400)

        return Response(NetworkRequestSerializer(req).data)

    def _handle_ha_approval(self, user, network_request, action, note):
        ha = user.health_assistant_profile
        domain = request_type_domain(network_request.request_type)
        if not ha_can_access_patient(
            ha, network_request.patient, action="approve", domain=domain
        ):
            return Response({"detail": msg.FORBIDDEN}, status=403)
        if network_request.ha_approval_status != "pending":
            return Response({"detail": "این درخواست نیاز به تأیید ندارد."}, status=400)
        if action == "ha_approve":
            network_request.ha_approval_status = "approved"
            network_request.status = "pending"
        else:
            network_request.ha_approval_status = "rejected"
            network_request.status = "rejected"
        network_request.save(update_fields=["ha_approval_status", "status", "updated_at"])
        RequestStatusLog.objects.create(
            request=network_request,
            status=network_request.status,
            note=note or ("تأیید سلامتیار" if action == "ha_approve" else "رد توسط سلامتیار"),
            actor=user,
        )
        return Response(NetworkRequestSerializer(network_request).data)


class DoctorIncomingRequestsView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        doctor = request.user.doctor_profile
        patient_ids = _doctor_patient_ids(doctor)
        qs = NetworkRequest.objects.filter(
            request_type="consultation",
            status="pending",
            handled_by__isnull=True,
            patient_id__in=patient_ids,
            created_by__role__in=("patient", "health_assistant"),
        ).select_related("patient", "created_by", "specialty")
        return Response(
            NetworkRequestSerializer(qs, many=True, context={"request": request}).data
        )


class DoctorMyCasesView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        scope = request.query_params.get("scope", "active")
        qs = NetworkRequest.objects.filter(
            request_type="consultation",
            handled_by=request.user,
        ).select_related("patient", "specialty")
        qs = filter_by_scope(qs, scope)
        return Response(
            NetworkRequestSerializer(qs, many=True, context={"request": request}).data
        )


class PatientWorkflowView(APIView):
    """All requests for one patient — the patient's گردش کار."""

    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        try:
            patient = Patient.objects.get(pk=patient_id)
        except Patient.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)

        user = request.user
        allowed = False
        if user.role == "patient":
            try:
                allowed = user.patient_profile.pk == patient.pk
            except Patient.DoesNotExist:
                pass
        elif user.role == "health_assistant":
            allowed = patient.introducer_id == user.health_assistant_profile.pk
        elif user.role == "doctor":
            allowed = _doctor_can_access_patient(user.doctor_profile, patient)
        elif user.role == "admin":
            allowed = True

        if not allowed:
            return Response({"detail": msg.FORBIDDEN}, status=403)

        qs = NetworkRequest.objects.filter(patient=patient).order_by("-created_at")
        return Response(
            {
                "patient": {
                    "id": patient.pk,
                    "patient_code": patient.patient_code,
                    "name": f"{patient.first_name} {patient.last_name}".strip(),
                },
                "requests": PatientWorkflowRequestSerializer(qs, many=True).data,
            }
        )


class BenefactorIncomingRequestsView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def get(self, request):
        qs = _fundable_requests_qs()
        scope = request.query_params.get("scope", "active")
        qs = filter_by_scope(qs, scope)

        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(subject__icontains=search)
                | Q(description__icontains=search)
                | Q(patient__first_name__icontains=search)
                | Q(patient__last_name__icontains=search)
                | Q(patient__patient_code__icontains=search)
            )

        specialty_id = request.query_params.get("specialty")
        if specialty_id:
            qs = qs.filter(specialty_id=specialty_id)

        province = request.query_params.get("province", "").strip()
        if province:
            qs = qs.filter(patient__province__icontains=province)

        min_amount = request.query_params.get("min_amount")
        if min_amount:
            try:
                qs = qs.filter(amount_needed__gte=Decimal(min_amount))
            except (InvalidOperation, TypeError):
                pass

        max_amount = request.query_params.get("max_amount")
        if max_amount:
            try:
                qs = qs.filter(amount_needed__lte=Decimal(max_amount))
            except (InvalidOperation, TypeError):
                pass

        return Response(NetworkRequestSerializer(qs.distinct(), many=True, context={"request": request}).data)


class BenefactorMyCasesView(APIView):
    """Financial requests the benefactor has actually donated/pledged to
    (via DonationHold), regardless of who is handling the request."""

    permission_classes = [IsAuthenticated, IsBenefactor]

    def get(self, request):
        scope = request.query_params.get("scope", "active")
        request_ids = DonationHold.objects.filter(
            benefactor=request.user
        ).values_list("network_request_id", flat=True).distinct()
        qs = NetworkRequest.objects.filter(
            Q(request_type="financial")
            | Q(request_type="consultation", amount_needed__gt=0),
            pk__in=request_ids,
        )
        qs = filter_by_scope(qs, scope)

        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(subject__icontains=search)
                | Q(description__icontains=search)
                | Q(patient__first_name__icontains=search)
                | Q(patient__last_name__icontains=search)
                | Q(patient__patient_code__icontains=search)
            )

        specialty_id = request.query_params.get("specialty")
        if specialty_id:
            qs = qs.filter(specialty_id=specialty_id)

        province = request.query_params.get("province", "").strip()
        if province:
            qs = qs.filter(patient__province__icontains=province)

        min_amount = request.query_params.get("min_amount")
        if min_amount:
            try:
                qs = qs.filter(amount_needed__gte=Decimal(min_amount))
            except (InvalidOperation, TypeError):
                pass

        max_amount = request.query_params.get("max_amount")
        if max_amount:
            try:
                qs = qs.filter(amount_needed__lte=Decimal(max_amount))
            except (InvalidOperation, TypeError):
                pass

        return Response(
            NetworkRequestSerializer(
                qs.distinct(), many=True, context={"request": request}
            ).data
        )


class FundRecipientOptionsView(APIView):
    """Options for who receives funds on a financial request: self or cooperating staff."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ("health_assistant", "doctor"):
            return Response({"detail": msg.FORBIDDEN}, status=403)
        users = fund_recipient_options(request.user)
        data = [
            {
                "id": u.pk,
                "label": _staff_display_name(u),
                "role": u.role,
                "is_self": u.pk == request.user.pk,
            }
            for u in users
        ]
        return Response(data)


def _staff_display_name(user):
    try:
        if user.role == "doctor":
            d = user.doctor_profile
            return f"{d.first_name} {d.last_name}".strip() or user.username
        if user.role == "health_assistant":
            ha = user.health_assistant_profile
            if getattr(ha, "individual_profile", None):
                ind = ha.individual_profile
                return f"{ind.first_name} {ind.last_name}".strip() or user.username
            if getattr(ha, "organization_profile", None):
                return ha.organization_profile.name or user.username
    except Exception:
        pass
    return user.username


class HealthAssistantPatientsView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def get(self, request):
        ha = request.user.health_assistant_profile
        patients = Patient.objects.filter(introducer=ha).order_by("-created_at")
        return Response([ha_patient_list_item(ha, p) for p in patients])


class HealthAssistantBrowsePatientsView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def get(self, request):
        ha = request.user.health_assistant_profile
        params = {
            "scope": request.query_params.get("scope", "all"),
            "search": request.query_params.get("search", ""),
            "province": request.query_params.get("province", ""),
            "city": request.query_params.get("city", ""),
            "national_code": request.query_params.get("national_code", ""),
            "approval": request.query_params.get("approval", ""),
            "limit": request.query_params.get("limit", "100"),
        }
        patients = ha_browse_patients(ha, params)
        return Response([ha_patient_list_item(ha, p) for p in patients])


class HealthAssistantPatientDetailView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def get(self, request, pk):
        ha = request.user.health_assistant_profile
        try:
            patient = Patient.objects.select_related("user", "introducer").get(pk=pk)
        except Patient.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        return Response(ha_patient_list_item(ha, patient))

    def patch(self, request, pk):
        ha = request.user.health_assistant_profile
        try:
            patient = Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        if not ha_can_access_patient(
            ha, patient, action="edit", domain="registration"
        ):
            return Response(
                {"detail": "مجوز ویرایش این بیمار را ندارید."},
                status=403,
            )
        profile_data = request.data.get("profile", request.data)
        serializer = HealthAssistantPatientUpdateSerializer(
            patient, data=profile_data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_audit_event(
            actor=request.user,
            event_type="ha_patient_updated",
            summary=f"ویرایش بیمار {patient.first_name} {patient.last_name} ({patient.patient_code})",
            target_type="patient",
            target_id=patient.pk,
        )
        return Response(ha_patient_list_item(ha, patient))


class HealthAssistantApprovePatientView(APIView):
    """HA approves a self-registered patient that named them as introducer.
    Patient becomes fully active only once BOTH admin and HA approval are set."""

    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def post(self, request, pk):
        ha = request.user.health_assistant_profile
        try:
            patient = Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)

        if not ha_can_access_patient(
            ha, patient, action="approve", domain="registration"
        ):
            return Response({"detail": msg.FORBIDDEN}, status=403)

        patient.ha_approved = True
        patient.save(update_fields=["ha_approved"])

        if patient.admin_approved and patient.ha_approved:
            patient.user.state = True
            patient.user.save(update_fields=["state"])

        return Response(
            {
                "message": "بیمار توسط سلامتیار تأیید شد.",
                "admin_approved": patient.admin_approved,
                "ha_approved": patient.ha_approved,
                "state": patient.user.state,
            }
        )


class HealthAssistantPatientSignupView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def post(self, request):
        ha = request.user.health_assistant_profile
        serializer = HealthAssistantPatientSignupSerializer(
            data=request.data,
            context={"request": request, "introducer": ha},
        )
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()

        return Response(
            {
                "message": "Patient created successfully",
                "patient": {
                    "id": patient.id,
                    "patient_code": patient.patient_code,
                    "first_name": patient.first_name,
                    "last_name": patient.last_name,
                    "phone_number": patient.phone_number,
                },
                "introducer": {
                    "code": ha.health_assistance_code,
                    "name": _staff_display_name(request.user),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class HealthAssistantOrphanPatientsView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def get(self, request):
        ha = request.user.health_assistant_profile
        if not ha.can_claim_orphan_patients:
            return Response({"detail": msg.FORBIDDEN}, status=403)
        patients = ha_orphan_patients(ha)
        data = [
            {
                "id": p.pk,
                "patient_code": p.patient_code,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "national_code": p.national_code or "",
                "city": p.city,
            }
            for p in patients
        ]
        return Response(data)


class HealthAssistantClaimPatientView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def post(self, request, pk):
        ha = request.user.health_assistant_profile
        if not ha.can_claim_orphan_patients:
            return Response({"detail": msg.FORBIDDEN}, status=403)
        try:
            patient = Patient.objects.get(pk=pk, introducer__isnull=True)
        except Patient.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        city = ha_orphan_patients(ha).filter(pk=pk).exists()
        if not city:
            return Response({"detail": "این بیمار در شهر شما نیست."}, status=400)
        patient.introducer = ha
        patient.ha_approved = True
        patient.save(update_fields=["introducer", "ha_approved"])
        log_audit_event(
            actor=request.user,
            event_type="ha_patient_claimed",
            summary=f"پذیرش بیمار {patient.first_name} {patient.last_name} ({patient.patient_code})",
            target_type="patient",
            target_id=patient.pk,
        )
        return Response({"message": "بیمار به لیست شما اضافه شد."})


class HealthAssistantRemovePatientView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def post(self, request, pk):
        ha = request.user.health_assistant_profile
        try:
            patient = Patient.objects.get(pk=pk, introducer=ha)
        except Patient.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        patient.introducer = None
        patient.ha_approved = False
        patient.save(update_fields=["introducer", "ha_approved"])
        log_audit_event(
            actor=request.user,
            event_type="ha_patient_removed",
            summary=f"حذف بیمار {patient.first_name} {patient.last_name} ({patient.patient_code}) از لیست",
            target_type="patient",
            target_id=patient.pk,
        )
        return Response({"message": "بیمار از لیست شما حذف شد."})


class HealthAssistantPatientSearchView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def get(self, request):
        ha = request.user.health_assistant_profile
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response([])
        patients = ha_search_patients(ha, query)
        data = [
            {
                "id": p.pk,
                "patient_code": p.patient_code,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "national_code": p.national_code or "",
                "is_mine": p.introducer_id == ha.pk,
                "is_orphan": p.introducer_id is None,
            }
            for p in patients
        ]
        return Response(data)
