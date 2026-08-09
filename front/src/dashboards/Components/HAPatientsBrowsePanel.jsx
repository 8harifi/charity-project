import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, SlidersHorizontal, X, UserPlus, Edit } from "lucide-react";
import { requestService } from "../../Services/dashboardApi";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";
import HAPatientEditModal from "./HAPatientEditModal";

const SCOPE_OPTIONS = [
  { id: "all", label: "همه بیماران" },
  { id: "others", label: "غیر از بیماران من" },
  { id: "mine", label: "بیماران من" },
  { id: "orphan", label: "بدون معرف (شهر من)" },
];

const APPROVAL_OPTIONS = [
  { id: "", label: "همه وضعیت‌ها" },
  { id: "approved", label: "تأییدشده" },
  { id: "pending", label: "در انتظار تأیید" },
];

export default function HAPatientsBrowsePanel({
  defaultScope = "others",
  onClaimOrphan,
  onPatientsChange,
}) {
  const [scope, setScope] = useState(defaultScope);
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [approval, setApproval] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPatient, setEditPatient] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await requestService.healthAssistantBrowsePatients({
        scope,
        search: search.trim() || undefined,
        province: province.trim() || undefined,
        city: city.trim() || undefined,
        national_code: nationalCode.trim() || undefined,
        approval: approval || undefined,
      });
      const list = Array.isArray(r.data) ? r.data : [];
      setPatients(list);
      onPatientsChange?.(list);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [scope, search, province, city, nationalCode, approval, onPatientsChange]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const clearAdvanced = () => {
    setProvince("");
    setCity("");
    setNationalCode("");
    setApproval("");
  };

  return (
    <div className="text-right">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">فهرست بیماران</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setScope(opt.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              scope === opt.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو نام، کد ملی، کد بیمار، موبایل، شرح بیماری..."
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm ${
            showAdvanced
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={18} />
          فیلتر پیشرفته
        </button>
      </div>

      {showAdvanced && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">استان</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-white"
            >
              <option value="">همه</option>
              {IRAN_PROVINCES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">شهر</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-sm"
              placeholder="نام شهر"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">کد ملی</label>
            <input
              value={nationalCode}
              onChange={(e) => setNationalCode(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-sm"
              placeholder="کد ملی"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">وضعیت حساب</label>
            <select
              value={approval}
              onChange={(e) => setApproval(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-white"
            >
              {APPROVAL_OPTIONS.map((o) => (
                <option key={o.id || "all"} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="button"
              onClick={clearAdvanced}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
              پاک کردن فیلترها
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={36} />
        </div>
      ) : patients.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">بیماری یافت نشد.</p>
      ) : (
        <div className="space-y-3">
          {patients.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-800">
                      {p.first_name} {p.last_name}
                    </h3>
                    {p.is_mine && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        بیمار من
                      </span>
                    )}
                    {p.is_orphan && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        بدون معرف
                      </span>
                    )}
                    {!p.state && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        در انتظار تأیید
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    کد: {p.patient_code}
                    {p.national_code ? ` — کد ملی: ${p.national_code}` : ""}
                    {p.phone_number ? ` — ${p.phone_number}` : ""}
                  </p>
                  {(p.province || p.city) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {[p.province, p.city].filter(Boolean).join("، ")}
                    </p>
                  )}
                  {p.introducer_name && !p.is_mine && (
                    <p className="text-xs text-gray-400 mt-1">
                      سلامتیار: {p.introducer_name}
                      {p.introducer_code ? ` (${p.introducer_code})` : ""}
                    </p>
                  )}
                  {p.sickness_description && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{p.sickness_description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {p.is_mine && (
                    <button
                      type="button"
                      onClick={() => setEditPatient(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-50"
                    >
                      <Edit size={14} />
                      ویرایش
                    </button>
                  )}
                  {p.is_orphan && onClaimOrphan && (
                    <button
                      type="button"
                      onClick={() => onClaimOrphan(p.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      <UserPlus size={14} />
                      پذیرش
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <HAPatientEditModal
        open={!!editPatient}
        patient={editPatient}
        onClose={() => setEditPatient(null)}
        onSaved={() => load()}
      />
    </div>
  );
}
