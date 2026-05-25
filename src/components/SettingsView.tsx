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
    <div id="settings-screen-root" className="flex-1 flex flex-col bg-[#070707] overflow-y-auto no-scrollbar p-5 pb-20 space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 border-b border-[#D4AF37]/10 pb-4">
        <div className="w-10 h-10 rounded-xl bg-[#161410] border border-[#D4AF37]/20 flex items-center justify-center">
          <Settings size={20} className="text-[#D4AF37]" />
        </div>
        <div>
          <h2 id="settings-title" className="text-lg font-bold font-sans text-stone-100">
            {isAr ? 'إعدادات النظام' : 'System Settings'}
          </h2>
          <p className="text-[10px] text-stone-500 font-mono">
            {isAr ? 'تخصيص وإدارة قاعدة بيانات التطبيق' : 'Manage application storage & settings'}
          </p>
        </div>
      </div>

      {/* Language Selection */}
      <div className="p-4 bg-[#0E0D0A]/90 border border-[#D4AF37]/10 rounded-2xl space-y-3 shadow-md">
        <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold flex items-center gap-2">
          <Zap size={12} className="text-[#D4AF37]" />
          {isAr ? 'لغة الواجهة' : 'Interface Language'}
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onLangChange('en')}
            className={`p-2.5 ${lang === 'en' ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#121210] border-stone-850 text-stone-400'} border text-xs font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all`}
          >
            English
          </button>
          <button
            onClick={() => onLangChange('ar')}
            className={`p-2.5 ${lang === 'ar' ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#121210] border-stone-850 text-stone-400'} border text-xs font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all`}
          >
            العربية
          </button>
        </div>
      </div>

      {/* Database Management */}
      <div className="p-4 bg-[#0E0D0A]/90 border border-[#D4AF37]/10 rounded-2xl space-y-4 shadow-md">
        <div className="flex justify-between items-center border-b border-stone-900 pb-2">
          <label className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold flex items-center gap-2">
            <Database size={12} className="text-[#D4AF37]" />
            {isAr ? 'إدارة البيانات المخزنة' : 'Storage Management'}
          </label>
          <span className="text-[10px] font-mono bg-[#161410] border border-stone-800 text-stone-400 px-2 py-0.5 rounded-md">
            {entriesCount} {isAr ? 'سجل' : 'entries'}
          </span>
        </div>

        <div className="space-y-2">
          {/* Wipe Database Button */}
          <button
            id="clear-db-btn"
            onClick={() => {
              if (confirm(isAr ? 'هل أنت متأكد من تفريغ كافة البيانات المسجلة بالكامل؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to clear all registered data? This action cannot be undone.')) {
                onClearDb();
                alert(isAr ? 'تم تفريغ كافة البيانات بنجاح.' : 'All data cleared successfully.');
              }
            }}
            className="w-full p-3 bg-[#121210] hover:bg-[#1E1B12] border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 text-[#FAF8F5] text-xs font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw size={14} className="text-[#D4AF37] animate-spin-slow" />
            <span>{isAr ? 'تفريغ كامل البيانات المسجلة' : 'Wipe All Stored Data'}</span>
          </button>

          {/* Seed/Restore Demo Button */}
          <button
            id="restore-seed-btn"
            onClick={() => {
              onRestoreSeedData();
              alert(isAr ? 'تم استعادة البيانات التجريبية بنجاح.' : 'Demo data restored successfully.');
            }}
            className="w-full p-3 bg-[#121210] hover:bg-[#1C1A14] border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 text-stone-200 text-xs font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Zap size={14} className="text-[#D4AF37]" />
            <span>{isAr ? 'استعادة البيانات التجريبية' : 'Restore Demo Data'}</span>
          </button>

          {/* Export Backup Button */}
          <button
            id="export-backup-btn"
            onClick={handleExportJSON}
            className="w-full p-3 bg-[#121210] hover:bg-[#1C1A14] border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 text-stone-200 text-xs font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ShieldCheck size={14} className="text-[#D4AF37]" />
            <span>{isAr ? 'تصدير نسخة احتياطية (JSON)' : 'Export JSON Backup'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

