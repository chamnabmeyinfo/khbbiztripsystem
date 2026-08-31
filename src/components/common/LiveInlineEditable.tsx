import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Sparkles, Edit3, Plus, Trash2, Globe, CheckCircle2, RotateCcw } from 'lucide-react';
import { translateTextField } from '../../services/geminiService';
import { LanguageCode } from '../../types';

export interface LiveInlineTextProps {
  value: string;
  isLiveEditing: boolean;
  onSave: (newValue: string) => void;
  placeholder?: string;
  language?: LanguageCode;
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  sourceTextForTranslation?: string;
  badgeLabel?: string;
  rows?: number;
}

export const LiveInlineText: React.FC<LiveInlineTextProps> = ({
  value,
  isLiveEditing,
  onSave,
  placeholder = 'Click to edit text...',
  language = 'en',
  multiline = false,
  className = '',
  inputClassName = '',
  as = 'div',
  sourceTextForTranslation,
  badgeLabel,
  rows = 3
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [currentDraft, setCurrentDraft] = useState<string>(value || '');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCurrentDraft(value || '');
  }, [value]);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleCommit = () => {
    setIsFocused(false);
    if (currentDraft !== value) {
      onSave(currentDraft.trim());
    }
  };

  const handleCancel = () => {
    setCurrentDraft(value || '');
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    }
  };

  const handleAiTranslate = async () => {
    if (!sourceTextForTranslation && !currentDraft) return;
    const source = sourceTextForTranslation || currentDraft;
    try {
      setIsTranslating(true);
      const targetLang = language === 'km' ? 'km' : 'en';
      const sourceLang = targetLang === 'km' ? 'en' : 'km';
      const translated = await translateTextField(source, sourceLang, targetLang);
      if (translated && translated.translatedText && translated.translatedText.trim()) {
        setCurrentDraft(translated.translatedText.trim());
        onSave(translated.translatedText.trim());
      }
    } catch (err) {
      console.warn('Inline AI translate notice:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const Tag = as;

  if (!isLiveEditing) {
    return (
      <Tag className={className}>
        {value || <span className="opacity-40 italic">{placeholder}</span>}
      </Tag>
    );
  }

  if (isFocused) {
    return (
      <div className="relative group/field my-1 z-20">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentDraft}
            onChange={(e) => setCurrentDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={rows}
            placeholder={placeholder}
            className={`w-full p-2.5 rounded-xl border-2 border-amber-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 text-sm font-sans resize-y ${inputClassName}`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={currentDraft}
            onChange={(e) => setCurrentDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-2 rounded-xl border-2 border-amber-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 text-sm font-sans ${inputClassName}`}
          />
        )}

        <div className="flex items-center justify-between gap-1.5 mt-1.5 p-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1 px-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Editing ({language.toUpperCase()})</span>
          </div>

          <div className="flex items-center gap-1">
            {sourceTextForTranslation && (
              <button
                type="button"
                onClick={handleAiTranslate}
                disabled={isTranslating}
                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-[10px]"
                title="Translate from original source using AI"
              >
                <Sparkles className={`w-3 h-3 ${isTranslating ? 'animate-spin' : ''}`} />
                <span>{isTranslating ? 'Translating...' : 'AI Translate'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCommit}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Done</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsFocused(true)}
      className="relative group/editable cursor-pointer rounded-xl border border-dashed border-amber-300 dark:border-amber-700/80 hover:border-amber-500 dark:hover:border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 hover:bg-amber-50/50 dark:hover:bg-amber-950/40 p-1 -m-1 transition-all"
      title={`Click to live edit in ${language.toUpperCase()}`}
    >
      <div className="absolute -top-2.5 right-2 opacity-0 group-hover/editable:opacity-100 transition-opacity z-10">
        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1">
          <Edit3 className="w-2.5 h-2.5 stroke-[2.5]" />
          <span>Edit ({badgeLabel || language.toUpperCase()})</span>
        </span>
      </div>
      <Tag className={className}>
        {value || <span className="opacity-40 italic">{placeholder}</span>}
      </Tag>
    </div>
  );
};

export interface LiveInlineListProps {
  items: string[];
  isLiveEditing: boolean;
  onUpdateItems: (newItems: string[]) => void;
  language?: LanguageCode;
  placeholder?: string;
  addButtonLabel?: string;
  renderItem?: (item: string, index: number, isEditing: boolean, actions: { update: (val: string) => void; remove: () => void }) => React.ReactNode;
}

export const LiveInlineList: React.FC<LiveInlineListProps> = ({
  items = [],
  isLiveEditing,
  onUpdateItems,
  language = 'en',
  placeholder = 'Add new item...',
  addButtonLabel = 'Add Item',
  renderItem
}) => {
  const handleUpdateItem = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onUpdateItems(next);
  };

  const handleRemoveItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onUpdateItems(next);
  };

  const handleAddItem = () => {
    const newItemText = language === 'km' ? 'ចំណុចថ្មី...' : 'New point...';
    onUpdateItems([...items, newItemText]);
  };

  if (!isLiveEditing) {
    if (renderItem) {
      return (
        <div className="space-y-3">
          {items.map((item, idx) =>
            renderItem(item, idx, false, {
              update: (val) => handleUpdateItem(idx, val),
              remove: () => handleRemoveItem(idx)
            })
          )}
        </div>
      );
    }
    return (
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <span className="text-indigo-500 font-bold">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3 p-3 rounded-2xl border-2 border-dashed border-amber-300/80 dark:border-amber-700/60 bg-amber-50/10 dark:bg-amber-950/10">
      <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300">
        <span className="flex items-center gap-1">
          <Edit3 className="w-3.5 h-3.5" />
          <span>Interactive List Editor ({language.toUpperCase()})</span>
        </span>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{addButtonLabel}</span>
        </button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 group/item">
          <div className="flex-1">
            <LiveInlineText
              value={item}
              isLiveEditing={true}
              onSave={(val) => handleUpdateItem(idx, val)}
              language={language}
              placeholder={placeholder}
              className="text-xs font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveItem(idx)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-4 text-xs text-slate-400 italic">
          No items yet. Click "{addButtonLabel}" to add the first entry.
        </div>
      )}
    </div>
  );
};

export interface LiveEditControlBarProps {
  isLiveEditing: boolean;
  onToggleLiveEditing: () => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenFullEditor: () => void;
  packageTitle?: string;
}

export const LiveEditControlBar: React.FC<LiveEditControlBarProps> = ({
  isLiveEditing,
  onToggleLiveEditing,
  language,
  onSelectLanguage,
  onOpenFullEditor,
  packageTitle = 'Tour Package'
}) => {
  return (
    <div className={`sticky top-0 z-40 transition-all duration-300 ${isLiveEditing ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl py-2 px-3 sm:px-6' : 'bg-slate-900/90 text-white py-1.5 px-3 sm:px-6 backdrop-blur-md border-b border-slate-800'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        {/* Left Side: Live Edit Mode Switch & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleLiveEditing}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 ${
              isLiveEditing
                ? 'bg-white text-amber-700 ring-2 ring-white/50'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isLiveEditing ? '⚡ Live Edit Active: ON' : '✏️ Enable Live Edit Mode'}</span>
          </button>

          {isLiveEditing && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/20 text-white text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Click any text to edit directly in {language.toUpperCase()}</span>
            </span>
          )}
        </div>

        {/* Right Side: Instant Language Switcher & Full Studio Shortcut */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/25 text-xs font-bold">
            <span className="text-[10px] text-white/70 px-1.5 uppercase hidden md:inline">Language:</span>
            {[
              { code: 'en', label: 'EN', flag: '🇺🇸' },
              { code: 'km', label: 'KM', flag: '🇰🇭' },
              { code: 'ja', label: 'JA', flag: '🇯🇵' },
              { code: 'es', label: 'ES', flag: '🇪🇸' },
              { code: 'ar', label: 'AR', flag: '🇦🇪' }
            ].map(langItem => (
              <button
                key={langItem.code}
                type="button"
                onClick={() => onSelectLanguage(langItem.code as LanguageCode)}
                className={`px-2 py-0.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  language === langItem.code
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={`Switch active translation to ${langItem.label}`}
              >
                <span>{langItem.flag} {langItem.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenFullEditor}
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/20"
            title="Open full studio modal for advanced settings (images, videos, coordinates, pricing)"
          >
            <span>🎛️ Full Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
