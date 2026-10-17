import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaHandHoldingHeart,
  FaSortAmountDown
} from 'react-icons/fa';
import CharityCard from "../copmonent/home/CharityCard";
import BackgroundNetwork3D from "../copmonent/home/BackgroundNetwork3D";
import DonateModal from "../components/DonateModal";
import { campaignService, requestService } from "../Services/dashboardApi";
import { publicApi } from "../API/publicApi";
import { useAuth } from "../context/AuthContext";
import { walletService } from "../Services/walletService";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1516549655669-df6654e447e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const formatAmount = (n) => Number(n || 0).toLocaleString("fa-IR");

const Needs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLogin } = useAuth() || {};
  const tab = searchParams.get("tab") || "patients";
  const setTab = (next) => setSearchParams({ tab: next });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [selectedUrgency, setSelectedUrgency] = useState('همه');
  const [sortBy, setSortBy] = useState('جدیدترین');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [donateTarget, setDonateTarget] = useState(null);
  const [patientRequests, setPatientRequests] = useState([]);
  const [networkAmount, setNetworkAmount] = useState("");
  const [networkMsg, setNetworkMsg] = useState("");
  const [contactWarn, setContactWarn] = useState(null);
  const [guestContact, setGuestContact] = useState({ name: "", phone: "", region: "" });
  const [guestContactError, setGuestContactError] = useState("");

  const loadCampaigns = () => {
    campaignService
      .list()
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
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
            audience: c.audience || "patients",
            buttonText: "حمایت کن",
            buttonColor: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
            daysLeft: 30,
            supporters: 0,
            featured: c.urgency === "فوری",
          }))
        );
      })
      .catch(() => setCampaigns([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadCampaigns, []);

  useEffect(() => {
    publicApi
      .fundableRequests({ scope: "all" })
      .then((r) => setPatientRequests(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPatientRequests([]));
  }, []);

  const patientCampaigns = useMemo(
    () => campaigns.filter((c) => !c.audience || c.audience === "patients"),
    [campaigns]
  );
  const regionalCampaigns = useMemo(
    () => campaigns.filter((c) => c.audience === "regional"),
    [campaigns]
  );
  const filteredNeeds = useMemo(() => {
    const source = tab === "regions" ? regionalCampaigns : tab === "patients" ? patientCampaigns : [];
    return source.filter((need) => {
      const matchesSearch =
        need.title.includes(searchTerm) || need.description.includes(searchTerm);
      const matchesCategory = selectedCategory === "همه" || need.category === selectedCategory;
      const matchesUrgency = selectedUrgency === "همه" || need.urgency === selectedUrgency;
      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [tab, regionalCampaigns, patientCampaigns, searchTerm, selectedCategory, selectedUrgency]);

  const sortedNeeds = useMemo(() => [...filteredNeeds].sort((a, b) => {
    switch (sortBy) {
      case 'جدیدترین': return b.id - a.id;
      case 'فوری‌ترین': {
        const order = { 'فوری': 3, 'متوسط': 2, 'عادی': 1 };
        return order[b.urgency] - order[a.urgency];
      }
      case 'پیشرفت بیشتر': return b.progress - a.progress;
      case 'مبلغ کمتر':
        return parseInt(String(a.targetAmount).replace(/,/g, ''), 10) -
          parseInt(String(b.targetAmount).replace(/,/g, ''), 10);
      default: return 0;
    }
  }), [filteredNeeds, sortBy]);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]);
  };

  return (
  <div className="font-kook min-h-screen pt-34 bg-transparent relative overflow-hidden pb-20">

  
  {/* مدل سه‌بعدی پس‌زمینه */}
  <BackgroundNetwork3D />

  {/* محتوا */}
  <div className="relative  p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <FaHandHoldingHeart className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700">فراخوان‌ها و نیازمندی‌ها</h1>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { id: "patients", label: "بیماران" },
              { id: "regions", label: "مناطق نیازمند" },
              { id: "network", label: "شبکه" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-xl font-bold ${
                  tab === t.id ? "bg-blue-600 text-white" : "bg-white text-blue-700 border border-blue-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* بخش فیلترها */}
        <div className="mb-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="جستجو..."
                className="w-full p-4 pr-12 rounded-xl border border-blue-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-center gap-2">
              <FaFilter /> فیلترها
            </button>
          </div>

          <AnimatePresence>
            {(showFilters || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 mb-8 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">دسته‌بندی</label>
                    <div className="flex flex-wrap gap-2">
                      {['همه', 'درمانی', 'دارویی', 'جراحی', 'تجهیزات'].map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">فوریت</label>
                    <div className="flex flex-wrap gap-2">
                      {['همه', 'فوری', 'متوسط', 'عادی'].map(urg => (
                        <button key={urg} onClick={() => setSelectedUrgency(urg)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedUrgency === urg ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>{urg}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">مرتب‌سازی</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-2.5 rounded-lg border border-blue-100 bg-blue-50 outline-none text-blue-700 font-medium">
                      {['جدیدترین', 'فوری‌ترین', 'پیشرفت بیشتر', 'مبلغ کمتر'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {tab === "network" ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-blue-50 text-right">
            <h2 className="text-xl font-bold text-gray-800 mb-2">کمک به شبکه</h2>
            <p className="text-gray-700 leading-8">
              پرداخت شما صرف بیماران و مناطق نیازمند حوزه سلامت تحت پوشش شبکه،
              که در فراخوان‌ها اعلام شده است، خواهد شد.
            </p>
            <p className="text-sm text-gray-500 mt-2">پرداخت به کیف پول شبکه منتقل می‌شود.</p>
            <input
              type="number"
              min="1000"
              value={networkAmount}
              onChange={(e) => setNetworkAmount(e.target.value)}
              placeholder="مبلغ (تومان)"
              className="w-full mt-4 p-3 rounded-xl border border-blue-100"
            />
            {networkMsg && <p className="text-sm mt-2 text-blue-700">{networkMsg}</p>}
            <button
              type="button"
              className="mt-4 w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
              onClick={async () => {
                if (!networkAmount) return;
                if (isLogin) {
                  try {
                    await walletService.donate({
                      amount: Number(networkAmount),
                      destination_type: "general",
                      title: "کمک به شبکه",
                    });
                    setNetworkMsg("کمک شما ثبت شد و به کیف پول شبکه منتقل شد.");
                  } catch (err) {
                    setNetworkMsg(err.response?.data?.detail || "پرداخت انجام نشد.");
                  }
                } else {
                  setDonateTarget({
                    id: null,
                    title: "کمک به شبکه",
                    destination_type: "general",
                  });
                }
              }}
            >
              پرداخت به کیف پول شبکه
            </button>
          </div>
        ) : (
          <>
        {tab === "patients" && (
          <div className="max-w-6xl mx-auto mb-8 space-y-3">
            <h2 className="text-lg font-bold text-gray-800 text-right">درخواست‌های مالی بیماران</h2>
            {patientRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl p-4 border border-blue-50 text-right">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold">{req.patient_name}</p>
                    <p className="text-sm text-gray-500">{req.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">{req.patient_public?.disease}</p>
                    {req.patient_public && (
                      <p className="text-xs text-gray-500 mt-1">
                        {[
                          req.patient_public.age && `سن ${req.patient_public.age}`,
                          req.patient_public.marital_status,
                          req.patient_public.residence,
                          req.patient_public.insurance && `بیمه ${req.patient_public.insurance}`,
                          req.patient_public.covered_organization,
                        ]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    )}
                    {req.patient_public?.family_status && (
                      <details className="mt-1 text-xs text-gray-500">
                        <summary className="cursor-pointer text-blue-700">شرح حال خانواده</summary>
                        <p className="mt-1">{req.patient_public.family_status}</p>
                      </details>
                    )}
                    {Number(req.amount_needed) > 0 && (
                      <p className="text-xs text-emerald-700 mt-1">
                        نیاز: {formatAmount(req.amount_needed)} تومان
                      </p>
                    )}
                    <button
                      type="button"
                      className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      onClick={() => {
                        setGuestContact({ name: "", phone: "", region: "" });
                        setGuestContactError("");
                        setContactWarn(req);
                      }}
                    >
                      حمایت از این درخواست
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-blue-700 underline shrink-0"
                    onClick={() =>
                      navigate(
                        `/contact?intent=contact_disclosure&subject=درخواست مشخصات کامل بیمار&patient=${req.patient || ""}`
                      )
                    }
                  >
                    اطلاعات تماس و مشخصات کامل بیمار
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
          >
            <AnimatePresence>
              {sortedNeeds.map((need) => (
                <motion.div 
                  key={need.id} 
                  layout 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex flex-col h-full" // این کلاس قدها را یکی می‌کند
                >
                  <CharityCard 
                    {...need}
                    onDonateClick={() => setDonateTarget(need)}
                    onFavoriteClick={() => toggleFavorite(need.id)}
                    onShareClick={() => alert(`اشتراک‌گذاری: ${need.title}`)}
                    isFavorite={favorites.includes(need.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && sortedNeeds.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-blue-200">
            <h3 className="text-xl font-bold text-gray-400">موردی یافت نشد</h3>
          </div>
        )}
          </>
        )}
      </div>

      {/* دکمه شناور */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-8 left-8 z-50 p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl" onClick={() => navigate("/campaigns")}>
        <FaMoneyBillWave className="text-2xl" />
      </motion.button>

      {contactWarn && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4" onClick={() => setContactWarn(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">قبل از حمایت</h3>
            <p className="text-sm text-gray-700 leading-7">
              آیا مشخصات تماس بیمار را برای ارتباط مستقیم می‌خواهید؟ اگر بله، درخواستی ثبت می‌شود و پس از هماهنگی با بیمار به شما اطلاع داده می‌شود.
            </p>
            {!isLogin && (
              <div className="space-y-2">
                <input
                  value={guestContact.name}
                  onChange={(e) => setGuestContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="نام و نام خانوادگی"
                  className="w-full p-2.5 rounded-xl border border-blue-100 text-sm"
                />
                <input
                  value={guestContact.phone}
                  onChange={(e) => setGuestContact((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="شماره همراه"
                  className="w-full p-2.5 rounded-xl border border-blue-100 text-sm"
                />
                <input
                  value={guestContact.region}
                  onChange={(e) => setGuestContact((c) => ({ ...c, region: e.target.value }))}
                  placeholder="منطقه محل سکونت"
                  className="w-full p-2.5 rounded-xl border border-blue-100 text-sm"
                />
                {guestContactError && <p className="text-xs text-red-600">{guestContactError}</p>}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="py-2.5 rounded-xl bg-amber-600 text-white font-semibold"
                onClick={async () => {
                  const req = contactWarn;
                  if (isLogin) {
                    try {
                      await requestService.contactDisclosure({
                        patient_id: req.patient,
                        network_request_id: req.id,
                      });
                    } catch {
                      /* غیرخیر لاگین‌شده همچنان می‌تواند حمایت کند */
                    }
                  } else {
                    if (!guestContact.name.trim() || !guestContact.phone.trim() || !guestContact.region.trim()) {
                      setGuestContactError("نام، شماره همراه و منطقه برای ثبت درخواست تماس الزامی است.");
                      return;
                    }
                    try {
                      await publicApi.sendContact({
                        name: guestContact.name,
                        phone: guestContact.phone,
                        region: guestContact.region,
                        subject: "درخواست مشخصات کامل بیمار",
                        message: "درخواست مشاهده اطلاعات تماس پس از هماهنگی با بیمار.",
                        intent: "contact_disclosure",
                        patient: req.patient || undefined,
                      });
                    } catch {
                      setGuestContactError("ثبت درخواست تماس انجام نشد.");
                      return;
                    }
                  }
                  setContactWarn(null);
                  setGuestContactError("");
                  setDonateTarget({
                    id: req.id,
                    title: req.subject,
                    destination_type: "request",
                    network_request_id: req.id,
                  });
                }}
              >
                بله، مشخصات تماس را می‌خواهم
              </button>
              <button
                type="button"
                className="py-2.5 rounded-xl bg-emerald-600 text-white font-semibold"
                onClick={() => {
                  const req = contactWarn;
                  setContactWarn(null);
                  setDonateTarget({
                    id: req.id,
                    title: req.subject,
                    destination_type: "request",
                    network_request_id: req.id,
                  });
                }}
              >
                خیر، ادامه حمایت بدون تماس
              </button>
              <button type="button" className="text-sm text-gray-500" onClick={() => setContactWarn(null)}>
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Needs;

