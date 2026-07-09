import apiClient from "../API/apiClient";
import { mapHealthAssistantProfileFromMe } from "../utils/profileMappers";

async function appendFile(fd, field, fileData) {
  if (!fileData || !fileData.base64) return;
  const blob = await fetch(fileData.base64).then((r) => r.blob());
  fd.append(field, blob, fileData.name || "upload.jpg");
}

export async function buildPatientFormData(form) {
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
  return fd;
}

export const healthAssistantDashboardService = {
  async getProfile() {
    const r = await apiClient.get("/profile/");
    const data = mapHealthAssistantProfileFromMe(r);
    if (!data) {
      throw new Error("پروفایل سلامتیار یافت نشد");
    }
    return { data };
  },

  async registerPatient(form) {
    const fd = await buildPatientFormData(form);
    return apiClient.post("/health-assistant/patients/register/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
