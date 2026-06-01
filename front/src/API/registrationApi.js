import axios from "axios";
import { API_BASE_URL } from "../Configs/apiBase";
import { doctorApi } from "./doctorApi";
import { patientService } from "../Services/patientService";
import { loadRoleDraft } from "../pages/Auth/utils/signupStorage";

const ROLE_PATH = {
  charitable: "benefactor/sign-up/",
  healthservicecenter: "service-center/sign-up/",
  charitycenter: "charity-center/sign-up/",
  socialworkunit: "social-work-unit/sign-up/",
  salamtyaran: "health-assistant/sign-up/",
  SalamtyaranSignup: "health-assistant/sign-up/",
};

const GENDER_LABEL_TO_ID = { مرد: 1, زن: 2 };
const EDUCATION_LABEL_TO_ID = {
  "زیر دیپلم": 1,
  دیپلم: 2,
  "فوق‌دیپلم": 3,
  کارشناسی: 4,
  "کارشناسی ارشد": 5,
  دکتری: 6,
};
const COOP_LABEL_TO_ID = {
  "معرفی بیمار": 1,
  "انجام امور مربوط به بیمارن": 2,
  "پروژه های ساخت و ساز": 3,
  "سایر موارد": 4,
};

function splitName(full) {
  const p = (full || "").trim().split(/\s+/);
  if (!p.length) return ["", ""];
  if (p.length === 1) return [p[0], ""];
  return [p.slice(0, -1).join(" "), p[p.length - 1]];
}

function buildBenefactorBody(draft, username, password) {
  const step = draft.step1 || draft;
  let first_name = step.first_name || "";
  let last_name = step.last_name || "";
  if (!first_name && step.name) {
    [first_name, last_name] = splitName(step.name);
  }
  return {
    username,
    password,
    first_name: first_name || "خیر",
    last_name: last_name || "-",
    gender: step.gender?.value ?? step.gender ?? 1,
    national_code: step.national_code || step.nationalCode || "",
    phone_number: step.phone_number || step.phoneNumber || "",
  };
}

function buildDoctorBody(draft, username, password) {
  const step = draft.step1 || draft;
  return {
    username,
    password,
    first_name: step.first_name,
    last_name: step.last_name,
    father_name: step.father_name,
    national_code: step.national_code,
    medical_system_code: step.medical_system_code,
    phone_number: step.phone_number,
    province: step.province,
    city: step.city,
    address: step.address,
    gender: step.gender,
    specialty: step.specialty,
    cooperating_health_assistants: [],
  };
}

function buildHealthAssistantBody(draft, username, password) {
  const s1 = draft[1] || draft.step1 || {};
  const s2 = draft[2] || draft.step2 || {};
  const profileType =
    s1.profile_type ||
    (s1.referrerType === "legal" ? "organization" : "individual");

  const coop =
    s2.cooperation_type?.value ??
    s2.collaborationType?.value ??
    COOP_LABEL_TO_ID[s2.collaborationType] ??
    s2.collaborationType;

  const body = {
    username,
    password,
    profile_type: profileType,
    cooperation_type: coop,
    cooperation_description: s2.cooperation_description || s2.explanation || "",
  };

  if (profileType === "organization") {
    body.organization_type =
      s1.organization_type?.value ?? s1.organization_type ?? s1.legalType;
    body.org_name = s1.org_name || s1.legalName || "";
    body.director_first_name = s1.director_first_name || "";
    body.director_last_name = s1.director_last_name || "";
    body.director_phone_number = s1.director_phone_number || "";
    body.director_landline_number = s1.director_landline_number || "";
    body.province = s2.province?.value ?? s2.province ?? "";
    body.city = s2.city?.value ?? s2.city ?? "";
    body.address = s2.address || "";
    body.social_unit_head_first_name = s2.social_unit_head_first_name || "";
    body.social_unit_head_last_name = s2.social_unit_head_last_name || "";
    body.social_unit_head_phone_number = s2.social_unit_head_phone_number || "";
    body.social_unit_head_landline_number =
      s2.social_unit_head_landline_number || "";
  } else {
    body.first_name = s1.first_name || "";
    body.last_name = s1.last_name || "-";
    body.gender =
      s1.gender?.value ?? GENDER_LABEL_TO_ID[s1.gender] ?? s1.gender;
    body.national_code = s1.national_code || s1.nationalCode || "";
    body.phone_number = s1.phone_number || s1.phoneNumber || "";
    body.education =
      s2.education?.value ?? EDUCATION_LABEL_TO_ID[s2.education] ?? s2.education;
    body.job = s2.job || "";
    body.province = s2.province?.value ?? s2.province ?? "";
    body.city = s2.city?.value ?? s2.city ?? "";
    body.address = s2.address || "";
    body.job_address = s2.job_address || s2.jobAddress || "";
  }

  return body;
}

export async function submitRoleRegistration(role, body) {
  const { username, password, draft } = body;

  if (role === "patient") {
    const result = await patientService.registerFromDraft(username, password);
    if (!result.success) {
      const err = new Error(result.error || "خطا در ثبت‌نام بیمار");
      err.response = { data: { detail: result.error } };
      throw err;
    }
    return { data: { message: "Patient registered" } };
  }

  if (role === "doctor") {
    const merged = loadRoleDraft("doctor");
    return doctorApi.signup(buildDoctorBody(merged, username, password));
  }

  if (role === "charitable") {
    const merged = loadRoleDraft("charitable");
    return axios.post(
      `${API_BASE_URL}/${ROLE_PATH.charitable}`,
      buildBenefactorBody(merged, username, password),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  const path = ROLE_PATH[role];
  if (!path) {
    throw new Error("نقش ثبت‌نام پشتیبانی نمی‌شود");
  }

  let payload = { username, password, draft };
  if (
    role === "salamtyaran" ||
    role === "SalamtyaranSignup"
  ) {
    const merged = loadRoleDraft("salamtyaran");
    payload = buildHealthAssistantBody(merged, username, password);
  }

  return axios.post(`${API_BASE_URL}/${path}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
}
