import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Video, WifiOff, Wifi, Send } from "lucide-react";
import RenderDropdown from "../../pages/Auth/components/DropDown";

const PatientConsultation = () => {
  const [mode, setMode] = useState("online"); // online | offline
  const [isOnline, setIsOnline] = useState(navigator.onLine); // وضعیت واقعی اینترنت
  const [callType, setCallType] = useState("text");
  const [textReceiver, setTextReceiver] = useState("");
  const [voiceReceiver, setVoiceReceiver] = useState("");
  const [videoReceiver, setVideoReceiver] = useState("");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const contacts = ["دکتر رضایی", "مددکار احمدی", "پزشک مشاور"];

  // تشخیص واقعی وضعیت اینترنت
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // وضعیت نهایی
  const networkAvailable = mode === "online" && isOnline;

  const sendMessage = () => {
    if (!receiver || !message.trim()) return;

    const now = new Date();
    const newMsg = {
      id: crypto.randomUUID(),
      text: message,
      sender: "patient",
      receiver,
      time: now.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    if (networkAvailable) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: "پاسخ مشاور: پیام شما دریافت شد.",
            sender: "consultant",
            receiver,
            time: now.toLocaleTimeString("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }, 1500);
    }
  };

  const tabButton = (key, label, icon) => (
    <button
      onClick={() => setCallType(key)}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition ${
        callType === key
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
 const receiver =
  callType === "text"
    ? textReceiver
    : callType === "voice"
    ? voiceReceiver
    : videoReceiver;

const setReceiver =
  callType === "text"
    ? setTextReceiver
    : callType === "voice"
    ? setVoiceReceiver
    : setVideoReceiver;

const filteredMessages = messages.filter(
  (m) => m.receiver === receiver
);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow border border-slate-100 p-4 sm:p-6 space-y-5"
    >
      {/* هدر */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg sm:text-xl border-r-4 border-blue-600 pr-3">
          مشاوره بیمار
        </h2>

        <button
          className={`flex items-center gap-1 text-xs sm:text-sm px-3 py-1.5 rounded-xl transition border ${
            networkAvailable
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {networkAvailable ? <Wifi size={16} /> : <WifiOff size={16} />}
          {networkAvailable ? "آنلاین" : "آفلاین"}
        </button>
      </div>

      {/* نوع تماس */}
      <div className="flex gap-2 overflow-x-auto">
        {tabButton("text", "تماس متنی", <MessageCircle size={18} />)}
        {tabButton("voice", "تماس صوتی", <Phone size={18} />)}
        {tabButton("video", "تماس تصویری", <Video size={18} />)}
      </div>

      {/* انتخاب مشاور */}
      <RenderDropdown
        value={receiver}
        setValue={setReceiver}
        options={contacts}
        name="receiver"
        label="انتخاب مشاور یا پزشک"
        placeholder="انتخاب کنید"
      />

      {/* قسمت تماس */}
      {callType === "text" ? (
        <>
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
                  msg.sender === "patient" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm break-words shadow-sm
              ${
                msg.sender === "patient"
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
        </>
      ) : callType === "voice" ? (
        <div className="flex flex-col items-center justify-center h-72 bg-slate-50 border border-slate-200 rounded-2xl">
          <motion.div
            initial={{ scale: 0.95, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              repeat: networkAvailable ? Infinity : 0,
              repeatType: "reverse",
              duration: 1,
            }}
            className="p-5 bg-blue-600 text-white rounded-full"
          >
            <Phone size={40} />
          </motion.div>

          <p className="mt-4 text-sm text-slate-600">
            {networkAvailable
              ? receiver
                ? `در حال برقراری تماس صوتی با ${receiver}...`
                : "لطفاً مخاطب را انتخاب کنید"
              : "اتصال اینترنت برقرار نیست"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-72 bg-slate-50 border border-slate-200 rounded-2xl">
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: networkAvailable ? [0.7, 1, 0.7] : 0.7 }}
            transition={{
              repeat: networkAvailable ? Infinity : 0,
              duration: 2,
            }}
            className="relative w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white"
          >
            <Video size={36} />
          </motion.div>

          <p className="mt-4 text-sm text-slate-600">
            {networkAvailable
              ? receiver
                ? `در حال شروع تماس تصویری با ${receiver}...`
                : "لطفاً مخاطب را انتخاب کنید"
              : "اتصال اینترنت برقرار نیست"}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PatientConsultation;
