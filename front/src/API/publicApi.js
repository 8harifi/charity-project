import apiClient from "./apiClient";

export const publicApi = {
  healthAssistants(params = {}) {
    return apiClient.get("/health-assistants/public/", { params });
  },
};
