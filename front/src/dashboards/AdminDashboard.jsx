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
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Activity,
  DollarSign,
  ArrowUpRight,
  Download,
  RefreshCw,
  Loader2,
  MoreVertical,
  Plus,
  TrendingUp,
  Calendar,
  UserCheck,
  HandHeart,
  FileText,
} from "lucide-react";
import { adminService } from "../Services/adminService";
import { dashboardService, profileService } from "../Services/dashboardApi";
import DashboardShell from "./Components/DashboardShell";
import AdminWalletPanel from "./Components/AdminWalletPanel";
import AdminUsersPanel from "./Components/AdminUsersPanel";
import RequestListPanel from "./Components/RequestListPanel";
import AdminReportsPanel from "./Components/AdminReportsPanel";
import AdminPayoutsPanel from "./Components/AdminPayoutsPanel";
import { ProfileTabContent } from "./Components/ProfileEditModal";

function adminProfileFields(profile) {
  return [
    { label: "نام", value: profile.first_name },
    { label: "نام خانوادگی", value: profile.last_name },
    { label: "تلفن همراه", value: profile.phone_number || profile.phone || profile.username },
  ];
}

function mapAdminProfile(u) {
  const p = u.profile || {};
  const firstName = p.first_name || u.first_name || "";
  const lastName = p.last_name || u.last_name || "";
  const phone = p.phone_number || u.username || "";
  const name = `${firstName} ${lastName}`.trim() || "مدیر سامانه";
  return {
    name,
    username: phone,
    phone,
    first_name: firstName,
    last_name: lastName,
    phone_number: phone,
    avatar:
      u.profile_image_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.username || "admin")}`,
    memberSince: "—",
    state: u.state ?? true,
    role: "admin",
  };
}

// ============================================
// 3. Dashboard Overview - با بخش بالایی آبی
// ============================================
const DashboardOverview = ({ cards, stats, onTabChange }) => {
  const pendingUsers = stats?.pending_users ?? 0;
  const pendingRequests = stats?.pending_requests ?? 0;
  const inProgressRequests = stats?.in_progress_requests ?? 0;
  const publishedCampaigns = stats?.published_campaigns ?? 0;
  const totalUsers = stats?.total_users ?? 0;
  const totalRequests = stats?.total_requests ?? 0;

  const actionItems = [];
  if (pendingUsers > 0) actionItems.push(`${pendingUsers} کاربر در انتظار تأیید`);
  if (pendingRequests > 0) actionItems.push(`${pendingRequests} درخواست در صف بررسی`);
  if (inProgressRequests > 0) actionItems.push(`${inProgressRequests} درخواست در حال پیگیری`);

  const summaryText =
    actionItems.length > 0
      ? `نیاز به اقدام: ${actionItems.join("، ")}.`
      : `وضعیت پلتفرم پایدار است — ${totalUsers} کاربر ثبت‌شده، ${publishedCampaigns} کمپین فعال و ${totalRequests} درخواست کل.`;

  const requestBreakdown = stats?.request_status_breakdown ?? [];
  const maxRequestCount = Math.max(...requestBreakdown.map((r) => r.value), 1);

  const getCardStyle = (label) => {
    const styles = {
      "بیماران": { bg: "bg-blue-50", icon: "text-blue-600" },
      "پزشکان": { bg: "bg-teal-50", icon: "text-teal-600" },
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

   return (
    <div className="space-y-6" style={{ direction: 'rtl' }}>
      {/* Welcome Header - بخش آبی */}
      <div className="blue-welcome rounded-2xl p-15 text-white shadow-lg shadow-blue-200/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <TrendingUp size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">خوش آمدید</h2>
        
              <p className="text-blue-100 text-base mt-1">{summaryText}</p>
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
        {cards.map((card, index) => {
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
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {requestBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-700">وضعیت درخواست‌ها</h3>
                <p className="text-sm text-gray-400">توزیع بر اساس وضعیت فعلی</p>
              </div>
            </div>
            <div className="space-y-3">
              {requestBreakdown.map((item, i) => {
                const colors = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#ef4444"];
                const percent = Math.round((item.value / maxRequestCount) * 100);
                return (
                  <div key={item.status || item.label}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="font-bold text-gray-700">{item.value}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: colors[i % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
              {cards.filter(c => ["بیماران", "پزشکان", "سلامتیاران", "خیرین"].includes(c.label)).map((item, i) => {
                const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
                const total = cards.filter(c => ["بیماران", "پزشکان", "سلامتیاران", "خیرین"].includes(c.label))
                  .reduce((sum, c) => sum + Number(c.value), 0) || 1;
                const percent = ((Number(item.value) / total) * 100).toFixed(0);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="font-bold text-gray-700">{item.value}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: colors[i] }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  );
};

// ============================================
// 4. Admin Campaigns Panel
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
          {msg && <p className="text-base text-blue-600 font-medium">{msg}</p>}
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
// 5. AdminLookupsPanel
// ============================================
const AdminLookupsPanel = () => {
  const [types, setTypes] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.listLookupTypes();
      const list = Array.isArray(response.data) ? response.data : [];
      setTypes(list);
      if (list.length > 0 && !selectedSlug) setSelectedSlug(list[0].slug);
    } catch {
      console.error("Error loading lookup types");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    if (!selectedSlug) return;
    try {
      const response = await adminService.listLookupItems(selectedSlug);
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch {
      setItems([]);
    }
  }, [selectedSlug]);

  useEffect(() => { loadTypes(); }, [loadTypes]);
  useEffect(() => { loadItems(); }, [loadItems]);

  const handleCreate = async () => {
    setMsg(""); setErr("");
    const name = newName.trim();
    if (!name) return setErr("نام را وارد کنید.");
    try {
      await adminService.createLookupItem(selectedSlug, name);
      setNewName("");
      setMsg("آیتم اضافه شد.");
      loadItems();
      loadTypes();
    } catch (error) {
      setErr(error.response?.data?.detail || "خطا در ایجاد");
    }
  };

  const handleUpdate = async (itemId) => {
    setMsg(""); setErr("");
    const name = editName.trim();
    if (!name) return setErr("نام را وارد کنید.");
    try {
      await adminService.updateLookupItem(selectedSlug, itemId, name);
      setEditId(null);
      setEditName("");
      setMsg("ذخیره شد.");
      loadItems();
    } catch (error) {
      setErr(error.response?.data?.detail || "خطا در ویرایش");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("این آیتم حذف شود؟")) return;
    setMsg(""); setErr("");
    try {
      await adminService.deleteLookupItem(selectedSlug, itemId);
      setMsg("حذف شد.");
      loadItems();
      loadTypes();
    } catch {
      setErr("حذف ممکن نیست.");
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
      <div>
        <h2 className="text-2xl font-bold text-gray-800">داده‌های پایه (Lookups)</h2>
        <p className="text-base text-gray-400">ویرایش فیلدهای انتخابی ثبت‌نام</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.slug}
            onClick={() => setSelectedSlug(t.slug)}
            className={`px-4 py-2 rounded-xl text-base transition ${
              selectedSlug === t.slug
                ? "bg-blue-600 text-white font-bold"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
            }`}
          >
            {t.label} ({t.count || 0})
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-base text-gray-700 mb-4">{types.find(t => t.slug === selectedSlug)?.label || selectedSlug}</h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="نام جدید..." className="flex-1 p-3 rounded-xl border border-gray-200 outline-none text-base" />
          <button onClick={handleCreate} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition">
            <Plus size={18} /> افزودن
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-base">آیتمی وجود ندارد.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                {editId === item.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 p-2 rounded-xl border border-gray-200 outline-none text-base" autoFocus />
                    <button onClick={() => handleUpdate(item.id)} className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-bold">ذخیره</button>
                    <button onClick={() => { setEditId(null); setEditName(""); }} className="p-1.5 text-gray-400"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-base text-gray-700">{item.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(item.id); setEditName(item.name); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {msg && <p className="text-base text-blue-600 mt-3 font-medium">{msg}</p>}
        {err && <p className="text-base text-red-500 mt-3 font-medium">{err}</p>}
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
      setProfile(mapAdminProfile(r.data));
    } catch {
      setProfile(mapAdminProfile({ username: "admin", profile: {} }));
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const r = await adminService.getStats();
      setStats(r.data);
    } catch {
      const fallback = await dashboardService.getStats().catch(() => null);
      setStats(fallback?.data || {});
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
      { label: "بیماران", value: stats.patients ?? 0 },
      { label: "پزشکان", value: stats.doctors ?? 0 },
      { label: "سلامتیاران", value: stats.health_assistants ?? 0 },
      { label: "خیرین", value: stats.benefactors ?? 0 },
      { label: "کاربران فعال", value: stats.active_users ?? 0 },
      { label: "کل کمک‌ها", value: stats.total_donations ?? 0 },
      { label: "کمپین‌های فعال", value: stats.published_campaigns ?? 0 },
    ];
  }, [stats]);

  const tabs = [
    { id: "overview", label: "پیشخوان", icon: LayoutDashboard },
    { id: "users", label: "کاربران", icon: Users },
    { id: "requests", label: "درخواست‌ها", icon: List },
    { id: "campaigns", label: "کمپین‌ها", icon: Megaphone },
    { id: "wallet", label: "کیف پول", icon: Wallet },
    { id: "payouts", label: "تسویه‌ها", icon: HandHeart },
    { id: "reports", label: "گزارش‌ها", icon: FileText },
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
      brandSubtitle="سامانه مدیریت"
    >
      {activeTab === "overview" && (
        <DashboardOverview
          cards={overviewCards}
          stats={stats}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === "users" && <AdminUsersPanel />}
      {activeTab === "requests" && (
        <RequestListPanel
          title="همه درخواست‌های شبکه"
          fetchFn={(scope, filters) => adminService.listRequests({ scope, ...filters })}
          mode="adminManage"
          showFilters
          accent="blue"
        />
      )}
      {activeTab === "campaigns" && <AdminCampaignsPanel />}
      {activeTab === "wallet" && <AdminWalletPanel />}
      {activeTab === "payouts" && <AdminPayoutsPanel />}
      {activeTab === "reports" && <AdminReportsPanel />}
      {activeTab === "lookups" && <AdminLookupsPanel />}

      {activeTab === "profile" && (
        <ProfileTabContent
          fields={adminProfileFields(profile)}
          role="admin"
          profile={profile}
          onProfileRefresh={loadProfile}
        />
      )}
    </DashboardShell>
  );
};

export default AdminDashboard;