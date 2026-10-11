import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { adminWalletService } from "../../Services/walletService";

export default function AdminWalletPanel() {
  const [payments, setPayments] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [generalDonations, setGeneralDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletSearch, setWalletSearch] = useState("");
  const [form, setForm] = useState({
    phone_number: "",
    direction: "credit",
    amount: "",
    reason: "",
  });
  const [payRequestForm, setPayRequestForm] = useState({
    network_request_id: "",
    amount: "",
  });
  const [msg, setMsg] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, wRes, plRes, gRes] = await Promise.all([
        adminWalletService.listGatewayPayments({ page_size: 30 }),
        adminWalletService.listWallets(walletSearch),
        adminWalletService.listPledges({ page_size: 30 }),
        adminWalletService.listGeneralDonations({ page_size: 30 }),
      ]);
      setPayments(pRes.data?.results || []);
      setWallets(Array.isArray(wRes.data) ? wRes.data : []);
      setPledges(plRes.data?.results || []);
      setGeneralDonations(gRes.data?.results || []);
    } catch {
      setPayments([]);
      setWallets([]);
      setPledges([]);
      setGeneralDonations([]);
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
    setMsgIsError(false);
    try {
      await adminWalletService.adjustBalance({
        phone_number: form.phone_number.trim(),
        direction: form.direction,
        amount: Number(form.amount),
        reason: form.reason,
      });
      setForm({ phone_number: "", direction: "credit", amount: "", reason: "" });
      setMsgIsError(false);
      setMsg("تنظیم موجودی با موفقیت انجام شد.");
      load();
    } catch (err) {
      setMsgIsError(true);
      setMsg(err.response?.data?.detail || "خطا در تنظیم موجودی.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
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
            className="sm:col-span-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
          >
            اعمال تغییر
          </button>
        </form>
        {msg && (
          <p className={`text-sm mt-3 ${msgIsError ? "text-red-600" : "text-blue-700"}`}>{msg}</p>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-gray-800 mb-2">پرداخت درخواست از کیف پول سامانه</h3>
        <p className="text-xs text-gray-500 mb-4">
          کمک‌های کلی وارد کیف پول سامانه می‌شود؛ مدیر می‌تواند به تشخیص خود از همان موجودی درخواست مالی را پرداخت کند.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setMsg("");
            setMsgIsError(false);
            try {
              await adminWalletService.payRequest(
                Number(payRequestForm.network_request_id),
                Number(payRequestForm.amount)
              );
              setPayRequestForm({ network_request_id: "", amount: "" });
              setMsg("پرداخت از کیف پول سامانه انجام شد.");
              load();
            } catch (err) {
              setMsgIsError(true);
              setMsg(err.response?.data?.detail || "پرداخت انجام نشد.");
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            type="number"
            required
            placeholder="شناسه درخواست"
            value={payRequestForm.network_request_id}
            onChange={(e) =>
              setPayRequestForm((f) => ({ ...f, network_request_id: e.target.value }))
            }
            className="p-3 rounded-xl border border-gray-200"
          />
          <input
            type="number"
            required
            placeholder="مبلغ (تومان)"
            value={payRequestForm.amount}
            onChange={(e) => setPayRequestForm((f) => ({ ...f, amount: e.target.value }))}
            className="p-3 rounded-xl border border-gray-200"
          />
          <button
            type="submit"
            className="sm:col-span-2 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
          >
            پرداخت از کیف پول سامانه
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-2">کمک‌های کلی</h3>
        <p className="text-xs text-gray-500 mb-4">
          مبالغی که خیر بدون انتخاب کمپین یا درخواست، به تشخیص مدیریت سامانه اهدا کرده است.
        </p>
        {generalDonations.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 rounded-xl p-6 text-center">کمک کلی ثبت نشده است.</p>
        ) : (
          <div className="space-y-2">
            {generalDonations.map((d) => (
              <div key={d.id} className="bg-white border rounded-xl p-4 flex justify-between gap-4">
                <div>
                  <p className="font-medium">{d.title || "کمک کلی"}</p>
                  <p className="text-xs text-gray-500">
                    {d.benefactor_username || "مهمان"} — {d.status_label || d.status}
                  </p>
                </div>
                <p className="font-bold text-emerald-700">
                  {Number(d.amount).toLocaleString("fa-IR")} تومان
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Search & List */}
      <div>
        <h3 className="font-bold text-gray-800 mb-4">کیف پول‌ها</h3>
        <input
          type="text"
          placeholder="جستجوی شماره موبایل..."
          value={walletSearch}
          onChange={(e) => setWalletSearch(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 mb-4 outline-none focus:ring-2 focus:ring-blue-200"
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
                  <p className="font-bold text-blue-600">
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
                <p className="font-bold text-blue-600">
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
                <p className={`font-bold ${h.status === "held" ? "text-amber-600" : h.status === "released" ? "text-blue-600" : "text-red-600"}`}>
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
