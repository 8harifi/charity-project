import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  User,
  CheckCircle,
  Loader2,
  Building2,
  HeadphonesIcon
} from "lucide-react";
import ContactBackground3D from "../copmonent/home/ContactBackground3D";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: ""
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "تلفن تماس",
      value: "۰۲۱-۱۲۳۴۵۶۷۸",
      sub: "ساعات پاسخگویی: ۸ تا ۲۰",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      gradient: "from-blue-500 to-blue-400",
      shadow: "shadow-blue-100/50"
    },
    {
      icon: Mail,
      title: "ایمیل",
      value: "info@healthassist.ir",
      sub: "پاسخگویی در اسرع وقت",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
      gradient: "from-emerald-500 to-emerald-400",
      shadow: "shadow-emerald-100/50"
    },
    {
      icon: MapPin,
      title: "آدرس",
      value: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      sub: "ساختمان مرکزی همراه سلامت",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      gradient: "from-purple-500 to-purple-400",
      shadow: "shadow-purple-100/50"
    },
    {
      icon: Clock,
      title: "ساعات کاری",
      value: "شنبه تا چهارشنبه",
      sub: "۹:۰۰ تا ۱۷:۰۰",
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      gradient: "from-amber-500 to-amber-400",
      shadow: "shadow-amber-100/50"
    }
  ];

  const socials = [
    { icon: "📸", href: "#", label: "اینستاگرام", color: "from-pink-500 to-purple-600" },
    { icon: "✈️", href: "#", label: "تلگرام", color: "from-blue-500 to-cyan-400" },
    { icon: "💼", href: "#", label: "لینکدین", color: "from-blue-600 to-blue-800" },
    { icon: "▶️", href: "#", label: "یوتیوب", color: "from-red-500 to-red-700" },
  ];

  return (
    <>
      <ContactBackground3D />
      
      <section className="relative z-10 font-kook py-12 sm:py-20 md:py-28" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header - ریسپانسیو */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-l from-blue-900 to-emerald-700 bg-clip-text text-transparent">
              تماس با ما
            </h2>
            <p className="text-blue-600/80 text-base sm:text-lg max-w-2xl mx-auto mt-3 sm:mt-4 px-4">
              ما همواره منتظر شنیدن نظرات، پیشنهادات و سوالات شما هستیم
            </p>
          </motion.div>

          {/* Main Grid - ریسپانسیو */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Contact Info - در موبایل ۱ ستون، در دسکتاپ ۲/۵ */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1"
            >
              {/* Info Cards - ریسپانسیو */}
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-200 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-l ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.bgColor} flex items-center justify-center ${item.textColor} group-hover:scale-110 transition-transform duration-300 shadow-md ${item.shadow}`}>
                      <item.icon size={18} className="sm:w-[22px] sm:h-[22px]" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">{item.title}</p>
                      <p className="text-blue-900 font-bold text-xs sm:text-sm mt-0.5">{item.value}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Social Media - ریسپانسیو */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-blue-100/50 shadow-lg"
              >
                <h3 className="text-xs sm:text-sm font-bold text-blue-900 text-right mb-3 sm:mb-4">
                  ما را در شبکه‌های اجتماعی دنبال کنید
                </h3>
                <div className="flex gap-2 sm:gap-3 justify-start flex-wrap">
                  {socials.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -4, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-md hover:shadow-2xl transition-all duration-300 text-base sm:text-xl`}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Quick Support - ریسپانسیو */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-l from-blue-600 to-emerald-600 p-4 sm:p-5 rounded-2xl shadow-2xl text-white backdrop-blur-md"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <HeadphonesIcon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs sm:text-sm font-medium opacity-90">پشتیبانی ۲۴/۷</p>
                    <p className="text-[10px] sm:text-xs opacity-80">همیشه در خدمت شما هستیم</p>
                    <p className="text-base sm:text-lg font-bold mt-1">۰۲۱-۱۲۳۴۵۶۷۸</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form - در موبایل ۱ ستون، در دسکتاپ ۳/۵ */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 order-1 lg:order-2"
            >
              <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-blue-100/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-md">
                    <Send size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-base sm:text-lg">ارسال پیام</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">ما در اسرع وقت پاسخگوی شما خواهیم بود</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 sm:py-12"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-lg shadow-emerald-100/50">
                      <CheckCircle size={32} className="sm:w-10 sm:h-10" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900">پیام شما ارسال شد!</h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2 text-center max-w-sm px-4">
                      از شما سپاسگزاریم. کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {/* Name & Phone - ریسپانسیو */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-right text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                          نام و نام خانوادگی
                        </label>
                        <div className="relative">
                          <User size={16} className="sm:w-[18px] sm:h-[18px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="نام خود را وارد کنید"
                            className="w-full py-2.5 sm:py-3 pr-9 sm:pr-10 pl-3 sm:pl-4 rounded-xl border-2 border-blue-100 bg-white/50 text-right text-sm sm:text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 placeholder:text-gray-400 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-right text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                          شماره تماس
                        </label>
                        <div className="relative">
                          <Phone size={16} className="sm:w-[18px] sm:h-[18px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                            className="w-full py-2.5 sm:py-3 pr-9 sm:pr-10 pl-3 sm:pl-4 rounded-xl border-2 border-blue-100 bg-white/50 text-right text-sm sm:text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 placeholder:text-gray-400 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email & Subject - ریسپانسیو */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-right text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                          ایمیل
                        </label>
                        <div className="relative">
                          <Mail size={16} className="sm:w-[18px] sm:h-[18px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            className="w-full py-2.5 sm:py-3 pr-9 sm:pr-10 pl-3 sm:pl-4 rounded-xl border-2 border-blue-100 bg-white/50 text-right text-sm sm:text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 placeholder:text-gray-400 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-right text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                          موضوع
                        </label>
                        <div className="relative">
                          <Building2 size={16} className="sm:w-[18px] sm:h-[18px] absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="موضوع پیام"
                            className="w-full py-2.5 sm:py-3 pr-9 sm:pr-10 pl-3 sm:pl-4 rounded-xl border-2 border-blue-100 bg-white/50 text-right text-sm sm:text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 placeholder:text-gray-400 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Message - ریسپانسیو */}
                    <div>
                      <label className="block text-right text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
                        متن پیام
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="پیام خود را بنویسید..."
                        className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border-2 border-blue-100 bg-white/50 text-right text-sm sm:text-base outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 placeholder:text-gray-400 resize-none backdrop-blur-sm"
                      />
                    </div>

                    {/* Submit Button - ریسپانسیو */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-l from-blue-600 to-emerald-600 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
                          <span className="text-sm sm:text-base">در حال ارسال...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} className="sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">ارسال پیام</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>

          </div>

          {/* Map Section - ریسپانسیو */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-12"
          >
            <div className="bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-blue-100/50 shadow-2xl overflow-hidden">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=51.3%2C35.6%2C51.5%2C35.8&layer=mapnik"
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: "1rem" }}
                allowFullScreen
                loading="lazy"
                title="نقشه دفتر مرکزی"
                className="rounded-xl sm:rounded-2xl"
              />
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
};

export default ContactSection;