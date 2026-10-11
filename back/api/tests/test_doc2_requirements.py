"""Tests for docs/اصلاحات سامانه خیریه ها (2).docx."""

from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from api.models import (
    BenefactorDonation,
    Campaign,
    ContactMessage,
    CustomUser,
    HealthAssistant,
    IndividualHealthAssistant,
    MedicalCenter,
    NetworkRequest,
    OrganizationApplication,
    Patient,
    RequestReadReceipt,
)
from api.tests.test_doc_requirements import _make_admin, _make_benefactor, _make_ha, _make_patient
from api.utils import mask_patient_name, name_search_q
from api.views.requests import _fundable_requests_qs, filter_by_scope
from django.db.models import Q


class NameSearchTests(TestCase):
    def test_full_name_matches_split_fields(self):
        _, ha = _make_ha()
        _make_patient(ha, national="3333333333")
        patient = Patient.objects.get(national_code="3333333333")
        patient.first_name = "علی"
        patient.last_name = "رضایی"
        patient.save()
        qs = Patient.objects.filter(name_search_q("علی رضایی"))
        self.assertTrue(qs.filter(pk=patient.pk).exists())

    def test_mask_patient_name(self):
        _, ha = _make_ha("HA009")
        p = _make_patient(ha, national="4444444444")
        p.first_name = "مریم"
        p.last_name = "احمدی"
        p.save()
        self.assertEqual(mask_patient_name(p), "مریم ا.")


class PublicEndpointsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_medical_centers_seeded_for_kerman(self):
        r = self.client.get("/api/public/medical-centers/")
        self.assertEqual(r.status_code, 200)
        names = [c["name"] for c in r.data]
        self.assertTrue(any("کرمان" in (c.get("city") or "") for c in r.data) or names)

    def test_medical_centers_have_schedule_images(self):
        r = self.client.get("/api/public/medical-centers/")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data)
        self.assertTrue(any((c.get("schedule_images") or []) for c in r.data))

    def test_weekday_present_filter(self):
        yes_r = self.client.get(
            "/api/public/medical-centers/",
            {"weekday": "sat", "weekday_present": "yes"},
        )
        no_r = self.client.get(
            "/api/public/medical-centers/",
            {"weekday": "sat", "weekday_present": "no"},
        )
        self.assertEqual(yes_r.status_code, 200)
        self.assertEqual(no_r.status_code, 200)
        yes_names = {c["name"] for c in yes_r.data}
        no_names = {c["name"] for c in no_r.data}
        self.assertTrue(yes_names)
        self.assertIn("بیمارستان افضلی‌پور", yes_names)
        self.assertNotIn("بیمارستان افضلی‌پور", no_names)
        for center in yes_r.data:
            for img in center.get("schedule_images") or []:
                self.assertIn(img.get("weekday"), ("sat", ""))

    def test_public_stats_has_supported_patients(self):
        r = self.client.get("/api/public/stats/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("supported_patients", r.data)

    def test_contact_message_create(self):
        _, ha = _make_ha("HA013")
        r = self.client.post(
            "/api/contact-messages/",
            {
                "name": "بیمار",
                "phone": "09120000000",
                "region": "کرمان",
                "subject": "سوال",
                "message": "نیاز به مشاوره",
                "intent": "join_helper",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        self.assertTrue(r.data.get("sms_sent"))
        ha.refresh_from_db()
        self.assertTrue(ha.is_network_consultant)
        message = ContactMessage.objects.get(pk=r.data["id"])
        self.assertEqual(message.assigned_to_id, ha.user_id)

    def test_supporting_orgs_include_medical_centers(self):
        r = self.client.get("/api/public/supporting-orgs/", {"city": "کرمان"})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(any(o.get("org_type") == "مرکز درمانی" for o in r.data))

    def test_password_reset_roundtrip(self):
        user = CustomUser.objects.create_user(
            username="09123334444", password="oldpass1", role="benefactor", state=True
        )
        r = self.client.post("/api/password-reset/", {"phone": "09123334444"}, format="json")
        self.assertEqual(r.status_code, 200)
        code = r.data.get("debug_code")
        self.assertTrue(code)
        r2 = self.client.post(
            "/api/password-reset/confirm/",
            {"phone": "09123334444", "code": code, "new_password": "newpass1"},
            format="json",
        )
        self.assertEqual(r2.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("newpass1"))

    def test_supporting_orgs_only_medical_and_charity(self):
        user = CustomUser.objects.create_user(
            username="org1", password="pass12345", role="charity_center", state=True
        )
        OrganizationApplication.objects.create(
            user=user,
            organization_role="charity_center",
            name="خیریه نمونه",
            province="کرمان",
            city="کرمان",
            payload={"address": "خیابان ۱", "landline": "034-111"},
        )
        r = self.client.get("/api/public/supporting-orgs/", {"q": "خیریه", "province": "کرمان"})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(any(o["name"] == "خیریه نمونه" for o in r.data))
        self.assertTrue(all(o["organization_role"] in ("charity_center", "service_center") for o in r.data))


class BenefactorPrivacyTests(TestCase):
    def test_incoming_hides_full_last_name(self):
        _, ha = _make_ha("HA010")
        patient = _make_patient(ha, national="5555555555")
        patient.first_name = "حسن"
        patient.last_name = "محمدی"
        patient.phone_number = "09129999999"
        patient.save()
        NetworkRequest.objects.create(
            request_type="financial",
            patient=patient,
            created_by=ha.user,
            subject="دارو",
            description="نیاز",
            amount_needed=Decimal("100000"),
            ha_approval_status="approved",
            status="in_progress",
        )
        benefactor = _make_benefactor("benpriv", "6666666666")
        client = APIClient()
        client.force_authenticate(user=benefactor)
        r = client.get("/api/benefactor/incoming-requests/", {"scope": "all"})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data)
        self.assertEqual(r.data[0]["patient_name"], "حسن م.")
        self.assertEqual(r.data[0]["patient_public"]["phone"], "")


class PatientSignupIntroducerTests(TestCase):
    def test_signup_without_introducer_rejected(self):
        client = APIClient()
        r = client.post(
            "/api/patient/sign-up/",
            {
                "national_code": "7777777777",
                "phone_number": "09127777777",
                "password": "pass12345",
                "first_name": "بیمار",
                "last_name": "بدون معرف",
                "father_name": "پدر",
                "gender": 1,
                "age": 30,
                "marital_status": 1,
                "head_household": True,
                "education": 1,
                "job_status": 1,
                "housing_status": 1,
                "covered_organization": 1,
                "province": "کرمان",
                "city": "کرمان",
                "address": "آدرس",
                "insurance": 1,
            },
            format="json",
        )
        self.assertEqual(r.status_code, 400)

    def test_signup_with_name_only_introducer_rejected(self):
        client = APIClient()
        r = client.post(
            "/api/patient/sign-up/",
            {
                "national_code": "7777777788",
                "phone_number": "09127777788",
                "password": "pass12345",
                "first_name": "بیمار",
                "last_name": "نامی",
                "father_name": "پدر",
                "gender": 1,
                "age": 30,
                "marital_status": 1,
                "head_household": True,
                "education": 1,
                "job_status": 1,
                "housing_status": 1,
                "covered_organization": 1,
                "province": "کرمان",
                "city": "کرمان",
                "address": "آدرس",
                "insurance": 1,
                "presenter_first_name": "علی",
                "presenter_last_name": "ساختگی",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 400)


class ReadReceiptTests(TestCase):
    def test_mark_read_and_filter(self):
        _, ha = _make_ha("HA011")
        patient = _make_patient(ha, national="8888888888")
        req = NetworkRequest.objects.create(
            request_type="service",
            patient=patient,
            created_by=ha.user,
            subject="مشاوره",
            description="توضیح",
            needed_service="مشاوره",
        )
        client = APIClient()
        client.force_authenticate(user=ha.user)
        r = client.get("/api/requests/", {"scope": "all", "read_status": "unread"})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(any(x["id"] == req.pk for x in r.data))
        client.post(f"/api/requests/{req.pk}/read/")
        r2 = client.get("/api/requests/", {"scope": "all", "read_status": "unread"})
        self.assertFalse(any(x["id"] == req.pk for x in r2.data))


class ScopeAllHistoryTests(TestCase):
    def test_all_includes_completed(self):
        _, ha = _make_ha("HA012")
        patient = _make_patient(ha, national="9999999999")
        NetworkRequest.objects.create(
            request_type="financial",
            patient=patient,
            created_by=ha.user,
            subject="دارو",
            description="نیاز",
            amount_needed=Decimal("10000"),
            ha_approval_status="approved",
            status="completed",
        )
        qs = filter_by_scope(_fundable_requests_qs(), "all")
        self.assertTrue(qs.filter(status="completed").exists())


class HAApproveLikeAdminTests(TestCase):
    def test_ha_approve_activates_patient(self):
        user, ha = _make_ha("HA020")
        patient = _make_patient(ha, national="1010101010")
        patient.ha_approved = False
        patient.admin_approved = False
        patient.save(update_fields=["ha_approved", "admin_approved"])
        patient.user.state = False
        patient.user.save(update_fields=["state"])
        client = APIClient()
        client.force_authenticate(user=user)
        r = client.post(f"/api/health-assistant/patients/{patient.pk}/approve/")
        self.assertEqual(r.status_code, 200)
        patient.refresh_from_db()
        patient.user.refresh_from_db()
        self.assertTrue(patient.ha_approved)
        self.assertTrue(patient.admin_approved)
        self.assertTrue(patient.user.state)

    def test_admin_cannot_activate_orphan_patient(self):
        admin = _make_admin()
        _, ha = _make_ha("HA021")
        patient = _make_patient(ha, national="1212121212")
        patient.introducer = None
        patient.ha_approved = False
        patient.admin_approved = False
        patient.save(update_fields=["introducer", "ha_approved", "admin_approved"])
        patient.user.state = False
        patient.user.save(update_fields=["state"])
        client = APIClient()
        client.force_authenticate(user=admin)
        r = client.post(f"/api/admin/approve-user/{patient.user_id}/")
        self.assertEqual(r.status_code, 400)
        patient.user.refresh_from_db()
        self.assertFalse(patient.user.state)


class GuestRequestDonateTests(TestCase):
    def test_guest_can_donate_to_financial_request(self):
        _make_admin()
        _, ha = _make_ha("HA022")
        patient = _make_patient(ha, national="1313131313")
        req = NetworkRequest.objects.create(
            request_type="financial",
            patient=patient,
            created_by=ha.user,
            subject="دارو",
            description="نیاز",
            amount_needed=Decimal("100000"),
            ha_approval_status="approved",
            status="in_progress",
        )
        client = APIClient()
        r = client.post(
            "/api/wallet/donate/guest/",
            {
                "amount": 10000,
                "destination_type": "request",
                "network_request_id": req.pk,
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        req.refresh_from_db()
        self.assertEqual(req.collected_amount, Decimal("10000"))


class MeetingNotesFollowupTests(TestCase):
    def test_ha_register_patient_without_introducer_codes(self):
        ha_user, ha = _make_ha("HA040")
        client = APIClient()
        client.force_authenticate(user=ha_user)
        r = client.post(
            "/api/health-assistant/patients/register/",
            {
                "national_code": "5555555555",
                "phone_number": "09125555555",
                "password": "pass12345",
                "first_name": "بیمار",
                "last_name": "معرف",
                "father_name": "پدر",
                "gender": 1,
                "age": 30,
                "marital_status": 1,
                "head_household": True,
                "education": 1,
                "job_status": 1,
                "housing_status": 1,
                "covered_organization": 1,
                "province": "کرمان",
                "city": "کرمان",
                "address": "آدرس",
                "insurance": 1,
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        patient = Patient.objects.get(national_code="5555555555")
        self.assertEqual(patient.introducer_id, ha.pk)
        self.assertTrue(patient.user.state)

    def test_logged_in_general_donate_credits_platform(self):
        from api.services.wallet_service import (
            credit_wallet,
            get_or_create_benefactor_wallet,
            get_or_create_platform_wallet,
        )

        ben = _make_benefactor("ben_gen", "1212121212")
        wallet = get_or_create_benefactor_wallet(ben)
        credit_wallet(wallet, 50000, kind="topup", reference_type="seed")
        platform = get_or_create_platform_wallet()
        before = platform.cached_balance
        client = APIClient()
        client.force_authenticate(user=ben)
        r = client.post(
            "/api/wallet/donate/",
            {"amount": 10000, "destination_type": "general"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        platform.refresh_from_db()
        self.assertEqual(platform.cached_balance, before + Decimal("10000"))
        self.assertTrue(
            BenefactorDonation.objects.filter(
                benefactor=ben, destination_type="general"
            ).exists()
        )

    def test_guest_general_donate_records_donation(self):
        from api.services.wallet_service import get_or_create_platform_wallet

        _make_admin()
        platform = get_or_create_platform_wallet()
        before = platform.cached_balance
        client = APIClient()
        r = client.post(
            "/api/wallet/donate/guest/",
            {"amount": 15000, "destination_type": "general"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        platform.refresh_from_db()
        self.assertEqual(platform.cached_balance, before + Decimal("15000"))
        self.assertTrue(
            BenefactorDonation.objects.filter(destination_type="general").exists()
        )

    def test_public_ha_affiliation_and_supporting_org_subset(self):
        _, ha = _make_ha("HA041")
        ind = ha.individual_profile
        ind.first_name = "سارا"
        ind.last_name = "حسنی"
        ind.save()
        client = APIClient()
        r = client.get("/api/health-assistants/public/")
        self.assertEqual(r.status_code, 200)
        item = next(x for x in r.data if x["code"] == "HA041")
        self.assertEqual(item["affiliation"]["kind"], "independent")
        self.assertEqual(item["affiliation"]["label"], "سلامتیار مستقل")

        center = MedicalCenter.objects.get(name="بیمارستان افضلی‌پور")
        ha.affiliation_kind = "affiliated"
        ha.affiliated_medical_center = center
        ha.save()
        r = client.get("/api/health-assistants/public/")
        item = next(x for x in r.data if x["code"] == "HA041")
        self.assertEqual(item["affiliation"]["kind"], "affiliated")
        self.assertIn("افضلی", item["affiliation"]["name"])

        r = client.get("/api/public/supporting-orgs/", {"city": "کرمان"})
        self.assertEqual(r.status_code, 200)
        joined = " ".join((x.get("ha_subset") or "") for x in r.data)
        self.assertIn("سارا", joined)

