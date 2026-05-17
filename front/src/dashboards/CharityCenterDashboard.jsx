import React, { useState } from "react";
import { motion } from "framer-motion";
import Referral from "./HealthCenterComponents/Referral";
import DoctorsManagement from "./HealthCenterComponents/DoctorManagement";
import ConsultationForm from "./SalamatyarComponents/ConsultationForm";
import ReceiveService from "./SalamatyarComponents/ReceiveServices";
import PatientsList from "./SalamatyarComponents/PatientsList";
import Messages from "./SalamatyarComponents/Messages";
import PatientSignup1 from "../pages/Auth/PatientSignup1";
import ReferralAppointmentCard from "./CharityCenterComponents/Schedule";

import {
  User,
  FileInput,
  CalendarPlus,
  Users,
  MessageSquare,
  Send,
} from "lucide-react";

const CharityCenterDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const CharityCenterProfile = {
    name: "مرکز نیکوکاری رشد",
    memberSince: "1402/05/12",
    phoneNumber: "0938-322-4567",
    consultation: 67,
    newMessages: 13,
    patients: 157,
    activity: "استان",
    avatar: "/api/placeholder/120/120",
  };

  const tabs = [
    { id: "profile", label: "پروفایل مرکز نیکوکاری", icon: User },
    {
      id: "bookConsultation",
      label: "فرم درخواست دریافت مشاوره برای بیمار",
      icon: CalendarPlus,
    },
     {
      id: "schedule",
      label: "نوبت دهی و ارجاع",
      icon: CalendarPlus,
    },
    {
      id: "patientsList",
      label: "لیست بیماران تحت پوشش مرکز نیکوکاری",
      icon: Users,
    },
    { id: "messages", label: "پیام ها", icon: MessageSquare },
    { id: "patientIntroduction", label: "معرفی بیمار به سامانه", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-[#e0e0e0] font-kook pt-[80px] pb-[40px]">
      <div className="container mx-auto px-4 lg:px-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-900 to-emerald-700 rounded-2xl p-5 sm:p-8 mb-8 text-white"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <img
                src={CharityCenterProfile.avatar}
                alt="profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
              />

              <div className="text-center sm:text-right">
                <h1 className="text-xl sm:text-3xl font-bold mb-1">
                  سلام، {CharityCenterProfile.name}
                </h1>
                <p className="text-blue-100 text-sm">
                  عضو از تاریخ: {CharityCenterProfile.memberSince}
                </p>
              </div>
            </div>

            {/* stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center w-full sm:w-auto">
              <div>
                <p className="text-2xl sm:text-4xl font-bold">
                  {CharityCenterProfile.newMessages}
                </p>
                <p className="text-blue-100 text-xs sm:text-sm">
                  پیام های جدید
                </p>
              </div>

              <div>
                <p className="text-2xl sm:text-4xl font-bold">
                  {CharityCenterProfile.consultation}
                </p>
                <p className="text-blue-100 text-xs sm:text-sm">
                مشاوره های ثبت شده
                </p>
              </div>

              <div>
                <p className="text-2xl sm:text-4xl font-bold">
                  {CharityCenterProfile.patients}
                </p>
                <p className="text-blue-100 text-xs sm:text-sm">
                  تعداد بیماران
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden"
        >
          {/* Tab buttons */}
          <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 whitespace-nowrap font-semibold transition-all text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-900 to-emerald-700 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="text-right"
              >
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-6">
                  اطلاعات پروفایل
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <label className="text-gray-500 text-sm block mb-1">
                  نام مرکز
                    </label>
                    <p className="font-semibold text-gray-800">
                      {CharityCenterProfile.name}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <label className="text-gray-500 text-sm block mb-1">
                      تاریخ عضویت
                    </label>
                    <p className="font-semibold text-gray-800">
                      {CharityCenterProfile.memberSince}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <label className="text-gray-500 text-sm block mb-1">
                      شماره تماس
                    </label>
                    <p className="font-semibold text-gray-800">
                      {CharityCenterProfile.phoneNumber}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                    <label className="text-gray-500 text-sm block mb-1">
                     محدوده فعالیت
                    </label>
                    <p className="font-semibold text-gray-800">
                      {CharityCenterProfile.activity}
                    </p>
                  </div>
                </div>

                <button className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                  ویرایش پروفایل
                </button>
              </motion.div>
            )}

            {activeTab === "bookConsultation" && < ConsultationForm/>}
            {activeTab === "doctorsManagement" && <DoctorsManagement />}
            {activeTab === "schedule" && <ReferralAppointmentCard />}
            {activeTab === "patientsList" && <PatientsList />}
            {activeTab === "messages" && <Messages />}
            {activeTab === "patientIntroduction" && <PatientSignup1 />}




          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CharityCenterDashboard;
