import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Calendar,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import SearchBox from "../Components/SearchBox";

const patientsMock = [
  {
    id: 1,
    name: "محمد رضایی",
    age: 54,
    phone: "09123456789",
    status: "active",
    profile: "complete",
    urgent: false,
    appointments: [
      { id: 1, date: "1404/02/20", doctor: "دکتر احمدی", type: "مشاوره" },
      { id: 2, date: "1404/03/05", doctor: "دکتر حسینی", type: "پیگیری" },
    ],
    services: [
      { id: 1, title: "آزمایش خون", date: "1404/02/01" },
      { id: 2, title: "ویزیت قلب", date: "1404/02/10" },
    ],
  },
  {
    id: 2,
    name: "فاطمه موسوی",
    age: 37,
    phone: "09111111111",
    status: "inactive",
    profile: "incomplete",
    urgent: true,
    appointments: [],
    services: [],
  },
];

export default function PatientsList() {
  const [patients] = useState(patientsMock);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("appointments");
  const [search, setSearch] = useState("");

  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return patients;

    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(value) ||
        p.phone.includes(value)
    );
  }, [patients, search]);

  const statusBadge = (status) =>
    status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-slate-100 text-slate-500";

  const profileBadge = (profile) =>
    profile === "complete"
      ? "bg-blue-100 text-blue-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-white rounded-xl shadow border border-slate-100 p-3 sm:p-6 text-right">

      <AnimatePresence mode="wait">

        {/* لیست بیماران */}
        {!selectedPatient && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-bold text-slate-800 mb-4">
              بیماران تحت پوشش
            </h2>

            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="جستجو بر اساس نام یا شماره تماس بیمار"
            />

            <div className="space-y-3">
              {filteredPatients.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedPatient(p);
                    setActiveTab("appointments");
                  }}
                  className="p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-800">
                      {p.name}
                    </p>

                    {p.urgent && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        پیگیری فوری
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    {p.phone}
                  </p>

                  <div className="flex gap-2 mt-2 text-xs flex-wrap">
                    <span className={`px-2 py-1 rounded ${statusBadge(p.status)}`}>
                      {p.status === "active" ? "فعال" : "غیرفعال"}
                    </span>

                    <span className={`px-2 py-1 rounded ${profileBadge(p.profile)}`}>
                      {p.profile === "complete"
                        ? "پرونده کامل"
                        : "پرونده ناقص"}
                    </span>
                  </div>
                </motion.div>
              ))}

              {filteredPatients.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">
                  بیماری با این مشخصات پیدا نشد
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* جزئیات بیمار */}
        {selectedPatient && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
          >
            <button
              onClick={() => setSelectedPatient(null)}
              className="flex items-center gap-2 mb-4 text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowRight size={16} />
              بازگشت به لیست بیماران
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4">
              <h2 className="font-bold text-lg text-slate-800 mb-3">
                {selectedPatient.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  سن: {selectedPatient.age}
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {selectedPatient.phone}
                </div>

                {selectedPatient.urgent && (
                  <div className="text-red-600 font-medium">
                    نیاز به پیگیری فوری
                  </div>
                )}
              </div>
            </div>

            {/* تب ها */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  activeTab === "appointments"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                نوبت ها
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  activeTab === "services"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                خدمات دریافتی
              </button>
            </div>

            <AnimatePresence mode="wait">

              {activeTab === "appointments" && (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {selectedPatient.appointments.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      نوبتی ثبت نشده است
                    </p>
                  ) : (
                    selectedPatient.appointments.map((a) => (
                      <div
                        key={a.id}
                        className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-slate-50"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} />
                          {a.date}
                        </div>

                        <div className="text-sm text-slate-700">
                          {a.doctor} - {a.type}
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "services" && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {selectedPatient.services.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      خدمتی ثبت نشده است
                    </p>
                  ) : (
                    selectedPatient.services.map((s) => (
                      <div
                        key={s.id}
                        className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-slate-50"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <HeartPulse size={16} />
                          {s.title}
                        </div>

                        <div className="text-sm text-slate-700">
                          {s.date}
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
