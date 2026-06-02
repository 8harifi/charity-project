from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from . import views
from .views import ProfileView

router = DefaultRouter()
router.register(r"patients", views.PatientViewSet, basename="patient")
router.register(r"doctors", views.DoctorViewSet, basename="doctor")
router.register(r"health-assistants", views.HealthAssistantViewSet, basename="health-assistant")
router.register(r"benefactors", views.BenefactorViewSet, basename="benefactor")
# router.register(r'service-centers', views.ServiceCenterViewSet, basename='service-center')
# router.register(r'charity-centers', views.CharityCenterViewSet, basename='charity-center')
# router.register(r'social-work-units', views.SocialWorkUnitViewSet, basename='social-work-unit')
# router.register(r'patient-service-requests', views.PatientServiceRequestViewSet, basename='patient-service-request')

urlpatterns = [
    path("patient/sign-up/", views.PatientSignupView.as_view(), name="patient_signup"),
    path("doctor/sign-up/", views.DoctorSignupView.as_view(), name="doctor_signup"),
    path("benefactor/sign-up/", views.BenefactorSignupView.as_view(), name="benefactor_signup"),
    path("service-center/sign-up/", views.ServiceCenterSignupView.as_view(), name="service_center_signup"),
    path("charity-center/sign-up/", views.CharityCenterSignupView.as_view(), name="charity_center_signup"),
    path("social-work-unit/sign-up/", views.SocialWorkUnitSignupView.as_view(), name="social_work_unit_signup"),
    path("health-assistant/sign-up/", views.HealthAssistantSignupView.as_view(), name="health_assistant_signup"),

    path("lookups/genders/", views.GenderLookupView.as_view(), name="lookup_genders"),
    path("lookups/marital-status/", views.MaritalStatusLookupView.as_view(), name="lookup_marital_status"),
    path("lookups/specialties/", views.SpecialtyLookupView.as_view(), name="lookup_specialties"),
    # path("lookups/cooperation-types/", views.CooperationTypeLookupView.as_view(), name="lookup_cooperation"),
    path(
        "lookups/health-assistant-cooperation-types/",
        views.HealthAssistantCooperationTypeLookupView.as_view(),
        name="lookup_health_assistant_cooperation",
    ),
    path("lookups/educations/", views.EducationLookupView.as_view(), name="lookup_educations"),
    path("lookups/job-statuses/", views.JobStatusLookupView.as_view(), name="lookup_job_statuses"),
    path("lookups/housing-statuses/", views.HousingStatusLookupView.as_view(), name="lookup_housing_statuses"),
    path(
        "lookups/covered-organizations/",
        views.CoveredOrganizationLookupView.as_view(),
        name="lookup_covered_organizations",
    ),
    path("lookups/insurances/", views.InsuranceLookupView.as_view(), name="lookup_insurances"),
    path(
        "lookups/organization-types/",
        views.OrganizationTypeLookupView.as_view(),
        name="lookup_organization_types",
    ),

    path("doctor/counselings/", views.DoctorCounselingsView.as_view(), name="doctor_counselings"),
    path("doctor/appointments/", views.DoctorAppointmentsView.as_view(), name="doctor_appointments"),
    path("benefactor/donations/", views.BenefactorDonationsView.as_view(), name="benefactor_donations"),
    path("benefactor/reports/", views.BenefactorReportsView.as_view(), name="benefactor_reports"),
    path("benefactor/receipts/", views.BenefactorReceiptsView.as_view(), name="benefactor_receipts"),
    path("benefactor/favorites/", views.BenefactorFavoritesView.as_view(), name="benefactor_favorites"),
    path("sign-in/", views.LoginView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("hello/", views.HelloView.as_view(), name="hello"),
    path("campaigns/", views.CampaignListView.as_view(), name="campaign_list"),
    path("admin/campaigns/", views.AdminCampaignListCreateView.as_view(), name="admin_campaigns"),
    path(
        "admin/campaigns/<int:pk>/",
        views.AdminCampaignDetailView.as_view(),
        name="admin_campaign_detail",
    ),
    path("admin/pending-users/", views.pending_users, name="pending_users"),
    path("admin/approve-user/<int:user_id>/", views.approve_user, name="approve_user"),
    path("admin/reject-user/<int:user_id>/", views.reject_user, name="reject_user"),
    path("admin/stats/", views.AdminStatsView.as_view(), name="admin_stats"),
    path("admin/users/", views.AdminUsersView.as_view(), name="admin_users"),
    path("admin/users/<int:user_id>/", views.AdminUserDetailView.as_view(), name="admin_user_detail"),
    path(
        "admin/users/<int:user_id>/requests/",
        views.AdminUserRequestsView.as_view(),
        name="admin_user_requests",
    ),
    path("admin/requests/", views.AdminRequestsView.as_view(), name="admin_requests"),
    path("admin/lookups/", views.AdminLookupsMetaView.as_view(), name="admin_lookups_meta"),
    path(
        "admin/lookups/<slug:slug>/",
        views.AdminLookupItemsView.as_view(),
        name="admin_lookup_items",
    ),
    path(
        "admin/lookups/<slug:slug>/<int:item_id>/",
        views.AdminLookupItemDetailView.as_view(),
        name="admin_lookup_item_detail",
    ),
    path("patient/profile/", views.PatientProfileCreateView.as_view(), name="patient_profile_create"),
    path("doctor/profile/", views.DoctorProfileCreateView.as_view(), name="doctor_profile_create"),
    # path('benefactor/profile/', views.BenefactorProfileCreateView.as_view(), name='benefactor_profile_create'),
    # path('health-assistant/profile/', views.HealthAssistProfileCreateView.as_view(), name='health_assistant_profile_create'),
    path("global-search/", views.GlobalSearchView.as_view(), name="global_search"),
    path(
        "patients/by-national-code/<str:national_code>/",
        views.PatientByNationalCodeAPIView.as_view(),
        name="get-patient-by-national-code",
    ),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("dashboard/stats/", views.DashboardStatsView.as_view(), name="dashboard_stats"),
    path("requests/", views.NetworkRequestListCreateView.as_view(), name="network_requests"),
    path("requests/<int:pk>/", views.NetworkRequestDetailView.as_view(), name="network_request_detail"),
    path(
        "requests/<int:pk>/status/",
        views.NetworkRequestStatusView.as_view(),
        name="network_request_status",
    ),
    path(
        "doctor/incoming-requests/",
        views.DoctorIncomingRequestsView.as_view(),
        name="doctor_incoming_requests",
    ),
    path("doctor/my-cases/", views.DoctorMyCasesView.as_view(), name="doctor_my_cases"),
    path(
        "benefactor/incoming-requests/",
        views.BenefactorIncomingRequestsView.as_view(),
        name="benefactor_incoming_requests",
    ),
    path(
        "benefactor/my-cases/",
        views.BenefactorMyCasesView.as_view(),
        name="benefactor_my_cases",
    ),
    path(
        "health-assistant/patients/",
        views.HealthAssistantPatientsView.as_view(),
        name="health_assistant_patients",
    ),
    path("wallet/", views.WalletDetailView.as_view(), name="wallet_detail"),
    path("wallet/transactions/", views.WalletTransactionsView.as_view(), name="wallet_transactions"),
    path("wallet/topup/", views.WalletTopUpView.as_view(), name="wallet_topup"),
    path(
        "wallet/topup/callback/",
        views.WalletTopUpCallbackView.as_view(),
        name="wallet_topup_callback",
    ),
    path("wallet/donate/", views.WalletDonateView.as_view(), name="wallet_donate"),
    path("patient/aid-summary/", views.PatientAidSummaryView.as_view(), name="patient_aid_summary"),
    path(
        "admin/wallet/payments/",
        views.AdminGatewayPaymentsView.as_view(),
        name="admin_wallet_payments",
    ),
    path(
        "admin/disbursements/",
        views.AdminDisbursementListCreateView.as_view(),
        name="admin_disbursements",
    ),
    path(
        "admin/disbursements/<int:pk>/",
        views.AdminDisbursementDetailView.as_view(),
        name="admin_disbursement_detail",
    ),
    path("", include(router.urls)),
]
