/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Check, RotateCcw, HelpCircle, Briefcase, Zap, Plus, Info, X } from 'lucide-react';
import { ActiveTimer, UsefulnessStatus, TimeEntry } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface TimerSheetProps {
  timer: ActiveTimer;
  onUpdateTimer: (updater: Partial<ActiveTimer>) => void;
  onSaveTimerEntry: (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const TimerSheet: React.FC<TimerSheetProps> = ({
  timer,
  onUpdateTimer,
  onSaveTimerEntry,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';

  const [seconds, setSeconds] = useState(0);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<{ ar: string; en: string }[]>(() => {
    const saved = localStorage.getItem('chrono-suggestions');
    return saved ? JSON.parse(saved) : [
      { ar: 'عمل عميق', en: 'Deep Work' },
      { ar: 'قراءة', en: 'Reading' },
      { ar: 'تعلم لغة', en: 'Language learning' },
      { ar: 'رياضة', en: 'Sport' },
      { ar: 'استراحة', en: 'Break' },
      { ar: 'مكالمة', en: 'Call' },
      { ar: 'اجتماع', en: 'Meeting' },
      { ar: 'سوشيال ميديا', en: 'Social Media' },
      { ar: 'يوتيوب', en: 'YouTube' },
      { ar: 'طبخ', en: 'Cooking' },
    ];
  });
  const [newSuggestionAr, setNewSuggestionAr] = useState('');
  const [newSuggestionEn, setNewSuggestionEn] = useState('');
  const [isEditingSuggestions, setIsEditingSuggestions] = useState(false);

  // Persist whenever changed
  useEffect(() => {
    localStorage.setItem('chrono-suggestions', JSON.stringify(suggestions));
  }, [suggestions]);
  
  const addSuggestion = () => {
    if (newSuggestionAr.trim() && newSuggestionEn.trim()) {
      setSuggestions([{ ar: newSuggestionAr.trim(), en: newSuggestionEn.trim() }, ...suggestions]);
      setNewSuggestionAr('');
      setNewSuggestionEn('');
    }
  };
  
  const removeSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (suggestedText: string) => {
    onUpdateTimer({ title: suggestedText });
  };

  // Sync state seconds
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer.is_running && timer.start_time) {
      const startMs = new Date(timer.start_time).getTime();
      
      const updateSeconds = () => {
        const elapsed = Math.floor((Date.now() - startMs) / 1000) + timer.accumulated_seconds;
        setSeconds(elapsed >= 0 ? elapsed : 0);
      };

      updateSeconds();
      interval = setInterval(updateSeconds, 1000);
    } else {
      setSeconds(timer.accumulated_seconds);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.is_running, timer.start_time, timer.accumulated_seconds]);

  // Format seconds to HH:MM:SS
  const formatTimeStr = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    onUpdateTimer({
      is_running: true,
      start_time: new Date().toISOString(),
    });
  };

  const handlePause = () => {
    if (timer.is_running && timer.start_time) {
      const sessionSecs = Math.floor((Date.now() - new Date(timer.start_time).getTime()) / 1000);
      onUpdateTimer({
        is_running: false,
        accumulated_seconds: timer.accumulated_seconds + sessionSecs,
        start_time: '',
      });
    }
  };

  const handleReset = () => {
    if (window.confirm(isAr ? 'هل تود بالتأكيد إعادة تصفير المؤقت الجاري؟' : 'Reset stopwatch count?')) {
      onUpdateTimer({
        is_running: false,
        accumulated_seconds: 0,
        start_time: '',
      });
      setSeconds(0);
    }
  };

  const handleSaveAndStop = (shouldClose: boolean) => {
    let finalSeconds = seconds;
    
    // Add current session if running
    if (timer.is_running && timer.start_time) {
      const sessionSecs = Math.floor((Date.now() - new Date(timer.start_time).getTime()) / 1000);
      finalSeconds = timer.accumulated_seconds + sessionSecs;
    }

    if (finalSeconds < 10) {
      alert(isAr ? 'تنبيه: السجل قصير جداً لحفظه (الحد الأدنى 10 ثوانٍ)' : 'Timer session is too short to log (min 10s)');
      return;
    }

    // Determine absolute start time
    const start = new Date(Date.now() - finalSeconds * 1000);
    const end = new Date();

    // Force end to be capped at 23:59 of the start day
    const endCapped = new Date(end);
    endCapped.setFullYear(start.getFullYear(), start.getMonth(), start.getDate());
    if (endCapped.getHours() > 23 || (endCapped.getHours() === 23 && endCapped.getMinutes() > 59)) {
      endCapped.setHours(23, 59, 0, 0);
    }

    const finalDiffMs = endCapped.getTime() - start.getTime();
    const finalDurationMins = finalDiffMs > 0 ? Math.max(1, Math.round(finalDiffMs / 60000)) : 1;

    const defaultIcon = 'Clock';
    const defaultColor = timer.usefulness_status === 'useful' 
      ? '#D4AF37' 
      : timer.usefulness_status === 'not_useful' 
        ? '#F44336' 
        : '#9E9E9E';

    onSaveTimerEntry({
      title: timer.title.trim() || (isAr ? 'جلسة مؤقتة' : 'Timed Session'),
      category_id: 'default',
      start_time: start.toISOString(),
      end_time: endCapped.toISOString(),
      duration_minutes: finalDurationMins,
      note: timer.note.trim() || undefined,
      usefulness_status: timer.usefulness_status,
      icon: defaultIcon,
      color: defaultColor,
    });

    // Reset timer
    onUpdateTimer({
      is_running: false,
      accumulated_seconds: 0,
      start_time: '',
      title: '',
      category_id: 'default',
      usefulness_status: 'useful',
      note: '',
    });
    setSeconds(0);
    
    if (shouldClose) onClose();
  };

  return (
    <div id="timer-screen-container" className="flex-1 flex flex-col bg-[#070707] overflow-y-auto no-scrollbar pb-10">
      
      {/* 1) Elite Tick Chronometer Dial */}
      <div className="pt-8 pb-4 flex flex-col items-center">
        
        {/* Giant golden glowing ring */}
        <div id="chrono-clock-dial" className={`relative w-56 h-56 rounded-full bg-[#0D0D0A] border-4 flex flex-col items-center justify-center transition-all duration-300 ${
          timer.is_running 
            ? 'border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.25)]' 
            : 'border-stone-800 shadow-[0_0_15px_rgba(0,0,0,0.6)]'
        }`}>
          {/* Subtle gold tick lines around the face */}
          <div className="absolute inset-2 rounded-full border border-dashed border-stone-800/40 pointer-events-none" />
          
          <span className={`text-[10px] text-stone-500 ${isAr ? 'font-sans tracking-normal' : 'font-mono uppercase tracking-widest'}`}>
            {timer.is_running ? (isAr ? 'نشط الآن' : 'LIVE TICK') : (isAr ? 'موقوف' : 'PAUSED')}
          </span>

          <span id="chrono-clock-digits" className="text-3xl font-bold font-mono text-stone-100 tracking-tight mt-1 mb-2">
            {formatTimeStr(seconds)}
          </span>

          <div 
            className={`flex items-center gap-1.5 px-3 py-1 bg-[#1A1914] rounded-full text-[10px] font-semibold select-none border ${isAr ? 'font-sans tracking-normal' : 'font-mono uppercase tracking-wider'}`}
            style={{ 
              color: timer.usefulness_status === 'useful' ? '#D4AF37' : timer.usefulness_status === 'not_useful' ? '#78716c' : '#9E9E9E',
              borderColor: timer.usefulness_status === 'useful' ? '#D4AF3733' : timer.usefulness_status === 'not_useful' ? '#78716c33' : '#9E9E9E33'
            }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ 
                backgroundColor: timer.usefulness_status === 'useful' ? '#D4AF37' : timer.usefulness_status === 'not_useful' ? '#78716c' : '#9E9E9E' 
              }} 
            />
            <span>
              {timer.usefulness_status === 'useful' 
                ? (isAr ? 'ممول' : 'Funded') 
                : timer.usefulness_status === 'not_useful' 
                  ? (isAr ? 'مجاني' : 'Free') 
                  : (isAr ? 'محايد' : 'Neutral')}
            </span>
          </div>

          {/* Golden radial gradient reflection under glow */}
          {timer.is_running && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-[#D4AF37]/5 to-transparent animate-[spin_4s_linear_infinite] pointer-events-none" />
          )}
        </div>

        {/* Stopwatch Physical Trigger Controls */}
        <div className="flex justify-center items-center gap-4 mt-6">
          {/* Reset button */}
          <button 
            id="timer-reset-btn"
            onClick={handleReset}
            disabled={seconds === 0}
            className="w-12 h-12 rounded-full bg-[#141411] border border-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-100 enabled:cursor-pointer disabled:opacity-30 transition-all active:scale-95"
            title={isAr ? 'تصفير' : 'Reset'}
          >
            <RotateCcw size={16} />
          </button>

          {/* Toggle Play / Pause Primary trigger with golden aura */}
          {timer.is_running ? (
            <button 
              id="timer-pause-btn"
              onClick={handlePause}
              className="w-18 h-18 rounded-full bg-stone-100 border-2 border-[#D4AF37] shadow-lg flex items-center justify-center text-black font-bold cursor-pointer hover:bg-stone-200 transition-all active:scale-95"
            >
              <Pause size={24} className="fill-current text-black" />
            </button>
          ) : (
            <button 
              id="timer-start-btn"
              onClick={handleStart}
              className="w-18 h-18 rounded-full bg-gradient-to-r from-[#D5B038] to-[#C59B27] shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center text-black font-bold cursor-pointer hover:from-[#E5C354] transition-all active:scale-95"
            >
              <Play size={24} className="fill-current text-black ml-1" />
            </button>
          )}

          {/* Accept and Save button */}
          <button 
            id="timer-save-btn"
            onClick={() => handleSaveAndStop(true)}
            disabled={seconds < 10}
            className="w-12 h-12 rounded-full bg-[#181C14] border border-[#4CAF50]/30 flex items-center justify-center text-[#4CAF50] hover:bg-[#202919] enabled:cursor-pointer disabled:opacity-30 transition-all active:scale-95"
            title={isAr ? 'حفظ وإغلاق' : 'Save & Close'}
          >
            <Check size={20} />
          </button>
        </div>
      </div>

      {/* 2) ON-THE-FLY CONFIG PANEL (Rich parameters inputs while timer ticks!) */}
      <div className="px-5 mt-4 space-y-4">
        
        <div className="p-4 bg-[#0F0E0B] border border-[#D4AF37]/15 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-semibold border-b border-[#D4AF37]/10 pb-2">
            <Info size={13} />
            <span>{isAr ? 'معلومات النشاط الجاري تتبعه' : 'Configure current session parameters'}</span>
          </div>

          {/* Title input */}
          <div id="timer-title-group" className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400 block">
              {isAr ? 'ما الذي تفعله الآن؟' : 'What are you working on right now?'}
            </label>
            <input
              id="timer-title-input"
              type="text"
              placeholder={isAr ? 'اكتب عنوان النشاط ...' : 'Describe your active session...'}
              value={timer.title}
              onChange={e => onUpdateTimer({ title: e.target.value })}
              className="w-full bg-[#181815] border border-stone-800 rounded-lg py-2 px-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#D4AF37]"
            />
            
            {/* Quick Suggestions UI */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] text-stone-500 uppercase ${isAr ? 'font-sans tracking-normal' : 'font-mono uppercase tracking-widest'}`}>
                  {isAr ? 'اقتراحات سريعة' : 'Quick Suggestions'}
                </label>
                <button 
                  onClick={() => setIsEditingSuggestions(!isEditingSuggestions)}
                  className="text-[10px] text-[#D4AF37] underline cursor-pointer"
                >
                  {isEditingSuggestions ? (isAr ? 'تم' : 'Done') : (isAr ? 'تعديل' : 'Edit')}
                </button>
              </div>

              {isEditingSuggestions && (
                <div className="grid grid-cols-2 gap-2 bg-[#1C1A14] p-2 rounded-xl">
                  <input placeholder={isAr ? 'العربية' : 'Arabic'} value={newSuggestionAr} onChange={e => setNewSuggestionAr(e.target.value)} className="bg-black/20 p-1.5 rounded text-xs text-white" />
                  <input placeholder={isAr ? 'English' : 'English'} value={newSuggestionEn} onChange={e => setNewSuggestionEn(e.target.value)} className="bg-black/20 p-1.5 rounded text-xs text-white" />
                  <button onClick={addSuggestion} className="col-span-2 bg-[#D4AF37]/20 text-[#D4AF37] p-1.5 rounded text-xs font-bold">
                    {isAr ? 'إضافة' : 'Add'}
                  </button>
                </div>
              )}
              
              <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar text-[11px]">
                {suggestions.map((sug, i) => (
                  <div key={i} className="flex items-center gap-1 bg-[#1C1A14] border border-[#D4AF37]/15 rounded-full px-3 py-1 shrink-0 relative">
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(isAr ? sug.ar : sug.en)}
                      className="text-[#E5C158] cursor-pointer whitespace-nowrap"
                    >
                      {isAr ? sug.ar : sug.en}
                    </button>
                    {isEditingSuggestions && (
                      <button onClick={() => removeSuggestion(i)} className="text-red-500 hover:text-red-300 ml-1">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usefulness level rating triggers (The fundamental requested field!) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-400 block">
              {isAr ? 'تصنيف الاستفادة من وقتك: ممول أم مجاني؟' : 'Time Utility: Funded or Free?'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="timer-usefulness-useful"
                type="button"
                onClick={() => onUpdateTimer({ usefulness_status: 'useful' })}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  timer.usefulness_status === 'useful' 
                    ? 'bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]' 
                    : 'bg-[#151512] text-stone-500 border border-stone-850'
                }`}
              >
                🟢 {isAr ? 'ممول' : 'Funded'}
              </button>

              <button
                id="timer-usefulness-notuseful"
                type="button"
                onClick={() => onUpdateTimer({ usefulness_status: 'not_useful' })}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  timer.usefulness_status === 'not_useful' 
                    ? 'bg-[#F44336]/15 text-[#F44336] border border-[#F44336]' 
                    : 'bg-[#151512] text-stone-500 border border-stone-850'
                }`}
              >
                🔴 {isAr ? 'مجاني' : 'Free'}
              </button>
            </div>
          </div>



          {/* Quick Note */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-stone-400 block">
              {isAr ? 'ملاحظة سريعة' : 'Private note or tag'}
            </label>
            <input
              id="timer-note-input"
              type="text"
              placeholder={isAr ? 'مثال: أعمل على المشهد رقم 3 ...' : 'e.g. debugging client database logs...'}
              value={timer.note}
              onChange={e => onUpdateTimer({ note: e.target.value })}
              className="w-full bg-[#181815] border border-stone-800 rounded-lg py-2 px-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

        </div>

        {/* Dynamic Tips section */}
        <div className="p-3 bg-[#111] border border-stone-800 rounded-xl flex items-start gap-3 text-stone-400 text-[10px] leading-relaxed">
          <Zap size={15} className="text-[#D4AF37] shrink-0 mt-0.5 animate-bounce" />
          <p>
            {isAr 
              ? "سيتم تدوين وحساب مدة هذا النشاط وتوقيت بدئه بدقة فائقة بمجرد ضغطك على زر لحفظ والتأكيد الأخضر."
              : "This session will be generated with strict start/end intervals and directly patched into your today's timeline."}
          </p>
        </div>

      </div>

    </div>
  );
};
