import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Brain, Target, Zap, Lightbulb, Globe, Users, Sparkles, Heart } from "lucide-react";

const EducationBackground3D = () => {
  return (
   <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

      {/* گرادیان نورانی مرکز - شفاف‌تر */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-100 via-sky-100/5 to-indigo-100/10 blur-3xl" />
      
      {/* ابرهای دانش آبی */}
      <motion.div
        animate={{ 
          x: [0, 40, 0],
          y: [0, -20, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute w-[700px] h-[400px] rounded-[50%] bg-gradient-to-r from-blue-100/30 to-sky-100/40 blur-3xl top-20 -left-60"
      />
      
      <motion.div
        animate={{ 
          x: [0, -35, 0],
          y: [0, 25, 0],
          scale: [1, 1.06, 1]
        }}
        transition={{ 
          duration: 22, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute w-[650px] h-[380px] rounded-[50%] bg-gradient-to-l from-indigo-100/30 to-blue-100/40 blur-3xl bottom-32 -right-60"
      />
      
      {/* کتاب‌های شناور */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`book-${i}`}
          className="absolute"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            fontSize: `${25 + Math.random() * 40}px`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 30 - 15, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + Math.random() * 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        >
          <BookOpen className="w-full h-full text-blue-300/30" />
        </motion.div>
      ))}
      
      {/* کلاه‌های فارغ‌التحصیلی */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`cap-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${30 + Math.random() * 35}px`,
          }}
          animate={{
            y: [0, 35, 0],
            x: [0, Math.random() * 25 - 12.5, 0],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        >
          <GraduationCap className="w-full h-full text-indigo-300/25" />
        </motion.div>
      ))}
      
      {/* مغزهای در حال یادگیری */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`brain-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${20 + Math.random() * 30}px`,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7 + Math.random() * 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        >
          <Brain className="w-full h-full text-sky-300/30" />
        </motion.div>
      ))}
      
      {/* اهداف آموزشی */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`target-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${15 + Math.random() * 25}px`,
          }}
          animate={{
            y: [0, 30, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 6,
          }}
        >
          <Target className="w-full h-full text-blue-400/25" />
        </motion.div>
      ))}
      
      {/* جرقه‌های ایده */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 50 - 25, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [0.7, 1.3, 0.7],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        >
          <Zap className="w-3 h-3 text-blue-300/50" />
        </motion.div>
      ))}
      
      {/* لامپ‌های ایده */}
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={`bulb-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${35 + Math.random() * 30}px`,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5 + Math.random() * 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        >
          <Lightbulb className="w-full h-full text-yellow-300/30" />
        </motion.div>
      ))}
      
      {/* شبکه جهانی آموزش */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute text-blue-400/20 top-1/3 left-1/4"
        style={{ fontSize: '70px' }}
      >
        <Globe className="w-20 h-20" />
      </motion.div>
      
      {/* گروه‌های آموزشی */}
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute text-indigo-400/25 bottom-1/3 right-1/4"
        style={{ fontSize: '65px' }}
      >
        <Users className="w-18 h-18" />
      </motion.div>
      
      {/* ذرات درخشان دانش */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${3 + Math.random() * 6}px`,
            height: `${3 + Math.random() * 6}px`,
            background: `rgba(96, 165, 250, ${0.2 + Math.random() * 0.3})`,
          }}
          animate={{
            y: [0, Math.random() * 60 - 30, 0],
            x: [0, Math.random() * 60 - 30, 0],
            opacity: [0.05, 0.5, 0.05],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 5 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* قلب‌های علاقه به یادگیری */}
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={`love-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${18 + Math.random() * 25}px`,
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 9 + Math.random() * 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        >
          <Heart className="w-full h-full text-pink-300/30" />
        </motion.div>
      ))}
      
      {/* موج‌های انرژی آموزشی */}
      <motion.div
        animate={{
          scale: [1, 1.6, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-80 h-80 rounded-full border-2 border-blue-300/10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      
      <motion.div
        animate={{
          scale: [1, 2, 1],
          opacity: [0.08, 0.25, 0.08],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute w-80 h-80 rounded-full border-2 border-indigo-300/8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      
      {/* خطوط شبکه آموزشی */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`grid-line-${i}`}
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-300/5 to-transparent"
          style={{
            top: `${(i + 1) * 12.5}%`,
          }}
          animate={{
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
      
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`grid-col-${i}`}
          className="absolute h-full w-px bg-gradient-to-b from-transparent via-blue-300/5 to-transparent"
          style={{
            left: `${(i + 1) * 12.5}%`,
          }}
          animate={{
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
      
      {/* ستاره‌های درخشان */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.1, 0.8, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        >
          <Sparkles className="w-4 h-4 text-blue-300/60" />
        </motion.div>
      ))}
      
      {/* ابرهای اضافی برای عمق */}
      <motion.div
        animate={{ 
          x: [0, 50, 0],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute w-[500px] h-[300px] rounded-[40%] bg-gradient-to-tr from-blue-200/20 to-sky-100/25 blur-2xl top-10 right-1/4"
      />
      
      <motion.div
        animate={{ 
          x: [0, -40, 0],
          y: [0, 20, 0]
        }}
        transition={{ 
          duration: 28, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute w-[450px] h-[280px] rounded-[35%] bg-gradient-to-bl from-indigo-200/20 to-blue-100/25 blur-2xl bottom-20 left-1/4"
      />
      
      {/* نورهای نقطه‌ای */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`light-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${100 + Math.random() * 200}px`,
            height: `${100 + Math.random() * 200}px`,
            background: `radial-gradient(circle, rgba(59, 130, 246, ${0.03 + Math.random() * 0.07}) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8,
          }}
        />
      ))}
      
      {/* گرادیان overlay برای ترکیب بهتر */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-blue-50/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
      
    </div>
  );
};

export default EducationBackground3D;
