import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Newspaper, 
  Calendar, 
  Users, 
  TrendingUp, 
  Video, 
  Image as ImageIcon,
  FileText,
  BookOpen,
  Megaphone,
  Share2,
  Heart,
  MessageCircle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  CheckCircle,
  BarChart3,
  Gift,
  DollarSign,
  Download,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import NewsBackground3D from "../copmonent/NewsBackground3D";

const News = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [currentPage, setCurrentPage] = useState(1);
  const [likedPosts, setLikedPosts] = useState([]);
  const [viewedPosts, setViewedPosts] = useState([]);
  
  const itemsPerPage = 6;

  // داده‌های نمونه برای اخبار
  const newsData = {
    all: [
      {
        id: 1,
        type: "news",
        title: "افتتاح مرکز جدید سلامت حمایتی در شیراز",
        description: "با حضور جمعی از خیرین و مسئولان استانی، مرکز جدید سلامت حمایتی در شیراز آغاز به کار کرد.",
        content: "این مرکز با هدف ارائه خدمات جامع سلامت به بیماران نیازمند و با حمایت خیرین محلی تأسیس شده است. در مراسم افتتاحیه، بیش از ۵۰ نفر از اعضای شبکه حضور داشتند.",
        image: "https://images.unsplash.com/photo-1516549655669-df6654e447e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        date: "۱۴۰۵/۰۱/۲۰",
        time: "۱۰:۳۰",
        location: "شیراز، بلوار سلامت",
        author: "مدیر شبکه",
        category: "رویدادها",
        tags: ["افتتاحیه", "شیراز", "مرکز سلامت"],
        views: 245,
        likes: 89,
        comments: 23,
        featured: true,
        attachments: [
          { id: 1, name: "گزارش افتتاحیه.pdf", size: "۲.۴ مگابایت", type: "pdf" },
          { id: 2, name: "گالری تصاویر.zip", size: "۱۵.۲ مگابایت", type: "zip" }
        ]
      },
      {
        id: 2,
        type: "report",
        title: "گزارش مالی سه‌ماهه اول ۱۴۰۵",
        description: "گزارش کامل دریافتی‌ها و هزینه‌های شبکه سلامت حمایتی در سه‌ماهه اول سال ۱۴۰۵",
        content: "در این دوره، مبلغ کل ۳٫۲ میلیارد تومان از طریق خیرین جمع‌آوری شده که ۸۵٪ آن صرف درمان بیماران نیازمند شده است.",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        date: "۱۴۰۵/۰۱/۱۸",
        time: "۱۴:۰۰",
        author: "کمیته مالی",
        category: "گزارش مالی",
        tags: ["گزارش", "مالی", "شفافیت"],
        views: 312,
        likes: 67,
        comments: 18,
        featured: true,
        attachments: [
          { id: 1, name: "گزارش مالی کامل.pdf", size: "۳.۸ مگابایت", type: "pdf" },
          { id: 2, name: "جدول هزینه‌ها.xlsx", size: "۱.۲ مگابایت", type: "excel" }
        ]
      },
      {
        id: 3,
        type: "event",
        title: "نشست همفکری اعضای شبکه تهران",
        description: "دومین نشست فصلی اعضای شبکه سلامت حمایتی در تهران برگزار شد.",
        content: "در این نشست که با حضور ۱۲۰ نفر از اعضای شبکه برگزار شد، راهکارهای بهبود خدمات و گسترش شبکه مورد بحث قرار گرفت.",
        image: "https://images.unsplash.com/photo-1515168833906-d2a3b82b5d70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        date: "۱۴۰۵/۰۱/۱۵",
        time: "۱۶:۰۰",
        location: "تهران، مرکز همایش‌های بین‌المللی",
        author: "دبیرخانه شبکه",
        category: "نشست‌ها",
        tags: ["همفکری", "تهران", "نشست"],
        views: 189,
        likes: 54,
        comments: 12,
        featured: false,
        attachments: [
          { id: 1, name: "صورتجلسه.pdf", size: "۱.۵ مگابایت", type: "pdf" }
        ]
      },
      {
        id: 4,
        type: "capacity",
        title: "معرفی آزمایشگاه پیشرفته عضو شبکه",
        description: "آزمایشگاه تشخیص طبی پیشرفته دکتر احمدی به شبکه سلامت حمایتی پیوست.",
        content: "این آزمایشگاه با دارا بودن تجهیزات پیشرفته، خدمات رایگان تشخیصی به بیماران تحت پوشش شبکه ارائه می‌دهد.",
        image: "https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        date: "۱۴۰۵/۰۱/۱۲",
        time: "۱۱:۰۰",
        location: "اصفهان، خیابان چهارباغ",
        author: "تیم توسعه",
        category: "ظرفیت‌ها",
        tags: ["آزمایشگاه", "خدمات رایگان", "تجهیزات"],
        views: 156,
        likes: 42,
        comments: 8,
        featured: false,
        attachments: []
      },
      {
        id: 5,
        type: "donation",
        title: "دریافت کمک نقدی ۵۰۰ میلیون تومانی",
        description: "خیر محترم آقای محمدی مبلغ ۵۰۰ میلیون تومان به حساب شبکه واریز نمود.",
        content: "این کمک مالی صرف درمان ۱۵ بیمار نیازمند خواهد شد. از تمامی خیرین عزیز که در این امر خداپسندانه مشارکت می‌کنند سپاسگزاریم.",
        image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-1.2.1&auto=format&fit=crop&w-1350&q=80",
        date: "۱۴۰۵/۰۱/۱۰",
        time: "۰۹:۱۵",
        author: "کمیته جذب کمک‌ها",
        category: "دریافت‌ها",
        tags: ["کمک نقدی", "خیرین", "درمان"],
        views: 278,
        likes: 95,
        comments: 31,
        featured: true,
        attachments: [
          { id: 1, name: "رسید واریز.pdf", size: "۰.۸ مگابایت", type: "pdf" }
        ]
      },
      {
        id: 6,
        type: "video",
        title: "گزارش تصویری از اهدای تجهیزات پزشکی",
        description: "گزارش کامل از مراسم اهدای تجهیزات پزشکی به بیمارستان کودکان.",
        content: "در این مراسم که با حضور نمایندگان شبکه برگزار شد، تجهیزات پزشکی به ارزش ۲ میلیارد تومان اهدا گردید.",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        date: "۱۴۰۵/۰۱/۰۸",
        time: "۱۵:۴۵",
        location: "بیمارستان کودکان تهران",
        author: "تیم رسانه",
        category: "گزارش تصویری",
        tags: ["تجهیزات", "اهداء", "بیمارستان"],
        views: 421,
        likes: 128,
        comments: 45,
        featured: false,
        videoUrl: "https://sample-videos.com/video123/mp4/480/asdasdas.mp4",
        attachments: []
      },
      {
        id: 7,
        type: "course",
        title: "دوره جدید آموزش سلامت حمایتی",
        description: "دوره تخصصی مدیریت پروژه‌های سلامت حمایتی آغاز به کار کرد.",
        content: "این دوره به مدت ۲۰ ساعت و با حضور اساتید برجسته حوزه سلامت برگزار می‌شود.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        date: "۱۴۰۵/۰۱/۰۵",
        time: "۰۸:۰۰",
        author: "آموزش شبکه",
        category: "دوره‌ها",
        tags: ["آموزش", "دوره", "تخصصی"],
        views: 198,
        likes: 63,
        comments: 21,
        featured: false,
        attachments: [
          { id: 1, name: "سرفصل دوره.pdf", size: "۱.۲ مگابایت", type: "pdf" },
          { id: 2, name: "فرم ثبت‌نام.docx", size: "۰.۵ مگابایت", type: "word" }
        ]
      },
      {
        id: 8,
        type: "member",
        title: "معرفی دکتر سعیدی به عنوان عضو فعال ماه",
        description: "دکتر سعیدی برای سومین ماه متوالی به عنوان عضو فعال شبکه انتخاب شد.",
        content: "ایشان با مشارکت در ۱۵ پروژه درمانی و کمک به ۳۰ بیمار نیازمند، سهم بزرگی در موفقیت‌های شبکه داشته‌اند.",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        date: "۱۴۰۵/۰۱/۰۲",
        time: "۱۲:۰۰",
        author: "کمیته ارزیابی",
        category: "اعضای شبکه",
        tags: ["عضو فعال", "تقدیر", "مشارکت"],
        views: 167,
        likes: 58,
        comments: 14,
        featured: false,
        attachments: []
      }
    ],
    news: [/* اخبار */],
    reports: [/* گزارش‌ها */],
    events: [/* رویدادها */],
    capacities: [/* ظرفیت‌ها */],
    donations: [/* دریافت‌ها */],
    videos: [/* گزارش تصویری */],
    courses: [/* دوره‌ها */]
  };

  // فیلتر کردن بر اساس تب فعال
  const filteredData = newsData[activeTab]?.length > 0 
    ? newsData[activeTab] 
    : newsData.all.filter(item => 
        (activeTab === "all" || item.type === activeTab) &&
        (selectedCategory === "همه" || item.category === selectedCategory) &&
        (searchTerm === "" || 
          item.title.includes(searchTerm) || 
          item.description.includes(searchTerm) ||
          item.content.includes(searchTerm) ||
          item.tags.some(tag => tag.includes(searchTerm)))
      );

  // محاسبه صفحات
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const categories = [
    "همه", "رویدادها", "گزارش مالی", "نشست‌ها", "ظرفیت‌ها", 
    "دریافت‌ها", "گزارش تصویری", "دوره‌ها", "اعضای شبکه"
  ];

  const tabs = [
    { id: "all", label: "همه اخبار", icon: <Newspaper className="w-4 h-4" /> },
    { id: "news", label: "اخبار", icon: <Megaphone className="w-4 h-4" /> },
    { id: "report", label: "گزارش‌ها", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "event", label: "رویدادها", icon: <Calendar className="w-4 h-4" /> },
    { id: "capacity", label: "ظرفیت‌ها", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "donation", label: "دریافت‌ها", icon: <DollarSign className="w-4 h-4" /> },
    { id: "video", label: "گزارش تصویری", icon: <Video className="w-4 h-4" /> },
    { id: "course", label: "دوره‌ها", icon: <BookOpen className="w-4 h-4" /> },
    { id: "member", label: "اعضای شبکه", icon: <Users className="w-4 h-4" /> }
  ];

  const handleLike = (id) => {
    setLikedPosts(prev => 
      prev.includes(id) 
        ? prev.filter(postId => postId !== id)
        : [...prev, id]
    );
  };

  const handleView = (id) => {
    if (!viewedPosts.includes(id)) {
      setViewedPosts(prev => [...prev, id]);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      news: "bg-blue-100 text-blue-700",
      report: "bg-emerald-100 text-emerald-700",
      event: "bg-purple-100 text-purple-700",
      capacity: "bg-amber-100 text-amber-700",
      donation: "bg-green-100 text-green-700",
      video: "bg-red-100 text-red-700",
      course: "bg-indigo-100 text-indigo-700",
      member: "bg-cyan-100 text-cyan-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type) => {
    const icons = {
      news: <Megaphone className="w-4 h-4" />,
      report: <BarChart3 className="w-4 h-4" />,
      event: <Calendar className="w-4 h-4" />,
      capacity: <TrendingUp className="w-4 h-4" />,
      donation: <DollarSign className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      course: <BookOpen className="w-4 h-4" />,
      member: <Users className="w-4 h-4" />
    };
    return icons[type] || <Newspaper className="w-4 h-4" />;
  };

return (
  <div className="relative min-h-screen font-kook pt-40  ">
    
    <NewsBackground3D />

    <div className="relative z-10">
        {/* هدر بخش */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl mb-6 shadow-lg">
            <Newspaper className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
            بخش اخبار و اطلاع‌رسانی شبکه
          </h1>
          <p className="text-blue-500 max-w-3xl mx-auto text-lg">
            آخرین اخبار، گزارش‌ها، رویدادها و اطلاعیه‌های شبکه سلامت حمایتی
          </p>
        </motion.div>

        {/* آمار سریع */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "کل اخبار", value: "۱۲۴", icon: <Newspaper className="w-5 h-5" />, color: "bg-blue-500" },
            { label: "اعضای فعال", value: "۴۵۰+", icon: <Users className="w-5 h-5" />, color: "bg-blue-400" },
            { label: "رویدادها", value: "۳۶", icon: <Calendar className="w-5 h-5" />, color: "bg-blue-300" },
            { label: "گزارش‌ها", value: "۸۹", icon: <FileText className="w-5 h-5" />, color: "bg-blue-200" }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* تب‌ها و فیلترها */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* تب‌ها */}
          <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <div className="flex space-x-2 rtl:space-x-reverse">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* فیلترها و جستجو */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در اخبار..."
                className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("همه");
                  setActiveTab("all");
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-3 transition"
              >
                بازنشانی فیلترها
              </button>
              <button className="px-6 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl hover:from-blue-700 hover:to-sky-700 transition">
                اعمال
              </button>
            </div>
          </div>
        </div>

        {/* کارت‌های اخبار */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
            {paginatedData.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                onClick={() => handleView(item.id)}
              >
                {/* تصویر */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {item.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ویژه
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(item.type)}`}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        {item.category}
                      </div>
                    </span>
                  </div>
                </div>

                {/* محتوا */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{item.date} - {item.time}</span>
                    {item.location && (
                      <>
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{item.location}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* تگ‌ها */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* آمار و اقدامات */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                        className={`flex items-center gap-1 ${likedPosts.includes(item.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        <Heart className={`w-5 h-5 ${likedPosts.includes(item.id) ? 'fill-current' : ''}`} />
                        <span>{item.likes + (likedPosts.includes(item.id) ? 1 : 0)}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-400 hover:text-blue-500">
                        <MessageCircle className="w-5 h-5" />
                        <span>{item.comments}</span>
                      </button>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Eye className="w-5 h-5" />
                        <span>{item.views + (viewedPosts.includes(item.id) ? 1 : 0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.attachments.length > 0 && (
                        <button className="p-2 text-gray-400 hover:text-blue-500">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-green-500">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* نویسنده */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.author}</p>
                      <p className="text-xs text-gray-500">ارسال شده توسط</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* بخش ویژه - اخبار برتر */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-sky-600 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800">اخبار برتر این هفته</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsData.all
              .filter(item => item.featured)
              .slice(0, 3)
              .map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm">
                          <Eye className="w-4 h-4" />
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Heart className="w-4 h-4" />
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* دکمه ارسال خبر جدید */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="fixed bottom-8 left-8 z-50"
        >
          <Link
            to="/submit-news"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            <Megaphone className="w-5 h-5" />
            <span>ارسال خبر جدید</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default News;
