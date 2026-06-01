import apiClient from "../API/apiClient";
import { mapHealthAssistantProfileFromMe } from "../utils/profileMappers";

export const healthAssistantDashboardService = {
  async getProfile() {
    const r = await apiClient.get("/profile/");
    const data = mapHealthAssistantProfileFromMe(r);
    if (!data) {
      throw new Error("پروفایل سلامتیار یافت نشد");
    }
    return { data };
  },
};
