import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { requestService } from "../../Services/dashboardApi";

const EDIT_FIELDS = [
  { key: "first_name", label: "نام" },
  { key: "last_name", label: "نام خانوادگی" },
  { key: "phone_number", label: "تلفن همراه" },
  { key: "landline_number", label: "تلفن ثابت" },
  { key: "province", label: "استان" },
  { key: "city", label: "شهر" },
  { key: "address", label: "آدرس", multiline: true },
  { key: "sickness_description", label: "شرح بیماری", multiline: true },
  { key: "contact1_full_name", label: "نام آشنای اول" },
  { key: "contact1_phone_number", label: "تلفن آشنای اول" },
  { key: "contact2_full_name", label: "نام آشنای دوم" },
  { key: "contact2_phone_number", label: "تلفن آشنای دوم" },
];

function buildForm(patient) {
  const form = {};
  EDIT_FIELDS.forEach((f) => {
    form[f.key] = patient?.[f.key] ?? "";
  });
  return form;
}

export default function HAPatientEditModal({ open, patient, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && patient) {
      setForm(buildForm(patient));
      setError("");
    }
  }, [open, patient]);

  if (!open || !patient) return null;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const r = await requestService.healthAssistantUpdatePatient(patient.id, form);
      onSaved?.(r.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || "خطا در ذخیره اطلاعات بیمار");
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-gray-800">ویرایش بیمار</h3>
            <button type="button" onClick={onClose}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {patient.first_name} {patient.last_name} — {patient.patient_code}
          </p>

          <div className="space-y-4">
            {EDIT_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                {f.multiline ? (
                  <textarea
                    value={form[f.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={form[f.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
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
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
