import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  FolderOpen,
  HandHeart,
  Heart,
  User,
  Wallet as WalletIcon,
} from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import RequestListPanel from "./Components/RequestListPanel";
import WalletPanel from "./Components/WalletPanel";
import SearchBox from "./Components/SearchBox";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import RenderDropdown from "../pages/Auth/components/DropDown";
import { donorDashboardService } from "../Services/donorDashboardService";
import { campaignService, dashboardService, donationService, requestService } from "../Services/dashboardApi";
import { walletService } from "../Services/walletService";
import { benefactorProfileFields } from "../utils/profileMappers";

const DESTINATION_OPTIONS = [
  { label: "کمپین", value: "campaign" },
  { label: "بیمار", value: "patient" },
  { label: "عمومی", value: "general" },
];

function dropdownValue(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object" && value.value !== undefined && value.value !== null) {
    return String(value.value);
  }
  return String(value);
}

const CharitableDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const initialCampaignId = searchParams.get("campaignId") || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [destinationType, setDestinationType] = useState("campaign");
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [patientId, setPatientId] = useState("");
  const [networkRequestId, setNetworkRequestId] = useState("");
  const [donationMsg, setDonationMsg] = useState("");
  const [campaignOptions, setCampaignOptions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [donating, setDonating] = useState(false);

  const loadProfile = useCallback(async () => {
    const r = await donorDashboardService.getProfile();
    setProfile(r.data);
  }, []);

  const loadDonations = useCallback(async () => {
    try {
      const r = await donationService.list();
      setDonations(Array.isArray(r.data) ? r.data : []);
    } catch {
      setDonations([]);
    }
  }, []);

  const loadWalletBalance = useCallback(async () => {
    try {
      const r = await walletService.getWallet();
      setWalletBalance(Number(r.data.balance || 0));
    } catch {
      setWalletBalance(0);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
    loadDonations();
    loadWalletBalance();
    campaignService.list().then((r) => {
      const list = Array.isArray(r.data) ? r.data : [];
      setCampaignOptions(list.map((c) => ({ label: c.title, value: String(c.id) })));
    }).catch(() => setCampaignOptions([]));
  }, [loadProfile, loadDonations, loadWalletBalance]);

  useEffect(() => {
    if (initialCampaignId) {
      setDestinationType("campaign");
      setCampaignId(initialCampaignId);
      setActiveTab("newDonation");
    }
  }, [initialCampaignId]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearch("");
    setSearchParams(id === "overview" ? {} : { tab: id });
  };

  const headerStats = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "موجودی کیف پول", value: (stats.wallet_balance ?? walletBalance).toLocaleString("fa-IR") },
      { label: "درخواست جدید", value: stats.pending_requests ?? 0 },
      { label: "پرونده فعال", value: stats.active_cases ?? 0 },
    ];
  }, [stats, walletBalance]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "موجودی کیف پول", value: (stats.wallet_balance ?? walletBalance).toLocaleString("fa-IR"), hint: "تومان" },
      { label: "درخواست‌های در انتظار", value: stats.pending_requests ?? 0 },
      { label: "پرونده‌های فعال", value: stats.active_cases ?? 0 },
      { label: "کل کمک‌ها", value: stats.total_donations ?? 0 },
    ];
  }, [stats, walletBalance]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "wallet", label: "کیف پول", icon: WalletIcon },
    { id: "incoming", label: "درخواست‌های حمایت مالی", icon: Inbox },
    { id: "myCases", label: "پرونده‌های حمایت", icon: FolderOpen },
    { id: "newDonation", label: "ثبت کمک جدید", icon: HandHeart },
    { id: "myDonations", label: "کمک‌های من", icon: Heart },
    { id: "profile", label: "پروفایل", icon: User },
  ];

  const handleDonationSubmit = async () => {
    setDonationMsg("");
    const amt = Number(amount);
    const dest = dropdownValue(destinationType);
    const selectedCampaignId = dropdownValue(campaignId);
    const selectedPatientId = dropdownValue(patientId);
    const selectedRequestId = dropdownValue(networkRequestId);

    if (!amt || amt <= 0) {
      setDonationMsg("مبلغ را وارد کنید.");
      return;
    }
    if (walletBalance < amt) {
      setDonationMsg("موجودی کیف پول کافی نیست. از تب «کیف پول» شارژ کنید.");
      return;
    }
    if (dest === "campaign" && !selectedCampaignId) {
      setDonationMsg("کمپین را انتخاب کنید.");
      return;
    }
    if (dest === "patient" && !selectedPatientId) {
      setDonationMsg("شناسه بیمار را وارد کنید.");
      return;
    }
    if (dest === "request" && !selectedRequestId) {
      setDonationMsg("شناسه درخواست را وارد کنید.");
      return;
    }

    setDonating(true);
    try {
      const payload = {
        amount: amt,
        destination_type: dest,
      };
      if (dest === "campaign") payload.campaign_id = Number(selectedCampaignId);
      if (dest === "patient") payload.patient_id = Number(selectedPatientId);
      if (dest === "request") payload.network_request_id = Number(selectedRequestId);

      await walletService.donate(payload);
      setAmount("");
      setDonationMsg("کمک با موفقیت از کیف پول پرداخت شد.");
      loadDonations();
      loadWalletBalance();
      dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
    } catch (err) {
      setDonationMsg(err.response?.data?.detail || "خطا در ثبت کمک.");
    } finally {
      setDonating(false);
    }
  };

  const filteredDonations = donations.filter(
    (d) =>
      (d.patient_label || d.patient || "").includes(search) ||
      (d.title || "").includes(search) ||
      (d.campaign || d.campaign_title || "").includes(search)
  );

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <DashboardShell
      profile={profile}
      stats={headerStats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      approvalPending={profile.state === false}
    >
      {activeTab === "overview" && <DashboardOverview cards={overviewCards} />}

      {activeTab === "wallet" && (
        <WalletPanel
          onBalanceChange={(b) => {
            setWalletBalance(b);
            loadWalletBalance();
          }}
        />
      )}

      {activeTab === "incoming" && (
        <RequestListPanel
          title="درخواست‌های حمایت مالی"
          fetchFn={() => requestService.benefactorIncoming()}
          mode="incoming"
          showFilters={false}
        />
      )}

      {activeTab === "myCases" && (
        <RequestListPanel
          title="پرونده‌های حمایت"
          fetchFn={(scope) => requestService.benefactorMyCases(scope)}
          mode="cases"
          enableWalletPay
          walletBalance={walletBalance}
          onWalletPay={async (requestId, payAmount) => {
            await walletService.donate({
              amount: payAmount,
              destination_type: "request",
              network_request_id: requestId,
            });
            loadWalletBalance();
            loadDonations();
          }}
        />
      )}

      {activeTab === "newDonation" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-right">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">ثبت کمک از کیف پول</h2>
            <p className="text-sm text-gray-500 mt-2">
              موجودی: {walletBalance.toLocaleString("fa-IR")} تومان
            </p>
          </div>
          <div className="max-w-xl mx-auto bg-gray-50 p-5 sm:p-8 rounded-2xl border border-gray-100">
            <div className="space-y-5">
              <RenderDropdown
                value={destinationType}
                setValue={setDestinationType}
                options={DESTINATION_OPTIONS}
                placeholder="نوع کمک"
                name="donation-destination"
              />
              <label className="text-sm font-medium">مبلغ کمک (تومان)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="مبلغ مورد نظر..."
              />
              {dropdownValue(destinationType) === "campaign" && (
                <RenderDropdown
                  value={campaignId}
                  setValue={setCampaignId}
                  options={campaignOptions}
                  placeholder="انتخاب کمپین"
                  name="donation-campaign"
                />
              )}
              {dropdownValue(destinationType) === "patient" && (
                <input
                  type="number"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200"
                  placeholder="شناسه بیمار"
                />
              )}
              {dropdownValue(destinationType) === "request" && (
                <input
                  type="number"
                  value={networkRequestId}
                  onChange={(e) => setNetworkRequestId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200"
                  placeholder="شناسه درخواست مالی"
                />
              )}
              <button
                type="button"
                onClick={handleDonationSubmit}
                disabled={donating || walletBalance < Number(amount || 0)}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg disabled:opacity-50"
              >
                {donating ? "در حال پرداخت..." : "پرداخت از کیف پول"}
              </button>
              {walletBalance < Number(amount || 0) && amount && (
                <button
                  type="button"
                  onClick={() => handleTabChange("wallet")}
                  className="w-full py-2 text-emerald-700 text-sm font-semibold"
                >
                  شارژ کیف پول
                </button>
              )}
            </div>
            {donationMsg && (
              <p className="text-sm text-center mt-4 text-emerald-700">{donationMsg}</p>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "myDonations" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-right">
          <div className="flex justify-start mb-6">
            <SearchBox value={search} onChange={setSearch} placeholder="جستجو..." />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">کمک‌های من</h2>
          {filteredDonations.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">کمکی ثبت نشده است.</p>
          ) : (
            <div className="space-y-4">
              {filteredDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {donation.title || donation.campaign_title || donation.campaign || "کمک"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {donation.date} — {donation.status_label || donation.status}
                        {donation.destination_type && ` — ${donation.destination_type}`}
                      </p>
                      {donation.patient_label && (
                        <p className="text-xs text-gray-400 mt-1">بیمار: {donation.patient_label}</p>
                      )}
                    </div>
                    {donation.amount && (
                      <p className="text-xl font-bold text-emerald-600">
                        {Number(donation.amount).toLocaleString("fa-IR")}{" "}
                        <span className="text-xs font-normal">تومان</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "profile" && (
        <ProfileTabContent
          fields={benefactorProfileFields(profile)}
          role="benefactor"
          profile={profile}
          onProfileRefresh={loadProfile}
        />
      )}
    </DashboardShell>
  );
};

export default CharitableDashboard;
