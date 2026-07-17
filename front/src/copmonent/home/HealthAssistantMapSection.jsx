import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { MapPin, Search, Loader2, User, Award, Shield, Heart } from "lucide-react";
import { publicApi } from "../../API/publicApi";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";
import { getProvinceCenter, jitterCoordinate } from "../../data/iranProvinceCenters";

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const IRAN_CENTER = [32.4279, 53.688];

// کامپوننت کارت سلامتیار
const HealthAssistantCard = ({ ha, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className="group bg-white p-4 rounded-2xl border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
  >
    {/* Gradient Line on Top */}
    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-blue-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
        {ha.name?.charAt(0) || "س"}
      </div>
      <div className="flex-1 text-right">
        <h3 className="font-bold text-blue-900 text-base group-hover:text-blue-700 transition-colors">
          {ha.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span className="flex items-center gap-1">
            <Award size={12} className="text-amber-500" />
            {ha.code}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-blue-400" />
            {ha.city}
          </span>
        </div>
      </div>
    </div>

    {/* Badges */}
    <div className="flex items-center gap-2 mt-3 text-xs">
      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-100">
        <Shield size={12} />
        {ha.province}
      </span>
      {ha.isActive && (
        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
          <Heart size={12} />
          فعال
        </span>
      )}
    </div>
  </motion.div>
);

// کامپوننت آمار
const StatsRow = ({ count }) => (
  <div className="flex items-center justify-center gap-8 mt-6 text-sm">
    <div className="flex items-center gap-2 text-blue-600">
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      <span>{count} سلامتیار فعال</span>
    </div>
    <div className="flex items-center gap-2 text-emerald-600">
      <MapPin size={14} />
      <span>{new Set(assistants.map(a => a.province)).size} استان</span>
    </div>
  </div>
);

export default function HealthAssistantMapSection() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [mapError, setMapError] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      publicApi
        .healthAssistants({ search: search || undefined, province: province || undefined })
        .then((r) => setAssistants(Array.isArray(r.data) ? r.data : []))
        .catch(() => setAssistants([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, province]);

  const markers = useMemo(() => {
    const byProvince = {};
    assistants.forEach((ha) => {
      if (!ha.province) return;
      byProvince[ha.province] = byProvince[ha.province] || [];
      byProvince[ha.province].push(ha);
    });

    const result = [];
    Object.entries(byProvince).forEach(([prov, list]) => {
      const center = getProvinceCenter(prov);
      if (!center) return;
      list.forEach((ha, idx) => {
        result.push({
          ...ha,
          position: jitterCoordinate(center, idx, list.length),
        });
      });
    });
    return result;
  }, [assistants]);

  // شمارش استان‌های فعال
  const activeProvinces = useMemo(() => {
    return new Set(assistants.map(a => a.province)).size;
  }, [assistants]);

  return (
    <section className="font-kook py-20 sm:py-28 bg-gradient-to-b from-white via-blue-50/30 to-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
         
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-l from-blue-900 to-emerald-700 bg-clip-text text-transparent">
            سلامتیاران در سراسر ایران
          </h2>
          <p className="text-blue-600/80 text-lg max-w-2xl mx-auto mt-4">
            شبکه‌ای از سلامتیاران داوطلب در {activeProvinces} استان کشور، 
            آماده معرفی و پیگیری بیماران نیازمند
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto"
        >
          <div className="relative flex-1 group">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس نام یا کد سلامتیار..."
              className="w-full py-3.5 pr-12 pl-4 rounded-2xl border-2 border-blue-100 bg-white/80 backdrop-blur-sm text-right outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 placeholder:text-gray-400"
            />
          </div>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="py-3.5 px-5 rounded-2xl border-2 border-blue-100 bg-white/80 backdrop-blur-sm text-right outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 min-w-[160px] appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left 1rem center',
              paddingLeft: '2.5rem'
            }}
          >
            <option value="">همه استان‌ها</option>
            {IRAN_PROVINCES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Map + List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Map - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden border-2 border-blue-100/50 shadow-xl relative" style={{ height: 520 }}>
              {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                  <p className="text-blue-600 mt-3 text-sm">در حال بارگذاری نقشه...</p>
                </div>
              )}
              
              {!mapError ? (
                <MapContainer 
                  key="map"
                  center={IRAN_CENTER} 
                  zoom={5} 
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                   
                  {markers.map((ha) => (
                    <Marker 
                      key={ha.id} 
                      position={ha.position}
                      eventHandlers={{
                        click: () => setSelectedAssistant(ha)
                      }}
                    >
                      <Popup>
                        <div className="text-right p-2 min-w-[180px]" dir="rtl">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xs">
                              {ha.name?.charAt(0) || "س"}
                            </div>
                            <div>
                              <p className="font-bold text-blue-900">{ha.name}</p>
                              <p className="text-xs text-gray-500">کد: {ha.code}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin size={12} className="text-blue-400" /> 
                            {ha.city}، {ha.province}
                          </p>
                          {ha.isActive && (
                            <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              فعال
                            </span>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                // Fallback: اگر نقشه لود نشد
                <div className="h-full bg-white p-6 overflow-y-auto">
                  <p className="text-center text-blue-500 mb-4">نقشه در دسترس نیست</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assistants.map((ha) => (
                      <HealthAssistantCard 
                        key={ha.id} 
                        ha={ha}
                        onClick={() => setSelectedAssistant(ha)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border-2 border-blue-100/50 shadow-xl p-4 h-[520px] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                  <User size={16} className="text-blue-500" />
                  لیست سلامتیاران
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {assistants.length}
                  </span>
                </h3>
                {loading && <Loader2 size={16} className="animate-spin text-blue-400" />}
              </div>

              {!loading && assistants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <User size={48} className="text-blue-200 mb-3" />
                  <p className="text-blue-500">سلامتیاری یافت نشد</p>
                  <p className="text-xs text-gray-400 mt-1">با معیارهای جستجوی فعلی</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assistants.map((ha) => (
                    <HealthAssistantCard 
                      key={ha.id} 
                      ha={ha}
                      onClick={() => setSelectedAssistant(ha)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Stats */}
        {!loading && assistants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-8 pt-6 border-t border-blue-100/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{assistants.length}</p>
                <p className="text-xs text-gray-500">سلامتیار فعال</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{activeProvinces}</p>
                <p className="text-xs text-gray-500">استان فعال</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Award size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">
                  {assistants.filter(a => a.isActive).length}
                </p>
                <p className="text-xs text-gray-500">سلامتیار آماده به کار</p>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && markers.length === 0 && !mapError && assistants.length === 0 && (
          <p className="text-center text-blue-500 mt-6">
            سلامتیاری با این مشخصات یافت نشد.
          </p>
        )}
      </div>
    </section>
  );
}