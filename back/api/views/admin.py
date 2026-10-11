from django.db.models import Count, Q
from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..admin_user_filters import filter_admin_users, user_profile_phone

from .. import messages as msg
from ..models import (
    Benefactor,
    BenefactorDonation,
    Campaign,
    CoveredOrganization,
    CustomUser,
    Doctor,
    Education,
    Gender,
    HealthAssistant,
    HealthAssistantCooperationType,
    HousingStatus,
    IndividualHealthAssistant,
    Insurance,
    JobStatus,
    MaritalStatus,
    MedicalCenter,
    NetworkRequest,
    OrganizationApplication,
    OrganizationHealthAssistant,
    OrganizationType,
    Patient,
    Specialty,
)
from ..permissions import IsPlatformAdmin
from ..serializers.admin import (
    AdminBenefactorProfileSerializer,
    AdminDoctorProfileSerializer,
    AdminIndividualHASerializer,
    AdminOrganizationHASerializer,
    AdminPatientProfileSerializer,
    AdminUserAccountSerializer,
    AdminUserListSerializer,
    admin_profile_payload,
)
from ..serializers.requests import NetworkRequestSerializer
from ..services.audit_service import log_audit_event
from .requests import apply_read_status, filter_by_scope


LOOKUP_REGISTRY = {
    "genders": (Gender, "جنسیت"),
    "marital-status": (MaritalStatus, "وضعیت تأهل"),
    "specialties": (Specialty, "تخصص"),
    "health-assistant-cooperation-types": (
        HealthAssistantCooperationType,
        "نوع همکاری سلامتیار",
    ),
    "educations": (Education, "تحصیلات"),
    "job-statuses": (JobStatus, "وضعیت شغلی"),
    "housing-statuses": (HousingStatus, "وضعیت مسکن"),
    "covered-organizations": (CoveredOrganization, "ارگان تحت پوشش"),
    "insurances": (Insurance, "بیمه"),
    "organization-types": (OrganizationType, "نوع مجموعه"),
}


def _lookup_model(slug):
    entry = LOOKUP_REGISTRY.get(slug)
    if not entry:
        return None
    return entry[0]


REQUEST_STATUS_LABELS = {
    "pending": "در انتظار",
    "accepted": "پذیرفته‌شده",
    "in_progress": "در حال انجام",
    "completed": "تکمیل‌شده",
    "cancelled": "لغوشده",
}


def _request_status_breakdown():
    rows = NetworkRequest.objects.values("status").annotate(count=Count("id"))
    return [
        {
            "label": REQUEST_STATUS_LABELS.get(row["status"], row["status"]),
            "value": row["count"],
            "status": row["status"],
        }
        for row in rows
        if row["count"]
    ]


class AdminStatsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        return Response(
            {
                "total_users": CustomUser.objects.exclude(role="admin").count(),
                "pending_users": CustomUser.objects.filter(state=False)
                .exclude(role="admin")
                .count(),
                "active_users": CustomUser.objects.filter(is_active=True, state=True)
                .exclude(role="admin")
                .count(),
                "patients": Patient.objects.count(),
                "doctors": Doctor.objects.count(),
                "benefactors": Benefactor.objects.count(),
                "health_assistants": HealthAssistant.objects.count(),
                "total_requests": NetworkRequest.objects.count(),
                "pending_requests": NetworkRequest.objects.filter(status="pending").count(),
                "in_progress_requests": NetworkRequest.objects.filter(
                    status="in_progress"
                ).count(),
                "completed_requests": NetworkRequest.objects.filter(status="completed").count(),
                "total_donations": BenefactorDonation.objects.count(),
                "total_campaigns": Campaign.objects.count(),
                "published_campaigns": Campaign.objects.filter(is_published=True).count(),
                "request_status_breakdown": _request_status_breakdown(),
            }
        )


class AdminUsersView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = filter_admin_users(request)
        data = AdminUserListSerializer(qs, many=True).data
        return Response(data)


