import { motion } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";

const BackgroundNetwork3D = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-white">
      
      {/* نورهای آبی پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/30 via-transparent to-indigo-100/20" />
      
      {/* ابرهای آبی ملایم */}
      <motion.div
        animate={{ 
          x: [0, 30, 0],
          y: [0, -15, 0],
          scale: [1, 1.03, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute w-[600px] h-[350px] rounded-[50%] bg-gradient-to-r from-blue-100/50 to-sky-100/60 blur-2xl top-10 -left-40"
      />
      
      <motion.div
        animate={{ 
          x: [0, -25, 0],
          y: [0, 20, 0],
          scale: [1, 1.04, 1]
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute w-[550px] h-[320px] rounded-[50%] bg-gradient-to-l from-sky-100/50 to-blue-100/60 blur-2xl bottom-20 -right-40"
      />
      
      {/* قلب‌های شناور آبی */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-blue-300/40"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            fontSize: `${20 + Math.random() * 40}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        >
          <Heart className="w-full h-full" />
        </motion.div>
      ))}
      
      {/* دست‌های کمک‌کننده آبی */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`hand-${i}`}
          className="absolute text-sky-300/30"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            fontSize: `${25 + Math.random() * 35}px`,
          }}
          animate={{
            y: [0, 25, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        >
          <HandHeart className="w-full h-full" />
        </motion.div>
      ))}
      
      {/* ذرات درخشان آبی */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 40 - 20, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        >
          <Sparkles className="w-4 h-4 text-blue-300/60" />
        </motion.div>
      ))}
      
      {/* موج‌های انرژی آبی */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-96 h-96 rounded-full border-2 border-blue-200/20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute w-96 h-96 rounded-full border-2 border-sky-200/15 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      
      {/* نماد افراد (جامعه) آبی */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute text-blue-400/40 top-1/4 right-1/4"
        style={{ fontSize: '60px' }}
      >
        <Users className="w-16 h-16" />
      </motion.div>
      
      {/* ابرهای اضافی برای عمق بیشتر */}
      <motion.div
        animate={{ 
          x: [0, 40, 0],
          y: [0, 10, 0]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1.5
        }}
        className="absolute w-[400px] h-[250px] rounded-[45%] bg-gradient-to-br from-blue-200/40 to-sky-100/50 blur-xl top-1/2 left-1/3"
      />
      
      <motion.div
        animate={{ 
          x: [0, -30, 0],
          y: [0, -15, 0]
        }}
        transition={{ 
          duration: 22, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2.5
        }}
        className="absolute w-[350px] h-[220px] rounded-[40%] bg-gradient-to-tl from-sky-200/40 to-blue-100/50 blur-xl top-1/4 right-1/4"
      />
      
      {/* گرادیان نورانی مرکز آبی */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-100/20 via-sky-100/10 to-blue-100/20 blur-3xl" />
      
      {/* خطوط نوری عمودی */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-300/20 to-transparent"
          style={{
            left: `${15 + i * 20}%`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
      
    </div>
  );
};

export default BackgroundNetwork3D;
