// AdminDashboard.jsx - با بخش بالایی آبی
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  List,
  Database,
  Shield,
  Megaphone,
  Wallet,
  Clock,
  Bell,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Activity,
  DollarSign,
  ArrowUpRight,
  Download,
  RefreshCw,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  Calendar,
  UserCheck,
  HandHeart,
} from "lucide-react";
import { adminService, ROLE_LABELS } from "../Services/adminService";
import { profileService } from "../Services/dashboardApi";

// ============================================
// 0. استایل کلی با فونت Kook
// ============================================
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap');
  
  * {
    font-family: 'Vazirmatn', 'Tahoma', sans-serif !important;
  }
  
  body {
    font-family: 'Vazirmatn', 'Tahoma', sans-serif !important;
    background-color: #f8fafc;
  }
  
  .text-xs { font-size: 0.8rem !important; }
  .text-sm { font-size: 0.95rem !important; }
  .text-base { font-size: 1.05rem !important; }
  .text-lg { font-size: 1.2rem !important; }
  .text-xl { font-size: 1.4rem !important; }
  .text-2xl { font-size: 1.6rem !important; }
  
  .font-medium { font-weight: 600 !important; }
  .font-semibold { font-weight: 700 !important; }
  .font-bold { font-weight: 800 !important; }
  
  .sidebar-fix {
    direction: rtl;
    right: 0;
    left: auto;
    position: fixed !important;
    height: 100vh !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .sidebar-fix .sidebar-scroll {
    flex: 1 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    height: 100% !important;
    min-height: 0 !important;
    scroll-behavior: smooth !important;
  }
  
  .sidebar-fix .sidebar-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar-fix .sidebar-scroll::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
  }
  .sidebar-fix .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.25);
    border-radius: 10px;
  }
  
  .sidebar-fix .sidebar-bottom {
    flex-shrink: 0 !important;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  
  .sidebar-collapsed .sidebar-scroll {
    overflow-y: auto !important;
  }
  
  .sidebar-collapsed .sidebar-scroll::-webkit-scrollbar {
    width: 2px;
  }
  
  .sidebar-collapsed .nav-item {
    padding: 0.75rem !important;
    justify-content: center !important;
  }
  
  .sidebar-collapsed .nav-item svg {
    margin: 0 !important;
  }
  
  .main-content {
    transition: margin-right 0.3s ease-in-out !important;
  }
  
  .blue-welcome {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
    position: relative;
    overflow: hidden;
  }
  
  .blue-welcome::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 70%);
    animation: shimmer 8s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-10%, -10%) rotate(5deg); }
  }
  
  .blue-welcome * {
    position: relative;
    z-index: 1;
  }