class AdminUsersExportView(APIView):
    permission_classes = [IsPlatformAdmin]

    ROLE_LABELS = {
        "patient": "بیمار",
        "doctor": "پزشک",
        "health_assistant": "سلامتیار",
        "benefactor": "خیر",
        "admin": "مدیر",
    }

    def get(self, request):
        fmt = (request.query_params.get("export_as") or "csv").lower()
        qs = filter_admin_users(request)
        rows = AdminUserListSerializer(qs, many=True).data

        if fmt == "pdf":
            return self._pdf_response(rows)
        return self._csv_response(rows)

    def _csv_response(self, rows):
        import csv
        from io import StringIO

        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(
            ["id", "display_name", "phone", "role", "state", "is_active", "date_joined"]
        )
        for row in rows:
            writer.writerow(
                [
                    row.get("id"),
                    row.get("display_name") or "",
                    row.get("phone") or row.get("username") or "",
                    self.ROLE_LABELS.get(row.get("role"), row.get("role")),
                    "approved" if row.get("state") else "pending",
                    "active" if row.get("is_active") is not False else "inactive",
                    row.get("date_joined") or "",
                ]
            )

        response = HttpResponse("\ufeff" + buffer.getvalue(), content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="users.csv"'
        return response

    def _pdf_response(self, rows):
        from ..pdf_export import build_users_pdf

        pdf_bytes = build_users_pdf(rows, role_labels=self.ROLE_LABELS)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="users.pdf"'
        return response


class AdminUserDetailView(APIView):
    permission_classes = [IsPlatformAdmin]

    def _get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, user_id):
        user = self._get_user(user_id)
        if not user:
            return Response({"detail": msg.USER_NOT_FOUND}, status=404)
        return Response(admin_profile_payload(user))

    def patch(self, request, user_id):
        user = self._get_user(user_id)
        if not user:
            return Response({"detail": msg.USER_NOT_FOUND}, status=404)

        account_data = request.data.get("account")
        profile_data = request.data.get("profile")

        if account_data:
            account_serializer = AdminUserAccountSerializer(
                user, data=account_data, partial=True
            )
            account_serializer.is_valid(raise_exception=True)
            account_serializer.save()

        if profile_data:
            err = _patch_user_profile(user, profile_data, actor=request.user)
            if err:
                return Response(err, status=400)

        if account_data or profile_data:
            log_audit_event(
                actor=request.user,
                event_type="user_profile_updated",
                summary=f"ویرایش حساب/پروفایل کاربر {user.username}",
                target_type="user",
                target_id=user.pk,
                metadata={"role": user.role},
            )

        return Response(admin_profile_payload(user))


def _apply_ha_affiliation(ha, data):
    if "affiliation_kind" in data:
        kind = (data.get("affiliation_kind") or "independent").strip()
        if kind not in ("independent", "affiliated"):
            return {"affiliation_kind": "مقدار نامعتبر است."}
        ha.affiliation_kind = kind

    org_present = "affiliated_organization_id" in data or "affiliated_organization" in data
    if org_present:
        org_id = data.get("affiliated_organization_id", data.get("affiliated_organization"))
        if org_id in ("", None, 0, "0"):
            ha.affiliated_organization = None
        else:
            try:
                ha.affiliated_organization = OrganizationApplication.objects.get(pk=int(org_id))
            except (OrganizationApplication.DoesNotExist, TypeError, ValueError):
                return {"affiliated_organization_id": "سازمان یافت نشد."}

    center_present = "affiliated_medical_center_id" in data or "affiliated_medical_center" in data
    if center_present:
        center_id = data.get("affiliated_medical_center_id", data.get("affiliated_medical_center"))
        if center_id in ("", None, 0, "0"):
            ha.affiliated_medical_center = None
        else:
            try:
                ha.affiliated_medical_center = MedicalCenter.objects.get(pk=int(center_id))
            except (MedicalCenter.DoesNotExist, TypeError, ValueError):
                return {"affiliated_medical_center_id": "مرکز درمانی یافت نشد."}

    if ha.affiliation_kind == "independent":
        ha.affiliated_organization = None
        ha.affiliated_medical_center = None
    ha.save(
        update_fields=[
            "affiliation_kind",
            "affiliated_organization",
            "affiliated_medical_center",
        ]
    )
    return None


