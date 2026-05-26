/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, RefreshCw, Clock, Zap, Target, Download, Upload, Trash2 } from 'lucide-react';
import { UserStats, TimeEntry, Category } from '../types';

interface SettingsViewProps {
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onClearAllData: () => void;
  onRestoreBackup: (data: any) => void;
  entries: TimeEntry[];
  achievedDaysHistory: Record<string, boolean>;
  categories: Category[];
  lang: 'ar' | 'en';
  onLangChange: (lang: 'ar' | 'en') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  stats,
  onUpdateStats,
  onClearAllData,
  onRestoreBackup,
  entries,
  achievedDaysHistory,
  categories,
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
    const fullState = {
      entries,
      achievedDaysHistory,
      categories,
      productiveGoalHours: goalHours,
      userStats: stats,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AlMajd_Tracker_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.entries || !Array.isArray(parsed.entries)) {
          throw new Error('Invalid format');
        }
        onRestoreBackup(parsed);
      } catch (err) {
        alert(isAr ? 'الملف غير صالح أو تالف.' : 'Invalid or corrupted file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-screen-root" className="flex-1 flex flex-col bg-[#070707] overflow-y-auto no-scrollbar p-3 pb-[180px] space-y-3">

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
          <span>{isAr ? 'هدف الانجاز اليومي' : 'Productive Hour Goal'}</span>
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

      {/* D) Data & Backup Management */}
      <div className="p-3 bg-[#0E0D0A] border border-[#D4AF37]/15 rounded-2xl space-y-4">
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold block">
          {isAr ? 'إدارة البيانات والنسخ الاحتياطي' : 'DATA & BACKUP MANAGEMENT'}
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 px-4 bg-[#1C1A14] hover:bg-[#25221A] border border-[#D4AF37]/35 hover:border-[#D4AF37] text-stone-200 hover:text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Download size={14} className="text-[#D4AF37]" />
              <span>{isAr ? 'تحميل نسخة احتياطية (.json)' : 'Download Full Backup (.json)'}</span>
            </span>
            <span className="text-[9px] text-stone-500 font-mono">EXPORT</span>
          </button>

          {/* Import JSON */}
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
              id="settings-import-file"
            />
            <label
              htmlFor="settings-import-file"
              className="w-full py-2.5 px-4 bg-[#1C1A14] hover:bg-[#25221A] border border-[#D4AF37]/35 hover:border-[#D4AF37] text-stone-200 hover:text-white font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <Upload size={14} className="text-[#D4AF37]" />
                <span>{isAr ? 'استعادة نسخة احتياطية من ملف' : 'Restore Backup from File'}</span>
              </span>
              <span className="text-[9px] text-stone-500 font-mono">IMPORT</span>
            </label>
          </div>


          {/* Wipe All Data */}
          <button
            onClick={() => {
              if (window.confirm(isAr
                ? 'تنبيه: هل أنت متأكد تماماً من رغبتك في مسح كافة الأرشيفات والتواريخ والمهام والأهداف نهائياً؟ هذا الإجراء سيقوم بإعادة التطبيق لنسخته الفارغة بالكامل ولا يمكن التراجع عنه.'
                : 'Warning: Are you absolutely sure you want to delete all entries, goals, settings, and archives permanently? This action will reset the app entirely and cannot be undone.')) {
                onClearAllData();
              }
            }}
            className="w-full py-2.5 px-4 bg-red-950/10 hover:bg-red-950/20 border border-red-900/25 hover:border-red-500/50 text-red-400 hover:text-red-300 font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Trash2 size={14} className="text-red-500 animate-pulse" />
              <span>{isAr ? 'مسح كامل البيانات والسجلات' : 'Wipe Database Complete'}</span>
            </span>
            <span className="text-[9px] text-red-800/80 font-mono font-bold">DANGER ZONE</span>
          </button>
        </div>
      </div>

    </div>
  );
};

