import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, HeartHandshake, UserPlus } from "lucide-react";

export default function HomePatientActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [joinOpen, setJoinOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (location.hash === "#join-network") setJoinOpen(true);
    if (location.hash === "#patient-guide") setGuideOpen(true);
  }, [location.hash]);

  return (
    <section id="patient-actions" className="font-kook bg-gradient-to-l from-blue-50 to-emerald-50 py-10 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setJoinOpen(true)}
          className="bg-white rounded-2xl p-6 text-right shadow-sm border border-blue-100 hover:shadow-md transition"
        >
          <UserPlus className="text-blue-600 mb-3" />
          <h3 className="font-bold text-lg text-blue-900">پیوستن بیمار به شبکه</h3>
          <p className="text-sm text-gray-500 mt-2">ورود شخصی یا از طریق همیار شبکه</p>
        </button>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="bg-white rounded-2xl p-6 text-right shadow-sm border border-emerald-100 hover:shadow-md transition"
        >
          <BookOpen className="text-emerald-600 mb-3" />
          <h3 className="font-bold text-lg text-emerald-900">راهنمای بیمار</h3>
          <p className="text-sm text-gray-500 mt-2">برنامه پزشکان، عضویت و پرسش از مشاور شبکه</p>
        </button>
        <Link
          to="/campaigns"
          className="bg-white rounded-2xl p-6 text-right shadow-sm border border-rose-100 hover:shadow-md transition"
        >
          <HeartHandshake className="text-rose-600 mb-3" />
          <h3 className="font-bold text-lg text-rose-900">حامی باش</h3>
          <p className="text-sm text-gray-500 mt-2">انتقال به فراخوان‌ها و نیازمندی‌ها</p>
        </Link>
      </div>

      {joinOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4" onClick={() => setJoinOpen(false)}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-xl mb-3">ورود بیمار به شبکه</h3>
            <p className="text-sm text-gray-600 mb-5">ورود شخصی هستید یا از طریق همیار شبکه؟</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/loginpage?intent=patient")}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold"
              >
                ورود شخصی
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/contact?intent=join_helper&subject=پیوستن از طریق همیار شبکه"
                  )
                }
                className="w-full py-3 rounded-xl border border-blue-200 text-blue-800 font-bold"
              >
                از طریق همیار شبکه
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {guideOpen && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4" onClick={() => setGuideOpen(false)}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full text-right space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-xl">راهنمای بیمار</h3>
            <p className="text-sm text-gray-700 leading-7">
              برای مشاهده حضور پزشکان مراکز درمانی شهر کرمان، روی گزینه «برنامه حضور پزشکان مراکز درمانی شهر کرمان» کلیک نمایید.
              اگر در شبکه عضو نیستید، برای دریافت حمایت روی گزینه «پیوستن بیمار به شبکه» کلیک نمایید.
              برای سوال در مورد سیر درمان، مرکز درمانی مناسب و حمایت، سوال خود را در فرم ارتباط با ما درج نمایید؛
              این سوال توسط یک سلامتیار (یا همیار) با نقش مشاور شبکه جواب داده می‌شود و به‌طور مختصر به بیمار پیامک هم می‌شود.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate("/contact?intent=patient_guide&subject=سوال راهنمای بیمار")
              }
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold"
            >
              ثبت سوال در فرم ارتباط با ما
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
