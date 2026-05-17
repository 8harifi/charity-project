import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBox from "../Components/SearchBox";
import {
  UserCheck,
  CalendarClock,
  ClipboardList,
  Stethoscope,
  Clock , 
} from "lucide-react";

const DoctorsManagement = () => {
  const tabs = [
    "پزشکان فعال",
    "پزشکان در انتظار تایید",
    "برنامه نوبت‌دهی پزشکان",
    "پرونده‌های پزشکان",
  ];

  const [activeTab, setActiveTab] = useState("پزشکان فعال");
  const [search, setSearch] = useState("");

  // داده نمونه پزشکان فعال
  const activeDoctors = [
    {
      id: 1,
      name: "دکتر محمدی",
      specialty: "ارتوپدی",
      phone: "09120000001",
      cases: 12,
    },
    {
      id: 2,
      name: "دکتر حسینی",
      specialty: "قلب و عروق",
      phone: "09120000002",
      cases: 8,
    },
  ];

  // لیست پزشکان در انتظار تایید
  const pendingDoctors = [
    { id: 10, name: "دکتر احمدی", specialty: "داخلی", requestedAt: "1403/01/20" },
    { id: 11, name: "دکتر رضوی", specialty: "طب اورژانس", requestedAt: "1403/01/22" },
  ];

  // برنامه زمان‌بندی نوبت‌دهی
  const schedules = [
    {
      doctor: "دکتر محمدی",
      days: "شنبه - دوشنبه - چهارشنبه",
      time: "14:00 تا 18:00",
    },
    {
      doctor: "دکتر حسینی",
      days: "یکشنبه - سه‌شنبه",
      time: "10:00 تا 13:00",
    },
  ];

  // پرونده‌های پزشکان
  const doctorCases = [
    {
      doctor: "دکتر محمدی",
      cases: [
        { id: "CS-1501", patient: "علی یوسفی", service: "MRI زانو" },
        { id: "CS-1510", patient: "الهام ایمانی", service: "X-Ray ستون فقرات" },
      ],
    },
    {
      doctor: "دکتر حسینی",
      cases: [
        { id: "CS-1600", patient: "رضا غفوری", service: "اکوکاردیوگرافی" },
      ],
    },
  ];

  // فیلتر پزشکان فعال
  const filteredActiveDoctors = activeDoctors.filter(
    (doc) =>
      doc.name.includes(search) ||
      doc.specialty.includes(search) ||
      doc.phone.includes(search)
  );

  // فیلتر پزشکان در انتظار تایید
  const filteredPendingDoctors = pendingDoctors.filter(
    (doc) =>
      doc.name.includes(search) ||
      doc.specialty.includes(search) ||
      doc.requestedAt.includes(search)
  );

  // فیلتر برنامه نوبت‌دهی
  const filteredSchedules = schedules.filter(
    (sch) =>
      sch.doctor.includes(search) ||
      sch.days.includes(search) ||
      sch.time.includes(search)
  );

  // فیلتر پرونده‌های پزشکان
  const filteredDoctorCases = doctorCases
    .map((doc) => ({
      ...doc,
      cases: doc.cases.filter(
        (c) =>
          c.id.includes(search) ||
          c.patient.includes(search) ||
          c.service.includes(search) ||
          doc.doctor.includes(search)
      ),
    }))
    .filter((doc) => doc.cases.length > 0 || doc.doctor.includes(search));

  return (
    <div className="text-right space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">مدیریت پزشکان</h2>
      <p className="text-gray-600">مدیریت وضعیت پزشکان و برنامه نوبت‌دهی</p>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              setSearch("");
            }}
            className={`px-4 py-2 -mb-px border-b-2 transition font-semibold
              ${
                activeTab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={`جستجو در ${activeTab}`}
      />

      {/* محتوا */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* 1. پزشکان فعال */}
          {activeTab === "پزشکان فعال" && (
            <div className="space-y-4">
              {filteredActiveDoctors.length > 0 ? (
                filteredActiveDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm shadow-gray-300 hover:border-green-500 transition"
                  >
                    <div className="flex items-center gap-3 text-gray-800 font-semibold mb-2">
                      <UserCheck size={20} />
                      {doc.name}
                    </div>
                    <p className="text-gray-700">تخصص: {doc.specialty}</p>
                    <p className="text-gray-700">شماره تماس: {doc.phone}</p>
                    <p className="text-gray-700 mt-2">
                      پرونده‌های فعال: <b>{doc.cases}</b>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">موردی یافت نشد.</p>
              )}
            </div>
          )}

          {/* 2. پزشکان در انتظار تایید */}
          {activeTab === "پزشکان در انتظار تایید" && (
            <div className="space-y-4">
              {filteredPendingDoctors.length > 0 ? (
                filteredPendingDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-yellow-50 border border-red-200 p-5 rounded-xl shadow-sm shadow-red-300"
                  >
                    <div className="flex items-center gap-3 font-semibold text-yellow-700 mb-2">
                      <Clock size={20} />
                      {doc.name}
                    </div>
                    <p className="text-gray-700">تخصص: {doc.specialty}</p>
                    <p className="text-gray-700 mt-1">درخواست در تاریخ: {doc.requestedAt}</p>

                    <div className="flex gap-2 mt-3">
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                        تایید پزشک
                      </button>
                      <button className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700">
                        رد درخواست
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">موردی یافت نشد.</p>
              )}
            </div>
          )}

          {/* 3. برنامه نوبت‌دهی */}
          {activeTab === "برنامه نوبت‌دهی پزشکان" && (
            <div className="space-y-4">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((sch, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 border border-blue-200 p-5 rounded-xl shadow-sm shadow-blue-300"
                  >
                    <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                      <CalendarClock size={20} />
                      {sch.doctor}
                    </div>
                    <p className="text-gray-700">روزهای حضور: {sch.days}</p>
                    <p className="text-gray-700">ساعت کاری: {sch.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">موردی یافت نشد.</p>
              )}
            </div>
          )}

          {/* 4. پرونده‌های پزشکان */}
          {activeTab === "پرونده‌های پزشکان" && (
            <div className="space-y-5">
              {filteredDoctorCases.length > 0 ? (
                filteredDoctorCases.map((doc, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-xl p-5 shadow-sm border-blue-400 shadow-blue-500"
                  >
                    <div className="flex items-center gap-3 font-semibold mb-3 text-blue-800">
                      <Stethoscope size={20} />
                      {doc.doctor}
                    </div>

                    {doc.cases.length > 0 ? (
                      doc.cases.map((c) => (
                        <div
                          key={c.id}
                          className="border border-gray-200 p-3 rounded-lg mb-2 bg-gray-50 hover:border-green-600"
                        >
                          <div className="flex items-center gap-2 text-gray-800 font-semibold">
                            <ClipboardList size={16} />
                            {c.id}
                          </div>
                          <p className="text-gray-600">بیمار: {c.patient}</p>
                          <p className="text-gray-600">خدمت: {c.service}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">پرونده‌ای یافت نشد.</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">موردی یافت نشد.</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DoctorsManagement;