import React, { useState } from 'react';
import { Sparkles, Loader2, Languages, Check } from 'lucide-react';
import { translateTextField, translateArrayField } from '../../services/geminiService';

interface FieldAiTranslatorProps {
  sourceText?: string;
  sourceArray?: string[];
  sourceLang?: 'km' | 'en' | 'auto' | string;
  targetLang?: 'km' | 'en' | 'zh' | 'vi' | 'ja' | 'es' | string;
  fieldHint?: string;
  onTranslatedText?: (translated: string) => void;
  onTranslatedArray?: (translated: string[]) => void;
  label?: string;
  className?: string;
  size?: 'xs' | 'sm';
}

export const FieldAiTranslator: React.FC<FieldAiTranslatorProps> = ({
  sourceText,
  sourceArray,
  sourceLang = 'km',
  targetLang = 'en',
  fieldHint,
  onTranslatedText,
  onTranslatedArray,
  label,
  className = '',
  size = 'xs'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (sourceArray && onTranslatedArray) {
      if (sourceArray.length === 0) return;
      setIsLoading(true);
      try {
        const res = await translateArrayField(sourceArray, targetLang, sourceLang, fieldHint);
        if (res.success && res.translatedItems) {
          onTranslatedArray(res.translatedItems);
          setIsDone(true);
          setTimeout(() => setIsDone(false), 2000);
        }
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        setIsLoading(false);
      }
    } else if (sourceText !== undefined && onTranslatedText) {
      if (!sourceText.trim()) return;
      setIsLoading(true);
      try {
        const res = await translateTextField(sourceText, targetLang, sourceLang, fieldHint);
        if (res.success && typeof res.translatedText === 'string') {
          onTranslatedText(res.translatedText);
          setIsDone(true);
          setTimeout(() => setIsDone(false), 2000);
        }
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const defaultLabel = targetLang === 'en'
    ? '✨ AI Translate (EN)'
    : targetLang === 'km'
    ? '✨ AI បកប្រែ (ខ្មែរ)'
    : `✨ AI Translate (${targetLang.toUpperCase()})`;

  const displayLabel = label || defaultLabel;

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={isLoading || (sourceArray ? sourceArray.length === 0 : !sourceText?.trim())}
      title={`AI auto-translate field to ${targetLang.toUpperCase()}`}
      className={`inline-flex items-center gap-1 font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${
        isDone
          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
          : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs hover:shadow-sm active:scale-95'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span>Translating...</span>
        </>
      ) : isDone ? (
        <>
          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Translated!</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{displayLabel}</span>
        </>
      )}
    </button>
  );
};
