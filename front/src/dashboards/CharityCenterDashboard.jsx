import React, { useState } from "react";
import { motion } from "framer-motion";
import DoctorsManagement from "./HealthCenterComponents/DoctorManagement";
import ConsultationForm from "./SalamatyarComponents/ConsultationForm";
import PatientsList from "./SalamatyarComponents/PatientsList";
import Messages from "./SalamatyarComponents/Messages";
import PatientSignup1 from "../pages/Auth/PatientSignup1";
import ReferralAppointmentCard from "./CharityCenterComponents/Schedule";
import DashboardShell from "./Components/DashboardShell";
import { User, CalendarPlus, Users, MessageSquare, Send } from "lucide-react";

const CharityCenterDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const charityCenterProfile = {
    name: "مرکز نیکوکاری رشد",
    memberSince: "1402/05/12",
    phoneNumber: "0938-322-4567",
    consultation: 67,
    newMessages: 13,
    patients: 157,
    activity: "استان",
    avatar: "/api/placeholder/120/120",
  };

  const headerStats = [
    { label: "پیام‌های جدید", value: charityCenterProfile.newMessages },
    { label: "مشاوره‌های ثبت‌شده", value: charityCenterProfile.consultation },
    { label: "تعداد بیماران", value: charityCenterProfile.patients },
  ];

  const tabs = [
    { id: "profile", label: "پروفایل مرکز نیکوکاری", icon: User },
    {
      id: "bookConsultation",
      label: "درخواست مشاوره برای بیمار",
      icon: CalendarPlus,
    },
    { id: "schedule", label: "نوبت‌دهی و ارجاع", icon: CalendarPlus },
    {
      id: "patientsList",
      label: "بیماران تحت پوشش",
      icon: Users,
    },
    { id: "messages", label: "پیام‌ها", icon: MessageSquare },
    { id: "patientIntroduction", label: "معرفی بیمار", icon: Send },
  ];

  return (
    <DashboardShell
      profile={charityCenterProfile}
      stats={headerStats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      brandSubtitle="پنل مرکز نیکوکاری"
    >
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-right"
        >
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-6">اطلاعات پروفایل</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <label className="text-gray-500 text-sm block mb-1">نام مرکز</label>
              <p className="font-semibold text-gray-800">{charityCenterProfile.name}</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <label className="text-gray-500 text-sm block mb-1">تاریخ عضویت</label>
              <p className="font-semibold text-gray-800">{charityCenterProfile.memberSince}</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <label className="text-gray-500 text-sm block mb-1">شماره تماس</label>
              <p className="font-semibold text-gray-800">{charityCenterProfile.phoneNumber}</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <label className="text-gray-500 text-sm block mb-1">محدوده فعالیت</label>
              <p className="font-semibold text-gray-800">{charityCenterProfile.activity}</p>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ویرایش پروفایل
          </button>
        </motion.div>
      )}

      {activeTab === "bookConsultation" && <ConsultationForm embedded />}
      {activeTab === "doctorsManagement" && <DoctorsManagement />}
      {activeTab === "schedule" && <ReferralAppointmentCard />}
      {activeTab === "patientsList" && <PatientsList />}
      {activeTab === "messages" && <Messages />}
      {activeTab === "patientIntroduction" && <PatientSignup1 />}
    </DashboardShell>
  );
};

export default CharityCenterDashboard;
