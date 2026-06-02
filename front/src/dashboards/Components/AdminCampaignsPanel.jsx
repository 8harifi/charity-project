import { useCallback, useEffect, useState } from "react";
import { Loader2, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";
import { adminService } from "../../Services/adminService";

const CATEGORIES = ["درمانی", "دارویی", "جراحی", "تجهیزات", "عمومی"];
const URGENCIES = ["فوری", "متوسط", "عادی"];

const emptyForm = {
  title: "",
  description: "",
  target_amount: "",
  raised_amount: "0",
  category: "عمومی",
  urgency: "عادی",
  image_url: "",
  is_published: false,
};

export default function AdminCampaignsPanel() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminService.listCampaigns();
      setCampaigns(Array.isArray(r.data) ? r.data : []);
    } catch {
      setCampaigns([]);
      setErr("خطا در بارگذاری کمپین‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMsg("");
    setErr("");
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      title: c.title || "",
      description: c.description || "",
      target_amount: String(c.target_amount ?? ""),
      raised_amount: String(c.raised_amount ?? "0"),
      category: c.category || "عمومی",
      urgency: c.urgency || "عادی",
      image_url: c.image_url || "",
      is_published: !!c.is_published,
    });
    setShowForm(true);
    setMsg("");
    setErr("");
  };

  const handleSubmit = async () => {
    setMsg("");
    setErr("");
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
      load();
    } catch (e) {
      setErr(e.response?.data?.detail || "خطا در ذخیره کمپین");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("این کمپین حذف شود؟")) return;
    try {
      await adminService.deleteCampaign(id);
      setMsg("حذف شد.");
      load();
    } catch {
      setErr("حذف کمپین ممکن نیست.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-blue-700" size={32} />
      </div>
    );
  }

  return (
    <div className="text-right space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">مدیریت کمپین‌ها</h2>
          <p className="text-sm text-gray-500 mt-1">
            کمپین‌های منتشرشده در ثبت کمک خیرین و صفحه فراخوان‌ها نمایش داده می‌شوند.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
        >
          <Plus size={18} /> کمپین جدید
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800">
              {editId ? "ویرایش کمپین" : "کمپین جدید"}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500">
              <X size={20} />
            </button>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="عنوان *"
            className="w-full p-3 rounded-xl border border-gray-200 outline-none"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="توضیحات"
            rows={3}
            className="w-full p-3 rounded-xl border border-gray-200 outline-none resize-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              value={form.target_amount}
              onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
              placeholder="مبلغ هدف (تومان)"
              className="p-3 rounded-xl border border-gray-200 outline-none"
            />
            <input
              type="number"
              value={form.raised_amount}
              onChange={(e) => setForm({ ...form, raised_amount: e.target.value })}
              placeholder="مبلغ جمع‌آوری شده"
              className="p-3 rounded-xl border border-gray-200 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="p-3 rounded-xl border border-gray-200 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              className="p-3 rounded-xl border border-gray-200 bg-white"
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="آدرس تصویر (اختیاری)"
            className="w-full p-3 rounded-xl border border-gray-200 outline-none"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            منتشر شده (قابل مشاهده برای خیرین و عموم)
          </label>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold"
          >
            ذخیره
          </button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl">کمپینی ثبت نشده است.</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <Megaphone className="text-emerald-600 shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold text-gray-800">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.category} — {c.urgency} — پیشرفت {c.progress ?? 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {Number(c.raised_amount).toLocaleString("fa-IR")} /{" "}
                    {Number(c.target_amount).toLocaleString("fa-IR")} تومان
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      c.is_published
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {c.is_published ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
