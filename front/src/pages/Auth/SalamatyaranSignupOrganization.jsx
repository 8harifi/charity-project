import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import { saveStep, loadStep } from "./utils/signupStorage";
import { lookupApi } from "../../API/lookupApi";
import { useMultipleLookups, findLookupOption } from "../../hooks/useLookupOptions";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";
import { citiesByProvince } from "../../data/iranCities.js";
import { validateHealthAssistantOrganizationStep2 } from "./utils/signupValidation";
import RequiredLabel from "../../components/RequiredLabel";
import { useEnterSubmit } from "../../hooks/useEnterSubmit";
import SignupStepProgress from "./components/SignupStepProgress";

const HA_SIGNUP_STEPS = ["نوع همکاری", "اطلاعات و مدارک", "رمز عبور"];

const SalamatyaranSignupOrganization = () => {
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);
  const [address, setAddress] = useState("");
  const [socialHeadFirstName, setSocialHeadFirstName] = useState("");
  const [socialHeadLastName, setSocialHeadLastName] = useState("");
  const [socialHeadPhone, setSocialHeadPhone] = useState("");
  const [socialHeadLandline, setSocialHeadLandline] = useState("");
  const [collaborationType, setCollaborationType] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cities, setCities] = useState([]);

  const provinces = IRAN_PROVINCES;

  const { collaborationNames, loading: lookupsLoading } = useMultipleLookups({
    collaborationNames: lookupApi.healthAssistantCooperationTypes,
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("signupRole", "salamtyaran");
    const step1 = loadStep("salamtyaran", 1);
    const profileType =
      step1?.profile_type ||
      (step1?.referrerType === "legal" ? "organization" : "individual");
    if (profileType !== "organization" || !step1?.org_name) {
      navigate("/SalamtyaranSignup", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const saved = loadStep("salamtyaran", 2);
    if (!saved || lookupsLoading) return;

    setProvince(findLookupOption(provinces, saved.province));
    setAddress(saved.address || "");
    setSocialHeadFirstName(
      saved.social_unit_head_first_name || saved.socialHeadFirstName || ""
    );
    setSocialHeadLastName(
      saved.social_unit_head_last_name || saved.socialHeadLastName || ""
    );
    setSocialHeadPhone(
      saved.social_unit_head_phone_number || saved.socialHeadPhone || ""
    );
    setSocialHeadLandline(
      saved.social_unit_head_landline_number || saved.socialHeadLandline || ""
    );
    setCollaborationType(
      findLookupOption(collaborationNames, saved.collaborationType ?? saved.cooperation_type)
    );
    setExplanation(saved.explanation || saved.cooperation_description || "");
  }, [lookupsLoading, collaborationNames]);

  useEffect(() => {
    if (!province?.value || !citiesByProvince[province.value]) {
      setCities([]);
      setCity(null);
      return;
    }
    const list = citiesByProvince[province.value].map((c) => ({
      label: c,
      value: c,
    }));
    setCities(list);
    const saved = loadStep("salamtyaran", 2);
    if (saved?.city && saved.province === province.value) {
      setCity(list.find((c) => c.value === saved.city) || null);
    } else if (saved?.city) {
      setCity(list.find((c) => c.value === saved.city) || null);
    } else {
      setCity(null);
    }
  }, [province?.value]);

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
    return validateHealthAssistantOrganizationStep2({
      province: province?.value ?? province,
      city: city?.value ?? city,
      address,
      social_unit_head_first_name: socialHeadFirstName,
      social_unit_head_last_name: socialHeadLastName,
      social_unit_head_phone_number: socialHeadPhone,
      collaborationType,
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

    saveStep("salamtyaran", 2, {
      province: province?.value ?? province,
      city: city?.value ?? city,
      address,
      social_unit_head_first_name: socialHeadFirstName.trim(),
      social_unit_head_last_name: socialHeadLastName.trim(),
      social_unit_head_phone_number: socialHeadPhone,
      social_unit_head_landline_number: socialHeadLandline,
      collaborationType: collaborationType?.value ?? collaborationType,
      cooperation_type: collaborationType?.value ?? collaborationType,
      explanation,
      cooperation_description: explanation,
    });

    setTimeout(() => {
      navigate("/lastsignup", {
        state: {
          originForm: "SalamtyaranSignup",
          previousStep: "/SalamtyaranSignupOrganization",
        },
      });
    }, 800);
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-blue-300"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 6 + i, repeat: Infinity }}
          >
            <Heart className="w-6 h-6" />
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        onKeyDown={onEnterSubmit}
        className="w-full max-w-6xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-blue-100/50 relative z-10"
      >
        <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 p-10 lg:p-16 flex flex-col justify-center items-center text-white">
          <HandHeart className="w-16 h-16 mb-6" />
          <h2 className="text-5xl font-bold mb-6">خوش آمدید!</h2>
          <p className="text-xl text-blue-50 text-center max-w-md">
            اطلاعات تکمیلی مجموعه و همکاری را وارد کنید.
          </p>
          <div className="flex justify-center gap-4 mt-12">
            {[Heart, HandHeart, Users].map((Icon, index) => (
              <Icon key={index} className="w-8 h-8 text-white/70" />
            ))}
          </div>
        </div>

        <div className="lg:w-5/6 p-10 lg:p-14 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-emerald-700 bg-clip-text text-transparent mb-3 text-right">
                  عضویت سلامتیار (شخص حقوقی)
                </h1>
                <p className="text-blue-600 text-right text-lg">
                  آدرس مجموعه، رئیس واحد مددکاری اجتماعی و نوع همکاری
                </p>
              </div>

              <SignupStepProgress steps={HA_SIGNUP_STEPS} currentStep={2} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <h2 className="text-blue-700 font-bold mb-2">آدرس مجموعه</h2>
                </div>

                <RenderDropdown
                  value={province}
                  setValue={setProvince}
                  options={provinces}
                  name="province"
                  placeholder="انتخاب استان"
                  label="استان"
                  required
                />

                <RenderDropdown
                  value={city}
                  setValue={setCity}
                  options={cities}
                  name="city"
                  placeholder="انتخاب شهر"
                  label="شهر"
                  required
                />

                <div className="col-span-1 md:col-span-2">
                  <RequiredLabel className="text-blue-700 p-3 block">آدرس</RequiredLabel>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="آدرس مجموعه"
                    className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 mt-4">
                  <h2 className="text-blue-700 font-bold mb-2">
                    رئیس واحد مددکاری اجتماعی
                  </h2>
                </div>

                <div>
                  <RequiredLabel className="text-blue-700 p-3 block" htmlFor="social_head_first">نام</RequiredLabel>
                  <input
                    id="social_head_first"
                    type="text"
                    value={socialHeadFirstName}
                    onChange={(e) => setSocialHeadFirstName(e.target.value)}
                    placeholder="نام"
                    className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                  />
                </div>

                <div>
                  <RequiredLabel className="text-blue-700 p-3 block" htmlFor="social_head_last">نام خانوادگی</RequiredLabel>
                  <input
                    id="social_head_last"
                    type="text"
                    value={socialHeadLastName}
                    onChange={(e) => setSocialHeadLastName(e.target.value)}
                    placeholder="نام خانوادگی"
                    className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                  />
                </div>

                <div>
                  <RequiredLabel className="text-blue-700 p-3 block">تلفن همراه</RequiredLabel>
                  <input
                    type="tel"
                    value={socialHeadPhone}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d{0,11}$/.test(v)) setSocialHeadPhone(v);
                    }}
                    maxLength={11}
                    placeholder="09xxxxxxxxx"
                    className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                  />
                </div>

                <div>
                  <label className="text-blue-700 p-3 block">تلفن ثابت (اختیاری)</label>
                  <input
                    type="tel"
                    value={socialHeadLandline}
                    onChange={(e) => setSocialHeadLandline(e.target.value)}
                    placeholder="تلفن ثابت"
                    className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-right text-blue-950"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 flex flex-col my-6 space-y-4">
                  <RenderDropdown
                    value={collaborationType}
                    setValue={setCollaborationType}
                    options={collaborationNames}
                    name="collaborationType"
                    placeholder="نوع همکاری"
                    label="نوع همکاری"
                    loading={lookupsLoading}
                    required
                  />

                  <label htmlFor="exp" className="text-blue-700">
                    توضیحات همکاری
                  </label>
                  <input
                    id="exp"
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="توضیحات همکاری"
                    className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-blue-950"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm text-right mt-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm text-right mt-4">
                  {success}
                </div>
              )}

              <motion.button
                onClick={handleSignup}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full py-4 mt-6 text-center bg-gradient-to-l from-blue-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg"
              >
                مرحله بعد
              </motion.button>

              <div className="flex flex-col sm:flex-row justify-between text-center gap-4 mt-4">
                <Link to="/loginpage" className="text-blue-600 font-bold text-lg py-3">
                  قبلا ثبت‌نام کرده‌اید؟ وارد شوید
                </Link>
                <Link
                  to="/SalamtyaranSignup"
                  className="text-blue-600 font-bold text-lg py-3"
                >
                  بازگشت به مرحله قبل
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalamatyaranSignupOrganization;
