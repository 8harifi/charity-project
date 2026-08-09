import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import RenderDropdown from "../../pages/Auth/components/DropDown";
import { fetchSpecialties, requestService } from "../../Services/dashboardApi";
import PersianDateInput from "../../components/PersianDateInput";
import PersianTimeInput from "../../components/PersianTimeInput";

const STAFF_REQUEST_TYPES = [
  { value: "consultation", label: "درخواست ویزیت" },
  { value: "financial", label: "حمایت مالی" },
  { value: "service", label: "دریافت خدمات" },
  { value: "regional", label: "نیازمندی منطقه" },
];

const PATIENT_SUBTYPES = [
  { value: "accommodation", label: "رزرو اسکان" },
  { value: "expense", label: "هزینه‌کرد" },
  { value: "visit", label: "وقت ویزیت" },
  { value: "other", label: "سایر موارد" },
];

const EXPENSE_CATEGORIES = [
  { value: "visit", label: "ویزیت" },
  { value: "medicine", label: "دارو" },
  { value: "lab", label: "آزمایش" },
  { value: "imaging", label: "تصویربرداری" },
  { value: "equipment", label: "تجهیزات" },
  { value: "other", label: "سایر" },
];

const CONSULTATION_MODES = ["حضوری", "تلفنی"];

