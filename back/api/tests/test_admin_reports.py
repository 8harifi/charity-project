from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from api.models import AdminProfile, Benefactor, CustomUser, PlatformAuditLog
from api.services.wallet_service import credit_wallet, get_or_create_benefactor_wallet


class AdminReportsAccessTests(TestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_user(
            username="09120000001",
            password="pass12345",
            role="admin",
            state=True,
        )
        AdminProfile.objects.create(
            user=self.admin,
            first_name="Admin",
            last_name="User",
            phone_number="09120000001",
        )
        self.patient_user = CustomUser.objects.create_user(
            username="09121111111",
            password="pass12345",
            role="patient",
            state=True,
        )
        self.client = APIClient()

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_report_endpoints_forbid_non_admin(self):
        self._auth(self.patient_user)
        paths = [
            "/api/admin/reports/transactions/",
            "/api/admin/reports/workflow/",
            "/api/admin/reports/audit/",
        ]
        for path in paths:
            r = self.client.get(path)
            self.assertEqual(r.status_code, 403, path)

    def test_transactions_report_shape_for_admin(self):
        self._auth(self.admin)
        r = self.client.get("/api/admin/reports/transactions/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("count", r.data)
        self.assertIn("results", r.data)
        self.assertIsInstance(r.data["results"], list)

    def test_workflow_report_shape_for_admin(self):
        self._auth(self.admin)
        r = self.client.get("/api/admin/reports/workflow/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("results", r.data)

    def test_audit_report_shape_for_admin(self):
        self._auth(self.admin)
        r = self.client.get("/api/admin/reports/audit/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("results", r.data)


class AdminAuditLogTests(TestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_user(
            username="09120000002",
            password="pass12345",
            role="admin",
            state=True,
        )
        AdminProfile.objects.create(
            user=self.admin,
            first_name="Admin",
            last_name="Two",
            phone_number="09120000002",
        )
        self.pending = CustomUser.objects.create_user(
            username="09122222222",
            password="pass12345",
            role="benefactor",
            state=False,
        )
        Benefactor.objects.create(
            user=self.pending,
            first_name="Pending",
            last_name="User",
            national_code="1111111111",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_approve_user_creates_audit_log(self):
        r = self.client.post(f"/api/admin/approve-user/{self.pending.pk}/")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(
            PlatformAuditLog.objects.filter(
                event_type="user_approved",
                target_id=self.pending.pk,
            ).exists()
        )

    def test_wallet_adjust_creates_audit_log(self):
        benefactor = CustomUser.objects.create_user(
            username="09123333333",
            password="pass12345",
            role="benefactor",
            state=True,
        )
        Benefactor.objects.create(
            user=benefactor,
            first_name="Ali",
            last_name="Karimi",
            national_code="2222222222",
        )
        wallet = get_or_create_benefactor_wallet(benefactor)
        credit_wallet(wallet, Decimal("10000"), kind="topup", reference_type="gateway_payment")

        r = self.client.post(
            "/api/admin/wallet/adjust/",
            {
                "phone_number": "09123333333",
                "direction": "credit",
                "amount": 5000,
                "reason": "test adjust",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        self.assertTrue(
            PlatformAuditLog.objects.filter(event_type="wallet_adjusted").exists()
        )
