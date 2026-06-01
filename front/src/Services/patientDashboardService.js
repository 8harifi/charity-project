import apiClient from "../API/apiClient";
import { mapPatientProfile } from "../utils/profileMappers";

export const patientDashboardService = {
  async getProfile() {
    const r = await apiClient.get("/profile/");
    return { data: mapPatientProfile(r) };
  },
};
