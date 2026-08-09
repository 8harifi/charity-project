from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import HealthAssistant, OrganizationHealthAssistant
from ..permissions import IsHealthAssistant


def _ha_display_name(ha: HealthAssistant) -> str:
    try:
        ind = ha.individual_profile
        return f"{ind.first_name} {ind.last_name}".strip()
    except Exception:
        pass
    try:
        return ha.organization_profile.name
    except Exception:
        pass
    return ha.health_assistance_code or str(ha.pk)


def _serialize_subordinate(ha: HealthAssistant) -> dict:
    return {
        "id": ha.pk,
        "health_assistance_code": ha.health_assistance_code,
        "name": _ha_display_name(ha),
        "org_approved": ha.org_approved,
        "created_at": ha.created_at,
    }


def _require_org_ha(user):
    try:
        ha = user.health_assistant_profile
        ha.organization_profile  # noqa: B018 — existence check
    except (HealthAssistant.DoesNotExist, OrganizationHealthAssistant.DoesNotExist):
        return None
    return ha


class OrgSubordinatesView(APIView):
    """Organization HA: list / link subordinates under this organization."""

    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def get(self, request):
        org = _require_org_ha(request.user)
        if not org:
            return Response(
                {"detail": "فقط سلامتیار سازمانی می‌تواند زیرمجموعه‌ها را ببیند."},
                status=403,
            )
        status_filter = (request.query_params.get("status") or "all").strip()
        qs = HealthAssistant.objects.filter(parent_organization=org).select_related(
            "individual_profile", "organization_profile"
        )
        if status_filter == "pending":
            qs = qs.filter(org_approved=False)
        elif status_filter == "approved":
            qs = qs.filter(org_approved=True)
        return Response([_serialize_subordinate(h) for h in qs.order_by("-created_at")])

    def post(self, request):
        """Link an existing HA as a pending subordinate of this organization."""
        org = _require_org_ha(request.user)
        if not org:
            return Response(
                {"detail": "فقط سلامتیار سازمانی می‌تواند زیرمجموعه اضافه کند."},
                status=403,
            )
        ha_id = request.data.get("health_assistant_id")
        if not ha_id:
            return Response({"detail": "شناسه سلامتیار الزامی است."}, status=400)
        try:
            subordinate = HealthAssistant.objects.get(pk=ha_id)
        except HealthAssistant.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)
        if subordinate.pk == org.pk:
            return Response({"detail": "نمی‌توان سازمان را زیرمجموعه خودش کرد."}, status=400)
        if (
            subordinate.parent_organization_id
            and subordinate.parent_organization_id != org.pk
        ):
            return Response(
                {"detail": "این سلامتیار زیرمجموعه سازمان دیگری است."},
                status=400,
            )
        subordinate.parent_organization = org
        subordinate.org_approved = False
        subordinate.save(update_fields=["parent_organization", "org_approved"])
        return Response(_serialize_subordinate(subordinate), status=201)


class OrgSubordinateActionView(APIView):
    permission_classes = [IsAuthenticated, IsHealthAssistant]

    def patch(self, request, pk):
        org = _require_org_ha(request.user)
        if not org:
            return Response(
                {"detail": "فقط سلامتیار سازمانی می‌تواند زیرمجموعه را تأیید کند."},
                status=403,
            )
        action = (request.data.get("action") or "").strip()
        if action not in ("approve", "reject"):
            return Response({"detail": "عملیات نامعتبر"}, status=400)
        try:
            subordinate = HealthAssistant.objects.get(
                pk=pk, parent_organization=org
            )
        except HealthAssistant.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)

        if action == "approve":
            subordinate.org_approved = True
            subordinate.save(update_fields=["org_approved"])
        else:
            subordinate.org_approved = False
            subordinate.parent_organization = None
            subordinate.save(update_fields=["org_approved", "parent_organization"])

        return Response(_serialize_subordinate(subordinate))
