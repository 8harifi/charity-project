from rest_framework import serializers

from ..models import Campaign


class CampaignSerializer(serializers.ModelSerializer):
    progress = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campaign
        fields = [
            "id",
            "title",
            "description",
            "target_amount",
            "raised_amount",
            "progress",
            "category",
            "urgency",
            "image_url",
            "is_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "progress"]


class CampaignPublicSerializer(serializers.ModelSerializer):
    progress = serializers.IntegerField(read_only=True)

    class Meta:
        model = Campaign
        fields = [
            "id",
            "title",
            "description",
            "target_amount",
            "raised_amount",
            "progress",
            "category",
            "urgency",
            "image_url",
        ]
