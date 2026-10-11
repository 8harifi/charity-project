import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { adminService } from "../../Services/adminService";

const emptyForm = {
  name: "",
  province: "کرمان",
  city: "کرمان",
  center_type: "government",
  address: "",
  landline: "",
};

export default function AdminMedicalCentersPanel() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [uploadCenter, setUploadCenter] = useState(null);
  const [imageMeta, setImageMeta] = useState({
    caption: "",
    shift: "all",
    weekday: "",
    specialty_name: "",
    doctor_name: "",
    specialty_level: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminService.listMedicalCenters();
      setCenters(Array.isArray(r.data) ? r.data : []);
    } catch {
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createCenter = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await adminService.createMedicalCenter(form);
      setForm(emptyForm);
      setMsg("مرکز ثبت شد.");
      load();
    } catch (err) {
      setMsg(err.response?.data?.detail || "ثبت مرکز ممکن نشد.");
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCenter) return;
    const data = new FormData();
    data.append("image", file);
    Object.entries(imageMeta).forEach(([k, v]) => {
      if (v) data.append(k, v);
    });
    try {
      await adminService.uploadMedicalCenterImage(uploadCenter, data);
      setMsg("تصویر برنامه حضور پزشک اضافه شد.");
      load();
    } catch (err) {
      setMsg(err.response?.data?.detail || "بارگذاری تصویر ممکن نشد.");
    }
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="text-right space-y-8">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800">مراکز درمانی کرمان و برنامه حضور پزشک</h2>
      <p className="text-sm text-gray-500">
        این مراکز در صفحه اصلی نمایش داده می‌شوند. برای هر مرکز می‌توانید عکس برنامه حضور پزشک را بارگذاری کنید.
      </p>
      {msg && <p className="text-sm text-blue-700">{msg}</p>}

      <form onSubmit={createCenter} className="bg-gray-50 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="نام مرکز"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="p-3 rounded-xl border border-gray-200"
        />
        <input
          placeholder="شهر"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className="p-3 rounded-xl border border-gray-200"
        />
        <select
          value={form.center_type}
          onChange={(e) => setForm((f) => ({ ...f, center_type: e.target.value }))}
          className="p-3 rounded-xl border border-gray-200"
        >
          <option value="government">دولتی</option>
          <option value="private">خصوصی</option>
        </select>
        <input
          placeholder="تلفن ثابت"
          value={form.landline}
          onChange={(e) => setForm((f) => ({ ...f, landline: e.target.value }))}
          className="p-3 rounded-xl border border-gray-200"
        />
        <input
          placeholder="آدرس"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="sm:col-span-2 p-3 rounded-xl border border-gray-200"
        />
        <button type="submit" className="sm:col-span-2 py-3 bg-blue-600 text-white rounded-xl font-bold inline-flex items-center justify-center gap-2">
          <Plus size={18} /> افزودن مرکز
        </button>
      </form>

      <div className="space-y-4">
        {centers.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="text-sm text-gray-500">
                  {c.city} — {c.center_type_label} {c.landline ? `— ${c.landline}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("حذف این مرکز؟")) return;
                  await adminService.deleteMedicalCenter(c.id);
                  load();
                }}
                className="text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(c.schedule_images || []).map((img) => (
                <div key={img.id} className="relative">
                  <img src={img.image_url} alt={img.caption || ""} className="h-24 w-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    className="absolute top-1 left-1 bg-white/90 rounded p-0.5"
                    onClick={async () => {
                      await adminService.deleteMedicalCenterImage(c.id, img.id);
                      load();
                    }}
                  >
                    <Trash2 size={12} className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <input
                placeholder="شرح تصویر"
                value={uploadCenter === c.id ? imageMeta.caption : ""}
                onChange={(e) => {
                  setUploadCenter(c.id);
                  setImageMeta((m) => ({ ...m, caption: e.target.value }));
                }}
                className="p-2 rounded-lg border border-gray-200"
              />
              <input
                placeholder="نام پزشک"
                value={uploadCenter === c.id ? imageMeta.doctor_name : ""}
                onChange={(e) => {
                  setUploadCenter(c.id);
                  setImageMeta((m) => ({ ...m, doctor_name: e.target.value }));
                }}
                className="p-2 rounded-lg border border-gray-200"
              />
              <input
                placeholder="تخصص"
                value={uploadCenter === c.id ? imageMeta.specialty_name : ""}
                onChange={(e) => {
                  setUploadCenter(c.id);
                  setImageMeta((m) => ({ ...m, specialty_name: e.target.value }));
                }}
                className="p-2 rounded-lg border border-gray-200"
              />
              <select
                value={uploadCenter === c.id ? imageMeta.shift : "all"}
                onChange={(e) => {
                  setUploadCenter(c.id);
                  setImageMeta((m) => ({ ...m, shift: e.target.value }));
                }}
                className="p-2 rounded-lg border border-gray-200"
              >
                <option value="all">تمام‌وقت</option>
                <option value="morning">صبح</option>
                <option value="evening">عصر</option>
              </select>
              <label className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 cursor-pointer col-span-2 sm:col-span-1">
                <Upload size={14} />
                بارگذاری عکس برنامه
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} onClick={() => setUploadCenter(c.id)} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
