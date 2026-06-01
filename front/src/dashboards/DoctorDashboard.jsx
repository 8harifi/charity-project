import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, FolderOpen, User } from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import RequestListPanel from "./Components/RequestListPanel";
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
      { label: "درخواست جدید", value: stats.new_in_specialty ?? 0 },
      { label: "پرونده فعال", value: stats.active_cases ?? 0 },
      { label: "تکمیل‌شده", value: stats.completed ?? 0 },
    ];
  }, [stats]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "بیماران نیازمند (جدید)", value: stats.new_in_specialty ?? 0 },
      { label: "پرونده‌های فعال", value: stats.active_cases ?? 0 },
      { label: "مشاوره‌های تکمیل‌شده", value: stats.completed ?? 0 },
    ];
  }, [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "incoming", label: "بیماران نیازمند", icon: Users },
    { id: "myCases", label: "پرونده‌های من", icon: FolderOpen },
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
      {activeTab === "overview" && <DashboardOverview cards={overviewCards} />}
      {activeTab === "incoming" && (
        <RequestListPanel
          title="بیماران نیازمند"
          fetchFn={() => requestService.doctorIncoming()}
          mode="incoming"
          showFilters={false}
        />
      )}
      {activeTab === "myCases" && (
        <RequestListPanel
          title="پرونده‌های من"
          fetchFn={(scope) => requestService.doctorMyCases(scope)}
          mode="cases"
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
