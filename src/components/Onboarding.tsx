/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, BarChart3, Clock, CheckCircle, ChevronRight, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  lang: 'ar' | 'en';
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang }) => {
  const [slide, setSlide] = useState(0);

  const isAr = lang === 'ar';

  const slides = [
    {
      icon: <Clock size={40} className="text-[#D4AF37]" />,
      titleAr: 'سجّل وقتك بسهولة',
      titleEn: 'Zero-Friction Logging',
      descAr: 'استبدل المفكرة الورقية تماماً! تتبع فترات يومك بمرونة عن طريق الإدخال اليدوي السريع أو تشغيل المؤقت الحي بضغطة واحدة.',
      descEn: 'Swap your paper notebook for a luxury chronicle. Log intervals with simple start/end pickers or trigger the active live stopwatch.',
      badge: 'AlMajd Control',
    },
    {
      icon: <Target size={40} className="text-[#D4AF37]" />,
      titleAr: 'تقييم وقتك هل تستفيد منه بشكل ممول او غير ممول',
      titleEn: 'Rate Your Usefulness',
      descAr: 'المفتاح السري لإنتاجيتك! قيم كل نشاط تقوم به لتفصيل فترات يومك فوراً لمعرفة فترات التشتت وأوقات العطاء الذهني العالي.',
      descEn: 'The core metric for time-mastery. Mark activities on our usefulness scale (Paid, Free) to diagnose leaks immediately.',
      badge: 'Usefulness Rating',
    },
    {
      icon: <BarChart3 size={40} className="text-[#D4AF37]" />,
      titleAr: 'إحصائيات وتقارير نخبوية',
      titleEn: 'Elite Weekly Diagnostics',
      descAr: 'حلل وعيك اليومي بالأوقات! راقب الأنشطة الأكثر استهلاكاً لوقتك وقارن الأيام',
      descEn: 'Build strict self-awareness. Monitor category pies and compare daily scores with dynamic graphs.',
      badge: 'Smart Metrics',
    },
  ];

  const current = slides[slide];

  const nextSlide = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      id="onboarding-bg"
      className="absolute inset-0 bg-[#070707] flex flex-col justify-between p-6 z-50 text-sans"
    >
      {/* Head section */}
      <div className="flex justify-between items-center pt-6">
        <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase bg-[#181611]/80 px-2.5 py-1 rounded-full border border-[#D4AF37]/20 flex items-center gap-1">
          <Zap size={10} className="text-[#D4AF37] animate-pulse" />
          {current.badge}
        </span>
        <button
          id="skip-onboarding-btn"
          onClick={onComplete}
          className="text-stone-400 hover:text-[#D4AF37] text-xs cursor-pointer transition-colors"
        >
          {isAr ? 'تخطي' : 'Skip'}
        </button>
      </div>

      {/* Main Slide Carousel Card */}
      <div
        id={`onboarding-card-${slide}`}
        className="my-auto py-12 px-6 bg-[#0E0D0A] border border-[#D4AF37]/15 rounded-3xl relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl rounded-full" />

        {/* Big Rounded Icon Container */}
        <div className="w-20 h-20 rounded-2xl bg-[#161410] border-2 border-[#D4AF37]/20 flex items-center justify-center mb-8 shadow-inner">
          {current.icon}
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-stone-100 tracking-tight leading-snug mb-4">
          {isAr ? current.titleAr : current.titleEn}
        </h2>

        <p className="text-stone-400 text-sm leading-relaxed mb-6">
          {isAr ? current.descAr : current.descEn}
        </p>
      </div>

      {/* Interactive Bottom Control Panel */}
      <div className="pb-8 flex flex-col gap-6">
        {/* Dot Indicators */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              id={`dot-onboarding-${idx}`}
              onClick={() => setSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${slide === idx ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-stone-700'
                }`}
            />
          ))}
        </div>

        {/* Next / Proceed Buttons */}
        <button
          id="next-onboarding-btn"
          onClick={nextSlide}
          className="w-full h-13 rounded-xl bg-gradient-to-r from-[#D5B038] via-[#F3E5AB] to-[#C59B27] hover:from-[#E5C354] hover:to-[#B58B17] text-black font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-transform"
        >
          <span>
            {slide === slides.length - 1
              ? (isAr ? 'ابدأ الآن الاستخدام' : 'Get Started')
              : (isAr ? 'المتابعة' : 'Next Step')
            }
          </span>
          <ChevronRight size={16} className={isAr ? 'rotate-180' : ''} />
        </button>
      </div>
    </div>
  );
};
