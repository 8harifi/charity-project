import {jwtDecode} from "jwt-decode";
import React, {useState, useEffect} from "react";

import {motion, AnimatePresence} from "framer-motion";
import {Heart, HandHeart, Users, Sparkles, Phone} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

const LoginPage = () => {
  const [userName, setUserName] = useState("");

  const [password, setPassword] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [timer, setTimer] = useState(0);

  // تایمر شمارش معکوس کد تایید
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const {login, error: authError} = useAuth();
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
    if (forgotPassword) {
      if (!isValidPhoneNumber(phoneNumber)) {
        return "شماره تلفن همراه معتبر نیست";
      }
      return "";
    }

    if (!password || !userName) {
      return "لطفاً تمام بخش‌های فرم را تکمیل کنید.";
    }

    // if (password.length < 8) {
    //   return "رمز عبور باید حداقل ۸ کاراکتر باشد";
    // }

    return "";
  };

  const isValidPhoneNumber = (phone) => {
    return /^09\d{9}$/.test(phone);
  };

  const handleForget = async () => {
    setError("");

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("شماره تلفن همراه معتبر نیست");
      return;
    }

    setSuccess("کد تایید ارسال شد");
    setTimer(120); // شروع تایمر ۲ دقیقه‌ای
  };

  const handleVerifyCode = () => {
    setError("");

    if (!confirmCode) {
      setError("لطفاً کد تایید را وارد کنید");
      return;
    }

    if (!/^\d{5,6}$/.test(confirmCode)) {
      setError("کد تایید باید ۵ یا ۶ رقم عددی باشد");
      return;
    }

    // اینجا بعداً به API واقعی وصل می‌کنی
    setSuccess("کد تایید شد! در حال انتقال...");

    setTimeout(() => {
      setForgotPassword(false);
      setSuccess("");
      setConfirmCode("");
      navigate("/");
    }, 1000);
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    const errorMessage = validateForm();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const result = await login({
      username: userName.trim() || phoneNumber,
      password,
    });

    if (result.success) {
      const {access} = result;   // ✅ get token

      // ✅ decode token
      const decoded = jwtDecode(access);

      const role = decoded.role;   // ✅ extract role from payload
      console.log(role)

      const roleRoutes = {
        doctor: "/doctor/dashboard",
        patient: "/patient/dashboard",
        benefactor: "/charitable/dashboard",
        health_assistant: "/salamatyar/dashboard",
        service_center: "/loginpage",
        charity_center: "/loginpage",
        social_work_unit: "/loginpage",
        admin: "/admin/dashboard",
      };

      const target = roleRoutes[role] || "/dashboard";

      setSuccess("ورود با موفقیت انجام شد");

      setTimeout(() => {
        navigate(target);
      }, 700);
    } else {
      setError(result.error);
    }
  };

  const isValidNationalCode = (code) => {
    if (!/^\d{10}$/.test(code)) return false;

    const digits = code.split("").map(Number);
    const check = digits[9];
    const sum =
      digits[0] * 10 +
      digits[1] * 9 +
      digits[2] * 8 +
      digits[3] * 7 +
      digits[4] * 6 +
      digits[5] * 5 +
      digits[6] * 4 +
      digits[7] * 3 +
      digits[8] * 2;

    const remainder = sum % 11;

    return (
      (remainder < 2 && check === remainder) ||
      (remainder >= 2 && check === 11 - remainder)
    );
  };

  return (
    <motion.div
      className="font-kook min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
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
                به شبکه خیرخواهانه سلامت خوش آمدید. با ورود به حساب کاربری، در
                کمک به بیماران نیازمند سهیم شوید.
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
            {/* forgetpassword */}
            {forgotPassword ? (
                <motion.div
                  key="forgot"
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="h-full flex flex-col justify-center"
                >
                  {/* Title */}
                  <div className="mb-8 sm:mb-10 text-right">
                    <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 mb-2 sm:mb-3">
                      بازیابی رمز عبور
                    </h1>
                    <p className="text-blue-600 text-sm sm:text-lg">
                      شماره تلفن همراه خود را وارد کنید تا رمز برای شما ارسال شود
                    </p>
                  </div>

                  <div className="space-y-5 sm:space-y-6">

                    {/* Phone Input */}
                    <div className="relative">
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012 4.18 2 2 0 014 2h3a2 2 0 012 1.72 12.65 12.65 0 00.7 2.81 2 2 0 01-.45 2.11L8.1 9.9a16 16 0 006 6l1.26-1.15a2 2 0 012.11-.45 12.65 12.65 0 002.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                      </div>

                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d{0,11}$/.test(v)) setPhoneNumber(v);
                        }}
                        maxLength="11"
                        inputMode="numeric"
                        placeholder="شماره تلفن همراه خود را وارد کنید"
                        className="
            w-full p-3 sm:p-4 pr-10 sm:pr-12
            bg-blue-50/50 rounded-xl sm:rounded-2xl
            border border-blue-200
            focus:outline-none focus:ring-2 focus:ring-blue-300
            text-right placeholder-blue-400
            text-sm sm:text-lg transition-all
          "
                      />
                    </div>

                    {/* Alerts */}
                    <div className="flex flex-col space-y-4 sm:space-y-5">

                      {/* error */}
                      {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm sm:text-base">
                          {error}
                        </div>
                      )}

                      {/* success */}
                      {success && (
                        <motion.div
                          initial={{opacity: 0, y: -15}}
                          animate={{opacity: 1, y: 0}}
                          transition={{duration: 0.6, ease: "easeOut"}}
                        >
                          <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm sm:text-base mb-3">
                            {success}
                          </div>

                          {/* Code Input */}
                          <div className="relative">
                            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
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

                            <input
                              type="password"
                              value={confirmCode}
                              onChange={(e) => setConfirmCode(e.target.value)}
                              placeholder="کد را وارد کنید"
                              className="
                  w-full p-3 sm:p-4 pr-10 sm:pr-12
                  bg-blue-50/50 rounded-xl sm:rounded-2xl
                  border border-blue-200
                  focus:outline-none focus:ring-2 focus:ring-blue-300
                  text-right placeholder-blue-400
                  text-sm sm:text-lg transition-all
                "
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Send Code Button */}
                      <motion.button
                        onClick={handleForget}
                        whileHover={{scale: 1.02}}
                        whileTap={{scale: 0.98}}
                        disabled={timer > 0 && !success.includes("کد تایید شد")}
                        className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold 
            text-sm sm:text-lg shadow-lg transition-all duration-300
            ${
                          timer > 0
                            ? "bg-gradient-to-l from-blue-600 to-blue-800 cursor-not-allowed text-white"
                            : "bg-gradient-to-l from-blue-500 to-emerald-600 text-white"
                        }
          `}
                      >
                        {!success
                          ? "ارسال کد"
                          : timer > 0
                            ? `ارسال مجدد کد (${timer})`
                            : "ارسال مجدد کد"}
                      </motion.button>

                      {/* Verify Code Button */}
                      {success && (
                        <motion.button
                          onClick={handleVerifyCode}
                          whileHover={{scale: 1.02}}
                          whileTap={{scale: 0.98}}
                          className="
              w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold
              text-sm sm:text-lg shadow-lg bg-gradient-to-l 
              from-emerald-500 to-green-600 text-white
            "
                        >
                          تایید کد
                        </motion.button>
                      )}

                      {/* Back Button */}
                      <button
                        onClick={() => {
                          setForgotPassword(false);
                          setError("");
                          setSuccess("");
                        }}
                        className="
            text-blue-600 hover:text-blue-800 
            font-bold text-sm sm:text-lg transition-colors duration-300 
            py-2 sm:py-3 text-center
          "
                      >
                        بازگشت به صفحه ورود
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) :
              (
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
                      ورود به حساب کاربری
                    </h1>
                    <p className="text-blue-600 text-right text-lg">
                      لطفا اطلاعات خود را وارد کنید
                    </p>
                  </div>

                  <div className="space-y-7">
                    {/* login page */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* username */}
                      <div className="relative sm:col-span-2">
                        <div className="absolute right-3 sm:right-4 top-[68%] -translate-y-1/2">
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
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
        w-full p-3 sm:p-4 pr-10 sm:pr-12 mt-1
        bg-blue-50/50 rounded-xl sm:rounded-2xl
        border border-blue-200
        focus:outline-none focus:ring-2 focus:ring-blue-300
        text-sm sm:text-base placeholder-blue-400 text-right
      "
                        />
                      </div>

                      {/* password */}
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
                          رمز عبور
                        </label>

                        <input
                          type="password"
                          value={password}
                          minLength={8}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="رمز عبور خود را وارد کنید"
                          className="
        w-full p-3 sm:p-4 pr-10 sm:pr-12 mt-1
        bg-blue-50/50 rounded-xl sm:rounded-2xl
        border border-blue-200
        focus:outline-none focus:ring-2 focus:ring-blue-300
        text-sm sm:text-base placeholder-blue-400 text-right
      "
                        />
                      </div>

                      {/* Remember Me + Forgot */}
                      <div
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 sm:mt-6 col-span-1 sm:col-span-2 gap-3">
                        <label className="flex items-center gap-2 text-blue-700 text-sm sm:text-base cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          مرا به خاطر بسپار
                        </label>

                        <button
                          onClick={() => {
                            setForgotPassword(true);
                            setError("");
                            setSuccess("");
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold text-sm sm:text-base transition-colors"
                        >
                          فراموشی رمز عبور؟
                        </button>
                      </div>
                    </div>

                    {/* Errors */}
                    {error && (
                      <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-3">
                        {error}
                      </div>
                    )}

                    {authError && (
                      <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-3">
                        {authError}
                      </div>
                    )}

                    {success && (
                      <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mt-3">
                        {success}
                      </div>
                    )}

                    {/* button */}
                    <motion.button
                      onClick={handleLogin}
                      whileHover={{scale: 1.02}}
                      whileTap={{scale: 0.98}}
                      className="
    w-full py-3 sm:py-4 mt-3
    bg-gradient-to-l from-blue-500 to-emerald-600
    text-white rounded-xl sm:rounded-2xl
    font-bold text-sm sm:text-base md:text-lg
    shadow-lg hover:shadow-xl transition-all duration-300
  "
                    >
                      ورود به حساب کاربری
                    </motion.button>

                    <div className="text-center mt-3">
                      <Link
                        to="/signuprole"
                        className="
      text-blue-600 hover:text-blue-800
      font-bold text-sm sm:text-base md:text-lg
      transition-colors duration-300
    "
                      >
                        حساب کاربری ندارید؟ ثبت نام کنید
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
