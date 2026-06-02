import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loadRoleDraft, clearRoleDraft } from "./utils/signupStorage";
import { submitRoleRegistration } from "../../API/registrationApi";
import { validateDraftForRole } from "./utils/signupValidation";

const LastSignup = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const originForm =
    location.state?.originForm || localStorage.getItem("signupRole");

  useEffect(() => {
    if (location.state?.originForm) {
      localStorage.setItem("signupRole", location.state.originForm);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.4 },
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
    if (!success) return;

    const username = userName.trim();
    sessionStorage.setItem("signupSuccessUsername", username);

    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        navigate("/authpatientFinal", {
          state: { username },
          replace: true,
        });
      }, 500);
    }, 1200);

    return () => clearTimeout(timer);
  }, [success, navigate, userName]);

  const validateForm = () => {
    if (!userName || !password || !confirmPassword) {
      return "لطفاً تمام بخش‌های فرم را تکمیل کنید.";
    }

    if (password.length < 8) {
      return "رمز عبور باید حداقل ۸ کاراکتر باشد";
    }

    if (password !== confirmPassword) {
      return "رمز عبور و تکرار آن یکسان نیستند";
    }

    if (!originForm) {
      return "فرم قبلی مشخص نیست.";
    }

    const draft = loadRoleDraft(originForm);
    const draftError = validateDraftForRole(originForm, draft);
    if (draftError) {
      return `اطلاعات مراحل قبل ناقص است: ${draftError}`;
    }

    return "";
  };
  const handleSignup = async () => {
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSignupLoading(true);

    const draft = originForm ? loadRoleDraft(originForm) : {};


    try {
      await submitRoleRegistration(originForm, {
        username: userName,
        password,
        draft,
      });
      const draftRole =
        originForm === "SalamtyaranSignup" ? "salamtyaran" : originForm;
      clearRoleDraft(draftRole);
      sessionStorage.setItem("signupSuccessUsername", userName.trim());
      setSuccess("ثبت‌نام با موفقیت انجام شد");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string"
          ? err.response.data
          : JSON.stringify(err?.response?.data || {})) ||
        err?.message ||
        "خطا در ارتباط با سرور";
      setError(msg);
    } finally {
      setSignupLoading(false);
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
                به خانواده بزرگ خیرین بپیوندید. با ثبت‌نام، بخشی از شبکه
                نیکوکاری سلامت باشید.
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
                    عضویت در شبکه
                  </h1>
                  <p className="text-blue-600 text-right text-lg">
                    اطلاعات خود را برای ثبت‌نام وارد کنید
                  </p>
                </div>
                <div className="space-y-5 sm:space-y-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* username */}
                    <div className="relative">
                      <div className="absolute right-3 sm:right-4 top-[68%] -translate-y-1/2">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>

                      <label
                        htmlFor="uname"
                        className="block mb-2 text-sm sm:text-base text-blue-700"
                      >
                        نام کاربری
                      </label>

                      <input
                        id="uname"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="نام کاربری خود را وارد کنید"
                        className="
          w-full p-3 sm:p-4 pr-10 sm:pr-12
          bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200
          focus:outline-none focus:ring-2 focus:ring-blue-300
          text-sm sm:text-base
          placeholder-blue-400 text-right
        "
                      />
                    </div>

                    {/* password */}
                    <div className="relative">
                      <div className="absolute right-3 sm:right-4 top-[68%] -translate-y-1/2">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>

                      <label className="block mb-2 text-sm sm:text-base text-blue-700">
                        رمز عبور
                      </label>

                      <input
                        type="password"
                        value={password}
                        minLength={8}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور خود را وارد کنید"
                        className="
          w-full p-3 sm:p-4 pr-10 sm:pr-12
          bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200
          focus:outline-none focus:ring-2 focus:ring-blue-300
          text-sm sm:text-base
          placeholder-blue-400 text-right
        "
                      />
                    </div>

                    {/* confirm password */}
                    <div className="relative sm:col-span-2">
                      <div className="absolute right-3 sm:right-4 top-[68%] -translate-y-1/2">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>

                      <label className="block mb-2 text-sm sm:text-base text-blue-700">
                        تکرار رمز عبور
                      </label>

                      <input
                        type="password"
                        value={confirmPassword}
                        minLength={8}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="تکرار رمز عبور"
                        className="
          w-full p-3 sm:p-4 pr-10 sm:pr-12
          bg-blue-50/50 rounded-xl sm:rounded-2xl
          border border-blue-200
          focus:outline-none focus:ring-2 focus:ring-blue-300
          text-sm sm:text-base
          placeholder-blue-400 text-right
        "
                      />
                    </div>
                  </div>

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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={signupLoading}
                    className="
      w-full py-3 sm:py-4
      bg-gradient-to-l from-blue-500 to-emerald-600
      text-white rounded-xl sm:rounded-2xl
      font-bold text-sm sm:text-base md:text-lg
      shadow-lg hover:shadow-xl
      transition-all duration-300
    "
                  >
                    {signupLoading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
                  </motion.button>

                  <div className="text-center flex justify-between">
                    <Link
                      to="/loginpage"
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm sm:text-base md:text-lg transition-colors duration-300"
                    >
                      قبلا ثبت نام کرده‌اید؟ وارد شوید
                    </Link>
                    <button
                      onClick={() =>
                        navigate(location.state?.previousStep || "/")
                      }
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm sm:text-lg py-2"
                    >
                      بازگشت به مرحله قبل
                    </button>
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

export default LastSignup;
