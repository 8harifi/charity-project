"""
Django script to populate the database with sample data for testing.

Covers current product flows:
  - Medical requests (patient / HA → doctor review, schedule, or funding)
  - Financial requests (HA / doctor → benefactor pledges → staff payout wallet)
  - Patient گردش کار (multiple requests per patient)
  - Dual approval (admin + HA) for self-registered patients with HA code
  - Benefactor wallet top-ups and donation holds

Run with either:
  python3 manage.py shell < populate_db.py
  python3 populate_db.py
"""

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
        OrganizationHealthAssistant,
        Patient,
        RequestStatusLog,
        Wallet,
        WalletTransaction,
    )
    from api.services.donation_service import DonationError, donate_from_wallet
    from api.services.wallet_service import (
        credit_wallet,
        get_or_create_benefactor_wallet,
        get_or_create_platform_wallet,
        get_or_create_staff_payout_wallet,
    )

    print("🔄 Starting database population...")

    # ============================================================================
    # 1. LOOKUP DATA
    # ============================================================================

    def create_lookups():
        print("\n📋 Ensuring canonical lookup data...")
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

    # ============================================================================
    # 2. USERS
    # ============================================================================

    def ensure_password(user):
        user.set_password(DEFAULT_PASSWORD)
        user.save(update_fields=["password"])

    def create_users():
        print("\n👥 Creating users...")

        users = {}

        for data in [
            {
                "user_key": "doctor_dr_ali",
                "phone": "09111234567",
                "role": "doctor",
                "first_name": "علی",
                "last_name": "محمدی",
                "email": "dr.ali@charity.local",
            },
            {
                "user_key": "doctor_dr_zahra",
                "phone": "09121234567",
                "role": "doctor",
                "first_name": "زهرا",
                "last_name": "احمدی",
                "email": "dr.zahra@charity.local",
            },
            {
                "user_key": "patient_patient_reza",
                "phone": "09191234567",
                "role": "patient",
                "first_name": "رضا",
                "last_name": "کریمی",
                "email": "reza@charity.local",
                "state": True,
            },
            {
                "user_key": "patient_patient_fatima",
                "phone": "09221234567",
                "role": "patient",
                "first_name": "فاطمه",
                "last_name": "علی‌پور",
                "email": "fatima@charity.local",
                "state": True,
            },
            {
                "user_key": "patient_patient_hasan",
                "phone": "09251234567",
                "role": "patient",
                "first_name": "حسن",
                "last_name": "حسنی",
                "email": "hasan@charity.local",
                "state": True,
            },
            {
                "user_key": "patient_patient_pending",
                "phone": "09301234567",
                "role": "patient",
                "first_name": "امیر",
                "last_name": "رضایی",
                "email": "amir@charity.local",
                "state": False,
            },
            {
                "user_key": "benefactor_benefactor_hassan",
                "phone": "09281234567",
                "role": "benefactor",
                "first_name": "حسن",
                "last_name": "صالحی",
                "email": "hassan@charity.local",
            },
            {
                "user_key": "benefactor_benefactor_maryam",
                "phone": "09291234567",
                "role": "benefactor",
                "first_name": "مریم",
                "last_name": "فرهادی",
                "email": "maryam@charity.local",
            },
            {
                "user_key": "health_assistant_ha_sara",
                "phone": "09131234567",
                "role": "health_assistant",
                "first_name": "سارا",
                "last_name": "حسنی",
                "email": "sara@charity.local",
            },
            {
                "user_key": "health_assistant_ha_akbar",
                "phone": "09141234567",
                "role": "health_assistant",
                "first_name": "اکبر",
                "last_name": "محمدی",
                "email": "akbar@charity.local",
            },
        ]:
            user, created = CustomUser.objects.get_or_create(
                username=data["phone"],
                defaults={
                    "email": data["email"],
                    "role": data["role"],
                    "state": data.get("state", True),
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                },
            )
            if not created and "state" in data:
                user.state = data["state"]
                user.save(update_fields=["state"])
            ensure_password(user)
            users[data["user_key"]] = user
            if created:
                print(f"  ✓ Created {data['role']} user: {data['phone']}")

        admin_user, created = CustomUser.objects.get_or_create(
            username=ADMIN_PHONE,
            defaults={
                "email": "admin@charity.local",
                "role": "admin",
                "state": True,
                "first_name": "مدیر",
                "last_name": "سیستم",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        ensure_password(admin_user)
        users["admin"] = admin_user
        if created:
            print(f"  ✓ Created Admin user: {ADMIN_PHONE}")

        AdminProfile.objects.get_or_create(
            user=admin_user,
            defaults={
                "first_name": "مدیر",
                "last_name": "سیستم",
                "phone_number": ADMIN_PHONE,
            },
        )

        return users

    # ============================================================================
    # 3. DOCTOR PROFILES
    # ============================================================================

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
            doctor, created = Doctor.objects.get_or_create(
                user=users[info["user_key"]],
                defaults={
                    "first_name": info["first_name"],
                    "last_name": info["last_name"],
                    "father_name": info["father_name"],
                    "gender": lookups["genders"][0],
                    "national_code": info["national_code"],
                    "medical_system_code": info["medical_system_code"],
                    "phone_number": info["phone_number"],
                    "specialty": lookups["specialties"][info["specialty_idx"]],
                    "province": info["province"],
                    "city": info["city"],
                    "address": info["address"],
                },
            )
            doctors.append(doctor)
            if created:
                print(f"  ✓ Created Doctor: {info['first_name']} {info['last_name']}")

        return doctors

    def link_doctors_to_health_assistants(doctors, health_assistants):
        """Each doctor cooperates with one HA so incoming requests map realistically."""
        print("\n🔗 Linking doctors to health assistants...")
        dr_ali, dr_zahra = doctors
        ha_sara, ha_akbar = health_assistants
        dr_ali.cooperating_health_assistants.set([ha_sara])
        dr_zahra.cooperating_health_assistants.set([ha_akbar])
        print(f"  ✓ دکتر علی ↔ سلامتیار {ha_sara.health_assistance_code}")
        print(f"  ✓ دکتر زهرا ↔ سلامتیار {ha_akbar.health_assistance_code}")

    # ============================================================================
    # 4. HEALTH ASSISTANT PROFILES
    # ============================================================================

    def create_health_assistants(users, lookups):
        print("\n👩‍⚕️ Creating health assistant profiles...")

        health_assistants = []
        for info in [
            {
                "user_key": "health_assistant_ha_sara",
                "cooperation_type_idx": 0,
                "is_individual": True,
                "first_name": "سارا",
                "last_name": "حسنی",
                "father_name": "حسن",
                "national_code": "0111223344",
                "phone_number": "09131234567",
                "education_idx": 3,
                "job": "پرستار",
                "province": "تهران",
                "city": "تهران",
                "home_address": "خیابان شریعتی",
                "work_address": "کلینیک درمانی شریعتی",
            },
            {
                "user_key": "health_assistant_ha_akbar",
                "cooperation_type_idx": 1,
                "is_individual": False,
                "organization_type_idx": 0,
                "org_name": "بیمارستان امام خمینی",
                "director_first_name": "کاظم",
                "director_last_name": "کریمی",
                "director_phone_number": "09141234567",
                "director_landline_number": "02122222222",
                "province": "تهران",
                "city": "تهران",
                "address": "خیابان ولیعصر، بیمارستان امام خمینی",
                "social_unit_head_first_name": "فاطمه",
                "social_unit_head_last_name": "حسینی",
                "social_unit_head_phone_number": "09151234567",
                "social_unit_head_landline_number": "02133333333",
            },
        ]:
            ha, created = HealthAssistant.objects.get_or_create(
                user=users[info["user_key"]],
                defaults={
                    "health_assistance_code": f"HA{users[info['user_key']].id:05d}",
                    "cooperation_type": lookups["cooperation_types"][
                        info["cooperation_type_idx"]
                    ],
                    "cooperation_description": "تعاون در ارائه خدمات درمانی",
                },
            )
            if not ha.health_assistance_code:
                ha.health_assistance_code = f"HA{users[info['user_key']].id:05d}"
                ha.save(update_fields=["health_assistance_code"])
            health_assistants.append(ha)
            if created:
                print(
                    f"  ✓ Created Health Assistant: {users[info['user_key']].first_name} "
                    f"({ha.health_assistance_code})"
                )

            if info.get("is_individual"):
                IndividualHealthAssistant.objects.get_or_create(
                    health_assistant=ha,
                    defaults={
                        "first_name": info["first_name"],
                        "last_name": info["last_name"],
                        "gender": lookups["genders"][1],
                        "national_code": info["national_code"],
                        "phone_number": info["phone_number"],
                        "education": lookups["educations"][info["education_idx"]],
                        "job": info["job"],
                        "province": info["province"],
                        "city": info["city"],
                        "home_address": info["home_address"],
                        "work_address": info["work_address"],
                    },
                )
            else:
                OrganizationHealthAssistant.objects.get_or_create(
                    health_assistant=ha,
                    defaults={
                        "organization_type": lookups["org_types"][
                            info["organization_type_idx"]
                        ],
                        "name": info["org_name"],
                        "director_first_name": info["director_first_name"],
                        "director_last_name": info["director_last_name"],
                        "director_phone_number": info["director_phone_number"],
                        "director_landline_number": info["director_landline_number"],
                        "province": info["province"],
                        "city": info["city"],
                        "address": info["address"],
                        "social_unit_head_first_name": info["social_unit_head_first_name"],
                        "social_unit_head_last_name": info["social_unit_head_last_name"],
                        "social_unit_head_phone_number": info[
                            "social_unit_head_phone_number"
                        ],
                        "social_unit_head_landline_number": info[
                            "social_unit_head_landline_number"
                        ],
                    },
                )

        return health_assistants

    # ============================================================================
    # 5. PATIENT PROFILES
    # ============================================================================

    def create_patients(users, lookups, health_assistants):
        print("\n🏥 Creating patient profiles...")

        patients = []
        ha_sara, ha_akbar = health_assistants

        for info in [
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
                "insurance_idx": 5,
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
        ]:
            user = users[info["user_key"]]
            patient, created = Patient.objects.update_or_create(
                user=user,
                defaults={
                    "patient_code": f"PAT{user.id:06d}",
                    "national_code": info["national_code"],
                    "first_name": info["first_name"],
                    "last_name": info["last_name"],
                    "father_name": info["father_name"],
                    "gender": lookups["genders"][info["gender_idx"]],
                    "age": info["age"],
                    "marital_status": lookups["marital_statuses"][
                        info["marital_status_idx"]
                    ],
                    "head_household": True,
                    "number_dependents": 2,
                    "family_status": "خانواده کامل",
                    "education": lookups["educations"][info["education_idx"]],
                    "job_status": lookups["job_statuses"][info["job_status_idx"]],
                    "skill": "تعمیر و نگهداری",
                    "housing_status": lookups["housing_statuses"][
                        info["housing_status_idx"]
                    ],
                    "covered_organization": lookups["organizations"][0],
                    "phone_number": info["phone_number"],
                    "landline_number": info["landline_number"],
                    "province": info["province"],
                    "city": info["city"],
                    "address": info["address"],
                    "insurance": lookups["insurances"][info["insurance_idx"]],
                    "sickness_description": info["sickness_description"],
                    "contact1_full_name": info["contact1"][0],
                    "contact1_phone_number": info["contact1"][1],
                    "contact2_full_name": info["contact2"][0],
                    "contact2_phone_number": info["contact2"][1],
                    "introducer": info["introducer"],
                    "admin_approved": info["admin_approved"],
                    "ha_approved": info["ha_approved"],
                },
            )
            patients.append(patient)
            user.state = info["admin_approved"] and info["ha_approved"]
            user.save(update_fields=["state"])
            if created:
                print(
                    f"  ✓ Created Patient: {info['first_name']} {info['last_name']} "
                    f"({patient.patient_code})"
                )

        return patients

    # ============================================================================
    # 6. BENEFACTOR PROFILES
    # ============================================================================

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
            },
            {
                "user_key": "benefactor_benefactor_maryam",
                "first_name": "مریم",
                "last_name": "فرهادی",
                "gender_idx": 1,
                "national_code": "2222222222",
                "phone_number": "09291234567",
            },
        ]:
            benefactor, created = Benefactor.objects.get_or_create(
                user=users[info["user_key"]],
                defaults={
                    "first_name": info["first_name"],
                    "last_name": info["last_name"],
                    "gender": lookups["genders"][info["gender_idx"]],
                    "national_code": info["national_code"],
                    "phone_number": info["phone_number"],
                },
            )
            benefactors.append(benefactor)
            if created:
                print(f"  ✓ Created Benefactor: {info['first_name']} {info['last_name']}")

        return benefactors

    # ============================================================================
    # 7. WALLETS
    # ============================================================================

    def create_wallets(users, patients, doctors, health_assistants):
        print("\n🏦 Creating wallets...")

        for user in users.values():
            if user.role == "benefactor":
                get_or_create_benefactor_wallet(user)
                print(f"  ✓ Benefactor wallet: {user.first_name}")

        for doctor in doctors:
            get_or_create_staff_payout_wallet(doctor.user)
            print(f"  ✓ Staff payout wallet: دکتر {doctor.first_name}")

        for ha in health_assistants:
            get_or_create_staff_payout_wallet(ha.user)
            print(f"  ✓ Staff payout wallet: سلامتیار {ha.health_assistance_code}")

        get_or_create_platform_wallet()
        print("  ✓ Platform wallet")

    def seed_wallet_topups(users):
        print("\n💳 Seeding benefactor wallet top-ups...")

        for user in users.values():
            if user.role != "benefactor":
                continue
            wallet = get_or_create_benefactor_wallet(user)
            if WalletTransaction.objects.filter(
                wallet=wallet, kind="topup", description="Seed top-up"
            ).exists():
                continue
            credit_wallet(
                wallet,
                SEED_TOPUP_AMOUNT,
                kind="topup",
                description="Seed top-up",
                created_by=user,
            )
            print(f"  ✓ Credited {SEED_TOPUP_AMOUNT:,} IRR → {user.first_name}")

    # ============================================================================
    # 8. CAMPAIGNS
    # ============================================================================

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
            campaign, created = Campaign.objects.get_or_create(
                title=data["title"],
                defaults={
                    "description": data["description"],
                    "target_amount": data["target_amount"],
                    "raised_amount": 0,
                    "category": data["category"],
                    "urgency": data["urgency"],
                    "is_published": True,
                    "created_by": users[data["creator_key"]],
                },
            )
            campaigns.append(campaign)
            if created:
                print(f"  ✓ Campaign: {data['title']}")

        return campaigns

    # ============================================================================
    # 9. NETWORK REQUESTS (medical workflow + financial + service)
    # ============================================================================

    def log_status(request, status, note, actor):
        RequestStatusLog.objects.get_or_create(
            request=request,
            status=status,
            note=note,
            defaults={"actor": actor},
        )

    def upsert_request(patient, subject, created_by, **fields):
        req, created = NetworkRequest.objects.update_or_create(
            patient=patient,
            subject=subject,
            defaults={"created_by": created_by, **fields},
        )
        return req, created

    def create_network_requests(users, patients, lookups, doctors, health_assistants):
        print("\n📋 Creating network requests (medical workflow + financial)...")

        reza, fatima, hasan = patients[0], patients[1], patients[2]
        dr_ali, dr_zahra = doctors
        ha_sara, ha_akbar = health_assistants
        network_requests = []

        # --- Pending medical: patient → doctor inbox ---
        req, created = upsert_request(
            reza,
            "وقت ویزیت تخصص داخلی",
            users["patient_patient_reza"],
            request_type="consultation",
            description="نیاز به ویزیت برای کنترل دیابت و فشار خون دارم.",
            specialty=lookups["specialties"][1],
            consultation_mode="حضوری",
            preferred_date="1404/04/20",
            preferred_time="10:00",
            status="pending",
            handled_by=None,
            amount_needed=None,
            collected_amount=0,
        )
        if created:
            log_status(req, "pending", "درخواست توسط بیمار ثبت شد", users["patient_patient_reza"])
        network_requests.append(req)
        print(f"  ✓ Pending medical (patient): {req.subject}")

        # --- Pending medical: HA → doctor inbox ---
        req, created = upsert_request(
            hasan,
            "جراحی عروق کرونر",
            users["health_assistant_ha_sara"],
            request_type="consultation",
            description="بیمار سالمند نیاز به بررسی جراحی قلب دارد.",
            specialty=lookups["specialties"][1],
            status="pending",
            handled_by=None,
        )
        if created:
            log_status(req, "pending", "درخواست توسط سلامتیار ثبت شد", users["health_assistant_ha_sara"])
        network_requests.append(req)
        print(f"  ✓ Pending medical (HA): {req.subject}")

        # --- In progress + partial funding: doctor flagged need ---
        req, created = upsert_request(
            fatima,
            "جراحی ستون فقرات",
            users["patient_patient_fatima"],
            request_type="consultation",
            description="درد کمر شدید؛ پزشک نیاز به جراحی را بررسی کرده.",
            specialty=lookups["specialties"][0],
            status="in_progress",
            handled_by=dr_ali.user,
            fund_recipient=dr_ali.user,
            amount_needed=Decimal("12_000_000"),
        )
        if created:
            req.collected_amount = Decimal("0")
            req.save(update_fields=["collected_amount"])
        log_status(
            req,
            "in_progress",
            "پزشک نیاز مالی ۱۲٬۰۰۰٬۰۰۰ تومان اعلام کرد — در انتظار حمایت نیکوکاران",
            dr_ali.user,
        )
        network_requests.append(req)
        print(f"  ✓ In-progress medical + funding: {req.subject}")

        # --- Completed medical: doctor scheduled directly ---
        req, created = upsert_request(
            reza,
            "مشاوره تغذیه دیابت",
            users["patient_patient_reza"],
            request_type="consultation",
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
        if created:
            log_status(req, "pending", "درخواست ثبت شد", users["patient_patient_reza"])
            log_status(req, "completed", req.confirmation_message, dr_ali.user)
        network_requests.append(req)
        print(f"  ✓ Completed medical (scheduled): {req.subject}")

        # --- Financial request: HA → benefactors ---
        req, created = upsert_request(
            fatima,
            "کمک هزینه آنژیوگرافی",
            users["health_assistant_ha_akbar"],
            request_type="financial",
            description="بیمار برای آنژیوگرافی نیاز به کمک مالی دارد.",
            amount_needed=Decimal("5_000_000"),
            fund_recipient=ha_akbar.user,
            status="in_progress",
            handled_by=None,
        )
        if created:
            req.collected_amount = Decimal("0")
            req.save(update_fields=["collected_amount"])
        if created:
            log_status(req, "pending", "درخواست مالی ثبت شد", users["health_assistant_ha_akbar"])
            log_status(req, "in_progress", "در انتظار حمایت نیکوکاران", users["health_assistant_ha_akbar"])
        network_requests.append(req)
        print(f"  ✓ Financial (HA): {req.subject}")

        # --- Service request: patient ---
        req, created = upsert_request(
            hasan,
            "خدمات پرستاری در منزل",
            users["patient_patient_hasan"],
            request_type="service",
            description="بیمار سالمند نیاز به پرستار شبانه دارد.",
            needed_service="پرستاری شبانه‌روزی",
            status="pending",
        )
        if created:
            log_status(req, "pending", "درخواست خدمات ثبت شد", users["patient_patient_hasan"])
        network_requests.append(req)
        print(f"  ✓ Service (patient): {req.subject}")

        return network_requests

    # ============================================================================
    # 10. DONATIONS & HOLDS
    # ============================================================================

    def create_donations(users, campaigns, network_requests):
        print("\n🤝 Creating donations and pledge holds...")

        campaign_by_title = {c.title: c for c in campaigns}
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
        ]

        for data in donations_data:
            benefactor = users[data["benefactor_key"]]
            title = data["title"]
            if BenefactorDonation.objects.filter(
                benefactor=benefactor,
                title=title,
                destination_type=data["destination_type"],
            ).exists():
                print(f"  ↷ Donation already exists: {title}")
                continue

            kwargs = {
                "benefactor_user": benefactor,
                "amount": data["amount"],
                "destination_type": data["destination_type"],
                "title": title,
                "description": data.get("description", ""),
            }
            if data["destination_type"] == "campaign":
                kwargs["campaign_id"] = campaign_by_title[data["campaign_title"]].pk
            elif data["destination_type"] == "request":
                kwargs["network_request_id"] = request_by_subject[
                    data["request_subject"]
                ].pk

            try:
                donate_from_wallet(**kwargs)
                print(f"  ✓ Donation: {title} ({data['amount']:,} IRR)")
            except DonationError as exc:
                print(f"  ⚠ Skipped '{title}': {exc}")

    def complete_funded_request(users):
        """Demonstrate partial funding state (full close optional in app)."""
        print("\n✅ Checking funded requests...")

        req = NetworkRequest.objects.filter(subject="کمک هزینه آنژیوگرافی").first()
        if not req:
            return

        needed = req.amount_needed or Decimal("0")
        collected = req.collected_amount or Decimal("0")
        print(
            f"  • آنژیوگرافی: {collected:,} / {needed:,} IRR pledged "
            f"({'partial' if collected < needed else 'fully funded'})"
        )

        spine = NetworkRequest.objects.filter(subject="جراحی ستون فقرات").first()
        if spine:
            print(
                f"  • جراحی ستون فقرات: {spine.collected_amount or 0:,} / "
                f"{spine.amount_needed or 0:,} IRR (doctor can confirm at partial funding)"
            )

    # ============================================================================
    # MAIN
    # ============================================================================

    print("\n" + "=" * 70)
    print("🚀 DATABASE POPULATION SCRIPT")
    print("=" * 70)

    try:
        lookups = create_lookups()
        users = create_users()
        doctors = create_doctors(users, lookups)
        health_assistants = create_health_assistants(users, lookups)
        link_doctors_to_health_assistants(doctors, health_assistants)
        patients = create_patients(users, lookups, health_assistants)
        create_benefactors(users, lookups)
        create_wallets(users, patients, doctors, health_assistants)
        campaigns = create_campaigns(users)
        network_requests = create_network_requests(
            users, patients, lookups, doctors, health_assistants
        )
        seed_wallet_topups(users)
        create_donations(users, campaigns, network_requests)
        complete_funded_request(users)

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
        print(f"  • Patients: {Patient.objects.count()} (1 pending dual approval)")
        print(f"  • Benefactors: {Benefactor.objects.count()}")
        print(f"  • Health Assistants: {HealthAssistant.objects.count()}")
        for ha in health_assistants:
            print(f"      → {ha.health_assistance_code}")
        print(f"  • Wallets: {Wallet.objects.count()}")
        print(f"  • Active donation holds: {holds}")
        print(f"  • Staff payout balance (total): {payout_total:,} IRR")
        print(f"  • Network requests: {NetworkRequest.objects.count()}")
        print(f"  • Donations: {BenefactorDonation.objects.count()}")
        print("\n🧪 Test scenarios seeded:")
        print("  • Doctor علی: incoming requests from سلامتیار سارا patients")
        print("  • Doctor زهرا: incoming from سلامتیار اکبر patients")
        print("  • Partial funding on «جراحی ستون فقرات» (doctor flagged)")
        print("  • Completed schedule on «مشاوره تغذیه دیابت»")
        print("  • Patient امیر رضایی: pending admin + HA approval (HA code signup)")
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
