import { USE_MOCK_API } from "../Configs/apiConfig";
import { doctorApi } from "../API/doctorApi";
import { doctorDashboardApi } from "../API/doctorDashboardApi";
import { mockDoctorDashboardApi } from "../Mock/mockDoctorDashboardApi";
import { mapDoctorProfile } from "../utils/profileMappers";

export const doctorService = {
  submitSignup: (payload) => doctorApi.signup(payload),
  submitStep1: async (payload) => ({ data: payload }),
  getProfile: async () => {
    if (USE_MOCK_API) return mockDoctorDashboardApi.getProfile();
    const r = await doctorDashboardApi.getProfile();
    return { data: mapDoctorProfile(r) };
  },
  getCounselings: async () => {
    if (USE_MOCK_API) return mockDoctorDashboardApi.getCounselings();
    const r = await doctorDashboardApi.getCounselings();
    return { data: Array.isArray(r.data) ? r.data : [] };
  },
  getAppointments: async () => {
    if (USE_MOCK_API) return mockDoctorDashboardApi.getAppointments();
    const r = await doctorDashboardApi.getAppointments();
    return { data: Array.isArray(r.data) ? r.data : [] };
  },
};
