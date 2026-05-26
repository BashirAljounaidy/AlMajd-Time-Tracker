/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Clock, TrendingUp, AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import { TimeEntry } from '../types';

interface TodayViewProps {
  currentDate: Date;
  onNavigateDate: (direction: 'prev' | 'next') => void;
  entries: TimeEntry[];
  onAddEntryClick: (defaultStart?: string, defaultEnd?: string) => void;
  onEditEntryClick: (entry: TimeEntry) => void;
  onStartTimerQuick: () => void;
  lang: 'ar' | 'en';
}

export const TodayView: React.FC<TodayViewProps> = ({
  currentDate,
  onNavigateDate,
  entries,
  onAddEntryClick,
  onEditEntryClick,
  onStartTimerQuick,
  lang,
}) => {
  const isAr = lang === 'ar';

  // Format Helper: date to readable arabic/english string
  const formatDateString = (date: Date) => {
    if (isAr) {
      return date.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Extract date string part (YYYY-MM-DD) for local comparison
  const getDateStr = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const activeDateStr = getDateStr(currentDate);

  // Filter entries for active date
  const dailyEntries = entries
    .filter(entry => {
      const entryDateStr = getDateStr(new Date(entry.start_time));
      return entryDateStr === activeDateStr;
    })
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const [goalHours, setGoalHours] = React.useState(() => {
    const saved = localStorage.getItem('productiveGoalHours') || '8';
    return parseInt(saved);
  });

  React.useEffect(() => {
    localStorage.setItem('productiveGoalHours', goalHours.toString());
  }, [goalHours]);

  // Calculations for Today's metrics
  const totalTrackedMins = dailyEntries.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  
  const usefulMins = dailyEntries
    .filter(e => e.usefulness_status === 'useful')
    .reduce((acc, curr) => acc + curr.duration_minutes, 0);

  const productiveGoalMins = goalHours * 60;
  const progressPercentage = Math.min(100, Math.round((usefulMins / productiveGoalMins) * 100));

  const goalReached = productiveGoalMins > 0 && usefulMins >= productiveGoalMins;

  const notUsefulMins = dailyEntries
    .filter(e => e.usefulness_status === 'not_useful')
    .reduce((acc, curr) => acc + curr.duration_minutes, 0);

  const neutralMins = dailyEntries
    .filter(e => e.usefulness_status === 'neutral')
    .reduce((acc, curr) => acc + curr.duration_minutes, 0);

  const usefulnessPercentage = totalTrackedMins > 0 
    ? Math.round((usefulMins / totalTrackedMins) * 100) 
    : 0;

  // Format minutes into clean hours and minutes
  const formatMins = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs > 0) {
      return isAr 
        ? `${hrs} س ${mins > 0 ? `و ${mins} د` : ''}`
        : `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return isAr ? `${mins} دقيقة` : `${mins}m`;
  };

  const formatShortTime = (isoString: string) => {
    const d = new Date(isoString);
    const hrs = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  // TIMELINE GENERATION (Includes registered entries!)
  interface TimelineItem {
    type: 'entry';
    id: string;
    start: string; // ISO string
    end: string;   // ISO string
    duration: number; // minutes
    entryData: TimeEntry;
  }

  const buildTimeline = (): TimelineItem[] => {
    return dailyEntries.map(entry => ({
        type: 'entry',
        id: entry.id,
        start: entry.start_time,
        end: entry.end_time,
        duration: entry.duration_minutes,
        entryData: entry,
    }));
  };

  const timelineItems = buildTimeline();

  return (
    <div id="today-view-root" className="flex-1 flex flex-col bg-[#070707] relative overflow-hidden">
      
      {goalReached && (
        <div className="z-50 bg-[#D4AF37] text-black text-xs font-bold py-3 px-4 shadow-lg text-center w-full">
            {isAr ? '🎉 تهانينا! حققت هدفك اليومي 🌟' : '🎉 Congratulations! Daily goal achieved! 🌟'}
        </div>
      )}

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[180px]">
        
        {/* Elite Brand Header mimicking the Reference Image */}
        <div className="px-3 pt-4 pb-2 select-none flex flex-col">
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest leading-none mb-1.5 font-semibold">
            {isAr ? 'المجد امتلك يومك امتلك حياتك' : 'ALMAJD: OWN YOUR DAY, OWN YOUR LIFE'}
          </span>
          <div className="text-2xl font-extrabold font-sans text-[#D4AF37] tracking-tight uppercase">
            {formatDateString(currentDate)}
          </div>
        </div>

      {/* 2) High-End Bento Scorecard Grid */}
      <div className="px-3 py-1">
        <div id="bento-scorecard" className="bg-gradient-to-br from-[#12110D] to-[#0A0A08] border border-[#D4AF37]/15 rounded-3xl p-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
          
          {/* Subtle logo background */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl rounded-full" />

          <div className="grid grid-cols-12 gap-3 items-center">
            
            {/* Left side metrics stack: useful, unuseful, tracked */}
            <div className="col-span-7 space-y-2.5">
              
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">
                        {isAr ? 'إجمالي الوقت المسجّل' : 'TOTAL TRACKED'}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] text-stone-600 font-mono">
                        {isAr ? `هدف: ${goalHours} ساعات إنجاز ممول` : `Goal: ${goalHours} funded hours`}
                      </div>
                    </div>
                    <p id="metric-total-tracked" className="text-stone-100 font-bold text-lg font-sans leading-none flex items-center gap-1">
                      <Clock size={15} className="text-[#D4AF37]" />
                      <span>{formatMins(totalTrackedMins)}</span>
                    </p>
                  </div>

              {/* Progress bars split (Strictly gold & charcoal/bronze) */}
              <div className="space-y-1.5 pt-1 border-t border-stone-900/40">
                {/* Useful hours */}
                <div>
                  <div className="flex justify-between items-center text-[9px] font-medium leading-none mb-1">
                    <span className="text-[#D4AF37]">{isAr ? '✨ وقت ممول' : '✨ Funded'}</span>
                  </div>
                  <div className="h-1 bg-stone-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8F741D] to-[#D4AF37]"
                      style={{ width: `${totalTrackedMins > 0 ? (usefulMins / totalTrackedMins) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Not Useful Hours */}
                <div>
                  <div className="flex justify-between items-center text-[9px] font-medium leading-none mb-1">
                    <span className="text-stone-500">{isAr ? '⏳ وقت مجاني' : '⏳ Free'}</span>
                  </div>
                  <div className="h-1 bg-stone-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2E2819] border border-stone-800"
                      style={{ width: `${totalTrackedMins > 0 ? (notUsefulMins / totalTrackedMins) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right side donut productivity percentage circular progress */}
            <div className="col-span-5 flex flex-col items-center justify-center p-1 ltr:border-l rtl:border-r border-stone-900/40">
              
              <div className="relative w-20 h-20 flex items-center justify-center mb-1">
                {/* SVG Radial Gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-900"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#D4AF37]"
                    strokeDasharray={`${progressPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Inner percentage metrics */}
                <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                  <span id="scorecard-percent" className="font-bold text-lg font-sans text-stone-100">{progressPercentage}%</span>
                  <span className="text-[7.5px] uppercase text-stone-500 font-mono tracking-wider mt-0.5">
                    {isAr ? 'إنجاز' : 'Goal'}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>



      {/* 3) Dynamic Timeline List */}
      <div className="px-3 pt-2 space-y-2">
        
        <h3 className="text-[11px] uppercase tracking-widest font-mono text-stone-500 font-bold px-1 select-none">
          {isAr ? 'التسلسل الزمني لليوم' : 'CHRONOLOGY SLOTS'}
        </h3>

        {/* EMPTY STATE */}
        {dailyEntries.length === 0 && (
          <div id="timeline-empty-state" className="py-12 px-6 bg-[#0E0E0C] border border-dashed border-stone-850 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
              <HelpCircle size={22} className="text-stone-600" />
            </div>
            <div>
              <p className="text-stone-300 font-semibold text-xs">
                {isAr ? 'لا توجد أنشطة مسجلة في هذا اليوم بعد' : 'Uncharted Chronicle Day'}
              </p>
              <p className="text-stone-500 text-[10px] mt-1.5 max-w-[240px]">
                {isAr 
                  ? 'اضغط على زر الإضافة الذهني بالأسفل، أو قم بتشغيل المؤقت فليكسي لنشاطك القادم!' 
                  : 'Tap the floating add badge or activate the live stopwatch to claim these hours!'}
              </p>
            </div>
            <button
              id="empty-add-btn"
              onClick={() => onAddEntryClick()}
              className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold text-[11px] px-4 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              {isAr ? 'إدخال يدوي سريع' : 'Manual Entry Now'}
            </button>
          </div>
        )}

        {/* Timeline Map rendering */}
        {timelineItems.length > 0 && (
          <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 ltr:before:left-3.5 rtl:before:right-3.5 before:w-[1.5px] before:bg-stone-900">
            
            {timelineItems.map((item, idx) => {
              
              // --- IF REGULAR ENTRY CODE (Matches reference image style but cleaner!) ---
              const entry = item.entryData;

              return (
                <div 
                  key={entry.id}
                  id={`timeline-entry-${entry.id}`}
                  onClick={() => onEditEntryClick(entry)}
                  className="relative ltr:ml-8 rtl:mr-8 group animate-[fadeIn_0.25s] cursor-pointer"
                >
                  {/* Distinctive timeline ring dot */}
                  <div className={`absolute ltr:-left-[24px] rtl:-right-[24px] top-6 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-[#070707] border-2 flex items-center justify-center z-10 ${entry.usefulness_status === 'not_useful' ? 'border-[#78716c]' : 'border-[#D4AF37]'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${entry.usefulness_status === 'not_useful' ? 'bg-[#78716c]' : 'bg-[#D4AF37]'}`} />
                  </div>

                  {/* High Quality Styled Entry Card (Strictly Black & Gold) */}
                  <div 
                    className="bg-[#0E0E0C] hover:bg-[#151512] rounded-2xl p-4 flex flex-col gap-2.5 transition-all shadow-md relative overflow-hidden ltr:border-l-4 rtl:border-r-4 hover:shadow-lg"
                    style={{ 
                      borderLeftColor: entry.usefulness_status === 'not_useful' ? '#78716c' : '#D4AF37',
                      borderRightColor: entry.usefulness_status === 'not_useful' ? '#78716c' : '#D4AF37'
                    }}
                  >
                    {/* Subtle hover light */}
                    <div 
                      className="absolute top-0 ltr:right-0 rtl:left-0 w-8 h-8 rounded-bl-full opacity-10 pointer-events-none" 
                      style={{ backgroundColor: entry.usefulness_status === 'not_useful' ? '#78716c' : '#D4AF37' }}
                    />

                    {/* Top line of card containing Space Title */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 
                          className={`text-xs font-bold ${entry.usefulness_status === 'not_useful' ? 'text-stone-500' : 'text-stone-100 group-hover:text-[#D4AF37]'} transition-colors leading-snug`}
                        >
                          {entry.title}
                        </h4>
                        
                        {/* Sub data text: Only From-To Time as requested */}
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono mt-0.5 tracking-tight">
                          <span>{formatShortTime(entry.start_time)} - {formatShortTime(entry.end_time)}</span>
                        </div>
                      </div>

                      {/* Right duration bubble */}
                      <span className={`text-[11px] font-mono font-bold shrink-0 bg-stone-900 border border-stone-850 px-2.5 py-0.5 rounded-lg ${entry.usefulness_status === 'not_useful' ? 'text-stone-600' : 'text-stone-200'}`}>
                        {entry.duration_minutes >= 60 
                          ? `${Math.floor(entry.duration_minutes / 60)}${isAr ? ' س ' : 'h '}${entry.duration_minutes % 60 ? `${entry.duration_minutes % 60}${isAr ? ' د' : 'm'}` : ''}`
                          : `${entry.duration_minutes}${isAr ? ' د' : 'm'}`
                        }
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>

      </div> {/* Scrollable Container End */}



    </div>
  );
};
