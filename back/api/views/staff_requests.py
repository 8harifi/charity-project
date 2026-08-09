from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import NetworkRequest, StaffRequest
from ..permissions import IsDoctor, IsHealthAssistant
from ..serializers.staff_requests import (
    StaffRequestCreateSerializer,
    StaffRequestSerializer,
    StaffRequestStatusSerializer,
)


class StaffRequestListCreateView(APIView):
  permission_classes = [IsAuthenticated]

  def get(self, request):
    user = request.user
    if user.role == "doctor":
      qs = StaffRequest.objects.filter(created_by=user)
    elif user.role == "health_assistant":
      ha = user.health_assistant_profile
      qs = StaffRequest.objects.filter(health_assistant=ha)
    else:
      return Response({"detail": msg.FORBIDDEN}, status=403)
    qs = qs.select_related(
      "created_by",
      "health_assistant",
      "patient",
      "network_request",
    )
    return Response(StaffRequestSerializer(qs, many=True).data)

  def post(self, request):
    if request.user.role != "doctor":
      return Response({"detail": msg.FORBIDDEN}, status=403)
    serializer = StaffRequestCreateSerializer(
      data=request.data, context={"request": request}
    )
    serializer.is_valid(raise_exception=True)
    staff_request = serializer.save()
    return Response(
      StaffRequestSerializer(staff_request).data,
      status=status.HTTP_201_CREATED,
    )


class StaffRequestStatusView(APIView):
  permission_classes = [IsAuthenticated, IsHealthAssistant]

  def patch(self, request, pk):
    ha = request.user.health_assistant_profile
    try:
      staff_request = StaffRequest.objects.get(pk=pk, health_assistant=ha)
    except StaffRequest.DoesNotExist:
      return Response({"detail": msg.NOT_FOUND}, status=404)

    serializer = StaffRequestStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    action = serializer.validated_data["action"]

    transitions = {
      "accept": ("pending", "accepted"),
      "reject": ("pending", "rejected"),
      "complete": (("accepted", "in_progress"), "completed"),
      "cancel": (("pending", "accepted", "in_progress"), "cancelled"),
    }
    if action not in transitions:
      return Response({"detail": "عملیات نامعتبر"}, status=400)

    allowed_from, new_status = transitions[action]
    if isinstance(allowed_from, str):
      allowed_from = (allowed_from,)
    if staff_request.status not in allowed_from:
      return Response({"detail": "وضعیت درخواست قابل تغییر نیست."}, status=400)

    staff_request.status = new_status
    staff_request.save(update_fields=["status", "updated_at"])

    if action == "accept" and staff_request.patient and staff_request.amount_needed:
      doctor_user = staff_request.created_by
      doctor_label = staff_request.doctor_name
      if not doctor_label and getattr(doctor_user, "role", None) == "doctor":
        try:
          d = doctor_user.doctor_profile
          doctor_label = f"{d.first_name} {d.last_name}".strip()
        except Exception:
          doctor_label = ""
      financial = NetworkRequest.objects.create(
        request_type="financial",
        patient=staff_request.patient,
        created_by=request.user,
        fund_recipient=doctor_user,
        subject=staff_request.subject,
        description=staff_request.description,
        amount_needed=staff_request.amount_needed,
        doctor_name=doctor_label,
        status="pending",
      )
      staff_request.network_request = financial
      staff_request.status = "in_progress"
      staff_request.save(update_fields=["network_request", "status", "updated_at"])

    return Response(StaffRequestSerializer(staff_request).data)
