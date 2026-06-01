import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SignupSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const username = useMemo(() => {
    const fromState = location.state?.username;
    if (fromState) return String(fromState).trim();
    const stored = sessionStorage.getItem("signupSuccessUsername");
    return stored ? stored.trim() : "";
  }, [location.state]);

  useEffect(() => {
    if (location.state?.username) {
      sessionStorage.setItem(
        "signupSuccessUsername",
        String(location.state.username).trim()
      );
    }
    if (!username) {
      navigate("/signuprole", { replace: true });
    }
  }, [location.state, username, navigate]);

  if (!username) {
    return null;
  }

  return (
    <div className="font-kook min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center border border-blue-100"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-blue-900 mb-4">
          ثبت‌نام با موفقیت انجام شد
        </h1>

        <p className="text-gray-600 leading-8 mb-8">
          ثبت‌نام شما با موفقیت انجام شد. پس از تأیید توسط ادمین، یک پیامک برای
          شما ارسال می‌شود. سپس می‌توانید با نام کاربری{" "}
          <span className="font-bold text-blue-700">{username}</span> و رمز عبوری
          که انتخاب کرده‌اید وارد سامانه شوید.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            صفحه اصلی
          </Link>

          <Link
            to="/loginpage"
            className="px-6 py-3 rounded-xl bg-gradient-to-l from-blue-500 to-emerald-600 text-white font-semibold shadow-md"
          >
            صفحه ورود
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupSuccess;
