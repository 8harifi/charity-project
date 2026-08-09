import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { payoutService } from "../../Services/dashboardApi";

const STATUS_FILTERS = [
  { value: "", label: "همه" },
  { value: "pending", label: "در انتظار" },
  { value: "approved", label: "تأیید شده" },
  { value: "paid", label: "پرداخت شده" },
  { value: "rejected", label: "رد شده" },
];

export default function AdminPayoutsPanel() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await payoutService.adminList(status ? { status } : {});
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      setError(err?.response?.data?.detail || "خطا در بارگذاری");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, action) => {
    const note = window.prompt("یادداشت (اختیاری):") || "";
    setBusyId(id);
    try {
      await payoutService.adminAction(id, action, note);
      await load();
    } catch (err) {
      alert(err?.response?.data?.detail || "خطا در انجام عملیات");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="text-right space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">درخواست‌های تسویه</h2>
          <p className="text-sm text-gray-500 mt-1">تأیید، پرداخت یا رد درخواست‌های شبا</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2.5 rounded-xl border border-gray-200 bg-white"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">موردی یافت نشد.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((w) => (
            <div
              key={w.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="text-sm space-y-1">
                <p className="font-bold text-gray-800">
                  {Number(w.amount).toLocaleString("fa-IR")} تومان — {w.status_label}
                </p>
                <p className="text-gray-600">
                  {w.account_holder_name} / {w.sheba}
                </p>
                <p className="text-gray-400">
                  کاربر: {w.user_username} — {String(w.created_at).slice(0, 10)}
                </p>
                {w.note && <p className="text-gray-500">یادداشت: {w.note}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {w.status === "pending" && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === w.id}
                      onClick={() => act(w.id, "approve")}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      تأیید
                    </button>
                    <button
                      type="button"
                      disabled={busyId === w.id}
                      onClick={() => act(w.id, "pay")}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm"
                    >
                      پرداخت
                    </button>
                    <button
                      type="button"
                      disabled={busyId === w.id}
                      onClick={() => act(w.id, "reject")}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                    >
                      رد
                    </button>
                  </>
                )}
                {w.status === "approved" && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === w.id}
                      onClick={() => act(w.id, "pay")}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm"
                    >
                      پرداخت
                    </button>
                    <button
                      type="button"
                      disabled={busyId === w.id}
                      onClick={() => act(w.id, "reject")}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                    >
                      رد
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
