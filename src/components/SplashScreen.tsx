/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ShieldCheck, Zap } from 'lucide-react';

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
        {/* Animated Gold Ring & Clock Logo */}
        <div id="splash-logo-container" className="relative mb-8 p-6 rounded-full bg-[#111111] border border-[#D4AF37]/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          {/* Rotating exterior gold gradient ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/40 animate-[spin_20s_linear_infinite]" />
          
          <Clock size={48} className="text-[#D4AF37] animate-pulse relative z-10" />
        </div>

        {/* Brand Typography */}
        <h1 
          id="splash-brand-title"
          className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FAF8F5] via-[#D4AF37] to-[#FAF8F5] font-sans text-center"
        >
          {isAr ? 'المجد تتبع وقتك' : 'AlMajd - Track your time'}
        </h1>
        
        <p id="splash-brand-subtitle" className="text-stone-400 text-xs mt-3 tracking-widest text-center max-w-[280px]">
          {isAr ? 'تتبع وقتك كن من النخبة' : 'Premium Time Analytics for Achievers'}
        </p>
      </div>

      {/* Modern Status Footer */}
      <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
        <div className="flex items-center gap-1 text-[10px] text-amber-500/80 uppercase tracking-widest font-mono">
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
