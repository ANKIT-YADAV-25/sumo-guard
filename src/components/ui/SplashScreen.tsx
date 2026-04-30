import React from "react";
import { motion } from "framer-motion";

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080d14]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500/10 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-600/5 blur-[120px]" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 20,
          duration: 0.8 
        }}
        className="relative"
      >
        {/* Logo Container */}
        <div className="relative w-32 h-32 mb-6">
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(245,158,11,0.2)",
                "0 0 40px rgba(245,158,11,0.4)",
                "0 0 20px rgba(245,158,11,0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full rounded-3xl overflow-hidden border border-white/10"
          >
            <img 
              src="/logo.png" 
              alt="Sumo Guard Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Animated Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-amber-500/20 rounded-full"
          />
        </div>

        {/* Text Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
            SUMO <span className="text-amber-500">GUARD</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
            Your Health Fortress
          </p>
        </motion.div>
      </motion.div>

      {/* Loading Indicator */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-20 w-32 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent origin-center"
      />
    </div>
  );
};

export default SplashScreen;
