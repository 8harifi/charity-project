import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import CustomUser, PasswordResetCode
from ..services.sms import send_sms
from ..utils import normalize_phone


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = normalize_phone(request.data.get("phone") or request.data.get("phone_number") or "")
        if not phone:
            return Response({"detail": "شماره موبایل الزامی است."}, status=400)
        try:
            user = CustomUser.objects.get(username=phone, is_active=True)
        except CustomUser.DoesNotExist:
            # Do not reveal whether the account exists.
            return Response({"detail": "اگر این شماره ثبت شده باشد، کد تأیید ارسال می‌شود."})

        code = f"{secrets.randbelow(900000) + 100000}"
        PasswordResetCode.objects.create(
            user=user,
            code_hash=_hash_code(code),
            expires_at=timezone.now() + timedelta(minutes=10),
        )
        send_sms(phone, f"کد بازنشانی رمز عبور شبکه خیرین: {code}", purpose="password_reset")
        payload = {"detail": "کد تأیید ارسال شد."}
        if getattr(settings, "DEBUG", False) or not getattr(settings, "SMS_BACKEND", ""):
            payload["debug_code"] = code
        return Response(payload)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = normalize_phone(request.data.get("phone") or request.data.get("phone_number") or "")
        code = str(request.data.get("code") or "").strip()
        new_password = request.data.get("new_password") or request.data.get("password") or ""
        if not phone or not code or not new_password:
            return Response({"detail": "شماره، کد تأیید و رمز جدید الزامی است."}, status=400)
        if len(str(new_password)) < 6:
            return Response({"detail": "رمز عبور باید حداقل ۶ کاراکتر باشد."}, status=400)
        try:
            user = CustomUser.objects.get(username=phone, is_active=True)
        except CustomUser.DoesNotExist:
            return Response({"detail": "کد تأیید نامعتبر است."}, status=400)
        hashed = _hash_code(code)
        reset = (
            PasswordResetCode.objects.filter(
                user=user, used_at__isnull=True, expires_at__gte=timezone.now()
            )
            .order_by("-created_at")
            .first()
        )
        if not reset or reset.code_hash != hashed:
            return Response({"detail": "کد تأیید نامعتبر یا منقضی است."}, status=400)
        user.set_password(new_password)
        user.save(update_fields=["password"])
        reset.used_at = timezone.now()
        reset.save(update_fields=["used_at"])
        return Response({"detail": "رمز عبور با موفقیت تغییر کرد."})
