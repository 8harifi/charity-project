import { useCallback, useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { payoutService } from "../../Services/dashboardApi";

export default function PayoutPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [accountForm, setAccountForm] = useState({
    sheba: "",
    account_holder_name: "",
    bank_name: "",
  });
  const [amount, setAmount] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await payoutService.get();
      setData(r.data);
      if (r.data.account) {
        setAccountForm({
          sheba: r.data.account.sheba || "",
          account_holder_name: r.data.account.account_holder_name || "",
          bank_name: r.data.account.bank_name || "",
        });
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "خطا در بارگذاری اطلاعات تسویه");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await payoutService.updateAccount(accountForm);
      setSuccess("شماره شبا ذخیره شد.");
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.sheba ||
          err?.response?.data?.account_holder_name ||
          err?.response?.data?.detail ||
          "خطا در ذخیره حساب"
      );
    } finally {
      setSaving(false);
    }
  };

  const requestWithdrawal = async (e) => {
    e.preventDefault();
    setWithdrawing(true);
    setError("");
    setSuccess("");
    try {
      await payoutService.requestWithdrawal({ amount: Number(amount) });
      setSuccess("درخواست تسویه ثبت شد.");
      setAmount("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.amount || "خطا در ثبت درخواست");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-emerald-600" size={28} />
      </div>
    );
  }

  return (
    <div className="text-right space-y-8 max-w-3xl">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">تسویه و دریافت وجه</h2>
        <p className="text-sm text-gray-500 mt-1">
          موجودی کیف پول دریافت وجه و درخواست واریز به شماره شبا
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
        <Wallet className="text-emerald-600" size={28} />
        <div>
          <p className="text-sm text-emerald-700">موجودی قابل برداشت</p>
          <p className="text-2xl font-bold text-emerald-800">
            {(data?.balance ?? 0).toLocaleString("fa-IR")} تومان
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
      {success && <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">{success}</p>}

      <form onSubmit={saveAccount} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-gray-800">حساب بانکی</h3>
        <input
          value={accountForm.sheba}
          onChange={(e) => setAccountForm({ ...accountForm, sheba: e.target.value })}
          placeholder="شماره شبا (IR...)"
          className="w-full p-3 rounded-xl border border-gray-200"
          required
        />
        <input
          value={accountForm.account_holder_name}
          onChange={(e) => setAccountForm({ ...accountForm, account_holder_name: e.target.value })}
          placeholder="نام صاحب حساب"
          className="w-full p-3 rounded-xl border border-gray-200"
          required
        />
        <input
          value={accountForm.bank_name}
          onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })}
          placeholder="نام بانک (اختیاری)"
          className="w-full p-3 rounded-xl border border-gray-200"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-gray-800 text-white rounded-xl font-semibold disabled:opacity-60"
        >
          {saving ? "در حال ذخیره..." : "ذخیره شماره شبا"}
        </button>
      </form>

      <form onSubmit={requestWithdrawal} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-gray-800">درخواست تسویه</h3>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مبلغ به تومان"
          className="w-full p-3 rounded-xl border border-gray-200"
          required
        />
        <button
          type="submit"
          disabled={withdrawing}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-60"
        >
          {withdrawing ? "در حال ثبت..." : "ثبت درخواست تسویه"}
        </button>
      </form>

      <section className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 mb-3">تاریخچه درخواست‌ها</h3>
        {(data?.withdrawals || []).length === 0 ? (
          <p className="text-sm text-gray-400">درخواستی ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {data.withdrawals.map((w) => (
              <li key={w.id} className="py-2 text-sm flex justify-between gap-3">
                <span>
                  {Number(w.amount).toLocaleString("fa-IR")} تومان — {w.status_label}
                </span>
                <span className="text-gray-400">{String(w.created_at).slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
