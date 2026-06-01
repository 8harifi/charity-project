import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import RenderDropdown from "../../pages/Auth/components/DropDown";
import { fetchSpecialties, requestService } from "../../Services/dashboardApi";

const REQUEST_TYPES = [
  { value: "consultation", label: "مشاوره پزشکی" },
  { value: "financial", label: "حمایت مالی" },
  { value: "service", label: "دریافت خدمات" },
];

const CONSULTATION_MODES = ["آنلاین", "حضوری", "تلفنی"];

const inputClass =
  "w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200";

export default function NewRequestForm({ forHealthAssistant = false, patients = [], onSuccess }) {
  const [requestType, setRequestType] = useState("consultation");
  const [patientId, setPatientId] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [amountNeeded, setAmountNeeded] = useState("");
  const [consultationMode, setConsultationMode] = useState("آنلاین");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [neededService, setNeededService] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSpecialties()
      .then(setSpecialties)
      .catch(console.error);
  }, []);

  const patientOptions = patients.map((p) => ({
    value: String(p.id),
    label: `${p.first_name} ${p.last_name} (${p.patient_code})`,
  }));

  const specialtyOptions = specialties.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject.trim() || !description.trim()) {
      setError("موضوع و توضیحات الزامی است.");
      return;
    }
    if (forHealthAssistant && !patientId) {
      setError("انتخاب بیمار الزامی است.");
      return;
    }
    if (requestType === "consultation" && !specialty) {
      setError("انتخاب تخصص پزشک الزامی است.");
      return;
    }
    if (requestType === "financial" && !amountNeeded) {
      setError("مبلغ مورد نیاز الزامی است.");
      return;
    }
    if (requestType === "service" && !neededService.trim()) {
      setError("نوع خدمت الزامی است.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        request_type: requestType,
        subject: subject.trim(),
        description: description.trim(),
      };
      if (forHealthAssistant) payload.patient_id = Number(patientId);
      if (requestType === "consultation") {
        payload.specialty = Number(specialty);
        payload.consultation_mode = consultationMode;
        payload.preferred_date = preferredDate;
        payload.preferred_time = preferredTime;
      }
      if (requestType === "financial") payload.amount_needed = Number(amountNeeded);
      if (requestType === "service") payload.needed_service = neededService.trim();

      await requestService.create(payload);
      setSuccess("درخواست با موفقیت ثبت شد.");
      setSubject("");
      setDescription("");
      setAmountNeeded("");
      setNeededService("");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        Object.values(err?.response?.data || {})?.[0]?.[0] ||
        "خطا در ثبت درخواست";
      setError(typeof msg === "string" ? msg : "خطا در ثبت درخواست");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handleSubmit}
      className="text-right max-w-2xl mx-auto space-y-5"
    >
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
        {forHealthAssistant ? "ثبت درخواست برای بیمار" : "ثبت درخواست جدید"}
      </h2>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">نوع درخواست</label>
        <div className="flex flex-wrap gap-2">
          {REQUEST_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setRequestType(t.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                requestType === t.value
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {forHealthAssistant && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">بیمار</label>
          <RenderDropdown
            value={patientId}
            setValue={setPatientId}
            options={patientOptions}
            placeholder="انتخاب بیمار..."
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">موضوع</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
          placeholder="موضوع درخواست..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="شرح کامل درخواست..."
        />
      </div>

      {requestType === "consultation" && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">تخصص پزشک</label>
            <RenderDropdown
              value={specialty}
              setValue={setSpecialty}
              options={specialtyOptions}
              placeholder="انتخاب تخصص..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نوع مشاوره</label>
            <div className="flex gap-2 flex-wrap">
              {CONSULTATION_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setConsultationMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    consultationMode === m
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاریخ ترجیحی</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ساعت ترجیحی</label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </>
      )}

      {requestType === "financial" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ مورد نیاز (تومان)</label>
          <input
            type="number"
            value={amountNeeded}
            onChange={(e) => setAmountNeeded(e.target.value)}
            className={inputClass}
            placeholder="مبلغ..."
          />
        </div>
      )}

      {requestType === "service" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">خدمت مورد نیاز</label>
          <input
            type="text"
            value={neededService}
            onChange={(e) => setNeededService(e.target.value)}
            className={inputClass}
            placeholder="مثلاً همراه‌سرا، توانبخشی..."
          />
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      {success && (
        <p className="text-emerald-700 text-sm bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        ثبت درخواست
      </button>
    </motion.form>
  );
}
