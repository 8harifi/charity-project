import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Loader2, X } from "lucide-react";
import PatientWorkflowTimeline from "./PatientWorkflowTimeline";
import PersianDateInput from "../../components/PersianDateInput";
import PersianTimeInput from "../../components/PersianTimeInput";
import FundingProgressBar from "../../components/FundingProgressBar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { requestService } from "../../Services/dashboardApi";

const ACTION_CONFIRM = {
  reject: {
    title: "تأیید رد درخواست",
    message: "آیا از رد این درخواست مطمئن هستید؟",
    confirmLabel: "رد درخواست",
    tone: "danger",
  },
  schedule: {
    title: "تأیید زمان‌بندی",
    message: "آیا از ثبت این زمان‌بندی و ارسال آن به بیمار مطمئن هستید؟",
    confirmLabel: "ثبت و ارسال",
    tone: "default",
  },
  request_funding: {
    title: "تأیید اعلام نیاز مالی",
    message: "آیا از اعلام این نیاز مالی برای نیکوکاران مطمئن هستید؟",
    confirmLabel: "اعلام نیاز مالی",
    tone: "default",
  },
  confirm: {
    title: "تأیید نهایی درخواست",
    message: "آیا از تأیید نهایی این درخواست و ارسال جزئیات مطمئن هستید؟",
    confirmLabel: "تأیید نهایی",
    tone: "default",
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
};

const inputClass =
  "w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200";

export default function DoctorRequestPanel({
  fetchFn,
  mode = "incoming",
  title = "درخواست‌ها",
  showFilters = false,
  defaultScope = "active",
}) {
  const [scope, setScope] = useState(defaultScope);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [actionMode, setActionMode] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [fundingAmount, setFundingAmount] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentPlace, setAppointmentPlace] = useState("");
  const [appointmentPhone, setAppointmentPhone] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetchFn(showFilters ? scope : undefined);
      setRequests(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error(err);
      setError("خطا در بارگذاری درخواست‌ها");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, scope, showFilters]);

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
        req.patient_name,
        req.patient_code,
        req.created_by_role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [requests, search]);

  const resetForm = () => {
    setActionMode(null);
    setFundingAmount("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentPlace("");
    setAppointmentPhone("");
    setConfirmationMessage("");
  };

  const closeModal = () => {
    setSelected(null);
    resetForm();
  };

  const performAction = async (payload) => {
    if (!selected) return;
    setActing(true);
    setError("");
    try {
      await requestService.updateStatus(selected.id, payload);
      closeModal();
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || "عملیات با خطا مواجه شد");
    } finally {
      setActing(false);
      setPendingPayload(null);
    }
  };

  const runAction = (payload) => {
    if (ACTION_CONFIRM[payload.action]) {
      setPendingPayload(payload);
      return;
    }
    performAction(payload);
  };


  return (
    <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="text-right">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">{title}</h2>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setScope(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                scope === f.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجو..."
        className={`${inputClass} mb-4`}
      />

      {error && !selected && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : filteredRequests.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">درخواستی یافت نشد.</p>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <button
              key={req.id}
              type="button"
              onClick={() => {
                setSelected(req);
                resetForm();
              }}
              className="w-full text-right bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-emerald-200 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800">{req.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {req.patient_name} — {req.patient_code}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{req.description}</p>
                  {req.amount_needed > 0 && (
                    <div className="mt-2 max-w-md">
                      <FundingProgressBar
                        collected={req.collected_amount}
                        needed={req.amount_needed}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {req.status_label}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {req.created_at ? new Date(req.created_at).toLocaleDateString("fa-IR") : ""}
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
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selected.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selected.patient_name}</p>
                </div>
                <button type="button" onClick={closeModal}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-semibold">توضیحات بیمار:</span> {selected.description}</p>
                {selected.illness_summary && (
                  <p><span className="font-semibold">شرح حال:</span> {selected.illness_summary}</p>
                )}
                {selected.specialty_name && (
                  <p><span className="font-semibold">تخصص درخواستی:</span> {selected.specialty_name}</p>
                )}
                {selected.amount_needed > 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mt-2">
                    <p className="font-semibold text-emerald-800 mb-2">پیشرفت تأمین مالی</p>
                    <FundingProgressBar
                      collected={selected.collected_amount}
                      needed={selected.amount_needed}
                      size="md"
                    />
                  </div>
                )}
                {selected.confirmation_message && (
                  <p className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <span className="font-semibold">پیام تأیید:</span> {selected.confirmation_message}
                  </p>
                )}
              </div>

              <h4 className="font-bold text-gray-700 mb-3">گردش کار بیمار</h4>
              <PatientWorkflowTimeline patientId={selected.patient} />

              {error && selected && (
                <p className="text-red-600 text-sm mt-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="mt-6 space-y-3 border-t pt-4">
                {mode === "incoming" && selected.status === "pending" && !actionMode && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActionMode("schedule")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
                    >
                      زمان‌بندی و پاسخ
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionMode("funding")}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
                    >
                      نیاز به تأمین مالی
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => runAction({ action: "reject" })}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      رد
                    </button>
                  </div>
                )}

                {mode === "incoming" && actionMode === "schedule" && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">جزئیات ویزیت / تماس با بیمار</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">تاریخ</label>
                        <PersianDateInput value={appointmentDate} onChange={setAppointmentDate} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">ساعت</label>
                        <PersianTimeInput value={appointmentTime} onChange={setAppointmentTime} />
                      </div>
                    </div>
                    <input
                      className={inputClass}
                      placeholder="محل (آدرس مطب / بیمارستان)"
                      value={appointmentPlace}
                      onChange={(e) => setAppointmentPlace(e.target.value)}
                    />
                    <input
                      className={inputClass}
                      placeholder="شماره تماس"
                      value={appointmentPhone}
                      onChange={(e) => setAppointmentPhone(e.target.value)}
                    />
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="پیام برای بیمار و سلامتیار..."
                      value={confirmationMessage}
                      onChange={(e) => setConfirmationMessage(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() =>
                        runAction({
                          action: "schedule",
                          appointment_date: appointmentDate,
                          appointment_time: appointmentTime,
                          appointment_place: appointmentPlace,
                          appointment_phone: appointmentPhone,
                          confirmation_message: confirmationMessage,
                        })
                      }
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {acting ? "..." : "ثبت و ارسال به بیمار"}
                    </button>
                  </div>
                )}

                {mode === "incoming" && actionMode === "funding" && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      مبلغ مورد نیاز را اعلام کنید. درخواست برای نیکوکاران نمایش داده می‌شود.
                    </p>
                    <input
                      type="number"
                      className={inputClass}
                      placeholder="مبلغ مورد نیاز (تومان)"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() =>
                        runAction({
                          action: "request_funding",
                          amount_needed: Number(fundingAmount),
                        })
                      }
                      className="w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {acting ? "..." : "اعلام نیاز مالی"}
                    </button>
                  </div>
                )}

                {mode === "active" && selected.status === "in_progress" && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">تأیید نهایی و ارسال جزئیات</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">تاریخ</label>
                        <PersianDateInput
                          value={appointmentDate || selected.appointment_date || ""}
                          onChange={setAppointmentDate}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">ساعت</label>
                        <PersianTimeInput
                          value={appointmentTime || selected.appointment_time || ""}
                          onChange={setAppointmentTime}
                        />
                      </div>
                    </div>
                    <input
                      className={inputClass}
                      placeholder="محل"
                      value={appointmentPlace || selected.appointment_place || ""}
                      onChange={(e) => setAppointmentPlace(e.target.value)}
                    />
                    <input
                      className={inputClass}
                      placeholder="شماره تماس"
                      value={appointmentPhone || selected.appointment_phone || ""}
                      onChange={(e) => setAppointmentPhone(e.target.value)}
                    />
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="پیام برای بیمار و سلامتیار (جزئیات ویزیت، آمادگی‌ها و ...)"
                      value={confirmationMessage}
                      onChange={(e) => setConfirmationMessage(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() =>
                        runAction({
                          action: "confirm",
                          appointment_date: appointmentDate || selected.appointment_date,
                          appointment_time: appointmentTime || selected.appointment_time,
                          appointment_place: appointmentPlace || selected.appointment_place,
                          appointment_phone: appointmentPhone || selected.appointment_phone,
                          confirmation_message: confirmationMessage,
                        })
                      }
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {acting ? "..." : "تأیید نهایی درخواست"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingPayload}
        title={pendingPayload ? ACTION_CONFIRM[pendingPayload.action]?.title : ""}
        message={pendingPayload ? ACTION_CONFIRM[pendingPayload.action]?.message : ""}
        confirmLabel={pendingPayload ? ACTION_CONFIRM[pendingPayload.action]?.confirmLabel : "تأیید"}
        tone={pendingPayload ? ACTION_CONFIRM[pendingPayload.action]?.tone : "default"}
        loading={acting}
        onConfirm={() => performAction(pendingPayload)}
        onCancel={() => setPendingPayload(null)}
      />
    </motion.div>
  );
}
