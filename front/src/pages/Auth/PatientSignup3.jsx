import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FileUpload from "./components/FileUpload";
import RenderDropdown from "./components/DropDown";
import { saveStep, loadStep } from "./utils/signupStorage";
import { patientService } from "../../Services/patientService";
import { lookupApi } from "../../API/lookupApi";
import { useLookupOptions, findLookupOption } from "../../hooks/useLookupOptions";
import { validatePatientStep3 } from "./utils/signupValidation";
import RequiredLabel from "../../components/RequiredLabel";
import { useEnterSubmit } from "../../hooks/useEnterSubmit";
import SignupStepProgress from "./components/SignupStepProgress";

const PATIENT_SIGNUP_STEPS = ["اطلاعات فردی", "آدرس و تماس", "بیمه و مدارک", "رمز عبور"];

const PatientSignup3 = () => {
  const [insurance, setInsurance] = useState(null);
  const [nationalCardImage, setNationalCardImage] = useState(null);
  const [birthCertificateImage, setBirthCertificateImage] = useState(null);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  const { options: insuranceOptions, loading: insuranceLoading } =
    useLookupOptions(lookupApi.insurances);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("signupRole", "patient");
    const data = loadStep("patient", "step3");
    if (!data) return;
    setNationalCardImage(data.national_card_image || data.nationalCardImage || null);
    setBirthCertificateImage(
      data.birth_certificate_image || data.identificationImage || null
    );
  }, []);

  useEffect(() => {
    if (insuranceLoading) return;
    const data = loadStep("patient", "step3");
    if (!data) return;
    const raw = data.insurance ?? data.insuranceType;
    if (raw != null) {
      setInsurance(findLookupOption(insuranceOptions, raw) || raw);
    }
  }, [insuranceOptions, insuranceLoading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } },
  };

  const slideVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.6 } },
    exit: { x: -100, opacity: 0, transition: { duration: 0.4 } },
  };

  const validateForm = () => {
    return validatePatientStep3({ insurance });
  };

  const handleSignup = async () => {
    const err = validateForm();
    if (err) return setError(err);

    const step1 = loadStep("patient", "step1");
    if (!step1?.phone_number && !step1?.mobile) {
      return setError(
        "اطلاعات مراحل قبل ناقص است. لطفاً از مرحله اول دوباره شروع کنید."
      );
    }

    const formData = {
      insurance: insurance?.value ?? insurance,
      national_card_image: nationalCardImage,
      birth_certificate_image: birthCertificateImage,
    };

    saveStep("patient", "step3", formData);

    const res = await patientService.signupStep3(formData);
    if (res && res.success) {
      navigate("/lastsignup", {
        state: {
          originForm: "patient",
          previousStep: "/authpatient3",
        },
      });
    } else {
      setError(res?.error || "خطا در ارسال اطلاعات مرحله سوم");
    }
  };

  const onEnterSubmit = useEnterSubmit(handleSignup);

  return (
    <motion.div
      className="font-kook min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate={leaving ? "exit" : "visible"}
      exit="exit"
    >
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        onKeyDown={onEnterSubmit}
        className="w-full max-w-6xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-blue-100/50 relative z-10"
      >
        <motion.div
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          className="lg:w-full p-10 lg:p-14 bg-white"
        >
          <motion.div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-emerald-700 bg-clip-text text-transparent mb-3 text-right">
              عضویت بیماران در شبکه
            </h1>
            <p className="text-blue-600 text-right text-lg">
              بیمه و مدارک شناسایی
            </p>
          </motion.div>
          <SignupStepProgress steps={PATIENT_SIGNUP_STEPS} currentStep={3} />

          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RenderDropdown
              value={insurance}
              setValue={setInsurance}
              options={insuranceOptions}
              name="insurance"
              placeholder="نوع بیمه"
              label="نوع بیمه"
              loading={insuranceLoading}
              required
            />

            <FileUpload
              label="تصویر کارت ملی (اختیاری)"
              accept=".pdf,.jpg,.png,.jpeg"
              maxSize={1.5}
              value={nationalCardImage}
              onChange={setNationalCardImage}
            />

            <FileUpload
              label="تصویر شناسنامه (اختیاری)"
              accept=".pdf,.jpg,.png,.jpeg"
              maxSize={1.5}
              value={birthCertificateImage}
              onChange={setBirthCertificateImage}
            />
          </motion.div>

          {error && (
            <motion.div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm text-right mt-4">
              {error}
            </motion.div>
          )}

          <motion.button
            onClick={handleSignup}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block w-full py-4 mt-6 bg-gradient-to-l from-blue-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg"
          >
            مرحله بعد
          </motion.button>

          <motion.div className="flex flex-col sm:flex-row justify-between text-center gap-2 mt-4">
            <Link to="/loginpage" className="text-blue-600 font-bold text-lg py-3">
              قبلا ثبت‌نام کرده‌اید؟ وارد شوید
            </Link>
            <Link to="/authpatient2" className="text-blue-600 font-bold text-lg py-3">
              بازگشت به مرحله قبل
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PatientSignup3;
