import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { displayValue } from "../../utils/profileMappers";
import { profileService } from "../../Services/dashboardApi";

const EDIT_FIELDS = {
  patient: [
    { key: "phone_number", label: "تلفن همراه" },
    { key: "landline_number", label: "تلفن ثابت" },
    { key: "province", label: "استان" },
    { key: "city", label: "شهر" },
    { key: "address", label: "آدرس", multiline: true },
    { key: "sickness_description", label: "شرح حال بیماری", multiline: true },
    { key: "contact1_full_name", label: "نام آشنای اول" },
    { key: "contact1_phone_number", label: "تلفن آشنای اول" },
    { key: "contact2_full_name", label: "نام آشنای دوم" },
    { key: "contact2_phone_number", label: "تلفن آشنای دوم" },
  ],
  doctor: [
    { key: "phone_number", label: "تلفن همراه" },
    { key: "province", label: "استان" },
    { key: "city", label: "شهر" },
    { key: "address", label: "آدرس", multiline: true },
  ],
  benefactor: [{ key: "phone_number", label: "تلفن همراه" }],
  health_assistant_individual: [
    { key: "phone_number", label: "تلفن همراه" },
    { key: "job", label: "شغل" },
    { key: "province", label: "استان" },
    { key: "city", label: "شهر" },
    { key: "home_address", label: "آدرس محل سکونت", multiline: true },
    { key: "work_address", label: "آدرس محل کار", multiline: true },
  ],
  health_assistant_organization: [
    { key: "director_phone_number", label: "تلفن همراه رئیس" },
    { key: "director_landline_number", label: "تلفن ثابت رئیس" },
    { key: "province", label: "استان" },
    { key: "city", label: "شهر" },
    { key: "address", label: "آدرس مجموعه", multiline: true },
    { key: "social_unit_head_phone_number", label: "تلفن همراه رئیس واحد مددکاری" },
    { key: "social_unit_head_landline_number", label: "تلفن ثابت رئیس واحد" },
  ],
};

const PROFILE_KEY_MAP = {
  phoneNumber: "phone_number",
  landlineNumber: "landline_number",
  sickness_description: "sickness_description",
  illness: "sickness_description",
  contact1Name: "contact1_full_name",
  contact1Phone: "contact1_phone_number",
  contact2Name: "contact2_full_name",
  contact2Phone: "contact2_phone_number",
  homeAddress: "home_address",
  workAddress: "work_address",
  directorPhoneNumber: "director_phone_number",
  directorLandlineNumber: "director_landline_number",
  socialUnitHeadPhone: "social_unit_head_phone_number",
  socialUnitHeadLandline: "social_unit_head_landline_number",
};

function getFieldKey(role, profileType) {
  if (role === "health_assistant") {
    return profileType === "organization"
      ? "health_assistant_organization"
      : "health_assistant_individual";
  }
  return role;
}

function buildInitialForm(profile, fields) {
  const form = {};
  fields.forEach((f) => {
    const camelKey = Object.entries(PROFILE_KEY_MAP).find(([, v]) => v === f.key)?.[0];
    form[f.key] = profile[f.key] || (camelKey ? profile[camelKey] : "") || "";
  });
  return form;
}

export default function ProfileEditModal({ open, onClose, role, profile, profileType, onSaved }) {
  const fieldSet = useMemo(
    () => EDIT_FIELDS[getFieldKey(role, profileType)] || [],
    [role, profileType]
  );
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && profile) {
      setForm(buildInitialForm(profile, fieldSet));
      setError("");
    }
  }, [open, profile, fieldSet]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const r = await profileService.updateProfile(form);
      onSaved?.(r.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "خطا در ذخیره پروفایل");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">ویرایش پروفایل</h3>
            <button type="button" onClick={onClose}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {fieldSet.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {f.label}
                </label>
                {f.multiline ? (
                  <textarea
                    value={form[f.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[f.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              ذخیره
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
            >
              انصراف
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ProfileTabContent({ fields, role, profile, profileType, onProfileRefresh }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">اطلاعات پروفایل</h2>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
        >
          ویرایش پروفایل
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {fields.map((item) => (
          <div
            key={item.label}
            className={`bg-gray-50 p-4 sm:p-6 rounded-xl ${
              item.fullWidth ? "md:col-span-2" : ""
            }`}
          >
            <label className="text-gray-500 text-sm block mb-1">{item.label}</label>
            <p className="font-semibold text-gray-800 break-words">
              {displayValue(item.value)}
            </p>
          </div>
        ))}
      </div>
      <ProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        role={role}
        profile={profile}
        profileType={profileType}
        onSaved={() => onProfileRefresh?.()}
      />
    </>
  );
}
