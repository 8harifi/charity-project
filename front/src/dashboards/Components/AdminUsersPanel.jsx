import { useCallback, useEffect, useState } from "react";
import { Check, Eye, Loader2, Search, X } from "lucide-react";
import {
  ROLE_DASHBOARD_HINTS,
  ROLE_LABELS,
  adminService,
  fkId,
  fkLabel,
} from "../../Services/adminService";

const ROLE_FILTERS = [
  { id: "", label: "همه نقش‌ها" },
  { id: "patient", label: "بیمار" },
  { id: "doctor", label: "پزشک" },
  { id: "health_assistant", label: "سلامتیار" },
  { id: "benefactor", label: "خیر" },
];

const STATE_FILTERS = [
  { id: "", label: "همه وضعیت‌ها" },
  { id: "pending", label: "در انتظار تایید" },
  { id: "approved", label: "تایید شده" },
];

const EDITABLE_PROFILE_FIELDS = {
  patient: [
    ["first_name", "نام"],
    ["last_name", "نام خانوادگی"],
    ["father_name", "نام پدر"],
    ["national_code", "کد ملی"],
    ["phone_number", "موبایل"],
    ["landline_number", "تلفن ثابت"],
    ["age", "سن", "number"],
    ["province", "استان"],
    ["city", "شهر"],
    ["address", "آدرس"],
    ["bank_card_number", "کارت بانکی"],
    ["sickness_description", "شرح بیماری"],
    ["gender", "جنسیت (شناسه lookup)", "fk"],
    ["marital_status", "وضعیت تأهل (شناسه)", "fk"],
    ["education", "تحصیلات (شناسه)", "fk"],
    ["job_status", "شغل (شناسه)", "fk"],
    ["housing_status", "مسکن (شناسه)", "fk"],
    ["covered_organization", "ارگان (شناسه)", "fk"],
    ["insurance", "بیمه (شناسه)", "fk"],
  ],
  doctor: [
    ["first_name", "نام"],
    ["last_name", "نام خانوادگی"],
    ["father_name", "نام پدر"],
    ["national_code", "کد ملی"],
    ["medical_system_code", "نظام پزشکی"],
    ["phone_number", "موبایل"],
    ["province", "استان"],
    ["city", "شهر"],
    ["address", "آدرس"],
    ["gender", "جنسیت (شناسه)", "fk"],
    ["specialty", "تخصص (شناسه)", "fk"],
  ],
  benefactor: [
    ["first_name", "نام"],
    ["last_name", "نام خانوادگی"],
    ["national_code", "کد ملی"],
    ["phone_number", "موبایل"],
    ["gender", "جنسیت (شناسه)", "fk"],
  ],
  health_assistant: [
    ["first_name", "نام"],
    ["last_name", "نام خانوادگی"],
    ["national_code", "کد ملی"],
    ["phone_number", "موبایل"],
    ["job", "شغل"],
    ["province", "استان"],
    ["city", "شهر"],
    ["home_address", "آدرس منزل"],
    ["work_address", "آدرس محل کار"],
    ["name", "نام مجموعه"],
    ["director_first_name", "نام مدیر"],
    ["director_last_name", "نام خانوادگی مدیر"],
    ["director_phone_number", "تلفن مدیر"],
  ],
};

