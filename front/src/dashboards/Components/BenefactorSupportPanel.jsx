import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import RequestListPanel from "./RequestListPanel";
import SearchBox from "./SearchBox";
import { donationService, requestService } from "../../Services/dashboardApi";

export default function BenefactorSupportPanel({ onWalletPay, onRefresh }) {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingDonations, setLoadingDonations] = useState(true);

  const loadDonations = useCallback(async () => {
    setLoadingDonations(true);
    try {
      const r = await donationService.list();
      setDonations(Array.isArray(r.data) ? r.data : []);
    } catch {
      setDonations([]);
    } finally {
      setLoadingDonations(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const handleWalletPay = async (requestId, payAmount) => {
    await onWalletPay(requestId, payAmount);
    loadDonations();
    onRefresh?.();
  };

  const filteredDonations = donations.filter(
    (d) =>
      (d.patient_label || d.patient || "").includes(search) ||
      (d.title || "").includes(search) ||
      (d.campaign || d.campaign_title || "").includes(search)
  );

  return (
    <div className="text-right space-y-10">
      <section>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
          درخواست‌هایی که به آن‌ها کمک کرده‌ام
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          وضعیت تأمین مالی درخواست‌هایی که از کیف پول شما حمایت شده‌اند
        </p>
        <RequestListPanel
          title=""
          fetchFn={(scope) => requestService.benefactorMyCases(scope)}
          mode="view"
          showFilters
          defaultScope="active"
        />
      </section>

      <section className="border-t border-gray-100 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">تاریخچه کمک‌ها</h2>
            <p className="text-sm text-gray-500 mt-1">همه پرداخت‌ها و تعهدات از کیف پول</p>
          </div>
          <SearchBox value={search} onChange={setSearch} placeholder="جستجو..." />
        </div>

        {loadingDonations ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
          </div>
        ) : filteredDonations.length === 0 ? (
          <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">
            کمکی ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredDonations.map((donation) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {donation.title || donation.campaign_title || donation.campaign || "کمک"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {donation.date} — {donation.status_label || donation.status}
                      {donation.destination_type && ` — ${donation.destination_type}`}
                    </p>
                    {donation.patient_label && (
                      <p className="text-xs text-gray-400 mt-1">بیمار: {donation.patient_label}</p>
                    )}
                  </div>
                  {donation.amount != null && (
                    <p className="text-lg font-bold text-emerald-600 shrink-0">
                      {Number(donation.amount).toLocaleString("fa-IR")}{" "}
                      <span className="text-xs font-normal text-gray-500">تومان</span>
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
