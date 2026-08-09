import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { requestService } from "../../Services/dashboardApi";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";
import { ORGANIZATION_TYPES } from "../../data/organizationTypes";

const ROLE_OPTIONS = [
  { value: "", label: "همه" },
  { value: "patient", label: "بیمار" },
  { value: "doctor", label: "پزشک" },
  { value: "health_assistant", label: "سلامتیار" },
  { value: "benefactor", label: "خیر" },
  { value: "organization", label: "سازمان" },
];

export default function GlobalSearchPanel({ permissions = {} }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [orgType, setOrgType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  const canSearchAnything =
    permissions.can_search_patients ||
    permissions.can_search_doctors ||
    permissions.can_search_assistants ||
    permissions.can_search_benefactors ||
    permissions.can_search_organizations;

  const runSearch = async (e) => {
    e?.preventDefault?.();
    if (!q.trim()) {
      setError("عبارت جستجو الزامی است.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await requestService.globalSearch({
        q: q.trim(),
        role: role || undefined,
        province: province || undefined,
        city: city || undefined,
        org_type: orgType || undefined,
        description: description || undefined,
      });
      setResults(r.data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || "خطا در جستجو");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  if (!canSearchAnything) {
    return (
      <p className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
        دسترسی جستجوی کلی برای حساب شما فعال نشده است.
      </p>
    );
  }

  const sections = [
    { key: "patients", title: "بیماران", enabled: permissions.can_search_patients },
    { key: "doctors", title: "پزشکان", enabled: permissions.can_search_doctors },
    { key: "health_assistants", title: "سلامتیاران", enabled: permissions.can_search_assistants },
    { key: "benefactors", title: "خیرین", enabled: permissions.can_search_benefactors },
    { key: "organizations", title: "سازمان‌ها", enabled: permissions.can_search_organizations },
  ];

  return (
    <div className="text-right space-y-6">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">جستجوی کلی شبکه</h2>
        <p className="text-sm text-gray-500 mt-1">
          جستجو بر اساس منطقه، نوع فرد/سازمان و توضیحات عضو شبکه
        </p>
      </div>

      <form onSubmit={runSearch} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام، کد ملی، کد، تلفن..."
            className="p-3 rounded-xl border border-gray-200"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-3 rounded-xl border border-gray-200 bg-white"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="p-3 rounded-xl border border-gray-200 bg-white"
          >
            <option value="">همه استان‌ها</option>
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
            className="p-3 rounded-xl border border-gray-200"
          />
          <select
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
            className="p-3 rounded-xl border border-gray-200 bg-white"
          >
            <option value="">نوع سازمان</option>
            {ORGANIZATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات عضو شبکه (اسکان، ویلچر، مهارت...)"
            className="p-3 rounded-xl border border-gray-200 sm:col-span-2 lg:col-span-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          جستجو
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {results && (
        <div className="space-y-6">
          {sections
            .filter((s) => s.enabled)
            .map((s) => {
              const rows = results[s.key] || [];
              return (
                <section key={s.key} className="bg-white border border-gray-100 rounded-2xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3">
                    {s.title} ({rows.length.toLocaleString("fa-IR")})
                  </h3>
                  {rows.length === 0 ? (
                    <p className="text-sm text-gray-400">موردی یافت نشد.</p>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {rows.map((row) => (
                        <li key={`${s.key}-${row.id}`} className="py-2 text-sm text-gray-700">
                          <span className="font-semibold">
                            {row.name ||
                              `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
                              row.code ||
                              `#${row.id}`}
                          </span>
                          {row.patient_code && (
                            <span className="text-gray-400 mr-2"> — {row.patient_code}</span>
                          )}
                          {row.code && s.key === "health_assistants" && (
                            <span className="text-gray-400 mr-2"> — {row.code}</span>
                          )}
                          {(row.province || row.city) && (
                            <span className="text-gray-400 mr-2">
                              {" "}
                              — {[row.province, row.city].filter(Boolean).join(" / ")}
                            </span>
                          )}
                          {row.org_type && (
                            <span className="text-gray-400 mr-2"> — {row.org_type}</span>
                          )}
                          {row.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{row.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
