import apiClient from "../API/apiClient";

export const requestService = {
  list(scope = "active", params = {}) {
    return apiClient.get("/requests/", { params: { scope, ...params } });
  },
  get(id) {
    return apiClient.get(`/requests/${id}/`);
  },
  create(data, files = []) {
    if (files.length > 0) {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v != null && v !== "") form.append(k, v);
      });
      files.forEach((f) => form.append("attachments", f));
      return apiClient.post("/requests/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return apiClient.post("/requests/", data);
  },
  updateStatus(id, actionOrPayload, note = "") {
    const payload =
      typeof actionOrPayload === "object"
        ? actionOrPayload
        : { action: actionOrPayload, note };
    return apiClient.patch(`/requests/${id}/status/`, payload);
  },
  update(id, data) {
    return apiClient.patch(`/requests/${id}/`, data);
  },
  remove(id) {
    return apiClient.delete(`/requests/${id}/`);
  },
  setStatus(id, newStatus, note) {
    return apiClient.patch(`/requests/${id}/status/`, {
      action: "set_status",
      status: newStatus,
      note,
    });
  },
  patientWorkflow(patientId) {
    return apiClient.get(`/patients/${patientId}/workflow/`);
  },
  doctorIncoming() {
    return apiClient.get("/doctor/incoming-requests/");
  },
  doctorMyCases(scope = "active") {
    return apiClient.get("/doctor/my-cases/", { params: { scope } });
  },
  benefactorIncoming(filters = {}) {
    return apiClient.get("/benefactor/incoming-requests/", { params: filters });
  },
  benefactorMyCases(scope = "active", filters = {}) {
    return apiClient.get("/benefactor/my-cases/", { params: { scope, ...filters } });
  },
  healthAssistantPatients() {
    return apiClient.get("/health-assistant/patients/");
  },
  healthAssistantBrowsePatients(params = {}) {
    return apiClient.get("/health-assistant/patients/browse/", { params });
  },
  healthAssistantUpdatePatient(patientId, profileData) {
    return apiClient.patch(`/health-assistant/patients/${patientId}/`, { profile: profileData });
  },
  healthAssistantOrphans() {
    return apiClient.get("/health-assistant/patients/orphans/");
  },
  healthAssistantSearchPatients(q) {
    return apiClient.get("/health-assistant/patients/search/", { params: { q } });
  },
  claimPatient(patientId) {
    return apiClient.post(`/health-assistant/patients/${patientId}/claim/`);
  },
  removePatient(patientId) {
    return apiClient.post(`/health-assistant/patients/${patientId}/remove/`);
  },
  approveIntroducedPatient(patientId) {
    return apiClient.post(`/health-assistant/patients/${patientId}/approve/`);
  },
  fundRecipientOptions() {
    return apiClient.get("/requests/fund-recipients/");
  },
  staffRequests() {
    return apiClient.get("/staff-requests/");
  },
  createStaffRequest(data) {
    return apiClient.post("/staff-requests/", data);
  },
  updateStaffRequestStatus(id, action, note = "") {
    return apiClient.patch(`/staff-requests/${id}/status/`, { action, note });
  },
  orgSubordinates(params = {}) {
    return apiClient.get("/health-assistant/subordinates/", { params });
  },
  linkOrgSubordinate(healthAssistantId) {
    return apiClient.post("/health-assistant/subordinates/", {
      health_assistant_id: healthAssistantId,
    });
  },
  orgSubordinateAction(id, action) {
    return apiClient.patch(`/health-assistant/subordinates/${id}/`, { action });
  },
  globalSearch(params) {
    return apiClient.get("/global-search/", { params });
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
  updateProfile(profileData, imageFile = null) {
    if (imageFile) {
      const form = new FormData();
      form.append("profile", JSON.stringify(profileData || {}));
      form.append("profile_image", imageFile);
      return apiClient.patch("/profile/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
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

export const walletServiceGuest = {
  guestDonate(campaignId, amount) {
    return apiClient.post("/wallet/donate/guest/", {
      campaign_id: campaignId,
      amount,
    });
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

export const payoutService = {
  get() {
    return apiClient.get("/payout/");
  },
  updateAccount(data) {
    return apiClient.put("/payout/", data);
  },
  requestWithdrawal(data) {
    return apiClient.post("/payout/withdrawals/", data);
  },
  adminList(params = {}) {
    return apiClient.get("/admin/withdrawals/", { params });
  },
  adminAction(id, action, note = "") {
    return apiClient.patch(`/admin/withdrawals/${id}/`, { action, note });
  },
};
