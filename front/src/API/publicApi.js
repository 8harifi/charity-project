import apiClient from "./apiClient";

export const publicApi = {
  healthAssistants(params = {}) {
    return apiClient.get("/health-assistants/public/", { params });
  },
  stats() {
    return apiClient.get("/public/stats/");
  },
  medicalCenters(params = {}) {
    return apiClient.get("/public/medical-centers/", { params });
  },
  supportingOrgs(params = {}) {
    return apiClient.get("/public/supporting-orgs/", { params });
  },
  fundableRequests(params = {}) {
    return apiClient.get("/public/fundable-requests/", { params });
  },
  sendContact(data) {
    return apiClient.post("/contact-messages/", data);
  },
  passwordReset(phone) {
    return apiClient.post("/password-reset/", { phone });
  },
  passwordResetConfirm({ phone, code, new_password }) {
    return apiClient.post("/password-reset/confirm/", { phone, code, new_password });
  },
};
