"""
Django shell script to populate the database with sample data for testing
Run with: python manage.py shell < populate_db.py
"""

from django.contrib.auth import get_user_model
from api.models import (
    CustomUser,
    Doctor,
    Patient,
    Benefactor,
    HealthAssistant,
    IndividualHealthAssistant,
    OrganizationHealthAssistant,
    Gender,
    MaritalStatus,
    Education,
    JobStatus,
    HousingStatus,
    CoveredOrganization,
    Insurance,
    Specialty,
    HealthAssistantCooperationType,
    OrganizationType,
    NetworkRequest,
    BenefactorDonation,
    Campaign,
    Wallet,
    WalletTransaction,
    GatewayPayment,
)

print("🔄 Starting database population...")

# ============================================================================
# 1. CREATE LOOKUP DATA (Dependencies)
# ============================================================================

def create_lookups():
    print("\n📋 Creating lookup data...")

    genders = []
    for name in ["مرد", "زن"]:
        gender, created = Gender.objects.get_or_create(name=name)
        genders.append(gender)
        if created:
            print(f"  ✓ Created Gender: {name}")

    marital_statuses = []
    for name in ["مجرد", "متاهل", "مطلقه", "بیوه"]:
        status, created = MaritalStatus.objects.get_or_create(name=name)
        marital_statuses.append(status)
        if created:
            print(f"  ✓ Created MaritalStatus: {name}")

    educations = []
    for name in ["بیسواد", "ابتدایی", "راهنمایی", "دبیرستان", "کارشناسی", "کارشناسی ارشد", "دکتری"]:
        education, created = Education.objects.get_or_create(name=name)
        educations.append(education)
        if created:
            print(f"  ✓ Created Education: {name}")

    job_statuses = []
    for name in ["بیکار", "کارمند دولتی", "کارمند خصوصی", "خودروز", "بازنشسته", "دانشجو"]:
        status, created = JobStatus.objects.get_or_create(name=name)
        job_statuses.append(status)
        if created:
            print(f"  ✓ Created JobStatus: {name}")

    housing_statuses = []
    for name in ["مالک", "اجاره‌ای", "رایگان"]:
        status, created = HousingStatus.objects.get_or_create(name=name)
        housing_statuses.append(status)
        if created:
            print(f"  ✓ Created HousingStatus: {name}")

    organizations = []
    for name in ["تامین اجتماعی", "سلامت", "آموزش"]:
        org, created = CoveredOrganization.objects.get_or_create(name=name)
        organizations.append(org)
        if created:
            print(f"  ✓ Created CoveredOrganization: {name}")

    insurances = []
    for name in ["دولتی", "خصوصی", "تامین اجتماعی", "بیمه نیروهای مسلح"]:
        insurance, created = Insurance.objects.get_or_create(name=name)
        insurances.append(insurance)
        if created:
            print(f"  ✓ Created Insurance: {name}")

    specialties = []
    for name in ["پزشک عمومی", "اطفال", "قلب", "جراحی", "روانشناسی", "دندانپزشکی"]:
        specialty, created = Specialty.objects.get_or_create(name=name)
        specialties.append(specialty)
        if created:
            print(f"  ✓ Created Specialty: {name}")

    cooperation_types = []
    for name in ["فردی", "سازمانی"]:
        coop, created = HealthAssistantCooperationType.objects.get_or_create(name=name)
        cooperation_types.append(coop)
        if created:
            print(f"  ✓ Created HealthAssistantCooperationType: {name}")

    org_types = []
    for name in ["بیمارستان", "کلینیک", "پزشکی خانواده", "سازمان خدماتی"]:
        org_type, created = OrganizationType.objects.get_or_create(name=name)
        org_types.append(org_type)
        if created:
            print(f"  ✓ Created OrganizationType: {name}")

    return {
        'genders': genders,
        'marital_statuses': marital_statuses,
        'educations': educations,
        'job_statuses': job_statuses,
        'housing_statuses': housing_statuses,
        'organizations': organizations,
        'insurances': insurances,
        'specialties': specialties,
        'cooperation_types': cooperation_types,
        'org_types': org_types,
    }

# ============================================================================
# 2. CREATE USERS
# ============================================================================

def create_users():
    print("\n👥 Creating users...")

    users = {}

    # Doctors
    doctor_data = [
        {"username": "dr_ali", "first_name": "علی", "last_name": "محمدی", "email": "dr.ali@charity.local"},
        {"username": "dr_zahra", "first_name": "زهرا", "last_name": "احمدی", "email": "dr.zahra@charity.local"},
    ]

    for data in doctor_data:
        user, created = CustomUser.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": data["email"],
                "role": "doctor",
                "state": True,
                "first_name": data["first_name"],
                "last_name": data["last_name"],
            }
        )
        users[f"doctor_{data['username']}"] = user
        if created:
            print(f"  ✓ Created Doctor user: {data['username']}")

    # Patients
    patient_data = [
        {"username": "patient_reza", "first_name": "رضا", "last_name": "کریمی", "email": "reza@charity.local"},
        {"username": "patient_fatima", "first_name": "فاطمه", "last_name": "علی‌پور", "email": "fatima@charity.local"},
        {"username": "patient_hasan", "first_name": "حسن", "last_name": "حسنی", "email": "hasan@charity.local"},
    ]

    for data in patient_data:
        user, created = CustomUser.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": data["email"],
                "role": "patient",
                "state": True,
                "first_name": data["first_name"],
                "last_name": data["last_name"],
            }
        )
        users[f"patient_{data['username']}"] = user
        if created:
            print(f"  ✓ Created Patient user: {data['username']}")

    # Benefactors
    benefactor_data = [
        {"username": "benefactor_hassan", "first_name": "حسن", "last_name": "صالحی", "email": "hassan@charity.local"},
        {"username": "benefactor_maryam", "first_name": "مریم", "last_name": "فرهادی", "email": "maryam@charity.local"},
    ]

    for data in benefactor_data:
        user, created = CustomUser.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": data["email"],
                "role": "benefactor",
                "state": True,
                "first_name": data["first_name"],
                "last_name": data["last_name"],
            }
        )
        users[f"benefactor_{data['username']}"] = user
        if created:
            print(f"  ✓ Created Benefactor user: {data['username']}")

    # Health Assistants
    ha_data = [
        {"username": "ha_sara", "first_name": "سارا", "last_name": "حسنی", "email": "sara@charity.local"},
        {"username": "ha_akbar", "first_name": "اکبر", "last_name": "محمدی", "email": "akbar@charity.local"},
    ]

    for data in ha_data:
        user, created = CustomUser.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": data["email"],
                "role": "health_assistant",
                "state": True,
                "first_name": data["first_name"],
                "last_name": data["last_name"],
            }
        )
        users[f"health_assistant_{data['username']}"] = user
        if created:
            print(f"  ✓ Created Health Assistant user: {data['username']}")

    return users

# ============================================================================
# 3. CREATE DOCTOR PROFILES
# ============================================================================

def create_doctors(users, lookups):
    print("\n👨‍⚕️ Creating doctor profiles...")

    doctors = []

    doctor_info = [
        {
            "user_key": "doctor_dr_ali",
            "first_name": "علی",
            "last_name": "محمدی",
            "father_name": "محمد",
            "national_code": "0123456789",
            "medical_system_code": "MSC001",
            "phone_number": "09111234567",
            "specialty_idx": 0,
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
            "specialty_idx": 1,
            "province": "اصفهان",
            "city": "اصفهان",
            "address": "میدان نقش جهان، مرکز درمانی",
        },
    ]

    for info in doctor_info:
        doctor, created = Doctor.objects.get_or_create(
            user=users[info["user_key"]],
            defaults={
                "first_name": info["first_name"],
                "last_name": info["last_name"],
                "father_name": info["father_name"],
                "gender": lookups['genders'][0],
                "national_code": info["national_code"],
                "medical_system_code": info["medical_system_code"],
                "phone_number": info["phone_number"],
                "specialty": lookups['specialties'][info["specialty_idx"]],
                "province": info["province"],
                "city": info["city"],
                "address": info["address"],
            }
        )
        doctors.append(doctor)
        if created:
            print(f"  ✓ Created Doctor profile: {info['first_name']} {info['last_name']}")

    return doctors

