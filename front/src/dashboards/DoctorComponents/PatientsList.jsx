import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AppointmentManagement = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalType, setModalType] = useState(null);

  // داده‌های نمونه
  const appointments = [
    {
      id: 1,
      name: "زهرا مرادی",
      type: "مشاوره جراحی ",
      status: "در انتظار زمان",
      date: "تعیین نشده",
    },
    {
      id: 2,
      name: "امیرحسین علوی",
      type: "مشاوره شیمی درمانی",
      status: "نوبت‌دهی شده",
      date: "۱۴۰۲/۰۵/۲۰ - ۱۰:۳۰",
    },
    {
      id: 3,
      name: "مهدی اکبری",
      type: "مشاوره درمانی عمومی",
      status: "تکمیل شده",
      date: "۱۴۰۲/۰۵/۱۵",
    },
  ];

  const openModal = (patient, type) => {
    setSelectedPatient(patient);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setModalType(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          مدیریت نوبت‌های مشاوره
        </h2>
        <div className="text-sm text-slate-600">
          تعداد کل: {appointments.length} مورد
        </div>
      </div>

      {/* جدول مدیریت */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-emerald-700 text-white">
              <th className="px-6 py-4 text-right">نام بیمار</th>
              <th className="px-6 py-4 text-right">نوع مشاوره</th>
              <th className="px-6 py-4 text-right">وضعیت نوبت</th>
              <th className="px-6 py-4 text-right">زمان تنظیم شده</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((app, index) => (
              <tr
              
                key={app.id}
                className={`transition-colors hover:bg-slate-200 ${
                  index % 2 === 0 ? "bg-slate-100" : "bg-white"
                }`}
              >
                <td className="p-4 text-slate-800 font-medium">{app.name}</td>
                <td className="p-4 text-slate-600 text-sm">{app.type}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      app.status === "در انتظار زمان"
                        ? "bg-amber-100 text-amber-700"
                        : app.status === "نوبت‌دهی شده"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm ">{app.date}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(app, "time")}
                      className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all"
                    >
                      تعیین زمان
                    </button>
                    <button
                      onClick={() => openModal(app, "result")}
                      className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-md transition-all"
                    >
                      ثبت نتیجه
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مدال‌های مدیریت (Modals) */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6 text-right"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {modalType === "time"
                  ? `تعیین زمان مشاوره: ${selectedPatient.name}`
                  : `ثبت نتیجه مشاوره: ${selectedPatient.name}`}
              </h3>

              {modalType === "time" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      انتخاب تاریخ
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      انتخاب ساعت
                    </label>
                    <input
                      type="time"
                      className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ring-blue-500/20"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      یادداشت پزشک / نتیجه نهایی
                    </label>
                    <textarea
                      rows="4"
                      className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 ring-emerald-500/20"
                      placeholder="جزئیات مشاوره را اینجا بنویسید..."
                    ></textarea>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                >
                  انصراف
                </button>
                <button
                  className={`flex-1 py-2 text-white rounded-lg transition-all ${
                    modalType === "time"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  ذخیره تغییرات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppointmentManagement;
