import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, UserPlus, X } from "lucide-react";
import RenderDropdown from "../../pages/Auth/components/DropDown";
import FileUpload from "../../pages/Auth/components/FileUpload";
import { lookupApi } from "../../API/lookupApi";
import { useEnterSubmit } from "../../hooks/useEnterSubmit";
import { useLookupOptions, useMultipleLookups } from "../../hooks/useLookupOptions";
import { HEAD_OF_FAMILY_OPTIONS, IRAN_PROVINCES } from "../../data/staticSignupOptions";
import { citiesByProvince } from "../../data/iranCities";
import { joinFullName } from "../../pages/Auth/utils/nameFields";
import RequiredLabel from "../../components/RequiredLabel";
import {
  validatePasswordStep,
  validatePatientStep1,
  validatePatientStep2,
  validatePatientStep3,
} from "../../pages/Auth/utils/signupValidation";
import { healthAssistantDashboardService } from "../../Services/healthAssistantDashboardService";

const inputClass =
  "w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200";

const STEPS = [
  { id: 1, label: "اطلاعات فردی" },
  { id: 2, label: "آدرس و تماس" },
  { id: 3, label: "بیمه و مدارک" },
  { id: 4, label: "رمز عبور" },
];

function lookupId(field) {
  if (field == null || field === "") return "";
  if (typeof field === "object") return field.value ?? "";
  return field;
}

