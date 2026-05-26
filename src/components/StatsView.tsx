/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Info, HelpCircle, Activity, Award, Calendar } from 'lucide-react';
import { TimeEntry, UsefulnessStatus } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface StatsViewProps {
  entries: TimeEntry[];
  lang: 'ar' | 'en';
  achievedDaysHistory: Record<string, boolean>;
}

export const StatsView: React.FC<StatsViewProps> = ({ entries, lang, achievedDaysHistory }) => {
  const isAr = lang === 'ar';

  // Helper relative weekdays mapping based on current date
  const getWeekDays = () => {
    const dates = [];
    const today = new Date();
    // Start at Monday of this week
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1; // 0 is Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDays();

  const getDayLabel = (date: Date) => {
    if (isAr) {
      const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
      return days[date.getDay()];
    }
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getDateStr = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  // Compile daily stats for the week-ish (this will be replaced by monthly)
  const getMonthDays = () => {
    const dates = [];
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const monthDates = getMonthDays();
  const goalHours = parseInt(localStorage.getItem('productiveGoalHours') || '8');
  const goalMins = goalHours * 60;

  // Calculate highest productive day and total stats
  let totalUsefulMonthMins = 0;
  let totalWastedMonthMins = 0;
  
  entries.forEach(e => {
    if (e.usefulness_status === 'useful') totalUsefulMonthMins += e.duration_minutes;
    if (e.usefulness_status === 'not_useful') totalWastedMonthMins += e.duration_minutes;
  });

  const avgUsefulDailyMins = Math.round(totalUsefulMonthMins / (monthDates.length || 1));
  const bestDayLabel = isAr ? 'هذا الشهر' : 'This Month';

  // Group by usefulness status for distribution breakdown
  const usefulnessChartMap: { [key in UsefulnessStatus]: { mins: number; labelAr: string; labelEn: string; color: string } } = {
    useful: { mins: 0, labelAr: 'وقت ممول', labelEn: 'Funded Time', color: '#D4AF37' },
    not_useful: { mins: 0, labelAr: 'وقت مجاني', labelEn: 'Free Time', color: '#F44336' },
  };
  
  entries.forEach(entry => {
    const status = entry.usefulness_status;
    if (status && usefulnessChartMap[status]) {
      usefulnessChartMap[status].mins += entry.duration_minutes;
    }
  });

  const totalEntriesOverallMins = entries.reduce((acc, c) => acc + c.duration_minutes, 0);

  const usefulnessShareList = Object.entries(usefulnessChartMap)
    .map(([status, item]) => ({
      status,
      ...item,
      sharePercent: totalEntriesOverallMins > 0 ? Math.round((item.mins / totalEntriesOverallMins) * 100) : 0,
    }))
    .filter(item => item.mins > 0)
    .sort((a, b) => b.mins - a.mins);

  const formatHrsLabel = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (isAr) {
      return hrs > 0 ? `${hrs} س ${mins} د` : `${mins} د`;
    }
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div id="stats-screen-root" className="flex-1 flex flex-col bg-[#070707] overflow-y-auto no-scrollbar p-5 pb-[180px] space-y-6">
      
      {/* View Header */}
      <div>
        <h2 id="stats-title" className="text-xl font-bold font-sans text-stone-100 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#D4AF37]" strokeWidth={2.5} />
          <span>{isAr ? 'التحليلات ومخططات الوقت' : 'AlMajd Performance Stats'}</span>
        </h2>
        <p className="text-[10px] text-stone-500 font-mono tracking-wider uppercase mt-1">
          {isAr ? 'تقارير بيانية عن كفاءة استغلال يومك' : 'METRIC GRAPHICS & AUDITING DATA'}
        </p>
      </div>

      {/* 1) Weekly performance bar chart (Useful vs Not Useful dual bar) */}
      <div className="p-4 bg-[#0E0D0A] border border-[#D4AF37]/15 rounded-2xl space-y-4 shadow-md">
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold block">
          <span>{isAr ? `احصائيات شهر ${new Date().getMonth() + 1} للعام ${new Date().getFullYear()}` : `Statistics of Month ${new Date().getMonth() + 1} for Year ${new Date().getFullYear()}`}</span>
        </label>

        {/* Visual Monthly Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-[9px] text-stone-600 text-center font-mono uppercase pb-1">
              {isAr ? (day === 'Sun' ? 'أحد' : day === 'Mon' ? 'اثنين' : day === 'Tue' ? 'ثلاثاء' : day === 'Wed' ? 'أربعاء' : day === 'Thu' ? 'خميس' : day === 'Fri' ? 'جمعة' : 'سبت') : day}
            </div>
          ))}
          {/* Calendar days */}
          {monthDates.map((date, i) => {
            const dayStr = getDateStr(date);
            const isToday = new Date().toDateString() === date.toDateString();
            
            // Calculate today's achieved status dynamically; use history for past days
            const dayEntries = entries.filter(e => getDateStr(new Date(e.start_time)) === dayStr);
            const useful = dayEntries
              .filter(e => e.usefulness_status === 'useful')
              .reduce((acc, c) => acc + c.duration_minutes, 0);

            const achieved = isToday 
              ? (useful >= goalMins && useful > 0)
              : !!achievedDaysHistory[dayStr];
            
            return (
              <div key={i} className={`h-8 flex flex-col items-center justify-center rounded-lg border text-[10px] ${isToday ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-stone-850 bg-[#0E0D0A]'}`}>
                <span className={`font-mono ${isToday ? 'text-[#D4AF37] font-bold' : 'text-stone-300'}`}>{date.getDate()}</span>
                {achieved && (
                    <svg className="w-3 h-3 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" />
                    </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend block indicators */}
        <div className="flex justify-center items-center gap-4 text-[10px] font-mono select-none">
          <span className="flex items-center gap-1.5 text-stone-400">
            <span className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full" />
            <span>{isAr ? 'وقت ممول' : 'Funded Time'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-stone-400">
            <span className="w-2.5 h-2.5 bg-[#2E2819] rounded-full border border-stone-800" />
            <span>{isAr ? 'وقت مجاني' : 'Free Time'}</span>
          </span>
        </div>
      </div>

      {/* 2) Middle Stats Bento grid (Productivity summary cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Best Day */}
        <div className="bg-[#0E0D0A] border border-stone-850 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Award size={18} />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-mono">
              {isAr ? 'أفضل يوم أداءً' : 'BEST FOCUS DAY'}
            </span>
            <span className="text-xs font-bold text-stone-200 block font-sans">
              {bestDayLabel}
            </span>
          </div>
        </div>

        {/* Card 2: Average dynamic hours */}
        <div className="bg-[#0E0D0A] border border-stone-850 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4CAF50]/10 border border-[#4CAF50]/20 flex items-center justify-center text-[#4CAF50]">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-mono">
              {isAr ? 'معدل الإنتاج اليومي' : 'AVG DAILY FOCUS'}
            </span>
            <span className="text-xs font-bold text-stone-200 block font-sans">
              {formatHrsLabel(avgUsefulDailyMins)}
            </span>
          </div>
        </div>
      </div>

      {/* 3) Usefulness Breakdown List */}
      <div className="p-4 bg-[#0E0D0A] border border-[#D4AF37]/15 rounded-2xl space-y-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold block flex justify-between items-center">
          <span>{isAr ? 'توزيع الأوقات حسب الكفاءة والفائدة' : 'USEFULNESS DISTRIBUTIVE BREAKDOWN'}</span>
          <span className="text-stone-500 font-normal lowercase">{isAr ? 'إجمالي الساعات' : 'total hours'}</span>
        </label>

        {usefulnessShareList.length === 0 ? (
          <div className="text-center py-6 text-xs text-stone-500">
            {isAr ? 'سجل فترات لتوزيع الكفاءة بيانيا.' : 'Log some activities to populate metrics.'}
          </div>
        ) : (
          <div className="space-y-3.5 pt-1">
            {usefulnessShareList.map((item, idx) => (
              <div key={idx} id={`share-row-${item.status}`} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-stone-200 text-xs font-semibold">
                      {isAr ? item.labelAr : item.labelEn}
                    </span>
                  </div>

                  {/* Share values */}
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-stone-400 text-[10px]">({formatHrsLabel(item.mins)})</span>
                    <span className="font-bold text-[#D4AF37] text-xs">{item.sharePercent}%</span>
                  </div>
                </div>

                {/* Progress gold filled track */}
                <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: item.color, width: `${item.sharePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};
