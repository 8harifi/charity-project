import { motion } from "framer-motion";
import { Newspaper, Globe, Signal, Network, Sparkles } from "lucide-react";
import { useMemo } from "react";

const icons = [Newspaper, Globe, Signal, Network];

export default function NewsBackground3D() {

  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 40,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 5,
      Icon: icons[Math.floor(Math.random() * icons.length)]
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">

      {/* gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />

      {/* glowing center */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* floating icons */}
      {particles.map((p, i) => {
        const Icon = p.Icon;
        return (
          <motion.div
            key={i}
            className="absolute text-blue-400/30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: p.size
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon className="w-full h-full" />
          </motion.div>
        );
      })}

      {/* particles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0.2, 1, 0.2],
            scale: [0.6, 1.5, 0.6]
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity
          }}
        />
      ))}

      {/* grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* sparkles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 right-20 text-blue-300/30"
      >
        <Sparkles size={80} />
      </motion.div>

    </div>
  );
}
