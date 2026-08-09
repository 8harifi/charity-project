"""Regression tests for docs/اصلاحات-سامانه.md requirement IDs."""

from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from api.admin_user_filters import filter_admin_users
from api.models import (
    Benefactor,
    BenefactorDonation,
    Campaign,
    CustomUser,
    HealthAssistant,
    IndividualHealthAssistant,
    NetworkRequest,
    Patient,
    PayoutAccount,
    WithdrawalRequest,
)
from api.serializers.requests import is_fully_funded, request_status_label
from api.utils import ha_can_access_patient, request_type_domain
from api.views.requests import _fundable_requests_qs, filter_by_scope


class _Req:
    def __init__(self, **params):
        self.query_params = params


def _make_admin():
    return CustomUser.objects.create_user(
        username="admin1", password="pass12345", role="admin", state=True, is_staff=True
    )


def _make_ha(code="HA001", *, perms=None):
    user = CustomUser.objects.create_user(
        username=f"ha_{code}", password="pass12345", role="health_assistant", state=True
    )
    ha = HealthAssistant.objects.create(
        user=user,
        health_assistance_code=code,
        cooperation_description="اسکان ویلچر مهارت",
    )
    IndividualHealthAssistant.objects.create(
        health_assistant=ha,
        first_name="رضا",
        last_name="محمدی",
        national_code=f"{abs(hash(code)) % 10**10:010d}",
        phone_number="09120000001",
        job="مددکار",
        province="تهران",
        city="تهران",
        home_address="آدرس",
        work_address="آدرس کار",
    )
    if perms:
        for k, v in perms.items():
            setattr(ha, k, v)
        ha.save()
    return user, ha


def _make_benefactor(username="ben1", national="1111111111"):
    user = CustomUser.objects.create_user(
        username=username, password="pass12345", role="benefactor", state=True
    )
    Benefactor.objects.create(
        user=user,
        first_name="خیر",
        last_name="نمونه",
        national_code=national,
        phone_number="09121111111",
        province="تهران",
        city="تهران",
    )
    return user


def _make_patient(ha=None, national="2222222222"):
    from api.utils import generate_patient_code

    user = CustomUser.objects.create_user(
        username=f"pat_{national}", password="pass12345", role="patient", state=True
    )
    return Patient.objects.create(
        user=user,
        patient_code=generate_patient_code(),
        first_name="بیمار",
        last_name="تست",
        father_name="پدر",
        age=40,
        head_household=True,
        national_code=national,
        phone_number="09122222222",
        province="تهران",
        city="تهران",
        address="آدرس",
        introducer=ha,
        skill="نجاری",
        sickness_description="دیابت",
    )


class BenefactorProvinceFilterTests(TestCase):
    """X1 — province filter must not 500 when Benefactor has province/city."""

    def test_admin_province_filter_includes_benefactor(self):
        _make_benefactor()
        qs = filter_admin_users(_Req(province="تهران"))
        self.assertTrue(qs.filter(role="benefactor").exists())

    def test_global_search_benefactor_province(self):
        user = _make_benefactor()
        client = APIClient()
        admin = _make_admin()
        client.force_authenticate(user=admin)
        r = client.get("/api/global-search/", {"q": "خیر", "province": "تهران"})
        self.assertEqual(r.status_code, 200)
        names = [b["name"] for b in r.data.get("benefactors", [])]
        self.assertTrue(any("خیر" in n for n in names))
        self.assertEqual(user.benefactor_profile.province, "تهران")


class DonationStatusTests(TestCase):
    """X2 — held/cancelled must have Persian labels."""

    def test_held_and_cancelled_have_persian_labels(self):
        labels = dict(BenefactorDonation.STATUS_CHOICES)
        self.assertEqual(labels["held"], "رزرو شده")
        self.assertEqual(labels["cancelled"], "لغو شده")
        self.assertEqual(labels["released"], "آزاد شده")
        self.assertEqual(labels["refunded"], "بازگردانده شده")


