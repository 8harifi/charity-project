import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, User, XCircle } from "lucide-react";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "دکتر رضایی",
      date: "1405/02/30",
      time: "10:30",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "پزشک مشاور",
      date: "1405/03/02",
      time: "14:00",
      status: "pending",
    },
    {
      id: 3,
      doctor: "دکتر احمدی",
      date: "1405/03/05",
      time: "09:00",
      status: "cancelled",
    },
    
  ]);

  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "cancelled" } : a
      )
    );
  };

  const statusStyle = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const statusText = {
    confirmed: "تأیید شده",
    pending: "در انتظار",
    cancelled: "لغو شده",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow border border-slate-100 p-4 sm:p-6 space-y-5"
    >
      {/* هدر */}
      <h2 className="font-bold text-lg sm:text-xl border-r-4 border-blue-600 pr-3">
        پیگیری نوبت‌ها
      </h2>

      {appointments.length === 0 ? (
        <div className="text-center text-slate-400 py-10 text-sm">
          هنوز نوبتی ثبت نشده است
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <User size={16} />
                  {appt.doctor}
                </div>

                <div className="flex items-center gap-4 text-slate-500 text-xs">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {appt.date}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {appt.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-lg border ${statusStyle[appt.status]}`}
                >
                  {statusText[appt.status]}
                </span>

                {appt.status !== "cancelled" && (
                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <XCircle size={16} />
                    لغو نوبت
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PatientAppointments;
