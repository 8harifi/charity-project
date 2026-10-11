import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, CheckCheck, Loader2, Paperclip, SlidersHorizontal, X } from "lucide-react";
import FundingProgressBar from "../../components/FundingProgressBar";
import ConfirmDialog from "../../components/ConfirmDialog";
import PatientWorkflowTimeline from "./PatientWorkflowTimeline";
import { fetchSpecialties, requestService } from "../../Services/dashboardApi";
import { adminWalletService } from "../../Services/walletService";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";
import { useAuth } from "../../context/AuthContext";

const ACTION_CONFIRM = {
  complete: {
    title: "تأیید تکمیل درخواست",
    message: "آیا از تأیید انجام‌شدن این درخواست مطمئن هستید؟",
    confirmLabel: "تأیید انجام شد",
    tone: "default",
  },
  cancel: {
    title: "تأیید لغو درخواست",
    message: "آیا از لغو این درخواست و بازگرداندن وجوه مطمئن هستید؟ این عملیات قابل بازگشت نیست.",
    confirmLabel: "لغو و بازگرداندن",
    tone: "danger",
  },
  start: {
    title: "تأیید شروع درخواست",
    message: "آیا می‌خواهید این درخواست را شروع کنید؟",
    confirmLabel: "شروع",
    tone: "default",
  },
  reject: {
    title: "تأیید رد درخواست",
    message: "آیا از رد این درخواست مطمئن هستید؟",
    confirmLabel: "رد درخواست",
    tone: "danger",
  },
};

const FILTERS = [
  { id: "active", label: "فعال" },
  { id: "all", label: "همه" },
  { id: "completed", label: "تکمیل‌شده" },
  { id: "rejected", label: "رد‌شده" },
];

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-200 text-gray-700",
};

const ALL_STATUSES = [
  { value: "pending", label: "در انتظار بررسی" },
  { value: "accepted", label: "پذیرفته شده" },
  { value: "in_progress", label: "در حال انجام" },
  { value: "completed", label: "تکمیل شده" },
  { value: "rejected", label: "رد شده" },
  { value: "cancelled", label: "لغو شده" },
];

const EDITABLE_FIELDS = [
  { key: "subject", label: "موضوع" },
  { key: "description", label: "توضیحات", multiline: true },
  { key: "amount_needed", label: "مبلغ مورد نیاز (تومان)", type: "number" },
  { key: "doctor_name", label: "نام پزشک" },
  { key: "needed_service", label: "خدمت مورد نیاز" },
  { key: "appointment_date", label: "تاریخ نوبت" },
  { key: "appointment_time", label: "ساعت نوبت" },
  { key: "appointment_place", label: "محل نوبت" },
  { key: "appointment_phone", label: "تلفن نوبت" },
];

function statusBadgeClass(req) {
  if (req.is_fully_funded) return "bg-teal-100 text-teal-800";
  return STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600";
}

function creatorLabel(req) {
  if (req.created_by_role === "health_assistant") return "سلامتیار ثبت‌کننده";
  if (req.created_by_role === "doctor") return "پزشک ثبت‌کننده";
  if (req.created_by_role === "patient") return "بیمار ثبت‌کننده";
  return "ثبت‌کننده";
}

