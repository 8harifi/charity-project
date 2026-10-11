import { Component, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/** Keeps the sidebar usable when a tab panel throws during render. */
class TabErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-right text-red-800">
          <p className="font-bold mb-1">خطا در نمایش این بخش</p>
          <p className="text-sm text-red-700">
            لطفاً تب دیگری را انتخاب کنید یا صفحه را تازه کنید.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;900&display=swap');

  * {
    font-family: 'Vazirmatn', 'Tahoma', sans-serif !important;
  }

  body {
    font-family: 'Vazirmatn', 'Tahoma', sans-serif !important;
    background-color: #f8fafc;
  }

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
    min-height: 0 !important;
    scroll-behavior: smooth !important;
  }

  .sidebar-fix .sidebar-scroll::-webkit-scrollbar { width: 4px; }
  .sidebar-fix .sidebar-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
  .sidebar-fix .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.25);
    border-radius: 10px;
  }

  .sidebar-fix .sidebar-bottom {
    flex-shrink: 0 !important;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .sidebar-collapsed .nav-item {
    padding: 0.75rem !important;
    justify-content: center !important;
  }

  .sidebar-collapsed .nav-item svg { margin: 0 !important; }

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
    animation: dashboard-shimmer 8s ease-in-out infinite;
  }

  @keyframes dashboard-shimmer {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-10%, -10%) rotate(5deg); }
  }

  .blue-welcome * { position: relative; z-index: 1; }
