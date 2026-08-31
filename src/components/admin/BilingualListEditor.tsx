import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Sparkles, Languages, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { FieldAiTranslator } from './FieldAiTranslator';
import { translateArrayField, translateTextField } from '../../services/geminiService';
import { useApp } from '../../context/AppContext';
import { LanguageCode } from '../../types';

interface BilingualListEditorProps {
  title: string;
  icon?: React.ReactNode;
  hint?: string;
  kmItems: string[];
  enItems: string[];
  onKmChange: (items: string[]) => void;
  onEnChange: (items: string[]) => void;
  badgeColor?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'slate';
  fieldCategoryHint?: string;
  platformLang?: LanguageCode;
}

export const BilingualListEditor: React.FC<BilingualListEditorProps> = ({
  title,
  icon,
  hint,
  kmItems,
  enItems,
  onKmChange,
  onEnChange,
  badgeColor = 'indigo',
  fieldCategoryHint = 'List Items',
  platformLang
}) => {
  const { language: appLanguage } = useApp();
  const activeLanguage = platformLang || appLanguage || 'km';
  const isEnglishMain = activeLanguage === 'en';

  const [activeLangTab, setActiveLangTab] = useState<'dual' | 'km' | 'en'>('dual');
  const [newKmText, setNewKmText] = useState('');
  const [newEnText, setNewEnText] = useState('');
  const [editingKmIdx, setEditingKmIdx] = useState<number | null>(null);
  const [editingKmText, setEditingKmText] = useState('');
  const [editingEnIdx, setEditingEnIdx] = useState<number | null>(null);
  const [editingEnText, setEditingEnText] = useState('');

  // Add and Auto-Translate Handlers
  const [isAddingWithTrans, setIsAddingWithTrans] = useState(false);

  const handleAddKmWithTranslation = async () => {
    if (!newKmText.trim() || isAddingWithTrans) return;
    const kmStr = newKmText.trim();
    setIsAddingWithTrans(true);
    try {
      const res = await translateTextField(kmStr, 'en', 'km', fieldCategoryHint);
      const enStr = res.success && res.translatedText ? res.translatedText : '';
      onKmChange([...kmItems, kmStr]);
      if (enStr) {
        onEnChange([...enItems, enStr]);
      }
      setNewKmText('');
    } catch (e) {
      console.warn('Translate on add failed:', e);
      onKmChange([...kmItems, kmStr]);
      setNewKmText('');
    } finally {
      setIsAddingWithTrans(false);
    }
  };

  const handleAddEnWithTranslation = async () => {
    if (!newEnText.trim() || isAddingWithTrans) return;
    const enStr = newEnText.trim();
    setIsAddingWithTrans(true);
    try {
      const res = await translateTextField(enStr, 'km', 'en', fieldCategoryHint);
      const kmStr = res.success && res.translatedText ? res.translatedText : '';
      onEnChange([...enItems, enStr]);
      if (kmStr) {
        onKmChange([...kmItems, kmStr]);
      }
      setNewEnText('');
    } catch (e) {
      console.warn('Translate on add failed:', e);
      onEnChange([...enItems, enStr]);
      setNewEnText('');
    } finally {
      setIsAddingWithTrans(false);
    }
  };

  // Add Item Handlers
  const handleAddKm = () => {
    if (!newKmText.trim()) return;
    onKmChange([...kmItems, newKmText.trim()]);
    setNewKmText('');
  };

  const handleAddEn = () => {
    if (!newEnText.trim()) return;
    onEnChange([...enItems, newEnText.trim()]);
    setNewEnText('');
  };

  // Remove Item Handlers
  const handleRemoveKm = (index: number) => {
    onKmChange(kmItems.filter((_, i) => i !== index));
    if (editingKmIdx === index) {
      setEditingKmIdx(null);
      setEditingKmText('');
    }
  };

  const handleRemoveEn = (index: number) => {
    onEnChange(enItems.filter((_, i) => i !== index));
    if (editingEnIdx === index) {
      setEditingEnIdx(null);
      setEditingEnText('');
    }
  };

  // Edit Handlers
  const handleSaveKmEdit = (index: number) => {
    if (!editingKmText.trim()) return;
    const updated = [...kmItems];
    updated[index] = editingKmText.trim();
    onKmChange(updated);
    setEditingKmIdx(null);
    setEditingKmText('');
  };

  const handleSaveEnEdit = (index: number) => {
    if (!editingEnText.trim()) return;
    const updated = [...enItems];
    updated[index] = editingEnText.trim();
    onEnChange(updated);
    setEditingEnIdx(null);
    setEditingEnText('');
  };

  const colorThemes = {
    indigo: {
      border: 'border-indigo-200 dark:border-indigo-900/40',
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      text: 'text-indigo-900 dark:text-indigo-200',
      badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
    },
    emerald: {
      border: 'border-emerald-200 dark:border-emerald-900/40',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      text: 'text-emerald-900 dark:text-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-900/40',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      text: 'text-amber-900 dark:text-amber-200',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    },
    blue: {
      border: 'border-blue-200 dark:border-blue-900/40',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      text: 'text-blue-900 dark:text-blue-200',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
    },
    rose: {
      border: 'border-rose-200 dark:border-rose-900/40',
      bg: 'bg-rose-50/50 dark:bg-rose-950/20',
      text: 'text-rose-900 dark:text-rose-200',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
    },
    slate: {
      border: 'border-slate-200 dark:border-slate-700',
      bg: 'bg-slate-50/50 dark:bg-slate-800/40',
      text: 'text-slate-900 dark:text-white',
      badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  };

  const theme = colorThemes[badgeColor];

  // Render Khmer List Column
  const renderKhmerColumn = () => (
    <div className="space-y-2.5 bg-white/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            🇰🇭 KM
          </span>
          <span>ភាសាខ្មែរ {isEnglishMain ? '(Khmer Secondary)' : '(Khmer Primary)'} ({kmItems.length})</span>
        </label>
        <span className="text-[10px] text-slate-400 font-khmer">ឧទាហរណ៍៖ សេវាទទួលនៅព្រលានយន្តហោះ</span>
      </div>

      {/* Add Input */}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={newKmText}
          onChange={(e) => setNewKmText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddKm();
            }
          }}
          placeholder="ឧទាហរណ៍៖ ការស្នាក់នៅសណ្ឋាគារផ្កាយ ៤, អាហារ ៣ ពេល..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-khmer"
        />
        <button
          type="button"
          onClick={handleAddKm}
          title="Add item (Khmer only)"
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+</span>
        </button>
        {newKmText.trim() && (
          <button
            type="button"
            onClick={handleAddKmWithTranslation}
            disabled={isAddingWithTrans}
            title="Add to Khmer list and auto-translate into English"
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>+ ➔ 🇺🇸 EN</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {kmItems.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic text-center py-3 font-khmer">
            {isEnglishMain ? 'មិនទាន់មានទិន្នន័យជាភាសាខ្មែរនៅឡើយទេ។ ចុច "⚡ Translate All 🇺🇸 EN ➔ 🇰🇭 KM" ខាងលើ។' : 'មិនទាន់មានទិន្នន័យជាភាសាខ្មែរនៅឡើយទេ។ បញ្ចូលចំណុចថ្មីខាងលើ។'}
          </p>
        ) : (
          kmItems.map((item, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              {editingKmIdx === i ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="text"
                    value={editingKmText}
                    onChange={(e) => setEditingKmText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveKmEdit(i);
                      } else if (e.key === 'Escape') {
                        setEditingKmIdx(null);
                      }
                    }}
                    autoFocus
                    className="flex-1 px-2 py-0.5 rounded border border-indigo-500 bg-white dark:bg-slate-900 text-xs font-khmer"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveKmEdit(i)}
                    className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingKmIdx(null)}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed flex-1 font-khmer">
                      {item}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <FieldAiTranslator
                      kmText={item}
                      enText={enItems[i] || ''}
                      fieldHint={fieldCategoryHint}
                      preferredDirection="km_to_en"
                      onTranslateToEn={(trans) => {
                        const newEn = [...enItems];
                        while (newEn.length <= i) newEn.push('');
                        newEn[i] = trans;
                        onEnChange(newEn);
                      }}
                      onTranslateToKm={(trans) => {
                        const newKm = [...kmItems];
                        while (newKm.length <= i) newKm.push('');
                        newKm[i] = trans;
                        onKmChange(newKm);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKmIdx(i);
                        setEditingKmText(item);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveKm(i)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render English List Column
  const renderEnglishColumn = () => (
    <div className="space-y-2.5 bg-white/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            🇬🇧 EN
          </span>
          <span>English Version {isEnglishMain ? '(English Primary)' : '(English Secondary)'} ({enItems.length})</span>
        </label>
        <span className="text-[10px] text-slate-400">Example: VIP Airport Meet & Greet</span>
      </div>

      {/* Add Input */}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={newEnText}
          onChange={(e) => setNewEnText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddEn();
            }
          }}
          placeholder={isEnglishMain ? "e.g. 4-Star Hotel Accommodation, B2B Matchmaking..." : "e.g. VIP Airport transfer, 4-Star Hotel..."}
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
        />
        <button
          type="button"
          onClick={handleAddEn}
          title="Add item (English only)"
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+</span>
        </button>
        {newEnText.trim() && (
          <button
            type="button"
            onClick={handleAddEnWithTranslation}
            disabled={isAddingWithTrans}
            title="Add to English list and auto-translate into Khmer"
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>+ ➔ 🇰🇭 KM</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {enItems.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic text-center py-3">
            {isEnglishMain
              ? 'No English items yet. Type above to add your first item.'
              : 'No English items yet. Click "⚡ Translate All 🇰🇭 KM ➔ 🇺🇸 EN" above or type manually.'}
          </p>
        ) : (
          enItems.map((item, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              {editingEnIdx === i ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="text"
                    value={editingEnText}
                    onChange={(e) => setEditingEnText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEnEdit(i);
                      } else if (e.key === 'Escape') {
                        setEditingEnIdx(null);
                      }
                    }}
                    autoFocus
                    className="flex-1 px-2 py-0.5 rounded border border-indigo-500 bg-white dark:bg-slate-900 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEnEdit(i)}
                    className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEnIdx(null)}
                    className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed flex-1">
                      {item}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <FieldAiTranslator
                      kmText={kmItems[i] || ''}
                      enText={item}
                      fieldHint={fieldCategoryHint}
                      preferredDirection="en_to_km"
                      onTranslateToKm={(trans) => {
                        const newKm = [...kmItems];
                        while (newKm.length <= i) newKm.push('');
                        newKm[i] = trans;
                        onKmChange(newKm);
                      }}
                      onTranslateToEn={(trans) => {
                        const newEn = [...enItems];
                        while (newEn.length <= i) newEn.push('');
                        newEn[i] = trans;
                        onEnChange(newEn);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEnIdx(i);
                        setEditingEnText(item);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEn(i)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} space-y-3.5`}>
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h4 className={`text-xs font-bold ${theme.text} flex items-center gap-2`}>
              <span>{title}</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${theme.badge}`}>
                {isEnglishMain ? `🇺🇸 ${enItems.length} | 🇰🇭 ${kmItems.length}` : `🇰🇭 ${kmItems.length} | 🇺🇸 ${enItems.length}`}
              </span>
            </h4>
            {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Smart Dual-Array AI Batch Translator */}
          <FieldAiTranslator
            kmArray={kmItems}
            enArray={enItems}
            fieldHint={fieldCategoryHint}
            onTranslateArrayToKm={(translated) => onKmChange(translated)}
            onTranslateArrayToEn={(translated) => onEnChange(translated)}
            size="xs"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveLangTab('dual')}
              className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                activeLangTab === 'dual'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dual View
            </button>
            {isEnglishMain ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                    activeLangTab === 'en'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇺🇸 English (Main)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('km')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                    activeLangTab === 'km'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇰🇭 Khmer
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('km')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                    activeLangTab === 'km'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇰🇭 Khmer (ចម្បង)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLangTab('en')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                    activeLangTab === 'en'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇺🇸 English
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Lists Container - Ordered according to selected platform language */}
      <div className={`grid gap-4 ${activeLangTab === 'dual' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {isEnglishMain ? (
          <>
            {(activeLangTab === 'dual' || activeLangTab === 'en') && renderEnglishColumn()}
            {(activeLangTab === 'dual' || activeLangTab === 'km') && renderKhmerColumn()}
          </>
        ) : (
          <>
            {(activeLangTab === 'dual' || activeLangTab === 'km') && renderKhmerColumn()}
            {(activeLangTab === 'dual' || activeLangTab === 'en') && renderEnglishColumn()}
          </>
        )}
      </div>
    </div>
  );
};
