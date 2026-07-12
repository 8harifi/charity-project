import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutDashboard, FilePlus, List, User, Clock, CheckCircle2 } from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import NewRequestForm from "./Components/NewRequestForm";
import RequestListPanel from "./Components/RequestListPanel";
import PatientWorkflowTimeline from "./Components/PatientWorkflowTimeline";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import { patientDashboardService } from "../Services/patientDashboardService";
import { dashboardService, requestService } from "../Services/dashboardApi";
import { patientProfileFields } from "../utils/profileMappers";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  const loadProfile = useCallback(async () => {
    const r = await patientDashboardService.getProfile();
    setProfile(r.data);
  }, []);

  useEffect(() => {
    loadProfile();
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
  }, [loadProfile]);

  const headerStats = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "درخواست‌های فعال", value: stats.open_requests ?? 0 },
      { label: "در انتظار", value: stats.pending ?? 0 },
      { label: "تکمیل‌شده", value: stats.completed ?? 0 },
    ];
  }, [stats]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "درخواست‌های فعال", value: stats.open_requests ?? 0, hint: "درخواست‌های در جریان", icon: List },
      { label: "در انتظار بررسی", value: stats.pending ?? 0, icon: Clock },
      { label: "تکمیل‌شده", value: stats.completed ?? 0, icon: CheckCircle2 },
    ];
  }, [stats]);

  const overviewChart = useMemo(() => stats?.status_breakdown ?? [], [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "newRequest", label: "ثبت درخواست جدید", icon: FilePlus },
    { id: "myRequests", label: "درخواست‌های من", icon: List },
    { id: "profile", label: "پروفایل", icon: User },
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
      approvalPending={profile.state === false}
    >
      {activeTab === "overview" && (
        <div className="space-y-6">
          <DashboardOverview cards={overviewCards} chart={overviewChart} chartTitle="وضعیت درخواست‌های من" />
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">گردش کار من</h3>
            <PatientWorkflowTimeline patientId={profile.patientId} />
          </div>
        </div>
      )}
      {activeTab === "newRequest" && (
        <NewRequestForm onSuccess={() => setActiveTab("myRequests")} />
      )}
      {activeTab === "myRequests" && (
        <RequestListPanel
          title="درخواست‌های من"
          fetchFn={(scope) => requestService.list(scope)}
          mode="view"
        />
      )}
      {activeTab === "profile" && (
        <ProfileTabContent
          fields={patientProfileFields(profile)}
          role="patient"
          profile={profile}
          onProfileRefresh={loadProfile}
        />
      )}
    </DashboardShell>
  );
};

export default PatientDashboard;
