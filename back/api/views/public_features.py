from django.db.models import Q
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import (
    Benefactor,
    ContactDisclosureRequest,
    ContactMessage,
    CustomUser,
    DoctorScheduleImage,
    HealthAssistant,
    MedicalCenter,
    NetworkRequest,
    OrganizationApplication,
    Patient,
    RequestReadReceipt,
)
from ..permissions import IsPlatformAdmin
from ..serializers.public_features import (
    ContactDisclosureSerializer,
    ContactMessageReplySerializer,
    ContactMessageSerializer,
    DoctorScheduleImageSerializer,
    MedicalCenterSerializer,
)
from ..services.sms import send_sms
from ..utils import ha_display_name, mask_patient_name


def _org_payload_value(payload, *keys):
    if not isinstance(payload, dict):
        return ""
    for key in keys:
        value = payload.get(key)
        if value:
            return str(value).strip()
    return ""


def _ha_subset_names(qs):
    names = []
    for ha in qs.select_related("individual_profile", "organization_profile")[:8]:
        name = ha_display_name(ha)
        if name:
            names.append(name)
    return "، ".join(names)


def _org_ha_subset(org):
    payload = org.payload if isinstance(org.payload, dict) else {}
    subset = _org_payload_value(
        payload,
        "health_assistant_subset",
        "ha_subset",
        "subset_name",
        "social_unit_name",
        "unit_name",
    )
    if subset:
        return subset
    return _ha_subset_names(
        HealthAssistant.objects.filter(affiliated_organization=org)
    )


def _org_directory_item(org):
    payload = org.payload if isinstance(org.payload, dict) else {}
    return {
        "id": org.pk,
        "name": org.name or org.user.username,
        "organization_role": org.organization_role,
        "org_type": org.org_type,
        "org_subtype": org.org_subtype,
        "province": org.province,
        "city": org.city,
        "address": _org_payload_value(payload, "address", "work_address", "office_address"),
        "landline": _org_payload_value(
            payload,
            "landline",
            "landline_number",
            "phone",
            "director_landline_number",
            "social_unit_head_landline_number",
        ),
        "ha_subset": _org_ha_subset(org),
    }


class PublicStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        supported = (
            Patient.objects.filter(
                Q(network_requests__status="completed")
                | Q(network_requests__collected_amount__gt=0)
                | Q(donations_received__isnull=False)
            )
            .distinct()
            .count()
        )
        return Response(
            {
                "supported_patients": supported,
                "benefactors": Benefactor.objects.count(),
                "charity_centers": OrganizationApplication.objects.filter(
                    organization_role="charity_center",
                    user__state=True,
                ).count(),
                "active_users": CustomUser.objects.filter(state=True, is_active=True).count(),
            }
        )


class PublicMedicalCenterListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = MedicalCenter.objects.filter(is_active=True).prefetch_related("schedule_images")
        city = request.query_params.get("city", "").strip()
        province = request.query_params.get("province", "").strip()
        name = request.query_params.get("name", "").strip()
        center_type = request.query_params.get("center_type", "").strip()
        specialty = request.query_params.get("specialty", "").strip()
        doctor_name = request.query_params.get("doctor_name", "").strip()
        specialty_level = request.query_params.get("specialty_level", "").strip()
        shift = request.query_params.get("shift", "").strip()
        weekday = request.query_params.get("weekday", "").strip()
        weekday_present = request.query_params.get("weekday_present", "").strip()
        if city:
            qs = qs.filter(city__icontains=city)
        if province:
            qs = qs.filter(province__icontains=province)
        if name:
            qs = qs.filter(name__icontains=name)
        if center_type:
            qs = qs.filter(center_type=center_type)
        if specialty:
            qs = qs.filter(schedule_images__specialty_name__icontains=specialty)
        if doctor_name:
            qs = qs.filter(schedule_images__doctor_name__icontains=doctor_name)
        if specialty_level:
            qs = qs.filter(schedule_images__specialty_level=specialty_level)
        if shift:
            qs = qs.filter(Q(schedule_images__shift=shift) | Q(schedule_images__shift="all"))
        if weekday:
            present_q = Q(schedule_images__weekday=weekday) | Q(schedule_images__weekday="")
            if weekday_present == "no":
                qs = qs.exclude(present_q)
            else:
                qs = qs.filter(present_q)
        qs = qs.distinct()
        data = MedicalCenterSerializer(qs, many=True, context={"request": request}).data
        if weekday:
            for item in data:
                images = item.get("schedule_images") or []
                if weekday_present == "no":
                    item["schedule_images"] = [
                        img for img in images if img.get("weekday") not in (weekday, "")
                    ]
                else:
                    item["schedule_images"] = [
                        img for img in images if img.get("weekday") in (weekday, "")
                    ]
        return Response(data)


