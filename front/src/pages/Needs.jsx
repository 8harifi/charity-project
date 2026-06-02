import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { campaignService } from "../Services/dashboardApi";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1516549655669-df6654e447e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const formatAmount = (n) => Number(n || 0).toLocaleString("fa-IR");

const Needs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [selectedUrgency, setSelectedUrgency] = useState('همه');
  const [sortBy, setSortBy] = useState('جدیدترین');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
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
  }, []);

  const handleDonate = (campaignId) => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/loginpage");
      return;
    }
    navigate(`/charitable/dashboard?tab=newDonation&campaignId=${campaignId}`);
  };

  const filteredNeeds = useMemo(() => campaigns.filter((need) => {
    const matchesSearch =
      need.title.includes(searchTerm) || need.description.includes(searchTerm);
    const matchesCategory = selectedCategory === 'همه' || need.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'همه' || need.urgency === selectedUrgency;
    return matchesSearch && matchesCategory && matchesUrgency;
  }), [campaigns, searchTerm, selectedCategory, selectedUrgency]);

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
          <h1 className="text-3xl font-bold text-blue-700">نیازمندی‌های سلامت</h1>
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

        {/* گرید اصلی کارت‌ها */}
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
                    onDonateClick={() => handleDonate(need.id)}
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
      </div>

      {/* دکمه شناور */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-8 left-8 z-50 p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl" onClick={() => navigate("/loginpage")}>
        <FaMoneyBillWave className="text-2xl" />
      </motion.button>
    </div>
  );
};

export default Needs;

