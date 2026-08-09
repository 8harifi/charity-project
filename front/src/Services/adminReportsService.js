import apiClient from "../API/apiClient";

function listReport(path, params = {}) {
  return apiClient.get(`/admin/reports/${path}/`, { params });
}

export const adminReportsService = {
  listTransactions(params) {
    return listReport("transactions", params);
  },
  listGatewayPayments(params) {
    return listReport("gateway-payments", params);
  },
  listDonations(params) {
    return listReport("donations", params);
  },
  listPledges(params) {
    return listReport("pledges", params);
  },
  listWorkflow(params) {
    return listReport("workflow", params);
  },
  listRequests(params) {
    return listReport("requests", params);
  },
  listRegistrations(params) {
    return listReport("registrations", params);
  },
  listStaffRequests(params) {
    return listReport("staff-requests", params);
  },
  listOrgApplications(params) {
    return listReport("org-applications", params);
  },
  listAudit(params) {
    return listReport("audit", params);
  },
  exportCsv(path, params = {}) {
    return apiClient.get(`/admin/reports/${path}/`, {
      params: { ...params, export: "csv" },
      responseType: "blob",
    });
  },
};
