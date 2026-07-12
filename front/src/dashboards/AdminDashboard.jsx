import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  List,
  Database,
  Shield,
  Megaphone,
  Wallet,
} from "lucide-react";
import AdminWalletPanel from "./Components/AdminWalletPanel";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import AdminUsersPanel from "./Components/AdminUsersPanel";
import AdminLookupsPanel from "./Components/AdminLookupsPanel";
import AdminCampaignsPanel from "./Components/AdminCampaignsPanel";
import RequestListPanel from "./Components/RequestListPanel";
import { adminService } from "../Services/adminService";
import { dashboardService, profileService } from "../Services/dashboardApi";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const r = await profileService.getProfile();
      const u = r.data;
      setProfile({
        name: u.first_name || u.profile?.first_name || "مدیر",
        username: u.profile?.phone_number || u.username,
        phone: u.profile?.phone_number || u.username,
        avatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
          encodeURIComponent(u.username || "admin"),
        memberSince: "—",
        state: true,
      });
    } catch {
      setProfile({
        name: "مدیر",
        username: "admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        memberSince: "—",
        state: true,
      });
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const r = await adminService.getStats();
      setStats(r.data);
    } catch (err) {
      const fallback = await dashboardService.getStats().catch(() => null);
      setStats(fallback?.data || {});
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [loadProfile, loadStats]);

  const headerStats = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "کل کاربران", value: stats.total_users ?? 0 },
      { label: "در انتظار تایید", value: stats.pending_users ?? 0 },
      { label: "درخواست‌ها", value: stats.total_requests ?? 0 },
      { label: "درخواست معلق", value: stats.pending_requests ?? 0 },
    ];
  }, [stats]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "بیماران", value: stats.patients ?? 0 },
      { label: "پزشکان", value: stats.doctors ?? 0 },
      { label: "سلامتیاران", value: stats.health_assistants ?? 0 },
      { label: "خیرین", value: stats.benefactors ?? 0 },
      { label: "کاربران فعال", value: stats.active_users ?? 0 },
      { label: "کل کمک‌ها", value: stats.total_donations ?? 0 },
      { label: "کمپین‌های فعال", value: stats.published_campaigns ?? 0 },
    ];
  }, [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "users", label: "کاربران", icon: Users },
    { id: "requests", label: "درخواست‌ها", icon: List },
    { id: "campaigns", label: "کمپین‌ها", icon: Megaphone },
    { id: "wallet", label: "کیف پول / پرداخت", icon: Wallet },
    { id: "lookups", label: "lookup ها", icon: Database },
    { id: "profile", label: "حساب مدیر", icon: Shield },
  ];

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
      onTabChange={setActiveTab}
      approvalPending={false}
    >
      {activeTab === "overview" && <DashboardOverview cards={overviewCards} />}

      {activeTab === "users" && <AdminUsersPanel />}

      {activeTab === "requests" && (
        <RequestListPanel
          title="همه درخواست‌های شبکه"
          fetchFn={(scope) => adminService.listRequests({ scope })}
          mode="view"
          showFilters
        />
      )}

      {activeTab === "campaigns" && <AdminCampaignsPanel />}

      {activeTab === "wallet" && <AdminWalletPanel />}

      {activeTab === "lookups" && <AdminLookupsPanel />}

      {activeTab === "profile" && (
        <div className="text-right space-y-4 max-w-lg">
          <h2 className="text-xl font-bold text-gray-800">حساب مدیر</h2>
          <p className="text-gray-600 text-sm">
            شماره موبایل: <strong>{profile.phone || profile.username}</strong>
          </p>
          <p className="text-gray-500 text-sm">
            از تب «کاربران» می‌توانید همه اعضا را مدیریت کنید. از تب «lookup ها» فیلدهای
            انتخابی ثبت‌نام (جنسیت، بیمه، تخصص و ...) را ویرایش کنید.
          </p>
        </div>
      )}
    </DashboardShell>
  );
};

export default AdminDashboard;
