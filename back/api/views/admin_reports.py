import csv
from datetime import datetime

from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    Benefactor,
    BenefactorDonation,
    CustomUser,
    Doctor,
    DonationHold,
    GatewayPayment,
    HealthAssistant,
    NetworkRequest,
    OrganizationApplication,
    Patient,
    PlatformAuditLog,
    RequestStatusLog,
    StaffRequest,
    WalletTransaction,
)
from ..permissions import IsPlatformAdmin
from ..serializers.admin_reports import (
    AdminReportAuditSerializer,
    AdminReportDonationSerializer,
    AdminReportGatewayPaymentSerializer,
    AdminReportOrgApplicationSerializer,
    AdminReportPledgeSerializer,
    AdminReportRegistrationSerializer,
    AdminReportRequestSerializer,
    AdminReportStaffRequestSerializer,
    AdminReportTransactionSerializer,
    AdminReportWorkflowSerializer,
)


def _parse_date_start(value):
    if not value:
        return None
    d = parse_date(value)
    if d:
        return timezone.make_aware(datetime.combine(d, datetime.min.time()))
    dt = parse_datetime(value)
    return dt


def _parse_date_end(value):
    if not value:
        return None
    d = parse_date(value)
    if d:
        return timezone.make_aware(datetime.combine(d, datetime.max.time()))
    dt = parse_datetime(value)
    return dt


def _paginate(qs, request):
    page = max(int(request.query_params.get("page", 1)), 1)
    page_size = min(max(int(request.query_params.get("page_size", 50)), 1), 100)
    total = qs.count()
    start = (page - 1) * page_size
    items = qs[start : start + page_size]
    return page, page_size, total, items


def _apply_date_filters(qs, request, field="created_at"):
    date_from = _parse_date_start(request.query_params.get("date_from"))
    date_to = _parse_date_end(request.query_params.get("date_to"))
    if date_from:
        qs = qs.filter(**{f"{field}__gte": date_from})
    if date_to:
        qs = qs.filter(**{f"{field}__lte": date_to})
    return qs


def _paginated_response(request, qs, serializer_class):
    export = request.query_params.get("export", "").lower()
    if export == "csv":
        return _csv_export(qs[:5000], serializer_class)

    page, page_size, total, items = _paginate(qs, request)
    return Response(
        {
            "count": total,
            "page": page,
            "page_size": page_size,
            "results": serializer_class(items, many=True).data,
        }
    )


def _csv_export(qs, serializer_class):
    data = serializer_class(qs, many=True).data
    if not data:
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="report.csv"'
        response.write("\ufeff")
        return response
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="report.csv"'
    response.write("\ufeff")
    writer = csv.DictWriter(response, fieldnames=list(data[0].keys()))
    writer.writeheader()
    for row in data:
        writer.writerow(row)
    return response


class AdminReportTransactionsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = WalletTransaction.objects.select_related(
            "wallet", "wallet__owner_user", "wallet__owner_patient", "created_by"
        ).order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        kind = request.query_params.get("kind", "").strip()
        if kind:
            qs = qs.filter(kind=kind)
        entry_type = request.query_params.get("entry_type", "").strip()
        if entry_type:
            qs = qs.filter(entry_type=entry_type)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(description__icontains=search)
                | Q(wallet__owner_user__username__icontains=search)
                | Q(wallet__owner_patient__first_name__icontains=search)
                | Q(wallet__owner_patient__last_name__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportTransactionSerializer)


class AdminReportGatewayPaymentsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = GatewayPayment.objects.select_related("user").order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(user__username__icontains=search)
                | Q(ref_id__icontains=search)
                | Q(authority__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportGatewayPaymentSerializer)


class AdminReportDonationsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = BenefactorDonation.objects.select_related(
            "benefactor", "patient", "campaign_fk"
        ).order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(benefactor__username__icontains=search)
                | Q(title__icontains=search)
                | Q(patient__first_name__icontains=search)
                | Q(patient__last_name__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportDonationSerializer)


class AdminReportPledgesView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = DonationHold.objects.select_related(
            "benefactor", "network_request", "network_request__patient", "closed_by"
        ).order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(benefactor__username__icontains=search)
                | Q(network_request__subject__icontains=search)
                | Q(network_request__patient__first_name__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportPledgeSerializer)


class AdminReportWorkflowView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = RequestStatusLog.objects.select_related(
            "request", "request__patient", "actor"
        ).order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        role = request.query_params.get("role", "").strip()
        if role:
            qs = qs.filter(actor__role=role)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(note__icontains=search)
                | Q(request__subject__icontains=search)
                | Q(request__patient__first_name__icontains=search)
                | Q(request__patient__last_name__icontains=search)
                | Q(actor__username__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportWorkflowSerializer)


class AdminReportRequestsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = NetworkRequest.objects.select_related("patient", "created_by").order_by(
            "-created_at"
        )
        qs = _apply_date_filters(qs, request)
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        request_type = request.query_params.get("request_type", "").strip()
        if request_type:
            qs = qs.filter(request_type=request_type)
        province = request.query_params.get("province", "").strip()
        if province:
            qs = qs.filter(province__icontains=province)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(subject__icontains=search)
                | Q(description__icontains=search)
                | Q(patient__first_name__icontains=search)
                | Q(patient__last_name__icontains=search)
                | Q(patient__patient_code__icontains=search)
            ).distinct()
        return _paginated_response(request, qs, AdminReportRequestSerializer)


class AdminReportRegistrationsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = CustomUser.objects.exclude(role="admin").order_by("-date_joined")
        qs = _apply_date_filters(qs, request, field="date_joined")
        role = request.query_params.get("role", "").strip()
        if role:
            qs = qs.filter(role=role)
        state = request.query_params.get("state", "").strip()
        if state == "approved":
            qs = qs.filter(state=True)
        elif state == "pending":
            qs = qs.filter(state=False)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(username__icontains=search)

        page, page_size, total, users = _paginate(qs, request)
        rows = []
        for u in users:
            row = {
                "id": u.pk,
                "username": u.username,
                "role": u.role,
                "state": u.state,
                "is_active": u.is_active,
                "date_joined": u.date_joined,
                "display_name": u.username,
                "province": "",
                "city": "",
                "admin_approved": None,
                "ha_approved": None,
                "introducer_label": "",
            }
            if u.role == "patient":
                try:
                    p = u.patient_profile
                    row["display_name"] = f"{p.first_name} {p.last_name}".strip()
                    row["province"] = p.province or ""
                    row["city"] = p.city or ""
                    row["admin_approved"] = p.admin_approved
                    row["ha_approved"] = p.ha_approved
                    if p.introducer_id:
                        ha = p.introducer
                        row["introducer_label"] = ha.health_assistance_code
                except Patient.DoesNotExist:
                    pass
            elif u.role == "doctor":
                try:
                    d = u.doctor_profile
                    row["display_name"] = f"{d.first_name} {d.last_name}".strip()
                    row["province"] = d.province or ""
                    row["city"] = d.city or ""
                except Doctor.DoesNotExist:
                    pass
            elif u.role == "benefactor":
                try:
                    b = u.benefactor_profile
                    row["display_name"] = f"{b.first_name} {b.last_name}".strip()
                except Benefactor.DoesNotExist:
                    pass
            elif u.role == "health_assistant":
                try:
                    ha = u.health_assistant_profile
                    if getattr(ha, "individual_profile", None):
                        ind = ha.individual_profile
                        row["display_name"] = f"{ind.first_name} {ind.last_name}".strip()
                        row["province"] = ind.province or ""
                        row["city"] = ind.city or ""
                    elif getattr(ha, "organization_profile", None):
                        org = ha.organization_profile
                        row["display_name"] = org.name
                        row["province"] = org.province or ""
                        row["city"] = org.city or ""
                except HealthAssistant.DoesNotExist:
                    pass
            rows.append(row)

        return Response(
            {
                "count": total,
                "page": page,
                "page_size": page_size,
                "results": AdminReportRegistrationSerializer(rows, many=True).data,
            }
        )


class AdminReportStaffRequestsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = StaffRequest.objects.select_related(
            "created_by", "health_assistant", "patient"
        ).order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        status_filter = request.query_params.get("status", "").strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(subject__icontains=search)
                | Q(description__icontains=search)
                | Q(created_by__username__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportStaffRequestSerializer)


class AdminReportOrgApplicationsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = OrganizationApplication.objects.select_related("user").order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        org_role = request.query_params.get("organization_role", "").strip()
        if org_role:
            qs = qs.filter(organization_role=org_role)
        province = request.query_params.get("province", "").strip()
        if province:
            qs = qs.filter(province__icontains=province)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(user__username__icontains=search)
                | Q(city__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportOrgApplicationSerializer)


class AdminReportAuditView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = PlatformAuditLog.objects.select_related("actor").order_by("-created_at")
        qs = _apply_date_filters(qs, request)
        event_type = request.query_params.get("event_type", "").strip()
        if event_type:
            qs = qs.filter(event_type=event_type)
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(summary__icontains=search)
                | Q(actor__username__icontains=search)
            )
        return _paginated_response(request, qs, AdminReportAuditSerializer)
