import apiClient from "./apiClient";

export const doctorApi = {
  signup: (payload) => apiClient.post("/doctor/sign-up/", payload),
};
