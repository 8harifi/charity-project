import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { motion } from "framer-motion";
import { MapPin, Search, Loader2 } from "lucide-react";
import { publicApi } from "../../API/publicApi";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";
import { getProvinceCenter, jitterCoordinate } from "../../data/iranProvinceCenters";

// Fix default marker icons breaking under Vite bundling. Bundled locally
// (instead of unpkg CDN) so the map still works when unpkg is blocked.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const IRAN_CENTER = [32.4279, 53.688];

export default function HealthAssistantMapSection() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");

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

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-blue-50/40" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">
            سلامتیاران در سراسر ایران
          </h2>
          <p className="text-blue-600 text-lg max-w-2xl mx-auto">
            شبکه‌ای از سلامتیاران داوطلب در استان‌های مختلف کشور، آماده معرفی و پیگیری بیماران نیازمند
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس نام یا کد سلامتیار..."
              className="w-full py-3 pr-10 pl-4 rounded-xl border border-blue-200 bg-white text-right outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="py-3 px-4 rounded-xl border border-blue-200 bg-white text-right outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">همه استان‌ها</option>
            {IRAN_PROVINCES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-3xl overflow-hidden border border-blue-100 shadow-lg relative" style={{ height: 480 }}>
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          )}
          <MapContainer center={IRAN_CENTER} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            />
            {markers.map((ha) => (
              <Marker key={ha.id} position={ha.position}>
                <Popup>
                  <div className="text-right" dir="rtl">
                    <p className="font-bold text-blue-900">{ha.name}</p>
                    <p className="text-xs text-gray-500">
                      کد: {ha.code}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {ha.city}، {ha.province}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {!loading && markers.length === 0 && (
          <p className="text-center text-blue-500 mt-6">
            سلامتیاری با این مشخصات یافت نشد.
          </p>
        )}
      </div>
    </section>
  );
}
