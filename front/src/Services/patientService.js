import {
  patientApi,
  buildPatientFormFromDraft,
} from "../API/PatientApi";
import { loadRoleDraft } from "../pages/Auth/utils/signupStorage";

const ok = () => Promise.resolve({ success: true });

export const patientService = {
  signupStep1: ok,
  signupStep2: ok,
  signupStep3: ok,

  async registerFromDraft(username, password) {
    try {
      const draft = loadRoleDraft("patient");
      const form = buildPatientFormFromDraft(draft, username, password);
      await patientApi.registerPatient(form);
      return { success: true };
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data || {}) ||
        err?.message ||
        "خطا در ثبت‌نام";
      console.error(err);
      return { success: false, error: msg };
    }
  },

  async registerPatient(form) {
    try {
      await patientApi.registerPatient(form);
      return { success: true };
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data || {}) ||
        err?.message ||
        "خطا در ثبت‌نام";
      console.error(err);
      return { success: false, error: msg };
    }
  },
};
