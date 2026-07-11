import apiClient from "../API/apiClient";

export const adminService = {
  getStats() {
    return apiClient.get("/admin/stats/");
  },
  listUsers(params = {}) {
    return apiClient.get("/admin/users/", { params });
  },
  exportUsers(params = {}, format = "csv") {
    return apiClient.get("/admin/users/export/", {
      params: { ...params, export_as: format },
      responseType: "blob",
    });
  },
  getUser(userId) {
    return apiClient.get(`/admin/users/${userId}/`);
  },
  updateUser(userId, data) {
    return apiClient.patch(`/admin/users/${userId}/`, data);
  },
  getUserRequests(userId, scope = "all") {
    return apiClient.get(`/admin/users/${userId}/requests/`, { params: { scope } });
  },
  approveUser(userId) {
    return apiClient.post(`/admin/approve-user/${userId}/`);
  },
  rejectUser(userId) {
    return apiClient.post(`/admin/reject-user/${userId}/`);
  },
  listRequests(params = {}) {
    return apiClient.get("/admin/requests/", { params });
  },
  listLookupTypes() {
    return apiClient.get("/admin/lookups/");
  },
  listLookupItems(slug) {
    return apiClient.get(`/admin/lookups/${slug}/`);
  },
  createLookupItem(slug, name) {
    return apiClient.post(`/admin/lookups/${slug}/`, { name });
  },
  updateLookupItem(slug, itemId, name) {
    return apiClient.patch(`/admin/lookups/${slug}/${itemId}/`, { name });
  },
  deleteLookupItem(slug, itemId) {
    return apiClient.delete(`/admin/lookups/${slug}/${itemId}/`);
  },
  listCampaigns() {
    return apiClient.get("/admin/campaigns/");
  },
  createCampaign(data) {
    return apiClient.post("/admin/campaigns/", data);
  },
  updateCampaign(id, data) {
    return apiClient.patch(`/admin/campaigns/${id}/`, data);
  },
  deleteCampaign(id) {
    return apiClient.delete(`/admin/campaigns/${id}/`);
  },
};

export const ROLE_LABELS = {
  patient: "بیمار",
  doctor: "پزشک",
  health_assistant: "سلامتیار",
  benefactor: "خیر",
  admin: "مدیر",
  service_center: "مرکز خدمات",
  charity_center: "مرکز نیکوکاری",
  social_work_unit: "واحد مددکاری",
};

export const ROLE_DASHBOARD_HINTS = {
  patient: "پیشخوان، ثبت درخواست، درخواست‌های من، پروفایل",
  doctor: "پیشخوان، درخواست‌های ورودی، پرونده‌های من، پروفایل",
  health_assistant: "پیشخوان، بیماران من، درخواست‌ها، پروفایل",
  benefactor: "پیشخوان، کیف پول، درخواست‌های حمایت مالی، حمایت‌های من",
};

export function fkId(value) {
  if (value == null) return "";
  if (typeof value === "object") return value.id ?? "";
  return value;
}

export function fkLabel(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "object") return value.name || "—";
  return String(value);
}
