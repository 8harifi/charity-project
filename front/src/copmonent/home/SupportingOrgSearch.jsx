import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { publicApi } from "../../API/publicApi";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";

export default function SupportingOrgSearch() {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (e, overrides = {}) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const r = await publicApi.supportingOrgs({
        q: overrides.q ?? q,
        province: overrides.province ?? province,
        city: overrides.city ?? city,
      });
      setResults(Array.isArray(r.data) ? r.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProvince("کرمان");
    setCity("کرمان");
    search(undefined, { province: "کرمان", city: "کرمان" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="font-kook bg-white py-12 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">جستجوی سازمان‌های حامی</h2>
        <p className="text-gray-600 mb-6">
          در منطقه خود جستجو کنید کدام مرکز درمانی یا مرکز نیکوکاری از شما حمایت می‌کند یا مشخصات شما را تأیید می‌نماید.
        </p>
        <form onSubmit={search} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="نام سازمان یا خدمات..."
              className="w-full p-3 pr-10 rounded-xl border border-blue-100"
            />
          </div>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="p-3 rounded-xl border border-blue-100"
          >
            <option value="">استان</option>
            {IRAN_PROVINCES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="شهر"
            className="p-3 rounded-xl border border-blue-100"
          />
          <button type="submit" className="md:col-span-4 py-3 rounded-xl bg-blue-600 text-white font-bold">
            {loading ? "در حال جستجو..." : "جستجو"}
          </button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && results.length === 0 && (
            <p className="text-gray-500 col-span-2 text-center py-8">سازمانی با این مشخصات یافت نشد.</p>
          )}
          {results.map((org) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-blue-50 rounded-2xl p-4 bg-blue-50/40"
            >
              <h3 className="font-bold text-gray-800">{org.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {org.org_type} {org.org_subtype ? `— ${org.org_subtype}` : ""}
              </p>
              {org.ha_subset && (
                <p className="text-sm text-blue-800 mt-2">زیرمجموعه سلامتیاری: {org.ha_subset}</p>
              )}
              <p className="text-sm text-gray-600 mt-2">{org.address || `${org.province} ${org.city}`}</p>
              {org.landline && <p className="text-sm text-gray-600">تلفن ثابت: {org.landline}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
