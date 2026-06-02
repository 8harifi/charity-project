from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase, TransactionTestCase

from api.models import Benefactor, Campaign, CustomUser, GatewayPayment, Patient, Wallet
from api.services.donation_service import DonationError, donate_from_wallet
from api.services.topup_service import TopUpError, mock_instant_topup, verify_and_credit_topup
from api.services.wallet_service import (
    InsufficientBalanceError,
    credit_wallet,
    debit_wallet,
    get_or_create_benefactor_wallet,
    get_or_create_patient_escrow_wallet,
    transfer_between_wallets,
)


class WalletServiceTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="benefactor1",
            password="pass12345",
            role="benefactor",
            state=True,
        )
        Benefactor.objects.create(
            user=self.user,
            first_name="Ali",
            last_name="Karimi",
            national_code="1234567890",
        )
        self.wallet = get_or_create_benefactor_wallet(self.user)

    def test_credit_and_debit_updates_balance(self):
        credit_wallet(self.wallet, 50000, kind="topup", reference_type="gateway_payment")
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.cached_balance, Decimal("50000"))

        debit_wallet(self.wallet, 20000, kind="donation_out", reference_type="donation")
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.cached_balance, Decimal("30000"))

    def test_insufficient_balance_raises(self):
        credit_wallet(self.wallet, 1000, kind="topup", reference_type="gateway_payment")
        with self.assertRaises(InsufficientBalanceError):
            debit_wallet(self.wallet, 5000, kind="donation_out", reference_type="donation")


class DonationServiceTests(TestCase):
    def setUp(self):
        self.benefactor_user = CustomUser.objects.create_user(
            username="donor1",
            password="pass12345",
            role="benefactor",
            state=True,
        )
        Benefactor.objects.create(
            user=self.benefactor_user,
            first_name="Sara",
            last_name="Ahmadi",
            national_code="9876543210",
        )
        credit_wallet(
            get_or_create_benefactor_wallet(self.benefactor_user),
            100000,
            kind="topup",
            reference_type="gateway_payment",
        )
        self.campaign = Campaign.objects.create(
            title="Test Campaign",
            target_amount=500000,
            raised_amount=0,
            is_published=True,
        )
        patient_user = CustomUser.objects.create_user(
            username="patient1",
            password="pass12345",
            role="patient",
            state=True,
        )
        self.patient = Patient.objects.create(
            user=patient_user,
            patient_code="P-TEST-001",
            first_name="Reza",
            last_name="Test",
            father_name="Hossein",
            age=30,
            head_household=True,
            phone_number="09120000000",
            province="Tehran",
            city="Tehran",
            address="Test address",
            sickness_description="Test",
        )

    def test_donate_to_campaign_increments_raised_amount(self):
        donate_from_wallet(
            benefactor_user=self.benefactor_user,
            amount=25000,
            destination_type="campaign",
            campaign_id=self.campaign.pk,
        )
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.raised_amount, Decimal("25000"))

        wallet = get_or_create_benefactor_wallet(self.benefactor_user)
        wallet.refresh_from_db()
        self.assertEqual(wallet.cached_balance, Decimal("75000"))

    def test_donate_to_patient_credits_escrow(self):
        donate_from_wallet(
            benefactor_user=self.benefactor_user,
            amount=40000,
            destination_type="patient",
            patient_id=self.patient.pk,
        )
        escrow = get_or_create_patient_escrow_wallet(self.patient)
        escrow.refresh_from_db()
        self.assertEqual(escrow.cached_balance, Decimal("40000"))

    def test_donate_fails_without_balance(self):
        wallet = get_or_create_benefactor_wallet(self.benefactor_user)
        Wallet.objects.filter(pk=wallet.pk).update(cached_balance=0)
        with self.assertRaises(InsufficientBalanceError):
            donate_from_wallet(
                benefactor_user=self.benefactor_user,
                amount=1000,
                destination_type="general",
            )

    def test_unpublished_campaign_rejected(self):
        self.campaign.is_published = False
        self.campaign.save()
        with self.assertRaises(DonationError):
            donate_from_wallet(
                benefactor_user=self.benefactor_user,
                amount=1000,
                destination_type="campaign",
                campaign_id=self.campaign.pk,
            )


class TopUpIdempotencyTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="topup_user",
            password="pass12345",
            role="benefactor",
            state=True,
        )
        Benefactor.objects.create(
            user=self.user,
            first_name="Top",
            last_name="Up",
            national_code="1111111111",
        )
        self.wallet = get_or_create_benefactor_wallet(self.user)
        self.payment = GatewayPayment.objects.create(
            user=self.user,
            wallet=self.wallet,
            amount=Decimal("50000"),
            status="redirected",
            authority="TEST-AUTHORITY-123",
        )

    @patch("api.services.topup_service.payment_verify")
    def test_verify_callback_idempotent(self, mock_verify):
        mock_verify.return_value = type("R", (), {"ref_id": "999", "raw": {}})()

        verify_and_credit_topup(authority="TEST-AUTHORITY-123", status_param="OK")
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.cached_balance, Decimal("50000"))

        verify_and_credit_topup(authority="TEST-AUTHORITY-123", status_param="OK")
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.cached_balance, Decimal("50000"))

    def test_failed_status_does_not_credit(self):
        with self.assertRaises(TopUpError):
            verify_and_credit_topup(authority="TEST-AUTHORITY-123", status_param="NOK")
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.cached_balance, Decimal("0"))


class MockTopUpTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="mock_topup_user",
            password="pass12345",
            role="benefactor",
            state=True,
        )
        Benefactor.objects.create(
            user=self.user,
            first_name="Mock",
            last_name="User",
            national_code="3333333333",
        )
        self.wallet = get_or_create_benefactor_wallet(self.user)

    def test_mock_instant_topup_credits_wallet(self):
        payment = GatewayPayment.objects.create(
            user=self.user,
            wallet=self.wallet,
            amount=Decimal("25000"),
            status="created",
        )
        mock_instant_topup(payment=payment)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.cached_balance, Decimal("25000"))
        payment.refresh_from_db()
        self.assertEqual(payment.status, "verified")
        self.assertEqual(payment.gateway, "mock")

    def test_mock_instant_topup_idempotent(self):
        payment = GatewayPayment.objects.create(
            user=self.user,
            wallet=self.wallet,
            amount=Decimal("25000"),
            status="created",
        )
        mock_instant_topup(payment=payment)
        mock_instant_topup(payment=payment)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.cached_balance, Decimal("25000"))


class ConcurrentTransferTests(TransactionTestCase):
    def test_transfer_atomicity(self):
        user = CustomUser.objects.create_user(
            username="xfer_user",
            password="pass12345",
            role="benefactor",
            state=True,
        )
        Benefactor.objects.create(
            user=user,
            first_name="X",
            last_name="Y",
            national_code="2222222222",
        )
        w1 = get_or_create_benefactor_wallet(user)
        credit_wallet(w1, 10000, kind="topup", reference_type="gateway_payment")
        w2 = get_or_create_patient_escrow_wallet(
            Patient.objects.create(
                user=CustomUser.objects.create_user(
                    username="p2", password="pass", role="patient", state=True
                ),
                patient_code="P-002",
                first_name="A",
                last_name="B",
                father_name="C",
                age=20,
                head_household=False,
                phone_number="09121111111",
                province="X",
                city="Y",
                address="Z",
                sickness_description="s",
            )
        )
        transfer_between_wallets(
            w1,
            w2,
            3000,
            debit_kind="donation_out",
            credit_kind="donation_in",
            reference_type="donation",
        )
        w1.refresh_from_db()
        w2.refresh_from_db()
        self.assertEqual(w1.cached_balance, Decimal("7000"))
        self.assertEqual(w2.cached_balance, Decimal("3000"))
