from rest_framework import status, viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import HealthAssistant
from ..serializers import HealthAssistantSerializer, HealthAssistantSignupSerializer
from .pagination import StandardResultsSetPagination


class HealthAssistantSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = HealthAssistantSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        health_assistant = serializer.save()

        profile_data = {}
        if health_assistant.individual_profile:
            ind = health_assistant.individual_profile
            profile_data = {
                "type": "individual",
                "first_name": ind.first_name,
                "last_name": ind.last_name,
                "national_code": ind.national_code,
            }
        elif health_assistant.organization_profile:
            org = health_assistant.organization_profile
            profile_data = {
                "type": "organization",
                "name": org.name,
            }

        return Response(
            {
                "message": "Health assistant created successfully",
                "health_assistant": {
                    "id": health_assistant.id,
                    "health_assistance_code": health_assistant.health_assistance_code,
                    **profile_data,
                },
                "user": {
                    "id": health_assistant.user.id,
                    "username": health_assistant.user.username,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class HealthAssistantViewSet(viewsets.ModelViewSet):
    queryset = HealthAssistant.objects.select_related(
        "user",
        "cooperation_type",
        "individual_profile",
        "individual_profile__gender",
        "individual_profile__education",
        "organization_profile",
        "organization_profile__organization_type",
    ).all()
    serializer_class = HealthAssistantSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = [
        "health_assistance_code",
        "user__username",
        "individual_profile__first_name",
        "individual_profile__last_name",
        "individual_profile__national_code",
        "individual_profile__phone_number",
        "organization_profile__name",
    ]