function lookupId(field) {
  if (field == null || field === "") return "";
  if (typeof field === "object") return field.value ?? "";
  return field;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-200";

export default function NewRequestForm({
  forHealthAssistant = false,
  forDoctor = false,
  forPatient = false,
  patients = [],
  onSuccess,
  onPatientSearch,
}) {
  const [requestType, setRequestType] = useState(forPatient ? "service" : "consultation");
  const [requestSubtype, setRequestSubtype] = useState("visit");
  const [patientId, setPatientId] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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
  const [doctorName, setDoctorName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("visit");
  const [companionMale, setCompanionMale] = useState("");
  const [companionFemale, setCompanionFemale] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSpecialties().then(setSpecialties).catch(console.error);
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

  useEffect(() => {
    if (!forHealthAssistant || !patientSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      const fn = onPatientSearch || requestService.healthAssistantSearchPatients;
      fn(patientSearch.trim())
        .then((r) => setSearchResults(Array.isArray(r.data) ? r.data : []))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [patientSearch, forHealthAssistant, onPatientSearch]);

  const patientOptions = [
    ...searchResults.map((p) => ({
      value: String(p.id),
      label: `${p.first_name} ${p.last_name} (${p.patient_code})${p.is_orphan ? " — بدون معرف" : ""}`,
    })),
    ...patients
      .filter((p) => !searchResults.some((s) => s.id === p.id))
      .map((p) => ({
        value: String(p.id),
        label: `${p.first_name} ${p.last_name} (${p.patient_code})`,
      })),
  ];

  const specialtyOptions = specialties.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!description.trim()) {
      setError("توضیحات الزامی است.");
      return;
    }
    if (!forPatient && !subject.trim()) {
      setError("موضوع الزامی است.");
      return;
    }
    if (
      (forHealthAssistant || forDoctor) &&
      requestType !== "regional" &&
      !lookupId(patientId)
    ) {
      setError("انتخاب بیمار الزامی است.");
      return;
    }

    setSubmitting(true);
    try {
      let effectiveType = requestType;
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
      };

      if (forPatient) {
        // Visit appointments go to the doctor queue as consultations.
        effectiveType = requestSubtype === "visit" ? "consultation" : "service";
        payload.request_type = effectiveType;
        payload.request_subtype = requestSubtype;
        if (!subject.trim()) {
          const label = PATIENT_SUBTYPES.find((t) => t.value === requestSubtype)?.label || "";
          payload.subject = label;
        }
        if (requestSubtype === "accommodation") {
          payload.companion_male_count = Number(companionMale) || 0;
          payload.companion_female_count = Number(companionFemale) || 0;
        }
        if (requestSubtype === "expense") {
          payload.expense_category = expenseCategory;
        }
        if (requestSubtype === "visit") {
          const specId = lookupId(specialty);
          if (specId) payload.specialty = Number(specId);
          payload.doctor_name = doctorName.trim();
        }
      } else {
        payload.request_type = effectiveType;
        if ((forHealthAssistant || forDoctor) && effectiveType !== "regional") {
          payload.patient_id = Number(lookupId(patientId));
        } else if (forHealthAssistant && effectiveType === "regional" && lookupId(patientId)) {
          payload.patient_id = Number(lookupId(patientId));
        }
        if (effectiveType === "consultation") {
          const specId = lookupId(specialty);
          if (specId) payload.specialty = Number(specId);
          payload.doctor_name = doctorName.trim();
          payload.consultation_mode = consultationMode;
          payload.preferred_date = preferredDate;
          payload.preferred_time = preferredTime;
        }
        if (effectiveType === "financial") {
          payload.amount_needed = Number(amountNeeded);
          payload.expense_category = expenseCategory;
          if (lookupId(fundRecipient)) {
            payload.fund_recipient_user_id = Number(lookupId(fundRecipient));
          }
        }
        if (effectiveType === "service") payload.needed_service = neededService.trim();
        if (effectiveType === "regional") payload.amount_needed = Number(amountNeeded);
      }

      await requestService.create(payload, attachments);
      setSuccess("درخواست با موفقیت ثبت شد.");
      setSubject("");
      setDescription("");
      setAmountNeeded("");
      setNeededService("");
      setAttachments([]);
      onSuccess?.();
    } catch (err) {
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

      {forPatient ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">موضوع درخواست</label>
          <select
            value={requestSubtype}
            onChange={(e) => {
              const next = e.target.value;
              setRequestSubtype(next);
              const label = PATIENT_SUBTYPES.find((t) => t.value === next)?.label || "";
              if (!subject.trim() || PATIENT_SUBTYPES.some((t) => t.label === subject)) {
                setSubject(label);
              }
            }}
            className={inputClass}
          >
            {PATIENT_SUBTYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">نوع درخواست</label>
          <div className="flex flex-wrap gap-2">
            {STAFF_REQUEST_TYPES.filter((t) => {
              if (t.value === "financial" && !forHealthAssistant && !forDoctor) return false;
              if (t.value === "regional" && !forHealthAssistant) return false;
              return true;
            }).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setRequestType(t.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  requestType === t.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(forHealthAssistant || forDoctor) && requestType !== "regional" && (
        <div className="space-y-2">
          {forHealthAssistant && (
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className={inputClass}
              placeholder="جستجوی بیمار با نام یا کد ملی..."
            />
          )}
          <label className="block text-sm font-semibold text-gray-700">بیمار</label>
          <RenderDropdown
            value={patientId}
            setValue={setPatientId}
            options={patientOptions}
            placeholder="انتخاب بیمار..."
            name="patient"
          />
        </div>
      )}
      {forHealthAssistant && requestType === "regional" && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
          نیازمندی منطقه به بیمار خاصی گره نمی‌خورد؛ پس از ثبت، کمپین عمومی ساخته می‌شود.
        </p>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          موضوع {forPatient ? "(اختیاری — از روی نوع درخواست پر می‌شود)" : ""}
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
          placeholder="مثلاً وقت ویزیت، دارو، اسکان..."
          required={!forPatient}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {forPatient && requestSubtype === "accommodation" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">تعداد همراه مرد</label>
            <input type="number" min="0" value={companionMale} onChange={(e) => setCompanionMale(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">تعداد همراه زن</label>
            <input type="number" min="0" value={companionFemale} onChange={(e) => setCompanionFemale(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      {((forPatient && requestSubtype === "expense") || requestType === "financial") && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">موضوع هزینه</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setExpenseCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    expenseCategory === c.value ? "bg-blue-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">پیوست مدارک</label>
            <input type="file" multiple onChange={(e) => setAttachments(Array.from(e.target.files || []))} className={inputClass} />
          </div>
        </>
      )}

      {((forPatient && requestSubtype === "visit") || requestType === "consultation") && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">تخصص</label>
            <RenderDropdown value={specialty} setValue={setSpecialty} options={specialtyOptions} placeholder="انتخاب تخصص..." name="specialty" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نام پزشک (اختیاری)</label>
            <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className={inputClass} />
          </div>
        </>
      )}

      {(requestType === "financial" || requestType === "regional") && !forPatient && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">مبلغ (تومان)</label>
          <input type="number" value={amountNeeded} onChange={(e) => setAmountNeeded(e.target.value)} className={inputClass} />
        </div>
      )}

      {requestType === "financial" && (forHealthAssistant || forDoctor) && fundRecipientOptions.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">گیرنده وجه</label>
          <RenderDropdown value={fundRecipient} setValue={setFundRecipient} options={fundRecipientOptions} placeholder="پیش‌فرض: خودم" name="fund-recipient" />
        </div>
      )}

      {requestType === "service" && !forPatient && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">خدمت مورد نیاز</label>
          <input type="text" value={neededService} onChange={(e) => setNeededService(e.target.value)} className={inputClass} />
        </div>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-blue-700 text-sm bg-blue-50 px-3 py-2 rounded-lg">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        ثبت درخواست
      </button>
    </motion.form>
  );
}
