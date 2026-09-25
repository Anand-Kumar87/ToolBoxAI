"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "@/components/ui/logo";

export function Preloader() {
  const [loading, setLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [statusText, setStatusText] = React.useState("INITIALIZING NEURAL SUITE...");

  React.useEffect(() => {
    // Check if user already saw the intro in this session
    const hasLoaded = sessionStorage.getItem("toolverse_intro_loaded");
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem("toolverse_intro_loaded", "true");
          }, 400);
          return 100;
        }

        // Variable increments for authentic luxury loading feel
        const diff = Math.floor(Math.random() * 12) + 6;
        const next = Math.min(prev + diff, 100);

        if (next > 25 && next <= 55) {
          setStatusText("SYNCHRONIZING 50+ AI MODELS...");
        } else if (next > 55 && next <= 85) {
          setStatusText("CALIBRATING HIGH-SPEED WORKFLOWS...");
        } else if (next > 85) {
          setStatusText("ENTERPRISE PIPELINE READY");
        }

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1, y: 0 }}
          exit={{ 
            y: "-100%",
            transition: { 
              duration: 0.85, 
              ease: [0.76, 0, 0.24, 1] as [number, number, number, number] 
            }
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#05080b] text-white select-none overflow-hidden"
        >
          {/* Ambient Cyber Mint Horizon Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

          {/* Luxury Micro-Grid */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(rgba(0, 242, 176, 0.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />

          <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
            
            {/* Rotating Orbital Ring with Core Sparkle */}
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
              {/* Outer Glow Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-emerald-500/30 border-t-emerald-400 border-r-teal-400 shadow-[0_0_25px_rgba(0,242,176,0.3)]"
              />
              {/* Counter-rotating Inner Ring */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-teal-500/20 border-b-emerald-400"
              />
              {/* Luminous Center Logo Badge */}
              <div className="w-14 h-14 flex items-center justify-center">
                <LogoIcon className="w-12 h-12" />
              </div>
            </div>

            {/* Brand Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs sm:text-sm font-black tracking-[0.35em] text-white/90 uppercase mb-2"
            >
              Korevante<span className="text-emerald-400">.ai</span>
            </motion.h2>

            {/* Dynamic Status Ticker */}
            <p className="text-[10px] sm:text-xs font-mono tracking-widest text-emerald-400/80 mb-6 h-4 text-center">
              {statusText}
            </p>

            {/* Luminous Neon Progress Bar */}
            <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden p-[1px] mb-4 border border-white/10 shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full shadow-[0_0_15px_rgba(0,242,176,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            {/* Numerical Counter */}
            <div className="flex items-center justify-between w-full text-[11px] font-mono text-white/50">
              <span>SYSTEM BOOT</span>
              <span className="text-emerald-400 font-bold text-sm tracking-widest">{progress}%</span>
            </div>

          </div>

          {/* Bottom Security / Version Tag */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SECURE NEURAL WORKSPACE • V2.5 ENTERPRISE</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
