import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import LegalReferrerSelector from "./components/LegalReferrerSelector";
import { saveStep, loadStep } from "./utils/signupStorage";

const SocialWorkUnit = () => {
  const [legalType, setLegalType] = useState("");
  const [legalSubType, setLegalSubType] = useState("");
  const [legalName, setLegalName] = useState("");
  const [chairmanName, setChairmanName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telephone, setTelephone] = useState("");
  const [faxNumber, setFaxNumber] = useState("");
  const [province, setProvince] = useState("");
  const [town, setTown] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const noSubTypeTypes = ["مطب پزشک", "مرکز نیکوکاری"];
  const needsSubType = legalType && !noSubTypeTypes.includes(legalType);

  const provinces = [
    "آذربایجان شرقی",
    "آذربایجان غربی",
    "اردبیل",
    "اصفهان",
    "البرز",
    "ایلام",
    "بوشهر",
    "تهران",
    "چهارمحال و بختیاری",
    "خراسان جنوبی",
    "خراسان رضوی",
    "خراسان شمالی",
    "خوزستان",
    "زنجان",
    "سمنان",
    "سیستان و بلوچستان",
    "فارس",
    "قزوین",
    "قم",
    "کردستان",
    "کرمان",
    "کرمانشاه",
    "کهگیلویه و بویراحمد",
    "گلستان",
    "گیلان",
    "لرستان",
    "مازندران",
    "مرکزی",
    "هرمزگان",
    "همدان",
    "یزد",
  ];

  const navigate = useNavigate();
  useEffect(() => {
    // تعیین نقش جاری
    localStorage.setItem("signupRole", "socialworkunit");

    const saved = loadStep("socialworkunit", 1);
    if (saved) {
      setLegalType(saved.legalType || "");
      setLegalSubType(saved.legalSubType || "");
      setLegalName(saved.legalName || "");
      setChairmanName(saved.chairmanName || "");
      setPhoneNumber(saved.phoneNumber || "");
      setTelephone(saved.telephone || "");
      setFaxNumber(saved.faxNumber || "");
      setProvince(saved.province || "");
      setTown(saved.town || "");
      setCity(saved.city || "");
      setAddress(saved.address || "");
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
    // نوع حقوقی

    if (!legalType) return "نوع مجموعه سلامتیار را انتخاب کنید.";

    // فقط اگر این نوع مجموعه زیرمجموعه دارد
    if (needsSubType) {
      if (!legalSubType) return "نوع زیرمجموعه سلامتیار را انتخاب کنید.";
      if (!legalName) return "نام زیرمجموعه سلامتیار را انتخاب کنید.";
    }

    // نام رئیس مجموعه
    if (!chairmanName.trim()) {
      return "لطفاً نام و نام خانوادگی رئیس مجموعه را وارد کنید.";
    }

    // موبایل
    if (!phoneNumber) {
      return "لطفاً شماره تلفن همراه را وارد کنید.";
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      return "شماره تلفن همراه معتبر نیست.";
    }

    // تلفن ثابت
    if (!telephone) {
      return "لطفاً کد شهر و شماره تلفن ثابت را وارد کنید.";
    }

    if (!/^\d{8,11}$/.test(telephone)) {
      return "شماره تلفن ثابت معتبر نیست.";
    }

    // نمابر (اختیاری)
    if (faxNumber && !/^\d{8,11}$/.test(faxNumber)) {
      return "شماره نمابر معتبر نیست.";
    }

    // استان
    if (!province) {
      return "لطفاً استان را انتخاب کنید.";
    }

    // شهرستان
    if (!town.trim()) {
      return "لطفاً شهرستان را وارد کنید.";
    }

    // شهر
    if (!city.trim()) {
      return "لطفاً شهر را وارد کنید.";
    }

    // آدرس
    if (!address.trim()) {
      return "لطفاً آدرس را وارد کنید.";
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

    // ✅ ذخیره مرحله ۱
    saveStep("socialworkunit", 1, {
      legalType,
      legalSubType,
      legalName,
      chairmanName,
      phoneNumber,
      telephone,
      faxNumber,
      province,
      town,
      city,
      address,
    });

    setSuccess("اطلاعات با موفقیت ذخیره شد.");

    // فعال کردن انیمیشن خروج
    setLeaving(true);

    setTimeout(() => {
      navigate("/socialworkunit2");
    }, 500);
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

                {/* Container اصلی */}
                <div className="space-y-6">
                  {/* بخش انتخاب نوع حقوقی - انیمیشن دار */}
                  <motion.div
                    key="legal"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="w-full"
                  >
                    <LegalReferrerSelector
                      legalType={legalType}
                      setLegalType={setLegalType}
                      legalSubType={legalSubType}
                      setLegalSubType={setLegalSubType}
                      legalName={legalName}
                      setLegalName={setLegalName}
                    />
                  </motion.div>

                  {/* فرم اطلاعات تماس و مدیریت - دو ستونه در دسکتاپ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* نام رئیس مجموعه */}
                    <div className="relative">
                      <label
                        className="text-blue-700 p-3 block"
                        htmlFor="cname"
                      >
                        نام و نام خانوادگی رئیس مجموعه
                      </label>
                      <input
                        id="cname"
                        type="text"
                        value={chairmanName}
                        onChange={(e) => setChairmanName(e.target.value)}
                        placeholder="نام و نام خانوادگی رئیس مجموعه"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-lg text-blue-950 transition-all"
                      />
                    </div>

                    {/* تلفن همراه */}
                    <div className="relative">
                      <label
                        className="text-blue-700 p-3 block"
                        htmlFor="phone"
                      >
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
                        placeholder="شماره تلفن همراه"
                        className="w-full p-4 bg-blue-50/50 text-blue-950 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-lg transition-all"
                      />
                    </div>

                    {/* تلفن ثابت */}
                    <div className="relative">
                      <label
                        className="text-blue-700 p-3 block"
                        htmlFor="telphone"
                      >
                        کد شهر و شماره تلفن
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
                        placeholder="کد شهر و شماره تلفن"
                        className="w-full p-4 bg-blue-50/50 text-blue-950 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-lg transition-all"
                      />
                    </div>

                    {/* شماره نمابر */}
                    <div className="relative">
                      <label className="text-blue-700 p-3 block" htmlFor="num">
                        شماره نمابر (فکس)
                      </label>
                      <input
                        id="num"
                        type="text"
                        inputMode="numeric"
                        value={faxNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) setFaxNumber(value);
                        }}
                        placeholder="شماره نمابر را وارد کنید"
                        className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-lg text-blue-950 transition-all"
                      />
                    </div>

                    {/* بخش آدرس - تمام عرض در گرید داخلی */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-blue-100">
                      <h3 className="col-span-full mr-2 text-blue-700 font-bold text-lg">
                        آدرس مجموعه:
                      </h3>

                      <RenderDropdown
                        value={province}
                        setValue={setProvince}
                        options={provinces}
                        name="province"
                        placeholder="انتخاب استان"
                        label="استان"
                      />

                      <div>
                        <label className="text-blue-700 p-3 text-sm sm:text-base">
                          شهرستان
                        </label>
                        <input
                          type="text"
                          value={town}
                          onChange={(e) => setTown(e.target.value)}
                          placeholder="شهرستان"
                          className="w-full p-4 mt-2 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-lg text-blue-950"
                        />
                      </div>

                      <div>
                        <label className="text-blue-700 p-3 text-sm sm:text-base">
                          شهر
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="شهر"
                          className="w-full p-4 bg-blue-50/50 mt-2 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-lg text-blue-950"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 md:col-span-3">
                        <label className="text-blue-700 p-3 block">آدرس</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="آدرس"
                          className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-lg text-blue-950"
                        />
                      </div>
                    </div>
                  </div>

                  {/* پیام‌های سیستم */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm text-right">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm text-right">
                      {success}
                    </div>
                  )}

                  {/* دکمه عملیات */}
                  <motion.button
                    onClick={handleSignup}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-4 bg-gradient-to-l from-blue-600 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-200 transition-all duration-300 mt-4"
                  >
                    مرحله بعد
                  </motion.button>

                  {/* لینک‌ها */}
                  <div className="flex justify-center pt-2">
                    <Link
                      to="/loginpage"
                      className="text-blue-600 hover:text-blue-800 font-medium text-base transition-colors py-2 border-b border-transparent"
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

export default SocialWorkUnit;
