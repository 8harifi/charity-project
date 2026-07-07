from decimal import Decimal, InvalidOperation

from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import DonationHold, NetworkRequest, Patient, RequestStatusLog
from ..permissions import IsBenefactor, IsDoctor, IsHealthAssistant
from ..serializers.requests import (
    NetworkRequestCreateSerializer,
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
    """Requests open for benefactor pledges (financial or doctor-flagged medical)."""
    return NetworkRequest.objects.filter(
        Q(request_type="financial")
        | Q(request_type="consultation", amount_needed__gt=0),
        amount_needed__isnull=False,
        status__in=("pending", "accepted", "in_progress"),
    )


def filter_by_scope(queryset, scope):
    if scope == "active":
        return queryset.filter(status__in=ACTIVE_STATUSES)
    if scope == "completed":
        return queryset.filter(status="completed")
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
        return Response(
            NetworkRequestSerializer(network_request).data,
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
        if user.role == "patient":
            try:
                return network_request.patient_id == user.patient_profile.pk
            except Patient.DoesNotExist:
                return False
        if user.role == "health_assistant":
            ha = user.health_assistant_profile
            return (
                network_request.created_by_id == user.pk
                or network_request.patient.introducer_id == ha.pk
            )
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

    def get(self, request, pk):
        network_request = self._get_request(request, pk)
        if not network_request:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        if not self._can_view(request.user, network_request):
            return Response({"detail": msg.FORBIDDEN}, status=403)
        return Response(NetworkRequestSerializer(network_request).data)


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
            if network_request.request_type == "financial" and network_request.created_by_id == user.pk:
                return self._handle_financial_close(user, network_request, action, note)
            return Response({"detail": msg.FORBIDDEN}, status=403)

        else:
            return Response({"detail": msg.FORBIDDEN}, status=403)

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
        return Response(NetworkRequestSerializer(qs, many=True, context={"request": request}).data)


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
        data = [
            {
                "id": p.pk,
                "patient_code": p.patient_code,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "national_code": p.national_code or "",
                "phone_number": p.phone_number,
                "sickness_description": p.sickness_description,
                "admin_approved": p.admin_approved,
                "ha_approved": p.ha_approved,
                "state": p.user.state,
            }
            for p in patients
        ]
        return Response(data)


class HealthAssistantApprovePatientView(APIView):
    """HA approves a self-registered patient that named them as introducer.
    Patient becomes fully active only once BOTH admin and HA approval are set."""

    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def post(self, request, pk):
        ha = request.user.health_assistant_profile
        try:
            patient = Patient.objects.get(pk=pk, introducer=ha)
        except Patient.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)

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
            },
            status=status.HTTP_201_CREATED,
        )
