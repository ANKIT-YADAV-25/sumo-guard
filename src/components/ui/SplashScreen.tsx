import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080d14] overflow-hidden">
      {/* Background Animated Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-amber-500/10 blur-[120px]"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 1
        }}
        className="relative flex flex-col items-center"
      >
        {/* Logo Container with 3D-like hover effect */}
        <div className="relative w-32 h-32 mb-10">
          <motion.div
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full h-full rounded-[32px] overflow-hidden border border-white/20 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
              boxShadow: "0 20px 40px rgba(245,158,11,0.3)"
            }}
          >
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />

              <motion.div
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              >
                <Shield size={64} className="text-white" strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>

          {/* Pulsing Outer Rings */}
          <motion.div
            animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute -inset-4 border-2 border-amber-500/30 rounded-[40px]"
          />
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            className="absolute -inset-4 border-2 border-orange-500/20 rounded-[40px]"
          />
        </div>

        {/* Text Animation - Staggered */}
        <div className="text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-4xl font-black text-white tracking-tighter mb-2"
          >
            SUMO <span className="text-amber-500">GUARD</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-white/40 text-sm font-bold uppercase tracking-[0.4em]"
          >
            Fortifying Your Future
          </motion.p>
        </div>
      </motion.div>

      {/* Modern Loading Progress Bar */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-full w-full bg-gradient-to-r from-amber-500 to-orange-600"
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 text-[10px] text-white/20 font-bold uppercase tracking-widest"
      >
        Initializing Security Protocols...
      </motion.p>
    </div>
  );
};

export default SplashScreen;
