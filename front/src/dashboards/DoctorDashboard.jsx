import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, ClipboardList, User, CheckCircle2, Send, Wallet } from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import DoctorRequestPanel from "./Components/DoctorRequestPanel";
import PayoutPanel from "./Components/PayoutPanel";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import { doctorService } from "../Services/doctorDashboardService";
import { dashboardService, requestService } from "../Services/dashboardApi";
import { doctorProfileFields } from "../utils/profileMappers";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [staffRequests, setStaffRequests] = useState([]);
  const [staffForm, setStaffForm] = useState({
    health_assistant_id: "",
    patient_id: "",
    subject: "",
    description: "",
    amount_needed: "",
  });
  const [staffError, setStaffError] = useState("");

  const loadProfile = useCallback(async () => {
    const r = await doctorService.getProfile();
    setProfile(r.data);
  }, []);

  useEffect(() => {
    loadProfile();
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
    requestService.staffRequests().then((r) => setStaffRequests(Array.isArray(r.data) ? r.data : [])).catch(() => {});
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
    { id: "incoming", label: "درخواست‌های بیماران", icon: Users, group: "درخواست‌ها" },
    { id: "myActive", label: "درخواست‌های من", icon: ClipboardList, group: "درخواست‌ها" },
    { id: "staffRequests", label: "درخواست به سلامتیار", icon: Send, group: "درخواست‌ها" },
    { id: "payout", label: "تسویه", icon: Wallet, group: "درخواست‌ها" },
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
      {activeTab === "staffRequests" && (
        <div className="text-right space-y-6 max-w-2xl">
          <h2 className="text-lg font-bold">درخواست همکاری از سلامتیار</h2>
          <p className="text-sm text-gray-500">
            برای تأمین مالی، شناسه بیمار و مبلغ را وارد کنید تا پس از پذیرش سلامتیار، درخواست مالی به نام شما ثبت شود.
          </p>
          <div className="space-y-3">
            <input className="w-full p-3 border rounded-xl" placeholder="شناسه سلامتیار" value={staffForm.health_assistant_id} onChange={(e) => setStaffForm({ ...staffForm, health_assistant_id: e.target.value })} />
            <input className="w-full p-3 border rounded-xl" placeholder="شناسه بیمار (برای درخواست مبلغ الزامی)" value={staffForm.patient_id} onChange={(e) => setStaffForm({ ...staffForm, patient_id: e.target.value })} />
            <input className="w-full p-3 border rounded-xl" placeholder="موضوع" value={staffForm.subject} onChange={(e) => setStaffForm({ ...staffForm, subject: e.target.value })} />
            <textarea className="w-full p-3 border rounded-xl" rows={3} placeholder="توضیحات" value={staffForm.description} onChange={(e) => setStaffForm({ ...staffForm, description: e.target.value })} />
            <input className="w-full p-3 border rounded-xl" placeholder="مبلغ مورد نیاز (تومان)" value={staffForm.amount_needed} onChange={(e) => setStaffForm({ ...staffForm, amount_needed: e.target.value })} />
            {staffError && <p className="text-red-600 text-sm">{staffError}</p>}
            <button type="button" onClick={async () => {
              setStaffError("");
              try {
                await requestService.createStaffRequest({
                  health_assistant_id: Number(staffForm.health_assistant_id),
                  patient_id: staffForm.patient_id ? Number(staffForm.patient_id) : null,
                  subject: staffForm.subject,
                  description: staffForm.description,
                  amount_needed: staffForm.amount_needed ? Number(staffForm.amount_needed) : null,
                });
                setStaffForm({
                  health_assistant_id: "",
                  patient_id: "",
                  subject: "",
                  description: "",
                  amount_needed: "",
                });
                const r = await requestService.staffRequests();
                setStaffRequests(Array.isArray(r.data) ? r.data : []);
              } catch (err) {
                const data = err.response?.data;
                setStaffError(
                  data?.patient_id?.[0] ||
                    data?.detail ||
                    data?.non_field_errors?.[0] ||
                    "خطا در ارسال درخواست"
                );
              }
            }} className="px-4 py-2 bg-blue-600 text-white rounded-xl">ارسال</button>
          </div>
          <div className="space-y-2">
            {staffRequests.map((sr) => (
              <div key={sr.id} className="border rounded-xl p-3 bg-white">
                <p className="font-bold">{sr.subject}</p>
                <p className="text-sm text-gray-500">{sr.health_assistant_name} — {sr.status_label}</p>
                {sr.patient_name && (
                  <p className="text-sm text-gray-600 mt-1">بیمار: {sr.patient_name}</p>
                )}
                {sr.amount_needed != null && (
                  <p className="text-sm text-gray-600">
                    مبلغ درخواستی: {Number(sr.amount_needed).toLocaleString("fa-IR")} تومان
                  </p>
                )}
                {sr.network_request && (
                  <div className="mt-2 text-sm bg-blue-50 border border-blue-100 rounded-lg p-2">
                    <p className="font-semibold text-blue-800">درخواست مالی #{sr.network_request}</p>
                    <p className="text-blue-700">وضعیت: {sr.financial_status_label || "—"}</p>
                    {sr.financial_amount_needed != null && (
                      <p className="text-blue-700">
                        تأمین‌شده:{" "}
                        {Number(sr.financial_collected || 0).toLocaleString("fa-IR")} /{" "}
                        {Number(sr.financial_amount_needed).toLocaleString("fa-IR")} تومان
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === "payout" && <PayoutPanel />}

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
