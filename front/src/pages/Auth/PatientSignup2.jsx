import React, {useState, useEffect, useRef} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Heart, HandHeart, Users, Sparkles} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import {saveStep, loadStep} from "./utils/signupStorage";
import {patientService} from "../../Services/patientService";
import {citiesByProvince} from "../../data/iranCities";
import {IRAN_PROVINCES} from "../../data/staticSignupOptions";
import { joinFullName, splitFullName } from "./utils/nameFields";
import {
  validatePatientStep2,
} from "./utils/signupValidation";


const PatientSignup2 = () => {
  const [loading, setLoading] = useState(false);

  const [creditCard, setCreditCard] = useState("");
  const [province, setProvince] = useState(null);
  const [town, setTown] = useState("");
  const [address, setAddress] = useState("");
  const [friendFirstName1, setFriendFirstName1] = useState("");
  const [friendLastName1, setFriendLastName1] = useState("");
  const [friendFirstName2, setFriendFirstName2] = useState("");
  const [friendLastName2, setFriendLastName2] = useState("");
  const [friendPhone1, setFriendPhone1] = useState("");
  const [friendPhone2, setFriendPhone2] = useState("");
  const [familyStatus, setFamilyStatus] = useState("");
  const [ability, setAbility] = useState("");
  const [illness, setIllNess] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(null);


  const provinces = IRAN_PROVINCES;

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("signupRole", "patient");

    const data = loadStep("patient", "step2");

    if (data) {
      setCreditCard(data.bank_card_number || data.creditCard || "");
      const pr = provinces.find((p) => p.value === data.province);
      setProvince(pr || null);

      if (data.city) {
        setCity({label: data.city, value: data.city});
      }
      setTown(data.town || data.county || "");
      setAddress(data.address || "");
      const [c1f, c1l] = splitFullName(
        data.contact1_full_name || data.friendName1 || ""
      );
      const [c2f, c2l] = splitFullName(
        data.contact2_full_name || data.friendName2 || ""
      );
      setFriendFirstName1(data.contact1_first_name || c1f);
      setFriendLastName1(data.contact1_last_name || c1l);
      setFriendFirstName2(data.contact2_first_name || c2f);
      setFriendLastName2(data.contact2_last_name || c2l);
      setFriendPhone1(data.contact1_phone_number || data.friendPhone1 || "");
      setFriendPhone2(data.contact2_phone_number || data.friendPhone2 || "");
      setFamilyStatus(data.family_status || data.familyStatus || "");
      setAbility(data.skill || data.ability || "");
      setIllNess(data.sickness_description || data.illness || "");
    }
  }, []);


  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {duration: 0.8},
    },
  };

  const cardVariants = {
    hidden: {y: 50, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {duration: 0.6, ease: "easeOut"},
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {duration: 0.3, ease: "easeOut"},
    },
  };

  const slideVariants = {
    hidden: {x: 100, opacity: 0},
    visible: {
      x: 0,
      opacity: 1,
      transition: {duration: 0.6, ease: "easeOut"},
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: {duration: 0.4, ease: "easeIn"},
    },
  };

  const validateForm = () => {
    return validatePatientStep2({
      province: province?.value,
      city: city?.value,
      address,
      bank_card_number: creditCard,
    });
  };

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    const errorMessage = validateForm();
    if (errorMessage) return setError(errorMessage);

    const payload = {
      bank_card_number: creditCard.replace(/\s/g, ""),
      province: province?.value,
      town,
      city: city?.value,
      address,
      family_status: familyStatus,
      skill: ability,
      sickness_description: illness,
      contact1_first_name: friendFirstName1.trim(),
      contact1_last_name: friendLastName1.trim(),
      contact1_full_name: joinFullName(friendFirstName1, friendLastName1),
      contact1_phone_number: friendPhone1,
      contact2_first_name: friendFirstName2.trim(),
      contact2_last_name: friendLastName2.trim(),
      contact2_full_name: joinFullName(friendFirstName2, friendLastName2),
      contact2_phone_number: friendPhone2,
    };

    try {
      setLoading(true);

      await patientService.signupStep2(payload);
      saveStep("patient", "step2", payload);

      navigate("/authpatient3", {
        state: {
          originForm: "patient",
          previousStep: "/authpatient2",
        },
      });
    } catch (err) {
      setError("خطا در ثبت اطلاعات");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (province?.value && citiesByProvince[province.value]) {
      setCities(
        citiesByProvince[province.value].map(city => ({
          label: city,
          value: city
        }))
      );
    } else {
      setCities([]);
    }

    setCity(null);

  }, [province]);


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
            <Heart className="w-full h-full"/>
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
            <Sparkles className="w-4 h-4 text-blue-200"/>
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
        <div
          className="lg:w-1/2 relative bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 p-10 lg:p-16 flex flex-col justify-center items-center text-white overflow-hidden">
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
              initial={{opacity: 0, y: 30}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.3}}
              className="mb-12"
            >
              <div
                className="w-32 h-32 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <HandHeart className="w-16 h-16 text-white"/>
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
                  <Icon className="w-8 h-8 text-white/70"/>
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
                  <h1
                    className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-emerald-700 bg-clip-text text-transparent mb-3 text-right">
                    عضویت بیماران در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات خود را برای ثبت‌نام وارد کنید
                  </p>
                </div>
                <div className="space-y-5 sm:space-y-7">
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <h1 className="sm:col-span-2 text-blue-700 font-bold text-base sm:text-lg">
                        آدرس:
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

                      {/* city */}
                      <div>
                        <RenderDropdown
                          value={city}
                          setValue={setCity}
                          options={cities}
                          name="city"
                          placeholder="انتخاب شهر"
                          label="شهر"
                        />
                      </div>

                      {/* address */}
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          آدرس
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="آدرس"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      {/* family status */}
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          شرح حال مختصر از وضع خانواده
                        </label>
                        <input
                          type="text"
                          value={familyStatus}
                          onChange={(e) => setFamilyStatus(e.target.value)}
                          placeholder="شرح حال وضع خانواده"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      {/* ability */}
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          حرفه / مهارت
                        </label>
                        <input
                          type="text"
                          value={ability}
                          onChange={(e) => setAbility(e.target.value)}
                          placeholder="حرفه/مهارت"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      {/* illness */}
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          شرح حال مختصر بیماری
                        </label>
                        <input
                          type="text"
                          value={illness}
                          onChange={(e) => setIllNess(e.target.value)}
                          placeholder="شرح حال بیماری"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      {/* credit card */}
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          شماره کارت بانکی <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={creditCard}
                          onChange={(e) => {
                            let raw = e.target.value.replace(/\D/g, "");
                            if (raw.length > 16) raw = raw.slice(0, 16);
                            const formatted = raw.replace(
                              /(\d{4})(?=\d)/g,
                              "$1 "
                            );
                            setCreditCard(formatted);
                          }}
                          maxLength={19}
                          inputMode="numeric"
                          placeholder="شماره کارت بانکی"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          نام آشنای اول
                        </label>
                        <input
                          type="text"
                          value={friendFirstName1}
                          onChange={(e) => setFriendFirstName1(e.target.value)}
                          placeholder="نام"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          نام خانوادگی آشنای اول
                        </label>
                        <input
                          type="text"
                          value={friendLastName1}
                          onChange={(e) => setFriendLastName1(e.target.value)}
                          placeholder="نام خانوادگی"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      {/* friend 1 phone */}
                      <div>
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          موبایل آشنای اول
                        </label>
                        <input
                          type="tel"
                          value={friendPhone1}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^\d{0,11}$/.test(v)) setFriendPhone1(v);
                          }}
                          maxLength="11"
                          inputMode="numeric"
                          placeholder="شماره موبایل"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          نام آشنای دوم
                        </label>
                        <input
                          type="text"
                          value={friendFirstName2}
                          onChange={(e) => setFriendFirstName2(e.target.value)}
                          placeholder="نام"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          نام خانوادگی آشنای دوم
                        </label>
                        <input
                          type="text"
                          value={friendLastName2}
                          onChange={(e) => setFriendLastName2(e.target.value)}
                          placeholder="نام خانوادگی"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>

                      {/* friend 2 phone */}
                      <div>
                        <label className="block mb-2 text-blue-700 text-sm sm:text-base">
                          موبایل آشنای دوم
                        </label>
                        <input
                          type="tel"
                          value={friendPhone2}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^\d{0,11}$/.test(v)) setFriendPhone2(v);
                          }}
                          maxLength="11"
                          inputMode="numeric"
                          placeholder="شماره موبایل"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950"
                        />
                      </div>
                    </div>
                  </>

                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  <motion.button
                    onClick={handleSignup}
                    disabled={loading}

                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    className="w-full py-3 sm:py-4 bg-gradient-to-l from-blue-500 to-emerald-600
    text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg
    shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? "در حال ثبت..." : "مرحله بعد"}
                  </motion.button>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between text-center">
                    <Link
                      to="/loginpage"
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm sm:text-lg py-2"
                    >
                      قبلا ثبت نام کرده‌اید؟ وارد شوید
                    </Link>

                    <Link
                      to="/authpatient"
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm sm:text-lg py-2"
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

export default PatientSignup2;
