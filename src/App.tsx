/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  Clock, 
  Play, 
  Pause,
  ArrowRight,
  AlertTriangle,
  FileBadge2,
  Plus
} from 'lucide-react';

// Shell and utility imports
import { SplashScreen } from './components/SplashScreen';
import { Onboarding } from './components/Onboarding';
import { TodayView } from './components/TodayView';
import { ReviewView } from './components/ReviewView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { EntryModal } from './components/EntryModal';
import { TimerSheet } from './components/TimerSheet';

// Data and Types
import { TimeEntry, Category, ActiveTimer, UserStats } from './types';
import { DEFAULT_CATEGORIES } from './utils/categories';
import { getSeededData } from './utils/dummyData';

// Core Date Strip and Day name extraction helpers for layout alignment
const getDayNameAr = (date: Date) => {
  const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  return days[date.getDay()];
};

const getDayNameEn = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const getFormattedDateStr = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getDateStripDays = (centerDate: Date) => {
  const list = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    list.push(d);
  }
  return list;
};

export default function App() {
  // Localization and Platforms State
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  // Application flow gates
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'review' | 'stats' | 'settings'>('today');

  // Core Data States
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({});
  const [runningTimer, setRunningTimer] = useState<ActiveTimer>({
    start_time: '',
    accumulated_seconds: 0,
    is_running: false,
    title: '',
    category_id: 'work',
    usefulness_status: 'useful',
    note: '',
  });

  // Modal Sheet States
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [preCalculatedStart, setPreCalculatedStart] = useState<string | undefined>(undefined);
  const [preCalculatedEnd, setPreCalculatedEnd] = useState<string | undefined>(undefined);

  // Time navigation state (Date of view, defaults to current time coordinates)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); // Keep consistent mid-day to prevent timezone shifts
    return d;
  });

  const isAr = lang === 'ar';

  // --- INITIALIZE STORAGE DATABASE ---
  useEffect(() => {
    // 1) Initialize Categories
    const storCats = localStorage.getItem('chrono_review_categories');
    if (storCats) {
      setCategories(JSON.parse(storCats));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('chrono_review_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }

    // 2) Initialize Time Entries (or deploy seeds fallback base on real dynamic date)
    const storEntries = localStorage.getItem('chrono_review_time_entries');
    if (storEntries) {
      setEntries(JSON.parse(storEntries));
    } else {
      const todayStr = getFormattedDateStr(new Date());
      const seeded = getSeededData(todayStr);
      setEntries(seeded);
      localStorage.setItem('chrono_review_time_entries', JSON.stringify(seeded));
    }

    // 3) Initialize Stats preference target
    const storStats = localStorage.getItem('chrono_review_stats');
    if (storStats) {
      setUserStats(JSON.parse(storStats));
    } else {
      const defaultStats: UserStats = {};
      setUserStats(defaultStats);
      localStorage.setItem('chrono_review_stats', JSON.stringify(defaultStats));
    }

    // 4) Onboarding completed check
    const isCompleted = localStorage.getItem('chrono_review_onboarding_completed');
    if (isCompleted === 'true') {
      setShowOnboarding(false);
    }

    // 5) Retrieve active stopwatch timer if running
    const storTimer = localStorage.getItem('chrono_review_active_timer');
    if (storTimer) {
      setRunningTimer(JSON.parse(storTimer));
    }
  }, []);

  // --- PERSIST SAVER HELPERS ---
  const saveEntriesToDb = (newEntries: TimeEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('chrono_review_time_entries', JSON.stringify(newEntries));
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    const updated = categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    setCategories(updated);
    localStorage.setItem('chrono_review_categories', JSON.stringify(updated));
  };

  const handleUpdateStats = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem('chrono_review_stats', JSON.stringify(newStats));
  };

  const handleUpdateTimer = (updater: Partial<ActiveTimer>) => {
    const updated = { ...runningTimer, ...updater };
    setRunningTimer(updated);
    localStorage.setItem('chrono_review_active_timer', JSON.stringify(updated));
  };

  // --- DATA MANIPULATION HANDLERS ---
  const handleSaveEntry = (entryData: Omit<TimeEntry, 'created_at' | 'updated_at'>) => {
    const nowISO = new Date().toISOString();
    const existingIndex = entries.findIndex(e => e.id === entryData.id);

    if (existingIndex > -1) {
      // Edit mode: replacement entry
      const updatedEntries = [...entries];
      updatedEntries[existingIndex] = {
        ...entries[existingIndex],
        ...entryData,
        updated_at: nowISO,
      };
      saveEntriesToDb(updatedEntries);
    } else {
      // Add mode: creation
      const newEntry: TimeEntry = {
        ...entryData,
        created_at: nowISO,
        updated_at: nowISO,
      };
      saveEntriesToDb([newEntry, ...entries]);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const deleted = entries.filter(e => e.id !== id);
    saveEntriesToDb(deleted);
    setEditingEntry(null);
  };

  // Seed databases utility
  const handleRestoreDefaultSeeds = () => {
    const todayStr = getFormattedDateStr(new Date());
    const seeded = getSeededData(todayStr);
    saveEntriesToDb(seeded);
    setCategories(DEFAULT_CATEGORIES);
    localStorage.setItem('chrono_review_categories', JSON.stringify(DEFAULT_CATEGORIES));
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    setCurrentDate(d);
  };

  const handleClearDatabaseComplete = () => {
    saveEntriesToDb([]);
    localStorage.removeItem('chrono_review_time_entries');
  };

  // --- INTERACTIVE ACTIONS FLOW ---
  const handleNavigateWeeks = (direction: 'prev' | 'next') => {
    const copy = new Date(currentDate);
    if (direction === 'prev') {
      copy.setDate(copy.getDate() - 1);
    } else {
      copy.setDate(copy.getDate() + 1);
    }
    setCurrentDate(copy);
  };

  const handleOpenAddEntryModal = (defaultStart?: string, defaultEnd?: string) => {
    setEditingEntry(null);
    setPreCalculatedStart(defaultStart);
    setPreCalculatedEnd(defaultEnd);
    setShowEntryModal(true);
  };

  const handleOpenEditEntryModal = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setPreCalculatedStart(undefined);
    setPreCalculatedEnd(undefined);
    setShowEntryModal(true);
  };

  const handleStartTimerOnTheFly = () => {
    // Setup running timer state
    handleUpdateTimer({
      is_running: true,
      start_time: new Date().toISOString(),
      category_id: 'default',
      title: '',
      note: '',
      accumulated_seconds: 0,
    });

    setShowTimerModal(true);
  };

  const handleOnboardingFinished = () => {
    setShowOnboarding(false);
    localStorage.setItem('chrono_review_onboarding_completed', 'true');
  };

  const handleReplaySplashScreenInUI = () => {
    setShowSplash(true);
  };

  // Save entry from TimerSheet
  const handleSaveTimerEntry = (timerData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const nowISO = new Date().toISOString();
    const newEntry: TimeEntry = {
      ...timerData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: nowISO,
      updated_at: nowISO,
    };
    saveEntriesToDb([newEntry, ...entries]);

    // Force date focus to today so the newly tracked element shows immediately
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    setCurrentDate(d);
    setActiveTab('today');
  };

  return (
    <div id="main-app" className="font-sans min-h-screen bg-[#070707] text-[#FAF8F5]" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1) Dynamic Splash Intro Layer */}
      {showSplash && (
        <SplashScreen 
          lang={lang} 
          onFinish={() => setShowSplash(false)} 
        />
      )}

      {/* 2) Onboarding Carousel Layer */}
      {!showSplash && showOnboarding && (
        <Onboarding 
          lang={lang} 
          onComplete={handleOnboardingFinished} 
        />
      )}

      {/* --- LIVE TIMER FLOATING GLOW TOP BAR --- */}
      {/* If timer is actively running, pin a floating golden toolbar so the user doesn't forget! */}
      {runningTimer.is_running && !showTimerModal && !showSplash && !showOnboarding && (
        <div 
          id="running-timer-toast"
          onClick={() => setShowTimerModal(true)}
          className="bg-gradient-to-r from-[#1E1B12] via-[#2F2916] to-[#1E1B12] border-b border-[#D4AF37]/40 py-2 px-5 flex items-center justify-between text-xs cursor-pointer select-none animate-[fadeIn_0.3s] z-30 shrink-0 font-sans"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[#D4AF37] font-semibold">{isAr ? 'المؤقت جاري ...' : 'CHRONO RUNNING'}</span>
            <span className="text-stone-400 font-medium truncate max-w-[140px]">
              {runningTimer.title || (isAr ? 'تعقب فليكسي' : 'Active task')}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#D4AF37] text-black rounded px-2 py-0.5 font-bold font-mono text-[10px]">
            <span>{isAr ? 'افتح' : 'EXPAND'}</span>
          </div>
        </div>
      )}

      {/* --- MAIN ROOT APP VIEWPORTS --- */}
      {!showSplash && !showOnboarding && (
        <div id="main-tabs-viewport" className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Active Router mapping */}
          {activeTab === 'today' && (
            <TodayView 
              currentDate={currentDate}
              onNavigateDate={handleNavigateWeeks}
              entries={entries}
              onAddEntryClick={handleOpenAddEntryModal}
              onEditEntryClick={handleOpenEditEntryModal}
              onStartTimerQuick={handleStartTimerOnTheFly}
              lang={lang}
            />
          )}

          {activeTab === 'review' && (
            <ReviewView 
              entries={entries}
              currentDate={currentDate}
              onEditEntryClick={handleOpenEditEntryModal}
              onAddEntryClick={handleOpenAddEntryModal}
              lang={lang}
            />
          )}

          {activeTab === 'stats' && (
            <StatsView 
              entries={entries}
              lang={lang}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              stats={userStats}
              onUpdateStats={handleUpdateStats}
              onRestoreSeedData={handleRestoreDefaultSeeds}
              onClearDb={handleClearDatabaseComplete}
              onTriggerSplash={handleReplaySplashScreenInUI}
              entriesCount={entries.length}
              lang={lang}
              onLangChange={setLang}
            />
          )}

          {/* --- BOTTOM CALENDAR STRIP & CONTROLS (Directly above Bottom Nav mimicking the picture) --- */}
          {(!showSplash && !showOnboarding && (activeTab === 'today' || activeTab === 'review')) && (
            <div dir="ltr" className="px-4 py-2 bg-[#090908] border-t border-stone-900/40 flex flex-row items-center justify-between select-none shrink-0 w-full">
              
              {/* Horizontal mini date strip scrolling */}
              <div className="flex flex-row items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 mr-3">
                {getDateStripDays(currentDate).map((date, idx) => {
                  const isSelected = getFormattedDateStr(date) === getFormattedDateStr(currentDate);
                  const dayStr = isAr ? getDayNameAr(date) : getDayNameEn(date);
                  const dayNum = date.getDate();
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentDate(date)}
                      className={`flex flex-col items-center justify-center rounded-xl p-1.5 min-w-[50px] h-[52px] cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#D4AF37] text-black font-bold border border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                          : 'bg-[#121210] hover:bg-[#1C1A14] text-stone-400 border border-stone-850'
                      }`}
                    >
                      <span className={`text-[8px] uppercase font-mono ${isSelected ? 'text-black' : 'text-stone-500'}`}>
                        {dayStr}
                      </span>
                      <span className="text-xs font-sans font-extrabold mt-0.5">
                        {dayNum}
                      </span>
                      {isSelected && (
                        <span className="w-1 h-3 rounded-full bg-black mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons mirroring the picture - Always Golden in color */}
              <div className="flex flex-row items-center gap-1.5 shrink-0">
                {/* Plus add entry shortcut */}
                <button
                  id="strip-add-entry-btn"
                  onClick={() => handleOpenAddEntryModal()}
                  className="w-11 h-11 rounded-xl bg-[#D4AF37] hover:bg-[#E5C354] border border-[#D4AF37] flex items-center justify-center text-black cursor-pointer transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] active:scale-95"
                  title={isAr ? 'اضافة يدوي' : 'Add Manual'}
                >
                  <Plus size={18} className="stroke-[3]" />
                </button>

                {/* Stopwatch/Launch timer circle/square option button */}
                <button
                  id="strip-stopwatch-launch"
                  onClick={() => handleStartTimerOnTheFly()}
                  className="w-11 h-11 rounded-xl bg-[#D4AF37] hover:bg-[#E5C354] border border-[#D4AF37] flex items-center justify-center text-black cursor-pointer transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] active:scale-95"
                  title={isAr ? 'تشغيل المؤقت التلقائي' : 'Launch stopwatch'}
                >
                  <Clock size={16} className="stroke-[2.5]" />
                </button>
              </div>

            </div>
          )}

          {/* --- BOTTOM SHIELD NAVIGATION PANEL (Luxury gold highlights) --- */}
          <nav 
            id="app-bottom-nav"
            dir="rtl"
            className="h-16 px-4 bg-[#0A0A09] border-t border-stone-850 flex justify-between items-center relative z-40 shrink-0 select-none pb-1"
          >
            {/* Tab 1: Today */}
            <button
              id="tab-btn-today"
              onClick={() => setActiveTab('today')}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer py-1 ${
                activeTab === 'today' ? 'text-[#D4AF37]' : 'text-stone-600 hover:text-stone-400'
              }`}
            >
              <Calendar size={18} className={activeTab === 'today' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9.5px] font-semibold tracking-tight">{isAr ? 'اليوم' : 'Today'}</span>
            </button>

            {/* Tab 2: Review */}
            <button
              id="tab-btn-review"
              onClick={() => setActiveTab('review')}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer py-1 ${
                activeTab === 'review' ? 'text-[#D4AF37]' : 'text-stone-600 hover:text-stone-400'
              }`}
            >
              <CheckSquare size={18} className={activeTab === 'review' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9.5px] font-semibold tracking-tight">{isAr ? 'المراجعة' : 'Review'}</span>
            </button>

            {/* Tab 3: Stats */}
            <button
              id="tab-btn-stats"
              onClick={() => setActiveTab('stats')}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer py-1 ${
                activeTab === 'stats' ? 'text-[#D4AF37]' : 'text-stone-600 hover:text-stone-400'
              }`}
            >
              <BarChart3 size={18} className={activeTab === 'stats' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9.5px] font-semibold tracking-tight">{isAr ? 'التحليل' : 'Metrics'}</span>
            </button>

            {/* Tab 4: Settings */}
            <button
              id="tab-btn-settings"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 cursor-pointer py-1 ${
                activeTab === 'settings' ? 'text-[#D4AF37]' : 'text-stone-600 hover:text-stone-400'
              }`}
            >
              <Settings size={18} className={activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[9.5px] font-semibold tracking-tight">{isAr ? 'الضبط' : 'Settings'}</span>
            </button>
          </nav>

        </div>
      )}

      {/* --- OPTIONAL FULL-SCALE DRAWER: TIMER CONTROL SHEET --- */}
      {showTimerModal && (
        <div 
          id="timer-overlay"
          className="absolute inset-0 bg-black/80 backdrop-blur-sm z-55 flex flex-col justify-end text-sans"
        >
          <div className="bg-[#0D0D0A] border-t-2 border-[#D4AF37]/50 rounded-t-[32px] h-[92%] flex flex-col shadow-2xl animate-slideUp overflow-hidden">
            {/* Sheet header */}
            <div className="px-6 py-4 border-b border-[#D4AF37]/10 flex justify-between items-center bg-[#13120E]">
              <div>
                <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  {isAr ? 'عداد كفاءة الساعات الحي' : 'Live Stop-watch'}
                </h3>
              </div>
              <button
                id="close-timer-modal"
                onClick={() => {
                  if (!runningTimer.title.trim()) {
                    setShowConfirmation(true);
                    return;
                  }
                  setShowTimerModal(false);
                }}
                className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-[#D4AF37] cursor-pointer text-[9px] font-bold"
              >
                {isAr ? 'اغلاق' : 'Close'}
              </button>
            </div>

            {/* Confirmation Overlay */}
            {showConfirmation && (
              <div className="absolute inset-0 bg-[#070707]/90 z-[60] flex items-center justify-center p-6">
                <div className="bg-[#12120F] border border-[#D4AF37]/30 p-6 rounded-3xl text-center space-y-4 max-w-sm">
                  <p className="text-stone-200 text-sm">
                    {isAr ? 'هل تريد الاغلاق بدون وضع عنوان؟ سوف يتم مسح السجل' : 'Want to close without a title? The log will be deleted.'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleUpdateTimer({ is_running: false, title: '', note: '', accumulated_seconds: 0 });
                        setShowTimerModal(false);
                        setShowConfirmation(false);
                      }}
                      className="flex-1 bg-red-900/20 border border-red-500/30 text-red-400 py-2 rounded-xl text-xs font-bold"
                    >
                      {isAr ? 'مسح واغلاق' : 'Delete & Close'}
                    </button>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="flex-1 bg-stone-800 text-stone-200 py-2 rounded-xl text-xs font-bold"
                    >
                      {isAr ? 'رجوع' : 'Back'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <TimerSheet 
                timer={runningTimer}
                onUpdateTimer={handleUpdateTimer}
                onSaveTimerEntry={handleSaveTimerEntry}
                onClose={() => setShowTimerModal(false)}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT ENTRY MODAL SHEET --- */}
      <EntryModal 
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        editingEntry={editingEntry}
        existingEntries={entries}
        lang={lang}
        defaultStartTime={preCalculatedStart}
        defaultEndTime={preCalculatedEnd}
      />

    </div>
  );
}
