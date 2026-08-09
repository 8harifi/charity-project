"""Tests for meeting-note gaps (N11, N16, N21–N23, N29)."""

from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from api.models import (
    Benefactor,
    CustomUser,
    Doctor,
    DonationHold,
    HealthAssistant,
    IndividualHealthAssistant,
    NetworkRequest,
    OrganizationHealthAssistant,
    Patient,
    StaffRequest,
)
from api.services.donation_service import adjust_request_pledge, donate_from_wallet
from api.services.wallet_service import credit_wallet, get_or_create_benefactor_wallet
from api.utils import generate_patient_code


def _make_benefactor(username="ben_gap", national="1010101010"):
    user = CustomUser.objects.create_user(
        username=username, password="pass12345", role="benefactor", state=True
    )
    Benefactor.objects.create(
        user=user,
        first_name="خیر",
        last_name="تست",
        national_code=national,
        phone_number="09121112222",
        province="تهران",
        city="تهران",
    )
    return user


def _make_ha(code="HA-GAP", *, org=False):
    user = CustomUser.objects.create_user(
        username=f"ha_{code}", password="pass12345", role="health_assistant", state=True
    )
    ha = HealthAssistant.objects.create(
        user=user,
        health_assistance_code=code,
        cooperation_description="test",
    )
    if org:
        OrganizationHealthAssistant.objects.create(
            health_assistant=ha,
            name=f"Org {code}",
            director_first_name="مدیر",
            director_last_name="تست",
            director_phone_number="09120000000",
            director_landline_number="02100000000",
            province="تهران",
            city="تهران",
            address="آدرس",
            social_unit_head_first_name="مددکار",
            social_unit_head_last_name="تست",
            social_unit_head_phone_number="09120000001",
            social_unit_head_landline_number="02100000001",
        )
    else:
        IndividualHealthAssistant.objects.create(
            health_assistant=ha,
            first_name="سلامتیار",
            last_name=code,
            national_code=f"{abs(hash(code)) % 10**10:010d}",
            phone_number="09123334444",
            job="مددکار",
            province="تهران",
            city="تهران",
            home_address="خانه",
            work_address="کار",
        )
    return user, ha


def _make_doctor(username="doc_gap", national="3030303030"):
    user = CustomUser.objects.create_user(
        username=username, password="pass12345", role="doctor", state=True
    )
    Doctor.objects.create(
        user=user,
        first_name="پزشک",
        last_name="تست",
        father_name="پدر",
        national_code=national,
        medical_system_code=f"M{national[:6]}",
        phone_number="09125556666",
        province="تهران",
        city="تهران",
        address="آدرس",
    )
    return user


def _make_patient(ha=None, national="4040404040"):
    user = CustomUser.objects.create_user(
        username=f"pat_{national}", password="pass12345", role="patient", state=True
    )
    return Patient.objects.create(
        user=user,
        patient_code=generate_patient_code(),
        first_name="بیمار",
        last_name="تست",
        father_name="پدر",
        age=30,
        head_household=True,
        national_code=national,
        phone_number="09127778888",
        province="تهران",
        city="تهران",
        address="آدرس",
        introducer=ha,
        sickness_description="تب",
    )


