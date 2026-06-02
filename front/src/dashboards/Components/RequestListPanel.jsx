import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Loader2, X } from "lucide-react";
import RequestTimeline from "./RequestTimeline";
import { requestService } from "../../Services/dashboardApi";

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

export default function RequestListPanel({
  fetchFn,
  mode = "view",
  title = "درخواست‌ها",
  showFilters = true,
  defaultScope = "active",
  onAction,
  enableWalletPay = false,
  walletBalance = 0,
  onWalletPay,
}) {
  const [scope, setScope] = useState(defaultScope);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionNote, setActionNote] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetchFn(scope);
      setRequests(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error(err);
      setError("خطا در بارگذاری درخواست‌ها");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, scope]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (action) => {
    if (!selected) return;
    setActing(true);
    try {
      if (onAction) {
        await onAction(selected.id, action, actionNote);
      } else {
        await requestService.updateStatus(selected.id, action, actionNote);
      }
      setActionNote("");
      setSelected(null);
      await load();
    } catch (err) {
      console.error(err);
      setError("عملیات با خطا مواجه شد");
    } finally {
      setActing(false);
    }
  };

  const availableActions = (req) => {
    if (mode === "incoming") {
      return [
        { action: "accept", label: "پذیرش", className: "bg-emerald-600 hover:bg-emerald-700" },
        { action: "reject", label: "رد", className: "bg-red-500 hover:bg-red-600" },
      ];
    }
    if (mode === "cases" && ["accepted", "in_progress"].includes(req.status)) {
      return [
        ...(req.status === "accepted"
          ? [{ action: "start", label: "شروع", className: "bg-blue-600 hover:bg-blue-700" }]
          : []),
        { action: "complete", label: "تکمیل", className: "bg-emerald-600 hover:bg-emerald-700" },
      ];
    }
    return [];
  };

  const handleWalletPay = async () => {
    if (!selected || !onWalletPay) return;
    const amt = Number(payAmount || selected.amount_needed);
    if (!amt || amt <= 0) {
      setPayMsg("مبلغ نامعتبر است.");
      return;
    }
    if (walletBalance < amt) {
      setPayMsg("موجودی کیف پول کافی نیست.");
      return;
    }
    setPaying(true);
    setPayMsg("");
    try {
      await onWalletPay(selected.id, amt);
      setPayAmount("");
      setPayMsg("پرداخت با موفقیت انجام شد.");
      await load();
    } catch (err) {
      setPayMsg(err.response?.data?.detail || "خطا در پرداخت.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="text-right">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">{title}</h2>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setScope(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                scope === f.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
          درخواستی یافت نشد.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <button
              key={req.id}
              type="button"
              onClick={() => setSelected(req)}
              className="w-full text-right bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-emerald-200 transition"
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
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {req.status_label}
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
            onClick={() => setSelected(null)}
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
                <button type="button" onClick={() => setSelected(null)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p><span className="font-semibold">نوع:</span> {selected.request_type_label}</p>
                <p><span className="font-semibold">بیمار:</span> {selected.patient_name}</p>
                {selected.amount_needed && (
                  <p><span className="font-semibold">مبلغ:</span> {Number(selected.amount_needed).toLocaleString("fa-IR")} تومان</p>
                )}
                {selected.illness_summary && (
                  <p><span className="font-semibold">شرح حال:</span> {selected.illness_summary}</p>
                )}
                <p><span className="font-semibold">توضیحات:</span> {selected.description}</p>
              </div>

              <h4 className="font-bold text-gray-700 mb-3">گردش کار</h4>
              <RequestTimeline logs={selected.status_logs} />

              {enableWalletPay &&
                selected.request_type === "financial" &&
                ["accepted", "in_progress"].includes(selected.status) && (
                  <div className="mt-6 space-y-3 border-t pt-4">
                    <h4 className="font-bold text-gray-700">پرداخت از کیف پول</h4>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder={
                        selected.amount_needed
                          ? `پیش‌فرض: ${Number(selected.amount_needed).toLocaleString("fa-IR")}`
                          : "مبلغ (تومان)"
                      }
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                    <button
                      type="button"
                      disabled={paying}
                      onClick={handleWalletPay}
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {paying ? "..." : "پرداخت از کیف پول"}
                    </button>
                    {payMsg && <p className="text-sm text-emerald-700">{payMsg}</p>}
                  </div>
                )}

              {availableActions(selected).length > 0 && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={2}
                    placeholder="یادداشت (اختیاری)..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
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
    </motion.div>
  );
}
