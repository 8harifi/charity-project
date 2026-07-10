import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import { saveStep, loadStep } from "./utils/signupStorage";
import { lookupApi } from "../../API/lookupApi";
import { useLookupOptions, findLookupOption } from "../../hooks/useLookupOptions";
import {
  validateBenefactorForm,
  convertToEnglishDigits,
  sanitizePhone,
} from "./utils/signupValidation";
import RequiredLabel from "../../components/RequiredLabel";
import { useEnterSubmit } from "../../hooks/useEnterSubmit";
import SignupStepProgress from "./components/SignupStepProgress";

const BENEFACTOR_SIGNUP_STEPS = ["اطلاعات فردی", "رمز عبور"];

const CharitableSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState(null);
  const [nationalCode, setNationalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaving, setLeaving] = useState(false);

  const { options: genders, loading: lookupsLoading } =
    useLookupOptions(lookupApi.genders);

  const navigate = useNavigate();

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
    return validateBenefactorForm({
      first_name: firstName,
      last_name: lastName,
      gender,
      national_code: convertToEnglishDigits(nationalCode),
      phone_number: sanitizePhone(phoneNumber),
    });
  };

  const handleSignup = () => {
    setError("");
    setSuccess("");

    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    try {
      const formData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender: gender?.value,
        national_code: convertToEnglishDigits(nationalCode),
        phone_number: sanitizePhone(phoneNumber),
      };

      saveStep("charitable", "step1", formData);
      localStorage.setItem("signupRole", "charitable");
      setSuccess("اطلاعات با موفقیت ثبت شد ✅");

      setTimeout(() => {
        setLeaving(true);
        setTimeout(() => {
          navigate("/lastsignup", {
            state: {
              originForm: "charitable",
              previousStep: "/authCharitable",
            },
          });
        }, 500);
      }, 800);
    } catch (err) {
      console.error("Storage Error:", err);
      setError("خطا در ذخیره اطلاعات. دوباره تلاش کنید.");
    }
  };

  useEffect(() => {
    const savedData = loadStep("charitable", "step1");
    if (!savedData || lookupsLoading) return;

    setFirstName(savedData.first_name || "");
    setLastName(savedData.last_name || "");
    setNationalCode(savedData.national_code || savedData.nationalCode || "");
    setPhoneNumber(savedData.phone_number || savedData.phoneNumber || "");
    setGender(findLookupOption(genders, savedData.gender));
  }, [lookupsLoading, genders]);

  const onEnterSubmit = useEnterSubmit(handleSignup);

  return (
    <div
      className="font-kook min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate={leaving ? "exit" : "visible"}
      exit="exit"
    >
      <div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        onKeyDown={onEnterSubmit}
        className="w-full max-w-6xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-blue-100/50 relative z-10"
      >
        <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 p-10 lg:p-16 flex flex-col justify-center items-center text-white">
          <h2 className="text-5xl font-bold mb-6">خوش آمدید!</h2>
          <p className="text-xl text-blue-50 text-center max-w-md">
            به خانواده بزرگ خیرین بپیوندید.
          </p>
        </div>

        <div
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          className="lg:w-5/6 p-10 lg:p-14 bg-white"
        >
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-emerald-700 bg-clip-text text-transparent mb-3 text-right">
              عضویت خیرین در شبکه
            </h1>
            <p className="text-blue-600 text-right text-lg">
              اطلاعات خود را برای ثبت‌نام وارد کنید
            </p>
          </div>

          <SignupStepProgress steps={BENEFACTOR_SIGNUP_STEPS} currentStep={1} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <RequiredLabel htmlFor="first_name" className="p-3 text-blue-700 block">نام</RequiredLabel>
              <input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="نام"
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
              />
            </div>
            <div>
              <RequiredLabel htmlFor="last_name" className="p-3 text-blue-700 block">نام خانوادگی</RequiredLabel>
              <input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="نام خانوادگی"
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
              />
            </div>

            <RenderDropdown
              value={gender}
              setValue={setGender}
              options={genders}
              name="gender"
              placeholder="انتخاب جنسیت"
              label="جنسیت"
              loading={lookupsLoading}
              required
            />

            <div>
              <RequiredLabel htmlFor="nationalCode" className="p-3 text-blue-700 block">کد ملی</RequiredLabel>
              <input
                id="nationalCode"
                type="text"
                value={nationalCode}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d{0,10}$/.test(v)) setNationalCode(v);
                }}
                maxLength={10}
                inputMode="numeric"
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
              />
            </div>

            <div>
              <RequiredLabel htmlFor="num" className="p-3 text-blue-700 block">شماره تلفن همراه</RequiredLabel>
              <input
                id="num"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d{0,11}$/.test(v)) setPhoneNumber(v);
                }}
                maxLength={11}
                inputMode="numeric"
                className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mt-4">
              {success}
            </div>
          )}

          <motion.button
            onClick={handleSignup}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block w-full py-4 mt-6 text-center bg-gradient-to-l from-blue-500 to-emerald-600 text-white rounded-2xl font-bold text-lg"
          >
            مرحله بعد
          </motion.button>

          <div className="text-center mt-4">
            <Link to="/loginpage" className="text-blue-600 font-bold text-lg">
              قبلا ثبت نام کرده‌اید؟ وارد شوید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharitableSignup;