class AdjustPledgeTests(TestCase):
    def setUp(self):
        self.benefactor = _make_benefactor()
        self.wallet = get_or_create_benefactor_wallet(self.benefactor)
        credit_wallet(self.wallet, 200000, kind="topup", reference_type="gateway_payment")
        _, ha = _make_ha("HA-ADJ")
        patient = _make_patient(ha, national="4141414141")
        self.req = NetworkRequest.objects.create(
            request_type="financial",
            patient=patient,
            created_by=ha.user,
            subject="نیاز مالی",
            description="d",
            amount_needed=100000,
            status="pending",
        )

    def test_adjust_pledge_increase_and_decrease(self):
        donate_from_wallet(
            benefactor_user=self.benefactor,
            amount=20000,
            destination_type="request",
            network_request_id=self.req.pk,
        )
        self.req.refresh_from_db()
        self.assertEqual(self.req.collected_amount, Decimal("20000"))

        adjust_request_pledge(
            benefactor_user=self.benefactor,
            network_request_id=self.req.pk,
            new_amount=50000,
        )
        self.req.refresh_from_db()
        self.assertEqual(self.req.collected_amount, Decimal("50000"))
        held = DonationHold.objects.filter(
            benefactor=self.benefactor, network_request=self.req, status="held"
        )
        self.assertEqual(sum(h.amount for h in held), Decimal("50000"))

        adjust_request_pledge(
            benefactor_user=self.benefactor,
            network_request_id=self.req.pk,
            new_amount=10000,
        )
        self.req.refresh_from_db()
        self.assertEqual(self.req.collected_amount, Decimal("10000"))

    def test_adjust_pledge_to_zero_cancels(self):
        donate_from_wallet(
            benefactor_user=self.benefactor,
            amount=15000,
            destination_type="request",
            network_request_id=self.req.pk,
        )
        result = adjust_request_pledge(
            benefactor_user=self.benefactor,
            network_request_id=self.req.pk,
            new_amount=0,
        )
        self.assertIsNone(result)
        self.req.refresh_from_db()
        self.assertEqual(self.req.collected_amount, Decimal("0"))
        self.assertFalse(
            DonationHold.objects.filter(
                benefactor=self.benefactor, network_request=self.req, status="held"
            ).exists()
        )

    def test_adjust_pledge_api(self):
        donate_from_wallet(
            benefactor_user=self.benefactor,
            amount=12000,
            destination_type="request",
            network_request_id=self.req.pk,
        )
        client = APIClient()
        client.force_authenticate(self.benefactor)
        r = client.post(
            "/api/wallet/donate/adjust-pledge/",
            {"network_request_id": self.req.pk, "amount": 8000},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Decimal(r.data["amount"]), Decimal("8000"))


class StaffRequestFinancialChainTests(TestCase):
    def test_accept_sets_doctor_as_fund_recipient_and_links_request(self):
        ha_user, ha = _make_ha("HA-STAFF")
        doctor = _make_doctor()
        patient = _make_patient(ha, national="4242424242")
        sr = StaffRequest.objects.create(
            created_by=doctor,
            health_assistant=ha,
            patient=patient,
            subject="نیاز جراحی",
            description="توضیح",
            amount_needed=75000,
        )
        client = APIClient()
        client.force_authenticate(ha_user)
        r = client.patch(
            f"/api/staff-requests/{sr.pk}/status/",
            {"action": "accept"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        sr.refresh_from_db()
        self.assertEqual(sr.status, "in_progress")
        self.assertIsNotNone(sr.network_request_id)
        nr = sr.network_request
        self.assertEqual(nr.fund_recipient_id, doctor.id)
        self.assertEqual(nr.request_type, "financial")
        self.assertEqual(nr.amount_needed, Decimal("75000"))
        self.assertEqual(r.data["financial_status"], "pending")


class OrgSubordinateApprovalTests(TestCase):
    def test_org_ha_can_link_approve_and_reject(self):
        org_user, org_ha = _make_ha("ORG1", org=True)
        _, sub_ha = _make_ha("SUB1")
        client = APIClient()
        client.force_authenticate(org_user)

        r = client.post(
            "/api/health-assistant/subordinates/",
            {"health_assistant_id": sub_ha.pk},
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        sub_ha.refresh_from_db()
        self.assertEqual(sub_ha.parent_organization_id, org_ha.pk)
        self.assertFalse(sub_ha.org_approved)

        r = client.patch(
            f"/api/health-assistant/subordinates/{sub_ha.pk}/",
            {"action": "approve"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        sub_ha.refresh_from_db()
        self.assertTrue(sub_ha.org_approved)

        r = client.patch(
            f"/api/health-assistant/subordinates/{sub_ha.pk}/",
            {"action": "reject"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        sub_ha.refresh_from_db()
        self.assertIsNone(sub_ha.parent_organization_id)
        self.assertFalse(sub_ha.org_approved)

    def test_individual_ha_cannot_manage_subordinates(self):
        ind_user, _ = _make_ha("IND1")
        client = APIClient()
        client.force_authenticate(ind_user)
        r = client.get("/api/health-assistant/subordinates/")
        self.assertEqual(r.status_code, 403)


class ProfileImageUploadTests(TestCase):
    def test_profile_image_upload(self):
        user = _make_benefactor(username="ben_img", national="5050505050")
        client = APIClient()
        client.force_authenticate(user)
        image = SimpleUploadedFile(
            "avatar.jpg",
            b"\xff\xd8\xff\xe0" + b"0" * 64,
            content_type="image/jpeg",
        )
        r = client.patch(
            "/api/profile/",
            {"profile": "{}", "profile_image": image},
            format="multipart",
        )
        self.assertEqual(r.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(bool(user.profile_image))
        self.assertTrue(r.data.get("profile_image_url"))
