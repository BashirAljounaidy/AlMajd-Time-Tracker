/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Battery, Wifi, Signal, RefreshCw, Layers } from 'lucide-react';

interface NativeSimulatorProps {
  children: React.ReactNode;
  platform: 'ios' | 'android';
  setPlatform: (p: 'ios' | 'android') => void;
  lang: 'ar' | 'en';
  setLang: (l: 'ar' | 'en') => void;
}

export const NativeSimulator: React.FC<NativeSimulatorProps> = ({
  children,
  platform,
  setPlatform,
  lang,
  setLang,
}) => {
  const [deviceTime, setDeviceTime] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes().toString().padStart(2, '0');
      setDeviceTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isAr = lang === 'ar';

  return (
    <div id="simulator-wrapper" className="flex flex-col items-center justify-center min-h-screen bg-[#070707] py-6 px-4 font-sans select-none overflow-x-hidden">
      
      {/* Top Banner Control Panel (Floating elegant controls) */}
      <div id="sim-controls" className="w-full max-w-[420px] mb-4 flex justify-between items-center bg-[#13120E]/90 border border-[#D4AF37]/30 rounded-xl px-4 py-2 text-xs text-stone-300 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[#D4AF37]" />
          <span className="font-semibold text-stone-100">AlMajd Time Tracker Simulator</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Platform Toggle */}
          <button 
            id="toggle-platform"
            onClick={() => setPlatform(platform === 'ios' ? 'android' : 'ios')}
            className="flex items-center gap-1 bg-[#1A1813] hover:bg-[#2A2518] border border-[#D4AF37]/20 rounded-md py-1 px-2 cursor-pointer transition-colors"
          >
            <Smartphone size={12} className="text-[#D4AF37]" />
            <span className="uppercase">{platform} UI</span>
          </button>

          {/* Language Toggle */}
          <button 
            id="toggle-lang"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center justify-center w-14 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold rounded py-1 px-2 cursor-pointer transition-colors text-[10px]"
          >
            {isAr ? 'English' : 'العربية'}
          </button>
        </div>
      </div>

      {/* Main Outer Smartphone Simulator Device Shell */}
      {/* On desktop viewports (md:w-[420px]) this behaves as a realistic high-end phone shell with golden reflection highlights */}
      <div 
        id="phone-shell"
        className="relative w-full max-w-[420px] h-[860px] md:h-[840px] bg-[#0E0E0A] rounded-[50px] shadow-[0_0_80px_rgba(212,175,55,0.15)] border-4 border-stone-800 flex flex-col overflow-hidden transition-all duration-300 md:ring-8 md:ring-[#D4AF37]/40"
      >
        {/* Mirror Reflection Accent on side cases */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-[#D4AF37]/10 via-[#D4AF37]/40 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-[#D4AF37]/10 pointer-events-none" />

        {/* Dynamic Island (iOS) or Camera Punch Hole (Android) */}
        {platform === 'ios' ? (
          <div id="dynamic-island" className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-[24px] bg-black rounded-full z-50 flex items-center justify-center border border-stone-900">
            <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full absolute right-4" />
            <div className="w-1.5 h-1.5 bg-[#1e293b] rounded-full absolute right-8" />
          </div>
        ) : (
          <div id="camera-punch" className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 flex items-center justify-center border border-stone-900">
            <div className="w-1.5 h-1.5 bg-[#0f172a] rounded-full" />
          </div>
        )}

        {/* Top Native Status Bar (Gold highlights) */}
        <div id="phone-status-bar" className="h-10 px-6 pt-2 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center text-[11px] text-[#E5C158] font-medium z-40">
          {/* Time indicator (Left on iOS, Right on Android) */}
          {platform === 'ios' ? (
            <span id="statusBar-time" className="font-semibold text-xs tracking-tight">{deviceTime}</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <Signal size={11} />
              <Wifi size={11} />
            </div>
          )}

          {/* Right details */}
          {platform === 'ios' ? (
            <div className="flex items-center gap-1.5">
              <Signal size={12} className="text-[#E5C158]" />
              <span className="text-[10px]">5G</span>
              <Wifi size={12} className="text-[#E5C158]" />
              <div className="flex items-center gap-0.5 border border-[#E5C158]/50 rounded px-0.5 py-0.2">
                <Battery size={13} className="fill-[#E5C158]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span id="statusBar-time-android" className="font-semibold text-xs">{deviceTime}</span>
              <div className="flex items-center gap-0.5 text-[#E5C158]">
                <span>100%</span>
                <Battery size={13} className="fill-[#E5C158]" />
              </div>
            </div>
          )}
        </div>

        {/* Internal Screen Content */}
        <div 
          id="screen-content" 
          dir={isAr ? 'rtl' : 'ltr'} 
          className="flex-1 overflow-hidden relative flex flex-col bg-[#070707] text-[#FAF8F5]"
        >
          {children}
        </div>

        {/* Bottom Home Indicator Plate (iOS: Bar, Android: standard buttons or minimalist pill) */}
        <div id="phone-home-indicator" className="h-5 bg-[#070707] flex justify-center items-center relative z-40">
          {platform === 'ios' ? (
            <div className="w-32 h-1 bg-stone-700 rounded-full" />
          ) : (
            <div className="flex justify-around items-center w-full px-12 py-1 text-stone-600">
              <div className="w-2.5 h-2.5 border-2 border-stone-600 rounded-sm rotate-45" />
              <div className="w-3 h-3 border-2 border-stone-600 rounded-full" />
              <div className="w-2.5 h-4 border-l-2 border-t-2 border-stone-600 -rotate-45" />
            </div>
          )}
        </div>

      </div>

      {/* Footer Branding Metadata */}
      <p id="simulator-info" className="text-[11px] text-stone-500 mt-3 text-center max-w-[420px] leading-relaxed">
        {isAr 
          ? "تطبيق AlMajd Time Tracker محمي بقاعدة بيانات محلية مستقرة. اسحب لليسار أو انقر على اللائحة لتعديل أو حذف الأنشطة." 
          : "AlMajd Time Tracker is powered by offline storage. Swipe actions or click buttons to edit/remove entries."}
      </p>
    </div>
  );
};
