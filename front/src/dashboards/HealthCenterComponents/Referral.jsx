import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RenderDropdown from "../../pages/Auth/components/DropDown";
import SearchBox from "../Components/SearchBox";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Send,
  User,
  CalendarClock,
  Filter,
  Building2,
  Stethoscope,
} from "lucide-react";

const Referral = () => {
  const [cases, setCases] = useState([
    {
      id: "HC-10421",
      source: "مددکار",
      receivedAt: "1403/02/12 - 10:20",
      patientName: "مریم احمدی",
      nationalId: "4432234123",
      service: "MRI زانو",
      note: "درد مزمن در زانو، بررسی رباط",
      status: "new",
      rejectionReason: "",
      assignedTo: null,
    },
    {
      id: "SYS-22018",
      source: "سامانه",
      receivedAt: "1403/02/11 - 17:05",
      patientName: "علی رضایی",
      nationalId: "4567865678",
      service: "X-Ray قفسه سینه",
      note: "تصویر جهت تشخیص التهاب",
      priority: "عادی",
      status: "approved",
      rejectionReason: "",
      assignedTo: null,
    },
  ]);

  const destinations = [
    "واحد تصویربرداری",
    "واحد پذیرش",
    "دکتر محمدی",
    "دکتر حسینی",
  ];

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("همه");
  const [rejectModal, setRejectModal] = useState(null);
  const [transferModal, setTransferModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [transferDestination, setTransferDestination] = useState("");

  // فیلتر پرونده‌ها
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesQuery =
        !query ||
        c.patientName.includes(query) ||
        c.service.includes(query) ||
        c.id.includes(query);
      const matchesStatus =
        statusFilter === "همه" || c.status === statusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });
  }, [cases, query, statusFilter]);

  // تغییر وضعیت پرونده‌ها
  const approveCase = (id) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
    );
  };

  const rejectCase = (id, reason) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "rejected", rejectionReason: reason } : c
      )
    );
  };

  const transferCase = (id, destination) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "transferred", assignedTo: destination }
          : c
      )
    );
  };

  const statusStyles = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    transferred: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const statusLabels = {
    new: "جدید",
    approved: "تأیید شده",
    rejected: "رد شده",
    transferred: "ارجاع شده",
  };

  return (
    <div className="text-right space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          ارجاعات
        </h2>
        <p className=" text-gray-500">
          پرونده‌های دریافتی از مددکاران یا سامانه
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="جستجو در نام بیمار یا خدمت..."
        />

        <div className="w-full md:w-64">
          <div className="flex mb-2 mr-2 gap-2">
            <label className="text-gray-600">فیلتر بر اساس وضعیت</label>
            <Filter className="text-gray-500" size={18} />
          </div>
          <RenderDropdown
            value={statusFilter}
            setValue={setStatusFilter}
            options={["همه", "جدید", "تایید شده", "رد شده", "ارجاع شده"]}
            name="statusFilter"
            placeholder="انتخاب وضعیت پرونده"
          />
        </div>
      </div>

      {/* List of cases */}
      <motion.div layout className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-600">
            پرونده‌ای یافت نشد
          </div>
        ) : (
          filteredCases.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* اطلاعات پرونده */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 mb-2 text-gray-700 font-semibold">
                    <ClipboardList size={18} />
                    {c.id}
                    <span
                      className={`px-3 py-1 text-xs rounded-full border ${
                        statusStyles[c.status]
                      }`}
                    >
                      وضعیت: {statusLabels[c.status]}
                    </span>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3 shadow-sm shadow-blue-200">
                    <div>
                      <label className="text-gray-500 text-xs">بیمار ، کد ملی</label>
                      <div className="font-semibold flex items-center gap-3 flex-wrap">
                        <User size={16} className="text-gray-500" />
                        <span>{c.patientName}</span>
                       
                        <span className="text-gray-600 font-mono text-sm">
                          {c.nationalId}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-500 text-xs">
                        تاریخ دریافت
                      </label>
                      <div className="text-gray-700 flex items-center gap-2">
                        <CalendarClock size={16} className="text-gray-500" />
                        {c.receivedAt}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-gray-500 text-xs">خدمت</label>
                      <div className="font-semibold text-gray-800">
                        {c.service}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{c.note}</p>

                      {c.status === "rejected" && (
                        <p className="text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 mt-3">
                          <b>دلیل رد:</b> {c.rejectionReason}
                        </p>
                      )}
                      {c.status === "transferred" && c.assignedTo && (
                        <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 flex items-center gap-1">
                          <Send size={16} />
                          ارجاع شده به: {c.assignedTo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* دکمه‌ها */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[220px]">
                  <button
                    onClick={() => approveCase(c.id)}
                    disabled={c.status !== "new"}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      c.status === "new"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    تأیید پرونده
                  </button>

                  <button
                    onClick={() => setRejectModal(c)}
                    disabled={c.status !== "new"}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      c.status === "new"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <XCircle size={18} />
                    رد پرونده
                  </button>

                  <button
                    onClick={() => setTransferModal(c)}
                    disabled={c.status === "rejected"}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                      c.status !== "rejected"
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send size={18} />
                    ارجاع پرونده
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* مودال رد پرونده */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-3 text-gray-800">
                رد پرونده - {rejectModal.id}
              </h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="دلیل رد را وارد کنید..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-600 outline-none"
              />
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={() => setRejectModal(null)}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  انصراف
                </button>
                <button
                  onClick={() => {
                    rejectCase(rejectModal.id, rejectReason);
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  disabled={!rejectReason.trim()}
                  className={`px-4 py-2 rounded-lg font-semibold text-white ${
                    rejectReason.trim()
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-rose-200 cursor-not-allowed"
                  }`}
                >
                  ثبت رد پرونده
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال ارجاع پرونده */}
      <AnimatePresence>
        {transferModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTransferModal(null)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-3 text-gray-800">
                ارجاع پرونده - {transferModal.id}
              </h3>

              <RenderDropdown
                value={transferDestination}
                setValue={setTransferDestination}
                options={destinations}
                name="transferDestination"
                label="انتخاب مقصد ارجاع"
                placeholder="واحد یا پزشک مورد نظر را انتخاب کنید"
              />

              <div className="flex gap-2 mt-5 justify-end">
                <button
                  onClick={() => setTransferModal(null)}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  انصراف
                </button>
                <button
                  onClick={() => {
                    transferCase(transferModal.id, transferDestination);
                    setTransferModal(null);
                    setTransferDestination("");
                  }}
                  disabled={!transferDestination}
                  className={`px-4 py-2 rounded-lg font-semibold text-white ${
                    transferDestination
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-amber-200 cursor-not-allowed"
                  }`}
                >
                  ثبت ارجاع
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Referral;
