import apiClient from "../API/apiClient";

export const walletService = {
  getWallet() {
    return apiClient.get("/wallet/");
  },
  getTransactions(params = {}) {
    return apiClient.get("/wallet/transactions/", { params });
  },
  topUp(amount) {
    return apiClient.post("/wallet/topup/", { amount });
  },
  donate(data) {
    return apiClient.post("/wallet/donate/", data);
  },
  getPatientAidSummary() {
    return apiClient.get("/patient/aid-summary/");
  },
};

export const adminWalletService = {
  listGatewayPayments(params = {}) {
    return apiClient.get("/admin/wallet/payments/", { params });
  },
  listDisbursements() {
    return apiClient.get("/admin/disbursements/");
  },
  createDisbursement(data) {
    return apiClient.post("/admin/disbursements/", data);
  },
  updateDisbursement(id, data) {
    return apiClient.patch(`/admin/disbursements/${id}/`, data);
  },
};
