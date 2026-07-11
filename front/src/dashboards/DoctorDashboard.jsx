import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, ClipboardList, User, CheckCircle2 } from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import DoctorRequestPanel from "./Components/DoctorRequestPanel";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import { doctorService } from "../Services/doctorDashboardService";
import { dashboardService, requestService } from "../Services/dashboardApi";
import { doctorProfileFields } from "../utils/profileMappers";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  const loadProfile = useCallback(async () => {
    const r = await doctorService.getProfile();
    setProfile(r.data);
  }, []);

  useEffect(() => {
    loadProfile();
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
  }, [loadProfile]);

  const headerStats = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "درخواست جدید", value: stats.new_requests ?? stats.new_in_specialty ?? 0 },
      { label: "در جریان", value: stats.active_cases ?? 0 },
      { label: "تکمیل‌شده", value: stats.completed ?? 0 },
    ];
  }, [stats]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "درخواست‌های جدید بیماران",
        value: stats.new_requests ?? stats.new_in_specialty ?? 0,
        icon: Users,
      },
      { label: "درخواست‌های در جریان", value: stats.active_cases ?? 0, icon: ClipboardList },
      { label: "تکمیل‌شده", value: stats.completed ?? 0, icon: CheckCircle2 },
    ];
  }, [stats]);

  const overviewChart = useMemo(() => stats?.status_breakdown ?? [], [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "incoming", label: "درخواست‌های بیماران", icon: Users },
    { id: "myActive", label: "درخواست‌های من", icon: ClipboardList },
    { id: "profile", label: "پروفایل", icon: User },
  ];

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
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
      approvalPending={profile.state === false}
    >
      {activeTab === "overview" && (
        <DashboardOverview
          cards={overviewCards}
          chart={overviewChart}
          chartTitle="وضعیت درخواست‌های من"
        />
      )}
      {activeTab === "incoming" && (
        <DoctorRequestPanel
          title="درخواست‌های بیماران"
          fetchFn={() => requestService.doctorIncoming()}
          mode="incoming"
        />
      )}
      {activeTab === "myActive" && (
        <DoctorRequestPanel
          title="درخواست‌های من"
          fetchFn={(scope) => requestService.doctorMyCases(scope)}
          mode="active"
          showFilters
        />
      )}
      {activeTab === "profile" && (
        <ProfileTabContent
          fields={doctorProfileFields(profile)}
          role="doctor"
          profile={profile}
          onProfileRefresh={loadProfile}
        />
      )}
    </DashboardShell>
  );
};

export default DoctorDashboard;
