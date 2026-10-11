from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .. import messages as msg
from ..models import CustomUser, Patient
from ..permissions import IsPlatformAdmin
from ..serializers import UserSerializer
from ..services.audit_service import log_audit_event


@api_view(["GET"])
@permission_classes([IsPlatformAdmin])
def pending_users(request):
    users = CustomUser.objects.filter(state=False).exclude(role="admin")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsPlatformAdmin])
def approve_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": msg.USER_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)

    if user.role == "patient":
        try:
            patient = user.patient_profile
        except Patient.DoesNotExist:
            patient = None
        if patient:
            if not patient.introducer_id:
                return Response(
                    {"detail": "بیمار بدون معرف واقعی قابل تأیید نیست."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            patient.admin_approved = True
            patient.save(update_fields=["admin_approved"])
            if patient.ha_approved:
                user.state = True
                user.save(update_fields=["state"])
                return Response({"message": msg.USER_APPROVED}, status=status.HTTP_200_OK)
            return Response(
                {
                    "message": "تأیید مدیر ثبت شد؛ در انتظار تأیید سلامتیار معرف است.",
                    "admin_approved": True,
                    "ha_approved": False,
                },
                status=status.HTTP_200_OK,
            )

    user.state = True
    user.save(update_fields=["state"])
    log_audit_event(
        actor=request.user,
        event_type="user_approved",
        summary=f"تأیید کاربر {user.username} ({user.role})",
        target_type="user",
        target_id=user.pk,
        metadata={"role": user.role},
    )
    return Response({"message": msg.USER_APPROVED}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsPlatformAdmin])
def reject_user(request, user_id):
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({"error": msg.USER_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)

    user.is_active = False
    user.save(update_fields=["is_active"])
    log_audit_event(
        actor=request.user,
        event_type="user_rejected",
        summary=f"رد کاربر {user.username} ({user.role})",
        target_type="user",
        target_id=user.pk,
        metadata={"role": user.role},
    )
    return Response({"message": msg.USER_REJECTED}, status=status.HTTP_200_OK)
