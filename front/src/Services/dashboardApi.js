import apiClient from "../API/apiClient";

export const requestService = {
  list(scope = "active") {
    return apiClient.get("/requests/", { params: { scope } });
  },
  get(id) {
    return apiClient.get(`/requests/${id}/`);
  },
  create(data) {
    return apiClient.post("/requests/", data);
  },
  updateStatus(id, action, note = "") {
    return apiClient.patch(`/requests/${id}/status/`, { action, note });
  },
  doctorIncoming() {
    return apiClient.get("/doctor/incoming-requests/");
  },
  doctorMyCases(scope = "active") {
    return apiClient.get("/doctor/my-cases/", { params: { scope } });
  },
  benefactorIncoming() {
    return apiClient.get("/benefactor/incoming-requests/");
  },
  benefactorMyCases(scope = "active") {
    return apiClient.get("/benefactor/my-cases/", { params: { scope } });
  },
  healthAssistantPatients() {
    return apiClient.get("/health-assistant/patients/");
  },
};

export const dashboardService = {
  getStats() {
    return apiClient.get("/dashboard/stats/");
  },
};

export const profileService = {
  getProfile() {
    return apiClient.get("/profile/");
  },
  updateProfile(profileData) {
    return apiClient.patch("/profile/", { profile: profileData });
  },
};

export const donationService = {
  list() {
    return apiClient.get("/benefactor/donations/");
  },
  create(data) {
    return apiClient.post("/benefactor/donations/", data);
  },
};

export async function fetchSpecialties() {
  const r = await apiClient.get("/lookups/specialties/");
  return Array.isArray(r.data) ? r.data : r.data?.results || [];
}

export const campaignService = {
  list() {
    return apiClient.get("/campaigns/");
  },
};
