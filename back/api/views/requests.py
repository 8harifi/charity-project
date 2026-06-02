from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import NetworkRequest, Patient, RequestStatusLog
from ..permissions import IsBenefactor, IsDoctor, IsHealthAssistant
from ..serializers.requests import (
    NetworkRequestCreateSerializer,
    NetworkRequestSerializer,
    NetworkRequestStatusSerializer,
)


ACTIVE_STATUSES = ("pending", "accepted", "in_progress")


def filter_by_scope(queryset, scope):
    if scope == "active":
        return queryset.filter(status__in=ACTIVE_STATUSES)
    if scope == "completed":
        return queryset.filter(status="completed")
    if scope == "rejected":
        return queryset.filter(status="rejected")
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
        else:
            return Response({"detail": msg.FORBIDDEN}, status=403)

        qs = filter_by_scope(qs, scope)
        data = NetworkRequestSerializer(qs, many=True).data
        return Response(data)

    def post(self, request):
        if request.user.role not in ("patient", "health_assistant"):
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
            if network_request.handled_by_id == user.pk:
                return True
            return (
                network_request.request_type == "consultation"
                and network_request.status == "pending"
                and network_request.specialty_id == doctor.specialty_id
            )
        if user.role == "benefactor":
            if network_request.handled_by_id == user.pk:
                return True
            return (
                network_request.request_type == "financial"
                and network_request.status == "pending"
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

        if user.role == "doctor":
            if network_request.request_type != "consultation":
                return Response({"detail": msg.FORBIDDEN}, status=403)
            doctor = user.doctor_profile
            if action in ("accept", "reject"):
                if network_request.status != "pending":
                    return Response({"detail": "درخواست قابل تغییر نیست."}, status=400)
                if network_request.specialty_id != doctor.specialty_id:
                    return Response({"detail": "تخصص مطابقت ندارد."}, status=403)
            elif action in ("start", "complete"):
                if network_request.handled_by_id != user.pk:
                    return Response({"detail": msg.FORBIDDEN}, status=403)
        elif user.role == "benefactor":
            if network_request.request_type != "financial":
                return Response({"detail": msg.FORBIDDEN}, status=403)
            if action in ("accept", "reject"):
                if network_request.status != "pending":
                    return Response({"detail": "درخواست قابل تغییر نیست."}, status=400)
            elif action in ("start", "complete"):
                if network_request.handled_by_id != user.pk:
                    return Response({"detail": msg.FORBIDDEN}, status=403)
        else:
            return Response({"detail": msg.FORBIDDEN}, status=403)

        status_map = {
            "accept": "accepted",
            "reject": "rejected",
            "start": "in_progress",
            "complete": "completed",
        }
        new_status = status_map[action]

        if action == "accept":
            network_request.handled_by = user
        network_request.status = new_status
        network_request.save(update_fields=["status", "handled_by", "updated_at"])

        RequestStatusLog.objects.create(
            request=network_request,
            status=new_status,
            note=note or self._default_note(action),
            actor=user,
        )

        return Response(NetworkRequestSerializer(network_request).data)

    def _default_note(self, action):
        notes = {
            "accept": "درخواست پذیرفته شد",
            "reject": "درخواست رد شد",
            "start": "درخواست در حال انجام است",
            "complete": "درخواست تکمیل شد",
        }
        return notes.get(action, "")


class DoctorIncomingRequestsView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        doctor = request.user.doctor_profile
        qs = NetworkRequest.objects.filter(
            request_type="consultation",
            status="pending",
            handled_by__isnull=True,
            specialty=doctor.specialty,
        )
        return Response(NetworkRequestSerializer(qs, many=True).data)


class DoctorMyCasesView(APIView):
    permission_classes = [IsAuthenticated, IsDoctor]

    def get(self, request):
        scope = request.query_params.get("scope", "active")
        qs = NetworkRequest.objects.filter(
            request_type="consultation",
            handled_by=request.user,
        )
        qs = filter_by_scope(qs, scope)
        return Response(NetworkRequestSerializer(qs, many=True).data)


class BenefactorIncomingRequestsView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def get(self, request):
        qs = NetworkRequest.objects.filter(
            request_type="financial",
            status="pending",
            handled_by__isnull=True,
        )
        return Response(NetworkRequestSerializer(qs, many=True).data)


class BenefactorMyCasesView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def get(self, request):
        scope = request.query_params.get("scope", "active")
        qs = NetworkRequest.objects.filter(
            request_type="financial",
            handled_by=request.user,
        )
        qs = filter_by_scope(qs, scope)
        return Response(NetworkRequestSerializer(qs, many=True).data)


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
            }
            for p in patients
        ]
        return Response(data)
