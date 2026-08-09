from typing import Optional

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..media_utils import (
    file_from_data_uri,
    split_full_name
)
from ..models import (
    Benefactor,
    CustomUser,
    OrganizationApplication,
)
from ..services.audit_service import log_audit_event

SERVICE_LABEL_TO_KEY = {
    "آزمایشگاهی": "laboratory",
    "تصویربرداری": "imaging",
    "تست های تخصصی پاراکلینیکی": "para_tests",
    "سایر خدمات پاراکلینیکی": "other_paraclinic",
    "خدمات توانبخشی": "rehabilitation",
    "پرستاری": "nursing",
    "کار در منزل": "homecare",
    "داروخانه": "pharmacy",
    "لوازم پزشکی": "medical_equipment",
    "خدمات حمل و نقل بیماران برای بیماران مناطق دور افتاده": "transport",
}

COOP_PERIOD = {"روزانه": "daily", "هفتگی": "weekly", "ماهانه": "monthly"}
DURATION_UNIT = {"هفته": "week", "ماه": "month", "سال": "year"}

LICENSE_ISSUER_MAP = {
    "وزارت کشور": "interior_ministry",
    "سازمان بهزیستی": "behzisti",
    "نیروی انتظامی": "police",
    "وزارت فرهنگ و ارشاد": "culture_ministry",
    "کمیته امداد": "emdad",
}

ACTIVITY_MAP = {
    "روستا": "village",
    "شهر": "city",
    "شهرستان": "county",
    "استان": "province",
    "کشور": "country",
    "بین الملل": "international",
}

COLLABORATION_MAP = {
    "معرفی بیمار": "patient_introduction",
    "انجام امور مربوط به بیمارن": "patient_services",
    "پروژه های ساخت و ساز": "construction_projects",
    "سایر موارد": "other",
}


def _merge_draft(data: dict) -> dict:
    out = {}
    for k, v in (data or {}).items():
        if k in ("username", "password", "role", "draft"):
            continue
        if isinstance(v, dict):
            out.update(v)
    return out


def _flat_payload(request) -> dict:
    draft = request.data.get("draft")
    if isinstance(draft, dict) and draft:
        merged = {}
        for _k, v in draft.items():
            if isinstance(v, dict):
                merged.update(v)
        merged.update(request.data)
        return merged
    return {**_merge_draft(request.data), **request.data}


def _create_org_signup(organization_role: str, body: dict):
    username = body.get("username")
    password = body.get("password")
    if not username or not password:
        return Response({"detail": msg.USERNAME_PASSWORD_REQUIRED}, status=400)
    if CustomUser.objects.filter(username=username).exists():
        return Response({"detail": msg.USERNAME_TAKEN}, status=400)

    user = CustomUser.objects.create_user(
        username=username,
        password=password,
        role=organization_role,
        state=False,
    )
    OrganizationApplication.objects.create(
        user=user,
        organization_role=organization_role,
        org_type=(body.get("legalType") or body.get("org_type") or "")[:100],
        org_subtype=(body.get("legalSubType") or body.get("org_subtype") or "")[:100],
        name=(body.get("name") or body.get("center_name") or "")[:255],
        province=(body.get("province") or "")[:100],
        city=(body.get("city") or "")[:100],
        payload=body,
    )
    log_audit_event(
        actor=None,
        event_type="org_application_received",
        summary=f"ثبت‌نام سازمان {organization_role}: {body.get('name') or username}",
        target_type="user",
        target_id=user.pk,
        metadata={"organization_role": organization_role, "username": username},
    )
    return Response(
        {
            "message": "ثبت‌نام با موفقیت انجام شد. پس از تأیید مدیر می‌توانید وارد شوید.",
            "user_id": user.pk,
        },
        status=status.HTTP_201_CREATED,
    )


class ServiceCenterSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        body = _flat_payload(request)
        return _create_org_signup("service_center", body)


class CharityCenterSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        draft = request.data.get("draft") if isinstance(request.data.get("draft"), dict) else {}
        s1 = draft.get("step1") or {}
        s2 = draft.get("step2") or {}
        s3 = draft.get("step3") or {}
        body = _flat_payload(request)
        body.update({**s1, **s2, **s3})
        return _create_org_signup("charity_center", body)


def _org_type_from_legal(legal: Optional[str]) -> str:
    if not legal:
        return "association"
    mapping = {
        "مطب پزشک": "doctor_office",
        "مرکز بهداشتی درمانی دولتی": "health_service_center",
        "مرکز نیکوکاری": "charity_center",
        "بیمارستان": "medical_center",
        "دستگاه دولتی": "government",
        "شرکت خصوصی": "private_company",
        "انجمن خیریه": "association",
    }
    return mapping.get(legal.strip(), "association")
