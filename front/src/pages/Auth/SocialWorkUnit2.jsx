import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FileUpload from "./components/FileUpload";
import { saveStep, loadStep } from "./utils/signupStorage";

const SocialWorkUnit2 = () => {
  const [facilityType, setFacilityType] = useState("");
  const [chairmanName, setChairmanName] = useState("");
  const [chairmanPhoneNumber, setChairmanPhoneNumber] = useState("");
  const [telephone, setTelephone] = useState("");
  const [requestLetter, setRequestLetter] = useState("");
  const [logo, setLogo] = useState("");

  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // نقش جاری را ثبت می‌کنیم
    localStorage.setItem("signupRole", "socialworkunit");
    // لود داده‌های مرحله ۲ اگر موجود بود
    const saved = loadStep("socialworkunit", 2);
    if (saved) {
      setFacilityType(saved.facilityType || "");
      setChairmanName(saved.chairmanName || "");
      setChairmanPhoneNumber(saved.chairmanPhoneNumber || "");
      setTelephone(saved.telephone || "");
      setRequestLetter(saved.requestLetter || "");
      setLogo(saved.logo || "");
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
    // نوع امکانات
    if (!facilityType.trim()) {
      return "لطفاً نوع امکانات قابل اشتراک‌گذاری را وارد کنید.";
    }

    // نام رئیس
    if (!chairmanName.trim()) {
      return "نام و نام خانوادگی رئیس باید وارد شود.";
    }

    // موبایل رئیس
    if (!chairmanPhoneNumber.trim()) {
      return "شماره موبایل رئیس باید وارد شود.";
    }
    if (!/^09\d{9}$/.test(chairmanPhoneNumber)) {
      return "شماره موبایل باید 11 رقمی و با 09 شروع شود.";
    }

    // تلفن ثابت
    if (!telephone.trim()) {
      return "شماره تلفن ثابت باید وارد شود.";
    }
    if (!/^\d{10,11}$/.test(telephone)) {
      return "شماره تلفن ثابت باید 10 یا 11 رقمی باشد.";
    }

    // فایل نامه درخواست – اجباری
    if (!requestLetter) {
      return "لطفاً فایل نامه درخواست مهر و امضاشده را بارگذاری کنید.";
    }

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

    // ذخیره مرحله ۲
    saveStep("socialworkunit", 2, {
      facilityType,
      chairmanName,
      chairmanPhoneNumber,
      telephone,
      requestLetter,
      logo,
    });

    setSuccess("اطلاعات با موفقیت ذخیره شد.");

    // فعال کردن انیمیشن خروج
    setLeaving(true);

    setTimeout(() => {
      navigate("/lastsignup", {
        state: {
          originForm: "socialworkunit",
          previousStep: "/socialworkunit2",
        },
      });
    }, 600);
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
                className="h-full flex flex-col justify-center "
              >
                <div className="mb-10">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-emerald-700 bg-clip-text text-transparent mb-3 text-right">
                    عضویت واحد مددکاری مرکز درمانی یا امور اجتماعی خدمات سلامت
                    در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات واحد را برای ثبت‌نام وارد کنید
                  </p>
                </div>

                {/* signup page */}
                <div className="space-y-6">
                  {/* نوع امکانات */}
                  <div className="relative">
                    <label
                      className="text-blue-700 p-3 block"
                      htmlFor="facility"
                    >
                      نوع امکانات قابل اشتراک گذاری
                    </label>

                    <input
                      id="facility"
                      type="text"
                      value={facilityType}
                      onChange={(e) => setFacilityType(e.target.value)}
                      placeholder="نوع امکانات قابل اشتراک گذاری"
                      className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 
                 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right 
                 placeholder-blue-400 text-lg text-blue-950 transition-all"
                    />
                  </div>

                  {/* مشخصات رئیس واحد مددکاری */}
                  <div className="my-5 rounded-2xl border border-blue-50 p-3">
                    <h1 className="text-blue-700 text-lg mb-4 mr-2 font-semibold">
                      مشخصات رئیس واحد مددکاری یا امور اجتماعی:
                    </h1>

                    {/* Grid دو ستونه در دسکتاپ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* نام و نام خانوادگی */}
                      <div className="relative">
                        <label
                          className="text-blue-700 p-3 block"
                          htmlFor="cname"
                        >
                          نام و نام خانوادگی
                        </label>

                        <input
                          id="cname"
                          type="text"
                          value={chairmanName}
                          onChange={(e) => setChairmanName(e.target.value)}
                          placeholder="نام و نام خانوادگی رئیس را وارد کنید"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 
                     focus:outline-none focus:ring-3 focus:ring-blue-300 
                     text-right placeholder-blue-400 text-lg text-blue-950"
                        />
                      </div>

                      {/* تلفن ثابت */}
                      <div className="relative">
                        <label
                          className="text-blue-700 p-3 block"
                          htmlFor="telphone"
                        >
                          شماره تلفن ثابت
                        </label>

                        <input
                          id="telphone"
                          type="tel"
                          value={telephone}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^\d{0,11}$/.test(v)) setTelephone(v);
                          }}
                          maxLength="11"
                          inputMode="numeric"
                          placeholder="شماره تلفن ثابت را وارد کنید"
                          className="w-full p-4 bg-blue-50/50 text-blue-950 rounded-2xl border border-blue-200
                     focus:outline-none focus:ring-3 focus:ring-blue-300 text-right 
                     placeholder-blue-400 text-lg transition-all"
                        />
                      </div>

                      {/* تلفن همراه رئیس */}
                      <div className="relative">
                        <label
                          className="text-blue-700 p-3 block"
                          htmlFor="cphone"
                        >
                          تلفن همراه
                        </label>

                        <input
                          id="cphone"
                          type="tel"
                          value={chairmanPhoneNumber}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^\d{0,11}$/.test(v)) setChairmanPhoneNumber(v);
                          }}
                          maxLength="11"
                          inputMode="numeric"
                          placeholder="شماره تلفن همراه رئیس را وارد کنید"
                          className="w-full p-4 bg-blue-50/50 text-blue-950 rounded-2xl border border-blue-200 
                     focus:outline-none focus:ring-3 focus:ring-blue-300 text-right 
                     placeholder-blue-400 text-lg transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* آپلود فایل‌ها */}
                  <div className="my-6 space-y-4">
                    <h1 className="text-blue-700 text-lg mr-2 font-semibold">
                      الصاق فایل:
                    </h1>

                    <FileUpload
                      label="پیوست نامه درخواست مهر و امضاشده عضویت"
                      accept=".pdf,.jpg,.png,.jpeg"
                      maxSize={2}
                      value={requestLetter}
                      onChange={(file) => setRequestLetter(file)}
                    />

                    <FileUpload
                      label="لوگو"
                      accept=".pdf,.jpg,.png,.jpeg"
                      maxSize={2}
                      value={logo}
                      onChange={(file) => setLogo(file)}
                    />
                  </div>

                  {/* پیام‌های خطا */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm text-right">
                      {error}
                    </div>
                  )}

                  {/* پیام موفقیت */}
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-sm text-right">
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
                      to="/socialworkunit"
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

export default SocialWorkUnit2;
