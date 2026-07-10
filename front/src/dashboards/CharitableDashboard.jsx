import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Heart,
  User,
  Wallet as WalletIcon,
  TrendingUp,
  CheckCircle2,
  HandHeart,
} from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import RequestListPanel from "./Components/RequestListPanel";
import BenefactorSupportPanel from "./Components/BenefactorSupportPanel";
import WalletPanel from "./Components/WalletPanel";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import { donorDashboardService } from "../Services/donorDashboardService";
import { dashboardService, requestService } from "../Services/dashboardApi";
import { walletService } from "../Services/walletService";
import { benefactorProfileFields } from "../utils/profileMappers";

const CharitableDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const initialCampaignId = searchParams.get("campaignId") || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const loadProfile = useCallback(async () => {
    const r = await donorDashboardService.getProfile();
    setProfile(r.data);
  }, []);

  const loadWalletBalance = useCallback(async () => {
    try {
      const r = await walletService.getWallet();
      setWalletBalance(Number(r.data.balance || 0));
    } catch {
      setWalletBalance(0);
    }
  }, []);

  const refreshStats = useCallback(() => {
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
    loadWalletBalance();
  }, [loadWalletBalance]);

  useEffect(() => {
    loadProfile();
    refreshStats();
  }, [loadProfile, refreshStats]);

  useEffect(() => {
    if (initialCampaignId) {
      setActiveTab("wallet");
    }
  }, [initialCampaignId]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearchParams(id === "overview" ? {} : { tab: id });
  };

  const headerStats = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "موجودی کیف پول", value: (stats.wallet_balance ?? walletBalance).toLocaleString("fa-IR") },
      { label: "درخواست جدید", value: stats.pending_requests ?? 0 },
      { label: "حمایت فعال", value: stats.active_cases ?? 0 },
    ];
  }, [stats, walletBalance]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "موجودی کیف پول",
        value: (stats.wallet_balance ?? walletBalance).toLocaleString("fa-IR"),
        hint: "تومان",
        icon: WalletIcon,
      },
      {
        label: "مجموع کمک‌های پرداخت‌شده",
        value: (stats.total_donated_amount ?? 0).toLocaleString("fa-IR"),
        hint: "تومان",
        icon: TrendingUp,
      },
      { label: "تعهدات فعال", value: stats.active_pledges ?? 0, hint: "در انتظار تسویه", icon: HandHeart },
      { label: "درخواست‌های تأمین‌شده", value: stats.requests_funded ?? 0, icon: CheckCircle2 },
      { label: "کل کمک‌ها", value: stats.total_donations ?? 0 },
      { label: "بیماران کمک‌شده", value: stats.patients_helped ?? 0 },
    ];
  }, [stats, walletBalance]);

  const overviewChart = useMemo(() => stats?.status_breakdown ?? [], [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "wallet", label: "کیف پول", icon: WalletIcon },
    { id: "incoming", label: "درخواست‌های حمایت مالی", icon: Inbox },
    { id: "mySupport", label: "حمایت‌های من", icon: Heart },
    { id: "profile", label: "پروفایل", icon: User },
  ];

  const handleWalletPay = async (requestId, payAmount) => {
    await walletService.donate({
      amount: payAmount,
      destination_type: "request",
      network_request_id: requestId,
    });
    refreshStats();
  };

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
      {activeTab === "overview" && (
        <DashboardOverview cards={overviewCards} chart={overviewChart} chartTitle="وضعیت حمایت‌های من" />
      )}

      {activeTab === "wallet" && <WalletPanel onBalanceChange={refreshStats} />}

      {activeTab === "incoming" && (
        <RequestListPanel
          title="نیازهای مالی باز"
          fetchFn={(scope, filters) => requestService.benefactorIncoming(filters)}
          mode="view"
          showFilters={false}
          advancedFilters
          enableWalletPay
          walletBalance={walletBalance}
          onWalletPay={handleWalletPay}
        />
      )}

      {activeTab === "mySupport" && (
        <BenefactorSupportPanel onWalletPay={handleWalletPay} onRefresh={refreshStats} />
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
