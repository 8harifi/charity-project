import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Video
} from "lucide-react";
import EducationBackground3D from "../copmonent/EducationBackground3D";

const sampleCourse = {
  title: "دوره آموزش مقدماتی سلامت حمایتی",
  description: "در این دوره گام‌به‌گام با بخش‌های مختلف سامانه و نحوه مشارکت آشنا می‌شوید.",
  duration: "۴ ساعت",
  lessons: "۱۲ درس",
  level: "مقدماتی",
  progress: 65,
  sections: [
    {
      id: 1,
      title: "نشست‌های همفکری اعضای شبکه",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "۴۵ دقیقه",
      files: [
        { id: 1, label: "جزوه نشست", url: "/files/neshat_notes.pdf", size: "۲.۴ مگابایت" },
        { id: 2, label: "اسلاید آشنایی", url: "/files/intro_slides.pdf", size: "۱.۸ مگابایت" },
      ],
      content: (
        <>
          <p className="text-gray-700 leading-relaxed">
            در این بخش، به بررسی روش‌های همفکری اعضای شبکه و اهمیت نشست‌های منظم می‌پردازیم.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              برگزاری جلسات ماهیانه
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              اشتراک‌گذاری تجربیات
            </li>
            <li className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              تعامل موثر میان اعضا
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 2,
      title: "شبکه‌های نمایندگی و توانمندسازی آموزشی",
      videoUrl: "https://sample-videos.com/video123/mp4/480/asdasdas.mp4",
      duration: "۱ ساعت و ۱۵ دقیقه",
      files: [{ id: 3, label: "دوره توانمندسازی pdf", url: "/files/tavanmandi.pdf", size: "۳.۲ مگابایت" }],
      content: (
        <>
          <p className="text-gray-700 leading-relaxed">
            توضیحاتی درباره شبکه نمایندگی‌ها و امکانات آموزشی فراهم شده جهت ارتقاء دانش اعضا.
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-100">
            <p className="text-gray-700 font-medium">
              ارائه دوره‌های آموزشی سطح‌بندی‌شده مطابق نیازهای اعضا.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 3,
      title: "رویدادهای تخصصی و CSR",
      videoUrl: null,
      duration: "۳۰ دقیقه",
      files: [{ id: 4, label: "بروشور CSR", url: "/files/csr_brochure.pdf", size: "۱.۵ مگابایت" }],
      content: (
        <>
          <p className="text-gray-700 leading-relaxed">
            افزایش آگاهی و ترویج مسئولیت اجتماعی شرکت‌ها و نقش اعضا در حمایت و مشارکت.
          </p>
        </>
      ),
    },
    {
      id: 4,
      title: "مدیریت پروژه‌های حمایتی",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "۱ ساعت",
      files: [
        { id: 5, label: "چک‌لیست مدیریت", url: "/files/checklist.pdf", size: "۲.۱ مگابایت" },
        { id: 6, label: "نمونه گزارش", url: "/files/report_sample.pdf", size: "۴.۳ مگابایت" },
      ],
      content: (
        <>
          <p className="text-gray-700 leading-relaxed">
            آموزش مراحل مدیریت پروژه‌های حمایتی از شناسایی نیاز تا ارزیابی نتایج.
          </p>
        </>
      ),
    },
  ],
};

const EducationCourse = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { sections, title, description, duration, lessons, level, progress } = sampleCourse;
  const current = sections[currentSection];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* پس‌زمینه سه‌بعدی */}
      <EducationBackground3D />
      
      {/* محتوای اصلی */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 font-kook pt-24 p-4 md:p-30"
      > 
        <div className="max-w-6xl mx-auto">
          {/* هدر دوره */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12"
          >
            <div className="bg-blue-20/10 w-full p-4 pr-12 rounded-xl border border-blue-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-200 text-blue-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4">
                    <BookOpen className="w-4 h-4" />
                    <span>دوره آموزشی</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 ">{title}</h1>
                  <p className="text-blue-300 mb-6 max-w-2xl">{description}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Clock className="w-4 h-4" />
                      <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Video className="w-4 h-4" />
                      <span>{lessons}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                      <span>{level}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-300/30 backdrop-blur-sm rounded-xl p-4 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-700">پیشرفت شما</span>
                    <span className="text-sm font-bold ">{progress}%</span>
                  </div>
                  <div className="w-full bg-white/70 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* سایدبار سرفصل‌ها */}
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-1/3"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  سرفصل‌های دوره
                </h2>
                
                <div className="space-y-3">
                  {sections.map((section, idx) => (
                    <motion.button
                      key={section.id}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentSection(idx)}
                      className={`w-full text-right p-4 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                        idx === currentSection
                          ? "bg-gradient-to-r from-blue-50 to-sky-50 border-r-4 border-blue-600 shadow-md"
                          : "bg-gray-50/80 hover:bg-gray-100/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          idx === currentSection
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="text-left">
                          <h3 className={`font-medium ${
                            idx === currentSection ? "text-blue-700" : "text-gray-700"
                          }`}>
                            {section.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-gray-500">{section.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      {idx === currentSection && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-blue-600 rounded-full"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-emerald-800">پیش‌نیازها</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-emerald-700">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      آشنایی مقدماتی با مفاهیم سلامت
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      دسترسی به اینترنت
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      زمان اختصاصی ۴ ساعته
                    </li>
                  </ul>
                </div>
              </div>
            </motion.aside>

            {/* محتوای اصلی */}
            <motion.main
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:w-2/3"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                {/* هدر بخش فعلی */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 border-b border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-sky-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{currentSection + 1}</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{current.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {current.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {current.files.length} فایل
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {currentSection + 1} از {sections.length}
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="bg-gradient-to-r from-blue-500 to-sky-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* پلیر ویدیو */}
                <motion.div
                  variants={itemVariants}
                  className="relative"
                >
                  {current.videoUrl ? (
                    <div className="relative bg-black rounded-lg overflow-hidden m-4">
                      <video
                        key={current.videoUrl}
                        src={current.videoUrl}
                        controls
                        className="w-full h-auto max-h-[400px]"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      >
                        مرورگر شما ویدیو را پشتیبانی نمی‌کند.
                      </video>
                      
                      <AnimatePresence>
                        {!isPlaying && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center"
                          >
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Play className="w-8 h-8 text-white ml-1" />
                              </div>
                              <p className="text-white font-medium">برای پخش ویدیو کلیک کنید</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="m-4 p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl text-center">
                      <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">ویدیویی برای این بخش وجود ندارد</p>
                      <p className="text-gray-500 text-sm mt-2">محتوای متنی و فایل‌های آموزشی در دسترس هستند</p>
                    </div>
                  )}
                </motion.div>

                {/* محتوای متنی */}
                <motion.div
                  variants={itemVariants}
                  className="p-6"
                >
                  <div className="prose max-w-none">
                    <div className="text-gray-700 leading-relaxed space-y-4">
                      {current.content}
                    </div>
                  </div>
                </motion.div>

                {/* فایل‌های دانلودی */}
                {current.files && current.files.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="p-6 border-t border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-600" />
                      فایل‌های آموزشی
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {current.files.map((file) => (
                        <motion.a
                          key={file.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={file.url}
                          download
                          className="group bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 border border-blue-200 rounded-xl p-4 flex items-center justify-between transition-all duration-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-sky-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 group-hover:text-blue-700">
                                {file.label}
                              </h4>
                              <p className="text-sm text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:-translate-x-1" />
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ناوبری */}
                <motion.div
                  variants={itemVariants}
                  className="p-6 border-t border-gray-100 bg-gray-50/80"
                >
                  <div className="flex justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentSection((s) => Math.max(0, s - 1))}
                      disabled={currentSection === 0}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        currentSection === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:from-blue-700 hover:to-sky-700 shadow-lg hover:shadow-xl"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                      بخش قبلی
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentSection((s) => Math.min(sections.length - 1, s + 1))}
                      disabled={currentSection === sections.length - 1}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        currentSection === sections.length - 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl"
                      }`}
                    >
                      بخش بعدی
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  </div>
                  
                  {/* پیشرفت کلی */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">پیشرفت کلی دوره</span>
                      <span className="text-sm font-bold text-blue-600">
                        {Math.round(((currentSection + 1) / sections.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.main>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EducationCourse;