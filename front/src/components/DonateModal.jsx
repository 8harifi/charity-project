import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { walletServiceGuest } from "../Services/dashboardApi";
import { walletService } from "../Services/walletService";
import { useAuth } from "../context/AuthContext";

/**
 * Donation entry point for the public site.
 *
 * Asks up front whether the donor wants the payment recorded against an account:
 * that is only possible while logged in, so answering yes routes to login, and
 * answering no goes straight to the bank gateway as an anonymous payment.
 */
export default function DonateModal({ campaign, onClose, onDonated }) {
  const navigate = useNavigate();
  const { isLogin } = useAuth() || {};
  const [step, setStep] = useState("history");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isNetwork = campaign?.destination_type === "general" || (campaign?.id == null && !campaign?.network_request_id);
  const isRequest = campaign?.destination_type === "request" || !!campaign?.network_request_id;

  useEffect(() => {
    setStep(isLogin ? "amount" : "history");
    setAmount("");
    setError("");
  }, [campaign?.id, campaign?.destination_type, campaign?.network_request_id, isLogin]);

  if (!campaign) return null;

  const goToLogin = () => {
    if (isRequest) {
      sessionStorage.setItem("pendingDonationRequestId", String(campaign.network_request_id || campaign.id));
    } else if (!isNetwork) {
      sessionStorage.setItem("pendingDonationCampaignId", String(campaign.id));
    } else {
      sessionStorage.setItem("pendingDonationNetwork", "1");
    }
    navigate("/loginpage");
  };

  const payAsGuest = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("مبلغ معتبر وارد کنید.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        const payload = { amount: value };
        if (isRequest) {
          payload.destination_type = "request";
          payload.network_request_id = campaign.network_request_id || campaign.id;
        } else if (isNetwork) {
          payload.destination_type = "general";
          payload.title = campaign.title || "کمک کلی";
        } else {
          payload.destination_type = "campaign";
          payload.campaign_id = campaign.id;
        }
        await walletService.donate(payload);
        onDonated?.();
        onClose();
        return;
      }
      const extra = isRequest
        ? { network_request_id: campaign.network_request_id || campaign.id }
        : {};
      const r = isNetwork
        ? await walletServiceGuest.guestDonate(null, value, "general")
        : isRequest
          ? await walletServiceGuest.guestDonate(null, value, "request", extra)
          : await walletServiceGuest.guestDonate(campaign.id, value);
      if (r.data?.payment_url) {
        window.location.href = r.data.payment_url;
        return;
      }
      onDonated?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail || "اتصال به درگاه پرداخت برقرار نشد. دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full text-right space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">حمایت مالی</h3>
              {campaign.title && (
                <p className="text-sm text-gray-500 mt-1">{campaign.title}</p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="بستن">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {step === "history" ? (
            <>
              <p className="text-sm text-gray-700">
                آیا به ثبت سابقه پرداخت نیاز دارید؟
              </p>
              <p className="text-xs text-gray-500 leading-6">
                برای ثبت سابقه پرداخت باید وارد سامانه شوید. در غیر این صورت پرداخت شما
                به صورت ناشناس و بدون ثبت سابقه انجام می‌شود.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
                >
                  بله — ورود به سامانه
                </button>
                <button
                  type="button"
                  onClick={() => setStep("amount")}
                  className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-semibold"
                >
                  خیر — پرداخت مستقیم
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="block text-sm font-semibold text-gray-700">
                مبلغ حمایت (تومان)
                <input
                  type="number"
                  min="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثلاً ۵۰۰۰۰۰"
                  className="w-full mt-2 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200"
                />
              </label>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={payAsGuest}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? "در حال انتقال به درگاه..." : "انتقال به درگاه بانک"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("history")}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm"
                >
                  بازگشت
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