class FullyFundedLabelTests(TestCase):
    """B3 — fully funded requests show settlement-waiting label."""

    def test_status_label_for_fully_funded(self):
        _, ha = _make_ha()
        patient = _make_patient(ha)
        req = NetworkRequest.objects.create(
            request_type="financial",
            patient=patient,
            created_by=ha.user,
            subject="دارو",
            description="نیاز دارویی",
            amount_needed=Decimal("100000"),
            collected_amount=Decimal("100000"),
            status="in_progress",
        )
        self.assertTrue(is_fully_funded(req))
        self.assertEqual(request_status_label(req), "تأمین مالی شد — در انتظار تسویه")
        completed = filter_by_scope(NetworkRequest.objects.all(), "completed")
        self.assertTrue(completed.filter(pk=req.pk).exists())
        active = filter_by_scope(NetworkRequest.objects.all(), "active")
        self.assertFalse(active.filter(pk=req.pk).exists())


class FundableScopeTests(TestCase):
    """B2 — completed/rejected scopes must reach closed fundable requests."""

    def test_fundable_qs_not_prefiltered_to_active(self):
        _, ha = _make_ha()
        patient = _make_patient(ha)
        done = NetworkRequest.objects.create(
            request_type="financial",
            patient=patient,
            created_by=ha.user,
            subject="تمام",
            description="d",
            amount_needed=Decimal("1000"),
            status="completed",
            ha_approval_status="not_required",
        )
        qs = _fundable_requests_qs()
        self.assertTrue(qs.filter(pk=done.pk).exists())
        self.assertTrue(filter_by_scope(qs, "completed").filter(pk=done.pk).exists())


class HaPermissionTests(TestCase):
    """S1 — per-HA approve/edit-all permissions."""

    def test_own_patient_uses_base_flags(self):
        _, ha = _make_ha(perms={"can_edit_patients": False, "can_approve_patients": False})
        patient = _make_patient(ha)
        self.assertFalse(
            ha_can_access_patient(ha, patient, action="edit", domain="registration")
        )
        self.assertFalse(
            ha_can_access_patient(ha, patient, action="approve", domain="registration")
        )

    def test_all_flag_opens_other_patients(self):
        _, ha = _make_ha(
            "HA002",
            perms={"can_edit_financial_all": True, "can_approve_services_all": True},
        )
        _, other = _make_ha("HA003")
        patient = _make_patient(other, national="3333333333")
        self.assertTrue(
            ha_can_access_patient(ha, patient, action="edit", domain="financial")
        )
        self.assertFalse(
            ha_can_access_patient(ha, patient, action="edit", domain="visits")
        )
        self.assertEqual(request_type_domain("consultation"), "visits")


