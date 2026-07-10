/** Client-side validation aligned with backend signup serializers. */

export function convertToEnglishDigits(str = "") {
  return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

export function lookupValue(field) {
  if (field == null || field === "") return "";
  if (typeof field === "object") return field.value ?? "";
  return field;
}

export function sanitizePhone(phone = "") {
  return convertToEnglishDigits(phone).replace(/\s+/g, "");
}

function firstError(...checks) {
  for (const msg of checks) {
    if (msg) return msg;
  }
  return "";
}

function requireText(value, message) {
  if (!String(value ?? "").trim()) return message;
  return "";
}

function requireLookup(value, message) {
  const v = lookupValue(value);
  if (v === "" || v == null) return message;
  return "";
}

function requirePhone(value) {
  const phone = sanitizePhone(value);
  if (!phone) return "شماره موبایل را وارد کنید.";
  if (!/^09\d{9}$/.test(phone)) {
    return "شماره موبایل معتبر نیست (۱۱ رقم، با ۰۹).";
  }
  return "";
}

function requireNationalCode(value) {
  const nc = convertToEnglishDigits(String(value ?? "")).trim();
  if (!nc) return "کد ملی را وارد کنید.";
  if (!/^\d{10}$/.test(nc)) return "کد ملی باید ۱۰ رقم باشد.";
  return "";
}

function requireAge(value) {
  if (value === "" || value == null) return "سن را وارد کنید.";
  const age = Number(value);
  if (!Number.isFinite(age) || age < 1 || age > 130) return "سن معتبر نیست.";
  return "";
}

function requireHeadOfHousehold(value) {
  const v = lookupValue(value);
  if (v === "" || v == null) return "سرپرست خانواده را انتخاب کنید.";
  return "";
}

export function validatePatientStep1(data = {}) {
  return firstError(
    requireText(data.first_name, "نام را وارد کنید."),
    requireText(data.last_name, "نام خانوادگی را وارد کنید."),
    requireText(data.father_name, "نام پدر را وارد کنید."),
    requireNationalCode(data.national_code),
    requireLookup(data.gender, "جنسیت را انتخاب کنید."),
    requireAge(data.age),
    requireLookup(data.marital_status, "وضعیت تأهل را انتخاب کنید."),
    requireHeadOfHousehold(data.head_household),
    requireLookup(data.education, "تحصیلات را انتخاب کنید."),
    requireLookup(data.job_status, "وضعیت شغلی را انتخاب کنید."),
    requireLookup(data.housing_status, "وضعیت مسکن را انتخاب کنید."),
    requireLookup(data.covered_organization, "ارگان تحت پوشش را انتخاب کنید."),
    requirePhone(data.phone_number)
  );
}

export function validatePatientStep2(data = {}) {
  return firstError(
    requireText(data.province, "استان را انتخاب کنید."),
    requireText(data.city, "شهر را انتخاب کنید."),
    requireText(data.address, "آدرس را وارد کنید.")
  );
}

export function validatePatientStep3(data = {}) {
  return requireLookup(data.insurance, "نوع بیمه را انتخاب کنید.");
}

export function validatePatientDraft(steps = {}) {
  const s1 = steps.step1 || {};
  const s2 = steps.step2 || {};
  const s3 = steps.step3 || {};
  return firstError(
    validatePatientStep1({
      ...s1,
      head_household: s1.head_household ?? s1.head_of_family,
      marital_status: s1.marital_status ?? s1.marriage_status,
      housing_status: s1.housing_status ?? s1.house_status,
      covered_organization: s1.covered_organization ?? s1.supported_organ,
      phone_number: s1.phone_number ?? s1.mobile,
    }),
    validatePatientStep2({
      province: s2.province,
      city: s2.city?.value ?? s2.city,
      address: s2.address,
    }),
    validatePatientStep3({
      insurance: s3.insurance ?? s3.insuranceType,
    })
  );
}

export function validateDoctorForm(data = {}) {
  return firstError(
    requireText(data.first_name, "نام را وارد کنید."),
    requireText(data.last_name, "نام خانوادگی را وارد کنید."),
    requireText(data.father_name, "نام پدر را وارد کنید."),
    requireLookup(data.gender, "جنسیت را انتخاب کنید."),
    requireNationalCode(data.national_code),
    requireText(data.medical_system_code, "کد نظام پزشکی را وارد کنید."),
    requirePhone(data.phone_number),
    requireLookup(data.specialty, "تخصص را انتخاب کنید."),
    requireText(data.province, "استان را انتخاب کنید."),
    requireText(data.city, "شهر را انتخاب کنید."),
    requireText(data.address, "آدرس را وارد کنید.")
  );
}

export function validateBenefactorForm(data = {}) {
  return firstError(
    requireText(data.first_name, "نام را وارد کنید."),
    requireText(data.last_name, "نام خانوادگی را وارد کنید."),
    requireLookup(data.gender, "جنسیت را انتخاب کنید."),
    requireNationalCode(data.national_code),
    requirePhone(data.phone_number)
  );
}

export function validateHealthAssistantStep1(data = {}, profileType = "individual") {
  if (profileType === "organization") {
    return firstError(
      requireText(data.org_name, "نام مجموعه را وارد کنید."),
      requirePhone(data.director_phone_number)
    );
  }
  return firstError(
    requireText(data.first_name, "نام را وارد کنید."),
    requireLookup(data.gender, "جنسیت را انتخاب کنید."),
    requireNationalCode(data.national_code),
    requirePhone(data.phone_number)
  );
}

export function validateHealthAssistantIndividualStep2(data = {}) {
  return firstError(
    requireLookup(data.education, "تحصیلات را انتخاب کنید."),
    requireText(data.job, "شغل را وارد کنید."),
    requireText(data.province, "استان را انتخاب کنید."),
    requireText(data.city, "شهر را انتخاب کنید."),
    requireText(data.address, "آدرس را وارد کنید."),
    requireLookup(data.cooperation_type ?? data.collaborationType, "نوع همکاری را انتخاب کنید.")
  );
}

export function validateHealthAssistantOrganizationStep2(data = {}) {
  return firstError(
    requireText(data.province, "استان را انتخاب کنید."),
    requireText(data.city, "شهر را انتخاب کنید."),
    requireText(data.address, "آدرس را وارد کنید."),
    requireText(data.social_unit_head_first_name, "نام رئیس واحد مددکاری را وارد کنید."),
    requireText(data.social_unit_head_last_name, "نام خانوادگی رئیس واحد مددکاری را وارد کنید."),
    requirePhone(data.social_unit_head_phone_number),
    requireLookup(data.cooperation_type ?? data.collaborationType, "نوع همکاری را انتخاب کنید.")
  );
}

export function validatePasswordStep(password, confirmPassword) {
  if (!password) return "رمز عبور را وارد کنید.";
  if (password.length < 8) return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  if (password !== confirmPassword) return "رمز عبور و تکرار آن یکسان نیست.";
  return "";
}

export function validateDraftForRole(role, draft = {}) {
  if (role === "patient") return validatePatientDraft(draft);
  return "";
}
