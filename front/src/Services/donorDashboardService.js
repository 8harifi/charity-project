import apiClient from "../API/apiClient";
import { mapBenefactorProfile } from "../utils/profileMappers";

export const donorDashboardService = {
  async getProfile() {
    const r = await apiClient.get("/profile/");
    return { data: mapBenefactorProfile(r) };
  },

  async getDonations(params) {
    const r = await apiClient.get("/benefactor/donations/", { params });
    return { data: Array.isArray(r.data) ? r.data : [] };
  },

  async getReports() {
    const r = await apiClient.get("/benefactor/reports/");
    return { data: Array.isArray(r.data) ? r.data : [] };
  },

  async getReceipts() {
    const r = await apiClient.get("/benefactor/receipts/");
    return { data: Array.isArray(r.data) ? r.data : [] };
  },

  async getFavoriteCampaigns() {
    const r = await apiClient.get("/benefactor/favorites/");
    return { data: Array.isArray(r.data) ? r.data : [] };
  },

  async updateProfile(profileData) {
    const r = await apiClient.patch("/profile/", { profile: profileData });
    return { data: mapBenefactorProfile(r) };
  },

  async downloadReport(id) {
    return apiClient.get(`/benefactor/reports/${id}/download/`, {
      responseType: "blob",
    });
  },

  async downloadReceipt(id) {
    return apiClient.get(`/benefactor/receipts/${id}/download/`, {
      responseType: "blob",
    });
  },

  async toggleFavorite(campaignId) {
    return apiClient.post(`/benefactor/favorites/${campaignId}/`);
  },
};
