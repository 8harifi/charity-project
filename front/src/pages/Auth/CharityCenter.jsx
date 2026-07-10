import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import { saveStep, loadStep } from "./utils/signupStorage";
import { useEnterSubmit } from "../../hooks/useEnterSubmit";  

const CharityCenter = () => {
  const [name, setName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [license, setLicense] = useState("");
  const [authorizationRefrence, setAuthorizationRefrence] = useState("");
  const [startYear, setStartYear] = useState("");
  const [specializedFields, setSpecializedFields] = useState("");
  const [targetCommunity, setTargetCommunity] = useState("");
  const [sharedFeature, setSharedFeature] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaving, setLeaving] = useState(false);

  const lisences = ["دارد", "ندارد"];

  const authorizationRefrences = [
    "وزارت کشور",
    "سازمان بهزیستی",
    "نیروی انتظامی",
    "وزارت فرهنگ و ارشاد",
    "کمیته امداد",
  ];

  const sharedFeatures = [
    "پزشک خیر",
    "اسکان در همراه سرا",
    "اجاره تجهیزات پزشکی",
  ];

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("signupRole", "charitycenter");

    const saved = loadStep("charitycenter", "step1");  // ← بارگیری مرحله 1

    if (saved) {
      setName(saved.name || "");
      setIntroduction(saved.introduction || "");
      setRegistrationNumber(saved.registrationNumber || "");
      setLicense(saved.license || "");
      setAuthorizationRefrence(saved.authorizationRefrence || "");
      setStartYear(saved.startYear || "");
      setSpecializedFields(saved.specializedFields || "");
      setTargetCommunity(saved.targetCommunity || "");
      setSharedFeature(saved.sharedFeature || "");
    }
  }, []);


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

  const validateForm = () => {
    if (!name.trim()) return "نام مرکز را وارد کنید.";
    if (!introduction.trim()) return "معرفی مرکز را وارد کنید.";

    if (!license) return "وضعیت پروانه فعالیت را انتخاب کنید.";

    if (!registrationNumber.trim()) return "شماره ثبت را وارد کنید.";
    if (!/^\d{3,}$/.test(registrationNumber))
      return "شماره ثبت باید فقط شامل عدد و حداقل ۳ رقم باشد.";

    if (!startYear.trim()) return "سال شروع فعالیت را وارد کنید.";
    if (!/^13\d{2}$/.test(startYear))
      return "سال شروع فعالیت باید عددی ۴ رقمی و شروع‌شونده با 13 باشد.";

    if (!authorizationRefrence.trim()) return "مرجع صدور مجوز را انتخاب کنید.";

    if (!specializedFields.trim()) return "حوزه‌های تخصصی را وارد کنید.";

    if (!targetCommunity.trim()) return "جامعه هدف را وارد کنید.";

    if (!sharedFeature.trim())
      return "امکانات قابل اشتراک‌گذاری را انتخاب کنید.";

    return "";
  };


   const handleSignup = () => {
    setError("");
    setSuccess("");

    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const formData = {
      name,
      introduction,
      registrationNumber,
      license,
      authorizationRefrence,
      startYear,
      specializedFields,
      targetCommunity,
      sharedFeature,
    };

    saveStep("charitycenter", "step1", formData);  // ← ذخیره مرحله ۱

    navigate("/charitycenter2", {
      state: {
        originForm: "charitycenter",
        previousStep: "/charitycenter",
      },
    });
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
        onKeyDown={onEnterSubmit}
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
                به خانواده بزرگ خیرین بپیوندید. با ثبت‌نام،از خدمات این مجموعه
                بهره مند شوید.
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
                    عضویت مراکز نیکوکاری در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات مرکز را برای ثبت‌نام وارد کنید
                  </p>
                </div>

                <div className="space-y-7">
                  {/* signup page */}
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="text-blue-700 p-3" htmlFor="name">
                          {" "}
                          نام مرکز{" "}
                        </label>

                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="نام مرکز را وارد کنید"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-lg transition-all text-blue-950"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-blue-700 p-3" htmlFor="intro">
                          {" "}
                          معرفی مرکز{" "}
                        </label>

                        <input
                          id="intro"
                          type="text"
                          value={introduction}
                          onChange={(e) => setIntroduction(e.target.value)}
                          placeholder="معرفی مرکز"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-lg transition-all text-blue-950"
                        />
                      </div>

                      <div className="relative">
                        <RenderDropdown
                          value={license}
                          setValue={setLicense}
                          options={lisences}
                          name="license"
                          placeholder="پروانه فعالیت"
                          label="پروانه فعالیت"
                        />
                      </div>

                      <div className="relative">
                        <label className="text-blue-700 p-3" htmlFor="num">
                          شماره ثبت
                        </label>

                        <input
                          id="num"
                          type="text"
                          inputMode="numeric"
                          value={registrationNumber}
                          onChange={(e) => {
                            const value = e.target.value;

                            // فقط عدد (اجازه خالی بودن هم می‌دهد برای پاک کردن)
                            if (/^\d*$/.test(value)) {
                              setRegistrationNumber(value);
                            }
                          }}
                          placeholder="شماره ثبت"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-lg transition-all text-blue-950"
                        />
                      </div>

                      <div className="relative">
                        <label
                          className="text-blue-700 p-3"
                          htmlFor="startYear"
                        >
                          سال شروع فعالیت
                        </label>

                        <input
                          id="startYear"
                          type="text"
                          inputMode="numeric"
                          pattern="13\d{2}"
                          maxLength={4}
                          value={startYear}
                          onChange={(e) => {
                            const val = e.target.value;

                            // فقط اعداد و باید با 13 شروع شود
                            if (/^$|^1$|^13\d{0,2}$/.test(val)) {
                              setStartYear(val);
                            }
                          }}
                          placeholder="سال شروع فعالیت"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-lg transition-all text-blue-950"
                        />
                      </div>
                      <div className="relative">
                        <RenderDropdown
                          value={authorizationRefrence}
                          setValue={setAuthorizationRefrence}
                          options={authorizationRefrences}
                          name="authorizationRefrence"
                          placeholder="مرجع صدور مجوز"
                          label="مرجع صدور مجوز"
                        />
                      </div>

                      <div className="relative">
                        <label className="text-blue-700 p-3" htmlFor="field">
                          {" "}
                          حوزه های تخصصی{" "}
                        </label>

                        <input
                          id="field"
                          type="text"
                          value={specializedFields}
                          onChange={(e) => setSpecializedFields(e.target.value)}
                          placeholder="حوزه های تخصصی"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-lg transition-all text-blue-950"
                        />
                      </div>

                      <div className="relative">
                        <label className="text-blue-700 p-3" htmlFor="target">
                          {" "}
                          جامعه هدف{" "}
                        </label>

                        <input
                          id="target"
                          type="text"
                          value={targetCommunity}
                          onChange={(e) => setTargetCommunity(e.target.value)}
                          placeholder="جامعه هدف"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-lg transition-all text-blue-950"
                        />
                      </div>

                      <div className="relative">
                        <RenderDropdown
                          value={sharedFeature}
                          setValue={setSharedFeature}
                          options={sharedFeatures}
                          name="sharedFeature"
                          placeholder="امکانات قابل اشتراک گذاری"
                          label="امکانات قابل اشتراک گذاری"
                        />
                      </div>
                    </div>
                  </>

                  {error && (
                    <div
                      style={{
                        background: "#ffdddd",
                        color: "#b30000",
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "10px",
                        fontSize: "14px",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      style={{
                        background: "#ddffdd",
                        color: "#1f7a1f",
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "10px",
                        fontSize: "14px",
                      }}
                    >
                      {success}
                    </div>
                  )}
                  <motion.button
                    onClick={handleSignup}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full py-4 text-center bg-gradient-to-l from-blue-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    مرحله بعد
                  </motion.button>
                  <div className="text-center flex justify-between">
                    <Link
                      to="/loginpage"
                      className="text-blue-600 hover:text-blue-800 font-bold text-lg transition-colors duration-300 py-3"
                    >
                      قبلا ثبت نام کرده‌اید؟ وارد شوید
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

export default CharityCenter;
