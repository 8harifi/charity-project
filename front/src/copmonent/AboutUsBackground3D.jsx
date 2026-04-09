import { motion } from "framer-motion";
import { Heart, HandHeart, Users, Sparkles } from "lucide-react";

const AboutUsBackground3D = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      
      {/* نور پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 via-transparent to-emerald-100/20" />

      {/* ابرهای آبی - سبز */}
      <motion.div
        animate={{ x: [0, 35, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[350px] top-10 -left-40 rounded-[45%] bg-gradient-to-r from-blue-200/40 to-cyan-200/50 blur-2xl"
      />

      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 15, 0], scale: [1, 1.04, 1] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.8
        }}
        className="absolute w-[550px] h-[320px] bottom-24 -right-40 rounded-[45%] bg-gradient-to-l from-emerald-200/40 to-blue-100/50 blur-2xl"
      />

      {/* قلب‌ها */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-blue-300/40"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            fontSize: `${20 + Math.random() * 35}px`,
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, Math.random() * 15 - 7, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6 + Math.random() * 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart className="w-full h-full" />
        </motion.div>
      ))}

      {/* دست‌ها */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`hand-${i}`}
          className="absolute text-emerald-300/35"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            fontSize: `${25 + Math.random() * 30}px`,
          }}
          animate={{
            y: [0, 20, 0],
            x: [0, Math.random() * 12 - 6, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <HandHeart className="w-full h-full" />
        </motion.div>
      ))}

      {/* ذرات درخشان */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 35 - 18, 0],
            x: [0, Math.random() * 35 - 18, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-4 h-4 text-cyan-400/60" />
        </motion.div>
      ))}

      {/* امواج انرژی */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[380px] h-[380px] border border-blue-200/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute w-[380px] h-[380px] border border-emerald-200/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* نماد افراد شبکه */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute text-blue-400/40 top-[20%] right-[25%]"
        style={{ fontSize: 55 }}
      >
        <Users className="w-16 h-16" />
      </motion.div>
    </div>
  );
};

export default AboutUsBackground3D;