`;

function SidebarNav({
  tabs,
  activeTab,
  onTabChange,
  profile,
  isMobile,
  onClose,
  isCollapsed,
  toggleCollapse,
  brandSubtitle,
  onLogout,
  onHome,
}) {
  return (
    <>
      {isMobile && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />
      )}

      <div
        className={`sidebar-fix text-white ${
          isMobile ? "w-80" : isCollapsed ? "w-20 sidebar-collapsed" : "w-72"
        }`}
        style={{
          direction: "rtl",
          zIndex: 50,
          background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
          boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className={`p-4 border-b border-indigo-700/50 flex items-center flex-shrink-0 ${
            isCollapsed && !isMobile ? "justify-center" : "justify-between"
          }`}
        >
          {(!isCollapsed || isMobile) && (
            <div className="rtl-text">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                مهرسان
              </h1>
              <p className="text-indigo-300 text-sm">{brandSubtitle}</p>
            </div>
          )}
          {isCollapsed && !isMobile && (
            <div className="w-10 h-10 rounded-xl bg-indigo-700/50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">م</span>
            </div>
          )}
          {isMobile && (
            <button type="button" onClick={onClose} className="p-2 hover:bg-indigo-700 rounded-xl transition flex-shrink-0">
              <X size={22} />
            </button>
          )}
        </div>

        {profile && (!isCollapsed || isMobile) && (
          <div className="p-3 mx-3 my-2 bg-indigo-800/30 rounded-xl border border-indigo-700/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full border-2 border-indigo-400 flex-shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0 rtl-text">
                <p className="font-semibold text-base truncate">{profile.name}</p>
                <p className="text-indigo-300 text-sm truncate">
                  {profile.username || profile.phoneNumber || profile.phone || "—"}
                </p>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" title="آنلاین" />
            </div>
          </div>
        )}

        {profile && isCollapsed && !isMobile && (
          <div className="p-3 flex justify-center flex-shrink-0">
            <div className="relative">
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-11 h-11 rounded-full border-2 border-indigo-400 object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-400 rounded-full border-2 border-indigo-900" />
            </div>
          </div>
        )}

        <nav className={`sidebar-scroll px-2 py-1 ${isCollapsed && !isMobile ? "sidebar-collapsed" : ""}`}>
          {(!isCollapsed || isMobile) && (
            <p className="text-indigo-400 text-sm px-4 pt-2 pb-2 flex-shrink-0">منوی اصلی</p>
          )}
          {(() => {
            const items = [];
            let lastGroup = null;
            tabs.forEach((tab) => {
              if (tab.group && tab.group !== lastGroup && (!isCollapsed || isMobile)) {
                items.push(
                  <p key={`g-${tab.group}`} className="text-indigo-400 text-xs px-4 pt-3 pb-1">
                    {tab.group}
                  </p>
                );
              }
              lastGroup = tab.group || null;
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              items.push(
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-base mb-0.5 ${
                    isActive
                      ? "bg-indigo-600/50 text-white shadow-lg shadow-indigo-600/20"
                      : "text-indigo-200 hover:bg-indigo-700/30 hover:text-white"
                  } ${isCollapsed && !isMobile ? "justify-center" : ""}`}
                  title={isCollapsed && !isMobile ? tab.label : undefined}
                  style={{ minHeight: "48px" }}
                >
                  {Icon && (
                    <Icon
                      size={22}
                      className={`flex-shrink-0 ${isActive ? "text-blue-400" : "text-indigo-300"}`}
                    />
                  )}
                  {(!isCollapsed || isMobile) && (
                    <>
                      <span className="flex-1 text-right font-medium truncate">{tab.label}</span>
                      {isActive && <div className="w-1 h-7 bg-blue-400 rounded-full flex-shrink-0" />}
                    </>
                  )}
                </button>
              );
            });
            return items;
          })()}
        </nav>

        <div className={`sidebar-bottom p-3 ${isCollapsed && !isMobile ? "flex flex-col items-center" : ""}`}>
          <button
            type="button"
            onClick={onHome}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-indigo-200 hover:bg-indigo-700/30 rounded-xl transition text-base ${
              isCollapsed && !isMobile ? "justify-center" : ""
            }`}
            title={isCollapsed && !isMobile ? "صفحه اصلی" : undefined}
          >
            <Home size={20} className="flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>صفحه اصلی</span>}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-300 hover:bg-red-500/20 rounded-xl transition text-base mt-1 ${
              isCollapsed && !isMobile ? "justify-center" : ""
            }`}
            title={isCollapsed && !isMobile ? "خروج" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>خروج</span>}
          </button>

          {!isMobile && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-indigo-300 hover:bg-indigo-700/30 rounded-xl transition text-sm"
            >
              {isCollapsed ? (
                <ChevronRight size={20} className="flex-shrink-0" />
              ) : (
                <ChevronLeft size={20} className="flex-shrink-0" />
              )}
              {!isCollapsed && <span className="font-medium">جمع کردن</span>}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function DashboardHeader({
  profile,
  stats,
  onMenuClick,
  onRefresh,
  isCollapsed,
  toggleCollapse,
}) {
  return (
    <header
      className="bg-white sticky top-0 z-40"
      style={{
        direction: "rtl",
        boxShadow: "0 2px 12px rgba(37, 99, 235, 0.15)",
      }}
    >
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
          >
            {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>

          <button type="button" onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition">
            <Menu size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {stats?.slice(0, 3).map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              <p className="text-lg font-bold text-gray-700">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="flex items-center gap-3 pr-3 border-r border-gray-200">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-700">{profile.name}</p>
                <p className="text-sm text-gray-400">
                  {profile.username || profile.phoneNumber || profile.phone || "—"}
                </p>
              </div>
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover"
              />
            </div>
          )}

          {onRefresh && (
            <button type="button" onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
              <RefreshCw size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function DashboardShell({
  profile,
  stats,
  tabs,
  activeTab,
  onTabChange,
  children,
  approvalPending,
  brandSubtitle = "پنل کاربری",
  onRefresh,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!tabs?.length) return;
    if (!tabs.some((t) => t.id === activeTab)) {
      onTabChange(tabs[0].id);
    }
  }, [tabs, activeTab, onTabChange]);

  const handleLogout = () => {
    logout();
    navigate("/loginpage");
  };

  const handleTabChange = (tabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleRefresh = onRefresh || (() => window.location.reload());

  return (
    <div className="min-h-screen bg-gray-50/60 flex font-kook" style={{ direction: "rtl" }}>
      <style>{globalStyle}</style>

      <div className="hidden lg:block">
        <SidebarNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          profile={profile}
          isMobile={false}
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed((v) => !v)}
          brandSubtitle={brandSubtitle}
          onLogout={handleLogout}
          onHome={() => navigate("/")}
        />
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <SidebarNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            profile={profile}
            isMobile
            onClose={() => setIsMobileMenuOpen(false)}
            isCollapsed={false}
            toggleCollapse={() => {}}
            brandSubtitle={brandSubtitle}
            onLogout={handleLogout}
            onHome={() => navigate("/")}
          />
        </div>
      )}

      <div className={`main-content flex-1 min-w-0 ${isCollapsed ? "lg:mr-20" : "lg:mr-72"}`}>
        <DashboardHeader
          profile={profile}
          stats={stats}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onRefresh={handleRefresh}
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed((v) => !v)}
        />

        <main className="p-4 sm:p-6">
          {approvalPending && (
            <div className="mb-4 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 text-sm text-right">
              حساب شما در انتظار تایید مدیر است. برخی امکانات محدود هستند.
            </div>
          )}
          <TabErrorBoundary resetKey={activeTab}>{children}</TabErrorBoundary>
        </main>
      </div>
    </div>
  );
}
