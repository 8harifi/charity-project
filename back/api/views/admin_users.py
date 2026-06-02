from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .. import messages as msg
from ..models import CustomUser
from ..permissions import IsPlatformAdmin
from ..serializers import UserSerializer


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

    user.state = True
    user.save(update_fields=["state"])
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
    return Response({"message": msg.USER_REJECTED}, status=status.HTTP_200_OK)