`;

// ============================================
// 1. Sidebar Navigation
// ============================================
const Sidebar = ({ activeTab, onTabChange, profile, isMobile, onClose, isCollapsed, toggleCollapse }) => {
  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "users", label: "کاربران", icon: Users },
    { id: "requests", label: "درخواست‌ها", icon: List },
    { id: "campaigns", label: "کمپین‌ها", icon: Megaphone },
    { id: "wallet", label: "کیف پول", icon: Wallet },
    { id: "lookups", label: "داده‌های پایه", icon: Database },
    { id: "profile", label: "حساب مدیر", icon: Shield },
  ];

  return (
    <>
      <style>{globalStyle}</style>
      
      {isMobile && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}></div>
      )}

      <div 
        className={`sidebar-fix ${
          isMobile 
            ? 'w-80' 
            : isCollapsed 
              ? 'w-20' 
              : 'w-72'
        } ${isMobile && !onClose ? 'translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
        style={{ 
          direction: 'rtl',
          zIndex: 50,
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
        }}
      >
        <div className={`p-4 border-b border-indigo-700/50 flex items-center flex-shrink-0 ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
          {(!isCollapsed || isMobile) && (
            <div className="rtl-text">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">مهرسان</h1>
              <p className="text-indigo-300 text-sm">سامانه مدیریت</p>
            </div>
          )}
          {isCollapsed && !isMobile && (
            <div className="w-10 h-10 rounded-xl bg-indigo-700/50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">م</span>
            </div>
          )}
          {isMobile && (
            <button onClick={onClose} className="p-2 hover:bg-indigo-700 rounded-xl transition flex-shrink-0">
              <X size={22} />
            </button>
          )}
        </div>

        {profile && (!isCollapsed || isMobile) && (
          <div className="p-3 mx-3 my-2 bg-indigo-800/30 rounded-xl border border-indigo-700/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img src={profile.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-indigo-400 flex-shrink-0" />
              <div className="flex-1 min-w-0 rtl-text">
                <p className="font-semibold text-base truncate">{profile.name}</p>
                <p className="text-indigo-300 text-sm truncate">{profile.username}</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        )}

        {profile && isCollapsed && !isMobile && (
          <div className="p-3 flex justify-center flex-shrink-0">
            <div className="relative">
              <img src={profile.avatar} alt="avatar" className="w-11 h-11 rounded-full border-2 border-indigo-400" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-900"></div>
            </div>
          </div>
        )}

        <nav className={`sidebar-scroll ${isCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
          {(!isCollapsed || isMobile) && (
            <p className="text-indigo-400 text-sm px-4 pt-2 pb-2 flex-shrink-0">منوی اصلی</p>
          )}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-base ${
                  isActive
                    ? "bg-indigo-600/50 text-white shadow-lg shadow-indigo-600/20"
                    : "text-indigo-200 hover:bg-indigo-700/30 hover:text-white"
                } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                title={isCollapsed && !isMobile ? tab.label : ''}
                style={{ minHeight: '48px' }}
              >
                <Icon size={22} className={`flex-shrink-0 ${isActive ? "text-blue-400" : "text-indigo-300"}`} />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="flex-1 text-right font-medium truncate">{tab.label}</span>
                    {isActive && <div className="w-1 h-7 bg-blue-400 rounded-full flex-shrink-0"></div>}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className={`sidebar-bottom p-3 ${isCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-700/30 rounded-xl transition text-base ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
            <Settings size={20} className="flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>تنظیمات</span>}
          </button>
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-300 hover:bg-red-500/20 rounded-xl transition text-base mt-1 ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
            <LogOut size={20} className="flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>خروج</span>}
          </button>

          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-indigo-300 hover:bg-indigo-700/30 rounded-xl transition text-sm"
            >
              {isCollapsed ? <ChevronRight size={20} className="flex-shrink-0" /> : <ChevronLeft size={20} className="flex-shrink-0" />}
              {!isCollapsed && <span className="font-medium">جمع کردن</span>}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// ============================================
// 2. Header / Top Bar - با border آبی
// ============================================
const Header = ({ profile, stats, onMenuClick, onRefresh, isCollapsed, toggleCollapse }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header 
      className="bg-white sticky top-0 z-40" 
      style={{ 
        direction: 'rtl',
        boxShadow: '0 2px 12px rgba(37, 99, 235, 0.15)'
      }}
    >
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleCollapse} 
            className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
          >
            {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
          
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition">
            <Menu size={24} className="text-gray-600" />
          </button>
          
          <div className="hidden md:flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Search size={20} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="جستجو در کاربران، درخواست‌ها، ..." 
              className="bg-transparent outline-none text-base pr-3 w-56 text-gray-700 font-medium" 
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {stats && stats.slice(0, 3).map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              <p className="text-lg font-bold text-gray-700">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-xl transition relative">
              <Bell size={22} className="text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-base">اعلانات</span>
                  <button className="text-sm text-blue-600 hover:underline font-medium">مشاهده همه</button>
                </div>
                <div className="px-4 py-4 text-gray-400 text-base text-center">هیچ اعلان جدیدی وجود ندارد.</div>
              </div>
            )}
          </div>

          {profile && (
            <div className="flex items-center gap-3 pr-3 border-r border-gray-200">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-700">{profile.name}</p>
                <p className="text-sm text-gray-400">{profile.username}</p>
              </div>
              <img src={profile.avatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-gray-200" />
            </div>
          )}

          <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

// ============================================
// 3. Dashboard Overview - اصلاح شده با نمایش همیشگی نمودار
// ============================================
const DashboardOverview = ({ cards, chartData, pendingRequests, stats, onTabChange }) => {
  const [timeFrame, setTimeFrame] = useState("month");

  const getCardStyle = (label) => {
    const styles = {
      "بیماران": { bg: "bg-blue-50", icon: "text-blue-600" },
      "پزشکان": { bg: "bg-emerald-50", icon: "text-emerald-600" },
      "سلامتیاران": { bg: "bg-purple-50", icon: "text-purple-600" },
      "خیرین": { bg: "bg-amber-50", icon: "text-amber-600" },
      "کاربران فعال": { bg: "bg-cyan-50", icon: "text-cyan-600" },
      "کل کمک‌ها": { bg: "bg-rose-50", icon: "text-rose-600" },
      "کمپین‌های فعال": { bg: "bg-indigo-50", icon: "text-indigo-600" },
    };
    return styles[label] || { bg: "bg-gray-50", icon: "text-gray-600" };
  };

  const getIcon = (label) => {
    const icons = {
      "بیماران": Users,
      "پزشکان": Activity,
      "سلامتیاران": Shield,
      "خیرین": DollarSign,
      "کاربران فعال": UserPlus,
      "کل کمک‌ها": Wallet,
      "کمپین‌های فعال": Megaphone,
    };
    return icons[label] || LayoutDashboard;
  };

  // محاسبه توزیع کاربران - حتی اگر همه صفر باشند نمایش داده می‌شود
  const roleCards = [
    { label: "بیماران", value: cards?.find(c => c.label === "بیماران")?.value || 0 },
    { label: "پزشکان", value: cards?.find(c => c.label === "پزشکان")?.value || 0 },
    { label: "سلامتیاران", value: cards?.find(c => c.label === "سلامتیاران")?.value || 0 },
    { label: "خیرین", value: cards?.find(c => c.label === "خیرین")?.value || 0 },
  ];

  const total = roleCards.reduce((sum, c) => sum + Number(c.value), 0) || 1; // اگر total صفر بود از 1 استفاده می‌کنیم تا تقسیم بر صفر نشود
  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div className="space-y-6" style={{ direction: 'rtl' }}>
      {/* Welcome Header - بخش آبی */}
      <div className="blue-welcome rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-200/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <TrendingUp size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">خوش آمدید</h2>
              <p className="text-blue-100 text-base mt-1">
                وضعیت کل پلتفرم پایدار است. رشد کاربران این ماه <span className="font-bold text-yellow-300">۲۱.۲٪</span> نسبت به ماه قبل افزایش داشته.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => onTabChange && onTabChange("campaigns")}
              className="bg-white text-blue-700 px-6 py-3 rounded-xl text-base font-bold hover:bg-blue-50 transition shadow-lg shadow-blue-900/30 flex items-center gap-2"
            >
              <Megaphone size={20} /> ایجاد کمپین
            </button>
            <button 
              onClick={() => onTabChange && onTabChange("requests")}
              className="bg-blue-500/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-base font-bold border border-white/30 hover:bg-blue-500/40 transition flex items-center gap-2"
            >
              <List size={20} /> بررسی درخواست‌ها
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards && cards.length > 0 ? (
          cards.map((card, index) => {
            const Icon = getIcon(card.label);
            const style = getCardStyle(card.label);
            return (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 font-medium">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${style.bg}`}>
                    <Icon size={22} className={style.icon} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-green-600 text-sm flex items-center gap-1 font-medium">
                    <ArrowUpRight size={14} /> {card.growth || "۰"}%
                  </span>
                  <span className="text-gray-400 text-sm">نسبت به ماه قبل</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400 text-base">
            داده‌ای برای نمایش وجود ندارد
          </div>
        )}
      </div>

      {/* Charts - همیشه نمایش داده می‌شود */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* نمودار روند ۸ ماه اخیر */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-700">روند ۸ ماه اخیر</h3>
              <p className="text-sm text-gray-400">رشد کاربران و کمک‌ها</p>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-xl">
              <MoreVertical size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="h-40 flex items-end gap-2">
            {chartData && chartData.length > 0 ? (
              chartData.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-blue-400 rounded-sm transition-all duration-300"
                    style={{ height: `${Math.max(item.percent || 0, 5)}%` }}
                  ></div>
                  <span className="text-sm text-gray-400 font-medium">{item.label}</span>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-gray-400 text-sm py-8">
                داده‌ای برای نمایش وجود ندارد
              </div>
            )}
          </div>
        </div>

        {/* نمودار توزیع کاربران - همیشه نمایش داده می‌شود */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-700">توزیع کاربران</h3>
              <p className="text-sm text-gray-400">بر اساس نقش</p>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-xl">
              <MoreVertical size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="space-y-3">
            {roleCards.map((item, i) => {
              const percent = total > 0 ? ((Number(item.value) / total) * 100).toFixed(0) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="font-bold text-gray-700">{Number(item.value).toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.max(percent, 0)}%`, 
                        backgroundColor: colors[i % colors.length] 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {total === 1 && roleCards.every(c => Number(c.value) === 0) && (
              <div className="text-center text-gray-400 text-sm py-4">
                هیچ کاربری ثبت نشده است
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 4. Admin Users Panel
// ============================================
const AdminUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [userDetail, setUserDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const roles = ["همه", "patient", "doctor", "health_assistant", "benefactor"];

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRole !== "all") params.role = filterRole;
      const response = await adminService.listUsers(params);
      setUsers(response.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleViewUser = async (userId) => {
    try {
      const response = await adminService.getUser(userId);
      setUserDetail(response.data);
      setShowDetail(true);
    } catch {
      console.error("Error loading user details");
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminService.approveUser(userId);
      loadUsers();
    } catch {
      console.error("Error approving user");
    }
  };

  const handleRejectUser = async (userId) => {
    if (!window.confirm("آیا از غیرفعال کردن این کاربر مطمئن هستید؟")) return;
    try {
      await adminService.rejectUser(userId);
      loadUsers();
    } catch {
      console.error("Error rejecting user");
    }
  };

  const getStatusBadge = (user) => {
    if (!user.state) {
      return <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">در انتظار</span>;
    }
    if (user.is_active === false) {
      return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium">غیرفعال</span>;
    }
    return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">فعال</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ direction: 'rtl' }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h2>
          <p className="text-base text-gray-400">مدیریت و مشاهده تمام کاربران پلتفرم</p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-base font-bold hover:bg-blue-700 transition flex items-center gap-2">
          <UserPlus size={20} /> افزودن کاربر
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجوی کاربر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3.5 py-1.5 rounded-lg text-sm transition ${
                filterRole === r
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {r === "همه" ? "همه" : ROLE_LABELS[r] || r}
            </button>
          ))}
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
          <Download size={18} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right p-4 text-sm font-bold text-gray-500">نام</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">نقش</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">شماره تماس</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">وضعیت</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400 text-base">کاربری یافت نشد.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 text-base text-gray-700 font-bold">{user.display_name || user.first_name || "کاربر"}</td>
                    <td className="p-4 text-base text-gray-500 font-medium">{ROLE_LABELS[user.role] || user.role}</td>
                    <td className="p-4 text-base text-gray-500 font-medium">{user.phone || user.username}</td>
                    <td className="p-4">{getStatusBadge(user)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleViewUser(user.id)} className="p-1.5 hover:bg-blue-50 rounded-xl text-blue-600 transition">
                          <Eye size={18} />
                        </button>
                        {!user.state && (
                          <button onClick={() => handleApproveUser(user.id)} className="p-1.5 hover:bg-green-50 rounded-xl text-green-600 transition">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => handleRejectUser(user.id)} className="p-1.5 hover:bg-red-50 rounded-xl text-red-600 transition">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetail && userDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-800">
                {userDetail.display_name || userDetail.first_name || "کاربر"} — {ROLE_LABELS[userDetail.role] || userDetail.role}
              </h3>
              <button onClick={() => setShowDetail(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl">
                <X size={22} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              <div className="space-y-3 text-base">
                <p><span className="text-gray-400 font-medium">شماره تماس:</span> <span className="font-bold">{userDetail.phone || userDetail.username}</span></p>
                <p><span className="text-gray-400 font-medium">وضعیت:</span> {getStatusBadge(userDetail)}</p>
                {userDetail.profile && Object.entries(userDetail.profile).slice(0, 5).map(([key, value]) => (
                  <p key={key}><span className="text-gray-400 font-medium">{key}:</span> {value || "—"}</p>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setShowDetail(false)} className="w-full py-2.5 bg-gray-50 rounded-xl text-base text-gray-600 hover:bg-gray-100 transition font-medium">بستن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 5. Request List Panel
// ============================================
const RequestListPanel = ({ title, showFilters }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const statuses = ["همه", "pending", "approved", "rejected", "completed"];

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      const response = await adminService.listRequests(params);
      setRequests(response.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(loadRequests, 300);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700",
      approved: "bg-green-50 text-green-700",
      rejected: "bg-red-50 text-red-700",
      completed: "bg-blue-50 text-blue-700",
    };
    return styles[status] || "bg-gray-50 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const labels = { pending: "در انتظار", approved: "تایید شده", rejected: "رد شده", completed: "تکمیل شده" };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ direction: 'rtl' }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title || "درخواست‌ها"}</h2>
          <p className="text-base text-gray-400">مدیریت و بررسی درخواست‌های کاربران</p>
        </div>
        <span className="text-base text-gray-400 bg-gray-50 px-4 py-1.5 rounded-xl font-medium">{requests.length} درخواست</span>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجوی درخواست..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-base"
            />
          </div>
          <div className="flex items-center gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 rounded-lg text-sm transition ${
                  filterStatus === s
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {s === "همه" ? "همه" : getStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right p-4 text-sm font-bold text-gray-500">عنوان</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">کاربر</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">تاریخ</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">وضعیت</th>
                <th className="text-right p-4 text-sm font-bold text-gray-500">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400 text-base">درخواستی یافت نشد.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 text-base text-gray-700 font-bold">{req.subject || req.title}</td>
                    <td className="p-4 text-base text-gray-500 font-medium">{req.user_display || req.user_name || "—"}</td>
                    <td className="p-4 text-base text-gray-400 font-medium">{req.created_at ? new Date(req.created_at).toLocaleDateString('fa-IR') : "—"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-blue-50 rounded-xl text-blue-600 transition"><Eye size={18} /></button>
                        <button className="p-1.5 hover:bg-green-50 rounded-xl text-green-600 transition"><CheckCircle size={18} /></button>
                        <button className="p-1.5 hover:bg-red-50 rounded-xl text-red-600 transition"><XCircle size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 6. Admin Campaigns Panel
// ============================================
const AdminCampaignsPanel = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_amount: "",
    raised_amount: "0",
    category: "عمومی",
    urgency: "عادی",
    image_url: "",
    is_published: false,
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const CATEGORIES = ["درمانی", "دارویی", "جراحی", "تجهیزات", "عمومی"];
  const URGENCIES = ["فوری", "متوسط", "عادی"];

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.listCampaigns();
      setCampaigns(response.data || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleSubmit = async () => {
    setMsg(""); setErr("");
    if (!form.title.trim()) return setErr("عنوان کمپین الزامی است.");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      target_amount: Number(form.target_amount) || 0,
      raised_amount: Number(form.raised_amount) || 0,
      category: form.category,
      urgency: form.urgency,
      image_url: form.image_url.trim(),
      is_published: form.is_published,
    };
    try {
      if (editId) {
        await adminService.updateCampaign(editId, payload);
        setMsg("کمپین به‌روزرسانی شد.");
      } else {
        await adminService.createCampaign(payload);
        setMsg("کمپین ایجاد شد.");
      }
      setShowForm(false);
      loadCampaigns();
    } catch (error) {
      setErr(error.response?.data?.detail || "خطا در ذخیره کمپین");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("این کمپین حذف شود؟")) return;
    try {
      await adminService.deleteCampaign(id);
      setMsg("حذف شد.");
      loadCampaigns();
    } catch {
      setErr("حذف کمپین ممکن نیست.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ direction: 'rtl' }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت کمپین‌ها</h2>
          <p className="text-base text-gray-400">ایجاد و مدیریت کمپین‌های خیریه</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm({ title: "", description: "", target_amount: "", raised_amount: "0", category: "عمومی", urgency: "عادی", image_url: "", is_published: false }); setShowForm(true); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-base font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Megaphone size={20} /> ایجاد کمپین
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">{editId ? "ویرایش کمپین" : "کمپین جدید"}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان *" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-base" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیحات" rows={3} className="w-full p-3 rounded-xl border border-gray-200 outline-none resize-none text-base" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} placeholder="مبلغ هدف (تومان)" className="p-3 rounded-xl border border-gray-200 outline-none text-base" />
            <input type="number" value={form.raised_amount} onChange={(e) => setForm({ ...form, raised_amount: e.target.value })} placeholder="مبلغ جمع‌آوری شده" className="p-3 rounded-xl border border-gray-200 outline-none text-base" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="p-3 rounded-xl border border-gray-200 bg-white text-base">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} className="p-3 rounded-xl border border-gray-200 bg-white text-base">
              {URGENCIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="آدرس تصویر (اختیاری)" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-base" />
          <label className="flex items-center gap-3 text-base text-gray-600 font-medium">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-5 h-5" />
            منتشر شده
          </label>
          <button onClick={handleSubmit} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition">ذخیره</button>
          {msg && <p className="text-base text-emerald-600 font-medium">{msg}</p>}
          {err && <p className="text-base text-red-500 font-medium">{err}</p>}
        </div>
      )}

      {campaigns.length === 0 ? (
        <p className="text-gray-400 text-center py-10 bg-gray-50 rounded-2xl text-base">کمپینی ثبت نشده است.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-800">{camp.title}</h3>
                  <span className={`text-sm px-3 py-1 rounded-full mt-1 inline-block font-medium ${
                    camp.is_published ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {camp.is_published ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-xl"><MoreVertical size={18} className="text-gray-400" /></button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-base">
                  <span className="text-gray-400 font-medium">جمع آوری شده</span>
                  <span className="font-bold text-gray-700">{Number(camp.raised_amount || 0).toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between text-base mt-1">
                  <span className="text-gray-400 font-medium">هدف</span>
                  <span className="font-bold text-gray-700">{Number(camp.target_amount || 0).toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="mt-3 bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${camp.progress || 0}%` }}></div>
                </div>
                <p className="text-sm text-gray-400 mt-1 font-medium">{camp.progress || 0}% پیشرفت</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => { setEditId(camp.id); setForm({ title: camp.title, description: camp.description || "", target_amount: String(camp.target_amount || ""), raised_amount: String(camp.raised_amount || "0"), category: camp.category || "عمومی", urgency: camp.urgency || "عادی", image_url: camp.image_url || "", is_published: !!camp.is_published }); setShowForm(true); }} className="flex-1 text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition">ویرایش</button>
                <button onClick={() => handleDelete(camp.id)} className="flex-1 text-center px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 7. AdminWallet Panel
// ============================================
const AdminWalletPanel = () => {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [walletSearch, setWalletSearch] = useState("");
  const [form, setForm] = useState({ phone_number: "", direction: "credit", amount: "", reason: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setLoading(false);
    setWallets([
      { id: 1, owner_username: "09123456789", owner_role: "benefactor", cached_balance: 4850000, held_balance: 0 },
      { id: 2, owner_username: "09123456780", owner_role: "benefactor", cached_balance: 4230000, held_balance: 500000 },
    ]);
    setPayments([
      { id: 1, status: "success", authority: "A1001", amount: 5000000 },
      { id: 2, status: "pending", authority: "A1002", amount: 2000000 },
    ]);
    setPledges([
      { id: 1, benefactor_name: "احمد رضایی", request_subject: "کمک درمانی", patient_name: "علی محمدی", request_id: 1, amount: 3000000, status: "held" },
    ]);
  }, []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    setMsg("تعدیل موجودی با موفقیت انجام شد.");
    setForm({ phone_number: "", direction: "credit", amount: "", reason: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ direction: 'rtl' }}>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">کیف پول و پرداخت</h2>
        <p className="text-base text-gray-400">مدیریت تراکنش‌های مالی و کیف پول کاربران</p>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
        <h3 className="font-bold text-base text-gray-700 mb-3">تعدیل موجودی کیف پول</h3>
        <form onSubmit={handleAdjust} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="tel" placeholder="شماره موبایل" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className="p-3 rounded-xl border border-gray-200 outline-none text-base" required />
          <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className="p-3 rounded-xl border border-gray-200 bg-white text-base">
            <option value="credit">شارژ</option>
            <option value="debit">برداشت</option>
          </select>
          <input type="number" placeholder="مبلغ (تومان)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="p-3 rounded-xl border border-gray-200 outline-none text-base" required />
          <input type="text" placeholder="دلیل (اختیاری)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="p-3 rounded-xl border border-gray-200 outline-none text-base" />
          <button type="submit" className="sm:col-span-2 py-2.5 bg-emerald-600 text-white rounded-xl text-base font-bold hover:bg-emerald-700 transition">اعمال تغییر</button>
        </form>
        {msg && <p className="text-base text-emerald-600 mt-3 font-medium">{msg}</p>}
      </div>

      <div>
        <h3 className="font-bold text-base text-gray-700 mb-3">کیف پول‌ها</h3>
        <input type="text" placeholder="جستجوی شماره موبایل..." value={walletSearch} onChange={(e) => setWalletSearch(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none text-base mb-4" />
        {wallets.map((w) => (
          <div key={w.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-base">{w.owner_username}</p>
              <p className="text-sm text-gray-400 font-medium">{ROLE_LABELS[w.owner_role] || w.owner_role}</p>
            </div>
            <div className="text-left">
              <p className="font-bold text-emerald-600 text-base">{Number(w.cached_balance).toLocaleString('fa-IR')} تومان</p>
              {Number(w.held_balance) > 0 && <p className="text-sm text-amber-600 font-medium">{Number(w.held_balance).toLocaleString('fa-IR')} معلق</p>}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold text-base text-gray-700 mb-3">پرداخت‌های درگاه</h3>
        {payments.map((p) => (
          <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-base">#{p.id} — {p.status}</p>
              <p className="text-sm text-gray-400 font-medium">{p.authority || "—"}</p>
            </div>
            <p className="font-bold text-emerald-600 text-base">{Number(p.amount).toLocaleString('fa-IR')} تومان</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold text-base text-gray-700 mb-3">تعهدات مالی</h3>
        {pledges.map((h) => (
          <div key={h.id} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-base">{h.benefactor_name}</p>
              <p className="text-sm text-gray-400 font-medium">{h.request_subject}</p>
            </div>
            <p className={`font-bold text-base ${h.status === "held" ? "text-amber-600" : "text-emerald-600"}`}>
              {Number(h.amount).toLocaleString('fa-IR')} — {h.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 8. AdminLookupsPanel - تکمیل شده با قابلیت‌های کامل
// ============================================
const AdminLookupsPanel = () => {
  const [types, setTypes] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminService.listLookupTypes();
      const list = Array.isArray(r.data) ? r.data : [];
      setTypes(list);
      setSelectedSlug((prev) => prev || (list[0]?.slug ?? ""));
    } catch {
      setErr("خطا در بارگذاری انواع lookup");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    if (!selectedSlug) return;
    setItemsLoading(true);
    setErr("");
    try {
      const r = await adminService.listLookupItems(selectedSlug);
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch {
      setErr("خطا در بارگذاری آیتم‌ها");
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async () => {
    setMsg("");
    setErr("");
    const name = newName.trim();
    if (!name) return setErr("نام را وارد کنید.");
    try {
      await adminService.createLookupItem(selectedSlug, name);
      setNewName("");
      setMsg("آیتم اضافه شد.");
      loadItems();
      loadTypes();
    } catch (e) {
      setErr(e.response?.data?.detail || "خطا در ایجاد");
    }
  };

  const handleUpdate = async (itemId) => {
    setMsg("");
    setErr("");
    const name = editName.trim();
    if (!name) return setErr("نام را وارد کنید.");
    try {
      await adminService.updateLookupItem(selectedSlug, itemId, name);
      setEditId(null);
      setEditName("");
      setMsg("ذخیره شد.");
      loadItems();
    } catch (e) {
      setErr(e.response?.data?.detail || "خطا در ویرایش");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("این آیتم حذف شود؟")) return;
    setMsg("");
    setErr("");
    try {
      await adminService.deleteLookupItem(selectedSlug, itemId);
      setMsg("حذف شد.");
      loadItems();
      loadTypes();
    } catch {
      setErr("حذف ممکن نیست (احتمالاً در حال استفاده است).");
    }
  };

  const selectedLabel = types.find((t) => t.slug === selectedSlug)?.label || "";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-blue-700" size={32} />
      </div>
    );
  }

  return (
    <div className="text-right space-y-6" style={{ direction: 'rtl' }}>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">مدیریت داده‌های پایه</h2>
        <p className="text-base text-gray-400">جنسیت، بیمه، تخصص‌ها و سایر فیلدهای انتخابی ثبت‌نام را اینجا ویرایش کنید.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => setSelectedSlug(t.slug)}
            className={`px-4 py-2 rounded-xl text-base transition ${
              selectedSlug === t.slug
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
            }`}
          >
            {t.label} <span className="text-sm opacity-70">({t.count || 0})</span>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-base text-gray-700 mb-4">{selectedLabel}</h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="نام جدید..."
            className="flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-base transition"
          >
            <Plus size={18} /> افزودن
          </button>
        </div>

        {itemsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-base">هیچ آیتمی در این دسته وجود ندارد.</p>
            <p className="text-sm text-gray-300 mt-1">با استفاده از فرم بالا آیتم جدید اضافه کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                {editId === item.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-gray-200 outline-none text-base"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(item.id)}
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold"
                    >
                      ذخیره
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(null);
                        setEditName("");
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-base text-gray-700">
                      {item.name}
                      <span className="text-xs text-gray-400 mr-2">#{item.id}</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(item.id);
                          setEditName(item.name);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="ویرایش"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {msg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-base font-medium">
            ✓ {msg}
          </div>
        )}
        {err && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-base font-medium">
            ✗ {err}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 9. Dashboard Shell
// ============================================
const DashboardShell = ({ children, profile, stats, tabs, activeTab, onTabChange, approvalPending }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="min-h-screen bg-gray-50/60 flex" style={{ direction: 'rtl' }}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        profile={profile}
        isMobile={false}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={(tab) => { onTabChange(tab); setIsMobileMenuOpen(false); }} 
            profile={profile}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
            isCollapsed={false}
            toggleCollapse={() => {}}
          />
        </div>
      )}

      <div className={`main-content flex-1 min-w-0 ${isCollapsed ? 'lg:mr-20' : 'lg:mr-72'}`}>
        <Header 
          profile={profile} 
          stats={stats} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onRefresh={() => window.location.reload()}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// ============================================
// 10. AdminDashboard (کامپوننت اصلی)
// ============================================
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const r = await profileService.getProfile();
      const u = r.data;
      setProfile({
        name: u.first_name || u.profile?.first_name || "مدیر سامانه",
        username: u.profile?.phone_number || u.username,
        phone: u.profile?.phone_number || u.username,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(u.username || "admin"),
        memberSince: "—",
        state: true,
      });
    } catch {
      setProfile({
        name: "مدیر سامانه",
        username: "admin@mehrsan.ir",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        memberSince: "—",
        state: true,
      });
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const r = await adminService.getStats();
      setStats(r.data);
    } catch {
      setStats({});
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadStats()]);
      setLoading(false);
    };
    loadAll();
  }, [loadProfile, loadStats]);

  const headerStats = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "کل کاربران", value: stats.total_users ?? 0 },
      { label: "در انتظار تایید", value: stats.pending_users ?? 0 },
      { label: "درخواست‌ها", value: stats.total_requests ?? 0 },
      { label: "درخواست معلق", value: stats.pending_requests ?? 0 },
    ];
  }, [stats]);

  const overviewCards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: "بیماران", value: stats.patients ?? 0, growth: stats.patients_growth ?? 5 },
      { label: "پزشکان", value: stats.doctors ?? 0, growth: stats.doctors_growth ?? 8 },
      { label: "سلامتیاران", value: stats.health_assistants ?? 0, growth: stats.health_assistants_growth ?? 3 },
      { label: "خیرین", value: stats.benefactors ?? 0, growth: stats.benefactors_growth ?? 12 },
      { label: "کاربران فعال", value: stats.active_users ?? 0, growth: stats.active_users_growth ?? 10 },
      { label: "کل کمک‌ها", value: stats.total_donations ?? 0, growth: stats.total_donations_growth ?? 15 },
      { label: "کمپین‌های فعال", value: stats.published_campaigns ?? 0, growth: stats.published_campaigns_growth ?? 7 },
    ];
  }, [stats]);

  const chartData = useMemo(() => {
    if (stats?.chart_data) return stats.chart_data;
    return [
      { label: "فروردین", percent: 65 },
      { label: "اردیبهشت", percent: 72 },
      { label: "خرداد", percent: 80 },
      { label: "تیر", percent: 68 },
      { label: "مرداد", percent: 90 },
      { label: "شهریور", percent: 85 },
      { label: "مهر", percent: 95 },
      { label: "آبان", percent: 100 },
    ];
  }, [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "users", label: "کاربران", icon: Users },
    { id: "requests", label: "درخواست‌ها", icon: List },
    { id: "campaigns", label: "کمپین‌ها", icon: Megaphone },
    { id: "wallet", label: "کیف پول", icon: Wallet },
    { id: "lookups", label: "داده‌های پایه", icon: Database },
    { id: "profile", label: "حساب مدیر", icon: Shield },
  ];

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={44} />
      </div>
    );
  }

  return (
    <DashboardShell
      profile={profile}
      stats={headerStats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      approvalPending={false}
    >
      {activeTab === "overview" && (
        <DashboardOverview 
          cards={overviewCards} 
          chartData={chartData}
          pendingRequests={stats?.pending_requests || 76}
          stats={stats}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === "users" && <AdminUsersPanel />}
      {activeTab === "requests" && <RequestListPanel title="همه درخواست‌های شبکه" showFilters />}
      {activeTab === "campaigns" && <AdminCampaignsPanel />}
      {activeTab === "wallet" && <AdminWalletPanel />}
      {activeTab === "lookups" && <AdminLookupsPanel />}

      {activeTab === "profile" && (
        <div className="max-w-xl" style={{ direction: 'rtl' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-5">حساب مدیر</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <img src={profile?.avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-gray-200" />
              <div>
                <p className="font-bold text-lg text-gray-800">{profile?.name}</p>
                <p className="text-base text-gray-400">{profile?.username}</p>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-base text-gray-600">شماره موبایل: <span className="font-bold">{profile?.phone || profile?.username}</span></p>
              <p className="text-base text-gray-400 mt-3">از تب «کاربران» می‌توانید همه اعضا را مدیریت کنید. از تب «داده‌های پایه» فیلدهای انتخابی ثبت‌نام را ویرایش کنید.</p>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default AdminDashboard;