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
        className="relative w-full max-w-[420px] min-h-[600px] bg-[#0E0E0A] rounded-2xl border border-stone-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
      >
        {/* Internal Screen Content */}
        <div 
          id="screen-content" 
          dir={isAr ? 'rtl' : 'ltr'} 
          className="flex-1 overflow-hidden relative flex flex-col bg-[#070707] text-[#FAF8F5]"
        >
          {children}
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
