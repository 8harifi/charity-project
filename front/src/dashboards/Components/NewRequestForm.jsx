import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import RenderDropdown from "../../pages/Auth/components/DropDown";
import { fetchSpecialties, requestService } from "../../Services/dashboardApi";
import PersianDateInput from "../../components/PersianDateInput";
import PersianTimeInput from "../../components/PersianTimeInput";

const REQUEST_TYPES = [
  { value: "consultation", label: "درخواست پزشکی" },
  { value: "financial", label: "حمایت مالی" },
  { value: "service", label: "دریافت خدمات" },
];

const CONSULTATION_MODES = ["حضوری", "تلفنی"];

function lookupId(field) {
  if (field == null || field === "") return "";
  if (typeof field === "object") return field.value ?? "";
  return field;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200";

export default function NewRequestForm({ forHealthAssistant = false, forDoctor = false, patients = [], onSuccess }) {
  const [requestType, setRequestType] = useState("consultation");
  const [patientId, setPatientId] = useState(null);
  const [specialty, setSpecialty] = useState(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [amountNeeded, setAmountNeeded] = useState("");
  const [fundRecipient, setFundRecipient] = useState(null);
  const [fundRecipientOptions, setFundRecipientOptions] = useState([]);
  const [consultationMode, setConsultationMode] = useState("حضوری");
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

  useEffect(() => {
    if (!forHealthAssistant && !forDoctor) return;
    requestService
      .fundRecipientOptions()
      .then((r) => {
        const opts = Array.isArray(r.data) ? r.data : [];
        setFundRecipientOptions(
          opts.map((o) => ({
            value: String(o.id),
            label: o.is_self ? `${o.label} (خودم)` : o.label,
          }))
        );
      })
      .catch(() => setFundRecipientOptions([]));
  }, [forHealthAssistant, forDoctor]);

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
    if ((forHealthAssistant || forDoctor) && !lookupId(patientId)) {
      setError("انتخاب بیمار الزامی است.");
      return;
    }
    if (requestType === "consultation" && (forHealthAssistant || forDoctor) && !lookupId(specialty)) {
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
      if (forHealthAssistant || forDoctor) {
        payload.patient_id = Number(lookupId(patientId));
      }
      if (requestType === "consultation") {
        const specId = lookupId(specialty);
        if (specId) payload.specialty = Number(specId);
        if (forHealthAssistant || forDoctor) {
          payload.consultation_mode = consultationMode;
          payload.preferred_date = preferredDate;
          payload.preferred_time = preferredTime;
        }
      }
      if (requestType === "financial") {
        payload.amount_needed = Number(amountNeeded);
        if (lookupId(fundRecipient)) {
          payload.fund_recipient_user_id = Number(lookupId(fundRecipient));
        }
      }
      if (requestType === "service") payload.needed_service = neededService.trim();

      await requestService.create(payload);
      setSuccess("درخواست با موفقیت ثبت شد.");
      setSubject("");
      setDescription("");
      setAmountNeeded("");
      setNeededService("");
      setSpecialty(null);
      setFundRecipient(null);
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
        {!forHealthAssistant && !forDoctor ? (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
            درخواست پزشکی — نیاز خود را بنویسید (مثلاً وقت ویزیت، جراحی، مشاوره و ...)
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {REQUEST_TYPES.filter((t) => {
              if (t.value === "financial" && !forHealthAssistant && !forDoctor) return false;
              return true;
            }).map((t) => (
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
        )}
      </div>

      {(forHealthAssistant || forDoctor) && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">بیمار</label>
          <RenderDropdown
            value={patientId}
            setValue={setPatientId}
            options={patientOptions}
            placeholder="انتخاب بیمار..."
            name="patient"
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
          placeholder="مثلاً وقت ویزیت، جراحی، مشاوره تخصصی..."
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تخصص پزشک {forHealthAssistant || forDoctor ? "" : "(اختیاری)"}
            </label>
          <RenderDropdown
            value={specialty}
            setValue={setSpecialty}
            options={specialtyOptions}
            placeholder="انتخاب تخصص..."
            name="specialty"
          />
          </div>
          {(forHealthAssistant || forDoctor) && (
          <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نوع تماس</label>
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
              <PersianDateInput value={preferredDate} onChange={setPreferredDate} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ساعت ترجیحی</label>
              <PersianTimeInput value={preferredTime} onChange={setPreferredTime} />
            </div>
          </div>
          </>
          )}
        </>
      )}

      {requestType === "financial" && (
        <>
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
          {(forHealthAssistant || forDoctor) && fundRecipientOptions.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                گیرنده وجه (پس از تکمیل درخواست)
              </label>
              <RenderDropdown
                value={fundRecipient}
                setValue={setFundRecipient}
                options={fundRecipientOptions}
                placeholder="پیش‌فرض: خودم"
                name="fund-recipient"
              />
              <p className="text-xs text-gray-400 mt-1">
                وجه جمع‌آوری‌شده پس از تأیید نهایی به کیف پول این شخص واریز می‌شود.
              </p>
            </div>
          )}
        </>
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
