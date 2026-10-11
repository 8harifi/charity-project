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
    path("password-reset/", views.PasswordResetRequestView.as_view(), name="password_reset_request"),
    path(
        "password-reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path("hello/", views.HelloView.as_view(), name="hello"),
    path("public/stats/", views.PublicStatsView.as_view(), name="public_stats"),
    path(
        "public/medical-centers/",
        views.PublicMedicalCenterListView.as_view(),
        name="public_medical_centers",
    ),
    path(
        "public/supporting-orgs/",
        views.PublicSupportingOrgSearchView.as_view(),
        name="public_supporting_orgs",
    ),
    path(
        "public/fundable-requests/",
        views.PublicFundableRequestsView.as_view(),
        name="public_fundable_requests",
    ),
    path("contact-messages/", views.ContactMessageCreateView.as_view(), name="contact_messages"),
    path(
        "contact-messages/inbox/",
        views.ContactMessageInboxView.as_view(),
        name="contact_messages_inbox",
    ),
    path(
        "contact-messages/<int:pk>/reply/",
        views.ContactMessageReplyView.as_view(),
        name="contact_message_reply",
    ),
    path(
        "contact-disclosure/",
        views.ContactDisclosureCreateView.as_view(),
        name="contact_disclosure",
    ),
    path(
        "contact-disclosure/inbox/",
        views.ContactDisclosureInboxView.as_view(),
        name="contact_disclosure_inbox",
    ),
    path(
        "contact-disclosure/<int:pk>/",
        views.ContactDisclosureInboxView.as_view(),
        name="contact_disclosure_action",
    ),
    path(
        "admin/medical-centers/",
        views.AdminMedicalCenterListCreateView.as_view(),
        name="admin_medical_centers",
    ),
    path(
        "admin/medical-centers/<int:pk>/",
        views.AdminMedicalCenterDetailView.as_view(),
        name="admin_medical_center_detail",
    ),
    path(
        "admin/medical-centers/<int:pk>/images/",
        views.AdminMedicalCenterImageView.as_view(),
        name="admin_medical_center_images",
    ),
    path(
        "admin/medical-centers/<int:pk>/images/<int:image_id>/",
        views.AdminMedicalCenterImageView.as_view(),
        name="admin_medical_center_image_delete",
    ),
    path(
        "requests/<int:pk>/read/",
        views.RequestMarkReadView.as_view(),
        name="request_mark_read",
    ),
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
    path("admin/users/export/", views.AdminUsersExportView.as_view(), name="admin_users_export"),
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
        "patients/<int:patient_id>/workflow/",
        views.PatientWorkflowView.as_view(),
        name="patient_workflow",
    ),
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
        "health-assistant/patients/browse/",
        views.HealthAssistantBrowsePatientsView.as_view(),
        name="health_assistant_browse_patients",
    ),
    path(
        "health-assistant/patients/<int:pk>/",
        views.HealthAssistantPatientDetailView.as_view(),
        name="health_assistant_patient_detail",
    ),
    path(
        "health-assistant/patients/",
        views.HealthAssistantPatientsView.as_view(),
        name="health_assistant_patients",
    ),
    path(
        "health-assistant/patients/register/",
        views.HealthAssistantPatientSignupView.as_view(),
        name="health_assistant_patient_register",
    ),
    path(
        "health-assistant/patients/<int:pk>/approve/",
        views.HealthAssistantApprovePatientView.as_view(),
        name="health_assistant_patient_approve",
    ),
    path(
        "health-assistant/patients/orphans/",
        views.HealthAssistantOrphanPatientsView.as_view(),
        name="health_assistant_orphan_patients",
    ),
    path(
        "health-assistant/patients/<int:pk>/claim/",
        views.HealthAssistantClaimPatientView.as_view(),
        name="health_assistant_claim_patient",
    ),
    path(
        "health-assistant/patients/<int:pk>/remove/",
        views.HealthAssistantRemovePatientView.as_view(),
        name="health_assistant_remove_patient",
    ),
    path(
        "health-assistant/patients/search/",
        views.HealthAssistantPatientSearchView.as_view(),
        name="health_assistant_patient_search",
    ),
    path(
        "health-assistant/subordinates/",
        views.OrgSubordinatesView.as_view(),
        name="org_subordinates",
    ),
    path(
        "health-assistant/subordinates/<int:pk>/",
        views.OrgSubordinateActionView.as_view(),
        name="org_subordinate_action",
    ),
    path("staff-requests/", views.StaffRequestListCreateView.as_view(), name="staff_requests"),
    path(
        "staff-requests/<int:pk>/status/",
        views.StaffRequestStatusView.as_view(),
        name="staff_request_status",
    ),
    path(
        "requests/fund-recipients/",
        views.FundRecipientOptionsView.as_view(),
        name="fund_recipient_options",
    ),
    path(
        "health-assistants/public/",
        views.PublicHealthAssistantsView.as_view(),
        name="public_health_assistants",
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
    path(
        "wallet/donate/adjust-pledge/",
        views.WalletAdjustPledgeView.as_view(),
        name="wallet_adjust_pledge",
    ),
    path(
        "wallet/donate/guest/",
        views.GuestCampaignDonateView.as_view(),
        name="wallet_guest_donate",
    ),
    path("patient/aid-summary/", views.PatientAidSummaryView.as_view(), name="patient_aid_summary"),
    path(
        "admin/wallet/payments/",
        views.AdminGatewayPaymentsView.as_view(),
        name="admin_wallet_payments",
    ),
    path(
        "admin/wallets/",
        views.AdminWalletsView.as_view(),
        name="admin_wallets",
    ),
    path(
        "admin/wallet/adjust/",
        views.AdminWalletAdjustView.as_view(),
        name="admin_wallet_adjust",
    ),
    path(
        "admin/wallet/pay-request/",
        views.AdminPayRequestView.as_view(),
        name="admin_wallet_pay_request",
    ),
    path(
        "admin/wallet/pledges/",
        views.AdminPledgesView.as_view(),
        name="admin_wallet_pledges",
    ),
    path(
        "admin/wallet/general-donations/",
        views.AdminGeneralDonationsView.as_view(),
        name="admin_wallet_general_donations",
    ),
    path(
        "admin/reports/transactions/",
        views.AdminReportTransactionsView.as_view(),
        name="admin_report_transactions",
    ),
    path(
        "admin/reports/gateway-payments/",
        views.AdminReportGatewayPaymentsView.as_view(),
        name="admin_report_gateway_payments",
    ),
    path(
        "admin/reports/donations/",
        views.AdminReportDonationsView.as_view(),
        name="admin_report_donations",
    ),
    path(
        "admin/reports/pledges/",
        views.AdminReportPledgesView.as_view(),
        name="admin_report_pledges",
    ),
    path(
        "admin/reports/workflow/",
        views.AdminReportWorkflowView.as_view(),
        name="admin_report_workflow",
    ),
    path(
        "admin/reports/requests/",
        views.AdminReportRequestsView.as_view(),
        name="admin_report_requests",
    ),
    path(
        "admin/reports/registrations/",
        views.AdminReportRegistrationsView.as_view(),
        name="admin_report_registrations",
    ),
    path(
        "admin/reports/staff-requests/",
        views.AdminReportStaffRequestsView.as_view(),
        name="admin_report_staff_requests",
    ),
    path(
        "admin/reports/org-applications/",
        views.AdminReportOrgApplicationsView.as_view(),
        name="admin_report_org_applications",
    ),
    path(
        "admin/reports/audit/",
        views.AdminReportAuditView.as_view(),
        name="admin_report_audit",
    ),
    path("payout/", views.StaffPayoutView.as_view(), name="staff_payout"),
    path(
        "payout/withdrawals/",
        views.StaffWithdrawalCreateView.as_view(),
        name="staff_withdrawal_create",
    ),
    path(
        "admin/withdrawals/",
        views.AdminWithdrawalsView.as_view(),
        name="admin_withdrawals",
    ),
    path(
        "admin/withdrawals/<int:pk>/",
        views.AdminWithdrawalActionView.as_view(),
        name="admin_withdrawal_action",
    ),
    path("", include(router.urls)),
]
