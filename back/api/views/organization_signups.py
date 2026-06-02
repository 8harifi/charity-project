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
    # CharityCenter,
    CustomUser,
    # ServiceCenter,
)

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


class ServiceCenterSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        body = _flat_payload(request)
        username = body.get("username")
        password = body.get("password")
        if not username or not password:
            return Response({"detail": msg.USERNAME_PASSWORD_REQUIRED}, status=400)
        if CustomUser.objects.filter(username=username).exists():
            return Response({"detail": msg.USERNAME_TAKEN}, status=400)

        services = body.get("services") or []
        if isinstance(services, str):
            services = [services]
        subset_keys = []
        for s in services:
            key = SERVICE_LABEL_TO_KEY.get(s)
            if key and key not in subset_keys:
                subset_keys.append(key)

        coop = COOP_PERIOD.get(body.get("cooperationType"), "monthly")
        dur_u = DURATION_UNIT.get(body.get("durationUnit"), "month")

        # ServiceCenter model is disabled; re-enable when service_center is back in use.
        # user = CustomUser.objects.create_user(
        #     username=username,
        #     password=password,
        #     role="service_center",
        #     state=False,
        # )
        # ServiceCenter.objects.create(
        #     user=user,
        #     center_name=(body.get("name") or "").strip() or "مرکز",
        #     province=(body.get("province") or "").strip(),
        #     county=(body.get("town") or "").strip(),
        #     city=(body.get("city") or "").strip(),
        #     address=(body.get("address") or "").strip(),
        #     cooperation_scope="all" if body.get("referrerType") == "all" else "limited",
        #     target_organization_type=(body.get("legalType") or "")[:50],
        #     target_subset_type=(body.get("legalSubType") or "")[:100],
        #     target_subset_name=(body.get("legalName") or "")[:200],
        #     subset_types=subset_keys or ["other"],
        #     other_subset_description=(
        #         (body.get("otherService") or "") + " " + (body.get("otherCooperation") or "")
        #     ).strip()[:200],
        #     cooperation_patient_count=int(body.get("patientCount") or 1),
        #     cooperation_period=coop,
        #     cooperation_period_description="",
        #     free_duration_value=int(body.get("durationNumber") or 1),
        #     free_duration_unit=dur_u,
        #     description=(body.get("notes") or "")[:2000],
        # )
        return Response(
            {"detail": msg.SERVICE_CENTER_SIGNUP_DISABLED},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


class CharityCenterSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        draft = request.data.get("draft") if isinstance(request.data.get("draft"), dict) else {}
        s1 = draft.get("step1") or {}
        s2 = draft.get("step2") or {}
        s3 = draft.get("step3") or {}
        body = _flat_payload(request)

        username = body.get("username")
        password = body.get("password")
        if not username or not password:
            return Response({"detail": msg.USERNAME_PASSWORD_REQUIRED}, status=400)
        if CustomUser.objects.filter(username=username).exists():
            return Response({"detail": msg.USERNAME_TAKEN}, status=400)

        req_letter = s3.get("requestLetter") or body.get("requestLetter")
        letter = (
            file_from_data_uri(req_letter.get("base64")) if isinstance(req_letter, dict) else None
        )
        if not letter:
            return Response({"detail": msg.REQUEST_LETTER_REQUIRED}, status=400)

        lic_file = None
        lic_obj = s3.get("license")
        if isinstance(lic_obj, dict) and lic_obj.get("base64"):
            lic_file = file_from_data_uri(lic_obj.get("base64"))
        logo_file = None
        lg = s3.get("logo") or body.get("logo")
        if isinstance(lg, dict) and lg.get("base64"):
            logo_file = file_from_data_uri(lg.get("base64"))

        telephone = (s2.get("telephone") or body.get("telephone") or "02100000000").strip()
        city_code = telephone[: min(4, len(telephone))] or "021"
        phone_rest = telephone[len(city_code):] or telephone

        license_status = s1.get("license") or body.get("license")
        if isinstance(license_status, dict):
            has_lic = "yes"
        else:
            has_lic = "yes" if license_status == "دارد" else "no"

        # CharityCenter model is disabled; re-enable when charity_center is back in use.
        # user = CustomUser.objects.create_user(
        #     username=username,
        #     password=password,
        #     role="charity_center",
        #     state=False,
        # )
        # CharityCenter.objects.create(
        #     user=user,
        #     center_name=(s1.get("name") or body.get("name") or "").strip() or "مرکز نیکوکاری",
        #     introduction=(s1.get("introduction") or body.get("introduction") or "")[:4000],
        #     has_license=has_lic,
        #     registration_number=(s1.get("registrationNumber") or body.get("registrationNumber") or "")[:100],
        #     start_year=int(s1.get("startYear") or body.get("startYear") or 1400),
        #     license_issuer=LICENSE_ISSUER_MAP.get(
        #         (s1.get("authorizationRefrence") or body.get("authorizationRefrence") or "").strip(),
        #         "interior_ministry",
        #     ),
        #     specialization_fields=(s1.get("specializedFields") or body.get("specializedFields") or "")[:2000],
        #     target_community=(s1.get("targetCommunity") or body.get("targetCommunity") or "")[:2000],
        #     sharable_facilities=(s1.get("sharedFeature") or body.get("sharedFeature") or "")[:2000],
        #     ceo_name=(s2.get("managerName") or body.get("managerName") or "").strip()[:200],
        #     ceo_phone=(s2.get("managerPhoneNumber") or body.get("managerPhoneNumber") or "").strip()[:20],
        #     board_chairman_name=(s2.get("chairmanName") or body.get("chairmanName") or "").strip()[:200],
        #     board_chairman_phone=(s2.get("chairmanPhoneNumber") or body.get("chairmanPhoneNumber") or "").strip()[:20],
        #     board_members=(s2.get("otherChairmanName") or body.get("otherChairmanName") or "")[:2000],
        #     phone_city_code=city_code[:10],
        #     phone_number=phone_rest[:20],
        #     fax_number=(s2.get("faxNumber") or body.get("faxNumber") or "")[:20],
        #     province=(s3.get("province") or body.get("province") or "").strip()[:100],
        #     county=(s3.get("town") or body.get("town") or "").strip()[:100],
        #     city=(s3.get("city") or body.get("city") or "").strip()[:100],
        #     address=(s3.get("address") or body.get("address") or "").strip(),
        #     activity_scope=ACTIVITY_MAP.get(
        #         (s3.get("activityArea") or body.get("activityArea") or "").strip(), "city"
        #     ),
        #     representative_name=(s3.get("agentName") or body.get("agentName") or "").strip()[:200],
        #     representative_mobile=(s3.get("agentPhoneNumber") or body.get("agentPhoneNumber") or "").strip()[:11],
        #     membership_request_letter=letter,
        #     activity_license_file=lic_file,
        #     logo=logo_file,
        # )
        return Response(
            {"detail": msg.CHARITY_CENTER_SIGNUP_DISABLED},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )


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
