from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from ..models import Doctor, Patient
from ..permissions import IsDoctor, IsPatient
from ..serializers import DoctorSerializer, PatientSerializer


class PatientProfileCreateView(generics.CreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsPatient]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DoctorProfileCreateView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
