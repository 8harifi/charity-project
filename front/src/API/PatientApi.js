import apiClient from "./apiClient";

function splitName(full) {
  const p = (full || "").trim().split(/\s+/);
  if (!p.length) return ["", ""];
  if (p.length === 1) return [p[0], ""];
  return [p.slice(0, -1).join(" "), p[p.length - 1]];
}

async function appendFile(fd, field, fileData) {
  if (!fileData || !fileData.base64) return;
  const blob = await fetch(fileData.base64).then((r) => r.blob());
  fd.append(field, blob, fileData.name || "upload.jpg");
}

function resolveLookupId(raw) {
  if (raw == null || raw === "") return "";
  if (typeof raw === "object" && raw !== null) return raw.value ?? "";
  return raw;
}

export function buildPatientFormFromDraft(steps, password) {
  const s1 = steps.step1 || {};
  const s2 = steps.step2 || {};
  const s3 = steps.step3 || {};

  const headRaw = s1.head_household ?? s1.head_of_family;
  const headHousehold =
    headRaw === true ||
    headRaw === 1 ||
    headRaw === "1" ||
    headRaw === "true";

  const town = (s2.town || s2.county || "").trim();
  const addressBase = (s2.address || "").trim();
  const address =
    town && addressBase ? `${town}، ${addressBase}` : addressBase || town;

  return {
    national_code: (s1.national_code || "").trim(),
    phone_number: (s1.phone_number || s1.mobile || "").trim(),
    password: password || "",
    first_name: s1.first_name || "",
    last_name: s1.last_name || "",
    father_name: s1.father_name || "",
    gender: resolveLookupId(s1.gender),
    age: String(s1.age ?? ""),
    marital_status: resolveLookupId(s1.marital_status ?? s1.marriage_status),
    head_household: headHousehold,
    number_dependents: String(s1.number_dependents ?? s1.dependents_count ?? 0),
    family_status: s2.family_status || s2.family_description || "",
    education: resolveLookupId(s1.education),
    job_status: resolveLookupId(s1.job_status),
    skill: s2.skill || "",
    housing_status: resolveLookupId(s1.housing_status ?? s1.house_status),
    covered_organization: resolveLookupId(
      s1.covered_organization ?? s1.supported_organ
    ),
    landline_number: s1.landline_number || s1.phone || "",
    health_assistant_code: (s1.health_assistant_code || "").trim(),
    province: s2.province || "",
    city: s2.city || "",
    address,
    contact1_full_name: s2.contact1_full_name || "",
    contact1_phone_number: s2.contact1_phone_number || "",
    contact2_full_name: s2.contact2_full_name || "",
    contact2_phone_number: s2.contact2_phone_number || "",
    insurance: resolveLookupId(s3.insurance ?? s3.insuranceType),
    sickness_description: s2.sickness_description || "",
    national_card_image: s3.national_card_image ?? s3.nationalCardImage,
    birth_certificate_image:
      s3.birth_certificate_image ?? s3.identificationImage,
  };
}

export async function registerPatient(form) {
  const fd = new FormData();
  fd.append("national_code", form.national_code || "");
  fd.append("phone_number", form.phone_number || "");
  fd.append("password", form.password || "");
  fd.append("first_name", form.first_name);
  fd.append("last_name", form.last_name);
  fd.append("father_name", form.father_name || "");
  fd.append("gender", String(form.gender ?? ""));
  fd.append("age", String(form.age || ""));
  fd.append("marital_status", String(form.marital_status ?? ""));
  fd.append("head_household", form.head_household ? "true" : "false");
  fd.append("number_dependents", String(form.number_dependents || 0));
  fd.append("family_status", form.family_status || "");
  fd.append("education", String(form.education ?? ""));
  fd.append("job_status", String(form.job_status ?? ""));
  fd.append("skill", form.skill || "");
  fd.append("housing_status", String(form.housing_status ?? ""));
  fd.append("covered_organization", String(form.covered_organization ?? ""));
  fd.append("landline_number", form.landline_number || "");
  fd.append("health_assistant_code", form.health_assistant_code || "");
  fd.append("province", form.province || "");
  fd.append("city", form.city || "");
  fd.append("address", form.address || "");
  fd.append("contact1_full_name", form.contact1_full_name || "");
  fd.append("contact1_phone_number", form.contact1_phone_number || "");
  fd.append("contact2_full_name", form.contact2_full_name || "");
  fd.append("contact2_phone_number", form.contact2_phone_number || "");
  fd.append("insurance", String(form.insurance ?? ""));
  fd.append("sickness_description", form.sickness_description || "");

  await appendFile(fd, "national_card_image", form.national_card_image);
  await appendFile(fd, "birth_certificate_image", form.birth_certificate_image);

  return apiClient.post("/patient/sign-up/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export const patientApi = {
  registerPatient,
  buildPatientFormFromDraft,
};
