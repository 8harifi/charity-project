import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import RenderDropdown from "../../pages/Auth/components/DropDown";
import SearchBox from "../Components/SearchBox";
import PersianDateInput from "../../components/PersianDateInput";
import {
  User,
  Phone,
  Stethoscope,
  Send,
  Loader2,
  ClipboardList,
} from "lucide-react";

const initialForm = {
  requestDate: "",
  patientQuery: "",
  patientId: "",
  firstName: "",
  lastName: "",
  mobile: "",
  companionStay: "", // yes | no
  maleCompanions: "",
  femaleCompanions: "",
  companionDescription: "",
  otherServices: "",
  newsPermission: false,

  referrerName: "",
  initialDiagnosis: "",
  consultantNotes: "",
  files: [],
  document: null,
};

const inputClass =
  "w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 placeholder:text-slate-400";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

export default function ReceiveService() {
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
  setForm((prev) => {
    // وقتی همراه سرا "ندارد" شد، فیلدهای وابسته خالی شوند
    if (field === "companionStay" && value === "no") {
      return {
        ...prev,
        companionStay: "no",
        maleCompanions: "",
        femaleCompanions: "",
        companionDescription: "",
      };
    }
    return { ...prev, [field]: value };
  });

  setError("");
  setSuccessMessage("");
};


const validateForm = () => {
  if (!form.requestDate) return "تاریخ ثبت درخواست الزامی است.";
  if (!form.patientId.trim()) return "کد ملی یا شناسه بیمار را وارد کنید.";

  // ---- همراه سرا ----
  if (!form.companionStay) return "وضعیت «استفاده از همراه سرا» را مشخص کنید.";

  if (form.companionStay === "yes") {
    // فقط عدد (می‌تواند خالی نباشد)
    if (form.maleCompanions === "" && form.femaleCompanions === "")
      return "حداقل تعداد همراه مرد یا زن را وارد کنید.";

    if (form.maleCompanions !== "") {
      if (!/^\d+$/.test(String(form.maleCompanions)))
        return "تعداد همراه مرد باید فقط عدد باشد.";
      if (Number(form.maleCompanions) < 0)
        return "تعداد همراه مرد نمی‌تواند منفی باشد.";
      if (Number(form.maleCompanions) > 20)
        return "تعداد همراه مرد غیرمجاز است (حداکثر ۲۰).";
    }

    if (form.femaleCompanions !== "") {
      if (!/^\d+$/.test(String(form.femaleCompanions)))
        return "تعداد همراه زن باید فقط عدد باشد.";
      if (Number(form.femaleCompanions) < 0)
        return "تعداد همراه زن نمی‌تواند منفی باشد.";
      if (Number(form.femaleCompanions) > 20)
        return "تعداد همراه زن غیرمجاز است (حداکثر ۲۰).";
    }

  }


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

  companionStay: form.companionStay,
  maleCompanions: form.maleCompanions,
  femaleCompanions: form.femaleCompanions,
  companionDescription: form.companionDescription,
  otherServices: form.otherServices,
  newsPermission: form.newsPermission,

  attachments: form.files,
  initialDiagnosis: form.initialDiagnosis,
  consultantNotes: form.consultantNotes,
};


      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSuccessMessage("درخواست دریافت خدمات با موفقیت ثبت شد.");
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
                  فرم درخواست دریافت خدمات برای بیمار
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  ثبت و ارسال درخواست دریافت خدمات 
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="mt-7">
                <label className={labelClass}>تاریخ ثبت درخواست</label>
                <PersianDateInput
                  value={form.requestDate}
                  onChange={(v) => handleChange("requestDate", v)}
                />
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
            </div>

            {/* استفاده از همراه سرا */}
            <div className=" p-4">
              <label className={`${labelClass} mb-3 block font-bold`}>
                استفاده از همراه سرا
              </label>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="companionStay"
                    value="no"
                    checked={form.companionStay === "no"}
                    onChange={(e) =>
                      handleChange("companionStay", e.target.value)
                    }
                  />
                  ندارد
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="companionStay"
                    value="yes"
                    checked={form.companionStay === "yes"}
                    onChange={(e) =>
                      handleChange("companionStay", e.target.value)
                    }
                  />
                  دارد
                </label>
              </div>

              {form.companionStay === "yes" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>تعداد همراه مرد</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.maleCompanions}
                      onChange={(e) =>
                        handleChange("maleCompanions", e.target.value)
                      }
                      placeholder="تعداد"
                    />
                  </div>

                  <div>
                    <label className={`${labelClass} mb-3 block font-bold`}>تعداد همراه زن</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.femaleCompanions}
                      onChange={(e) =>
                        handleChange("femaleCompanions", e.target.value)
                      }
                      placeholder="تعداد"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>توضیحات</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.companionDescription}
                      onChange={(e) =>
                        handleChange("companionDescription", e.target.value)
                      }
                      placeholder="توضیحات"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* شرح دیگر خدمات */}
            <div>
              <label className={labelClass}>
                شرح دیگر خدمات مورد نیاز بیمار
              </label>

              <textarea
                rows={4}
                className={inputClass}
                value={form.otherServices}
                onChange={(e) => handleChange("otherServices", e.target.value)}
                placeholder="در صورت نیاز خدمات دیگر توضیح دهید"
              />
            </div>

            {/* فرم انتشار خبر یا فراخوان */}
            <div className="flex items-center gap-3  p-4">
              <input
                type="checkbox"
                checked={form.newsPermission}
                onChange={(e) =>
                  handleChange("newsPermission", e.target.checked)
                }
              />

              <span className="text-sm text-slate-700 font-semibold">
                فرم انتشار اخبار یا فراخوان
              </span>
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
                    ثبت درخواست دریافت خدمات
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
