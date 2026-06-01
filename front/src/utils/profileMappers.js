/** Map API lookup FK values and nested objects to display labels. */
export function lookupLabel(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") return value.name || "";
  return String(value);
}

export function displayValue(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (typeof value === "object") return value.name || "—";
  return String(value);
}

export function fullName(first, last, fallback = "") {
  const n = `${first || ""} ${last || ""}`.trim();
  return n || fallback;
}

function avatarFor(username, seed) {
  return (
    "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
    encodeURIComponent(String(seed || username || "user"))
  );
}

export function mapPatientProfile(response) {
  const u = response.data ?? response;
  const p = u.profile || {};
  return {
    username: u.username || "",
    name: fullName(p.first_name, p.last_name, u.username),
    firstName: p.first_name || "",
    lastName: p.last_name || "",
    memberSince: p.created_at ? String(p.created_at).slice(0, 10) : "",
    patientCode: p.patient_code || "",
    nationalCode: p.national_code || "",
    fatherName: p.father_name || "",
    gender: lookupLabel(p.gender),
    age: p.age != null ? String(p.age) : "",
    maritalStatus: lookupLabel(p.marital_status),
    headHousehold: p.head_household,
    numberDependents:
      p.number_dependents != null ? String(p.number_dependents) : "",
    familyStatus: p.family_status || "",
    education: lookupLabel(p.education),
    jobStatus: lookupLabel(p.job_status),
    skill: p.skill || "",
    housingStatus: lookupLabel(p.housing_status),
    coveredOrganization: lookupLabel(p.covered_organization),
    phoneNumber: p.phone_number || "",
    landlineNumber: p.landline_number || "",
    province: p.province || "",
    city: p.city || "",
    address: p.address || "",
    bankCardNumber: p.bank_card_number || "",
    insuranceType: lookupLabel(p.insurance),
    illness: p.sickness_description || "",
    contact1Name: p.contact1_full_name || "",
    contact1Phone: p.contact1_phone_number || "",
    contact2Name: p.contact2_full_name || "",
    contact2Phone: p.contact2_phone_number || "",
    avatar: avatarFor(u.username, "patient"),
    state: u.state !== false,
  };
}

export function mapDoctorProfile(response) {
  const u = response.data ?? response;
  const d = u.profile || {};
  return {
    username: u.username || "",
    name: fullName(d.first_name, d.last_name, u.username),
    firstName: d.first_name || "",
    lastName: d.last_name || "",
    memberSince: d.created_at ? String(d.created_at).slice(0, 10) : "",
    fatherName: d.father_name || "",
    gender: lookupLabel(d.gender),
    nationalCode: d.national_code || "",
    medicalSystemCode: d.medical_system_code || "",
    phoneNumber: d.phone_number || "",
    speciality: lookupLabel(d.specialty),
    province: d.province || "",
    city: d.city || "",
    address: d.address || "",
    cooperatesWithAll: d.cooperates_with_all,
    avatar: avatarFor(u.username, "doctor"),
    state: u.state !== false,
  };
}

export function mapBenefactorProfile(response) {
  const u = response.data ?? response;
  const b = u.profile || {};
  return {
    username: u.username || "",
    name: fullName(b.first_name, b.last_name, u.username),
    firstName: b.first_name || "",
    lastName: b.last_name || "",
    memberSince: b.created_at ? String(b.created_at).slice(0, 10) : "",
    phoneNumber: b.phone_number || "",
    nationalCode: b.national_code || "",
    gender: lookupLabel(b.gender) || b.gender_name || "",
    avatar: avatarFor(u.username, "benefactor"),
    state: u.state !== false,
  };
}

export function mapHealthAssistantProfile(ha) {
  if (!ha) return null;
  const ind = ha.individual_profile;
  const org = ha.organization_profile;
  const base = {
    username: ha.user?.username || "",
    healthAssistanceCode: ha.health_assistance_code || "",
    collaborationType: lookupLabel(ha.cooperation_type),
    cooperationDescription: ha.cooperation_description || "",
    memberSince: ha.created_at ? String(ha.created_at).slice(0, 10) : "",
    profileType: ind ? "individual" : org ? "organization" : "",
  };

  if (ind) {
    return {
      ...base,
      name: fullName(ind.first_name, ind.last_name),
      firstName: ind.first_name || "",
      lastName: ind.last_name || "",
      gender: lookupLabel(ind.gender),
      nationalCode: ind.national_code || "",
      phoneNumber: ind.phone_number || "",
      education: lookupLabel(ind.education),
      job: ind.job || "",
      province: ind.province || "",
      city: ind.city || "",
      homeAddress: ind.home_address || "",
      workAddress: ind.work_address || "",
      avatar: avatarFor(ha.user?.username, "health-assistant"),
    };
  }

  if (org) {
    return {
      ...base,
      name: org.name || "",
      organizationType: lookupLabel(org.organization_type),
      directorFirstName: org.director_first_name || "",
      directorLastName: org.director_last_name || "",
      directorPhoneNumber: org.director_phone_number || "",
      directorLandlineNumber: org.director_landline_number || "",
      phoneNumber: org.director_phone_number || "",
      province: org.province || "",
      city: org.city || "",
      address: org.address || "",
      socialUnitHeadFirstName: org.social_unit_head_first_name || "",
      socialUnitHeadLastName: org.social_unit_head_last_name || "",
      socialUnitHeadPhone: org.social_unit_head_phone_number || "",
      socialUnitHeadLandline: org.social_unit_head_landline_number || "",
      avatar: avatarFor(ha.user?.username, "health-assistant-org"),
    };
  }

  return {
    ...base,
    name: ha.health_assistance_code || "",
    avatar: avatarFor("", "health-assistant"),
  };
}

