import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CharityCard from "./CharityCard";
import { motion } from "framer-motion";
import DonateModal from "../../components/DonateModal";
import { campaignService } from "../../Services/dashboardApi";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1516549655669-df6654e447e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const formatAmount = (n) => Number(n || 0).toLocaleString("fa-IR");

const CharityCallSection = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [donateTarget, setDonateTarget] = useState(null);

  const loadCampaigns = () => {
    campaignService
      .list()
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data.slice(0, 3) : [];
        setCampaigns(
          list.map((c) => ({
            id: c.id,
            image: c.image_url || DEFAULT_IMAGE,
            title: c.title,
            description: c.description,
            targetAmount: formatAmount(c.target_amount),
            raisedAmount: formatAmount(c.raised_amount),
            progress: c.progress ?? 0,
            urgency: c.urgency || "عادی",
            category: c.category || "عمومی",
            buttonText: "حمایت کن",
            buttonColor: "bg-blue-500 hover:bg-blue-600",
          }))
        );
      })
      .catch(() => setCampaigns([]));
  };

  useEffect(loadCampaigns, []);

  return (
    <div className="font-kook max-w-screen overflow-x-hidden font-poppins">
      <div className="w-full py-[6rem] px-4 bg-gradient-to-b from-blue-50 to-white">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center sm:text-5xl mt-[4%] text-blue-900"
        >
          حمایت مالی و کمپین‌ها
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex text-xl justify-center sm:mb-20 mb-12 text-center mt-6 text-gray-700"
        >
          کمپین‌های فعال — حمایت مالی با یا بدون ورود به سامانه
        </motion.p>
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8">
          {campaigns.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500">کمپین فعالی ثبت نشده است.</p>
          ) : (
            campaigns.map((c) => (
              <CharityCard
                key={c.id}
                {...c}
                onDonateClick={() => setDonateTarget(c)}
              />
            ))
          )}
        </div>
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => navigate("/campaigns")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
          >
            مشاهده همه کمپین‌ها
          </button>
        </div>
      </div>

      {donateTarget && (
        <DonateModal
          campaign={donateTarget}
          onClose={() => setDonateTarget(null)}
          onDonated={loadCampaigns}
        />
      )}
    </div>
  );
};

export default CharityCallSection;
