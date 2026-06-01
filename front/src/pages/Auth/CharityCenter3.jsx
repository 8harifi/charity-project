import React, { useState, useEffect } from "react";
import { saveStep, loadStep } from "./utils/signupStorage";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import FileUpload from "./components/FileUpload";
import { joinFullName, splitFullName } from "./utils/nameFields";

const CharityCenter3 = () => {
  const [province, setProvince] = useState("");
  const [town, setTown] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [activityArea, setActivityArea] = useState("");
  const [agentFirstName, setAgentFirstName] = useState("");
  const [agentLastName, setAgentLastName] = useState("");
  const [agentPhoneNumber, setAgentPhoneNumber] = useState("");
  const [requestLetter, setRequestLetter] = useState(null);
  const [license, setLicense] = useState(null);
  const [logo, setLogo] = useState(null);

  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasLicense, setHasLicense] = useState(null);

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

  const activities = ["روستا", "شهر", "شهرستان", "استان", "کشور", "بین الملل"];

  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem("signupRole", "charitycenter");

    const saved = loadStep("charitycenter", "step3");
    const step1 = loadStep("charitycenter", "step1");
    setHasLicense(step1.license === "دارد");

    if (saved) {
      setProvince(saved.province || "");
      setTown(saved.town || "");
      setCity(saved.city || "");
      setAddress(saved.address || "");
      setActivityArea(saved.activityArea || "");
      const [af, al] = splitFullName(saved.agentName || "");
      setAgentFirstName(saved.agent_first_name || af);
      setAgentLastName(saved.agent_last_name || al);
      setAgentPhoneNumber(saved.agentPhoneNumber || "");
      setRequestLetter(saved.requestLetter || null);
      setLicense(saved.license || null);
      setLogo(saved.logo || null);
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
    if (!province) return "استان را انتخاب کنید.";

    if (!town.trim()) return "نام شهرستان را وارد کنید.";

    if (!city.trim()) return "نام شهر را وارد کنید.";

    if (!address.trim()) return "آدرس مرکز را وارد کنید.";

    if (!activityArea) return "محدوده فعالیت را انتخاب کنید.";

    if (!agentFirstName.trim()) return "نام نماینده را وارد کنید.";
    if (!agentLastName.trim()) return "نام خانوادگی نماینده را وارد کنید.";

    if (!agentPhoneNumber) return "شماره تلفن همراه نماینده را وارد کنید.";

    if (!/^09\d{9}$/.test(agentPhoneNumber))
      return "شماره تلفن همراه باید 11 رقم و با 09 شروع شود.";

    if (!requestLetter)
      return "لطفا نامه درخواست عضویت با مهر و امضای مدیرعامل را بارگذاری کنید.";

  if (hasLicense && !license)
    return "لطفا فایل پروانه فعالیت را بارگذاری کنید.";

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

    saveStep("charitycenter", "step3", {
      province,
      town,
      city,
      address,
      activityArea,
      agent_first_name: agentFirstName.trim(),
      agent_last_name: agentLastName.trim(),
      agentName: joinFullName(agentFirstName, agentLastName),
      agentPhoneNumber,
      requestLetter,
      license,
      logo,
    });

    navigate("/lastsignup", {
      state: {
        originForm: "charitycenter",
        previousStep: "/charitycenter3",
      },
    });
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
                    عضویت مراکز نیکوکاری در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات خود را برای ثبت‌نام وارد کنید
                  </p>
                </div>

                <div className="space-y-7">
                  {/* signup page */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <h1 className="col-span-1 md:col-span-2 text-blue-700 font-bold text-right mt-2">
                      آدرس:
                    </h1>

                    {/* province */}
                    <div className="w-full">
                      <RenderDropdown
                        value={province}
                        setValue={setProvince}
                        options={provinces}
                        name="province"
                        placeholder="انتخاب استان"
                        label="استان"
                      />
                    </div>

                    {/* town */}
                    <div className="flex flex-col w-full">
                      <label className="text-blue-700 mb-2 text-sm sm:text-base">
                        شهرستان
                      </label>
                      <input
                        type="text"
                        value={town}
                        onChange={(e) => setTown(e.target.value)}
                        placeholder="شهرستان"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-200 
         focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 focus:outline-none
         text-base sm:text-lg text-blue-950"
                      />
                    </div>

                    {/* city */}
                    <div className="flex flex-col w-full">
                      <label className="text-blue-700 mb-2 text-sm sm:text-base">
                        شهر
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="شهر"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-200 
         focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400  focus:outline-none
         text-base sm:text-lg text-blue-950"
                      />
                    </div>

                    {/* address full width */}
                    <div className="col-span-1 md:col-span-2 flex flex-col w-full">
                      <label className="text-blue-700 mb-2 text-sm sm:text-base">
                        آدرس
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="آدرس"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-200 
         focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400  focus:outline-none
         text-base sm:text-lg text-blue-950"
                      />
                    </div>
                  </div>

                  <div className="relative mb-8">
                    <RenderDropdown
                      value={activityArea}
                      setValue={setActivityArea}
                      options={activities}
                      name="activityArea"
                      placeholder="محدوده فعالیت"
                      label="محدوده فعالیت"
                    />
                  </div>

                  <div className="my-8">
                    <h1 className="text-blue-700 text-base sm:text-lg mb-3 mr-2">
                      معرفی نماینده:
                    </h1>

                    <div className="flex flex-col w-full mb-5">
                      <label className="text-blue-700 mb-2 text-sm sm:text-base" htmlFor="ag_first">
                        نام نماینده
                      </label>
                      <input
                        id="ag_first"
                        type="text"
                        value={agentFirstName}
                        onChange={(e) => setAgentFirstName(e.target.value)}
                        placeholder="نام"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-base sm:text-lg text-blue-950 transition-all"
                      />
                    </div>
                    <div className="flex flex-col w-full mb-5">
                      <label className="text-blue-700 mb-2 text-sm sm:text-base" htmlFor="ag_last">
                        نام خانوادگی نماینده
                      </label>
                      <input
                        id="ag_last"
                        type="text"
                        value={agentLastName}
                        onChange={(e) => setAgentLastName(e.target.value)}
                        placeholder="نام خانوادگی"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-200 focus:outline-none focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-base sm:text-lg text-blue-950 transition-all"
                      />
                    </div>

                    {/* تلفن همراه */}
                    <div className="flex flex-col w-full">
                      <label
                        className="text-blue-700 mb-2 text-sm sm:text-base"
                        htmlFor="agphone"
                      >
                        تلفن همراه
                      </label>

                      <input
                        id="agphone"
                        type="tel"
                        value={agentPhoneNumber}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d{0,11}$/.test(v)) setAgentPhoneNumber(v);
                        }}
                        maxLength="11"
                        inputMode="numeric"
                        placeholder="شماره تلفن همراه نماینده را وارد کنید"
                        className="
         w-full p-3 sm:p-4 bg-blue-50/50 rounded-2xl border border-blue-200
        focus:outline-none focus:ring-3 focus:ring-blue-300
        text-right placeholder-blue-400
        text-base sm:text-lg text-blue-950
        transition-all
      "
                      />
                    </div>
                  </div>

                  {/* فایل‌ها */}
                  <div className="my-6">
                    <h1 className="text-blue-700 text-base sm:text-lg mr-2 mb-3">
                      الصاق فایل:
                    </h1>

                    <div className="space-y-4">
                      <FileUpload
                        label="نامه درخواست عضویت با مهر و امضای مدیر عامل"
                        accept=".pdf,.jpg,.png,.jpeg"
                        maxSize={1.5}
                        value={requestLetter}
                        onChange={setRequestLetter}
                      />

                      <FileUpload
                        label="پروانه فعالیت"
                        accept=".pdf,.jpg,.png,.jpeg"
                        maxSize={1.5}
                        value={license}
                        onChange={setLicense}
                      />
                      <FileUpload
                        label="لوگو"
                        accept=".pdf,.jpg,.png,.jpeg"
                        maxSize={1.5}
                        value={logo}
                        onChange={setLogo}
                      />
                    </div>
                  </div>

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
                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl text-right text-sm mb-4">
                      {error}
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
                    <Link
                      to="/charitycenter2"
                      className="text-blue-600 hover:text-blue-800 font-bold text-lg transition-colors duration-300 py-3"
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

export default CharityCenter3;
