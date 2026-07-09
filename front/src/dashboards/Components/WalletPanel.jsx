import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Loader2, Wallet } from "lucide-react";
import { walletService } from "../../Services/walletService";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function WalletPanel({ onBalanceChange }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpMsg, setTopUpMsg] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Keep the latest callback in a ref so `load` never needs to change
  // identity just because the parent re-renders with a new inline function.
  // Otherwise: load() -> onBalanceChange() -> parent state update -> new
  // onBalanceChange reference -> load() changes -> effect re-fires -> loop.
  const onBalanceChangeRef = useRef(onBalanceChange);
  useEffect(() => {
    onBalanceChangeRef.current = onBalanceChange;
  }, [onBalanceChange]);

  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const r = await walletService.getWallet();
      setWallet(r.data);
      onBalanceChangeRef.current?.(Number(r.data.balance));
    } catch (err) {
      setWallet(null);
      setLoadError(err.response?.data?.detail || "خطا در بارگذاری کیف پول");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTopUpClick = () => {
    setTopUpMsg("");
    const amt = Number(topUpAmount);
    if (!amt || amt < 10000) {
      setTopUpMsg("حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleTopUp = async () => {
    setConfirmOpen(false);
    const amt = Number(topUpAmount);
    setTopUpLoading(true);
    try {
      const r = await walletService.topUp(amt);
      if (r.data?.mock || r.data?.verified) {
        setTopUpAmount("");
        setTopUpMsg("شارژ آزمایشی با موفقیت انجام شد.");
        await load();
        return;
      }
      const url = r.data?.payment_url;
      if (url) {
        window.location.href = url;
      } else {
        setTopUpMsg("خطا در دریافت لینک پرداخت.");
      }
    } catch (err) {
      setTopUpMsg(err.response?.data?.detail || "خطا در شروع پرداخت.");
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  const balance = Number(wallet?.balance || 0);
  const heldBalance = Number(wallet?.held_balance || 0);
  const transactions = wallet?.recent_transactions || [];
  const mockPayments = wallet?.payment_mode === "mock";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-right">
      <div className="max-w-2xl mx-auto space-y-6">
        {loadError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {loadError}
          </p>
        )}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={28} />
            <h2 className="text-xl font-bold">کیف پول من</h2>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-3xl font-bold">
              {balance.toLocaleString("fa-IR")}{" "}
              <span className="text-sm font-normal opacity-90">تومان</span>
              <span className="block text-sm font-normal opacity-70 mt-1">موجودی قابل برداشت</span>
            </p>
            {heldBalance > 0 && (
              <p className="text-lg text-white/70">
                {heldBalance.toLocaleString("fa-IR")} تومان
                <span className="block text-xs opacity-60">معلق (در انتظار تأیید سلامتیار/پزشک)</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 sm:p-6">
          <h3 className="font-bold text-gray-800 mb-4">شارژ کیف پول</h3>
          {mockPayments && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
              حالت آزمایشی: Zarinpal غیرفعال است — پرداخت بدون درگاه تأیید می‌شود.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="مبلغ (تومان)"
              className="flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleTopUpClick}
              disabled={topUpLoading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {topUpLoading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
              {mockPayments ? "شارژ آزمایشی" : "پرداخت آنلاین"}
            </button>
          </div>
          {topUpMsg && <p className="text-sm mt-3 text-amber-700">{topUpMsg}</p>}
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="تأیید شارژ کیف پول"
          message={`آیا از شارژ کیف پول به مبلغ ${Number(topUpAmount || 0).toLocaleString("fa-IR")} تومان مطمئن هستید؟`}
          confirmLabel="تأیید و پرداخت"
          onConfirm={handleTopUp}
          onCancel={() => setConfirmOpen(false)}
        />

        <div>
          <h3 className="font-bold text-gray-800 mb-4">تراکنش‌های اخیر</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">تراکنشی ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div>
                    <p className="font-medium text-gray-800">{tx.description || tx.kind}</p>
                    <p className="text-xs text-gray-500">
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString("fa-IR") : ""}
                    </p>
                  </div>
                  <p
                    className={`font-bold ${
                      tx.entry_type === "credit" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {tx.entry_type === "credit" ? "+" : "-"}
                    {Number(tx.amount).toLocaleString("fa-IR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
