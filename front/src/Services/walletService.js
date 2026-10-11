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
  adjustPledge(networkRequestId, amount) {
    return apiClient.post("/wallet/donate/adjust-pledge/", {
      network_request_id: networkRequestId,
      amount,
    });
  },
  getPatientAidSummary() {
    return apiClient.get("/patient/aid-summary/");
  },
};

export const adminWalletService = {
  listGatewayPayments(params = {}) {
    return apiClient.get("/admin/wallet/payments/", { params });
  },
  listWallets(search = "") {
    return apiClient.get("/admin/wallets/", { params: { search } });
  },
  adjustBalance(data) {
    // data: { phone_number, direction: "credit"|"debit", amount, reason }
    return apiClient.post("/admin/wallet/adjust/", data);
  },
  listPledges(params = {}) {
    return apiClient.get("/admin/wallet/pledges/", { params });
  },
  listGeneralDonations(params = {}) {
    return apiClient.get("/admin/wallet/general-donations/", { params });
  },
  payRequest(networkRequestId, amount) {
    return apiClient.post("/admin/wallet/pay-request/", {
      network_request_id: networkRequestId,
      amount,
    });
  },
};
