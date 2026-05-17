import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import RenderDropdown from "../../pages/Auth/components/DropDown";
import FileUpload from "../../pages/Auth/components/FileUpload";
import {
  CalendarDays,
  User,
  Phone,
  Building2,
  Stethoscope,
  Send,
  Loader2,
  ClipboardList,
  MessageSquareText,
  Hash,
} from "lucide-react";

const initialForm = {
  requestDate: new Date().toISOString().slice(0, 10),
  patientQuery: "",
  patientId: "",
  firstName: "",
  lastName: "",
  mobile: "",
  referrerName: "",
  centerName: "",
  centerPhone: "",
  referringDoctor: "",
  referralTrackingCode: "",
  initialDiagnosis: "",
  consultantNotes: "",
  files: [],
  document: null,
};

const inputClass =
  "w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 placeholder:text-slate-400";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

export default function ConsultationForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const mockPatients = [
    {
      id: "P-1001",
      nationalCode: "1234567890",
      systemId: "SYS-7788",
      firstName: "علی",
      lastName: "محمدی",
      mobile: "09121234567",
      referrerName: "دکتر احمدی",
    },
    {
      id: "P-1002",
      nationalCode: "0987654321",
      systemId: "SYS-9922",
      firstName: "مریم",
      lastName: "حسینی",
      mobile: "09129876543",
      referrerName: "خیریه امام رضا",
    },
  ];

  const patientOptions = mockPatients.map((p) => ({
    value: p.id,
    label: `${p.nationalCode} - ${p.systemId}`,
    data: p,
  }));

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    if (!form.requestDate) return "تاریخ ثبت درخواست الزامی است.";
    if (!form.patientId.trim()) return "کد ملی یا شناسه بیمار را وارد کنید.";
    if (!form.centerName.trim()) return "نام مرکز درمانی را وارد کنید.";
    if (!form.centerPhone) return "شماره تماس مرکز درمانی را وارد کنید.";
    if (!/^\d{8,11}$/.test(form.centerPhone))
      return "شماره تماس مرکز معتبر نیست.";
    if (!form.referringDoctor.trim()) return "نام پزشک معرف را وارد کنید.";
    if (!form.initialDiagnosis.trim()) return "تشخیص اولیه را وارد کنید.";

    if (
      form.referralTrackingCode &&
      !/^[A-Za-z0-9-]{4,20}$/.test(form.referralTrackingCode)
    )
      return "کد رهگیری معتبر نیست.";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const errorMessage = validateForm();

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        requestDate: form.requestDate,
        patientId: form.patientId || null,
        patientFirstName: form.firstName,
        patientLastName: form.lastName,
        patientMobile: form.mobile,
        patientReferrerName: form.referrerName,
        medicalCenterName: form.centerName,
        medicalCenterPhone: form.centerPhone,
        referringDoctorName: form.referringDoctor,
        referralTrackingCode: form.referralTrackingCode,
        attachments: form.files,
        initialDiagnosis: form.initialDiagnosis,
        consultantNotes: form.consultantNotes,
      };

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSuccessMessage("درخواست مشاوره با موفقیت ثبت شد.");
      setForm(initialForm);
    } catch (err) {
      setError("ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-emerald-50 p-4 md:p-8"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl"
      >
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-2xl backdrop-blur-sm">
          <div className="border-b border-slate-100 bg-gradient-to-l from-blue-900 via-blue-800 to-emerald-700 px-6 py-6 text-white md:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold md:text-2xl">
                  فرم درخواست دریافت مشاوره برای بیمار
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  ثبت و ارسال درخواست مشاوره به همراه مدارک و اطلاعات بیمار
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="mt-7">
                <label className={labelClass}>تاریخ ثبت درخواست</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                  <input
                    type="date"
                    className={`${inputClass} pr-12`}
                    value={form.requestDate}
                    onChange={(e) =>
                      handleChange("requestDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* انتخاب بیمار */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                <div>
                  <label className={labelClass}>
                    انتخاب بیمار (کد ملی / شناسه سامانه)
                  </label>

                  <RenderDropdown
                    placeholder="کد ملی یا شناسه بیمار را وارد کنید"
                    name="patientSelect"
                    value={
                      form.patientId
                        ? `${form.nationalCode || ""} ${form.systemId || ""}`
                        : ""
                    }
                    setValue={(selectedLabel) => {
                      const selected = patientOptions.find(
                        (o) => o.label === selectedLabel
                      );

                      if (selected) {
                        const p = selected.data;

                        setForm((prev) => ({
                          ...prev,
                          patientId: p.id,
                          firstName: p.firstName,
                          lastName: p.lastName,
                          mobile: p.mobile,
                          referrerName: p.referrerName,
                          nationalCode: p.nationalCode,
                          systemId: p.systemId,
                        }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          patientId: "",
                          firstName: "",
                          lastName: "",
                          mobile: "",
                          referrerName: "",
                          nationalCode: "",
                          systemId: "",
                        }));
                      }
                    }}
                    options={patientOptions.map((o) => o.label)}
                  />
                </div>
                {form.patientId && (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-l from-blue-50 to-emerald-50 p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">نام بیمار:</span>
                        {form.firstName} {form.lastName}
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">شماره تماس:</span>
                        {form.mobile}
                      </div>

                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">معرف:</span>
                        {form.referrerName}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>نام مرکز درمانی</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    className={`${inputClass} pr-12`}
                    value={form.centerName}
                    onChange={(e) => handleChange("centerName", e.target.value)}
                    placeholder="نام مرکز درمانی"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>شماره تماس مرکز</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                  <input
                    type="tel"
                    className={`${inputClass} pr-12  text-right`}
                    value={form.centerPhone}
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      handleChange("centerPhone", value.slice(0, 11));
                    }}
                    placeholder="شماره تماس مرکز"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>پزشک معرف</label>
                <div className="relative">
                  <Stethoscope className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    className={`${inputClass} pr-12`}
                    value={form.referringDoctor}
                    onChange={(e) =>
                      handleChange("referringDoctor", e.target.value)
                    }
                    placeholder="نام پزشک معرف"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>کد رهگیری ارجاع</label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    className={`${inputClass} pr-12`}
                    value={form.referralTrackingCode}
                    onChange={(e) =>
                      handleChange("referralTrackingCode", e.target.value)
                    }
                    placeholder="کد رهگیری"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <FileUpload
                label="ارسال و مشاهده مدارک"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5}
                value={form.document}
                onChange={(fileData) => {
                  setForm((prev) => ({
                    ...prev,
                    files: fileData ? [fileData] : [],
                    document: fileData,
                  }));
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className={labelClass}>
                  تشخیص اولیه و شرح حال مختصر بیماری
                </label>
                <textarea
                  rows={5}
                  className={inputClass}
                  value={form.initialDiagnosis}
                  onChange={(e) =>
                    handleChange("initialDiagnosis", e.target.value)
                  }
                  placeholder="شرح مختصر وضعیت بیمار، علائم، تشخیص اولیه و سوابق مرتبط"
                />
              </div>

              <div>
                <label className={labelClass}>نظرات و دستورات پزشک مشاور</label>
                <div className="relative">
                  <MessageSquareText className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-blue-500" />
                  <textarea
                    rows={5}
                    className={`${inputClass} pr-12`}
                    value={form.consultantNotes}
                    onChange={(e) =>
                      handleChange("consultantNotes", e.target.value)
                    }
                    placeholder="نظرات پزشک مشاور، توصیه‌ها و دستورات درمانی"
                  />
                </div>
              </div>
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-blue-800 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    در حال ثبت...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    ثبت درخواست مشاوره
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
