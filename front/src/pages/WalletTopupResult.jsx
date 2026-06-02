import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

export default function WalletTopupResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          navigate("/charitable/dashboard?tab=wallet");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [navigate]);

  const success = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {success ? (
          <CheckCircle className="mx-auto text-emerald-600 mb-4" size={64} />
        ) : (
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
        )}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {success ? "شارژ کیف پول موفق" : "شارژ کیف پول ناموفق"}
        </h1>
        <p className="text-gray-600 mb-6">
          {success
            ? "موجودی کیف پول شما به‌روزرسانی شد."
            : "پرداخت لغو شد یا با خطا مواجه شد."}
        </p>
        <p className="text-sm text-gray-400">
          انتقال به پیشخوان خیر در {countdown} ثانیه...
        </p>
        <button
          type="button"
          onClick={() => navigate("/charitable/dashboard?tab=wallet")}
          className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
        >
          بازگشت به کیف پول
        </button>
      </div>
    </div>
  );
}
