import React, { useState } from "react";
import { motion } from "framer-motion";
import Referral from "./HealthCenterComponents/Referral";
import DoctorsManagement from "./HealthCenterComponents/DoctorManagement";
import Messages from "./HealthCenterComponents/messages";
import DashboardShell from "./Components/DashboardShell";
import { User, Stethoscope, FileInput, MessagesSquare } from "lucide-react";

const HealthCenter = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const centerProfile = {
    name: "مرکز درمانی رضایی",
    memberSince: "1402/05/12",
    newRequests: "6",
    doneRecords: 130,
    activeRecords: 15,
    phoneNumber: "0939-346-8756",
    serviceType: "تصویربرداری",
    address: "خیابان ولیصر ، کوچه 7",
    avatar: "/api/placeholder/120/120",
  };

  const headerStats = [
    { label: "پرونده‌های تکمیل‌شده", value: centerProfile.doneRecords },
    { label: "درخواست‌های جدید", value: centerProfile.newRequests },
    { label: "پرونده‌های فعال", value: centerProfile.activeRecords },
  ];

  const tabs = [
    { id: "profile", label: "پروفایل مرکز", icon: User },
    { id: "referral", label: "ارجاعات", icon: FileInput },
    { id: "doctorsManagement", label: "مدیریت پزشکان", icon: Stethoscope },
    { id: "messages", label: "پیام‌ها", icon: MessagesSquare },
  ];

  return (
    <DashboardShell
      profile={centerProfile}
      stats={headerStats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      brandSubtitle="پنل مرکز درمانی"
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
              <p className="font-semibold text-gray-800">{centerProfile.name}</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <label className="text-gray-500 text-sm block mb-1">تاریخ عضویت</label>
              <p className="font-semibold text-gray-800">{centerProfile.memberSince}</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <label className="text-gray-500 text-sm block mb-1">شماره تماس</label>
              <p className="font-semibold text-gray-800">{centerProfile.phoneNumber}</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
              <label className="text-gray-500 text-sm block mb-1">نوع زیرمجموعه سلامتیار</label>
              <p className="font-semibold text-gray-800">{centerProfile.serviceType}</p>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl md:col-span-2">
              <label className="text-gray-500 text-sm block mb-1">آدرس</label>
              <p className="font-semibold text-gray-800">{centerProfile.address}</p>
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

      {activeTab === "referral" && <Referral />}
      {activeTab === "doctorsManagement" && <DoctorsManagement />}
      {activeTab === "messages" && <Messages />}
    </DashboardShell>
  );
};

export default HealthCenter;