class RegionalCampaignTests(TestCase):
    """S7 — regional request without patient links campaign via source_request."""

    def test_regional_create_links_campaign(self):
        user, ha = _make_ha("HA010")
        client = APIClient()
        client.force_authenticate(user=user)
        r = client.post(
            "/api/requests/",
            {
                "request_type": "regional",
                "subject": "تجهیزات منطقه",
                "description": "کمبود ویلچر",
                "amount_needed": 5000000,
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        req = NetworkRequest.objects.get(pk=r.data["id"])
        self.assertIsNone(req.patient_id)
        campaign = Campaign.objects.get(source_request=req)
        self.assertEqual(campaign.title, "تجهیزات منطقه")
        self.assertTrue(campaign.is_published)


class AdminStatusAndEditTests(TestCase):
    """A4 / A5 — admin can set status and edit/delete requests."""

    def setUp(self):
        self.admin = _make_admin()
        _, ha = _make_ha("HA020")
        self.patient = _make_patient(ha, national="4444444444")
        self.req = NetworkRequest.objects.create(
            request_type="service",
            patient=self.patient,
            created_by=ha.user,
            subject="خدمت",
            description="توضیح",
            status="pending",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_admin_set_status(self):
        r = self.client.patch(
            f"/api/requests/{self.req.pk}/status/",
            {"action": "set_status", "status": "completed", "note": "بسته شد توسط مدیر"},
            format="json",
        )
        self.assertEqual(r.status_code, 200, r.data)
        self.req.refresh_from_db()
        self.assertEqual(self.req.status, "completed")

    def test_admin_edit_and_delete(self):
        r = self.client.patch(
            f"/api/requests/{self.req.pk}/",
            {"subject": "موضوع جدید"},
            format="json",
        )
        self.assertEqual(r.status_code, 200, r.data)
        self.req.refresh_from_db()
        self.assertEqual(self.req.subject, "موضوع جدید")
        r = self.client.delete(f"/api/requests/{self.req.pk}/")
        self.assertEqual(r.status_code, 204)
        self.assertFalse(NetworkRequest.objects.filter(pk=self.req.pk).exists())


class GlobalSearchPermissionTests(TestCase):
    """S2 — search buckets gated by HA permissions."""

    def test_ha_without_benefactor_search_gets_empty_bucket(self):
        user, ha = _make_ha(
            "HA030",
            perms={
                "can_search_patients": True,
                "can_search_doctors": False,
                "can_search_assistants": False,
                "can_search_benefactors": False,
                "can_search_organizations": False,
            },
        )
        _make_benefactor("ben_search", "5555555555")
        client = APIClient()
        client.force_authenticate(user=user)
        r = client.get("/api/global-search/", {"q": "خیر"})
        self.assertEqual(r.status_code, 200)
        self.assertNotIn("benefactors", r.data)
        self.assertIn("patients", r.data)


class PayoutFlowTests(TestCase):
    """S6 — Sheba payout account and withdrawal request."""

    def test_staff_can_save_account_and_request_withdrawal(self):
        from api.services.wallet_service import credit_wallet, get_or_create_staff_payout_wallet

        user, _ = _make_ha("HA040")
        wallet = get_or_create_staff_payout_wallet(user)
        credit_wallet(wallet, 200000, kind="donation_in", reference_type="donation")
        client = APIClient()
        client.force_authenticate(user=user)

        r = client.put(
            "/api/payout/",
            {
                "sheba": "IR123456789012345678901234",
                "account_holder_name": "رضا محمدی",
                "bank_name": "ملی",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 200, r.data)
        self.assertTrue(PayoutAccount.objects.filter(user=user).exists())

        r = client.post(
            "/api/payout/withdrawals/",
            {"amount": 50000},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        w = WithdrawalRequest.objects.get(pk=r.data["id"])
        self.assertEqual(w.status, "pending")

        admin = _make_admin()
        client.force_authenticate(user=admin)
        r = client.patch(
            f"/api/admin/withdrawals/{w.pk}/",
            {"action": "pay", "note": "واریز شد"},
            format="json",
        )
        self.assertEqual(r.status_code, 200, r.data)
        w.refresh_from_db()
        self.assertEqual(w.status, "paid")
        wallet.refresh_from_db()
        self.assertEqual(wallet.cached_balance, Decimal("150000"))


class PatientVisitRoutesToDoctorTests(TestCase):
    """P1 — patient visit subtype creates consultation request."""

    def test_patient_visit_is_consultation(self):
        _, ha = _make_ha("HA050")
        patient = _make_patient(ha, national="6666666666")
        client = APIClient()
        client.force_authenticate(user=patient.user)
        r = client.post(
            "/api/requests/",
            {
                "request_type": "consultation",
                "request_subtype": "visit",
                "subject": "وقت ویزیت",
                "description": "نیاز به ویزیت قلب",
                "doctor_name": "دکتر تست",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.data)
        req = NetworkRequest.objects.get(pk=r.data["id"])
        self.assertEqual(req.request_type, "consultation")
        self.assertEqual(req.request_subtype, "visit")
        self.assertEqual(req.ha_approval_status, "pending")


class BenefactorProfileUpdateTests(TestCase):
    """B5 — benefactor can edit name/province/city."""

    def test_patch_profile(self):
        user = _make_benefactor("ben_edit", "7777777777")
        client = APIClient()
        client.force_authenticate(user=user)
        r = client.patch(
            "/api/profile/",
            {
                "profile": {
                    "first_name": "علی",
                    "last_name": "رضایی",
                    "province": "اصفهان",
                    "city": "کاشان",
                    "phone_number": "09123334444",
                }
            },
            format="json",
        )
        self.assertEqual(r.status_code, 200, r.data)
        b = user.benefactor_profile
        b.refresh_from_db()
        self.assertEqual(b.first_name, "علی")
        self.assertEqual(b.province, "اصفهان")
        self.assertEqual(b.city, "کاشان")
