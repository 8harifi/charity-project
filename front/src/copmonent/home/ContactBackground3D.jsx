import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Headphones } from "lucide-react";

const ContactBackground3D = () => {
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

      {/* آیکون تلفن‌های شناور */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`phone-${i}`}
          className="absolute text-blue-300/30"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            fontSize: `${25 + Math.random() * 35}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Phone className="w-full h-full" />
        </motion.div>
      ))}

      {/* آیکون نامه‌های شناور */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`mail-${i}`}
          className="absolute text-emerald-300/30"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            fontSize: `${20 + Math.random() * 30}px`,
          }}
          animate={{
            y: [0, 25, 0],
            x: [0, Math.random() * 15 - 7, 0],
            rotate: [0, -8, 8, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 9 + Math.random() * 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Mail className="w-full h-full" />
        </motion.div>
      ))}

      {/* آیکون مکان‌نما */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`pin-${i}`}
          className="absolute text-purple-300/25"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
            fontSize: `${30 + Math.random() * 25}px`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <MapPin className="w-full h-full" />
        </motion.div>
      ))}

      {/* آیکون ساعت */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`clock-${i}`}
          className="absolute text-amber-300/25"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            fontSize: `${20 + Math.random() * 30}px`,
          }}
          animate={{
            y: [0, 20, 0],
            x: [0, Math.random() * 12 - 6, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Clock className="w-full h-full" />
        </motion.div>
      ))}

      {/* ذرات درخشان */}
      {[...Array(25)].map((_, i) => (
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
            opacity: [0.2, 0.8, 0.2],
            scale: [0.6, 1.3, 0.6],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Send className={`w-${3 + Math.floor(Math.random() * 3)} h-${3 + Math.floor(Math.random() * 3)} text-cyan-400/60`} />
        </motion.div>
      ))}

      {/* امواج انرژی */}
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[400px] h-[400px] border border-blue-200/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <motion.div
        animate={{ scale: [1, 1.9, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute w-[400px] h-[400px] border border-emerald-200/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <motion.div
        animate={{ scale: [1, 2.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute w-[400px] h-[400px] border border-purple-200/15 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* نماد پیام‌رسانی */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute text-blue-400/30 top-[15%] left-[20%]"
        style={{ fontSize: 55 }}
      >
        <MessageCircle className="w-20 h-20" />
      </motion.div>

      {/* نماد هدفون پشتیبانی */}
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute text-emerald-400/30 bottom-[20%] right-[15%]"
        style={{ fontSize: 55 }}
      >
        <Headphones className="w-20 h-20" />
      </motion.div>

      {/* دایره‌های کوچک در حال چرخش */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[5%] right-[5%] w-32 h-32"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute w-2 h-2 rounded-full bg-blue-300/30"
            style={{
              left: "50%",
              top: "50%",
              transform: `rotate(${i * 45}deg) translateX(50px)`,
            }}
            animate={{
              scale: [0.5, 1.2, 0.5],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] left-[8%] w-40 h-40"
      >
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`circle2-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-emerald-300/25"
            style={{
              left: "50%",
              top: "50%",
              transform: `rotate(${i * 36}deg) translateX(60px)`,
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.25,
            }}
          />
        ))}
      </motion.div>

    </div>
  );
};

export default ContactBackground3D;