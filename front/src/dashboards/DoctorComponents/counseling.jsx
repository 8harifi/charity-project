import { useState } from "react";
import { motion } from "framer-motion";

const Counseling = () => {
  const [counselingTab, setCounselingTab] = useState("new");

  // داده‌های Mock – بعداً می‌توانند از API بیایند
  const newRequests = [
    {
      id: 1,
      name: "علی رضایی",
      type: "درمان / سوال درباره هزینه جراحی",
      status: "جدید",
    },
    {
      id: 2,
      name: "نرگس احمدی",
      type: "مالی / نیاز به راهنمایی در انتخاب کمپین مناسب",
      status: "جدید",
    },
    
  ];

  const doneRequests = [
    {
      id: 1,
      name: "سارا محسنی",
      result: "راهنمایی درباره مراحل مراجعه و توضیح مدارک لازم انجام شد.",
    },
    {
      id: 2,
      name: "محمد کرمی",
      result: "بررسی پرونده درمانی و معرفی کمپین مناسب انجام شد.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="text-right space-y-8"
    >
      {/* دکمه‌های تب */}
      <div className="flex justify-start gap-6 mb-6">
        <button
          onClick={() => setCounselingTab("new")}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            counselingTab === "new"
              ? "bg-blue-600 text-white shadow"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          درخواست‌های جدید
        </button>

        <button
          onClick={() => setCounselingTab("done")}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            counselingTab === "done"
              ? "bg-blue-600 text-white shadow"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          مشاوره‌های انجام‌شده
        </button>
      </div>

      {/* تب درخواست‌های جدید */}
      {counselingTab === "new" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {newRequests.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-emerald-500 transition-all"
            >
              <div className="flex justify-between mb-2">
                <p className="font-bold text-slate-800">
                  درخواست مشاوره از: {item.name}
                </p>

                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded">
                  {item.status}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-3">نوع مشاوره: {item.type}</p>

              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-blue-600 transition-all">
                  شروع
                </button>
                <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200 transition-all">
                  جزئیات
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* تب انجام‌شده‌ها */}
      {counselingTab === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {doneRequests.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:border-emerald-500 transition-all"
            >
              <div className="flex justify-between mb-2">
                <p className="font-bold text-slate-800">
                  مشاوره برای: {item.name}
                </p>
                <span className="px-2 py-1 text-sm bg-green-100 text-green-600 rounded">
                  انجام شد
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-3">{item.result}</p>

              <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200 transition-all">
                مشاهده گزارش مشاوره
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Counseling;
