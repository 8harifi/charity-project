import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { adminService } from "../../Services/adminService";

export default function AdminLookupsPanel() {
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
    <div className="text-right space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">مدیریت lookup ها</h2>
      <p className="text-sm text-gray-500">
        جنسیت، بیمه، تخصص‌ها و سایر فیلدهای انتخابی ثبت‌نام را اینجا ویرایش کنید.
      </p>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => setSelectedSlug(t.slug)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              selectedSlug === t.slug
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-gray-800 mb-4">{selectedLabel}</h3>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="نام جدید..."
            className="flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold"
          >
            <Plus size={18} /> افزودن
          </button>
        </div>

        {itemsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">آیتمی وجود ندارد.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-100"
              >
                {editId === item.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-gray-200 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      ذخیره
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(null);
                        setEditName("");
                      }}
                      className="p-1.5 text-gray-500"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-800">
                      {item.name}{" "}
                      <span className="text-xs text-gray-400">#{item.id}</span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(item.id);
                          setEditName(item.name);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

        {msg && <p className="text-sm text-emerald-700 mt-3">{msg}</p>}
        {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
      </div>
    </div>
  );
}
