import React, {useState, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Heart, HandHeart, Users, Sparkles} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import {saveStep, loadStep} from "./utils/signupStorage";
import {citiesByProvince} from "../../data/iranCities";
import {lookupApi} from "../../API/lookupApi";
import {useMultipleLookups, findLookupOption} from "../../hooks/useLookupOptions";
import { IRAN_PROVINCES } from "../../data/staticSignupOptions";
import { validateDoctorForm } from "./utils/signupValidation";

const Doctor = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [medicalLicenseNumber, setMedicalLicenseNumber] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);

  const [address, setAddress] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);


  const provinces = IRAN_PROVINCES;

  const {genders, specialities, loading: lookupsLoading} = useMultipleLookups({
    genders: lookupApi.genders,
    specialities: lookupApi.specialties,
  });

  const navigate = useNavigate();

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
    return validateDoctorForm({
      first_name: firstName,
      last_name: lastName,
      gender: gender?.value ?? gender,
      national_code: nationalCode,
      medical_system_code: medicalLicenseNumber,
      father_name: fatherName,
      phone_number: phoneNumber,
      specialty: speciality?.value ?? speciality,
      province: province?.value ?? province,
      city: city?.value ?? city,
      address,
    });
  };

  const handleSignup = async () => {
    const errorMessage = validateForm();

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        father_name: fatherName,
        national_code: nationalCode,
        medical_system_code: medicalLicenseNumber,
        phone_number: phoneNumber,
        province: province?.value,
        city: city?.value,
        address: address,
        gender: gender?.value,
        specialty: speciality?.value,
      };

      saveStep("doctor", "step1", payload);

      setSuccess("اطلاعات با موفقیت ثبت شد ✅");

      setTimeout(() => {
        navigate("/lastsignup", {
          state: {
            originForm: "doctor",
            previousStep: "/doctor",
          },
        });
      }, 800);

    } catch (err) {
      console.error("Doctor Step1 Error:", err);

      setError(
        err.response?.data?.message ||
        "خطا در ثبت اطلاعات. لطفا دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = loadStep("doctor", "step1");
    if (!saved || lookupsLoading) return;

    setFirstName(saved.first_name || "");
    setLastName(saved.last_name || "");
    setGender(findLookupOption(genders, saved.gender));
    setNationalCode(saved.national_code || "");
    setMedicalLicenseNumber(saved.medical_system_code || "");
    setFatherName(saved.father_name || "");
    setSpeciality(findLookupOption(specialities, saved.specialty));
    setPhoneNumber(saved.phone_number || "");
    setProvince(findLookupOption(provinces, saved.province));
    setAddress(saved.address || "");
  }, [lookupsLoading, genders, specialities]);

  useEffect(() => {
    if (!province?.value || !citiesByProvince[province.value]) {
      setCities([]);
      setCity(null);
      return;
    }
    const list = citiesByProvince[province.value].map((city) => ({
      label: city,
      value: city,
    }));
    setCities(list);
    const saved = loadStep("doctor", "step1");
    if (saved?.city && saved.province === province.value) {
      setCity(list.find((c) => c.value === saved.city) || null);
    } else {
      setCity(null);
    }
  }, [province?.value]);


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
                    عضویت پزشکان در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات خود را برای ثبت‌نام وارد کنید
                  </p>
                </div>

                <div className="space-y-7">
                  {/* signup page */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* نام */}
                    <div className="relative">
                      <label
                        className="block text-blue-700 mb-2 text-sm sm:text-base"
                        htmlFor="first_name"
                      >
                        نام
                      </label>
                      <input
                        id="first_name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="نام"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base text-blue-950 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <label
                        className="block text-blue-700 mb-2 text-sm sm:text-base"
                        htmlFor="last_name"
                      >
                        نام خانوادگی
                      </label>
                      <input
                        id="last_name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="نام خانوادگی"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base text-blue-950 transition-all"
                      />
                    </div>

                    {/* جنسیت */}
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

                    {/* کد ملی */}
                    <div className="relative">
                      <label
                        className="block text-blue-700 mb-2 text-sm sm:text-base"
                        htmlFor="code"
                      >
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
                        maxLength={10}
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="کد ملی خود را وارد کنید"
                        className="w-full p-3 sm:p-4 text-blue-950 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base transition-all"
                      />
                    </div>

                    {/* شماره نظام پزشکی */}
                    <div className="relative">
                      <label
                        className="block text-blue-700 mb-2 text-sm sm:text-base"
                        htmlFor="num"
                      >
                        شماره نظام پزشکی
                      </label>
                      <input
                        id="num"
                        type="text"
                        value={medicalLicenseNumber}
                        onChange={(e) =>
                          setMedicalLicenseNumber(e.target.value)
                        }
                        placeholder="شماره نظام پزشکی خود را وارد کنید"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base text-blue-950 transition-all"
                      />
                    </div>

                    {/* نام پدر */}
                    <div className="relative">
                      <label
                        className="block text-blue-700 mb-2 text-sm sm:text-base"
                        htmlFor="father"
                      >
                        نام پدر
                      </label>
                      <input
                        id="father"
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="نام پدر را وارد کنید"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base text-blue-950 transition-all"
                      />
                    </div>

                    {/* تلفن همراه */}
                    <div className="relative">
                      <label
                        className="block text-blue-700 mb-2 text-sm sm:text-base"
                        htmlFor="phone"
                      >
                        تلفن همراه پزشک یا منشی
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d{0,11}$/.test(v)) setPhoneNumber(v);
                        }}
                        maxLength={11}
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="شماره تلفن همراه پزشک یا منشی"
                        className="w-full p-3 sm:p-4 bg-blue-50/50 text-blue-950 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-transparent text-right placeholder-blue-400 text-sm sm:text-base transition-all"
                      />
                    </div>

                    {/* تخصص */}
                    <div className="relative">
                      <RenderDropdown
                        value={speciality}
                        setValue={setSpeciality}
                        options={specialities}
                        name="speciality"
                        placeholder="تخصص"
                        label="تخصص"
                        loading={lookupsLoading}
                      />
                    </div>

                    {/* آدرس محل خدمت */}
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 col-span-1 sm:col-span-2 my-3 sm:my-5">
                      <h2
                        className="col-span-1 sm:col-span-2 mt-2 sm:mt-3 mr-1 sm:mr-2 text-blue-700 font-bold text-base sm:text-lg">
                        آدرس محل خدمت:
                      </h2>

                      {/* استان */}
                      <RenderDropdown
                        value={province}
                        setValue={setProvince}
                        options={provinces}
                        name="province"
                        placeholder="انتخاب استان"
                        label="استان"
                      />

                      {/* شهر */}
                      <div>
                        <label className="block text-blue-700 mb-2 text-sm sm:text-base">
                          شهر
                        </label>
                        <RenderDropdown
                          value={city}
                          setValue={setCity}
                          options={cities}
                          name="city"
                          placeholder="انتخاب شهر"
                          label="شهر"
                        />
                      </div>

                      {/* آدرس کامل - تمام عرض */}
                      <div className="sm:col-span-2">
                        <label className="block text-blue-700 mb-2 text-sm sm:text-base">
                          آدرس
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="آدرس"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl border border-blue-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 text-right placeholder-blue-400 text-sm sm:text-base text-blue-950 transition-all"
                        />
                      </div>
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
                  <motion.button
                    onClick={handleSignup}
                    disabled={loading}
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    className="block w-full py-4 text-center bg-gradient-to-l from-blue-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
                  >
                    {loading ? "در حال ثبت..." : "ثبت اطلاعات"}
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

export default Doctor;
