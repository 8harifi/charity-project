import { motion } from "framer-motion";
import { Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardShell({
  profile,
  stats,
  tabs,
  activeTab,
  onTabChange,
  children,
  approvalPending,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/loginpage");
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0] font-kook pt-[80px] pb-[40px]">
      <div className="container mx-auto px-4 lg:px-24">
        {approvalPending && (
          <div className="mb-4 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 text-sm text-right">
            حساب شما در انتظار تایید مدیر است. برخی امکانات محدود هستند.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-900 to-emerald-700 rounded-2xl p-5 sm:p-8 mb-8 text-white"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <img
                src={profile?.avatar}
                alt="profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="text-center sm:text-right">
                <h1 className="text-xl sm:text-3xl font-bold mb-1">
                  سلام، {profile?.name}
                </h1>
                <p className="text-blue-100 text-sm">
                  عضو از تاریخ: {profile?.memberSince || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition text-sm font-semibold"
              >
                <Home size={18} />
                صفحه اصلی
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition text-sm font-semibold"
              >
                <LogOut size={18} />
                خروج
              </button>
            </div>
          </div>

          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 text-center mt-6 pt-6 border-t border-white/20">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
                  <p className="text-blue-100 text-xs sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden"
        >
          <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 whitespace-nowrap font-semibold transition-all text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-900 to-emerald-700 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {Icon && <Icon size={18} />}
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