export function mapHealthAssistantProfileFromMe(response) {
  const u = response.data ?? response;
  const mapped = mapHealthAssistantProfile(u.profile);
  if (!mapped) return null;
  return {
    ...mapped,
    username: u.username || mapped.username,
    avatar: avatarFor(u.username, "health-assistant"),
    state: u.state !== false,
  };
}

/** { label, value }[] for profile tab grids */
export function patientProfileFields(p) {
  if (!p) return [];
  return [
    { label: "نام کاربری", value: p.username },
    { label: "کد بیمار", value: p.patientCode },
    { label: "نام", value: p.firstName },
    { label: "نام خانوادگی", value: p.lastName },
    { label: "نام پدر", value: p.fatherName },
    { label: "کد ملی", value: p.nationalCode },
    { label: "جنسیت", value: p.gender },
    { label: "سن", value: p.age },
    { label: "وضعیت تأهل", value: p.maritalStatus },
    { label: "سرپرست خانوار", value: displayValue(p.headHousehold) },
    { label: "تعداد افراد تحت تکفل", value: p.numberDependents },
    { label: "وضعیت خانواده", value: p.familyStatus },
    { label: "تحصیلات", value: p.education },
    { label: "وضعیت شغلی", value: p.jobStatus },
    { label: "مهارت", value: p.skill },
    { label: "وضعیت مسکن", value: p.housingStatus },
    { label: "ارگان تحت پوشش", value: p.coveredOrganization },
    { label: "تلفن همراه", value: p.phoneNumber },
    { label: "تلفن ثابت", value: p.landlineNumber },
    { label: "استان", value: p.province },
    { label: "شهر", value: p.city },
    { label: "آدرس", value: p.address, fullWidth: true },
    { label: "شماره کارت بانکی", value: p.bankCardNumber },
    { label: "نوع بیمه", value: p.insuranceType },
    { label: "شرح حال بیماری", value: p.illness, fullWidth: true },
    { label: "نام آشنای اول", value: p.contact1Name },
    { label: "تلفن آشنای اول", value: p.contact1Phone },
    { label: "نام آشنای دوم", value: p.contact2Name },
    { label: "تلفن آشنای دوم", value: p.contact2Phone },
    { label: "تاریخ عضویت", value: p.memberSince },
  ];
}

export function doctorProfileFields(p) {
  if (!p) return [];
  return [
    { label: "نام کاربری", value: p.username },
    { label: "نام", value: p.firstName },
    { label: "نام خانوادگی", value: p.lastName },
    { label: "نام پدر", value: p.fatherName },
    { label: "جنسیت", value: p.gender },
    { label: "کد ملی", value: p.nationalCode },
    { label: "شماره نظام پزشکی", value: p.medicalSystemCode },
    { label: "تلفن همراه", value: p.phoneNumber },
    { label: "تخصص", value: p.speciality },
    { label: "استان", value: p.province },
    { label: "شهر", value: p.city },
    { label: "آدرس", value: p.address, fullWidth: true },
    { label: "تاریخ عضویت", value: p.memberSince },
  ];
}

export function benefactorProfileFields(p) {
  if (!p) return [];
  return [
    { label: "نام کاربری", value: p.username },
    { label: "نام", value: p.firstName },
    { label: "نام خانوادگی", value: p.lastName },
    { label: "کد ملی", value: p.nationalCode },
    { label: "جنسیت", value: p.gender },
    { label: "تلفن همراه", value: p.phoneNumber },
    { label: "تاریخ عضویت", value: p.memberSince },
  ];
}

export function healthAssistantProfileFields(p) {
  if (!p) return [];
  const common = [
    { label: "نام کاربری", value: p.username },
    { label: "کد سلامتیاری", value: p.healthAssistanceCode },
    { label: "نوع همکاری", value: p.collaborationType },
    { label: "توضیحات همکاری", value: p.cooperationDescription, fullWidth: true },
    { label: "تاریخ عضویت", value: p.memberSince },
  ];

  if (p.profileType === "organization") {
    return [
      ...common,
      { label: "نام مجموعه", value: p.name },
      { label: "نوع مجموعه", value: p.organizationType },
      { label: "نام رئیس مجموعه", value: p.directorFirstName },
      { label: "نام خانوادگی رئیس مجموعه", value: p.directorLastName },
      { label: "تلفن همراه رئیس", value: p.directorPhoneNumber },
      { label: "تلفن ثابت رئیس", value: p.directorLandlineNumber },
      { label: "استان", value: p.province },
      { label: "شهر", value: p.city },
      { label: "آدرس مجموعه", value: p.address, fullWidth: true },
      {
        label: "نام رئیس واحد مددکاری",
        value: p.socialUnitHeadFirstName,
      },
      {
        label: "نام خانوادگی رئیس واحد مددکاری",
        value: p.socialUnitHeadLastName,
      },
      { label: "تلفن همراه رئیس واحد", value: p.socialUnitHeadPhone },
      { label: "تلفن ثابت رئیس واحد", value: p.socialUnitHeadLandline },
    ];
  }

  return [
    ...common,
    { label: "نام", value: p.firstName },
    { label: "نام خانوادگی", value: p.lastName },
    { label: "جنسیت", value: p.gender },
    { label: "کد ملی", value: p.nationalCode },
    { label: "تلفن همراه", value: p.phoneNumber },
    { label: "تحصیلات", value: p.education },
    { label: "شغل", value: p.job },
    { label: "استان", value: p.province },
    { label: "شهر", value: p.city },
    { label: "آدرس محل سکونت", value: p.homeAddress, fullWidth: true },
    { label: "آدرس محل کار", value: p.workAddress, fullWidth: true },
  ];
}

export function renderProfileFieldValue(value) {
  return displayValue(value);
}
