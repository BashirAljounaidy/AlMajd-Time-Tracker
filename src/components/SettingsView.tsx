/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, RefreshCw, Clock, Zap, Target } from 'lucide-react';
import { UserStats } from '../types';

interface SettingsViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onRestoreSeedData: () => void;
  onClearDb: () => void;
  onTriggerSplash: () => void;
  entriesCount: number;
  lang: 'ar' | 'en';
  onLangChange: (lang: 'ar' | 'en') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  stats,
  onUpdateStats,
  onRestoreSeedData,
  onClearDb,
  onTriggerSplash,
  entriesCount,
  lang,
  onLangChange,
}) => {
  const isAr = lang === 'ar';

  const [goalHours, setGoalHours] = useState(() => {
    const saved = localStorage.getItem('productiveGoalHours') || '8';
    return parseInt(saved);
  });

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setGoalHours(val);
    localStorage.setItem('productiveGoalHours', val.toString());
  };

  const handleExportJSON = () => {
    const dataStr = localStorage.getItem('chrono_review_time_entries') || '[]';
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AlMajd_Time_Tracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div id="settings-screen-root" className="flex-1 flex flex-col bg-[#070707] overflow-y-auto no-scrollbar p-3 pb-16 space-y-3">
      
      {/* Title Header */}
      <div>
        <h2 id="settings-title" className="text-xl font-bold font-sans text-stone-100 flex items-center gap-2">
          <Settings size={18} className="text-[#D4AF37]" />
          <span>{isAr ? 'إعدادات النظام' : 'System Settings'}</span>
        </h2>
      </div>


      {/* B) Goal Setting */}
      <div className="p-3 bg-[#0E0D0A] border border-[#D4AF37]/15 rounded-2xl space-y-3">
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold block flex justify-between">
          <span>{isAr ? 'هدف ساعات الإنجاز' : 'Productive Hour Goal'}</span>
          <span>{goalHours} {isAr ? 'ساعات' : 'h'}</span>
        </label>
        <input 
          type="range"
          min="1"
          max="24"
          value={goalHours}
          onChange={handleGoalChange}
          className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
        />
      </div>

      {/* C) Language Selection */}
      <div className="p-3 bg-[#0E0D0A] border border-[#D4AF37]/15 rounded-2xl space-y-3">
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold block flex justify-between">
          {isAr ? 'تغيير لغة الواجهة' : 'Interface Language'}
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <button
              onClick={() => onLangChange('en')}
              className={`p-2 ${lang === 'en' ? 'bg-[#D4AF37]/20 border-[#D4AF37]' : 'bg-stone-900 border-stone-800'} border text-[#FAF8F5] font-semibold text-[11px] rounded-lg cursor-pointer flex items-center justify-center gap-1.5`}
            >
              English
          </button>
          <button
              onClick={() => onLangChange('ar')}
              className={`p-2 ${lang === 'ar' ? 'bg-[#D4AF37]/20 border-[#D4AF37]' : 'bg-stone-900 border-stone-800'} border text-[#FAF8F5] font-semibold text-[11px] rounded-lg cursor-pointer flex items-center justify-center gap-1.5`}
            >
              العربية
          </button>
        </div>
      </div>

    </div>
  );
};

