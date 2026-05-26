/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, Trash2, Check, Tag } from 'lucide-react';
import { TimeEntry, UsefulnessStatus } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<TimeEntry, 'created_at' | 'updated_at'>) => void;
  onDelete?: (id: string) => void;
  editingEntry?: TimeEntry | null;
  existingEntries: TimeEntry[];
  lang: 'ar' | 'en';
  defaultStartTime?: string; // Prepopulated start time (e.g. from an untracked gap tap)
  defaultEndTime?: string;
  isReadOnly?: boolean;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingEntry,
  existingEntries,
  lang,
  defaultStartTime,
  defaultEndTime,
  isReadOnly = false,
}) => {
  const isAr = lang === 'ar';

  // States
  const [title, setTitle] = useState('');
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
  const [categoryId, setCategoryId] = useState('work');
  const [usefulness, setUsefulness] = useState<UsefulnessStatus>('useful');
  
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
  
  // Date-times represent local input values "YYYY-MM-DDTHH:MM"
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [note, setNote] = useState('');

  // Overlap and validation warnings
  const [errorText, setErrorText] = useState('');
  const [overlapWarning, setOverlapWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load editing entry or defaults
  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setCategoryId(editingEntry.category_id);
      setUsefulness(editingEntry.usefulness_status);
      setStartDateStr(formatISOToInput(editingEntry.start_time));
      setEndDateStr(formatISOToInput(editingEntry.end_time));
      setDurationMinutes(editingEntry.duration_minutes);
      setNote(editingEntry.note || '');
      setErrorText('');
      setOverlapWarning(false);
      setShowDeleteConfirm(false);
    } else {
      // Create sensible defaults
      setTitle('');
      setCategoryId('work');
      setUsefulness('useful');
      setNote('');
      setErrorText('');
      setOverlapWarning(false);
      setShowDeleteConfirm(false);

      const now = new Date();
      if (defaultStartTime && defaultEndTime) {
        setStartDateStr(formatISOToInput(defaultStartTime));
        setEndDateStr(formatISOToInput(defaultEndTime));
      } else {
        // Round to nearest 15 mins for cleaner UX
        const start = new Date();
        start.setMinutes(Math.floor(start.getMinutes() / 15) * 15 - 30);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        
        setStartDateStr(formatISOToInput(start.toISOString()));
        setEndDateStr(formatISOToInput(end.toISOString()));
      }
    }
  }, [editingEntry, isOpen, defaultStartTime, defaultEndTime]);

  // Handle auto-updating duration when start/end times change
  useEffect(() => {
    if (!startDateStr || !endDateStr) return;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins > 0) {
      setDurationMinutes(diffMins);
      setErrorText('');
    } else {
      setDurationMinutes(0);
      setErrorText(isAr ? 'تنبيه: وقت النهاية يجب أن يكون بعد وقت البداية.' : 'End time must be after start time.');
    }
  }, [startDateStr, endDateStr, lang]);

  // Check for overlaps with other interval entries
  useEffect(() => {
    if (!startDateStr || !endDateStr) return;
    const currentStart = new Date(startDateStr).getTime();
    const currentEnd = new Date(endDateStr).getTime();

    if (isNaN(currentStart) || isNaN(currentEnd) || currentEnd <= currentStart) {
      setOverlapWarning(false);
      return;
    }

    const hasOverlap = existingEntries.some(entry => {
      // Skip the entry we are currently editing
      if (editingEntry && entry.id === editingEntry.id) return false;

      const eStart = new Date(entry.start_time).getTime();
      const eEnd = new Date(entry.end_time).getTime();

      // Simple overlap condition
      return currentStart < eEnd && currentEnd > eStart;
    });

    setOverlapWarning(hasOverlap);
  }, [startDateStr, endDateStr, existingEntries, editingEntry]);

  // Format Helper: ISO date string to input-ready "YYYY-MM-DDTHH:mm"
  function formatISOToInput(isoString: string): string {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}-${minutes}`.replace('T', 'T').replace('-', '-'); // standard ISO input format represents with -
    // Let's do a reliable replacement
  }

  // Pure picker format
  function formatISOToInputSecure(isoString: string): string {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Adjust formatting once states mount
  useEffect(() => {
    if (editingEntry) {
      setStartDateStr(formatISOToInputSecure(editingEntry.start_time));
      setEndDateStr(formatISOToInputSecure(editingEntry.end_time));
    } else if (defaultStartTime && defaultEndTime) {
      setStartDateStr(formatISOToInputSecure(defaultStartTime));
      setEndDateStr(formatISOToInputSecure(defaultEndTime));
    } else {
      const start = new Date();
      start.setMinutes(Math.floor(start.getMinutes() / 15) * 15 - 30);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      setStartDateStr(formatISOToInputSecure(start.toISOString()));
      setEndDateStr(formatISOToInputSecure(end.toISOString()));
    }
  }, [editingEntry, defaultStartTime, defaultEndTime, isOpen]);

  if (!isOpen) return null;

  const handleSuggestionClick = (suggestedText: string) => {
    setTitle(suggestedText);

    // Auto classify if suggestion matches a known type
    const lower = suggestedText.toLowerCase();
    if (lower.includes('دراسة') || lower.includes('study') || lower.includes('تعلم') || lower.includes('عمل') || lower.includes('work')) {
      setUsefulness('useful');
    } else if (lower.includes('يوتيوب') || lower.includes('youtube') || lower.includes('سوشيال') || lower.includes('social') || lower.includes('انست') || lower.includes('تويتر')) {
      setUsefulness('not_useful');
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorText(isAr ? 'يرجى إدخال عنوان للنشاط.' : 'Please enter an activity title.');
      return;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setErrorText(isAr ? 'يرجى اختيار أوقات صحيحة.' : 'Please select valid start & end times.');
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setErrorText(isAr ? 'وقت النهاية يجب أن يكون بعد وقت البداية.' : 'End time must be after start time.');
      return;
    }

    const defaultIcon = 'Clock';
    const defaultColor = usefulness === 'useful' 
      ? '#D4AF37' 
      : usefulness === 'not_useful' 
        ? '#F44336' 
        : '#9E9E9E';

    // Call save payload
    onSave({
      id: editingEntry ? editingEntry.id : Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      category_id: 'default',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration_minutes: durationMinutes,
      note: note.trim() || undefined,
      usefulness_status: usefulness,
      icon: defaultIcon,
      color: defaultColor,
    });

    onClose();
  };

  return (
    <div 
      id="entry-modal-overlay"
      className="absolute inset-0 bg-black/75 backdrop-blur-sm z-55 flex flex-col justify-end text-sans"
    >
      {/* Scrollable Bottom Sheet */}
      <div 
        id="entry-modal-sheet"
        className="bg-[#0D0D0A] border-t-2 border-[#D4AF37]/40 rounded-t-[32px] max-h-[92%] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-[slideUp_0.3s_ease-out]"
      >
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/10 flex justify-between items-center bg-[#12120F]">
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              {editingEntry 
                ? (isAr ? 'تعديل السجل الزمني' : 'Edit Sesh Record') 
                : (isAr ? 'إضافة سجل وقت جديد' : 'New AlMajd Entry')
              }
            </h3>
          </div>
          <button 
            id="close-entry-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1A16] flex items-center justify-center text-stone-400 hover:text-[#D4AF37] border border-stone-850 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar pb-12">

          {isReadOnly && (
            <div className="bg-amber-950/20 border border-[#D4AF37]/35 text-amber-200 text-[11px] px-3.5 py-3 rounded-2xl flex items-start gap-2.5 shadow-md">
              <AlertTriangle size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#D4AF37] block mb-0.5">
                  {isAr ? 'الأرشيف التاريخي مغلق 🔒' : 'Historical Archive Locked 🔒'}
                </span>
                <span className="text-stone-400 leading-snug block">
                  {isAr 
                    ? 'بمجرد انتهاء اليوم بعد الساعة 23:59، يتم إغلاق جميع السجلات والإحصائيات تلقائياً وتجميدها للقراءة فقط لضمان دقة والتزام تاريخ أداءك.' 
                    : 'Once the day ends past 23:59, all records are permanently locked to read-only mode to maintain pristine, uncheatable performance history.'}
                </span>
              </div>
            </div>
          )}

          {/* Error Text Frame */}
          {errorText && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Overlap Signal */}
          {overlapWarning && (
            <div className="bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px] px-3 py-2.5 rounded-xl flex items-start gap-2">
              <AlertTriangle size={15} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">{isAr ? 'تنبيه بتداخل المواعيد!' : 'Schedule Overlap Detected!'}</span>
                <span className="text-stone-400 text-[10px]">{isAr ? 'هذا الوقت يتداخل جزئياً مع نشاطات مسجلة أخرى في يومك.' : 'This interval overlaps with another logged activity.'}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <input
              id="entry-title-input"
              type="text"
              placeholder={isAr ? 'مثال: دراسة مصفوفات التفاضل والتكامل، قراءة كتاب' : 'e.g. Deep coding, Duolingo, gym bash'}
              value={title}
              onChange={e => !isReadOnly && setTitle(e.target.value)}
              disabled={isReadOnly}
              className={`w-full bg-[#161613] border focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none transition-colors ${
                isReadOnly ? 'border-stone-850 cursor-not-allowed text-stone-400' : 'border-stone-800'
              }`}
            />
            {/* Rapid chips row */}
            {!isReadOnly && (
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">
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
            )}
          </div>

          {/* 2) CORE USEFULNESS SCALE (Crucial requested feature!) */}
          <div className="space-y-2 p-3 bg-[#1A1914] border border-[#D4AF37]/15 rounded-2xl">
            <label className="text-xs font-bold text-[#D4AF37] tracking-wider block flex items-center gap-1">
              <Tag size={12} />
              {isAr ? 'هل هذا الوقت مفيد أم غير مفيد؟' : 'Is this tracked time productive / useful?'}
            </label>
            
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Useful */}
              <button
                id="btn-usefulness-useful"
                type="button"
                onClick={() => !isReadOnly && setUsefulness('useful')}
                disabled={isReadOnly}
                className={`py-2 px-1 rounded-xl font-semibold text-xs transition-all flex flex-col items-center gap-1 ${
                  isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  usefulness === 'useful' 
                    ? 'bg-[#4CAF50]/15 text-[#4CAF50] border-2 border-[#4CAF50]' 
                    : 'bg-stone-900 text-stone-500 border border-stone-800'
                }`}
              >
                <span className="text-base">🟢</span>
                <span>{isAr ? 'وقت ممول' : 'Funded Time'}</span>
              </button>

              {/* Not Useful */}
              <button
                id="btn-usefulness-notuseful"
                type="button"
                onClick={() => !isReadOnly && setUsefulness('not_useful')}
                disabled={isReadOnly}
                className={`py-2 px-1 rounded-xl font-semibold text-xs transition-all flex flex-col items-center gap-1 ${
                  isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  usefulness === 'not_useful' 
                    ? 'bg-[#F44336]/15 text-[#F44336] border-2 border-[#F44336]' 
                    : 'bg-stone-900 text-stone-500 border border-stone-800'
                }`}
              >
                <span className="text-base">🔴</span>
                <span>{isAr ? 'وقت مجاني' : 'Free Time'}</span>
              </button>
            </div>
          </div>



          {/* 4) TIME INTERVAL PICKERS */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-900/60 rounded-2xl border border-stone-850">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-stone-500 block">
                {isAr ? 'وقت البدء' : 'Start Interval'}
              </label>
              <input
                id="entry-start-time"
                type="datetime-local"
                value={startDateStr}
                onChange={e => !isReadOnly && setStartDateStr(e.target.value)}
                disabled={isReadOnly}
                onClick={e => {
                  try {
                    if (!isReadOnly) (e.target as any).showPicker();
                  } catch (err) {}
                }}
                className={`w-full bg-[#161613] border focus:border-[#D4AF37] rounded-xl p-3 text-xs text-stone-200 focus:outline-none text-center font-mono relative ${
                  isReadOnly ? 'border-stone-850 cursor-not-allowed text-stone-400' : 'border-stone-800 cursor-pointer'
                } [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:z-10`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-stone-500 block">
                {isAr ? 'وقت النهاية' : 'End Interval'}
              </label>
              <input
                id="entry-end-time"
                type="datetime-local"
                value={endDateStr}
                onChange={e => !isReadOnly && setEndDateStr(e.target.value)}
                disabled={isReadOnly}
                onClick={e => {
                  try {
                    if (!isReadOnly) (e.target as any).showPicker();
                  } catch (err) {}
                }}
                className={`w-full bg-[#161613] border focus:border-[#D4AF37] rounded-xl p-3 text-xs text-stone-200 focus:outline-none text-center font-mono relative ${
                  isReadOnly ? 'border-stone-850 cursor-not-allowed text-stone-400' : 'border-stone-800 cursor-pointer'
                } [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:z-10`}
              />
            </div>
            
            {/* Automatic length count display */}
            <div className="col-span-2 pt-2 border-t border-stone-800/60 flex justify-between items-center text-xs">
              <span className="text-stone-500 flex items-center gap-1.5 font-sans">
                <Clock size={12} className="text-[#D4AF37]" />
                {isAr ? 'المدة الكلية المحسوبة:' : 'Calculated Duration:'}
              </span>
              <span className="font-mono bg-[#1E1B12] text-[#D4AF37] px-2.5 py-0.5 rounded-md font-semibold text-xs">
                {durationMinutes >= 60 
                  ? `${Math.floor(durationMinutes / 60)}${isAr ? ' س ' : 'h '}${durationMinutes % 60 ? `${durationMinutes % 60}${isAr ? ' د' : 'm'}` : ''}`
                  : `${durationMinutes} ${isAr ? 'دقيقة' : 'mins'}`
                }
              </span>
            </div>
          </div>

          {/* 5) NOTES */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300 tracking-wider block">
              {isAr ? 'ملاحظة أو تدوينة اختيارية' : 'Personal log or context note (Optional)'}
            </label>
            <textarea
              id="entry-note-input"
              rows={2}
              placeholder={isAr ? 'اكتب تدوين سريع، مثلاً: كان نقاشاً حول العقود البرمجية ...' : 'Add custom context tags, thoughts...'}
              value={note}
              onChange={e => !isReadOnly && setNote(e.target.value)}
              disabled={isReadOnly}
              className={`w-full bg-[#161613] border focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none transition-colors resize-none ${
                isReadOnly ? 'border-stone-850 cursor-not-allowed text-stone-400' : 'border-stone-800'
              }`}
            />
          </div>

        </div>

        {/* Footer Actions Panel */}
        <div className="p-5 border-t border-[#D4AF37]/10 bg-[#12120F] flex flex-col gap-2">
          
          {isReadOnly ? (
            <button
              id="btn-close-readonly"
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-xl bg-stone-900 border border-stone-850 hover:border-[#D4AF37]/30 text-stone-300 font-bold text-sm tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <span>{isAr ? 'إغلاق المعاينة' : 'Close Preview'}</span>
            </button>
          ) : (
            <>
              <button
                id="btn-save-entry"
                type="button"
                onClick={handleSave}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D5B038] to-[#C59B27] hover:from-[#E5C354] hover:to-[#B58B17] text-[#0C0C0B] font-bold text-sm tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={16} />
                <span>{isAr ? 'حفظ السجل وتأكيد' : 'Affirm and Save'}</span>
              </button>

              {/* Edit Delete Action */}
              {editingEntry && onDelete && (
                <div className="mt-1">
                  {!showDeleteConfirm ? (
                    <button
                      id="btn-trigger-delete"
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full h-10 rounded-xl bg-transparent border border-red-500/20 hover:border-red-500/50 hover:bg-red-950/20 text-red-400 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>{isAr ? 'حذف هذا السجل الزمني' : 'Remove record'}</span>
                    </button>
                  ) : (
                    <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 flex flex-col gap-2 animate-[fadeIn_0.2s]">
                      <p className="text-[11px] text-red-200 text-center">
                        {isAr ? 'هل أنت متأكد تماماً من رغبتك في حذف هذا الوقت؟ لا يمكن التراجع.' : 'Confirm deleting this log permanently?'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id="btn-cancel-delete"
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-stone-900 border border-stone-850 rounded-lg text-stone-300 text-[11px] py-1.5 font-medium cursor-pointer"
                        >
                          {isAr ? 'تراجع' : 'Cancel'}
                        </button>
                        <button
                          id="btn-confirm-delete"
                          type="button"
                          onClick={() => {
                            onDelete(editingEntry.id);
                            onClose();
                          }}
                          className="bg-red-600 hover:bg-red-700 rounded-lg text-white text-[11px] py-1.5 font-semibold cursor-pointer"
                        >
                          {isAr ? 'نعم، احذف' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
