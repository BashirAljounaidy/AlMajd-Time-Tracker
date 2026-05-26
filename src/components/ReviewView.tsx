/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, BarChart3, Clock, Flame, Info, CheckSquare, Edit, AlertCircle, Plus } from 'lucide-react';
import { TimeEntry } from '../types';

interface ReviewViewProps {
  entries: TimeEntry[];
  currentDate: Date;
  onEditEntryClick: (entry: TimeEntry) => void;
  onAddEntryClick: (defaultStart?: string, defaultEnd?: string) => void;
  lang: 'ar' | 'en';
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  entries,
  currentDate,
  onEditEntryClick,
  onAddEntryClick,
  lang,
}) => {
  const isAr = lang === 'ar';

  const getDateStr = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const activeDateStr = getDateStr(currentDate);

  // Filter and sort
  const dailyEntries = entries
    .filter(e => getDateStr(new Date(e.start_time)) === activeDateStr)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  // Calculations
  const totalMins = dailyEntries.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  const usefulMins = dailyEntries.filter(e => e.usefulness_status === 'useful').reduce((acc, curr) => acc + curr.duration_minutes, 0);
  const notUsefulMins = dailyEntries.filter(e => e.usefulness_status === 'not_useful').reduce((acc, curr) => acc + curr.duration_minutes, 0);

  // Calculate top time consumers/activities (Group by category or title)
  const consumersMap: { [key: string]: { duration: number; category_id: string; title: string, color: string, icon: string } } = {};
  
  dailyEntries.forEach(entry => {
    const key = `${entry.category_id}-${entry.title}`;
    if (!consumersMap[key]) {
      consumersMap[key] = {
        duration: 0,
        category_id: entry.category_id,
        title: entry.title,
        color: entry.color,
        icon: entry.icon,
      };
    }
    consumersMap[key].duration += entry.duration_minutes;
  });

  const sortedConsumers = Object.values(consumersMap)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 4);

  const formatMinsLabel = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) {
      return isAr ? `${hrs} س ${m > 0 ? `و ${m} د` : ''}` : `${hrs}h ${m > 0 ? `${m}m` : ''}`;
    }
    return isAr ? `${mins} دقيقة` : `${mins}m`;
  };

  const formatTimeStr = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // 24 Hour Visual Grid segments helper
  // Draw 24 blocks (one for each hour from 0 to 23)
  const getHourBlockConfig = (hour: number) => {
    const startMs = new Date(currentDate).setHours(hour, 0, 0, 0);
    const endMs = new Date(currentDate).setHours(hour + 1, 0, 0, 0);

    // Find if an entry covers this hour or overlaps
    const coveringEntry = dailyEntries.find(entry => {
      const eStart = new Date(entry.start_time).getTime();
      const eEnd = new Date(entry.end_time).getTime();
      // Overlaps at least sebagian of this hour
      return eStart < endMs && eEnd > startMs;
    });

    return coveringEntry || null;
  };

  return (
    <div id="review-screen-root" className="flex-1 flex flex-col bg-[#070707] overflow-y-auto no-scrollbar p-5 pb-[180px] space-y-5">
      
      {/* Visual Title Header (Branding block) */}
      <div className="select-none flex flex-col">
        <span className={`text-[9px] text-[#D4AF37]/80 leading-none mb-1 ${isAr ? 'font-sans tracking-normal' : 'font-mono uppercase tracking-widest'}`}>
          {isAr ? 'كشف تسريبات الساعات ومكامن العادات' : 'DIURNAL SLOTS DIAGNOSIS ENGINE'}
        </span>
        <div className="text-3xl font-light font-sans tracking-tight text-stone-300">
          {isAr ? 'مراجعة' : 'Review'}
        </div>
        <div className="text-4xl font-extrabold font-sans text-[#D4AF37] tracking-tight -mt-1 uppercase">
          {isAr ? 'تدقيق تفاصيل يومك' : 'Your Day'}
        </div>
      </div>

      {/* A) 24h Visual Block Rug Dashboard (Fascinating block chart!) */}
      <div className="p-4 bg-[#0E0D0A] border border-[#D4AF37]/15 rounded-2xl space-y-3">
        <label className={`text-[10px] text-[#D4AF37] font-semibold block ${isAr ? 'font-sans tracking-normal' : 'font-mono uppercase tracking-widest'}`}>
          {isAr ? 'مخطط الـ 24 ساعة لليوم' : '24-HOUR VISUAL SCHEMATIC'}
        </label>

        {/* 24 block segment grid */}
        <div className="flex flex-row gap-1.5 pt-1 overflow-x-auto no-scrollbar pb-2">
          {Array.from({ length: 24 }).map((_, hour) => {
            const entry = getHourBlockConfig(hour);
            const titleTooltip = entry ? `${entry.title} (${entry.duration_minutes}m)` : '';
            return (
              <div
                key={hour}
                id={`hour-block-${hour}`}
                className="group relative h-7 w-12 shrink-0 rounded-md flex flex-col items-center justify-center border text-[9px] font-mono font-medium transition-all"
                style={{
                  backgroundColor: entry ? `${entry.color}25` : '#131313',
                  borderColor: entry ? `${entry.color}50` : '#222',
                  color: entry ? entry.color : '#555',
                }}
                title={titleTooltip}
              >
                <span>{hour.toString().padStart(2, '0')}</span>
                
                {/* Visual tooltip */}
                {entry && (
                    <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-black text-[#FAF8F5] p-2 rounded-lg text-[9px] w-36 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center border border-[#D4AF37]/20 shadow-xl leading-snug">
                    <span className="font-bold text-[#D4AF37] font-mono block mb-0.5">{hour.toString().padStart(2, '0')}:00</span>
                    <span className="line-clamp-2">{entry.title}</span>
                    </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-[9px] text-stone-500 pt-1 font-mono">
          <span>00:00 (الصباح الباكر)</span>
          <span>12:00 (الظهر)</span>
          <span>23:00 (المساء)</span>
        </div>
      </div>

      {/* B) Tops Consumers (الأكثر استهلاكاً لوقتك) */}
      <div className="space-y-3">
        <h3 className={`text-[11px] text-stone-500 font-bold px-1 flex items-center gap-1.5 ${isAr ? 'font-sans tracking-normal' : 'font-mono uppercase tracking-widest'}`}>
          <Flame size={12} className="text-amber-500 animate-pulse" />
          <span>{isAr ? 'أكثر الأنشطة استهلاكاً للوقت' : 'TOP TIME-CONSUMING ACTIVITIES'}</span>
        </h3>

        {sortedConsumers.length === 0 ? (
          <div className="p-4 bg-stone-900/40 rounded-2xl text-center text-xs text-stone-500">
            {isAr ? 'لا توجد معطيات كافية لحساب الأنشطة' : 'Deficit of logged records'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {sortedConsumers.map((item, idx) => {
              const sharePercent = totalMins > 0 ? Math.round((item.duration / totalMins) * 100) : 0;
              return (
                <div 
                  key={idx}
                  id={`consumer-row-${idx}`}
                  className="p-3 bg-gradient-to-r from-[#0E0E0C] to-[#12110D] border border-stone-850 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 max-w-[70%]">
                    <span 
                      className="w-2.5 h-2.5 rounded-full block shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <span className="text-xs font-semibold text-stone-200 block truncate">{item.title}</span>
                      <span className="text-[9.5px] font-mono text-stone-500 uppercase tracking-tight">
                        {sharePercent}% {isAr ? 'من إجمالي البيانات المفصلة' : 'of logged timeline'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#E5C158] bg-stone-950/60 px-2 py-1 rounded">
                    {formatMinsLabel(item.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* C) No more leak detector */}
      <div className="space-y-3">
        {/* Intentionally left empty to maintain layout spacing */}
      </div>

      {/* D) Activity Quick-Review Checklist */}
      <div className="space-y-3">
        <h3 className={`text-[11px] text-stone-500 font-bold px-1 ${isAr ? 'font-sans tracking-normal' : 'font-mono uppercase tracking-widest'}`}>
          {isAr ? 'تعديل السجلات يدوياً' : 'REORDER / DISPOSE REGISTERS'}
        </h3>

        {dailyEntries.length === 0 ? (
          <div className="p-4 bg-stone-900/40 rounded-2xl text-center text-xs text-stone-500">
            {isAr ? 'يرجى تسجيل نشاط واحد للتمكن من تعديله.' : 'Empty lists'}
          </div>
        ) : (
          <div className="divide-y divide-stone-900/60 bg-[#0A0A09] border border-stone-850 rounded-2xl overflow-hidden">
            {dailyEntries.map(entry => (
              <div 
                key={entry.id}
                id={`checklist-item-${entry.id}`}
                onClick={() => onEditEntryClick(entry)}
                className="p-3.5 hover:bg-[#131210] flex items-center justify-between text-stone-300 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 truncate max-w-[75%]">
                  <span 
                    className="w-1.5 h-6 rounded-full block shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="truncate">
                    <span className="text-xs font-semibold font-sans text-stone-200 block truncate group-hover:text-[#D4AF37] transition-colors">{entry.title}</span>
                    <span className="text-[10px] text-stone-500 font-mono block">
                      {formatTimeStr(entry.start_time)} • {formatMinsLabel(entry.duration_minutes)}
                    </span>
                  </div>
                </div>

                <button 
                  id={`checklist-edit-btn-${entry.id}`}
                  type="button"
                  className="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center border border-stone-800 text-stone-400 group-hover:text-[#D4AF37] cursor-pointer transition-colors"
                >
                  <Edit size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