class AdminMedicalCenterListCreateView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = MedicalCenter.objects.all().prefetch_related("schedule_images")
        return Response(MedicalCenterSerializer(qs, many=True, context={"request": request}).data)

    def post(self, request):
        serializer = MedicalCenterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminMedicalCenterDetailView(APIView):
    permission_classes = [IsPlatformAdmin]

    def _get(self, pk):
        try:
            return MedicalCenter.objects.get(pk=pk)
        except MedicalCenter.DoesNotExist:
            return None

    def patch(self, request, pk):
        center = self._get(pk)
        if not center:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        serializer = MedicalCenterSerializer(
            center, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        center = self._get(pk)
        if not center:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        center.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminMedicalCenterImageView(APIView):
    permission_classes = [IsPlatformAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            center = MedicalCenter.objects.get(pk=pk)
        except MedicalCenter.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        serializer = DoctorScheduleImageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(center=center)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, image_id):
        deleted, _ = DoctorScheduleImage.objects.filter(pk=image_id, center_id=pk).delete()
        if not deleted:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicSupportingOrgSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = OrganizationApplication.objects.filter(
            organization_role__in=("service_center", "charity_center"),
            user__state=True,
        )
        q = request.query_params.get("q", "").strip()
        province = request.query_params.get("province", "").strip()
        city = request.query_params.get("city", "").strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(org_type__icontains=q)
                | Q(org_subtype__icontains=q)
                | Q(payload__icontains=q)
            )
        if province:
            qs = qs.filter(province__icontains=province)
        if city:
            qs = qs.filter(city__icontains=city)
        results = [_org_directory_item(o) for o in qs[:50]]

        centers = MedicalCenter.objects.filter(is_active=True)
        if q:
            centers = centers.filter(
                Q(name__icontains=q) | Q(address__icontains=q) | Q(city__icontains=q)
            )
        if province:
            centers = centers.filter(province__icontains=province)
        if city:
            centers = centers.filter(city__icontains=city)
        for center in centers[:50]:
            results.append(
                {
                    "id": f"mc-{center.pk}",
                    "name": center.name,
                    "organization_role": "service_center",
                    "org_type": "مرکز درمانی",
                    "org_subtype": center.get_center_type_display(),
                    "province": center.province,
                    "city": center.city,
                    "address": center.address,
                    "landline": center.landline,
                    "ha_subset": _ha_subset_names(
                        HealthAssistant.objects.filter(affiliated_medical_center=center)
                    ),
                }
            )
        return Response(results[:50])


class PublicFundableRequestsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from ..serializers.requests import NetworkRequestSerializer
        from ..views.requests import _fundable_requests_qs, filter_by_scope

        qs = _fundable_requests_qs()
        scope = request.query_params.get("scope", "active")
        qs = filter_by_scope(qs, scope)
        serializer = NetworkRequestSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


def _ensure_network_consultant():
    ha = (
        HealthAssistant.objects.filter(is_network_consultant=True)
        .select_related("user")
        .first()
    )
    if ha:
        return ha
    ha = HealthAssistant.objects.select_related("user").order_by("pk").first()
    if ha:
        ha.is_network_consultant = True
        ha.save(update_fields=["is_network_consultant"])
    return ha


class ContactMessageCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save(
            submitted_by=request.user if request.user.is_authenticated else None
        )
        consultant = _ensure_network_consultant()
        if consultant:
            message.assigned_to = consultant.user
            message.save(update_fields=["assigned_to"])
        if message.intent in ("patient_guide", "join_helper", "network_consultant"):
            log = send_sms(
                message.phone,
                "پیام شما در شبکه خیرین حوزه سلامت ثبت شد. مشاور شبکه به‌زودی با شما تماس می‌گیرد.",
                purpose=message.intent,
            )
            message.sms_sent = bool(log.sent)
            message.save(update_fields=["sms_sent"])
        return Response(ContactMessageSerializer(message).data, status=status.HTTP_201_CREATED)


class ContactMessageInboxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == "admin" or getattr(user, "is_staff", False):
            qs = ContactMessage.objects.all()
        elif user.role == "health_assistant":
            ha = user.health_assistant_profile
            if not ha.is_network_consultant:
                return Response({"detail": msg.FORBIDDEN}, status=403)
            qs = ContactMessage.objects.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
        else:
            return Response({"detail": msg.FORBIDDEN}, status=403)
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(ContactMessageSerializer(qs[:100], many=True).data)


class ContactMessageReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        try:
            item = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        if user.role not in ("admin", "health_assistant") and not getattr(user, "is_staff", False):
            return Response({"detail": msg.FORBIDDEN}, status=403)
        if user.role == "health_assistant" and not user.health_assistant_profile.is_network_consultant:
            return Response({"detail": msg.FORBIDDEN}, status=403)
        serializer = ContactMessageReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item.reply = serializer.validated_data["reply"]
        item.status = "answered"
        if serializer.validated_data.get("send_sms"):
            send_sms(item.phone, item.reply[:200], purpose="contact_reply")
            item.sms_sent = True
        item.save()
        return Response(ContactMessageSerializer(item).data)


class ContactDisclosureCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "benefactor":
            return Response({"detail": msg.FORBIDDEN}, status=403)
        patient_id = request.data.get("patient_id")
        request_id = request.data.get("network_request_id")
        try:
            patient = Patient.objects.get(pk=patient_id)
        except (Patient.DoesNotExist, TypeError, ValueError):
            return Response({"detail": "بیمار یافت نشد."}, status=400)
        nr = None
        if request_id:
            nr = NetworkRequest.objects.filter(pk=request_id).first()
        contact = ContactMessage.objects.create(
            name=getattr(getattr(request.user, "benefactor_profile", None), "first_name", "")
            or request.user.username,
            phone=request.user.username,
            region=getattr(getattr(request.user, "benefactor_profile", None), "city", "") or "",
            subject="درخواست مشخصات تماس و کامل بیمار",
            message=(
                request.data.get("message")
                or "درخواست مشاهده اطلاعات تماس و مشخصات کامل بیمار پس از هماهنگی با بیمار."
            ),
            intent="contact_disclosure",
            patient=patient,
            network_request=nr,
            submitted_by=request.user,
        )
        disclosure = ContactDisclosureRequest.objects.create(
            benefactor=request.user,
            patient=patient,
            network_request=nr,
            contact_message=contact,
        )
        return Response(
            {
                "id": disclosure.pk,
                "status": disclosure.status,
                "status_label": disclosure.get_status_display(),
                "detail": "پس از هماهنگی با بیمار به شما اطلاع داده می‌شود.",
                "contact_message_id": contact.pk,
            },
            status=status.HTTP_201_CREATED,
        )


class ContactDisclosureInboxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == "admin" or getattr(user, "is_staff", False):
            qs = ContactDisclosureRequest.objects.all()
        elif user.role == "health_assistant":
            qs = ContactDisclosureRequest.objects.filter(
                Q(patient__introducer__user=user) | Q(patient__introducer__is_network_consultant=True)
            )
        elif user.role == "benefactor":
            qs = ContactDisclosureRequest.objects.filter(benefactor=user)
        else:
            return Response({"detail": msg.FORBIDDEN}, status=403)
        return Response(ContactDisclosureSerializer(qs[:100], many=True).data)

    def patch(self, request, pk):
        user = request.user
        if user.role not in ("admin", "health_assistant") and not getattr(user, "is_staff", False):
            return Response({"detail": msg.FORBIDDEN}, status=403)
        try:
            item = ContactDisclosureRequest.objects.get(pk=pk)
        except ContactDisclosureRequest.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        new_status = request.data.get("status")
        if new_status not in dict(ContactDisclosureRequest.STATUS_CHOICES):
            return Response({"detail": "وضعیت نامعتبر است."}, status=400)
        item.status = new_status
        item.note = request.data.get("note", item.note)
        item.save()
        if new_status in ("approved", "notified"):
            send_sms(
                item.benefactor.username,
                f"مشخصات تماس بیمار {mask_patient_name(item.patient)} پس از هماهنگی ارسال می‌شود.",
                purpose="contact_disclosure",
            )
            item.status = "notified"
            item.save(update_fields=["status"])
        return Response(ContactDisclosureSerializer(item).data)


class RequestMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            nr = NetworkRequest.objects.get(pk=pk)
        except NetworkRequest.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        RequestReadReceipt.objects.get_or_create(request=nr, user=request.user)
        return Response({"is_read": True})
