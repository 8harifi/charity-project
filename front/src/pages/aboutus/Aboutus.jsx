import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { 
  Users, Target, Eye, Handshake, Heart, Award, ChevronLeft,
  Mail, Globe, Shield, Building, MapPin, Calendar, BarChart3,
  Network, HeartHandshake, Users2, Building2, TargetIcon,
  Lightbulb, Rocket, CheckCircle, Star
} from "lucide-react";

import AboutUsBackground3D from "../../copmonent/AboutUsBackground3D"; 

const Aboutus = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  // --- داده‌های بخش‌های مختلف ---
  const stats = [
    { id: 1, label: "سال تجربه مستمر", value: "۲۵+", icon: Calendar, color: "text-blue-500" },
    { id: 2, label: "پزشک و متخصص", value: "۸۵۰+", icon: Users2, color: "text-emerald-500" },
    { id: 3, label: "مرکز درمانی فعال", value: "۱۲۰+", icon: Building, color: "text-cyan-500" },
    { id: 4, label: "بیمار رضایتمند", value: "۱M+", icon: Heart, color: "text-rose-500" },
  ];

  const networkGoals = [
    { id: 1, title: "ارتقای سطح سلامت جامعه", description: "ارائه خدمات پیشگیری و درمانی با بالاترین استانداردهای جهانی در تمام نقاط تحت پوشش.", icon: Shield },
    { id: 2, title: "توسعه زیرساخت‌های درمانی", description: "گسترش شبکه‌ی مراکز بهداشتی در مناطق محروم و ارتقای تجهیزات بیمارستانی.", icon: Network },
    { id: 3, title: "نوآوری در خدمات پزشکی", description: "استفاده از فناوری‌های نوین، پرونده الکترونیک سلامت و هوش مصنوعی در تشخیص.", icon: Lightbulb },
    { id: 4, title: "آموزش و پژوهش مستمر", description: "حمایت از پروژه‌های تحقیقاتی پزشکی و ارتقای دانش کادر درمان به صورت دوره‌ای.", icon: Rocket },
  ];

  const additionalGoals = [
    "تسهیل دسترسی عادلانه به خدمات درمانی برای همگان",
    "کاهش هزینه‌های پرداختی از جیب بیماران",
    "ارتقای فرهنگ پیشگیری و خودمراقبتی در جامعه",
    "گسترش توریسم سلامت و ارائه خدمات بین‌المللی",
    "بهینه‌سازی سیستم‌های ارجاع الکترونیک بیماران",
    "توسعه بیمارستان‌های سبز و حفظ محیط زیست"
  ];

  const networkStructure = [
    { id: 1, title: "بیمارستان‌های فوق تخصصی", desc: "مراکز اصلی ارجاع و درمان بیماری‌های پیچیده با بروزترین تجهیزات پیشرفته.", icon: Building2 },
    { id: 2, title: "کلینیک‌های جامع سلامت", desc: "ارائه خدمات سرپایی، دندانپزشکی، آزمایشگاه تشخیص طبی و تصویربرداری.", icon: TargetIcon },
    { id: 3, title: "مراکز بهداشت محله", desc: "تمرکز بر پیشگیری، واکسیناسیون، غربالگری و پایش سلامت خانواده‌ها.", icon: MapPin },
    { id: 4, title: "پژوهشکده‌های پزشکی", desc: "مراکز تحقیقاتی اختصاصی برای کشف روش‌های نوین درمانی و دارویی.", icon: Globe },
  ];

  // --- تنظیمات انیمیشن‌ها ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-kook text-slate-800" dir="rtl">
      
      {/* استایل‌های اختصاصی و سراسری کامپوننت */}
      <style jsx global>{`
      

        /* استایل کارت‌های شیشه‌ای */
        .glass-card-health {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        /* استایل متن گرادیانت */
        .gradient-text-health {
          background: linear-gradient(135deg, #121c89, #362dd8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* افکت شیمر (درخشش در حرکت) */
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          transform: skewX(-20deg);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 200%;
          }
        }
      `}</style>

      {/* کامپوننت پس‌زمینه که جداگانه ایمپورت شده است */}
      <AboutUsBackground3D />

      {/* محتوای اصلی (z-10 باعث می‌شود روی پس‌زمینه قرار بگیرد) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* === بخش ۱: Hero (معرفی اولیه) === */}
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center pt-10 mb-20">
          <motion.div 
            initial="hidden" animate={controls} variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
           
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-10 px-14 leading-tight text-slate-800">
              تعهد ما، <span className="gradient-text-health">سلامتی و آرامش</span> جامعه شماست
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              ما با بهره‌گیری از جدیدترین تکنولوژی‌های پزشکی و مجرب‌ترین کادر درمان، شبکه‌ای به هم پیوسته ایجاد کرده‌ایم تا دسترسی به خدمات درمانی با کیفیت را برای همه اقشار جامعه فراهم کنیم.
            </motion.p>
          </motion.div>
        </section>

        {/* === بخش ۲: آمار و ارقام (Stats) === */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32"
        >
          {stats.map((stat) => (
            <motion.div key={stat.id} variants={itemVariants} className="glass-card-health rounded-3xl p-8 text-center hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 group">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-md mb-6 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl font-extrabold text-slate-800 mb-3">{stat.value}</div>
              <div className="text-base font-semibold text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.section>

        {/* === بخش ۳: ماموریت و چشم‌انداز === */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="glass-card-health rounded-[2.5rem] p-10 relative overflow-hidden border-t-4 border-t-blue-500"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full -z-10 opacity-60" />
              <div className="flex items-center gap-5 mb-8">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">مأموریت ما</h2>
              </div>
              <p className="text-slate-600 leading-loose text-lg text-justify">
                ماموریت اصلی ما، ارائه خدمات بهداشتی، تشخیصی و درمانی ایمن، اثربخش و بیمارمحور است. ما متعهدیم تا با آموزش مداوم پرسنل و ارتقای فرآیندها، تجربه درمانی مثبتی را برای بیماران و خانواده‌هایشان رقم بزنیم و به عنوان تکیه‌گاهی مطمئن در روزهای سخت کنارشان باشیم.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}
              className="glass-card-health rounded-[2.5rem] p-10 relative overflow-hidden border-t-4 border-t-emerald-500"
            >
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-emerald-100 to-transparent rounded-br-full -z-10 opacity-60" />
              <div className="flex items-center gap-5 mb-8">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
                  <Eye className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">چشم‌انداز ما</h2>
              </div>
              <p className="text-slate-600 leading-loose text-lg text-justify">
                تبدیل شدن به برترین و هوشمندترین شبکه سلامت در منطقه خاورمیانه تا سال ۱۴۱۰؛ جایی که هر فرد بتواند در کوتاه‌ترین زمان ممکن، بالاترین سطح مراقبت‌های پزشکی را بر اساس استانداردهای بین‌المللی و با تکیه بر فناوری‌های نوین دریافت کند.
              </p>
            </motion.div>
          </div>
        </section>

        {/* === بخش ۴: اهداف شبکه (Network Graphic) === */}
        <section className="mb-32 relative">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">اهداف و ارزش‌های شبکه</motion.h2>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "6rem" }} viewport={{ once: true }} className="h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto rounded-full"></motion.div>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* اهداف اصلی (کارت‌های گرید) */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {networkGoals.map((goal, index) => (
                <motion.div 
                  key={goal.id}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                  className="glass-card-health rounded-3xl p-8 group hover:bg-white/90 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                    <goal.icon className="w-7 h-7 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{goal.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{goal.description}</p>
                </motion.div>
              ))}
            </div>

            {/* اهداف فرعی (لیست کناری) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:col-span-5 glass-card-health rounded-[2.5rem] p-10 flex flex-col justify-center border border-emerald-100 shadow-xl shadow-emerald-900/5"
            >
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
                <Award className="w-8 h-8 text-emerald-500" />
                <span>سایر اهداف راهبردی</span>
              </h3>
              <ul className="space-y-6">
                {additionalGoals.map((goal, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + (index * 0.1) }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="mt-1 bg-emerald-100 rounded-full p-1 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-slate-600 font-medium text-lg leading-snug">{goal}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* === بخش ۵: ساختار شبکه === */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">ساختار یکپارچه ما</motion.h2>
            <motion.div initial={{ width: 0 }} whileInView={{ width: "6rem" }} viewport={{ once: true }} className="h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto rounded-full"></motion.div>
            <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-lg">
              این شبکه از ارکان مختلفی تشکیل شده است که همگی با هدف یکپارچه‌سازی خدمات و ارائه پوشش جامع درمانی با یکدیگر در ارتباطند.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {networkStructure.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-[2rem] p-8 text-center shadow-lg shadow-blue-900/5 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-white shadow-sm">
                  <item.icon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-800">{item.title}</h3>
                <p className="text-base text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* === بخش ۶: دعوت به اقدام (CTA) === */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="glass-card-health shimmer-effect rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden border border-blue-200 shadow-2xl shadow-blue-900/10"
        >
          {/* افکت‌های پس‌زمینه داخل CTA */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-emerald-600/5" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-slate-800">به خانواده بزرگ ما بپیوندید</h2>
            <p className="text-slate-600 mb-10 text-lg md:text-xl leading-relaxed">
              برای دریافت اطلاعات بیشتر درباره خدمات شبکه سلامت، همکاری با ما، استفاده از خدمات بیمه‌ای و یا تعیین وقت مشاوره با کارشناسان ارشد ما در ارتباط باشید.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                <Mail className="w-6 h-6" />
                <span>تماس با مدیریت شبکه</span>
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-lg shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                <Globe className="w-6 h-6 text-emerald-600" />
                <span>پورتال جامع بیماران</span>
              </button>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default Aboutus;

