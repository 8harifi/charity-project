import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { adminWalletService } from "../../Services/walletService";

export default function AdminWalletPanel() {
  const [payments, setPayments] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletSearch, setWalletSearch] = useState("");
  const [form, setForm] = useState({
    phone_number: "",
    direction: "credit",
    amount: "",
    reason: "",
  });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, wRes, plRes] = await Promise.all([
        adminWalletService.listGatewayPayments({ page_size: 30 }),
        adminWalletService.listWallets(walletSearch),
        adminWalletService.listPledges({ page_size: 30 }),
      ]);
      setPayments(pRes.data?.results || []);
      setWallets(Array.isArray(wRes.data) ? wRes.data : []);
      setPledges(plRes.data?.results || []);
    } catch {
      setPayments([]);
      setWallets([]);
      setPledges([]);
    } finally {
      setLoading(false);
    }
  }, [walletSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await adminWalletService.adjustBalance({
        phone_number: form.phone_number.trim(),
        direction: form.direction,
        amount: Number(form.amount),
        reason: form.reason,
      });
      setForm({ phone_number: "", direction: "credit", amount: "", reason: "" });
      setMsg("تنظیم موجودی با موفقیت انجام شد.");
      load();
    } catch (err) {
      setMsg(err.response?.data?.detail || "خطا در تنظیم موجودی.");
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
      {/* Balance Adjustment */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">تعدیل موجودی کیف پول</h3>
        <p className="text-xs text-gray-500 mb-4">
          برای شارژ دستی (پرداخت حضوری خیر) direction=credit و برای برداشت/اصلاح direction=debit
        </p>
        <form onSubmit={handleAdjust} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="tel"
            placeholder="شماره موبایل نیکوکار (مثلاً 09123456789)"
            value={form.phone_number}
            onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200"
            dir="ltr"
            required
          />
          <div className="flex items-center gap-2">
            <select
              value={form.direction}
              onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
              className="p-3 rounded-xl border border-gray-200 flex-1"
            >
              <option value="credit">شارژ (credit)</option>
              <option value="debit">برداشت (debit)</option>
            </select>
          </div>
          <input
            type="number"
            placeholder="مبلغ (تومان)"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200"
            required
          />
          <input
            type="text"
            placeholder="دلیل (اختیاری)"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200"
          />
          <button
            type="submit"
            className="sm:col-span-2 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
          >
            اعمال تغییر
          </button>
        </form>
        {msg && <p className="text-sm mt-3 text-emerald-700">{msg}</p>}
      </div>

      {/* Wallet Search & List */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">کیف پول‌ها</h3>
        <input
          type="text"
          placeholder="جستجوی شماره موبایل..."
          value={walletSearch}
          onChange={(e) => setWalletSearch(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-emerald-200"
        />
        {wallets.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 rounded-xl p-6 text-center">کیف پولی یافت نشد.</p>
        ) : (
          <div className="space-y-2">
            {wallets.map((w) => (
              <div key={w.id} className="bg-white border rounded-xl p-4 flex justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {w.owner_username} — {w.owner_role}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-emerald-600">
                    {Number(w.cached_balance).toLocaleString("fa-IR")} تومان
                  </p>
                  {Number(w.held_balance) > 0 && (
                    <p className="text-sm text-amber-600">
                      {Number(w.held_balance).toLocaleString("fa-IR")} معلق
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gateway Payments */}
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

      {/* Pledges */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">تعهدات مالی (DonationHold)</h3>
        {pledges.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 rounded-xl p-6 text-center">تعهدی یافت نشد.</p>
        ) : (
          <div className="space-y-2">
            {pledges.map((h) => (
              <div key={h.id} className="bg-white border rounded-xl p-4 flex justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {h.benefactor_name} — {h.request_subject}
                  </p>
                  <p className="text-xs text-gray-500">
                    {h.patient_name} — درخواست #{h.request_id}
                  </p>
                </div>
                <p className={`font-bold ${h.status === "held" ? "text-amber-600" : h.status === "released" ? "text-emerald-600" : "text-red-600"}`}>
                  {Number(h.amount).toLocaleString("fa-IR")} — {h.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
