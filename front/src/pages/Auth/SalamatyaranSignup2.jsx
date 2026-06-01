import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import { saveStep, loadStep } from "./utils/signupStorage";
import { lookupApi } from "../../API/lookupApi";
import { useMultipleLookups, findLookupOption } from "../../hooks/useLookupOptions";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";

const SalamtyaranSignup2 = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState(null);
  const [nationalCode, setNationalCode] = useState("");
  const [education, setEducation] = useState(null);
  const [job, setJob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [province, setProvince] = useState(null);
  const [town, setTown] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [collaborationType, setCollaborationType] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const provinces = IRAN_PROVINCES;

  const {
    genders,
    educationLevels,
    collaborationNames,
    loading: lookupsLoading,
  } = useMultipleLookups({
    genders: lookupApi.genders,
    educationLevels: lookupApi.educations,
    collaborationNames: lookupApi.healthAssistantCooperationTypes,
  });

  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem("signupRole", "salamtyaran");

    const saved = loadStep("salamtyaran", 2);


    if (!saved || lookupsLoading) return;

    setName(saved.name || "");
    setGender(findLookupOption(genders, saved.gender));
    setNationalCode(saved.nationalCode || "");
    setEducation(findLookupOption(educationLevels, saved.education));
    setJob(saved.job || "");
    setPhoneNumber(saved.phoneNumber || "");
    setProvince(findLookupOption(provinces, saved.province));
    setTown(saved.town || "");
    setCity(saved.city || "");
    setAddress(saved.address || "");
    setJobAddress(saved.jobAddress || "");
    setCollaborationType(
      findLookupOption(collaborationNames, saved.collaborationType)
    );
    setExplanation(saved.explanation || saved.cooperation_description || "");
  }, [lookupsLoading, genders, educationLevels, collaborationNames]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const slideVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  const isValidNationalCode = (code) => {
    if (!/^\d{10}$/.test(code)) return false;

    const check = +code[9];
    const sum =
      code
        .split("")
        .slice(0, 9)
        .reduce((acc, x, i) => acc + +x * (10 - i), 0) % 11;

    return sum < 2 ? check === sum : check === 11 - sum;
  };

  const validateForm = () => {
    if (!name.trim()) return "نام و نام خانوادگی را وارد کنید.";

    if (!gender) return "جنسیت را انتخاب کنید.";

    if (!nationalCode) return "کد ملی را وارد کنید.";
    if (!/^\d{10}$/.test(nationalCode)) return "کد ملی باید ۱۰ رقم باشد.";

    if (!isValidNationalCode(nationalCode)) return "کد ملی معتبر نیست.";

    if (!education) return "سطح تحصیلات را انتخاب کنید.";

    if (!job.trim()) return "شغل خود را وارد کنید.";

    if (!phoneNumber) return "شماره تلفن همراه را وارد کنید.";
    if (!/^09\d{9}$/.test(phoneNumber)) return "شماره تلفن همراه معتبر نیست.";

    if (!province) return "استان محل سکونت را انتخاب کنید.";

    if (!town.trim()) return "شهرستان را وارد کنید.";

    if (!city.trim()) return "شهر را وارد کنید.";

    if (!address.trim()) return "آدرس را وارد کنید.";

    if (!collaborationType) return "نوع همکاری را انتخاب کنید.";

    return "";
  };

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    // ذخیره Draft مرحله 2
    saveStep("salamtyaran", 2, {
      name,
      gender: gender?.value ?? gender,
      nationalCode,
      education: education?.value ?? education,
      job,
      phoneNumber,
      province: province?.value ?? province,
      town,
      city,
      address,
      jobAddress,
      collaborationType: collaborationType?.value ?? collaborationType,
      cooperation_type: collaborationType?.value ?? collaborationType,
      explanation,
      cooperation_description: explanation,
    });

    setTimeout(() => {
      navigate("/lastsignup", {
        state: {
          originForm: "SalamtyaranSignup",
          previousStep: "/SalamtyaranSignup2",
        },
      });
    }, 800);
  };

  return (
    <motion.div
      className="font-kook min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate={leaving ? "exit" : "visible"}
      exit="exit"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* ابرهای آبی */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -15, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[600px] h-[350px] rounded-[50%] bg-gradient-to-r from-blue-100/50 to-sky-100/60 blur-2xl top-10 -left-40"
        />

        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 20, 0],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute w-[550px] h-[320px] rounded-[50%] bg-gradient-to-l from-sky-100/50 to-blue-100/60 blur-2xl bottom-20 -right-40"
        />

        {/* قلب‌های شناور */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-blue-300"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              fontSize: `${20 + Math.random() * 30}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          >
            <Heart className="w-full h-full" />
          </motion.div>
        ))}

        {/* ذرات درخشان */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 40 - 20, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [1.0, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-blue-100/50 relative z-10"
      >
        {/* Left Section - Welcome */}
        <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 p-10 lg:p-16 flex flex-col justify-center items-center text-white overflow-hidden">
          {/* Decorative Elements */}
          <motion.div
            className="absolute left-0 top-1/4 w-32 h-64"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg viewBox="0 0 200 400" className="w-full h-full">
              <path
                d="M0,150 C40,120 40,180 80,150 C120,120 120,180 160,150 C200,120 200,180 200,150 L200,400 L0,400 Z"
                fill="white"
                fillOpacity="0.05"
              />
            </svg>
          </motion.div>

          <div className="text-center z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <HandHeart className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-5xl font-bold mb-6">خوش آمدید!</h2>
              <p className="text-xl text-blue-50 leading-relaxed max-w-md mx-auto">
                به خانواده بزرگ خیرین بپیوندید. با ثبت‌نام،بخشی از شبکه نیکوکاری
                سلامت باشید.
              </p>
            </motion.div>

            {/* Animated Icons */}
            <div className="flex justify-center space-x-4 space-x-reverse mt-12">
              {[Heart, HandHeart, Users].map((Icon, index) => (
                <motion.div
                  key={index}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  <Icon className="w-8 h-8 text-white/70" />
                </motion.div>
              ))}
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -40, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Forms */}
        <div className="lg:w-5/6 p-10 lg:p-14 bg-white">
          <AnimatePresence mode="wait">
            {
              <motion.div
                key="login"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full flex flex-col justify-center"
              >
                <div className="mb-10">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-emerald-700 bg-clip-text text-transparent mb-3 text-right">
                    عضویت سلامتیارن و مددکاران در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات خود را برای ثبت‌نام وارد کنید
                  </p>
                </div>

                <div className="space-y-7">
                  {/* signup page */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* name */}
                    <div className="relative">
                      <label className="text-blue-700 p-3" htmlFor="name">
                        نام و نام خانوادگی
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                   focus:outline-none focus:ring-3 focus:ring-blue-300 text-right mt-2
                   placeholder-blue-400 text-lg text-blue-950"
                      />
                    </div>

                    {/* gender */}
                    <div className="relative">
                      <RenderDropdown
                        value={gender}
                        setValue={setGender}
                        options={genders}
                        name="gender"
                        placeholder="انتخاب جنسیت"
                        label="جنسیت"
                        loading={lookupsLoading}
                      />
                    </div>

                    {/* national code */}
                    <div className="relative">
                      <label className="text-blue-700 p-3" htmlFor="code">
                        کد ملی
                      </label>
                      <input
                        id="code"
                        type="text"
                        value={nationalCode}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d{0,10}$/.test(v)) setNationalCode(v);
                        }}
                        maxLength="10"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="کد ملی خود را وارد کنید"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                   focus:outline-none focus:ring-3 focus:ring-blue-300 text-right mt-2
                   placeholder-blue-400 text-lg text-blue-950"
                      />
                    </div>

                    {/* education */}
                    <div className="relative">
                      <RenderDropdown
                        value={education}
                        setValue={setEducation}
                        options={educationLevels}
                        name="education"
                        placeholder="سطح تحصیلات"
                        label="سطح تحصیلات"
                        loading={lookupsLoading}
                      />
                    </div>

                    {/* job */}
                    <div className="relative">
                      <label className="text-blue-700 p-3" htmlFor="job">
                        شغل
                      </label>
                      <input
                        id="job"
                        type="text"
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                        placeholder="شغل خود را وارد کنید"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                   focus:outline-none focus:ring-3 focus:ring-blue-300 text-right mt-2
                   placeholder-blue-400 text-lg text-blue-950"
                      />
                    </div>

                    {/* phone */}
                    <div className="relative">
                      <label className="text-blue-700 p-3" htmlFor="phone">
                        تلفن همراه
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d{0,11}$/.test(v)) setPhoneNumber(v);
                        }}
                        maxLength="11"
                        inputMode="numeric"
                        placeholder="شماره تلفن همراه خود را وارد کنید"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                   focus:outline-none focus:ring-3 focus:ring-blue-300 text-right mt-2
                   placeholder-blue-400 text-lg text-blue-950"
                      />
                    </div>

                    {/* address section */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                      <h1 className="col-span-1 md:col-span-2 mt-5 ml-2 text-blue-700 font-bold">
                        آدرس محل سکونت:
                      </h1>

                      {/* province */}
                      <RenderDropdown
                        value={province}
                        setValue={setProvince}
                        options={provinces}
                        name="province"
                        placeholder="انتخاب استان"
                        label="استان"
                      />

                      {/* town */}
                      <div>
                        <label className="text-blue-700 p-3">شهرستان</label>
                        <input
                          type="text"
                          value={town}
                          onChange={(e) => setTown(e.target.value)}
                          placeholder="شهرستان"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                     focus:outline-none focus:ring-3 focus:ring-blue-300 text-right mt-2
                     placeholder-blue-400 text-lg text-blue-950"
                        />
                      </div>

                      {/* city */}
                      <div>
                        <label className="text-blue-700 p-3">شهر</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="شهر"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                     focus:outline-none focus:ring-3 focus:ring-blue-300 text-right mt-2
                     placeholder-blue-400 text-lg text-blue-950"
                        />
                      </div>

                      {/* full address */}
                      <div className="col-span-1 md:col-span-2">
                        <label className="text-blue-700 p-3 block">آدرس</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="آدرس"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                     focus:outline-none focus:ring-3 focus:ring-blue-300 text-right
                     placeholder-blue-400 text-lg text-blue-950"
                        />
                      </div>
                    </div>

                    {/* job address */}
                    <div className="relative col-span-1 md:col-span-2">
                      <label className="text-blue-700 p-3" htmlFor="adr">
                        آدرس محل کار
                      </label>
                      <input
                        id="adr"
                        type="text"
                        value={jobAddress}
                        onChange={(e) => setJobAddress(e.target.value)}
                        placeholder="آدرس محل کار خود را وارد کنید"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                   focus:outline-none focus:ring-3 focus:ring-blue-300 text-right mt-2
                   placeholder-blue-400 text-lg text-blue-950"
                      />
                    </div>

                    {/* collab type + explanation */}
                    <div className="col-span-1 md:col-span-2 flex flex-col my-10 space-y-4">
                      <RenderDropdown
                        value={collaborationType}
                        setValue={setCollaborationType}
                        options={collaborationNames}
                        name="collaborationType"
                        placeholder="نوع همکاری"
                        label="نوع همکاری"
                        loading={lookupsLoading}
                      />

                      <label htmlFor="exp" className="text-blue-700">
                        توضیحات
                      </label>
                      <input
                        id="exp"
                        type="text"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="توضیحات"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200
                   placeholder-blue-400 text-blue-950 focus:outline-none
                   focus:ring-3 focus:ring-blue-300"
                      />
                    </div>

                  </div>

                  {/* error */}
                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm text-right">
                      {error}
                    </div>
                  )}

                  {/* success */}
                  {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm text-right">
                      {success}
                    </div>
                  )}

                  {/* next button */}
                  <motion.button
                    onClick={handleSignup}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full py-4 text-center bg-gradient-to-l 
               from-blue-500 to-emerald-600 text-white rounded-2xl font-bold text-lg
               shadow-lg hover:shadow-xl transition-all"
                  >
                    مرحله بعد
                  </motion.button>

                  {/* links */}
                  <div className="flex flex-col sm:flex-row justify-between text-center gap-4">
                    <Link
                      to="/loginpage"
                      className="text-blue-600 hover:text-blue-800 font-bold text-lg py-3"
                    >
                      قبلا ثبت‌نام کرده‌اید؟ وارد شوید
                    </Link>

                    <Link
                      to="/SalamtyaranSignup"
                      className="text-blue-600 hover:text-blue-800 font-bold text-lg py-3"
                    >
                      بازگشت به مرحله قبل
                    </Link>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalamtyaranSignup2;
