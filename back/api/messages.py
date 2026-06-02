"""User-facing API messages in Persian."""

# Common
NOT_FOUND = "یافت نشد."
FORBIDDEN = "شما اجازه انجام این عملیات را ندارید."
USER_NOT_FOUND = "کاربر یافت نشد."
PROFILE_NOT_FOUND = "پروفایل یافت نشد."

# Auth
ACCOUNT_NOT_APPROVED = "حساب کاربری شما هنوز توسط مدیر تأیید نشده است."
USERNAME_TAKEN = "این نام کاربری قبلاً ثبت شده است."
USERNAME_PASSWORD_REQUIRED = "نام کاربری و رمز عبور الزامی است."

# Signup validation
PHONE_ALREADY_REGISTERED = "این شماره تلفن قبلاً ثبت شده است."
PHONE_NUMBER_REQUIRED = "شماره تلفن الزامی است."
INVALID_MOBILE_PHONE = "شماره موبایل نامعتبر است."
NATIONAL_CODE_EXISTS_PATIENT = "بیماری با این کد ملی قبلاً ثبت شده است."
NATIONAL_CODE_EXISTS_BENEFACTOR = "نیکوکاری با این کد ملی قبلاً ثبت شده است."
NATIONAL_CODE_EXISTS_HEALTH_ASSISTANT = "دستیار سلامت با این کد ملی قبلاً ثبت شده است."
NATIONAL_CODE_REQUIRED = "کد ملی الزامی است."
NAME_REQUIRED = "نام الزامی است."
GENDER_REQUIRED = "جنسیت الزامی است."
ORG_NAME_REQUIRED = "نام سازمان الزامی است."

FIELD_REQUIRED = "این فیلد الزامی است."
INVALID_LOOKUP_ID = "مقدار انتخابی نامعتبر است."
LOOKUP_ID_MUST_BE_INTEGER = "شناسه باید عدد صحیح باشد."


def invalid_health_assistant_ids(missing):
    return f"شناسه دستیار سلامت نامعتبر است: {missing}"


# Admin
PROFILE_EDITING_NOT_SUPPORTED = "ویرایش پروفایل برای این نقش پشتیبانی نمی‌شود."
UNKNOWN_LOOKUP_TYPE = "نوع فهرست نامعتبر است."
LOOKUP_NAME_REQUIRED = "نام الزامی است."
LOOKUP_NAME_ALREADY_EXISTS = "این نام قبلاً وجود دارد."
LOOKUP_ITEM_NOT_FOUND = "آیتم یافت نشد."
USER_APPROVED = "کاربر تأیید شد."
USER_REJECTED = "کاربر رد شد."

# Profile
PROFILE_DATA_REQUIRED = "داده پروفایل الزامی است."
ROLE_NOT_SUPPORTED = "این نقش پشتیبانی نمی‌شود."

# Organization signups
REQUEST_LETTER_REQUIRED = "نامه درخواست الزامی است."
SERVICE_CENTER_SIGNUP_DISABLED = "ثبت‌نام مرکز خدماتی در حال حاضر غیرفعال است."
CHARITY_CENTER_SIGNUP_DISABLED = "ثبت‌نام مرکز خیریه در حال حاضر غیرفعال است."
SOCIAL_WORK_UNIT_SIGNUP_DISABLED = "ثبت‌نام واحد مددکاری در حال حاضر غیرفعال است."

# Search
QUERY_REQUIRED = "پارامتر جستجو الزامی است."

# Stubs
CASH_DONATIONS_USE_WALLET = (
    "برای کمک نقدی ابتدا کیف پول را شارژ کرده و از مسیر کمک از کیف پول استفاده کنید."
)
NOT_IMPLEMENTED = "پیاده‌سازی نشده است."

# Wallet
WALLET_DISABLED = "کیف پول غیرفعال است."
MOCK_PAYMENT_ACCEPTED = "پرداخت آزمایشی پذیرفته شد (زرین‌پال غیرفعال است)."
INSUFFICIENT_WALLET_BALANCE = "موجودی کیف پول کافی نیست."
INVALID_AMOUNT = "مبلغ نامعتبر است."
AMOUNT_MUST_BE_POSITIVE = "مبلغ باید بزرگ‌تر از صفر باشد."


def min_topup_message(amount):
    return f"حداقل مبلغ شارژ {amount} تومان است."


# Donation
CAMPAIGN_ID_REQUIRED = "شناسه کمپین الزامی است."
CAMPAIGN_NOT_FOUND_OR_UNPUBLISHED = "کمپین یافت نشد یا منتشر نشده است."
PATIENT_ID_REQUIRED = "شناسه بیمار الزامی است."
PATIENT_NOT_FOUND = "بیمار یافت نشد."
NETWORK_REQUEST_ID_REQUIRED = "شناسه درخواست الزامی است."
FINANCIAL_REQUEST_NOT_FOUND = "درخواست مالی یافت نشد."
REQUEST_NOT_FINANCIAL = "این درخواست، درخواست حمایت مالی نیست."
NOT_HANDLING_REQUEST = "شما مسئول این درخواست نیستید."
REQUEST_NOT_PAYABLE = "درخواست در وضعیت قابل پرداخت نیست."
INVALID_DESTINATION_TYPE = "نوع مقصد نامعتبر است."

# Top-up / payment gateway
PAYMENT_NOT_FOUND = "پرداخت یافت نشد."
PAYMENT_CANCELLED_OR_FAILED = "پرداخت لغو یا ناموفق بود."
ZARINPAL_NOT_CONFIGURED = "شناسه پذیرنده زرین‌پال تنظیم نشده است."
GATEWAY_CONNECTION_FAILED = "اتصال به درگاه پرداخت برقرار نشد."
NO_AUTHORITY_FROM_GATEWAY = "کد authority از درگاه دریافت نشد."


def gateway_http_error(code):
    return f"خطای HTTP درگاه پرداخت: {code}"


def payment_request_failed(detail):
    return f"درخواست پرداخت ناموفق بود: {detail}"


def payment_verification_failed(detail):
    return f"تأیید پرداخت ناموفق بود: {detail}"


# Admin wallet
INSUFFICIENT_PATIENT_ESCROW = "موجودی سپرده بیمار کافی نیست."
INVALID_STATUS = "وضعیت نامعتبر است."
NETWORK_REQUEST_NOT_FOUND = "درخواست شبکه یافت نشد."