export default function IntroducePatientModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState(null);
  const [nationalCode, setNationalCode] = useState("");
  const [age, setAge] = useState("");
  const [marriageStatus, setMarriageStatus] = useState(null);
  const [headOfFamily, setHeadOfFamily] = useState(null);
  const [numberOfMembers, setNumberOfMembers] = useState("");
  const [education, setEducation] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [houseStatus, setHouseStatus] = useState(null);
  const [organ, setOrgan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [landline, setLandline] = useState("");

  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);
  const [address, setAddress] = useState("");
  const [familyStatus, setFamilyStatus] = useState("");
  const [skill, setSkill] = useState("");
  const [illness, setIllness] = useState("");
  const [friendFirstName1, setFriendFirstName1] = useState("");
  const [friendLastName1, setFriendLastName1] = useState("");
  const [friendPhone1, setFriendPhone1] = useState("");
  const [friendFirstName2, setFriendFirstName2] = useState("");
  const [friendLastName2, setFriendLastName2] = useState("");
  const [friendPhone2, setFriendPhone2] = useState("");

  const [insurance, setInsurance] = useState(null);
  const [nationalCardImage, setNationalCardImage] = useState(null);
  const [birthCertificateImage, setBirthCertificateImage] = useState(null);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const {
    genders,
    marriageOptions,
    educationLevels,
    jobOptions,
    houseOptions,
    organOptions,
    loading: lookupsLoading,
  } = useMultipleLookups({
    genders: lookupApi.genders,
    marriageOptions: lookupApi.maritalStatuses,
    educationLevels: lookupApi.educations,
    jobOptions: lookupApi.jobStatuses,
    houseOptions: lookupApi.housingStatuses,
    organOptions: lookupApi.coveredOrganizations,
  });

  const { options: insuranceOpts, loading: insuranceOptsLoading } =
    useLookupOptions(lookupApi.insurances);

  const cityOptions = useMemo(() => {
    if (!province?.value || !citiesByProvince[province.value]) return [];
    return citiesByProvince[province.value].map((c) => ({ label: c, value: c }));
  }, [province]);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError("");
    setSuccess(null);
    setSubmitting(false);
    setFirstName("");
    setLastName("");
    setFatherName("");
    setGender(null);
    setNationalCode("");
    setAge("");
    setMarriageStatus(null);
    setHeadOfFamily(null);
    setNumberOfMembers("");
    setEducation(null);
    setJobStatus(null);
    setHouseStatus(null);
    setOrgan(null);
    setPhoneNumber("");
    setLandline("");
    setProvince(null);
    setCity(null);
    setAddress("");
    setFamilyStatus("");
    setSkill("");
    setIllness("");
    setFriendFirstName1("");
    setFriendLastName1("");
    setFriendPhone1("");
    setFriendFirstName2("");
    setFriendLastName2("");
    setFriendPhone2("");
    setInsurance(null);
    setNationalCardImage(null);
    setBirthCertificateImage(null);
    setPassword("");
    setPasswordConfirm("");
  }, [open]);

  useEffect(() => {
    setCity(null);
  }, [province]);

  const step1Payload = useMemo(
    () => ({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      father_name: fatherName,
      national_code: nationalCode,
      age: Number(age),
      gender: gender?.value,
      marital_status: marriageStatus?.value,
      head_household:
        headOfFamily?.value === 1 ||
        headOfFamily?.value === true ||
        headOfFamily?.value === "1",
      number_dependents: Number(numberOfMembers || 0),
      education: education?.value,
      job_status: jobStatus?.value,
      housing_status: houseStatus?.value,
      covered_organization: organ?.value,
      phone_number: phoneNumber,
      landline_number: landline,
    }),
    [
      firstName, lastName, fatherName, nationalCode, age, gender, marriageStatus,
      headOfFamily, numberOfMembers, education, jobStatus, houseStatus, organ,
      phoneNumber, landline,
    ]
  );

  const step2Payload = useMemo(
    () => ({
      province: province?.value,
      city: city?.value,
      address,
      family_status: familyStatus,
      skill,
      sickness_description: illness,
      contact1_full_name: joinFullName(friendFirstName1, friendLastName1),
      contact1_phone_number: friendPhone1,
      contact2_full_name: joinFullName(friendFirstName2, friendLastName2),
      contact2_phone_number: friendPhone2,
    }),
    [
      province, city, address, familyStatus, skill, illness,
      friendFirstName1, friendLastName1, friendPhone1,
      friendFirstName2, friendLastName2, friendPhone2,
    ]
  );

  const validateCurrentStep = () => {
    if (step === 1) {
      return validatePatientStep1({
        ...step1Payload,
        head_household: headOfFamily,
      });
    }
    if (step === 2) {
      return validatePatientStep2({
        province: province?.value,
        city: city?.value,
        address: address.trim(),
      });
    }
    if (step === 3) {
      return validatePatientStep3({ insurance });
    }
    if (step === 4) {
      return validatePasswordStep(password, passwordConfirm);
    }
    return "";
  };

  const goNext = () => {
    setError("");
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    if (step < 4) setStep((s) => s + 1);
    else handleSubmit();
  };

  const goBack = () => {
    setError("");
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setError("");
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    try {
      const form = {
        ...step1Payload,
        ...step2Payload,
        address: (address || "").trim(),
        insurance: lookupId(insurance),
        password,
        national_card_image: nationalCardImage,
        birth_certificate_image: birthCertificateImage,
      };

      const r = await healthAssistantDashboardService.registerPatient(form);
      setSuccess(r.data?.patient || r.data);
      onSuccess?.(r.data?.patient || r.data);
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        (typeof data === "string" && data) ||
        data?.detail ||
        data?.phone_number?.[0] ||
        data?.username?.[0] ||
        data?.national_code?.[0] ||
        Object.values(data || {})
          .flat()
          .find(Boolean) ||
        "خطا در ثبت بیمار";
      setError(typeof msg === "string" ? msg : "خطا در ثبت بیمار");
    } finally {
      setSubmitting(false);
    }
  };

  const onEnterSubmit = useEnterSubmit(goNext, { enabled: open && !success });

  if (!open) return null;

  const lookupsReady = !lookupsLoading && !insuranceOptsLoading;

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
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-right"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={onEnterSubmit}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="text-emerald-600" size={22} />
              <h3 className="text-xl font-bold text-gray-800">ثبت بیمار جدید</h3>
            </div>
            <button type="button" onClick={onClose} aria-label="بستن">
              <X size={20} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-emerald-600 mb-4" size={48} />
              <p className="text-lg font-bold text-gray-800 mb-2">بیمار با موفقیت ثبت شد</p>
              <p className="text-gray-600 mb-1">
                {success.first_name} {success.last_name}
              </p>
              <p className="text-sm text-gray-500 mb-6">کد بیمار: {success.patient_code}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
              >
                بستن
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      step === s.id
                        ? "bg-emerald-600 text-white"
                        : step > s.id
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {!lookupsReady ? (
                <div className="flex justify-center py-12 text-gray-500">
                  <Loader2 className="animate-spin ml-2" size={20} />
                  در حال بارگذاری...
                </div>
              ) : (
                <div className="space-y-4">
                  {step === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <RequiredLabel>نام</RequiredLabel>
                        <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div>
                        <RequiredLabel>نام خانوادگی</RequiredLabel>
                        <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                      <div>
                        <RequiredLabel>نام پدر</RequiredLabel>
                        <input className={inputClass} value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
                      </div>
                      <div>
                        <RequiredLabel>کد ملی</RequiredLabel>
                        <input className={inputClass} value={nationalCode} onChange={(e) => setNationalCode(e.target.value)} maxLength={10} inputMode="numeric" />
                      </div>
                      <div>
                        <RequiredLabel>جنسیت</RequiredLabel>
                        <RenderDropdown value={gender} setValue={setGender} options={genders} placeholder="انتخاب جنسیت" name="gender" required />
                      </div>
                      <div>
                        <RequiredLabel>سن</RequiredLabel>
                        <input type="number" className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} />
                      </div>
                      <div>
                        <RequiredLabel>وضعیت تأهل</RequiredLabel>
                        <RenderDropdown value={marriageStatus} setValue={setMarriageStatus} options={marriageOptions} placeholder="انتخاب" name="marital" required />
                      </div>
                      <div>
                        <RequiredLabel>سرپرست خانواده</RequiredLabel>
                        <RenderDropdown value={headOfFamily} setValue={setHeadOfFamily} options={HEAD_OF_FAMILY_OPTIONS} placeholder="انتخاب" name="head" required />
                      </div>
                      <div>
                        <RequiredLabel required={false}>تعداد افراد تحت تکفل</RequiredLabel>
                        <input type="number" className={inputClass} value={numberOfMembers} onChange={(e) => setNumberOfMembers(e.target.value)} />
                      </div>
                      <div>
                        <RequiredLabel>تحصیلات</RequiredLabel>
                        <RenderDropdown value={education} setValue={setEducation} options={educationLevels} placeholder="انتخاب" name="education" required />
                      </div>
                      <div>
                        <RequiredLabel>وضعیت شغلی</RequiredLabel>
                        <RenderDropdown value={jobStatus} setValue={setJobStatus} options={jobOptions} placeholder="انتخاب" name="job" required />
                      </div>
                      <div>
                        <RequiredLabel>وضعیت مسکن</RequiredLabel>
                        <RenderDropdown value={houseStatus} setValue={setHouseStatus} options={houseOptions} placeholder="انتخاب" name="housing" required />
                      </div>
                      <div>
                        <RequiredLabel>ارگان تحت پوشش</RequiredLabel>
                        <RenderDropdown value={organ} setValue={setOrgan} options={organOptions} placeholder="انتخاب" name="organ" required />
                      </div>
                      <div>
                        <RequiredLabel>موبایل</RequiredLabel>
                        <input className={inputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="09xxxxxxxxx" />
                      </div>
                      <div>
                        <RequiredLabel required={false}>تلفن ثابت</RequiredLabel>
                        <input className={inputClass} value={landline} onChange={(e) => setLandline(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <RequiredLabel>استان</RequiredLabel>
                        <RenderDropdown value={province} setValue={setProvince} options={IRAN_PROVINCES} placeholder="انتخاب استان" name="province" required />
                      </div>
                      <div>
                        <RequiredLabel>شهر</RequiredLabel>
                        <RenderDropdown value={city} setValue={setCity} options={cityOptions} placeholder="انتخاب شهر" name="city" required />
                      </div>
                      <div className="sm:col-span-2">
                        <RequiredLabel>آدرس</RequiredLabel>
                        <textarea className={`${inputClass} resize-none`} rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <RequiredLabel required={false}>شرح حال بیماری</RequiredLabel>
                        <textarea className={`${inputClass} resize-none`} rows={2} value={illness} onChange={(e) => setIllness(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">نام آشنای ۱</label>
                        <input className={inputClass} value={friendFirstName1} onChange={(e) => setFriendFirstName1(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">نام خانوادگی آشنای ۱</label>
                        <input className={inputClass} value={friendLastName1} onChange={(e) => setFriendLastName1(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">تلفن آشنای ۱</label>
                        <input className={inputClass} value={friendPhone1} onChange={(e) => setFriendPhone1(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">نام آشنای ۲</label>
                        <input className={inputClass} value={friendFirstName2} onChange={(e) => setFriendFirstName2(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">نام خانوادگی آشنای ۲</label>
                        <input className={inputClass} value={friendLastName2} onChange={(e) => setFriendLastName2(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">تلفن آشنای ۲</label>
                        <input className={inputClass} value={friendPhone2} onChange={(e) => setFriendPhone2(e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">وضعیت خانوادگی (اختیاری)</label>
                        <textarea className={`${inputClass} resize-none`} rows={2} value={familyStatus} onChange={(e) => setFamilyStatus(e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">مهارت / توانایی (اختیاری)</label>
                        <input className={inputClass} value={skill} onChange={(e) => setSkill(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div>
                        <RequiredLabel>نوع بیمه</RequiredLabel>
                        <RenderDropdown
                          value={insurance}
                          setValue={setInsurance}
                          options={insuranceOpts}
                          placeholder="انتخاب بیمه"
                          name="insurance"
                          required
                        />
                      </div>
                      <FileUpload label="تصویر کارت ملی (اختیاری)" value={nationalCardImage} onChange={setNationalCardImage} />
                      <FileUpload label="تصویر شناسنامه (اختیاری)" value={birthCertificateImage} onChange={setBirthCertificateImage} />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4 max-w-md mx-auto">
                      <p className="text-sm text-gray-600 text-center mb-2">
                        رمز عبور برای ورود بیمار با شماره موبایل {phoneNumber || "—"}
                      </p>
                      <div>
                        <RequiredLabel>رمز عبور</RequiredLabel>
                        <input
                          type="password"
                          className={inputClass}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          name="patient-password"
                        />
                      </div>
                      <div>
                        <RequiredLabel>تکرار رمز عبور</RequiredLabel>
                        <input
                          type="password"
                          className={inputClass}
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          autoComplete="new-password"
                          name="patient-password-confirm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm mt-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {!success && lookupsReady && (
                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 flex items-center gap-1"
                    >
                      <ChevronRight size={18} />
                      قبلی
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={submitting}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        در حال ثبت...
                      </>
                    ) : step === 4 ? (
                      "ثبت بیمار"
                    ) : (
                      <>
                        بعدی
                        <ChevronLeft size={18} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                  >
                    انصراف
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
