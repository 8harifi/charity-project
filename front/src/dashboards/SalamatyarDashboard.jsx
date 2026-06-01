import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FilePlus,
  List,
  User,
} from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import NewRequestForm from "./Components/NewRequestForm";
import RequestListPanel from "./Components/RequestListPanel";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import { healthAssistantDashboardService } from "../Services/healthAssistantDashboardService";
import { dashboardService, requestService } from "../Services/dashboardApi";
import { healthAssistantProfileFields } from "../utils/profileMappers";

const SalamatyarDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);

  const loadProfile = useCallback(async () => {
    const r = await healthAssistantDashboardService.getProfile();
    setProfile(r.data);
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      const r = await requestService.healthAssistantPatients();
      setPatients(Array.isArray(r.data) ? r.data : []);
    } catch {
      setPatients([]);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
    loadPatients();
  }, [loadProfile, loadPatients]);

  const headerStats = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "بیماران", value: stats.patients_introduced ?? 0 },
      { label: "درخواست فعال", value: stats.open_requests ?? 0 },
      { label: "تکمیل‌شده", value: stats.completed ?? 0 },
    ];
  }, [stats]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "بیماران معرفی‌شده", value: stats.patients_introduced ?? 0 },
      { label: "درخواست‌های فعال", value: stats.open_requests ?? 0 },
      { label: "درخواست‌های تکمیل‌شده", value: stats.completed ?? 0 },
    ];
  }, [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "introducePatient", label: "معرفی بیمار", icon: UserPlus },
    { id: "myPatients", label: "بیماران من", icon: Users },
    { id: "newRequest", label: "ثبت درخواست برای بیمار", icon: FilePlus },
    { id: "requests", label: "درخواست‌ها", icon: List },
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

      {activeTab === "introducePatient" && (
        <div className="text-right text-center py-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">معرفی بیمار به سامانه</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            برای ثبت بیمار جدید در شبکه، فرم عضویت بیمار را تکمیل کنید.
          </p>
          <Link
            to="/authpatient"
            className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
          >
            شروع ثبت‌نام بیمار
          </Link>
        </div>
      )}

      {activeTab === "myPatients" && (
        <div className="text-right">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-6">بیماران من</h2>
          {patients.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
              بیماری تحت پوشش شما ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-3">
              {patients.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <h3 className="font-bold text-gray-800">
                    {p.first_name} {p.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    کد: {p.patient_code} — {p.phone_number}
                  </p>
                  {p.sickness_description && (
                    <p className="text-xs text-gray-400 mt-2">{p.sickness_description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "newRequest" && (
        <NewRequestForm
          forHealthAssistant
          patients={patients}
          onSuccess={() => setActiveTab("requests")}
        />
      )}

      {activeTab === "requests" && (
        <RequestListPanel
          title="درخواست‌ها"
          fetchFn={(scope) => requestService.list(scope)}
          mode="view"
        />
      )}

      {activeTab === "profile" && (
        <ProfileTabContent
          fields={healthAssistantProfileFields(profile)}
          role="health_assistant"
          profile={profile}
          profileType={profile.profileType}
          onProfileRefresh={loadProfile}
        />
      )}
    </DashboardShell>
  );
};

export default SalamatyarDashboard;