def _patch_user_profile(user, profile_data, actor=None):
    role = user.role
    ha_perm_updated = False
    try:
        if role == "patient":
            profile = user.patient_profile
            serializer = AdminPatientProfileSerializer(
                profile, data=profile_data, partial=True
            )
        elif role == "doctor":
            profile = user.doctor_profile
            serializer = AdminDoctorProfileSerializer(
                profile, data=profile_data, partial=True
            )
        elif role == "benefactor":
            profile = user.benefactor_profile
            serializer = AdminBenefactorProfileSerializer(
                profile, data=profile_data, partial=True
            )
        elif role == "health_assistant":
            ha = user.health_assistant_profile
            aff_keys = {
                "affiliation_kind",
                "affiliated_organization",
                "affiliated_organization_id",
                "affiliated_medical_center",
                "affiliated_medical_center_id",
            }
            aff_fields = {k: v for k, v in profile_data.items() if k in aff_keys}
            if aff_fields:
                err = _apply_ha_affiliation(ha, aff_fields)
                if err:
                    return err
                profile_data = {k: v for k, v in profile_data.items() if k not in aff_keys}
            perm_fields = {
                k: v
                for k, v in profile_data.items()
                if k.startswith("can_") or k == "org_approved"
            }
            if perm_fields:
                from ..serializers.admin import AdminHealthAssistantPermissionsSerializer

                perm_ser = AdminHealthAssistantPermissionsSerializer(
                    ha, data=perm_fields, partial=True
                )
                perm_ser.is_valid(raise_exception=True)
                perm_ser.save()
                ha_perm_updated = True
                if actor:
                    log_audit_event(
                        actor=actor,
                        event_type="ha_permission_updated",
                        summary=f"تغییر دسترسی سلامتیار {user.username}",
                        target_type="health_assistant",
                        target_id=ha.pk,
                        metadata=perm_fields,
                    )
                profile_data = {
                    k: v for k, v in profile_data.items() if k not in perm_fields
                }
            if not profile_data:
                return None
            try:
                profile = ha.individual_profile
                serializer = AdminIndividualHASerializer(
                    profile, data=profile_data, partial=True
                )
            except IndividualHealthAssistant.DoesNotExist:
                profile = ha.organization_profile
                serializer = AdminOrganizationHASerializer(
                    profile, data=profile_data, partial=True
                )
        else:
            return {"detail": msg.PROFILE_EDITING_NOT_SUPPORTED}
    except (
        Patient.DoesNotExist,
        Doctor.DoesNotExist,
        Benefactor.DoesNotExist,
        HealthAssistant.DoesNotExist,
    ):
        return {"detail": msg.PROFILE_NOT_FOUND}

    serializer.is_valid(raise_exception=True)
    serializer.save()
    return None


class AdminUserRequestsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request, user_id):
        try:
            user = CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return Response({"detail": msg.USER_NOT_FOUND}, status=404)

        scope = request.query_params.get("scope", "all")
        qs = NetworkRequest.objects.all()

        if user.role == "patient":
            try:
                qs = qs.filter(patient=user.patient_profile)
            except Patient.DoesNotExist:
                qs = qs.none()
        elif user.role == "health_assistant":
            try:
                ha = user.health_assistant_profile
                qs = qs.filter(
                    Q(created_by=user) | Q(patient__introducer=ha)
                ).distinct()
            except HealthAssistant.DoesNotExist:
                qs = qs.none()
        elif user.role == "doctor":
            qs = qs.filter(
                Q(handled_by=user)
                | Q(
                    request_type="consultation",
                    specialty=user.doctor_profile.specialty,
                )
            )
        elif user.role == "benefactor":
            qs = qs.filter(
                Q(handled_by=user) | Q(request_type="financial")
            )
        else:
            qs = qs.none()

        qs = filter_by_scope(qs, scope)
        return Response(NetworkRequestSerializer(qs.order_by("-created_at"), many=True).data)


class AdminRequestsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        scope = request.query_params.get("scope", "all")
        request_type = request.query_params.get("request_type")
        search = request.query_params.get("search", "").strip()
        qs = NetworkRequest.objects.all().order_by("-created_at")

        if request_type:
            qs = qs.filter(request_type=request_type)
        qs = filter_by_scope(qs, scope)
        qs = apply_read_status(
            qs, request.user, request.query_params.get("read_status", "").strip()
        )
        if search:
            qs = qs.filter(
                Q(subject__icontains=search)
                | Q(description__icontains=search)
                | Q(patient__first_name__icontains=search)
                | Q(patient__last_name__icontains=search)
                | Q(patient__phone_number__icontains=search)
                | Q(patient__patient_code__icontains=search)
            ).distinct()

        return Response(
            NetworkRequestSerializer(qs, many=True, context={"request": request}).data
        )


class AdminLookupsMetaView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        data = [
            {
                "slug": slug,
                "label": label,
                "count": model.objects.count(),
            }
            for slug, (model, label) in LOOKUP_REGISTRY.items()
        ]
        return Response(data)


class AdminLookupItemsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request, slug):
        model = _lookup_model(slug)
        if not model:
            return Response({"detail": msg.UNKNOWN_LOOKUP_TYPE}, status=404)
        rows = model.objects.all().order_by("id")
        return Response([{"id": r.id, "name": r.name} for r in rows])

    def post(self, request, slug):
        model = _lookup_model(slug)
        if not model:
            return Response({"detail": msg.UNKNOWN_LOOKUP_TYPE}, status=404)
        name = (request.data.get("name") or "").strip()
        if not name:
            return Response({"detail": msg.LOOKUP_NAME_REQUIRED}, status=400)
        if model.objects.filter(name=name).exists():
            return Response({"detail": msg.LOOKUP_NAME_ALREADY_EXISTS}, status=400)
        row = model.objects.create(name=name)
        log_audit_event(
            actor=request.user,
            event_type="lookup_created",
            summary=f"افزودن «{name}» به {slug}",
            target_type="lookup",
            target_id=row.id,
            metadata={"slug": slug, "name": name},
        )
        return Response({"id": row.id, "name": row.name}, status=status.HTTP_201_CREATED)


class AdminLookupItemDetailView(APIView):
    permission_classes = [IsPlatformAdmin]

    def _get_row(self, slug, item_id):
        model = _lookup_model(slug)
        if not model:
            return None, Response({"detail": msg.UNKNOWN_LOOKUP_TYPE}, status=404)
        try:
            return model.objects.get(pk=item_id), None
        except model.DoesNotExist:
            return None, Response({"detail": msg.LOOKUP_ITEM_NOT_FOUND}, status=404)

    def patch(self, request, slug, item_id):
        row, err = self._get_row(slug, item_id)
        if err:
            return err
        name = (request.data.get("name") or "").strip()
        if not name:
            return Response({"detail": msg.LOOKUP_NAME_REQUIRED}, status=400)
        model = _lookup_model(slug)
        if model.objects.filter(name=name).exclude(pk=item_id).exists():
            return Response({"detail": msg.LOOKUP_NAME_ALREADY_EXISTS}, status=400)
        row.name = name
        row.save(update_fields=["name"])
        log_audit_event(
            actor=request.user,
            event_type="lookup_updated",
            summary=f"ویرایش داده پایه {slug} به «{name}»",
            target_type="lookup",
            target_id=row.id,
            metadata={"slug": slug, "name": name},
        )
        return Response({"id": row.id, "name": row.name})

    def delete(self, request, slug, item_id):
        row, err = self._get_row(slug, item_id)
        if err:
            return err
        row_id = row.id
        row_name = row.name
        row.delete()
        log_audit_event(
            actor=request.user,
            event_type="lookup_deleted",
            summary=f"حذف «{row_name}» از {slug}",
            target_type="lookup",
            target_id=row_id,
            metadata={"slug": slug, "name": row_name},
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
