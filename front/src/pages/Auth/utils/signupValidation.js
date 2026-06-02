/** Validation helpers aligned with backend signup serializers. */

export function convertToEnglishDigits(str = "") {
  return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

export function lookupValue(field) {
  if (field == null || field === "") return "";
  if (typeof field === "object") return field.value ?? "";
  return field;
}

export function isValidNationalCode(code) {
  const c = convertToEnglishDigits(String(code || "").trim());
  if (!/^\d{10}$/.test(c)) return false;
  const check = +c[9];
  const sum =
    c
      .split("")
      .slice(0, 9)
      .reduce((acc, x, i) => acc + +x * (10 - i), 0) % 11;
  return sum < 2 ? check === sum : check === 11 - sum;
}

export function isValidMobile(phone) {
  const p = convertToEnglishDigits(String(phone || "").replace(/\s+/g, ""));
  return /^09\d{9}$/.test(p);
}

export function isValidLandline(phone) {
  const p = convertToEnglishDigits(String(phone || "").replace(/\s+/g, ""));
  if (!p) return true;
  return /^0\d{10}$/.test(p);
}

export function sanitizePhone(phone = "") {
  return convertToEnglishDigits(phone).replace(/\s+/g, "");
}

export function isValidBankCard(card) {
  const digits = convertToEnglishDigits(String(card || "").replace(/\s/g, ""));
  return /^\d{16}$/.test(digits);
}

export function validatePatientStep1(data) {
  if (!data.first_name?.trim()) return "نام را وارد کنید.";
  if (!data.last_name?.trim()) return "نام خانوادگی را وارد کنید.";
  if (!data.father_name?.trim()) return "نام پدر را وارد کنید.";
  if (!lookupValue(data.gender)) return "جنسیت را انتخاب کنید.";
  if (!data.phone_number?.trim()) return "شماره تلفن همراه را وارد کنید.";
  if (!isValidMobile(data.phone_number)) return "شماره موبایل معتبر نیست.";
  if (data.landline_number && !isValidLandline(data.landline_number)) {
    return "شماره تلفن ثابت معتبر نیست.";
  }
  if (!data.age && data.age !== 0) return "سن را وارد کنید.";
  if (Number(data.age) < 1 || Number(data.age) > 120) return "سن وارد شده معتبر نیست.";
  if (!lookupValue(data.marital_status)) return "وضعیت تأهل را انتخاب کنید.";
  if (data.head_household === undefined || data.head_household === null || data.head_household === "") {
    return "وضعیت سرپرست خانواده را انتخاب کنید.";
  }
  if (Number(data.number_dependents) < 0) {
    return "تعداد افراد تحت تکفل نمی‌تواند منفی باشد.";
  }
  if (!lookupValue(data.education)) return "سطح تحصیلات را انتخاب کنید.";
  if (!lookupValue(data.job_status)) return "وضعیت شغلی را انتخاب کنید.";
  if (!lookupValue(data.housing_status)) return "وضعیت مسکن را انتخاب کنید.";
  if (!lookupValue(data.covered_organization)) return "ارگان تحت پوشش را انتخاب کنید.";
  return "";
}

export function validatePatientStep2(data) {
  if (!data.province?.trim?.() && !lookupValue(data.province)) {
    return "استان محل سکونت را انتخاب کنید.";
  }
  if (!data.city?.trim?.() && !lookupValue(data.city)) {
    return "شهر را انتخاب کنید.";
  }
  if (!String(data.address || "").trim()) return "آدرس را وارد کنید.";
  const card = data.bank_card_number || data.creditCard || "";
  if (!String(card).replace(/\s/g, "")) return "شماره کارت بانکی را وارد کنید.";
  if (!isValidBankCard(card)) return "شماره کارت باید ۱۶ رقم باشد.";
  return "";
}

export function validatePatientStep3(data) {
  if (!lookupValue(data.insurance)) return "نوع بیمه را انتخاب کنید.";
  return "";
}

export function validatePatientDraft(draft) {
  const s1 = draft.step1 || draft[1] || {};
  const s2 = draft.step2 || draft[2] || {};
  const s3 = draft.step3 || draft[3] || {};
  return (
    validatePatientStep1(s1) ||
    validatePatientStep2(s2) ||
    validatePatientStep3(s3) ||
    ""
  );
}

export function validateDoctorForm(data) {
  if (!data.first_name?.trim()) return "نام را وارد کنید.";
  if (!data.last_name?.trim()) return "نام خانوادگی را وارد کنید.";
  if (!lookupValue(data.gender)) return "جنسیت را انتخاب کنید.";
  if (!data.national_code?.trim()) return "کد ملی را وارد کنید.";
  if (!isValidNationalCode(data.national_code)) return "کد ملی معتبر نیست.";
  if (!data.medical_system_code?.trim()) return "شماره نظام پزشکی را وارد کنید.";
  if (!data.father_name?.trim()) return "نام پدر را وارد کنید.";
  if (!data.phone_number?.trim()) return "شماره تلفن همراه را وارد کنید.";
  if (!isValidMobile(data.phone_number)) return "شماره تلفن همراه معتبر نیست.";
  if (!lookupValue(data.specialty)) return "تخصص را انتخاب کنید.";
  if (!lookupValue(data.province)) return "استان محل سکونت را انتخاب کنید.";
  if (!lookupValue(data.city)) return "شهر را انتخاب کنید.";
  if (!String(data.address || "").trim()) return "آدرس را وارد کنید.";
  return "";
}

export function validateBenefactorForm(data) {
  if (!data.first_name?.trim()) return "نام را وارد کنید.";
  if (!data.last_name?.trim()) return "نام خانوادگی را وارد کنید.";
  if (!lookupValue(data.gender)) return "جنسیت را انتخاب کنید.";
  if (!data.national_code?.trim()) return "کد ملی را وارد کنید.";
  if (!isValidNationalCode(data.national_code)) return "کد ملی معتبر نیست.";
  if (!data.phone_number?.trim()) return "شماره تلفن همراه را وارد کنید.";
  if (!isValidMobile(data.phone_number)) return "شماره تلفن همراه معتبر نیست.";
  return "";
}

export function validateHealthAssistantStep1(data, profileType) {
  if (profileType === "organization") {
    if (!lookupValue(data.organization_type)) return "نوع مجموعه را انتخاب کنید.";
    if (!data.org_name?.trim()) return "نام مجموعه را وارد کنید.";
    if (!data.director_first_name?.trim()) return "نام رئیس مجموعه را وارد کنید.";
    if (!data.director_last_name?.trim()) return "نام خانوادگی رئیس مجموعه را وارد کنید.";
    if (!data.director_phone_number?.trim()) {
      return "شماره تلفن رئیس مجموعه را وارد کنید.";
    }
    if (!isValidMobile(data.director_phone_number)) {
      return "شماره تلفن رئیس مجموعه معتبر نیست.";
    }
    return "";
  }

  if (!data.first_name?.trim()) return "نام را وارد کنید.";
  if (!lookupValue(data.gender)) return "جنسیت را انتخاب کنید.";
  if (!data.national_code?.trim()) return "کد ملی را وارد کنید.";
  if (!isValidNationalCode(data.national_code)) return "کد ملی معتبر نیست.";
  if (!data.phone_number?.trim()) return "شماره تلفن را وارد کنید.";
  if (!isValidMobile(data.phone_number)) return "شماره تلفن معتبر نیست.";
  return "";
}

export function validateHealthAssistantIndividualStep2(data) {
  // Backend only requires step-1 fields for individual HA; step-2 fields are optional.
  return "";
}

export function validateHealthAssistantOrganizationStep2(data) {
  // Backend only requires org_name from step 1 for organization HA.
  return "";
}

export function validateDraftForRole(role, draft) {
  const normalized = role === "SalamtyaranSignup" ? "salamtyaran" : role;
  switch (normalized) {
    case "patient":
      return validatePatientDraft(draft);
    case "doctor":
      return validateDoctorForm(draft.step1 || draft);
    case "charitable":
      return validateBenefactorForm(draft.step1 || draft);
    case "salamtyaran": {
      const s1 = draft[1] || draft.step1 || {};
      const profileType =
        s1.profile_type ||
        (s1.referrerType === "legal" ? "organization" : "individual");
      const err1 = validateHealthAssistantStep1(s1, profileType);
      if (err1) return err1;
      const s2 = draft[2] || draft.step2 || {};
      if (profileType === "organization") {
        return validateHealthAssistantOrganizationStep2(s2);
      }
      return validateHealthAssistantIndividualStep2(s2);
    }
    default:
      return "";
  }
}
