import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Users, Building2, Shield, Send } from "lucide-react";
import RenderDropdown from "../../pages/Auth/components/DropDown";

const Messages = () => {
  const [section, setSection] = useState("doctors");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const bottomRef = useRef(null);

  const doctors = ["دکتر احمدی", "دکتر رضایی"];
  const centers = ["بیمارستان امید", "کلینیک سلامت"];
  const managers = ["مدیر شبکه درمان استان"];

  // گرفتن تاریخ و زمان
  const getNow = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("fa-IR"),
      time: now.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };


  // گرفتن لیست مخاطبین هر تب
  const getOptions = () => {
    if (section === "doctors") return doctors;
    if (section === "centers") return centers;
    return managers;
  };

  // ارسال پیام توسط پزشک
  const sendMessage = () => {
    if (!receiver || !message.trim()) return;

    const now = getNow();

    const newMessage = {
      id: crypto.randomUUID(),
      text: message.trim(),
      sender: "doctor",
      receiver,
      type: section,
      date: now.date,
      time: now.time,
      read: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // شبیه سازی پاسخ نهاد
    setTimeout(() => {
      simulateIncomingMessage(receiver, section);
    }, 2000);
  };

  // شبیه سازی دریافت پیام از نهادها
  const simulateIncomingMessage = (receiverName, type) => {
    const now = getNow();

    const replies = {
      doctors: "پرونده بیمار بررسی شد ",
      centers: "نتیجه آزمایش آماده است.",
      managers: "لطفاً گزارش ماهانه را ارسال کنید.",
    };

    const newIncoming = {
      id: crypto.randomUUID(),
      text: replies[type],
      sender: type,
      receiver: receiverName,
      type,
      date: now.date,
      time: now.time,
      read: false,
    };

    setMessages((prev) => [...prev, newIncoming]);

    // افزایش unread اگر چت باز نباشد
    if (receiver !== receiverName || section !== type) {
      setUnreadCounts((prev) => ({
        ...prev,
        [type]: (prev[type] || 0) + 1,
      }));
    }
  };

  // وقتی کاربر مخاطب را باز می‌کند unread صفر شود
  useEffect(() => {
    if (!receiver) return;

    setUnreadCounts((prev) => ({
      ...prev,
      [section]: 0,
    }));

    setMessages((prev) =>
      prev.map((msg) =>
        msg.type === section && msg.receiver === receiver
          ? { ...msg, read: true }
          : msg
      )
    );
  }, [receiver, section]);

  const filteredMessages = messages.filter(
    (m) => m.type === section && m.receiver === receiver
  );

  const tabButton = (key, label, icon) => (
    <button
      type="button"
      onClick={() => {
        setSection(key);
        setReceiver("");
      }}
      className={`relative flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
        section === key
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>

      {unreadCounts[key] > 0 && (
        <span className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
          {unreadCounts[key]}
        </span>
      )}
    </button>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow border border-slate-100 space-y-5 max-w-4xl mx-auto">

      <h2 className="text-lg sm:text-xl font-bold border-r-4 border-blue-600 pr-3">
        پیام‌ها
      </h2>

      {/* تب‌ها */}
      <div className="flex gap-2 overflow-x-auto">
        {tabButton("doctors", "پزشکان", <Users size={18} />)}
        {tabButton("centers", "مراکز", <Building2 size={18} />)}
        {tabButton("managers", "مدیریت", <Shield size={18} />)}
      </div>

      {/* انتخاب مخاطب */}
      <RenderDropdown
        value={receiver}
        setValue={setReceiver}
        options={getOptions()}
        name="receiver"
        label="انتخاب مخاطب"
        placeholder="انتخاب کنید"
      />

      {/* چت باکس */}
      <div className="h-80 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        {filteredMessages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            هنوز پیامی وجود ندارد
          </div>
        )}

        {filteredMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              msg.sender === "doctor"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm break-words shadow-sm
              ${
                msg.sender === "doctor"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white border border-slate-200 rounded-bl-md"
              }`}
            >
              {msg.text}

              <div className="text-[10px] opacity-70 mt-1 flex gap-1 justify-end">
                <span>{msg.time}</span>
                <span>{msg.read ? "✓✓" : "✓"}</span>
              </div>
            </div>
          </motion.div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* ارسال پیام */}
      <div className="flex gap-2 items-end">
        <textarea
          rows={1}
          value={message}
          placeholder="پیام خود را بنویسید..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={!receiver || !message.trim()}
          className="h-[44px] w-[44px] flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Messages;
