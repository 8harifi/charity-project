// src/api/doctorDashboardApi.js
import apiClient from "./apiClient";

export const doctorDashboardApi = {
  getProfile: () => apiClient.get("/profile/"),
  getCounselings: () => apiClient.get("/doctor/counselings/"),
  getAppointments: () => apiClient.get("/doctor/appointments/"),
};
