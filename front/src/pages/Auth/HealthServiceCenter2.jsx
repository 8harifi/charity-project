import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import { saveStep, loadStep } from "./utils/signupStorage";
import { useEnterSubmit } from "../../hooks/useEnterSubmit";


const HealthServiceCenter2 = () => {
  const [services, setServices] = useState([]);
  const [cooperationType, setCooperationType] = useState("");
  const [patientCount, setPatientCount] = useState("");
  const [notes, setNotes] = useState("");
  const [paraServiceType, setParaServiceType] = useState("");
  const [rehabServiceType, setRehabServiceType] = useState("");
  const [durationNumber, setDurationNumber] = useState("");
  const [durationUnit, setDurationUnit] = useState("");

  const [otherService, setOtherService] = useState("");

  const [otherCooperation, setOtherCooperation] = useState("");

  const serviceOptions = [
    "آزمایشگاهی",
    "تصویربرداری",
    "تست های تخصصی پاراکلینیکی",
    "سایر خدمات پاراکلینیکی",
    "خدمات توانبخشی",
    "پرستاری",
    "کار در منزل",
    "داروخانه",
    "لوازم پزشکی",
    "خدمات حمل و نقل بیماران برای بیماران مناطق دور افتاده",
  ];
  const durationUnits = ["هفته", "ماه", "سال"];

  const toggleService = (item) => {
    setServices((prev) => {
      if (prev.includes(item)) {
        // وقتی حذف می‌شود state مرتبط هم پاک شود
        if (item === "تست های تخصصی پاراکلینیکی") setParaServiceType("");
        if (item === "خدمات توانبخشی") setRehabServiceType("");
        if (item === "سایر خدمات پاراکلینیکی") setOtherService("");

        return prev.filter((s) => s !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  const saved = loadStep("healthservicecenter", "step2");

  if (saved) {
    setServices(saved.services || []);
    setCooperationType(saved.cooperationType || "");
    setPatientCount(saved.patientCount || "");
    setNotes(saved.notes || "");
    setParaServiceType(saved.paraServiceType || "");
    setRehabServiceType(saved.rehabServiceType || "");
    setDurationNumber(saved.durationNumber || "");
    setDurationUnit(saved.durationUnit || "");
    setOtherService(saved.otherService || "");
    setOtherCooperation(saved.otherCooperation || "");
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
    if (services.length === 0) {
      return "حداقل یک نوع خدمت را انتخاب کنید.";
    }

    if (services.includes("تست های تخصصی پاراکلینیکی") && !paraServiceType) {
      return "نوع تست تخصصی پاراکلینیکی را انتخاب کنید.";
    }

    if (services.includes("خدمات توانبخشی") && !rehabServiceType) {
      return "نوع خدمت توانبخشی را انتخاب کنید.";
    }

    if (services.includes("سایر خدمات پاراکلینیکی") && !otherService) {
      return "نوع سایر خدمات پاراکلینیکی را مشخص کنید.";
    }

    if (!patientCount || Number(patientCount) <= 0) {
      return "تعداد بیماران را وارد کنید.";
    }

    if (!cooperationType) {
      return "نوع همکاری (روزانه، هفتگی یا ماهانه) را انتخاب کنید.";
    }

    if (!durationNumber || Number(durationNumber) <= 0) {
      return "مدت همکاری را (عدد) وارد کنید.";
    }

    if (!durationUnit) {
      return "واحد مدت همکاری را انتخاب کنید.";
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

  saveStep("healthservicecenter", "step2", {
    services,
    cooperationType,
    patientCount,
    notes,
    paraServiceType,
    rehabServiceType,
    durationNumber,
    durationUnit,
    otherService,
    otherCooperation,
  });

  setSuccess("اطلاعات با موفقیت ذخیره شد.");

  setTimeout(() => {
    navigate("/lastsignup", {
      state: {
        originForm: "healthservicecenter",
        previousStep: "/healthservicecenter2",
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

                {/* signup page */}
                {/* -------------------- خدمات -------------------- */}
                <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-8 sm:mb-10">
                  <h3 className="font-bold text-lg sm:text-xl text-blue-700 mb-4">
                    نوع زیرمجموعه سلامت
                  </h3>

                  <div className="space-y-5 sm:space-y-6">
                    {serviceOptions.map((item) => (
                      <div key={item} className="space-y-3">
                        {/* چک‌باکس */}
                        <label className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base md:text-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={services.includes(item)}
                            onChange={() => toggleService(item)}
                            className="accent-blue-600 scale-100 sm:scale-110"
                          />
                          {item}
                        </label>

                        {/* تست‌های تخصصی پاراکلینیک */}
                        {item === "تست های تخصصی پاراکلینیکی" &&
                          services.includes(item) && (
                            <RenderDropdown
                              label="نوع تست تخصصی:"
                              name="paraServiceType"
                              value={paraServiceType}
                              setValue={setParaServiceType}
                              placeholder="انتخاب نوع تست..."
                              options={[
                                "تست های فشار خون",
                                "تنفسی",
                                "نوار مغز",
                              ]}
                            />
                          )}

                        {/* خدمات توانبخشی */}
                        {item === "خدمات توانبخشی" &&
                          services.includes(item) && (
                            <RenderDropdown
                              label="نوع خدمت توانبخشی:"
                              name="rehabServiceType"
                              value={rehabServiceType}
                              setValue={setRehabServiceType}
                              placeholder="انتخاب نوع توانبخشی..."
                              options={[
                                "فیزیوتراپی",
                                "کاردرمانی",
                                "گفتاردرمانی",
                                "بینایی‌درمانی",
                                "ارتوپدی فنی",
                              ]}
                            />
                          )}

                        {/* سایر خدمات */}
                        {item === "سایر خدمات پاراکلینیکی" &&
                          services.includes(item) && (
                            <RenderDropdown
                              label="نوع خدمت:"
                              name="otherService"
                              value={otherService}
                              setValue={setOtherService}
                              placeholder="عنوان خدمت را انتخاب کنید..."
                              options={["تزریقات", "بخیه", "پانسمان"]}
                            />
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* میزان همکاری */}
                <h2 className="text-lg sm:text-xl font-bold text-blue-700 my-5 sm:my-6">
                  میزان همکاری:
                </h2>

                <div className="space-y-5 sm:space-y-6">
                  {/* جمله اول */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base md:text-lg">
                    <span>به تعداد</span>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={patientCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || Number(value) >= 1) {
                          setPatientCount(value);
                        }
                      }}
                      className="
        w-20 sm:w-24 p-2 text-center rounded-lg
        border border-blue-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        text-sm sm:text-base
      "
                    />

                    <span>بیمار</span>

                    {["روزانه", "هفتگی", "ماهانه"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-1 cursor-pointer text-sm sm:text-base"
                      >
                        <input
                          type="radio"
                          name="coopType"
                          checked={cooperationType === type}
                          onChange={() => setCooperationType(type)}
                          className="accent-blue-600 scale-100 sm:scale-110"
                        />
                        {type}
                      </label>
                    ))}
                  </div>

                  {/* جمله دوم */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base md:text-lg">
                    <span>به صورت رایگان، به مدت</span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={durationNumber}
                        onChange={(e) => setDurationNumber(e.target.value)}
                        placeholder="عدد"
                        className="
          w-20 sm:w-24 h-10 sm:h-12 text-center
          rounded-lg border border-blue-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          text-sm sm:text-base
        "
                      />

                      <RenderDropdown
                        label=""
                        name="durationUnit"
                        value={durationUnit}
                        setValue={setDurationUnit}
                        placeholder="واحد"
                        options={durationUnits}
                        className="w-24 sm:w-28 h-10 sm:h-12"
                      />
                    </div>

                    <span>(هفته، ماه، سال) ویزیت می‌نمایم</span>
                  </div>

                  {/* سایر موارد */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base md:text-lg">
                    <span>سایر موارد:</span>

                    <input
                      type="text"
                      value={otherCooperation}
                      onChange={(e) => setOtherCooperation(e.target.value)}
                      className="
        w-full sm:flex-1 p-3 rounded-xl
        border border-blue-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        text-sm sm:text-base
      "
                    />
                  </div>

                  {/* توضیحات */}
                  <div>
                    <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                      توضیحات:
                    </label>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="4"
                      placeholder="توضیحات خود را وارد کنید..."
                      className="
        w-full p-3 sm:p-4 rounded-xl bg-white
        border border-blue-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        text-sm sm:text-base
      "
                    />
                  </div>
                </div>

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
                    to="/healthservicecenter"
                    className="text-blue-600 hover:text-blue-800 font-bold text-lg py-3"
                  >
                    بازگشت به مرحله قبل
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

export default HealthServiceCenter2;
