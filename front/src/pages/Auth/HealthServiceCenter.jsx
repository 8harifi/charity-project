import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import LegalReferrerSelector from "./components/LegalReferrerSelector";
import { saveStep, loadStep } from "./utils/signupStorage";


const HealthServiceCenter = () => {
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [town, setTown] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [referrerType, setReferrerType] = useState("");
  const [legalType, setLegalType] = useState("");
  const [legalSubType, setLegalSubType] = useState("");
  const [legalName, setLegalName] = useState("");

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
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  localStorage.setItem("signupRole", "healthservicecenter");
}, []);

useEffect(() => {
  const data = loadStep("healthservicecenter", "step1");

  if (data) {
    setName(data.name || "");
    setProvince(data.province || "");
    setTown(data.town || "");
    setCity(data.city || "");
    setAddress(data.address || "");
    setReferrerType(data.referrerType || "");
    setLegalType(data.legalType || "");
    setLegalSubType(data.legalSubType || "");
    setLegalName(data.legalName || "");
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
  if (!name.trim()) {
    return "نام مرکز را وارد کنید.";
  }

  if (!province) {
    return "استان را انتخاب کنید.";
  }

  if (!town.trim()) {
    return "شهرستان را وارد کنید.";
  }

  if (!city.trim()) {
    return "شهر را وارد کنید.";
  }

  if (!address.trim()) {
    return "آدرس را وارد کنید.";
  }

  if (!referrerType) {
    return "نوع همکاری را انتخاب کنید.";
  }

  // اگر فقط با مجموعه‌های خاص همکاری می‌کند → فیلدهای مربوط باید پر شوند
  if (referrerType === "special") {
    if (!legalType) {
      return "نوع مجموعه را انتخاب کنید.";
    }

    if (!legalSubType) {
      return "زیرمجموعه را انتخاب کنید.";
    }

    if (!legalName.trim()) {
      return "نام مجموعه را وارد کنید.";
    }
  }

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

  const payload = {
    name,
    province,
    town,
    city,
    address,
    referrerType,
    legalType: referrerType === "special" ? legalType : null,
    legalSubType: referrerType === "special" ? legalSubType : null,
    legalName: referrerType === "special" ? legalName : null,
  };

  try {
    saveStep("healthservicecenter", "step1", payload);

    setSuccess("اطلاعات با موفقیت ثبت شد.");

    navigate("/healthservicecenter2", {
      state: {
        originForm: "healthservicecenter",
        previousStep: "/healthservicecenter",
      },
    });
  } catch (err) {
    console.error(err);
    setError("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
  }
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
                    عضویت مراکز خدمات سلامت در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات مرکز را برای ثبت‌نام وارد کنید
                  </p>
                </div>

                <div className="space-y-7">
                  {/* signup page */}

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

  {/* نام مرکز */}
  <div className="relative">
    <label htmlFor="name" className="block mb-2 text-blue-700 text-sm sm:text-base">
      نام مرکز
    </label>

    <input
      id="name"
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="نام مرکز"
      className="
        w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl 
        border border-blue-200 
        focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 
        text-right placeholder-blue-400 
        text-sm sm:text-base text-blue-950 transition-all
      "
    />
  </div>

  {/* آدرس --}}
  <div className="grid grid-cols-1 sm:grid-cols-2 col-span-1 sm:col-span-2 gap-4 mt-4 sm:mt-6">
    
    <h1 className="col-span-1 sm:col-span-2 text-blue-700 font-bold text-base sm:text-lg mb-2">
      آدرس محل خدمت:
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
      <label className="block mb-2 text-blue-700 text-sm sm:text-base">شهرستان</label>
      <input
        type="text"
        value={town}
        onChange={(e) => setTown(e.target.value)}
        placeholder="شهرستان"
        className="
          w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl 
          border border-blue-200 
          focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-base text-blue-950
        "
      />
    </div>

    {/* city */}
    <div>
      <label className="block mb-2 text-blue-700 text-sm sm:text-base">شهر</label>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="شهر"
        className="
          w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl 
          border border-blue-200 
          focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-base text-blue-950
        "
      />
    </div>

    {/* full address */}
    <div className="col-span-1 sm:col-span-2">
      <label className="block mb-2 text-blue-700 text-sm sm:text-base">آدرس</label>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="آدرس"
        className="
          w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl 
          border border-blue-200 
          focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-base text-blue-950
        "
      />
    </div>
  </div>
</div>

{/* نوع همکاری */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
  className="flex flex-col gap-3 my-4 sm:my-6"
>
  <h1 className="text-blue-700 text-base sm:text-lg font-semibold">
    نوع همکاری
  </h1>

  <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
    <input
      type="radio"
      name="referrer"
      checked={referrerType === 'all'}
      onChange={() => setReferrerType('all')}
      className="accent-blue-600 scale-95 sm:scale-110"
    />
    <span className="text-gray-700">با کل اعضای سامانه</span>
  </label>

  <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
    <input
      type="radio"
      name="referrer"
      checked={referrerType === 'special'}
      onChange={() => setReferrerType('special')}
      className="accent-blue-600 scale-95 sm:scale-110"
    />
    <span className="text-gray-700">فقط با مجموعه‌های خاص</span>
  </label>

  <AnimatePresence>
    {referrerType === 'special' && (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.25 }}
        className="mr-4 sm:mr-6 mt-2 space-y-4 sm:space-y-6"
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
    )}
  </AnimatePresence>
</motion.div>

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
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HealthServiceCenter;
