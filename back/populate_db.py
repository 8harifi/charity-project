"""
Clear the database and seed fresh sample data for the current charity platform.

Covers:
  - Lookups, admin / doctor / HA / patient / benefactor accounts
  - HA permissions (caseload + *_all + global search flags)
  - Dual patient approval, orphan (بدون معرف) patients
  - Consultation / financial / service / regional NetworkRequests
  - Patient request subtypes (اسکان، هزینه‌کرد، ویزیت)
  - Campaigns (including regional source_request)
  - Benefactor wallets, pledges, staff payout wallets
  - PayoutAccount + WithdrawalRequest
  - StaffRequest (doctor → HA)
  - OrganizationApplication

Run:
  python3 populate_db.py
  # or
  python3 manage.py shell < populate_db.py
"""

from __future__ import annotations

import os
import sys
from decimal import Decimal

DEFAULT_PASSWORD = "testpass123"
SEED_TOPUP_AMOUNT = 10_000_000
ADMIN_PHONE = "09100000000"


def _bootstrap_django():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    import django
    from django.apps import apps

    if not apps.ready:
        django.setup()


def main():
    from django.core.management import call_command
    from django.utils import timezone

    from api.models import (
        AdminProfile,
        Benefactor,
        BenefactorDonation,
        Campaign,
        CustomUser,
        Doctor,
        DonationHold,
        HealthAssistant,
        IndividualHealthAssistant,
        NetworkRequest,
        OrganizationApplication,
        OrganizationHealthAssistant,
        Patient,
        PayoutAccount,
        RequestStatusLog,
        StaffRequest,
        Wallet,
        WalletTransaction,
        WithdrawalRequest,
    )
    from api.services.donation_service import DonationError, donate_from_wallet
    from api.services.wallet_service import (
        credit_wallet,
        get_or_create_benefactor_wallet,
        get_or_create_platform_wallet,
        get_or_create_staff_payout_wallet,
    )
    from api.utils import generate_health_assistance_code, generate_patient_code

    # ------------------------------------------------------------------
    # 0. CLEAR
    # ------------------------------------------------------------------

    def clear_database():
        print("\n🧹 Clearing database...")
        call_command("flush", interactive=False, verbosity=0)
        print("  ✓ All tables flushed")

    # ------------------------------------------------------------------
    # 1. LOOKUPS
    # ------------------------------------------------------------------

    def create_lookups():
        print("\n📋 Seeding lookup data...")
        from api.lookup_seeds import LOOKUP_SEEDS, ORGANIZATION_TYPE_SEEDS, seed_lookups
        from django.apps import apps

        seed_lookups(verbose=True)

        def rows(model_name, names=None):
            Model = apps.get_model("api", model_name)
            source = names or LOOKUP_SEEDS[model_name]
            return [Model.objects.get(name=n) for n in source]

        return {
            "genders": rows("Gender"),
            "marital_statuses": rows("MaritalStatus"),
            "educations": rows("Education"),
            "job_statuses": rows("JobStatus"),
            "housing_statuses": rows("HousingStatus"),
            "organizations": rows("CoveredOrganization"),
            "insurances": rows("Insurance"),
            "specialties": rows("Specialty"),
            "cooperation_types": rows("HealthAssistantCooperationType"),
            "org_types": rows("OrganizationType", ORGANIZATION_TYPE_SEEDS),
        }

    # ------------------------------------------------------------------
    # 2. USERS
    # ------------------------------------------------------------------

    def make_user(*, phone, role, first_name, last_name, email, state=True, staff=False):
        user = CustomUser.objects.create_user(
            username=phone,
            password=DEFAULT_PASSWORD,
            email=email,
            role=role,
            state=state,
            first_name=first_name,
            last_name=last_name,
            is_staff=staff,
            is_superuser=staff,
        )
        print(f"  ✓ {role}: {phone} ({first_name} {last_name})")
        return user

    def create_users():
        print("\n👥 Creating users...")
        users = {}

        users["doctor_dr_ali"] = make_user(
            phone="09111234567",
            role="doctor",
            first_name="علی",
            last_name="محمدی",
            email="dr.ali@charity.local",
        )
        users["doctor_dr_zahra"] = make_user(
            phone="09121234567",
            role="doctor",
            first_name="زهرا",
            last_name="احمدی",
            email="dr.zahra@charity.local",
        )
        users["patient_patient_reza"] = make_user(
            phone="09191234567",
            role="patient",
            first_name="رضا",
            last_name="کریمی",
            email="reza@charity.local",
        )
        users["patient_patient_fatima"] = make_user(
            phone="09221234567",
            role="patient",
            first_name="فاطمه",
            last_name="علی‌پور",
            email="fatima@charity.local",
        )
        users["patient_patient_hasan"] = make_user(
            phone="09251234567",
            role="patient",
            first_name="حسن",
            last_name="حسنی",
            email="hasan@charity.local",
        )
        users["patient_patient_pending"] = make_user(
            phone="09301234567",
            role="patient",
            first_name="امیر",
            last_name="رضایی",
            email="amir@charity.local",
            state=False,
        )
        users["patient_patient_orphan"] = make_user(
            phone="09351234567",
            role="patient",
            first_name="نرگس",
            last_name="مرادی",
            email="narges@charity.local",
        )
        users["benefactor_benefactor_hassan"] = make_user(
            phone="09281234567",
            role="benefactor",
            first_name="حسن",
            last_name="صالحی",
            email="hassan@charity.local",
        )
        users["benefactor_benefactor_maryam"] = make_user(
            phone="09291234567",
            role="benefactor",
            first_name="مریم",
            last_name="فرهادی",
            email="maryam@charity.local",
        )
        users["health_assistant_ha_sara"] = make_user(
            phone="09131234567",
            role="health_assistant",
            first_name="سارا",
            last_name="حسنی",
            email="sara@charity.local",
        )
        users["health_assistant_ha_akbar"] = make_user(
            phone="09141234567",
            role="health_assistant",
            first_name="اکبر",
            last_name="محمدی",
            email="akbar@charity.local",
        )
        users["org_pending"] = make_user(
            phone="09381234567",
            role="charity_center",
            first_name="مرکز",
            last_name="نیکوکاری امید",
            email="omid.center@charity.local",
            state=False,
        )

        admin_user = make_user(
            phone=ADMIN_PHONE,
            role="admin",
            first_name="مدیر",
            last_name="سیستم",
            email="admin@charity.local",
            staff=True,
        )
        users["admin"] = admin_user
        AdminProfile.objects.create(
            user=admin_user,
            first_name="مدیر",
            last_name="سیستم",
            phone_number=ADMIN_PHONE,
        )
        print(f"  ✓ AdminProfile for {ADMIN_PHONE}")
        return users

    # ------------------------------------------------------------------
    # 3. DOCTORS
    # ------------------------------------------------------------------

    def create_doctors(users, lookups):
        print("\n👨‍⚕️ Creating doctor profiles...")
        doctors = []
        for info in [
            {
                "user_key": "doctor_dr_ali",
                "first_name": "علی",
                "last_name": "محمدی",
                "father_name": "محمد",
                "national_code": "0123456789",
                "medical_system_code": "MSC001",
                "phone_number": "09111234567",
                "specialty_idx": 1,
                "province": "تهران",
                "city": "تهران",
                "address": "خیابان ولیعصر، کلینیک درمانی",
            },
            {
                "user_key": "doctor_dr_zahra",
                "first_name": "زهرا",
                "last_name": "احمدی",
                "father_name": "احمد",
                "national_code": "0987654321",
                "medical_system_code": "MSC002",
                "phone_number": "09121234567",
                "specialty_idx": 0,
                "province": "اصفهان",
                "city": "اصفهان",
                "address": "میدان نقش جهان، مرکز درمانی",
            },
        ]:
            doctor = Doctor.objects.create(
                user=users[info["user_key"]],
                first_name=info["first_name"],
                last_name=info["last_name"],
                father_name=info["father_name"],
                gender=lookups["genders"][0],
                national_code=info["national_code"],
                medical_system_code=info["medical_system_code"],
                phone_number=info["phone_number"],
                specialty=lookups["specialties"][info["specialty_idx"]],
                province=info["province"],
                city=info["city"],
                address=info["address"],
            )
            doctors.append(doctor)
            print(f"  ✓ Doctor: {info['first_name']} {info['last_name']}")
        return doctors

    def link_doctors_to_health_assistants(doctors, health_assistants):
        print("\n🔗 Linking doctors ↔ health assistants...")
        dr_ali, dr_zahra = doctors
        ha_sara, ha_akbar = health_assistants
        dr_ali.cooperating_health_assistants.set([ha_sara])
        dr_zahra.cooperating_health_assistants.set([ha_akbar])
        print(f"  ✓ دکتر علی ↔ {ha_sara.health_assistance_code}")
        print(f"  ✓ دکتر زهرا ↔ {ha_akbar.health_assistance_code}")

    # ------------------------------------------------------------------
    # 4. HEALTH ASSISTANTS
    # ------------------------------------------------------------------

    def create_health_assistants(users, lookups):
        print("\n👩‍⚕️ Creating health assistant profiles...")
        health_assistants = []

        # Sara — individual HA with elevated platform permissions (search + *_all)
        ha_sara = HealthAssistant.objects.create(
            user=users["health_assistant_ha_sara"],
            health_assistance_code=generate_health_assistance_code(),
            cooperation_type=lookups["cooperation_types"][0],
            cooperation_description="معرفی و پیگیری بیماران در منطقه تهران",
            can_approve_patients=True,
            can_edit_patients=True,
            can_claim_orphan_patients=True,
            can_create_financial=True,
            can_create_services=True,
            can_create_visits=True,
            can_approve_registration_all=True,
            can_edit_registration_all=True,
            can_approve_visits_all=True,
            can_edit_visits_all=False,
            can_approve_financial_all=True,
            can_edit_financial_all=False,
            can_approve_services_all=False,
            can_edit_services_all=False,
            can_search_patients=True,
            can_search_doctors=True,
            can_search_assistants=True,
            can_search_benefactors=True,
            can_search_organizations=True,
            org_approved=True,
        )
        IndividualHealthAssistant.objects.create(
            health_assistant=ha_sara,
            first_name="سارا",
            last_name="حسنی",
            gender=lookups["genders"][1],
            national_code="0111223344",
            phone_number="09131234567",
            education=lookups["educations"][3],
            job="پرستار",
            province="تهران",
            city="تهران",
            home_address="خیابان شریعتی",
            work_address="کلینیک درمانی شریعتی",
        )
        health_assistants.append(ha_sara)
        print(f"  ✓ Individual HA سارا ({ha_sara.health_assistance_code}) — elevated perms")

        # Akbar — organization HA, caseload-scoped (default flags)
        ha_akbar = HealthAssistant.objects.create(
            user=users["health_assistant_ha_akbar"],
            health_assistance_code=generate_health_assistance_code(),
            cooperation_type=lookups["cooperation_types"][1],
            cooperation_description="واحد مددکاری بیمارستان امام خمینی",
            can_approve_patients=True,
            can_edit_patients=True,
            can_claim_orphan_patients=True,
            can_create_financial=True,
            can_create_services=True,
            can_create_visits=True,
            can_search_patients=True,
            can_search_doctors=True,
            can_search_assistants=False,
            can_search_benefactors=False,
            can_search_organizations=False,
            org_approved=True,
        )
        OrganizationHealthAssistant.objects.create(
            health_assistant=ha_akbar,
            organization_type=lookups["org_types"][0],
            name="بیمارستان امام خمینی",
            director_first_name="کاظم",
            director_last_name="کریمی",
            director_phone_number="09141234567",
            director_landline_number="02122222222",
            province="تهران",
            city="تهران",
            address="خیابان ولیعصر، بیمارستان امام خمینی",
            social_unit_head_first_name="فاطمه",
            social_unit_head_last_name="حسینی",
            social_unit_head_phone_number="09151234567",
            social_unit_head_landline_number="02133333333",
        )
        health_assistants.append(ha_akbar)
        print(f"  ✓ Organization HA اکبر ({ha_akbar.health_assistance_code})")

        return health_assistants

    # ------------------------------------------------------------------
    # 5. PATIENTS
    # ------------------------------------------------------------------

    def create_patients(users, lookups, health_assistants):
        print("\n🏥 Creating patient profiles...")
        ha_sara, ha_akbar = health_assistants
        patients = []

        specs = [
            {
                "user_key": "patient_patient_reza",
                "first_name": "رضا",
                "last_name": "کریمی",
                "father_name": "کریم",
                "national_code": "1234567890",
                "gender_idx": 0,
                "age": 45,
                "marital_status_idx": 1,
                "education_idx": 3,
                "job_status_idx": 0,
                "housing_status_idx": 0,
                "insurance_idx": 0,
                "phone_number": "09191234567",
                "landline_number": "02188888888",
                "province": "تهران",
                "city": "تهران",
                "address": "خیابان کریم‌خان زند، پلاک 42",
                "sickness_description": "دیابت و فشار خون",
                "contact1": ("احمد کریمی", "09201234567"),
                "contact2": ("فاطمه کریمی", "09211234567"),
                "introducer": ha_sara,
                "admin_approved": True,
                "ha_approved": True,
            },
            {
                "user_key": "patient_patient_fatima",
                "first_name": "فاطمه",
                "last_name": "علی‌پور",
                "father_name": "علی",
                "national_code": "1887654321",
                "gender_idx": 1,
                "age": 32,
                "marital_status_idx": 0,
                "education_idx": 4,
                "job_status_idx": 0,
                "housing_status_idx": 1,
                "insurance_idx": 1,
                "phone_number": "09221234567",
                "landline_number": "02199999999",
                "province": "اصفهان",
                "city": "اصفهان",
                "address": "میدان نقش جهان، کوچه نو",
                "sickness_description": "کمر درد مزمن",
                "contact1": ("سارا علی‌پور", "09231234567"),
                "contact2": ("محمد علی‌پور", "09241234567"),
                "introducer": ha_akbar,
                "admin_approved": True,
                "ha_approved": True,
            },
            {
                "user_key": "patient_patient_hasan",
                "first_name": "حسن",
                "last_name": "حسنی",
                "father_name": "حسین",
                "national_code": "5555555555",
                "gender_idx": 0,
                "age": 68,
                "marital_status_idx": 1,
                "education_idx": 1,
                "job_status_idx": 1,
                "housing_status_idx": 0,
                "insurance_idx": 0,
                "phone_number": "09251234567",
                "landline_number": "02177777777",
                "province": "تهران",
                "city": "تهران",
                "address": "خیابان جمهوری، نبش آزادی",
                "sickness_description": "بیماری قلبی و ریوی",
                "contact1": ("علی حسنی", "09261234567"),
                "contact2": ("خدیجه حسنی", "09271234567"),
                "introducer": ha_sara,
                "admin_approved": True,
                "ha_approved": True,
            },
            {
                "user_key": "patient_patient_pending",
                "first_name": "امیر",
                "last_name": "رضایی",
                "father_name": "رضا",
                "national_code": "6666666666",
                "gender_idx": 0,
                "age": 28,
                "marital_status_idx": 0,
                "education_idx": 2,
                "job_status_idx": 0,
                "housing_status_idx": 1,
                "insurance_idx": min(5, len(lookups["insurances"]) - 1),
                "phone_number": "09301234567",
                "landline_number": "",
                "province": "تهران",
                "city": "تهران",
                "address": "خیابان آزادی",
                "sickness_description": "نیاز به پیگیری درمانی",
                "contact1": ("رضا رضایی", "09311234567"),
                "contact2": ("", ""),
                "introducer": ha_sara,
                "admin_approved": False,
                "ha_approved": False,
            },
            {
                "user_key": "patient_patient_orphan",
                "first_name": "نرگس",
                "last_name": "مرادی",
                "father_name": "مراد",
                "national_code": "7777777777",
                "gender_idx": 1,
                "age": 41,
                "marital_status_idx": 0,
                "education_idx": 2,
                "job_status_idx": 0,
                "housing_status_idx": 1,
                "insurance_idx": 0,
                "phone_number": "09351234567",
                "landline_number": "",
                "province": "تهران",
                "city": "تهران",
                "address": "شهرری، خیابان فداییان اسلام",
                "sickness_description": "نیاز به پیگیری درمان بدون معرف",
                "contact1": ("زهرا مرادی", "09361234567"),
                "contact2": ("", ""),
                "introducer": None,
                "admin_approved": True,
                "ha_approved": True,
            },
        ]

        for info in specs:
            user = users[info["user_key"]]
            patient = Patient.objects.create(
                user=user,
                patient_code=generate_patient_code(),
                national_code=info["national_code"],
                first_name=info["first_name"],
                last_name=info["last_name"],
                father_name=info["father_name"],
                gender=lookups["genders"][info["gender_idx"]],
                age=info["age"],
                marital_status=lookups["marital_statuses"][info["marital_status_idx"]],
                head_household=True,
                number_dependents=2,
                family_status="خانواده کامل",
                education=lookups["educations"][info["education_idx"]],
                job_status=lookups["job_statuses"][info["job_status_idx"]],
                skill="تعمیر و نگهداری",
                housing_status=lookups["housing_statuses"][info["housing_status_idx"]],
                covered_organization=lookups["organizations"][0],
                phone_number=info["phone_number"],
                landline_number=info["landline_number"],
                province=info["province"],
                city=info["city"],
                address=info["address"],
                insurance=lookups["insurances"][info["insurance_idx"]],
                sickness_description=info["sickness_description"],
                contact1_full_name=info["contact1"][0],
                contact1_phone_number=info["contact1"][1],
                contact2_full_name=info["contact2"][0],
                contact2_phone_number=info["contact2"][1],
                introducer=info["introducer"],
                admin_approved=info["admin_approved"],
                ha_approved=info["ha_approved"],
            )
            user.state = bool(info["admin_approved"] and info["ha_approved"])
            user.save(update_fields=["state"])
            patients.append(patient)
            tag = "بدون معرف" if info["introducer"] is None else (
                "در انتظار تأیید" if not user.state else "فعال"
            )
            print(f"  ✓ Patient {info['first_name']} {info['last_name']} ({patient.patient_code}) — {tag}")

        return patients

    # ------------------------------------------------------------------
    # 6. BENEFACTORS
    # ------------------------------------------------------------------

    def create_benefactors(users, lookups):
        print("\n💰 Creating benefactor profiles...")
        benefactors = []
        for info in [
            {
                "user_key": "benefactor_benefactor_hassan",
                "first_name": "حسن",
                "last_name": "صالحی",
                "gender_idx": 0,
                "national_code": "1111111111",
                "phone_number": "09281234567",
                "province": "تهران",
                "city": "تهران",
            },
            {
                "user_key": "benefactor_benefactor_maryam",
                "first_name": "مریم",
                "last_name": "فرهادی",
                "gender_idx": 1,
                "national_code": "2222222222",
                "phone_number": "09291234567",
                "province": "اصفهان",
                "city": "اصفهان",
            },
        ]:
            b = Benefactor.objects.create(
                user=users[info["user_key"]],
                first_name=info["first_name"],
                last_name=info["last_name"],
                gender=lookups["genders"][info["gender_idx"]],
                national_code=info["national_code"],
                phone_number=info["phone_number"],
                province=info["province"],
                city=info["city"],
            )
            benefactors.append(b)
            print(f"  ✓ Benefactor: {info['first_name']} {info['last_name']} ({info['province']})")
        return benefactors

    # ------------------------------------------------------------------
    # 7. ORG APPLICATION
    # ------------------------------------------------------------------

    def create_organization_application(users):
        print("\n🏢 Creating organization application...")
        app = OrganizationApplication.objects.create(
            user=users["org_pending"],
            organization_role="charity_center",
            org_type="مرکز نیکوکاری",
            org_subtype="",
            name="مرکز نیکوکاری امید",
            province="تهران",
            city="تهران",
            payload={
                "director_name": "محسن امیدی",
                "phone": "09381234567",
                "description": "اسکان موقت بیماران و ویلچر",
            },
        )
        print(f"  ✓ Pending org application: {app.name}")
        return app

    # ------------------------------------------------------------------
    # 8. WALLETS
    # ------------------------------------------------------------------

    def create_wallets(users, doctors, health_assistants):
        print("\n🏦 Creating wallets...")
        for user in users.values():
            if user.role == "benefactor":
                get_or_create_benefactor_wallet(user)
                print(f"  ✓ Benefactor wallet: {user.first_name}")
        for doctor in doctors:
            get_or_create_staff_payout_wallet(doctor.user)
            print(f"  ✓ Staff payout: دکتر {doctor.first_name}")
        for ha in health_assistants:
            get_or_create_staff_payout_wallet(ha.user)
            print(f"  ✓ Staff payout: سلامتیار {ha.health_assistance_code}")
        get_or_create_platform_wallet()
        print("  ✓ Platform wallet")

    def seed_wallet_topups(users):
        print("\n💳 Seeding benefactor wallet top-ups...")
        for user in users.values():
            if user.role != "benefactor":
                continue
            wallet = get_or_create_benefactor_wallet(user)
            credit_wallet(
                wallet,
                SEED_TOPUP_AMOUNT,
                kind="topup",
                description="Seed top-up",
                created_by=user,
            )
            print(f"  ✓ Credited {SEED_TOPUP_AMOUNT:,} IRR → {user.first_name}")

    # ------------------------------------------------------------------
    # 9. CAMPAIGNS
    # ------------------------------------------------------------------

    def create_campaigns(users):
        print("\n📢 Creating campaigns...")
        campaigns = []
        for data in [
            {
                "title": "کمپین سرطان کودکان",
                "description": "جمع‌آوری کمک برای درمان کودکان مبتلا به سرطان",
                "target_amount": 500_000_000,
                "category": "درمانی",
                "urgency": "فوری",
                "creator_key": "doctor_dr_ali",
            },
            {
                "title": "کمپین جراحی قلب",
                "description": "کمک برای انجام جراحی‌های قلب در مناطق محروم",
                "target_amount": 300_000_000,
                "category": "جراحی",
                "urgency": "متوسط",
                "creator_key": "doctor_dr_zahra",
            },
        ]:
            campaign = Campaign.objects.create(
                title=data["title"],
                description=data["description"],
                target_amount=data["target_amount"],
                raised_amount=0,
                category=data["category"],
                urgency=data["urgency"],
                is_published=True,
                created_by=users[data["creator_key"]],
            )
            campaigns.append(campaign)
            print(f"  ✓ Campaign: {data['title']}")
        return campaigns

    # ------------------------------------------------------------------
    # 10. NETWORK REQUESTS
    # ------------------------------------------------------------------

    def log_status(request, status, note, actor):
        RequestStatusLog.objects.create(
            request=request,
            status=status,
            note=note,
            actor=actor,
        )

    def create_network_requests(users, patients, lookups, doctors, health_assistants):
        print("\n📋 Creating network requests...")
        reza, fatima, hasan, _pending, orphan = patients
        dr_ali, _dr_zahra = doctors
        ha_sara, ha_akbar = health_assistants
        network_requests = []

        # Pending medical — patient → doctor
        req = NetworkRequest.objects.create(
            patient=reza,
            created_by=users["patient_patient_reza"],
            request_type="consultation",
            request_subtype="visit",
            subject="وقت ویزیت تخصص داخلی",
            description="نیاز به ویزیت برای کنترل دیابت و فشار خون دارم.",
            specialty=lookups["specialties"][1],
            consultation_mode="حضوری",
            preferred_date="1404/04/20",
            preferred_time="10:00",
            status="pending",
        )
        log_status(req, "pending", "درخواست توسط بیمار ثبت شد", users["patient_patient_reza"])
        network_requests.append(req)
        print(f"  ✓ Pending medical (patient): {req.subject}")

        # Pending medical — HA → doctor
        req = NetworkRequest.objects.create(
            patient=hasan,
            created_by=users["health_assistant_ha_sara"],
            request_type="consultation",
            subject="جراحی عروق کرونر",
            description="بیمار سالمند نیاز به بررسی جراحی قلب دارد.",
            specialty=lookups["specialties"][1],
            doctor_name="دکتر علی محمدی",
            status="pending",
        )
        log_status(req, "pending", "درخواست توسط سلامتیار ثبت شد", users["health_assistant_ha_sara"])
        network_requests.append(req)
        print(f"  ✓ Pending medical (HA): {req.subject}")

        # In progress + funding need
        req = NetworkRequest.objects.create(
            patient=fatima,
            created_by=users["patient_patient_fatima"],
            request_type="consultation",
            subject="جراحی ستون فقرات",
            description="درد کمر شدید؛ پزشک نیاز به جراحی را بررسی کرده.",
            specialty=lookups["specialties"][0],
            status="in_progress",
            handled_by=dr_ali.user,
            fund_recipient=dr_ali.user,
            amount_needed=Decimal("12000000"),
            collected_amount=Decimal("0"),
            ha_approval_status="not_required",
        )
        log_status(
            req,
            "in_progress",
            "پزشک نیاز مالی ۱۲٬۰۰۰٬۰۰۰ تومان اعلام کرد — در انتظار حمایت نیکوکاران",
            dr_ali.user,
        )
        network_requests.append(req)
        print(f"  ✓ In-progress medical + funding: {req.subject}")

        # Completed medical (scheduled)
        req = NetworkRequest.objects.create(
            patient=reza,
            created_by=users["patient_patient_reza"],
            request_type="consultation",
            request_subtype="visit",
            subject="مشاوره تغذیه دیابت",
            description="نیاز به رژیم غذایی تخصصی برای دیابت.",
            specialty=lookups["specialties"][1],
            status="completed",
            handled_by=dr_ali.user,
            appointment_date="1404/04/10",
            appointment_time="15:30",
            appointment_place="کلینیک ولیعصر، طبقه ۳",
            appointment_phone="02188776655",
            confirmation_message=(
                "رضای عزیز، لطفاً ناشتا در ساعت ۱۵:۳۰ به کلینیک مراجعه کنید. "
                "مدارک آزمایش خون همراه داشته باشید."
            ),
        )
        log_status(req, "pending", "درخواست ثبت شد", users["patient_patient_reza"])
        log_status(req, "completed", req.confirmation_message, dr_ali.user)
        network_requests.append(req)
        print(f"  ✓ Completed medical (scheduled): {req.subject}")

        # Financial — HA → benefactors
        req = NetworkRequest.objects.create(
            patient=fatima,
            created_by=users["health_assistant_ha_akbar"],
            request_type="financial",
            subject="کمک هزینه آنژیوگرافی",
            description="بیمار برای آنژیوگرافی نیاز به کمک مالی دارد.",
            amount_needed=Decimal("5000000"),
            collected_amount=Decimal("0"),
            fund_recipient=ha_akbar.user,
            status="in_progress",
            expense_category="imaging",
        )
        log_status(req, "pending", "درخواست مالی ثبت شد", users["health_assistant_ha_akbar"])
        log_status(req, "in_progress", "در انتظار حمایت نیکوکاران", users["health_assistant_ha_akbar"])
        network_requests.append(req)
        print(f"  ✓ Financial (HA): {req.subject}")

        # Service — nursing
        req = NetworkRequest.objects.create(
            patient=hasan,
            created_by=users["patient_patient_hasan"],
            request_type="service",
            request_subtype="other",
            subject="خدمات پرستاری در منزل",
            description="بیمار سالمند نیاز به پرستار شبانه دارد.",
            needed_service="پرستاری شبانه‌روزی",
            status="pending",
            ha_approval_status="pending",
        )
        log_status(req, "pending", "درخواست خدمات ثبت شد", users["patient_patient_hasan"])
        network_requests.append(req)
        print(f"  ✓ Service (patient, HA approval pending): {req.subject}")

        # Accommodation subtype
        req = NetworkRequest.objects.create(
            patient=orphan,
            created_by=users["patient_patient_orphan"],
            request_type="service",
            request_subtype="accommodation",
            subject="رزرو اسکان موقت",
            description="نیاز به اسکان نزدیک مرکز درمانی برای ۳ شب.",
            companion_male_count=1,
            companion_female_count=1,
            status="pending",
            ha_approval_status="pending",
        )
        log_status(req, "pending", "درخواست اسکان ثبت شد", users["patient_patient_orphan"])
        network_requests.append(req)
        print(f"  ✓ Accommodation (بدون معرف): {req.subject}")

        # Expense subtype
        req = NetworkRequest.objects.create(
            patient=reza,
            created_by=users["patient_patient_reza"],
            request_type="service",
            request_subtype="expense",
            expense_category="medicine",
            subject="هزینه‌کرد داروهای دیابت",
            description="نیاز به تأمین هزینه داروهای ماهانه.",
            amount_needed=Decimal("800000"),
            status="pending",
            ha_approval_status="pending",
        )
        log_status(req, "pending", "درخواست هزینه‌کرد ثبت شد", users["patient_patient_reza"])
        network_requests.append(req)
        print(f"  ✓ Expense subtype: {req.subject}")

        # Regional need (no patient) + spawned campaign
        regional = NetworkRequest.objects.create(
            patient=None,
            created_by=users["health_assistant_ha_sara"],
            request_type="regional",
            subject="تجهیزات توانبخشی جنوب تهران",
            description="نیاز منطقه به ویلچر و واکر برای بیماران کم‌بضاعت.",
            amount_needed=Decimal("25000000"),
            collected_amount=Decimal("0"),
            fund_recipient=ha_sara.user,
            status="in_progress",
        )
        log_status(
            regional,
            "in_progress",
            "نیازمندی منطقه ثبت و کمپین عمومی ایجاد شد",
            users["health_assistant_ha_sara"],
        )
        network_requests.append(regional)
        regional_campaign = Campaign.objects.create(
            title="کمپین نیازمندی منطقه — توانبخشی جنوب تهران",
            description=regional.description,
            target_amount=regional.amount_needed,
            raised_amount=0,
            category="تجهیزات",
            urgency="متوسط",
            is_published=True,
            created_by=users["health_assistant_ha_sara"],
            source_request=regional,
        )
        print(f"  ✓ Regional request + campaign: {regional.subject} → {regional_campaign.title}")

        return network_requests

    # ------------------------------------------------------------------
    # 11. STAFF REQUESTS
    # ------------------------------------------------------------------

    def create_staff_requests(users, patients, health_assistants):
        print("\n📨 Creating staff requests (doctor → HA)...")
        ha_sara = health_assistants[0]
        req = StaffRequest.objects.create(
            created_by=users["doctor_dr_ali"],
            health_assistant=ha_sara,
            patient=patients[0],
            doctor_name="دکتر علی محمدی",
            subject="هماهنگی پیگیری بیمار دیابتی",
            description="لطفاً برای بیمار رضا کریمی نوبت آزمایش قند را پیگیری کنید.",
            amount_needed=None,
            status="pending",
        )
        print(f"  ✓ StaffRequest #{req.pk}: {req.subject}")
        return req

    # ------------------------------------------------------------------
    # 12. DONATIONS
    # ------------------------------------------------------------------

    def create_donations(users, campaigns, network_requests):
        print("\n🤝 Creating donations and pledge holds...")
        # Include campaigns spawned later (e.g. regional source_request).
        all_campaigns = list(Campaign.objects.all())
        campaign_by_title = {c.title: c for c in all_campaigns}
        request_by_subject = {r.subject: r for r in network_requests}

        donations_data = [
            {
                "benefactor_key": "benefactor_benefactor_hassan",
                "amount": 1_000_000,
                "destination_type": "general",
                "title": "کمک مالی عمومی",
                "description": "کمک عمومی به صندوق خیریه",
            },
            {
                "benefactor_key": "benefactor_benefactor_maryam",
                "amount": 2_000_000,
                "destination_type": "campaign",
                "campaign_title": "کمپین سرطان کودکان",
                "title": "کمک به کمپین سرطان کودکان",
                "description": "حمایت از درمان کودکان مبتلا به سرطان",
            },
            {
                "benefactor_key": "benefactor_benefactor_hassan",
                "amount": 4_000_000,
                "destination_type": "request",
                "request_subject": "جراحی ستون فقرات",
                "title": "حمایت از جراحی ستون فقرات",
                "description": "پرداخت بخشی از هزینه جراحی",
            },
            {
                "benefactor_key": "benefactor_benefactor_maryam",
                "amount": 1_500_000,
                "destination_type": "request",
                "request_subject": "کمک هزینه آنژیوگرافی",
                "title": "حمایت از آنژیوگرافی",
                "description": "کمک به درخواست مالی بیمار",
            },
            {
                "benefactor_key": "benefactor_benefactor_hassan",
                "amount": 3_000_000,
                "destination_type": "campaign",
                "campaign_title": "کمپین نیازمندی منطقه — توانبخشی جنوب تهران",
                "title": "حمایت از نیازمندی منطقه",
                "description": "کمک به کمپین منطقه‌ای توانبخشی",
            },
        ]

        for data in donations_data:
            benefactor = users[data["benefactor_key"]]
            kwargs = {
                "benefactor_user": benefactor,
                "amount": data["amount"],
                "destination_type": data["destination_type"],
                "title": data["title"],
                "description": data.get("description", ""),
            }
            if data["destination_type"] == "campaign":
                kwargs["campaign_id"] = campaign_by_title[data["campaign_title"]].pk
            elif data["destination_type"] == "request":
                kwargs["network_request_id"] = request_by_subject[data["request_subject"]].pk
            try:
                donate_from_wallet(**kwargs)
                print(f"  ✓ Donation: {data['title']} ({data['amount']:,} IRR)")
            except DonationError as exc:
                print(f"  ⚠ Skipped '{data['title']}': {exc}")

    def print_funding_status():
        print("\n✅ Funding snapshot...")
        for subject in (
            "کمک هزینه آنژیوگرافی",
            "جراحی ستون فقرات",
            "تجهیزات توانبخشی جنوب تهران",
        ):
            req = NetworkRequest.objects.filter(subject=subject).first()
            if not req:
                continue
            print(
                f"  • {subject}: {req.collected_amount or 0:,} / "
                f"{req.amount_needed or 0:,} IRR"
            )

    # ------------------------------------------------------------------
    # 13. PAYOUT ACCOUNTS + WITHDRAWALS
    # ------------------------------------------------------------------

    def create_payouts(users, health_assistants, doctors):
        print("\n🏧 Creating payout accounts and withdrawals...")
        ha_sara = health_assistants[0]
        dr_ali = doctors[0]

        # Credit some staff payout balance so a withdrawal can be requested
        ha_wallet = get_or_create_staff_payout_wallet(ha_sara.user)
        credit_wallet(
            ha_wallet,
            Decimal("2000000"),
            kind="disbursement",
            description="Seed staff payout credit",
            created_by=users["admin"],
        )

        PayoutAccount.objects.create(
            user=ha_sara.user,
            sheba="IR120170000000123456789001",
            account_holder_name="سارا حسنی",
            bank_name="ملی",
        )
        PayoutAccount.objects.create(
            user=dr_ali.user,
            sheba="IR890120000000987654321001",
            account_holder_name="علی محمدی",
            bank_name="ملت",
        )
        print("  ✓ Payout accounts for HA سارا and دکتر علی")

        wd = WithdrawalRequest.objects.create(
            user=ha_sara.user,
            amount=Decimal("500000"),
            sheba="IR120170000000123456789001",
            account_holder_name="سارا حسنی",
            bank_name="ملی",
            status="pending",
            note="درخواست تسویه آزمایشی",
        )
        print(f"  ✓ Pending withdrawal #{wd.pk}: {wd.amount:,} IRR")

        # One already-paid example for admin history
        paid = WithdrawalRequest.objects.create(
            user=ha_sara.user,
            amount=Decimal("200000"),
            sheba="IR120170000000123456789001",
            account_holder_name="سارا حسنی",
            bank_name="ملی",
            status="paid",
            note="پرداخت شده (seed)",
            reviewed_by=users["admin"],
            reviewed_at=timezone.now(),
        )
        print(f"  ✓ Paid withdrawal #{paid.pk}: {paid.amount:,} IRR")

    # ------------------------------------------------------------------
    # MAIN
    # ------------------------------------------------------------------

    print("\n" + "=" * 70)
    print("🚀 DATABASE RESET + POPULATION")
    print("=" * 70)

    try:
        clear_database()
        lookups = create_lookups()
        users = create_users()
        doctors = create_doctors(users, lookups)
        health_assistants = create_health_assistants(users, lookups)
        link_doctors_to_health_assistants(doctors, health_assistants)
        patients = create_patients(users, lookups, health_assistants)
        create_benefactors(users, lookups)
        create_organization_application(users)
        create_wallets(users, doctors, health_assistants)
        campaigns = create_campaigns(users)
        network_requests = create_network_requests(
            users, patients, lookups, doctors, health_assistants
        )
        create_staff_requests(users, patients, health_assistants)
        seed_wallet_topups(users)
        create_donations(users, campaigns, network_requests)
        print_funding_status()
        create_payouts(users, health_assistants, doctors)

        holds = DonationHold.objects.filter(status="held").count()
        payout_total = sum(
            int(w.cached_balance)
            for w in Wallet.objects.filter(wallet_type="staff_payout")
        )

        print("\n" + "=" * 70)
        print("✅ DATABASE POPULATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("\n📊 Summary:")
        print(f"  • Users: {CustomUser.objects.exclude(role='admin').count()}")
        print(f"  • Doctors: {Doctor.objects.count()}")
        print(f"  • Patients: {Patient.objects.count()} (1 pending dual approval, 1 بدون معرف)")
        print(f"  • Benefactors: {Benefactor.objects.count()}")
        print(f"  • Health Assistants: {HealthAssistant.objects.count()}")
        for ha in health_assistants:
            print(f"      → {ha.health_assistance_code}")
        print(f"  • Org applications: {OrganizationApplication.objects.count()}")
        print(f"  • Wallets: {Wallet.objects.count()}")
        print(f"  • Active donation holds: {holds}")
        print(f"  • Staff payout balance (total): {payout_total:,} IRR")
        print(f"  • Network requests: {NetworkRequest.objects.count()}")
        print(f"  • Staff requests: {StaffRequest.objects.count()}")
        print(f"  • Campaigns: {Campaign.objects.count()}")
        print(f"  • Donations: {BenefactorDonation.objects.count()}")
        print(f"  • Payout accounts: {PayoutAccount.objects.count()}")
        print(f"  • Withdrawals: {WithdrawalRequest.objects.count()}")
        print("\n🧪 Seeded scenarios:")
        print("  • HA سارا: elevated *_all + global search permissions")
        print("  • Patient نرگس مرادی: بدون معرف (claimable orphan)")
        print("  • Regional need + linked campaign")
        print("  • Patient subtypes: اسکان / هزینه‌کرد / ویزیت")
        print("  • StaffRequest doctor→HA + pending/paid withdrawals")
        print("  • Pending charity_center OrganizationApplication")
        print(f"\n🔑 Password (all seed users): {DEFAULT_PASSWORD}")
        print(f"🔑 Admin phone: {ADMIN_PHONE}")

    except Exception as exc:
        print(f"\n❌ ERROR: {exc}")
        import traceback

        traceback.print_exc()
        raise SystemExit(1) from exc


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    _bootstrap_django()

main()
