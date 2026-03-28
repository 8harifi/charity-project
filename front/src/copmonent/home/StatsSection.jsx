// components/home/StatsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { Users, Heart, Building, DollarSign, Stethoscope, MapPin } from "lucide-react";

const StatsSection = () => {
  const stats = [
    { 
      icon: <Heart className="w-6 h-6" />, 
      value: "۱,۲۰۰+", 
      label: "بیمار حمایت شده", 
      color: "text-red-600",
      bgColor: "bg-red-50",
      delay: 0.1
    },
    { 
      icon: <Users className="w-6 h-6" />, 
      value: "۴۵۰+", 
      label: "خیر عضو شبکه", 
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      delay: 0.2
    },
    { 
      icon: <Building className="w-6 h-6" />, 
      value: "۸۰+", 
      label: "مرکز نیکوکاری", 
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      delay: 0.3
    },
    { 
      icon: <DollarSign className="w-6 h-6" />, 
      value: "۵.۲ میلیارد", 
      label: "کمک جمع‌آوری شده", 
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      delay: 0.4
    },
    { 
      icon: <Stethoscope className="w-6 h-6" />, 
      value: "۱۵۰+", 
      label: "پزشک داوطلب", 
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      delay: 0.5
    },
    { 
      icon: <MapPin className="w-6 h-6" />, 
      value: "۳۰+", 
      label: "منطقه محروم تحت پوشش", 
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      delay: 0.6
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-emerald-300 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-blue-300 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              دستاوردهای <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">شبکه سلامت</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              در یک نگاه، دستاوردهای شبکه خیرین سلامت را مشاهده کنید
            </p>
          </motion.div>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={stat.delay}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                {/* Hover effect background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${stat.bgColor.replace('bg-', 'bg-')}`}></div>
                
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-16 h-16 overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color.replace('text-', 'bg-')} opacity-20 transform rotate-45 -translate-y-16 translate-x-8`}></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`${stat.color} p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                    </div>
                  </div>
                  
                  {/* Progress bar indicator */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      className={`h-full ${stat.color.replace('text-', 'bg-')}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${70 + (index * 5)}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + (index * 0.1) }}
                      viewport={{ once: true }}
                    ></motion.div>
                  </div>
                </div>
              </div>
              
              {/* Connecting line for visual flow (only on larger screens) */}
              {index < stats.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-200 to-emerald-200 transform -translate-y-1/2 z-0"></div>
              )}
            </motion.div>
          ))}
        </motion.div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-700 mb-6">
            می‌خواهید بخشی از این آمار باشید؟
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              عضویت در شبکه
            </motion.a>
            <motion.a
              href="/donate"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-medium hover:bg-emerald-50 transition-colors"
            >
              مشارکت مالی
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;