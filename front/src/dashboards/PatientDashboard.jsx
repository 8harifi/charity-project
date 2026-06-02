import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutDashboard, FilePlus, List, User, Heart } from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import NewRequestForm from "./Components/NewRequestForm";
import RequestListPanel from "./Components/RequestListPanel";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import { patientDashboardService } from "../Services/patientDashboardService";
import { dashboardService, requestService } from "../Services/dashboardApi";
import { walletService } from "../Services/walletService";
import { patientProfileFields } from "../utils/profileMappers";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [aidSummary, setAidSummary] = useState(null);

  const loadProfile = useCallback(async () => {
    const r = await patientDashboardService.getProfile();
    setProfile(r.data);
  }, []);

  useEffect(() => {
    loadProfile();
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
    walletService.getPatientAidSummary().then((r) => setAidSummary(r.data)).catch(() => setAidSummary(null));
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
      { label: "درخواست‌های فعال", value: stats.open_requests ?? 0, hint: "درخواست‌های در جریان" },
      { label: "در انتظار بررسی", value: stats.pending ?? 0 },
      { label: "تکمیل‌شده", value: stats.completed ?? 0 },
      { label: "حمایت دریافتی", value: Number(stats.aid_received ?? 0).toLocaleString("fa-IR"), hint: "تومان (سپرده)" },
    ];
  }, [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "newRequest", label: "ثبت درخواست جدید", icon: FilePlus },
    { id: "myRequests", label: "درخواست‌های من", icon: List },
    { id: "aid", label: "حمایت دریافتی", icon: Heart },
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
      {activeTab === "overview" && <DashboardOverview cards={overviewCards} />}
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
      {activeTab === "aid" && (
        <div className="text-right space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">موجودی سپرده حمایت</h2>
            <p className="text-3xl font-bold text-emerald-700">
              {Number(aidSummary?.balance || stats?.aid_received || 0).toLocaleString("fa-IR")}{" "}
              <span className="text-sm font-normal">تومان</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              این مبلغ توسط پلتفرم برای پوشش هزینه‌های درمانی شما استفاده می‌شود.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-3">واریزی‌های اخیر</h3>
            {(aidSummary?.recent_credits || []).length === 0 ? (
              <p className="text-gray-500 bg-gray-50 rounded-xl p-6 text-center">واریزی ثبت نشده.</p>
            ) : (
              <div className="space-y-2">
                {aidSummary.recent_credits.map((c) => (
                  <div key={c.id} className="bg-white border rounded-xl p-4 flex justify-between">
                    <span className="text-sm text-gray-600">{c.description || "حمایت مالی"}</span>
                    <span className="font-bold text-emerald-600">
                      +{Number(c.amount).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
