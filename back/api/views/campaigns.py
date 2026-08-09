from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import Campaign
from ..permissions import IsPlatformAdmin
from ..serializers.campaigns import CampaignPublicSerializer, CampaignSerializer
from ..services.audit_service import log_audit_event


class CampaignListView(APIView):
    """Public list of published campaigns."""

    permission_classes = [AllowAny]

    def get(self, request):
        qs = Campaign.objects.filter(is_published=True).order_by("-created_at")
        return Response(CampaignPublicSerializer(qs, many=True).data)


class AdminCampaignListCreateView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = Campaign.objects.all().order_by("-created_at")
        return Response(CampaignSerializer(qs, many=True).data)

    def post(self, request):
        serializer = CampaignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        campaign = serializer.save(created_by=request.user)
        log_audit_event(
            actor=request.user,
            event_type="campaign_created",
            summary=f"ایجاد کمپین «{campaign.title}»",
            target_type="campaign",
            target_id=campaign.pk,
            metadata={"title": campaign.title},
        )
        return Response(CampaignSerializer(campaign).data, status=status.HTTP_201_CREATED)


class AdminCampaignDetailView(APIView):
    permission_classes = [IsPlatformAdmin]

    def _get(self, pk):
        try:
            return Campaign.objects.get(pk=pk)
        except Campaign.DoesNotExist:
            return None

    def get(self, request, pk):
        campaign = self._get(pk)
        if not campaign:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        return Response(CampaignSerializer(campaign).data)

    def patch(self, request, pk):
        campaign = self._get(pk)
        if not campaign:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        serializer = CampaignSerializer(campaign, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_audit_event(
            actor=request.user,
            event_type="campaign_updated",
            summary=f"ویرایش کمپین «{campaign.title}»",
            target_type="campaign",
            target_id=campaign.pk,
        )
        return Response(CampaignSerializer(campaign).data)

    def delete(self, request, pk):
        campaign = self._get(pk)
        if not campaign:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        title = campaign.title
        campaign_id = campaign.pk
        campaign.delete()
        log_audit_event(
            actor=request.user,
            event_type="campaign_deleted",
            summary=f"حذف کمپین «{title}»",
            target_type="campaign",
            target_id=campaign_id,
            metadata={"title": title},
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