# ============================================================================
# 4. CREATE HEALTH ASSISTANT PROFILES
# ============================================================================

def create_health_assistants(users, lookups):
    print("\n👩‍⚕️ Creating health assistant profiles...")

    health_assistants = []

    ha_info = [
        {
            "user_key": "health_assistant_ha_sara",
            "cooperation_type_idx": 0,
            "is_individual": True,
            "first_name": "سارا",
            "last_name": "حسنی",
            "father_name": "حسن",
            "national_code": "0111223344",
            "phone_number": "09131234567",
            "education_idx": 4,
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
    ]

    for info in ha_info:
        ha, created = HealthAssistant.objects.get_or_create(
            user=users[info["user_key"]],
            defaults={
                "health_assistance_code": f"HA{users[info['user_key']].id:05d}",
                "cooperation_type": lookups['cooperation_types'][info["cooperation_type_idx"]],
                "cooperation_description": "تعاون در ارائه خدمات درمانی",
            }
        )
        health_assistants.append(ha)

        if created:
            print(f"  ✓ Created Health Assistant: {users[info['user_key']].first_name}")

            # Create individual or organization profile
            if info.get("is_individual"):
                IndividualHealthAssistant.objects.get_or_create(
                    health_assistant=ha,
                    defaults={
                        "first_name": info["first_name"],
                        "last_name": info["last_name"],
                        "gender": lookups['genders'][1],
                        "national_code": info["national_code"],
                        "phone_number": info["phone_number"],
                        "education": lookups['educations'][info["education_idx"]],
                        "job": info["job"],
                        "province": info["province"],
                        "city": info["city"],
                        "home_address": info["home_address"],
                        "work_address": info["work_address"],
                    }
                )
                print(f"    → Created Individual Health Assistant Profile")
            else:
                OrganizationHealthAssistant.objects.get_or_create(
                    health_assistant=ha,
                    defaults={
                        "organization_type": lookups['org_types'][info["organization_type_idx"]],
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
                        "social_unit_head_phone_number": info["social_unit_head_phone_number"],
                        "social_unit_head_landline_number": info["social_unit_head_landline_number"],
                    }
                )
                print(f"    → Created Organization Health Assistant Profile")

    return health_assistants

# ============================================================================
# 5. CREATE PATIENT PROFILES
# ============================================================================

def create_patients(users, lookups, health_assistants):
    print("\n🏥 Creating patient profiles...")

    patients = []

    patient_info = [
        {
            "user_key": "patient_patient_reza",
            "first_name": "رضا",
            "last_name": "کریمی",
            "father_name": "کریم",
            "national_code": "1234567890",
            "gender_idx": 0,
            "age": 45,
            "marital_status_idx": 1,
            "education_idx": 4,
            "job_status_idx": 1,
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
            "health_assistant_idx": 0,
        },
        {
            "user_key": "patient_patient_fatima",
            "first_name": "فاطمه",
            "last_name": "علی‌پور",
            "father_name": "علی",
            "national_code": "0987654321",
            "gender_idx": 1,
            "age": 32,
            "marital_status_idx": 0,
            "education_idx": 5,
            "job_status_idx": 2,
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
            "health_assistant_idx": 1,
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
            "education_idx": 3,
            "job_status_idx": 4,
            "housing_status_idx": 0,
            "insurance_idx": 2,
            "phone_number": "09251234567",
            "landline_number": "02177777777",
            "province": "تهران",
            "city": "تهران",
            "address": "خیابان جمهوری، نبش آزادی",
            "sickness_description": "بیماری قلبی و ریوی",
            "contact1": ("علی حسنی", "09261234567"),
            "contact2": ("خدیجه حسنی", "09271234567"),
            "health_assistant_idx": 0,
        },
    ]

    for info in patient_info:
        patient, created = Patient.objects.get_or_create(
            user=users[info["user_key"]],
            defaults={
                "patient_code": f"PAT{users[info['user_key']].id:06d}",
                "national_code": info["national_code"],
                "first_name": info["first_name"],
                "last_name": info["last_name"],
                "father_name": info["father_name"],
                "gender": lookups['genders'][info["gender_idx"]],
                "age": info["age"],
                "marital_status": lookups['marital_statuses'][info["marital_status_idx"]],
                "head_household": True,
                "number_dependents": 2,
                "family_status": "خانواده کامل",
                "education": lookups['educations'][info["education_idx"]],
                "job_status": lookups['job_statuses'][info["job_status_idx"]],
                "skill": "تعمیر و نگهداری",
                "housing_status": lookups['housing_statuses'][info["housing_status_idx"]],
                "covered_organization": lookups['organizations'][0],
                "phone_number": info["phone_number"],
                "landline_number": info["landline_number"],
                "province": info["province"],
                "city": info["city"],
                "address": info["address"],
                "bank_card_number": "6274161234567890",
                "insurance": lookups['insurances'][info["insurance_idx"]],
                "sickness_description": info["sickness_description"],
                "contact1_full_name": info["contact1"][0],
                "contact1_phone_number": info["contact1"][1],
                "contact2_full_name": info["contact2"][0],
                "contact2_phone_number": info["contact2"][1],
                "introducer": health_assistants[info["health_assistant_idx"]],
            }
        )
        patients.append(patient)
        if created:
            print(f"  ✓ Created Patient profile: {info['first_name']} {info['last_name']} (Code: {patient.patient_code})")

    return patients

# ============================================================================
# 6. CREATE BENEFACTOR PROFILES
# ============================================================================

def create_benefactors(users, lookups):
    print("\n💰 Creating benefactor profiles...")

    benefactors = []

    benefactor_info = [
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
    ]

    for info in benefactor_info:
        benefactor, created = Benefactor.objects.get_or_create(
            user=users[info["user_key"]],
            defaults={
                "first_name": info["first_name"],
                "last_name": info["last_name"],
                "gender": lookups['genders'][info["gender_idx"]],
                "national_code": info["national_code"],
                "phone_number": info["phone_number"],
            }
        )
        benefactors.append(benefactor)
        if created:
            print(f"  ✓ Created Benefactor profile: {info['first_name']} {info['last_name']}")

    return benefactors

# ============================================================================
# 7. CREATE WALLETS
# ============================================================================

def create_wallets(users, patients):
    print("\n🏦 Creating wallets...")

    # Create benefactor wallets
    for user in users.values():
        if user.role == "benefactor":
            wallet, created = Wallet.objects.get_or_create(
                owner_user=user,
                wallet_type="benefactor",
                defaults={
                    "cached_balance": 10000000,  # 10 million Rials
                    "currency": "IRR",
                    "is_active": True,
                }
            )
            if created:
                print(f"  ✓ Created Benefactor Wallet for {user.first_name}")

    # Create patient escrow wallets
    for patient in patients:
        wallet, created = Wallet.objects.get_or_create(
            owner_patient=patient,
            wallet_type="patient_escrow",
            defaults={
                "cached_balance": 0,
                "currency": "IRR",
                "is_active": True,
            }
        )
        if created:
            print(f"  ✓ Created Patient Escrow Wallet for {patient.patient_code}")

    # Create platform wallet (if doesn't exist)
    platform_wallet, created = Wallet.objects.get_or_create(
        wallet_type="platform",
        defaults={
            "cached_balance": 0,
            "currency": "IRR",
            "is_active": True,
        }
    )
    if created:
        print(f"  ✓ Created Platform Wallet")

# ============================================================================
# 8. CREATE CAMPAIGNS
# ============================================================================

def create_campaigns(users):
    print("\n📢 Creating campaigns...")

    campaigns_data = [
        {
            "title": "کمپین سرطان کودکان",
            "description": "جمع‌آوری کمک برای درمان کودکان مبتلا به سرطان",
            "target_amount": 500000000,
            "category": "درمانی",
            "urgency": "فوری",
            "creator_idx": 0,
        },
        {
            "title": "کمپین سیل جراحی قلب",
            "description": "کمک برای انجام جراحی‌های قلب درمقالع فقیرنشین",
            "target_amount": 300000000,
            "category": "جراحی",
            "urgency": "متوسط",
            "creator_idx": 1,
        },
    ]

    creators = list(users.values())
    campaigns = []

    for data in campaigns_data:
        campaign, created = Campaign.objects.get_or_create(
            title=data["title"],
            defaults={
                "description": data["description"],
                "target_amount": data["target_amount"],
                "raised_amount": 0,
                "category": data["category"],
                "urgency": data["urgency"],
                "is_published": True,
                "created_by": creators[data["creator_idx"]],
            }
        )
        campaigns.append(campaign)
        if created:
            print(f"  ✓ Created Campaign: {data['title']}")

    return campaigns

# ============================================================================
# 9. CREATE NETWORK REQUESTS
# ============================================================================

def create_network_requests(users, patients, lookups):
    print("\n📋 Creating network requests...")

    request_data = [
        {
            "request_type": "consultation",
            "patient_idx": 0,
            "created_by_key": "doctor_dr_ali",
            "subject": "مشاوره درباره مدیریت دیابت",
            "description": "بیمار نیازمند مشاوره تخصصی برای کنترل بهتر قند خون",
            "specialty_idx": 0,
            "consultation_mode": "آنلاین",
            "preferred_date": "1403/04/15",
            "preferred_time": "14:00",
        },
        {
            "request_type": "financial",
            "patient_idx": 1,
            "created_by_key": "health_assistant_ha_sara",
            "subject": "درخواست کمک مالی برای آنجیوگرافی",
            "description": "بیمار برای انجام آنجیوگرافی نیاز به کمک مالی دارد",
            "amount_needed": 5000000,
        },
        {
            "request_type": "service",
            "patient_idx": 2,
            "created_by_key": "benefactor_benefactor_hassan",
            "subject": "درخواست خدمات پرستاری در منزل",
            "description": "بیمار سالمند نیاز به خدمات پرستاری منزلی دارد",
            "needed_service": "پرستاری شبانه‌روزی",
        },
    ]

    network_requests = []

    for data in request_data:
        request, created = NetworkRequest.objects.get_or_create(
            request_type=data["request_type"],
            patient=patients[data["patient_idx"]],
            subject=data["subject"],
            defaults={
                "created_by": users[data["created_by_key"]],
                "description": data["description"],
                "specialty": lookups['specialties'][data.get("specialty_idx", 0)] if data.get("specialty_idx") is not None else None,
                "consultation_mode": data.get("consultation_mode", ""),
                "preferred_date": data.get("preferred_date", ""),
                "preferred_time": data.get("preferred_time", ""),
                "needed_service": data.get("needed_service", ""),
                "amount_needed": data.get("amount_needed"),
                "status": "pending",
            }
        )
        network_requests.append(request)
        if created:
            print(f"  ✓ Created NetworkRequest: {data['subject']}")

    return network_requests

# ============================================================================
# 10. CREATE DONATIONS
# ============================================================================

def create_donations(users, patients, network_requests, campaigns):
    print("\n💳 Creating donations...")

    donations_data = [
        {
            "benefactor_key": "benefactor_benefactor_hassan",
            "donation_type": "cash",
            "amount": 1000000,
            "destination_type": "patient",
            "patient_idx": 0,
            "title": "کمک مالی برای درمان",
            "description": "کمک به بیمار رضا برای تداوی",
        },
        {
            "benefactor_key": "benefactor_benefactor_maryam",
            "donation_type": "cash",
            "amount": 2000000,
            "destination_type": "campaign",
            "campaign_idx": 0,
            "title": "کمک به کمپین سرطان کودکان",
            "description": "حمایت از درمان کودکان مبتلا به سرطان",
        },
        {
            "benefactor_key": "benefactor_benefactor_hassan",
            "donation_type": "cash",
            "amount": 500000,
            "destination_type": "request",
            "request_idx": 1,
            "title": "کمک برای درخواست مالی",
            "description": "حمایت از درخواست مالی بیمار",
        },
    ]

    donations = []

    for data in donations_data:
        donation, created = BenefactorDonation.objects.get_or_create(
            benefactor=users[data["benefactor_key"]],
            amount=data["amount"],
            donation_type=data["donation_type"],
            created_at=None,  # Will use default
            defaults={
                "destination_type": data["destination_type"],
                "patient": patients[data["patient_idx"]] if data["destination_type"] == "patient" else None,
                "campaign_fk": campaigns[data.get("campaign_idx", 0)] if data["destination_type"] == "campaign" else None,
                "network_request": network_requests[data.get("request_idx", 0)] if data["destination_type"] == "request" else None,
                "payment_source": "wallet",
                "status": "completed",
                "title": data.get("title", ""),
                "description": data.get("description", ""),
            }
        )
        donations.append(donation)
        if created:
            print(f"  ✓ Created Donation: {data.get('title', 'Donation')}")

# ============================================================================
# 11. CREATE WALLET TRANSACTIONS
# ============================================================================

def create_wallet_transactions(users, patients):
    print("\n💰 Creating wallet transactions...")

    # Get benefactor wallets and patient wallets
    benefactor_users = [user for user in users.values() if user.role == "benefactor"]

    for benefactor in benefactor_users:
        wallet = Wallet.objects.filter(owner_user=benefactor, wallet_type="benefactor").first()
        if wallet:
            # Create top-up transaction
            transaction, created = WalletTransaction.objects.get_or_create(
                wallet=wallet,
                kind="topup",
                amount=5000000,
                entry_type="credit",
                defaults={
                    "description": "شارژ کیف پول",
                    "created_by": benefactor,
                }
            )
            if created:
                print(f"  ✓ Created Top-up transaction for {benefactor.first_name}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

print("\n" + "="*70)
print("🚀 DATABASE POPULATION SCRIPT")
print("="*70)

try:
    # Create lookup data
    lookups = create_lookups()

    # Create users
    users = create_users()

    # Create profiles
    doctors = create_doctors(users, lookups)
    health_assistants = create_health_assistants(users, lookups)
    patients = create_patients(users, lookups, health_assistants)
    benefactors = create_benefactors(users, lookups)

    # Create financial structures
    create_wallets(users, patients)
    campaigns = create_campaigns(users)

    # Create requests
    network_requests = create_network_requests(users, patients, lookups)

    # Create donations
    create_donations(users, patients, network_requests, campaigns)

    # Create transactions
    create_wallet_transactions(users, patients)

    print("\n" + "="*70)
    print("✅ DATABASE POPULATION COMPLETED SUCCESSFULLY!")
    print("="*70)
    print("\n📊 Summary:")
    print(f"  • Users created: {CustomUser.objects.filter(role__in=['doctor', 'patient', 'benefactor', 'health_assistant']).count()}")
    print(f"  • Doctors: {Doctor.objects.count()}")
    print(f"  • Patients: {Patient.objects.count()}")
    print(f"  • Benefactors: {Benefactor.objects.count()}")
    print(f"  • Health Assistants: {HealthAssistant.objects.count()}")
    print(f"  • Wallets: {Wallet.objects.count()}")
    print(f"  • Campaigns: {Campaign.objects.count()}")
    print(f"  • Network Requests: {NetworkRequest.objects.count()}")
    print(f"  • Donations: {BenefactorDonation.objects.count()}")
    print(f"  • Transactions: {WalletTransaction.objects.count()}")
    print("\n✨ All data is ready for testing!")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
