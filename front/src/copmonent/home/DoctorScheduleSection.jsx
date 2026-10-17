import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { publicApi } from "../../API/publicApi";

export default function DoctorScheduleSection() {
  const [centers, setCenters] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    center_type: "government",
    specialty: "",
    doctor_name: "",
    specialty_level: "",
    shift: "",
    weekday: "",
    weekday_present: "yes",
  });

  const load = () => {
    publicApi
      .medicalCenters({
        ...filters,
        city: filters.city || "کرمان",
        name: filters.name || undefined,
        center_type: filters.center_type || undefined,
        specialty: filters.specialty || undefined,
        doctor_name: filters.doctor_name || undefined,
        specialty_level: filters.specialty_level || undefined,
        shift: filters.shift || undefined,
        weekday: filters.weekday || undefined,
        weekday_present: filters.weekday ? filters.weekday_present || "yes" : undefined,
      })
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        setCenters(list);
        if (list.length && !list.some((c) => String(c.id) === String(selectedId))) {
          setSelectedId(String(list[0].id));
        }
      })
      .catch(() => setCenters([]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => centers.find((c) => String(c.id) === String(selectedId)) || centers[0],
    [centers, selectedId]
  );

  const visibleImages = useMemo(() => {
    const images = selected?.schedule_images || [];
    if (!filters.weekday) return images;
    if (filters.weekday_present === "no") {
      return images.filter((img) => img.weekday && img.weekday !== filters.weekday);
    }
    return images.filter((img) => !img.weekday || img.weekday === filters.weekday);
  }, [selected, filters.weekday, filters.weekday_present]);

  return (
    <section id="doctor-schedule" className="font-kook bg-white py-12 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
            برنامه حضور پزشکان مراکز درمانی شهر کرمان
          </h2>
          <p className="text-gray-600 mb-6">
            نام مرکز درمانی را انتخاب کنید تا برنامه حضور پزشکان آن مرکز نمایش داده شود.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="md:col-span-2 p-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-900"
          >
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.center_type_label})
              </option>
            ))}
          </select>
          <select
            value={filters.center_type}
            onChange={(e) => setFilters((f) => ({ ...f, center_type: e.target.value }))}
            className="p-3 rounded-xl border border-blue-100"
          >
            <option value="">همه انواع مرکز</option>
            <option value="government">دولتی</option>
            <option value="private">خصوصی</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="p-3 rounded-xl bg-blue-600 text-white font-semibold"
          >
            اعمال فیلتر
          </button>
        </div>

        <details className="mb-6 bg-blue-50/60 rounded-xl p-4">
          <summary className="cursor-pointer font-semibold text-blue-800">جستجوی پیشرفته برنامه حضور</summary>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <input
              placeholder="نام مرکز"
              value={filters.name}
              onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
              className="p-2.5 rounded-lg border border-blue-100"
            />
            <input
              placeholder="شهر / موقعیت"
              value={filters.city || ""}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
              className="p-2.5 rounded-lg border border-blue-100"
            />
            <input
              placeholder="تخصص پزشک"
              value={filters.specialty}
              onChange={(e) => setFilters((f) => ({ ...f, specialty: e.target.value }))}
              className="p-2.5 rounded-lg border border-blue-100"
            />
            <input
              placeholder="نام پزشک"
              value={filters.doctor_name}
              onChange={(e) => setFilters((f) => ({ ...f, doctor_name: e.target.value }))}
              className="p-2.5 rounded-lg border border-blue-100"
            />
            <select
              value={filters.specialty_level}
              onChange={(e) => setFilters((f) => ({ ...f, specialty_level: e.target.value }))}
              className="p-2.5 rounded-lg border border-blue-100"
            >
              <option value="">وضعیت تخصص</option>
              <option value="gp">عمومی</option>
              <option value="specialist">متخصص</option>
              <option value="super">فوق تخصص</option>
            </select>
            <select
              value={filters.shift}
              onChange={(e) => setFilters((f) => ({ ...f, shift: e.target.value }))}
              className="p-2.5 rounded-lg border border-blue-100"
            >
              <option value="">شیفت</option>
              <option value="morning">صبح</option>
              <option value="evening">عصر</option>
            </select>
            <select
              value={filters.weekday}
              onChange={(e) => setFilters((f) => ({ ...f, weekday: e.target.value }))}
              className="p-2.5 rounded-lg border border-blue-100"
            >
              <option value="">روز هفته</option>
              <option value="sat">شنبه</option>
              <option value="sun">یکشنبه</option>
              <option value="mon">دوشنبه</option>
              <option value="tue">سه‌شنبه</option>
              <option value="wed">چهارشنبه</option>
              <option value="thu">پنجشنبه</option>
              <option value="fri">جمعه</option>
            </select>
            <select
              value={filters.weekday_present}
              onChange={(e) => setFilters((f) => ({ ...f, weekday_present: e.target.value }))}
              disabled={!filters.weekday}
              className="p-2.5 rounded-lg border border-blue-100 disabled:opacity-50"
            >
              <option value="yes">در این روز هست</option>
              <option value="no">در این روز نیست</option>
            </select>
          </div>
        </details>

        {selected ? (
          <div className="bg-gray-50 rounded-2xl p-5 border border-blue-50">
            <h3 className="font-bold text-lg text-gray-800">{selected.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selected.address} {selected.landline ? `— ${selected.landline}` : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {visibleImages.length === 0 ? (
                <p className="text-gray-500 col-span-2 py-8 text-center">
                  {filters.weekday
                    ? "برای این روز برنامه‌ای مطابق فیلتر یافت نشد."
                    : "برنامه حضور این مرکز هنوز بارگذاری نشده است."}
                </p>
              ) : (
                visibleImages.map((img) => (
                  <figure key={img.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <img src={img.image_url} alt={img.caption || selected.name} className="w-full object-cover" />
                    {img.caption && (
                      <figcaption className="p-3 text-sm text-gray-600">{img.caption}</figcaption>
                    )}
                  </figure>
                ))
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">مرکز درمانی فعالی یافت نشد.</p>
        )}
      </div>
    </section>
  );
}
