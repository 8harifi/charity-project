import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FilePlus,
  List,
  User,
  CheckCircle2,
    Clock,
    ShieldCheck,
    Search,
    Edit,
    Wallet,
    Building2,
    MessageCircle,
} from "lucide-react";
import DashboardShell from "./Components/DashboardShell";
import DashboardOverview from "./Components/DashboardOverview";
import NewRequestForm from "./Components/NewRequestForm";
import RequestListPanel from "./Components/RequestListPanel";
import IntroducePatientModal from "./Components/IntroducePatientModal";
import HAPatientsBrowsePanel from "./Components/HAPatientsBrowsePanel";
import HAPatientEditModal from "./Components/HAPatientEditModal";
import GlobalSearchPanel from "./Components/GlobalSearchPanel";
import PayoutPanel from "./Components/PayoutPanel";
import OrgSubordinatesPanel from "./Components/OrgSubordinatesPanel";
import ContactInboxPanel from "./Components/ContactInboxPanel";
import ConfirmDialog from "../components/ConfirmDialog";
import { ProfileTabContent } from "./Components/ProfileEditModal";
import { healthAssistantDashboardService } from "../Services/healthAssistantDashboardService";
import { dashboardService, requestService } from "../Services/dashboardApi";
import { healthAssistantProfileFields } from "../utils/profileMappers";

const SalamatyarDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [introduceOpen, setIntroduceOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [approvingPatient, setApprovingPatient] = useState(null);
  const [approving, setApproving] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [staffRequests, setStaffRequests] = useState([]);

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

  const loadStaffRequests = useCallback(async () => {
    try {
      const r = await requestService.staffRequests();
      setStaffRequests(Array.isArray(r.data) ? r.data : []);
    } catch {
      setStaffRequests([]);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    dashboardService.getStats().then((r) => setStats(r.data)).catch(console.error);
    loadPatients();
    loadStaffRequests();
  }, [loadProfile, loadPatients, loadStaffRequests]);

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
      { label: "بیماران معرفی‌شده", value: stats.patients_introduced ?? 0, icon: Users },
      { label: "بیماران تأییدشده", value: stats.patients_approved ?? 0, icon: CheckCircle2 },
      { label: "در انتظار تأیید", value: stats.patients_pending_approval ?? 0, icon: Clock },
      { label: "درخواست‌های فعال", value: stats.open_requests ?? 0 },
      { label: "درخواست‌های تکمیل‌شده", value: stats.completed ?? 0 },
    ];
  }, [stats]);

  const overviewChart = useMemo(() => stats?.status_breakdown ?? [], [stats]);

  const handleApprovePatient = async () => {
    if (!approvingPatient) return;
    setApproving(true);
    try {
      await requestService.approveIntroducedPatient(approvingPatient.id);
      await loadPatients();
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
      setApprovingPatient(null);
    }
  };

  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const hay = [
        p.first_name,
        p.last_name,
        p.phone_number,
        p.patient_code,
        p.sickness_description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [patients, patientSearch]);

  const perms = profile?.permissions || {};

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "myPatients", label: "بیماران من", icon: Users, group: "بیمار" },
    { id: "allPatients", label: "همه بیماران", icon: Search, group: "بیمار" },
    {
      id: "globalSearch",
      label: "جستجوی کلی",
      icon: Search,
      hidden: !(
        perms.can_search_patients ||
        perms.can_search_doctors ||
        perms.can_search_assistants ||
        perms.can_search_benefactors ||
        perms.can_search_organizations
      ),
    },
    { id: "newRequest", label: "ثبت درخواست", icon: FilePlus, group: "درخواست‌ها" },
    { id: "requests", label: "درخواست‌ها", icon: List, group: "درخواست‌ها" },
    { id: "staffRequests", label: "درخواست‌های پزشک", icon: ShieldCheck, group: "درخواست‌ها" },
    { id: "payout", label: "تسویه", icon: Wallet, group: "درخواست‌ها" },
    {
      id: "inbox",
      label: "صندوق تماس",
      icon: MessageCircle,
      hidden: !perms.is_network_consultant,
    },
    {
      id: "subordinates",
      label: "زیرمجموعه‌ها",
      icon: Building2,
      hidden: profile?.profileType !== "organization",
    },
    { id: "profile", label: "پروفایل", icon: User },
  ].filter((t) => !t.hidden);

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
        <DashboardOverview cards={overviewCards} chart={overviewChart} chartTitle="وضعیت درخواست‌های ثبت‌شده" />
      )}

      {activeTab === "myPatients" && (
        <div className="text-right">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">بیماران من</h2>
            <p className="text-sm text-gray-500">بیمار جدید از دکمه «معرفی بیمار» اضافه می‌شود.</p>
            <button
              type="button"
              onClick={() => setIntroduceOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              <UserPlus size={18} />
              معرفی بیمار
            </button>
          </div>

          <input
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="جستجو نام، موبایل، کد بیمار..."
            className="w-full mb-4 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200"
          />

          {filteredPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
              {patients.length === 0
                ? "بیماری تحت پوشش شما ثبت نشده است."
                : "نتیجه‌ای برای جستجو یافت نشد."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
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
                    {p.ha_approved === false && p.state === false && (
                      <button
                        type="button"
                        onClick={() => setApprovingPatient(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shrink-0"
                      >
                        <ShieldCheck size={14} />
                        تأیید بیمار
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditPatient(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50 shrink-0"
                    >
                      <Edit size={14} />
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("حذف بیمار از لیست شما؟")) return;
                        await requestService.removePatient(p.id);
                        loadPatients();
                      }}
                      className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg shrink-0"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <HAPatientEditModal
            open={!!editPatient}
            patient={editPatient}
            onClose={() => setEditPatient(null)}
            onSaved={loadPatients}
          />

          <IntroducePatientModal
            open={introduceOpen}
            onClose={() => setIntroduceOpen(false)}
            onSuccess={() => loadPatients()}
            introducer={profile}
          />

          <ConfirmDialog
            open={!!approvingPatient}
            title="تأیید بیمار معرفی‌شده"
            message={`آیا از تأیید ${approvingPatient?.first_name || ""} ${
              approvingPatient?.last_name || ""
            } به‌عنوان بیمار معرفی‌شده توسط شما مطمئن هستید؟`}
            confirmLabel="تأیید بیمار"
            loading={approving}
            onConfirm={handleApprovePatient}
            onCancel={() => setApprovingPatient(null)}
          />
        </div>
      )}

      {activeTab === "allPatients" && (
        <HAPatientsBrowsePanel
          defaultScope="others"
          onClaimOrphan={async (id) => {
            await requestService.claimPatient(id);
            loadPatients();
          }}
        />
      )}

      {activeTab === "globalSearch" && (
        <GlobalSearchPanel permissions={profile.permissions || {}} />
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
          fetchFn={(scope, filters) => requestService.list(scope, filters)}
          mode="staffManage"
          isNetworkConsultant={!!perms.is_network_consultant}
        />
      )}

      {activeTab === "payout" && <PayoutPanel />}

      {activeTab === "inbox" && <ContactInboxPanel />}

      {activeTab === "staffRequests" && (
        <div className="text-right space-y-3">
          <h2 className="text-lg font-bold text-gray-800">درخواست‌های پزشکان</h2>
          {staffRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">درخواستی ثبت نشده.</p>
          ) : (
            staffRequests.map((sr) => (
              <div key={sr.id} className="border rounded-xl p-4 bg-white">
                <h3 className="font-bold">{sr.subject}</h3>
                <p className="text-sm text-gray-500 mt-1">{sr.created_by_name} — {sr.status_label}</p>
                {sr.patient_name && (
                  <p className="text-sm text-gray-600 mt-1">بیمار: {sr.patient_name}</p>
                )}
                {sr.amount_needed != null && (
                  <p className="text-sm text-gray-600">
                    مبلغ: {Number(sr.amount_needed).toLocaleString("fa-IR")} تومان
                  </p>
                )}
                <p className="text-sm mt-2">{sr.description}</p>
                {sr.network_request && (
                  <p className="text-sm text-blue-700 mt-2">
                    درخواست مالی #{sr.network_request} — {sr.financial_status_label}
                  </p>
                )}
                {sr.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button type="button" onClick={() => requestService.updateStaffRequestStatus(sr.id, "accept").then(loadStaffRequests)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">پذیرش</button>
                    <button type="button" onClick={() => requestService.updateStaffRequestStatus(sr.id, "reject").then(loadStaffRequests)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm">رد</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "subordinates" && <OrgSubordinatesPanel />}

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
