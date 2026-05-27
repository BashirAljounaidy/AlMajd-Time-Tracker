/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Zap } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  lang: 'ar' | 'en';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, lang }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Elegant pulsing loading status
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 400);

    // Auto finish
    const timeout = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  const isAr = lang === 'ar';

  return (
    <div 
      id="splash-screen-bg"
      className="absolute inset-0 bg-[#070707] flex flex-col items-center justify-between py-16 px-6 z-[100] overflow-hidden"
    >
      {/* Background radial gold glow */}
      <div id="splash-bg-radial" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#D4AF37]/5 blur-[80px]" />

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Custom Gold Crown Monogram Logo */}
        <div id="splash-logo-container" className="relative mb-6 p-1 bg-transparent flex items-center justify-center select-none">
          {/* Dynamic rotating golden glow rings behind the logo */}
          <div className="absolute inset-[-12px] rounded-full border border-dashed border-[#D4AF37]/20 animate-[spin_30s_linear_infinite] pointer-events-none" />
          <div className="absolute inset-[-6px] rounded-full border border-dashed border-[#D4AF37]/10 animate-[spin_20s_linear_infinite_reverse] pointer-events-none" />
          
          <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.25)] relative z-10">
            {/* Path 1: Left Leg of A (Background on left) */}
            <motion.path
              d="M 32 65 L 50 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
            />

            {/* Path 2: M Right Side (Background on right) */}
            <motion.path
              d="M 50 51 L 78 30 L 78 65"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut", delay: 0.3 }}
            />

            {/* Path 3: M Left Side (Foreground on left) */}
            <motion.path
              d="M 22 65 L 22 30 L 50 51"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Path 4: Right Leg of A (Foreground on right) */}
            <motion.path
              d="M 50 20 L 68 65"
              fill="none"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.7 }}
            />
          </svg>
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col items-center mt-6 space-y-1.5 select-none">
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
            className="text-3xl font-extrabold text-[#D4AF37] font-sans text-center tracking-normal drop-shadow-[0_0_8px_rgba(212,175,55,0.15)]"
          >
            المجد جروب
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
            className="text-stone-300 text-xs font-mono tracking-[0.25em] text-center uppercase"
          >
            AL MAJD GROUP
          </motion.p>
          
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-[9px] text-stone-500 font-mono tracking-widest text-center mt-3 uppercase"
          >
            {isAr ? 'نظام إدارة وتتبع الوقت النخبوي' : 'Elite Time Management System'}
          </motion.span>
        </div>
      </div>

      {/* Modern Status Footer */}
      <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
        <div className={`flex items-center gap-1 text-[10px] text-amber-500/80 uppercase font-mono ${isAr ? 'tracking-normal' : 'tracking-widest'}`}>
          <Zap size={10} className="text-[#D4AF37] animate-bounce" />
          <span>{isAr ? 'تهيئة التخزين المحلي الآمن' : 'Loading Local Vault'}{dots}</span>
        </div>

        {/* Quick Skip Option */}
        <button
          id="skip-splash-btn"
          onClick={onFinish}
          className="text-[11px] text-[#D4AF37] hover:text-[#FAF8F5] transition-colors py-1.5 px-4 rounded-full bg-[#151410] border border-[#D4AF37]/20 hover:border-[#D4AF37] cursor-pointer"
        >
          {isAr ? 'تخطي الانتظار' : 'Skip Intro'}
        </button>

        <div className="flex items-center gap-1.5 text-stone-600 text-[10px] mt-2">
          <ShieldCheck size={12} className="text-[#D4AF37]/40" />
          <span>{isAr ? 'مشفر محلياً 100%' : '100% Offline Secured'}</span>
        </div>
      </div>
    </div>
  );
};
