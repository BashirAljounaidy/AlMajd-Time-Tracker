/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, TrendingUp, Sparkles, PieChart, Info, HelpCircle, Activity, Award, ThumbsDown, Calendar } from 'lucide-react';
import { TimeEntry, UsefulnessStatus } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface StatsViewProps {
  entries: TimeEntry[];
  lang: 'ar' | 'en';
}

export const StatsView: React.FC<StatsViewProps> = ({ entries, lang }) => {
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

  // Compile daily stats for the week
  const weeklyData = weekDates.map(date => {
    const dayStr = getDateStr(date);
    const dayEntries = entries.filter(e => getDateStr(new Date(e.start_time)) === dayStr);
    
    const useful = dayEntries
      .filter(e => e.usefulness_status === 'useful')
      .reduce((acc, c) => acc + c.duration_minutes, 0);

    const wasted = dayEntries
      .filter(e => e.usefulness_status === 'not_useful')
      .reduce((acc, c) => acc + c.duration_minutes, 0);

    const neutral = 0; // Keeping structure but zeroed out

    return {
      date,
      label: getDayLabel(date),
      useful,
      wasted,
      neutral,
      total: useful + wasted,
    };
  });

  // Calculate highest productive day and total stats
  let maxProdMins = 0;
  let bestDayLabel = isAr ? 'لا يوجد سجل' : 'No records';
  let totalUsefulWeekMins = 0;
  let totalWastedWeekMins = 0;

  weeklyData.forEach(d => {
    totalUsefulWeekMins += d.useful;
    totalWastedWeekMins += d.wasted;
    if (d.useful > maxProdMins) {
      maxProdMins = d.useful;
      bestDayLabel = d.label;
    }
  });

  const avgUsefulDailyMins = Math.round(totalUsefulWeekMins / 7);

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

  // Compile Smart Diagnostics Insights based on real localStorage entries
  const compileInsights = () => {
    const list = [];
    
    // Check total wasted time
    const wastedShare = (totalUsefulWeekMins + totalWastedWeekMins) > 0 
      ? Math.round((totalWastedWeekMins / (totalUsefulWeekMins + totalWastedWeekMins)) * 100) 
      : 0;

    if (totalWastedWeekMins > 120) {
      list.push({
        type: 'warning',
        ar: `أضعت ما يزيد عن ${formatHrsLabel(totalWastedWeekMins)} هذا الأسبوع في فئات سلبية (مثل اليوتيوب والسوشيال ميديا). تقييد دقائق التطبيقات صباحًا سينقذ إنتاجيتك.`,
        en: `You dropped over ${formatHrsLabel(totalWastedWeekMins)} this week on unproductive sources like social media/YouTube. Restoring limits will protect high-focus times.`,
      });
    } else {
      list.push({
        type: 'success',
        ar: 'مستويات تشتتك ممتازة ومنخفضة للغاية هذا الأسبوع! استمر على هذا الخط الهادئ والواعي.',
        en: 'Excellent drift prevention! Unproductive slots was kept strictly below 2h this week. Keep up this clean momentum.',
      });
    }

    // Check high work hours
    const workMins = entries.filter(e => e.category_id === 'work').reduce((acc, c) => acc + c.duration_minutes, 0);
    if (workMins > 480) {
      list.push({
        type: 'success',
        ar: `مستوى رائع في فئة العمل العمودي! قمت بتسجيل ${formatHrsLabel(workMins)} من التركيز التقني الملتزم.`,
        en: `Incredible logging in Deep Work! You booked over ${formatHrsLabel(workMins)} of pure structural effort.`,
      });
    }

    // Checking hobbies
    const readMins = entries.filter(e => e.category_id === 'reading').reduce((acc, c) => acc + c.duration_minutes, 0);
    const langMins = entries.filter(e => e.category_id === 'language').reduce((acc, c) => acc + c.duration_minutes, 0);
    if (readMins > 0 || langMins > 0) {
      list.push({
        type: 'success',
        ar: `تنمية ممتازة للعقل! تم مراجعة ${formatHrsLabel(readMins + langMins)} في القراءة واللغات والتعلم الحر.`,
        en: `Impressive cognitive investment. You registered ${formatHrsLabel(readMins + langMins)} across reading & free educational pursuits.`,
      });
    }

    return list;
  };

  const smartInsights = compileInsights();

  // Find max bar height for scaling HTML chart (capped at 480 mins max scaling height)
  const maxWeeklyMins = Math.max(...weeklyData.map(d => d.total), 300);

  return (
    <div id="stats-screen-root" className="flex-1 flex flex-col bg-[#070707] overflow-y-auto no-scrollbar p-5 pb-24 space-y-6">
      
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
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold block flex justify-between items-center">
          <span>{isAr ? 'مقارنة نفعية الوقت الأسبوعية' : 'WEEKLY USEFULNESS COMPARATIVE'}</span>
          <span className="text-stone-500 font-normal lowercase">{isAr ? 'دقائق اليوم' : 'daily minutes'}</span>
        </label>

        {/* Visual HTML columns grid container */}
        <div className="flex justify-between items-end h-40 pt-4 pb-1 border-b border-stone-900">
          {weeklyData.map((d, i) => {
            const usefulHeight = `${(d.useful / maxWeeklyMins) * 100}%`;
            const wastedHeight = `${(d.wasted / maxWeeklyMins) * 100}%`;
            const hasActivity = d.total > 0;

            return (
              <div key={i} className="flex flex-col items-center flex-1 group">
                {/* Bars column */}
                <div className="w-full max-w-[12px] h-32 flex flex-col justify-end gap-0.5 rounded-full overflow-hidden relative">
                  
                  {/* Useful Bar (Gold) */}
                  {d.useful > 0 && (
                    <div 
                      className="bg-gradient-to-t from-[#8F741D] to-[#D4AF37] rounded-b-md transition-all duration-500"
                      style={{ height: usefulHeight }}
                    />
                  )}

                  {/* Wasted Bar (Charcoal / Dark Bronze) */}
                  {d.wasted > 0 && (
                    <div 
                      className="bg-[#2E2819] rounded-t-md transition-all duration-500"
                      style={{ height: wastedHeight }}
                    />
                  )}

                  {!hasActivity && (
                    <div className="h-2 w-full bg-stone-900 rounded-full" />
                  )}

                  {/* Absolute hover tooltip */}
                  <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 bg-black text-stone-200 text-[8.5px] p-2 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 w-24 text-center border border-[#D4AF37]/20 shadow-xl leading-relaxed">
                    <span className="font-bold text-[#D4AF37] block font-mono border-b border-stone-850 pb-0.5 mb-1">{d.label}</span>
                    <span className="text-[#D4AF37] block font-mono">✨ {formatHrsLabel(d.useful)}</span>
                    <span className="text-stone-550 block font-mono">⏳ {formatHrsLabel(d.wasted)}</span>
                  </div>
                </div>

                {/* Day representation label */}
                <span className="text-[10px] text-stone-500 font-medium font-sans mt-2">
                  {d.label}
                </span>
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

      {/* 4) Smart Cognitive Diagnostics AI Insights (التحليلات الذكية المخصصة) */}
      <div className="space-y-3">
        <h3 className="text-[11px] uppercase tracking-widest font-mono text-[#D4AF37] font-bold px-1 flex items-center gap-1.5">
          <Sparkles size={11} className="text-[#D4AF37] animate-pulse" />
          <span>{isAr ? 'توصيات وتحليلات كرونو الذكية' : 'CHRONO INTELLIGENT ADVICE & TIPS'}</span>
        </h3>

        <div className="space-y-2.5">
          {smartInsights.length === 0 ? (
            <div className="p-4 bg-[#0A0A09] border border-stone-850 rounded-2xl text-center text-xs text-stone-500 italic">
              {isAr 
                ? 'استمر في تعقب وقتك لتفعيل محرك الذكاء والتقاط عادات التشتت.' 
                : 'Compile more logged sessions to spawn customized dynamic insights.'}
            </div>
          ) : (
            smartInsights.map((ins, idx) => (
              <div 
                key={idx}
                id={`insight-card-${idx}`}
                className={`p-3.5 border rounded-2xl flex items-start gap-3.5 transition-all text-xs leading-relaxed ${
                  ins.type === 'warning'
                    ? 'bg-amber-950/10 border-amber-500/20 text-[#FAF8F5]'
                    : 'bg-[#0E0F0C] border-[#4CAF50]/15 text-[#FAF8F5]'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {ins.type === 'warning' ? (
                    <ThumbsDown size={14} className="text-amber-500" />
                  ) : (
                    <Award size={14} className="text-[#4CAF50]" />
                  )}
                </div>
                <p className="text-stone-400 font-medium">
                  {isAr ? ins.ar : ins.en}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