function UserDetailModal({ userId, onClose, onUpdated }) {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [accountForm, setAccountForm] = useState({});
  const [profileForm, setProfileForm] = useState({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        adminService.getUser(userId),
        adminService.getUserRequests(userId, "all"),
      ]);
      setUser(u.data);
      setRequests(Array.isArray(r.data) ? r.data : []);
      setAccountForm({
        state: u.data.state !== false,
        is_active: u.data.is_active !== false,
        email: u.data.email || "",
      });
      const p = u.data.profile || {};
      const form = {};
      Object.keys(p).forEach((k) => {
        const v = p[k];
        form[k] = typeof v === "object" && v !== null && "id" in v ? v.id : v ?? "";
      });
      setProfileForm(form);
    } catch {
      setErr("خطا در بارگذاری کاربر");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const profilePayload = {};
      const fields = EDITABLE_PROFILE_FIELDS[user.role] || [];
      fields.forEach(([key, , type]) => {
        if (profileForm[key] === undefined || profileForm[key] === "") return;
        if (type === "number" || type === "fk") {
          profilePayload[key] = Number(profileForm[key]);
        } else {
          profilePayload[key] = profileForm[key];
        }
      });

      await adminService.updateUser(userId, {
        account: {
          state: accountForm.state,
          is_active: accountForm.is_active,
          email: accountForm.email,
        },
        profile: profilePayload,
      });
      setMsg("ذخیره شد.");
      setEditMode(false);
      load();
      onUpdated?.();
    } catch (e) {
      setErr(e.response?.data?.detail || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    await adminService.approveUser(userId);
    load();
    onUpdated?.();
  };

  const handleReject = async () => {
    if (!window.confirm("کاربر غیرفعال شود؟")) return;
    await adminService.rejectUser(userId);
    load();
    onUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-800">
            {user ? `${user.username} — ${ROLE_LABELS[user.role] || user.role}` : "کاربر"}
          </h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-700" size={32} />
          </div>
        ) : user ? (
          <>
            <div className="flex border-b border-gray-100 px-4 gap-4 text-sm">
              {["profile", "requests", "dashboard"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`py-3 border-b-2 ${
                    tab === t ? "border-blue-700 text-blue-700 font-bold" : "border-transparent text-gray-500"
                  }`}
                >
                  {t === "profile" && "پروفایل و حساب"}
                  {t === "requests" && "درخواست‌ها"}
                  {t === "dashboard" && "داشبورد نقش"}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 flex-1 text-right">
              {tab === "profile" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {!user.state && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm"
                      >
                        <Check size={16} /> تایید کاربر
                      </button>
                    )}
                    {user.is_active !== false && (
                      <button
                        type="button"
                        onClick={handleReject}
                        className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                      >
                        <X size={16} /> رد / غیرفعال
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditMode(!editMode)}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold"
                    >
                      {editMode ? "انصراف از ویرایش" : "ویرایش"}
                    </button>
                    {editMode && (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-3 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold"
                      >
                        {saving ? "..." : "ذخیره تغییرات"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="text-gray-500 block mb-1">تایید شده</span>
                      {editMode ? (
                        <select
                          value={accountForm.state ? "1" : "0"}
                          onChange={(e) =>
                            setAccountForm({ ...accountForm, state: e.target.value === "1" })
                          }
                          className="w-full p-2 rounded-lg border border-gray-200"
                        >
                          <option value="1">بله</option>
                          <option value="0">خیر</option>
                        </select>
                      ) : (
                        <span>{user.state !== false ? "بله" : "خیر"}</span>
                      )}
                    </label>
                    <label className="text-sm">
                      <span className="text-gray-500 block mb-1">فعال</span>
                      {editMode ? (
                        <select
                          value={accountForm.is_active ? "1" : "0"}
                          onChange={(e) =>
                            setAccountForm({ ...accountForm, is_active: e.target.value === "1" })
                          }
                          className="w-full p-2 rounded-lg border border-gray-200"
                        >
                          <option value="1">بله</option>
                          <option value="0">خیر</option>
                        </select>
                      ) : (
                        <span>{user.is_active !== false ? "بله" : "خیر"}</span>
                      )}
                    </label>
                  </div>

                  {user.profile ? (
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-700">پروفایل نقش</h4>
                      {(EDITABLE_PROFILE_FIELDS[user.role] || []).map(([key, label, type]) => {
                        const raw = user.profile[key];
                        const display =
                          type === "fk"
                            ? `${fkLabel(raw)} (id: ${fkId(raw) || "—"})`
                            : String(raw ?? "—");
                        return (
                          <label key={key} className="block text-sm">
                            <span className="text-gray-500">{label}</span>
                            {editMode ? (
                              <input
                                value={profileForm[key] ?? ""}
                                onChange={(e) =>
                                  setProfileForm({ ...profileForm, [key]: e.target.value })
                                }
                                className="w-full mt-1 p-2 rounded-lg border border-gray-200"
                              />
                            ) : (
                              <p className="font-medium text-gray-800 mt-0.5">{display}</p>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">پروفایل نقش برای این کاربر وجود ندارد.</p>
                  )}
                </div>
              )}

              {tab === "requests" && (
                <div>
                  {requests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">درخواستی یافت نشد.</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                        >
                          <p className="font-bold">{req.subject}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {req.request_type} — {req.status_label || req.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "dashboard" && (
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-900">
                  <p className="font-bold mb-2">آنچه این کاربر در داشبورد خود می‌بیند:</p>
                  <p>
                    {ROLE_DASHBOARD_HINTS[user.role] ||
                      "داشبورد اختصاصی برای این نقش پیاده‌سازی نشده."}
                  </p>
                  <p className="mt-4 text-blue-800">
                    تعداد درخواست‌های مرتبط: <strong>{requests.length}</strong>
                  </p>
                </div>
              )}

              {msg && <p className="text-emerald-700 text-sm mt-4">{msg}</p>}
              {err && <p className="text-red-600 text-sm mt-4">{err}</p>}
            </div>
          </>
        ) : (
          <p className="p-8 text-center text-red-600">{err}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminService.listUsers({
        role: roleFilter || undefined,
        state: stateFilter || undefined,
        search: search || undefined,
      });
      setUsers(Array.isArray(r.data) ? r.data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, stateFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="text-right space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">مدیریت کاربران</h2>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو نام کاربری..."
            className="w-full p-3 pr-10 rounded-xl border border-gray-200 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-3 rounded-xl border border-gray-200 bg-white"
        >
          {ROLE_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="p-3 rounded-xl border border-gray-200 bg-white"
        >
          {STATE_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-700" size={32} />
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">کاربری یافت نشد.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">نام کاربری</th>
                <th className="p-3 text-right">نقش</th>
                <th className="p-3 text-right">وضعیت</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.display_name || "—"}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="p-3">
                    {!u.state ? (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs">
                        در انتظار
                      </span>
                    ) : u.is_active === false ? (
                      <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-xs">
                        غیرفعال
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                        فعال
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setSelectedId(u.id)}
                      className="flex items-center gap-1 text-blue-700 hover:underline"
                    >
                      <Eye size={16} /> مشاهده
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <UserDetailModal
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}
