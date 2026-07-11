import { useState, useMemo } from "react";
import {
  Calendar,
  FileText,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import RenderDropdown from "../../pages/Auth/components/DropDown";
import SearchBox from "../Components/SearchBox";
import PersianDateInput from "../../components/PersianDateInput";

export default function ReferralAppointmentCard() {
  const [patientName, setPatientName] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const specialties = ["قلب", "داخلی", "روانشناسی", "ارتوپدی"];

  const doctors = [
    {
      name: "دکتر محمد احمدی",
      specialty: "قلب",
      capacity: "5 نوبت خالی",
      status: "available",
    },
    {
      name: "دکتر سارا کریمی",
      specialty: "روانشناسی",
      capacity: "ظرفیت تکمیل",
      status: "full",
    },
    {
      name: "دکتر علی رضایی",
      specialty: "داخلی",
      capacity: "2 نوبت خالی",
      status: "available",
    },
  ];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) =>
      doc.name.toLowerCase().includes(doctorSearch.toLowerCase())
    );
  }, [doctorSearch]);

  return (
    <div className="w-full rounded-[28px] bg-white border border-blue-100 shadow-sm p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-blue-100 pb-4">
        <h2 className="text-2xl font-bold text-blue-900">
          ارجاع و نوبت‌دهی
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          مدیریت نوبت‌دهی و ارجاع بیماران نیازمند
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="درخواست‌های فعال"
          value="24"
          icon={<FileText size={20} />}
          color="blue"
        />

        <StatCard
          title="نوبت‌های امروز"
          value="8"
          icon={<Calendar size={20} />}
          color="amber"
        />

        <StatCard
          title="ارجاع‌های تکمیل شده"
          value="56"
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
      </div>

      {/* Appointment Form */}
      <div className="bg-blue-50/40 border border-blue-100 rounded-3xl p-5 space-y-5">
        <h3 className="text-lg font-semibold text-blue-900">
          ثبت نوبت و ارجاع
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="نام بیمار"
            value={patientName}
            onChange={setPatientName}
            placeholder="نام بیمار را وارد کنید"
          />

          <RenderDropdown
            value={specialty}
            setValue={setSpecialty}
            options={specialties}
            name="specialty"
            placeholder="انتخاب تخصص پزشک"
            label="تخصص"
          />

          <RenderDropdown
            value={doctor}
            setValue={setDoctor}
            options={doctors.map((d) => d.name)}
            name="doctor"
            placeholder="انتخاب پزشک داوطلب"
            label="پزشک"
          />

          <div className="w-full">
            <label className="block mb-2 text-sm text-blue-700">
              تاریخ نوبت
            </label>

            <PersianDateInput
              value={appointmentDate}
              onChange={setAppointmentDate}
              className="!bg-blue-50/50 !border-blue-200 !rounded-2xl !p-4"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-blue-700">
            توضیحات وضعیت بیمار
          </label>

          <textarea
            rows={4}
            placeholder="توضیحات وضعیت بیمار..."
            className="w-full p-4 rounded-2xl border border-blue-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
            ثبت ارجاع
          </button>
        </div>
      </div>

      {/* Doctors */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-blue-900">
            ظرفیت پزشکان
          </h3>

          <SearchBox
            value={doctorSearch}
            onChange={setDoctorSearch}
            placeholder="جستجوی پزشک"
          />
        </div>

        <div className="space-y-3">
          {filteredDoctors.map((doctor, index) => (
            <DoctorCard key={index} {...doctor} />
          ))}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-900">
          وضعیت ارجاع‌ها
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-blue-100">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-blue-900">
              <tr className="text-right">
                <th className="px-4 py-4">بیمار</th>
                <th className="px-4 py-4">پزشک</th>
                <th className="px-4 py-4">تاریخ</th>
                <th className="px-4 py-4">وضعیت</th>
                <th className="px-4 py-4">پیگیری</th>
              </tr>
            </thead>

            <tbody>
              <ReferralRow
                patient="علی رضایی"
                doctor="دکتر احمدی"
                date="1405/02/20"
                status="در انتظار"
              />

              <ReferralRow
                patient="زهرا محمدی"
                doctor="دکتر کریمی"
                date="1405/02/21"
                status="تأیید شده"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-sm text-blue-700">{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 rounded-2xl border border-blue-200 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="bg-white border border-blue-100 rounded-3xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h4 className="text-2xl font-bold text-gray-800 mt-1">
          {value}
        </h4>
      </div>
    </div>
  );
}

function DoctorCard({ name, specialty, capacity, status }) {
  return (
    <div className="flex items-center justify-between border border-blue-100 rounded-3xl p-4 hover:bg-blue-50/50 transition">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-blue-100 text-blue-700">
          <UserRound size={20} />
        </div>

        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>

          <p className="text-sm text-gray-500 mt-1">
            {specialty}
          </p>
        </div>
      </div>

      <div
        className={`px-4 py-2 rounded-xl text-sm font-medium ${
          status === "available"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {capacity}
      </div>
    </div>
  );
}

function ReferralRow({ patient, doctor, date, status }) {
  return (
    <tr className="border-b border-blue-50 hover:bg-blue-50/30 transition">
      <td className="px-4 py-4">{patient}</td>

      <td className="px-4 py-4">{doctor}</td>

      <td className="px-4 py-4">{date}</td>

      <td className="px-4 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            status === "تأیید شده"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {status}
        </span>
      </td>

      <td className="px-4 py-4">
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          مشاهده
        </button>
      </td>
    </tr>
  );
}
