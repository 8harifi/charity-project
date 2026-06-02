import React, { useState, useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RenderDropdown from "./components/DropDown";
import { saveStep, loadStep } from "./utils/signupStorage";
import { patientService } from "../../Services/patientService";
import { lookupApi } from "../../API/lookupApi";
import { useMultipleLookups, findLookupOption } from "../../hooks/useLookupOptions";
import { HEAD_OF_FAMILY_OPTIONS } from "../../data/staticSignupOptions";
import { validatePatientStep1 } from "./utils/signupValidation";

const PatientSignup1 = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState(null);
  const [nationalCode, setNationalCode] = useState("");
  const [age, setAge] = useState("");
  const [marriageStatus, setMarriageStatus] = useState(null);
  const [headOfFamily, setHeadOfFamily] = useState(null);
  const [numberOfMembers, setNumberOfMembers] = useState("");
  const [education, setEducation] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [houseStatus, setHouseStatus] = useState(null);
  const [organ, setOrgan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [leaving, setLeaving] = useState(false);

  const headOptions = HEAD_OF_FAMILY_OPTIONS;

  const {
    genders,
    marriageOptions,
    educationLevels,
    jobOptions,
    houseOptions,
    organOptions,
    loading: lookupsLoading,
  } = useMultipleLookups({
    genders: lookupApi.genders,
    marriageOptions: lookupApi.maritalStatuses,
    educationLevels: lookupApi.educations,
    jobOptions: lookupApi.jobStatuses,
    houseOptions: lookupApi.housingStatuses,
    organOptions: lookupApi.coveredOrganizations,
  });

  const navigate = useNavigate();

  useEffect(() => {
  localStorage.setItem("signupRole", "patient");
}, []);

{/*
useEffect(() => {
  const data = loadStep("patient", "step1");
  if (data) {
    setName(data.name || "");
    setFatherName(data.fatherName || "");
    setGender(data.gender || "");
    setNationalCode(data.nationalCode || "");
    setAge(data.age || "");
    setMarriageStatus(data.marriageStatus || "");
    setHeadOfFamily(data.headOfFamily || "");
    setNumberOfMembers(data.numberOfMembers || "");
    setEducation(data.education || "");
    setJobStatus(data.jobStatus || "");
    setHouseStatus(data.houseStatus || "");
    setOrgan(data.organ || "");
    setPhoneNumber(data.phoneNumber || "");
    setNumber(data.number || "");
  }
}, []);   */}

useEffect(() => {
  const data = loadStep("patient", "step1");
  if (!data || lookupsLoading) return;

  setFirstName(data.first_name || "");
  setLastName(data.last_name || "");
  setFatherName(data.father_name || "");
  setNationalCode(data.national_code || "");
  setAge(data.age || "");
  setNumberOfMembers(
    data.number_dependents ?? data.dependents_count ?? ""
  );
  setPhoneNumber(data.phone_number || data.mobile || "");
  setNumber(data.landline_number || data.phone || "");

  setGender(findLookupOption(genders, data.gender));
  setMarriageStatus(
    findLookupOption(marriageOptions, data.marital_status ?? data.marriage_status)
  );
  setHeadOfFamily(
    findLookupOption(headOptions, data.head_household ?? data.head_of_family)
  );
  setEducation(findLookupOption(educationLevels, data.education));
  setJobStatus(findLookupOption(jobOptions, data.job_status));
  setHouseStatus(
    findLookupOption(houseOptions, data.housing_status ?? data.house_status)
  );
  setOrgan(
    findLookupOption(
      organOptions,
      data.covered_organization ?? data.supported_organ
    )
  );
}, [
  lookupsLoading,
  genders,
  marriageOptions,
  educationLevels,
  jobOptions,
  houseOptions,
  organOptions,
]);


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

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setLeaving(true); // شروع انیمیشن خروج

        setTimeout(() => {
          navigate("/loginCharitable");
        }, 500);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validateForm = () => {
    return validatePatientStep1({
      first_name: firstName,
      last_name: lastName,
      father_name: fatherName,
      gender,
      national_code: nationalCode,
      age,
      marital_status: marriageStatus,
      head_household: headOfFamily?.value,
      number_dependents: numberOfMembers,
      education,
      job_status: jobStatus,
      housing_status: houseStatus,
      covered_organization: organ,
      phone_number: phoneNumber,
      landline_number: number,
    });
  };



const handleSignup = async () => {


  setError("");

  const errorMessage = validateForm();
  if (errorMessage) return setError(errorMessage);

  const payload = {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    father_name: fatherName,
    national_code: nationalCode,
    age: Number(age),

    gender: gender?.value,
    marital_status: marriageStatus?.value,
    head_household: headOfFamily?.value,
    number_dependents: Number(numberOfMembers),

    education: education?.value,
    job_status: jobStatus?.value,
    housing_status: houseStatus?.value,
    covered_organization: organ?.value,

    phone_number: phoneNumber,
    landline_number: number
  };

  try {

    await patientService.signupStep1(payload);

    saveStep("patient", "step1", payload);

    navigate("/authpatient2");

  } catch (err) {
    setError("خطا در ثبت اطلاعات");
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
                    عضویت بیماران در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات خود را برای ثبت‌نام وارد کنید
                  </p>
                </div>

                <div className="space-y-5 sm:space-y-7">
                  {/* signup page */}
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="relative">
                        <label
                          htmlFor="first_name"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
                        >
                          نام
                        </label>
                        <input
                          id="first_name"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="نام"
                          className="
            w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
            border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
            text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950 transition-all
          "
                        />
                      </div>
                      <div className="relative">
                        <label
                          htmlFor="last_name"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
                        >
                          نام خانوادگی
                        </label>
                        <input
                          id="last_name"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="نام خانوادگی"
                          className="
            w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
            border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
            text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950 transition-all
          "
                        />
                      </div>

                      {/* نام پدر */}
                      <div className="relative">
                        <label
                          htmlFor="father"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
                        >
                          نام پدر
                        </label>
                        <input
                          id="father"
                          type="text"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          placeholder="نام پدر را وارد کنید"
                          className="
            w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
            border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
            text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950 transition-all
          "
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
                          htmlFor="code"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
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
                          maxLength="10"
                          inputMode="numeric"
                          placeholder="کد ملی خود را وارد کنید"
                          className="
            w-full p-3 sm:p-4 bg-blue-50/50 text-blue-950 rounded-xl sm:rounded-2xl
            border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
            text-right placeholder-blue-400 text-sm sm:text-lg transition-all
          "
                        />
                      </div>

                      {/* سن */}
                      <div className="relative">
                        <label
                          htmlFor="age"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
                        >
                          سن
                        </label>
                        <input
                          id="age"
                          type="number"
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              setAge("");
                              return;
                            }
                            if (
                              /^\d{1,3}$/.test(v) &&
                              Number(v) >= 1 &&
                              Number(v) <= 120
                            ) {
                              setAge(v);
                            }
                          }}
                          placeholder="سن خود را وارد کنید"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950 transition-all"
                        />
                      </div>

                      {/* بقیه dropdown‌ها */}
                      <RenderDropdown
                        value={marriageStatus}
                        setValue={setMarriageStatus}
                        options={marriageOptions}
                        name="marriageStatus"
                        placeholder="وضعیت تاهل"
                        label="وضعیت تاهل"
                        loading={lookupsLoading}
                      />
                      <RenderDropdown
                        value={headOfFamily}
                        setValue={setHeadOfFamily}
                        options={headOptions}
                        name="headOfFamily"
                        placeholder="سرپرست خانواده"
                        label="سرپرست خانواده"
                      />

                      {/* تعداد افراد تحت تکفل */}
                      <div className="relative">
                        <label
                          htmlFor="members"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
                        >
                          تعداد افراد تحت تکفل
                        </label>
                        <input
                          id="members"
                          type="number"
                          value={numberOfMembers}
                          onChange={(e) =>
                            setNumberOfMembers(Math.max(0, e.target.value))
                          }
                          min="0"
                          inputMode="numeric"
                          placeholder="تعداد افراد تحت تکفل را وارد کنید"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg text-blue-950 transition-all"
                        />
                      </div>

                      <RenderDropdown
                        value={education}
                        setValue={setEducation}
                        options={educationLevels}
                        name="education"
                        placeholder="سطح تحصیلات"
                        label="سطح تحصیلات"
                        loading={lookupsLoading}
                      />
                      <RenderDropdown
                        value={jobStatus}
                        setValue={setJobStatus}
                        options={jobOptions}
                        name="jobStatus"
                        placeholder="وضعیت شغلی"
                        label="وضعیت شغلی"
                        loading={lookupsLoading}
                      />
                      <RenderDropdown
                        value={houseStatus}
                        setValue={setHouseStatus}
                        options={houseOptions}
                        name="houseStatus"
                        placeholder="وضعیت مسکن"
                        label="وضعیت مسکن"
                        loading={lookupsLoading}
                      />
                      <RenderDropdown
                        value={organ}
                        setValue={setOrgan}
                        options={organOptions}
                        name="organ"
                        placeholder="ارگان تحت پوشش"
                        label="ارگان تحت پوشش"
                        loading={lookupsLoading}
                      />

                      {/* تلفن همراه */}
                      <div className="relative">
                        <label
                          htmlFor="phone"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
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
                          placeholder="شماره تلفن همراه خود را وارد کنید"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 text-blue-950 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg transition-all"
                        />
                      </div>

                      {/* تلفن ثابت */}
                      <div className="relative">
                        <label
                          htmlFor="num"
                          className="block mb-2 text-sm sm:text-base text-blue-700"
                        >
                          تلفن ثابت
                        </label>
                        <input
                          id="num"
                          type="tel"
                          value={number}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^\d{0,11}$/.test(v)) setNumber(v);
                          }}
                          maxLength="11"
                          inputMode="numeric"
                          placeholder="شماره تلفن ثابت خود را وارد کنید"
                          className="w-full p-3 sm:p-4 bg-blue-50/50 text-blue-950 rounded-xl sm:rounded-2xl
          border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300
          text-right placeholder-blue-400 text-sm sm:text-lg transition-all"
                        />
                      </div>
                    </div>
                  </>

                  {/* ثبت نام */}
                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-3">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mt-3">
                      {success}
                    </div>
                  )}

                  <motion.button
                    onClick={handleSignup}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full py-3 sm:py-4 text-center bg-gradient-to-l from-blue-500 to-emerald-600
    text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    مرحله بعد
                  </motion.button>

                  <div className="text-center">
                    <Link
                      to="/loginpage"
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm sm:text-lg transition-colors duration-300 py-2 sm:py-3"
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

export default PatientSignup1;