export default function RequestListPanel({
  fetchFn,
  mode = "view",
  title = "درخواست‌ها",
  showFilters = true,
  advancedFilters = false,
  defaultScope = "active",
  onAction,
  enableWalletPay = false,
  walletBalance = 0,
  onWalletPay,
  onAdjustPledge,
  hideWorkflow = false,
  accent = "blue",
  isNetworkConsultant = false,
}) {
  const isBlue = accent === "blue";
  const accentBtn = isBlue ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700";
  const accentActive = isBlue ? "bg-blue-600 text-white" : "bg-emerald-600 text-white";
  const accentFilterBtn = isBlue
    ? "bg-blue-600 text-white border-blue-600"
    : "bg-emerald-600 text-white border-emerald-600";
  const accentRing = isBlue ? "focus:ring-blue-200" : "focus:ring-emerald-200";
  const accentLoader = isBlue ? "text-blue-600" : "text-emerald-600";
  const accentHoverBorder = isBlue ? "hover:border-blue-200" : "hover:border-emerald-200";
  const accentFundingBox = isBlue
    ? "bg-blue-50 border border-blue-100"
    : "bg-emerald-50 border border-emerald-100";
  const accentFundingTitle = isBlue ? "text-blue-800" : "text-emerald-800";
  const accentFundingText = isBlue ? "text-blue-700" : "text-emerald-700";
  const [scope, setScope] = useState(defaultScope);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [payMsgIsError, setPayMsgIsError] = useState(false);
  const [confirmPay, setConfirmPay] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [adjustingPledge, setAdjustingPledge] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const { user } = useAuth() || {};

  const [overrideStatus, setOverrideStatus] = useState("");
  const [overrideNote, setOverrideNote] = useState("");
  const [overrideError, setOverrideError] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canManage = mode === "adminManage";

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [specialtyOptions, setSpecialtyOptions] = useState([]);
  const [readStatus, setReadStatus] = useState("all");
  const [familyOpen, setFamilyOpen] = useState(false);
  const [wantContact, setWantContact] = useState(null);
  const [platformPayAmount, setPlatformPayAmount] = useState("");
  const [referDoctorName, setReferDoctorName] = useState("");

  useEffect(() => {
    if (!advancedFilters) return;
    fetchSpecialties().then(setSpecialtyOptions).catch(() => setSpecialtyOptions([]));
  }, [advancedFilters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = advancedFilters
        ? {
            search: search.trim() || undefined,
            specialty: specialtyFilter || undefined,
            min_amount: minAmount || undefined,
            max_amount: maxAmount || undefined,
            province: provinceFilter || undefined,
            read_status: readStatus !== "all" ? readStatus : undefined,
          }
        : { read_status: readStatus !== "all" ? readStatus : undefined };
      const r = await fetchFn(scope, filters);
      setRequests(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error(err);
      setError("خطا در بارگذاری درخواست‌ها");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, scope, advancedFilters, search, specialtyFilter, minAmount, maxAmount, provinceFilter, readStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((req) => {
      const hay = [
        req.subject,
        req.description,
        req.status_label,
        req.status,
        req.request_type,
        req.patient_name,
        req.patient?.first_name,
        req.patient?.last_name,
        user?.role === "benefactor" ? "" : req.patient?.phone_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [requests, search, user?.role]);

  const performAction = async (action, extra = {}) => {
    if (!selected) return;
    setActing(true);
    try {
      if (onAction) {
        await onAction(selected.id, action, actionNote, extra);
      } else {
        await requestService.updateStatus(selected.id, {
          action,
          note: actionNote,
          ...extra,
        });
      }
      setActionNote("");
      setSelected(null);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "عملیات با خطا مواجه شد");
    } finally {
      setActing(false);
      setConfirmAction(null);
    }
  };

  const handleAction = (action) => {
    if (ACTION_CONFIRM[action]) {
      setConfirmAction(action);
      return;
    }
    performAction(action);
  };

  const closeDetail = () => {
    setSelected(null);
    setEditForm(null);
    setOverrideStatus("");
    setOverrideNote("");
    setOverrideError("");
    setFamilyOpen(false);
    setWantContact(null);
    setPlatformPayAmount("");
    setReferDoctorName("");
  };

  const openRequest = (req) => {
    setSelected(req);
    setPledgeAmount(req.my_pledge > 0 ? String(req.my_pledge) : "");
    setPayMsg("");
    setPayMsgIsError(false);
    setFamilyOpen(false);
    setWantContact(null);
    requestService
      .markRead(req.id)
      .then(() => {
        setRequests((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, is_read: true } : r))
        );
        setSelected((cur) => (cur?.id === req.id ? { ...cur, is_read: true } : cur));
      })
      .catch(() => {});
  };

  const applyStatusOverride = async () => {
    if (!selected) return;
    if (!overrideStatus) {
      setOverrideError("وضعیت جدید را انتخاب کنید.");
      return;
    }
    if (!overrideNote.trim()) {
      setOverrideError("ثبت دلیل تغییر وضعیت الزامی است.");
      return;
    }
    setActing(true);
    setOverrideError("");
    try {
      await requestService.setStatus(selected.id, overrideStatus, overrideNote.trim());
      closeDetail();
      await load();
    } catch (err) {
      setOverrideError(err.response?.data?.detail || "تغییر وضعیت با خطا مواجه شد.");
    } finally {
      setActing(false);
    }
  };

  const saveEdit = async () => {
    if (!selected || !editForm) return;
    setActing(true);
    setOverrideError("");
    try {
      const payload = {};
      EDITABLE_FIELDS.forEach(({ key, type }) => {
        const value = editForm[key];
        if (value === undefined) return;
        payload[key] = type === "number" ? Number(value) || null : value;
      });
      await requestService.update(selected.id, payload);
      closeDetail();
      await load();
    } catch (err) {
      const data = err.response?.data;
      setOverrideError(
        data?.detail || Object.values(data || {}).flat()[0] || "ویرایش با خطا مواجه شد."
      );
    } finally {
      setActing(false);
    }
  };

  const deleteRequest = async () => {
    if (!selected) return;
    setActing(true);
    setConfirmDelete(false);
    try {
      await requestService.remove(selected.id);
      closeDetail();
      await load();
    } catch (err) {
      setOverrideError(err.response?.data?.detail || "حذف با خطا مواجه شد.");
    } finally {
      setActing(false);
    }
  };

  const availableActions = (req) => {
    if (mode === "incoming") {
      // For doctor's consultation requests: accept/reject
      if (req.request_type === "consultation") {
        return [
          { action: "accept", label: "پذیرش", className: accentBtn },
          { action: "reject", label: "رد", className: "bg-red-500 hover:bg-red-600" },
        ];
      }
      return [];
    }
    if (mode === "cases" && ["accepted", "in_progress"].includes(req.status)) {
      return [
        ...(req.status === "accepted"
          ? [{ action: "start", label: "شروع", className: "bg-blue-600 hover:bg-blue-700" }]
          : []),
        { action: "complete", label: "تکمیل", className: accentBtn },
      ];
    }
    // HA/doctor managing their own financial requests. Only requests they
    // created as "financial" can be completed/cancelled (matches backend
    // permission in NetworkRequestStatusView), everything else (their own
    // consultation/service requests, or requests about patients they merely
    // introduced) is shown read-only with full funding progress.
    if (mode === "staffManage") {
      const isOwnFinancial =
        req.request_type === "financial" && req.created_by === user?.id;
      if (isOwnFinancial && ["pending", "accepted", "in_progress"].includes(req.status)) {
        return [
          { action: "complete", label: "تأیید انجام شد", className: accentBtn },
          { action: "cancel", label: "لغو و بازگرداند", className: "bg-red-500 hover:bg-red-600" },
        ];
      }
      return [];
    }
    return [];
  };

  const handleWalletPayClick = () => {
    if (!selected || !onWalletPay) return;
    const remaining = Number(selected.remaining ?? selected.amount_needed);
    const amt = Number(payAmount || remaining);
    if (!amt || amt <= 0) {
      setPayMsgIsError(true);
      setPayMsg("مبلغ نامعتبر است.");
      return;
    }
    if (walletBalance < amt) {
      setPayMsgIsError(true);
      setPayMsg("موجودی کیف پول کافی نیست.");
      return;
    }
    if (user?.role === "benefactor" && wantContact === null) {
      setPayMsgIsError(true);
      setPayMsg("لطفاً مشخص کنید آیا مشخصات تماس بیمار را می‌خواهید یا خیر.");
      return;
    }
    setPayMsg("");
    setPayMsgIsError(false);
    setConfirmPay(true);
  };

  const requestPatientContact = async () => {
    if (!selected?.patient) return;
    try {
      await requestService.contactDisclosure({
        patient_id: selected.patient,
        network_request_id: selected.id,
      });
      setWantContact(true);
      setPayMsgIsError(false);
      setPayMsg("درخواست مشخصات تماس ثبت شد. پس از هماهنگی با بیمار مطلع می‌شوید.");
    } catch (err) {
      setPayMsgIsError(true);
      setPayMsg(err.response?.data?.detail || "ثبت درخواست تماس ممکن نشد.");
    }
  };

  const payFromPlatform = async () => {
    if (!selected) return;
    const amt = Number(platformPayAmount || selected.remaining || selected.amount_needed);
    if (!amt || amt <= 0) {
      setPayMsgIsError(true);
      setPayMsg("مبلغ نامعتبر است.");
      return;
    }
    setPaying(true);
    try {
      await adminWalletService.payRequest(selected.id, amt);
      setPayMsgIsError(false);
      setPayMsg("پرداخت از کیف پول سامانه انجام شد.");
      setPlatformPayAmount("");
      await load();
    } catch (err) {
      setPayMsgIsError(true);
      setPayMsg(err.response?.data?.detail || "پرداخت از کیف پول سامانه ممکن نشد.");
    } finally {
      setPaying(false);
    }
  };

  const handleWalletPay = async () => {
    setConfirmPay(false);
    if (!selected || !onWalletPay) return;
    const remaining = Number(selected.remaining ?? selected.amount_needed);
    const amt = Number(payAmount || remaining);
    setPaying(true);
    setPayMsg("");
    setPayMsgIsError(false);
    try {
      await onWalletPay(selected.id, amt);
      setPayAmount("");
      setPayMsgIsError(false);
      setPayMsg("پرداخت با موفقیت انجام شد.");
      await load();
    } catch (err) {
      setPayMsgIsError(true);
      setPayMsg(err.response?.data?.detail || "خطا در پرداخت.");
    } finally {
      setPaying(false);
    }
  };

  const handleAdjustPledge = async () => {
    if (!selected || !onAdjustPledge) return;
    const amt = Number(pledgeAmount);
    if (Number.isNaN(amt) || amt < 0) {
      setPayMsgIsError(true);
      setPayMsg("مبلغ نامعتبر است.");
      return;
    }
    setAdjustingPledge(true);
    setPayMsg("");
    setPayMsgIsError(false);
    try {
      await onAdjustPledge(selected.id, amt);
      setPledgeAmount("");
      setPayMsgIsError(false);
      setPayMsg(amt === 0 ? "تعهد لغو شد." : "مبلغ تعهد به‌روزرسانی شد.");
      await load();
    } catch (err) {
      setPayMsgIsError(true);
      setPayMsg(err.response?.data?.detail || "خطا در تغییر تعهد.");
    } finally {
      setAdjustingPledge(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="text-right">
      {title ? (
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      ) : null}

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setScope(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                scope === f.id
                  ? accentActive
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
          {[
            { id: "all", label: "همه پیام‌ها" },
            { id: "unread", label: "خوانده نشده" },
            { id: "read", label: "خوانده شده" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setReadStatus(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                readStatus === f.id
                  ? accentActive
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در درخواست‌ها..."
          className={`flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 ${accentRing}`}
        />
        {advancedFilters && (
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className={`px-4 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition ${
              showAdvanced
                ? accentFilterBtn
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal size={16} />
            فیلترها
          </button>
        )}
      </div>

      {advancedFilters && showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">تخصص</label>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className={`w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 ${accentRing}`}
            >
              <option value="">همه تخصص‌ها</option>
              {specialtyOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">استان</label>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className={`w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 ${accentRing}`}
            >
              <option value="">همه استان‌ها</option>
              {IRAN_PROVINCES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">حداقل مبلغ (تومان)</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="مثلاً ۱۰۰۰۰۰"
              className={`w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 ${accentRing}`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">حداکثر مبلغ (تومان)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="مثلاً ۵۰۰۰۰۰۰"
              className={`w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 ${accentRing}`}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className={`animate-spin ${accentLoader}`} size={32} />
        </div>
      ) : filteredRequests.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
          درخواستی یافت نشد.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <button
              key={req.id}
              type="button"
              onClick={() => openRequest(req)}
              className={`w-full text-right bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md ${accentHoverBorder} transition`}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800">{req.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {req.request_type_label} — {req.patient_name}
                  </p>
                  {req.specialty_name && (
                    <p className="text-xs text-gray-400 mt-1">تخصص: {req.specialty_name}</p>
                  )}
                  {Number(req.amount_needed) > 0 && (
                    <div className="mt-3 max-w-md">
                      <FundingProgressBar
                        collected={req.collected_amount}
                        needed={req.amount_needed}
                        size="sm"
                        showLabels
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${statusBadgeClass(req)}`}
                  >
                    {req.status_label}
                  </span>
                  <span
                    className={`text-xs flex items-center gap-1 ${
                      req.is_read ? "text-blue-500" : "text-gray-400"
                    }`}
                    title={req.is_read ? "خوانده شده" : "خوانده نشده"}
                  >
                    {req.is_read ? <CheckCheck size={16} /> : <Check size={16} />}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {req.created_at
                      ? new Date(req.created_at).toLocaleDateString("fa-IR")
                      : ""}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
            onClick={closeDetail}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selected.subject}</h3>
                <button type="button" onClick={closeDetail}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p><span className="font-semibold">نوع:</span> {selected.request_type_label}</p>
                {selected.request_subtype_label && selected.request_subtype && (
                  <p><span className="font-semibold">موضوع درخواست:</span> {selected.request_subtype_label}</p>
                )}
                <p className="text-xs text-gray-400">
                  «موضوع» عنوان کلی درخواست است؛ «موضوع هزینه» دستهٔ هزینه‌کرد (ویزیت، دارو و ...) است.
                </p>
                <p><span className="font-semibold">وضعیت:</span> {selected.status_label}</p>
                <p><span className="font-semibold">بیمار:</span> {selected.patient_name}</p>
                {selected.patient_public && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1">
                    <p><span className="font-semibold">بیماری:</span> {selected.patient_public.disease || "—"}</p>
                    <p><span className="font-semibold">سن:</span> {selected.patient_public.age || "—"}</p>
                    <p><span className="font-semibold">وضعیت تأهل:</span> {selected.patient_public.marital_status || "—"}</p>
                    <p><span className="font-semibold">محل سکونت:</span> {selected.patient_public.residence || "—"}</p>
                    <p><span className="font-semibold">بیمه:</span> {selected.patient_public.insurance || "—"}</p>
                    <p><span className="font-semibold">سازمان پوشش‌دهنده:</span> {selected.patient_public.covered_organization || "—"}</p>
                    <p><span className="font-semibold">سطح مالی:</span> {selected.patient_public.financial_level || "—"}</p>
                    <button
                      type="button"
                      onClick={() => setFamilyOpen((v) => !v)}
                      className="text-xs text-blue-700 underline"
                    >
                      {familyOpen ? "بستن شرح حال خانواده" : "شرح حال مختصر خانواده"}
                    </button>
                    {familyOpen && (
                      <p className="text-xs text-gray-600">{selected.patient_public.family_status || "ثبت نشده"}</p>
                    )}
                  </div>
                )}
                {selected.amount_needed > 0 && (
                  <div className={`${accentFundingBox} rounded-xl p-4 my-3`}>
                    <p className={`text-sm font-semibold ${accentFundingTitle} mb-2`}>پیشرفت تأمین مالی</p>
                    <FundingProgressBar
                      collected={selected.collected_amount}
                      needed={selected.amount_needed}
                      size="md"
                    />
                    {selected.my_pledge > 0 && (
                      <p className={`text-xs ${accentFundingText} mt-2`}>
                        کمک شما (معلق): {Number(selected.my_pledge).toLocaleString("fa-IR")} تومان
                      </p>
                    )}
                    {enableWalletPay &&
                      onAdjustPledge &&
                      selected.my_pledge > 0 &&
                      ["pending", "accepted", "in_progress"].includes(selected.status) && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-600">ویرایش مبلغ تعهد (قبل از تأیید نهایی)</p>
                          <input
                            type="number"
                            value={pledgeAmount}
                            onChange={(e) => setPledgeAmount(e.target.value)}
                            placeholder="مبلغ جدید (۰ برای لغو)"
                            className={`w-full rounded-xl border border-gray-200 p-2 text-sm outline-none focus:ring-2 ${accentRing}`}
                          />
                          <button
                            type="button"
                            disabled={adjustingPledge}
                            onClick={handleAdjustPledge}
                            className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-50"
                          >
                            {adjustingPledge ? "..." : "ثبت مبلغ جدید تعهد"}
                          </button>
                        </div>
                      )}
                  </div>
                )}
                {selected.created_by_name && (
                  <p>
                    <span className="font-semibold">{creatorLabel(selected)}:</span>{" "}
                    {selected.created_by_name}
                    {selected.created_by_national_code
                      ? ` — کد ملی ${selected.created_by_national_code}`
                      : ""}
                    {selected.created_by_organization
                      ? ` — سازمان ${selected.created_by_organization}`
                      : ""}
                  </p>
                )}
                {selected.doctor_name && (
                  <p><span className="font-semibold">نام پزشک:</span> {selected.doctor_name}</p>
                )}
                {selected.specialty_name && (
                  <p><span className="font-semibold">تخصص:</span> {selected.specialty_name}</p>
                )}
                {selected.expense_category && (
                  <p>
                    <span className="font-semibold">موضوع هزینه‌کرد:</span> {selected.expense_category_label}
                    <span className="block text-xs text-gray-400">دسته هزینه جدا از عنوان موضوع درخواست است.</span>
                  </p>
                )}
                {(selected.companion_male_count > 0 || selected.companion_female_count > 0) && (
                  <p>
                    <span className="font-semibold">همراهان:</span>{" "}
                    {Number(selected.companion_male_count || 0).toLocaleString("fa-IR")} مرد،{" "}
                    {Number(selected.companion_female_count || 0).toLocaleString("fa-IR")} زن
                  </p>
                )}
                {selected.needed_service && (
                  <p><span className="font-semibold">خدمت مورد نیاز:</span> {selected.needed_service}</p>
                )}
                {selected.illness_summary && (
                  <p><span className="font-semibold">شرح حال:</span> {selected.illness_summary}</p>
                )}
                <p><span className="font-semibold">توضیحات:</span> {selected.description}</p>
                {selected.recipient_role_label && (
                  <p><span className="font-semibold">نقش گیرنده:</span> {selected.recipient_role_label}</p>
                )}
                {selected.recipient_organization_name && (
                  <p><span className="font-semibold">سازمان گیرنده:</span> {selected.recipient_organization_name}</p>
                )}
                {selected.service_kind_label && (
                  <p><span className="font-semibold">نوع خدمت:</span> {selected.service_kind_label}</p>
                )}
                {selected.referred_to_doctor_name && (
                  <p><span className="font-semibold">ارجاع به پزشک:</span> {selected.referred_to_doctor_name}</p>
                )}
                {selected.attachments?.length > 0 && (
                  <div>
                    <span className="font-semibold">مدارک پیوست:</span>
                    <ul className="mt-1 space-y-1">
                      {selected.attachments.map((att) => (
                        <li key={att.id}>
                          <a
                            href={att.file_url || att.file}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                          >
                            <Paperclip size={14} />
                            {att.label || att.filename || `پیوست ${att.id}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {user?.role === "benefactor" && selected.patient && (
                <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900 space-y-2">
                  <p>آیا مشخصات تماس بیمار را می‌خواهید؟ در صورت موافقت بیمار، پس از هماهنگی مطلع می‌شوید.</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={requestPatientContact}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        wantContact === true ? "bg-amber-600 text-white" : "bg-white border border-amber-200"
                      }`}
                    >
                      بله، درخواست مشخصات تماس
                    </button>
                    <button
                      type="button"
                      onClick={() => setWantContact(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        wantContact === false ? "bg-amber-600 text-white" : "bg-white border border-amber-200"
                      }`}
                    >
                      خیر، ادامه حمایت بدون تماس
                    </button>
                    <a
                      href={`/contact?intent=contact_disclosure&subject=اطلاعات تماس و مشخصات کامل بیمار&patient=${selected.patient}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-200"
                    >
                      اطلاعات تماس و مشخصات کامل بیمار
                    </a>
                  </div>
                </div>
              )}

              {canManage && selected.request_type === "financial" && (
                <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                  <h4 className="font-bold text-blue-800">پرداخت از کیف پول سامانه</h4>
                  <input
                    type="number"
                    value={platformPayAmount}
                    onChange={(e) => setPlatformPayAmount(e.target.value)}
                    placeholder={
                      selected.remaining
                        ? `حداکثر: ${Number(selected.remaining).toLocaleString("fa-IR")}`
                        : "مبلغ (تومان)"
                    }
                    className="w-full rounded-xl border border-blue-100 p-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={paying}
                    onClick={payFromPlatform}
                    className="w-full py-2 rounded-xl bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {paying ? "..." : "پرداخت از کیف پول شبکه"}
                  </button>
                </div>
              )}

              {mode === "staffManage" &&
                user?.role === "health_assistant" &&
                isNetworkConsultant &&
                ["service", "consultation"].includes(selected.request_type) && (
                <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50 p-4 space-y-2">
                  <h4 className="font-bold text-purple-800">ارجاع به پزشک (مشاور شبکه)</h4>
                  <input
                    value={referDoctorName}
                    onChange={(e) => setReferDoctorName(e.target.value)}
                    placeholder="نام پزشک"
                    className="w-full rounded-xl border border-purple-100 p-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={acting || !referDoctorName.trim()}
                    onClick={() =>
                      performAction("refer_to_doctor", { doctor_name: referDoctorName.trim() })
                    }
                    className="w-full py-2 rounded-xl bg-purple-700 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    ارجاع درخواست به پزشک
                  </button>
                </div>
              )}

              {canManage && (
                <div className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2">تغییر وضعیت توسط مدیر</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={overrideStatus}
                        onChange={(e) => setOverrideStatus(e.target.value)}
                        className="p-2.5 rounded-lg border border-gray-200 text-sm bg-white"
                      >
                        <option value="">انتخاب وضعیت جدید</option>
                        {ALL_STATUSES.filter((s) => s.value !== selected.status).map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={overrideNote}
                        onChange={(e) => setOverrideNote(e.target.value)}
                        placeholder="دلیل تغییر (الزامی)"
                        className="p-2.5 rounded-lg border border-gray-200 text-sm bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={applyStatusOverride}
                      className="mt-2 px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {acting ? "..." : "اعمال تغییر وضعیت"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm(
                          editForm
                            ? null
                            : Object.fromEntries(
                                EDITABLE_FIELDS.map(({ key }) => [key, selected[key] ?? ""])
                              )
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold"
                    >
                      {editForm ? "انصراف از ویرایش" : "ویرایش درخواست"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
                    >
                      حذف درخواست
                    </button>
                  </div>

                  {editForm && (
                    <div className="space-y-2 border-t border-gray-200 pt-3">
                      {EDITABLE_FIELDS.map(({ key, label, type, multiline }) => (
                        <label key={key} className="block text-sm">
                          <span className="text-gray-500">{label}</span>
                          {multiline ? (
                            <textarea
                              rows={3}
                              value={editForm[key] ?? ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, [key]: e.target.value })
                              }
                              className="w-full mt-1 p-2 rounded-lg border border-gray-200 text-sm resize-none"
                            />
                          ) : (
                            <input
                              type={type || "text"}
                              value={editForm[key] ?? ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, [key]: e.target.value })
                              }
                              className="w-full mt-1 p-2 rounded-lg border border-gray-200 text-sm"
                            />
                          )}
                        </label>
                      ))}
                      <button
                        type="button"
                        disabled={acting}
                        onClick={saveEdit}
                        className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        {acting ? "..." : "ذخیره ویرایش"}
                      </button>
                    </div>
                  )}

                  {overrideError && <p className="text-red-600 text-sm">{overrideError}</p>}
                </div>
              )}

              {selected.ha_approval_status === "pending" && mode === "staffManage" && (
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => performAction("ha_approve")} className={`px-4 py-2 rounded-lg text-white ${accentBtn}`}>تأیید درخواست بیمار</button>
                  <button type="button" onClick={() => performAction("ha_reject")} className="px-4 py-2 rounded-lg bg-red-500 text-white">رد</button>
                </div>
              )}

              {!hideWorkflow && (
                <>
                  <h4 className="font-bold text-gray-700 mb-3">گردش کار بیمار</h4>
                  <PatientWorkflowTimeline patientId={selected.patient} />
                </>
              )}

              {enableWalletPay &&
                (selected.request_type === "financial" ||
                  (selected.request_type === "consultation" && selected.amount_needed > 0)) &&
                ["pending", "accepted", "in_progress"].includes(selected.status) && (
                  <div className="mt-6 space-y-3 border-t pt-4">
                    <h4 className="font-bold text-gray-700">کمک به این نیاز</h4>
                    <FundingProgressBar
                      collected={selected.collected_amount}
                      needed={selected.amount_needed}
                      size="md"
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">
                      باقی‌مانده قابل پرداخت:{" "}
                      {Number(selected.remaining || 0).toLocaleString("fa-IR")} تومان
                    </p>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder={
                        selected.remaining
                          ? `حداکثر: ${Number(selected.remaining).toLocaleString("fa-IR")}`
                          : "مبلغ (تومان)"
                      }
                      className={`w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 ${accentRing}`}
                    />
                    <button
                      type="button"
                      disabled={paying}
                      onClick={handleWalletPayClick}
                      className={`w-full py-2 rounded-xl ${isBlue ? "bg-blue-600" : "bg-emerald-600"} text-white text-sm font-semibold disabled:opacity-50`}
                    >
                      {paying ? "..." : "پرداخت از کیف پول"}
                    </button>
                    {payMsg && (
                      <p className={`text-sm ${payMsgIsError ? "text-red-600" : accentFundingText}`}>
                        {payMsg}
                      </p>
                    )}
                  </div>
                )}

              {availableActions(selected).length > 0 && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={2}
                    placeholder="یادداشت (اختیاری)..."
                    className={`w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 ${accentRing} resize-none`}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {availableActions(selected).map((a) => (
                      <button
                        key={a.action}
                        type="button"
                        disabled={acting}
                        onClick={() => handleAction(a.action)}
                        className={`px-4 py-2 rounded-xl text-white text-sm font-semibold ${a.className} disabled:opacity-50`}
                      >
                        {acting ? "..." : a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmPay}
        title="تأیید پرداخت"
        message={`آیا از پرداخت مبلغ ${Number(
          payAmount || selected?.remaining || selected?.amount_needed || 0
        ).toLocaleString("fa-IR")} تومان از کیف پول مطمئن هستید؟`}
        confirmLabel="پرداخت"
        loading={paying}
        onConfirm={handleWalletPay}
        onCancel={() => setConfirmPay(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="حذف درخواست"
        message="این درخواست و تاریخچهٔ آن برای همیشه حذف می‌شود. ادامه می‌دهید؟"
        confirmLabel="حذف"
        tone="danger"
        loading={acting}
        onConfirm={deleteRequest}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction ? ACTION_CONFIRM[confirmAction]?.title : ""}
        message={confirmAction ? ACTION_CONFIRM[confirmAction]?.message : ""}
        confirmLabel={confirmAction ? ACTION_CONFIRM[confirmAction]?.confirmLabel : "تأیید"}
        tone={confirmAction ? ACTION_CONFIRM[confirmAction]?.tone : "default"}
        loading={acting}
        onConfirm={() => performAction(confirmAction)}
        onCancel={() => setConfirmAction(null)}
      />
    </motion.div>
  );
}
