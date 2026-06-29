import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { adminWalletService } from "../../Services/walletService";

export default function AdminWalletPanel() {
  const [payments, setPayments] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patient_id: "",
    amount: "",
    payee_description: "",
    network_request_id: "",
  });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        adminWalletService.listGatewayPayments({ page_size: 50 }),
        adminWalletService.listDisbursements(),
      ]);
      setPayments(pRes.data?.results || []);
      setDisbursements(Array.isArray(dRes.data) ? dRes.data : []);
    } catch {
      setPayments([]);
      setDisbursements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDisburse = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await adminWalletService.createDisbursement({
        patient_id: Number(form.patient_id),
        amount: Number(form.amount),
        payee_description: form.payee_description,
        network_request_id: form.network_request_id
          ? Number(form.network_request_id)
          : null,
      });
      setForm({ patient_id: "", amount: "", payee_description: "", network_request_id: "" });
      setMsg("پرداخت از سپرده بیمار با موفقیت ثبت شد.");
      load();
    } catch (err) {
      setMsg(err.response?.data?.detail || "خطا در ثبت پرداخت.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-right space-y-8">
      <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 text-sm">
        حالت آزمایشی: درگاه پرداخت واقعی متصل نیست (Zarinpal غیرفعال). شارژ کیف پول به‌صورت mock انجام می‌شود.
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">ثبت پرداخت از سپرده بیمار</h3>
        <form onSubmit={handleDisburse} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="شناسه بیمار"
            value={form.patient_id}
            onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200"
            required
          />
          <input
            type="number"
            placeholder="مبلغ (تومان)"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200"
            required
          />
          <input
            type="number"
            placeholder="شناسه درخواست (اختیاری)"
            value={form.network_request_id}
            onChange={(e) => setForm((f) => ({ ...f, network_request_id: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200"
          />
          <input
            type="text"
            placeholder="گیرنده / توضیحات"
            value={form.payee_description}
            onChange={(e) => setForm((f) => ({ ...f, payee_description: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200 sm:col-span-2"
          />
          <button
            type="submit"
            className="sm:col-span-2 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
          >
            ثبت پرداخت
          </button>
        </form>
        {msg && <p className="text-sm mt-3 text-emerald-700">{msg}</p>}
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4">پرداخت‌های درگاه</h3>
        {payments.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 rounded-xl p-6 text-center">پرداختی یافت نشد.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="bg-white border rounded-xl p-4 flex justify-between gap-4">
                <div>
                  <p className="font-medium">#{p.id} — {p.status}</p>
                  <p className="text-xs text-gray-500">{p.authority || "—"}</p>
                </div>
                <p className="font-bold text-emerald-600">
                  {Number(p.amount).toLocaleString("fa-IR")} تومان
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-4">پرداخت‌های سپرده بیمار</h3>
        {disbursements.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 rounded-xl p-6 text-center">پرداختی ثبت نشده.</p>
        ) : (
          <div className="space-y-2">
            {disbursements.map((d) => (
              <div key={d.id} className="bg-white border rounded-xl p-4 flex justify-between gap-4">
                <div>
                  <p className="font-medium">{d.payee_description || "پرداخت"}</p>
                  <p className="text-xs text-gray-500">{d.status}</p>
                </div>
                <p className="font-bold">{Number(d.amount).toLocaleString("fa-IR")} تومان</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
