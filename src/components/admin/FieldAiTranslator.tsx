import React, { useState } from 'react';
import { Sparkles, Loader2, Check, ArrowRightLeft, Languages } from 'lucide-react';
import { translateTextField, translateArrayField, detectTextLanguage, smartTranslateFieldPair } from '../../services/geminiService';

export interface FieldAiTranslatorProps {
  // Single text / array mode (legacy & direct)
  sourceText?: string;
  sourceArray?: string[];
  sourceLang?: 'km' | 'en' | 'auto' | string;
  targetLang?: 'km' | 'en' | 'zh' | 'vi' | 'ja' | 'es' | 'auto' | string;
  onTranslatedText?: (translated: string) => void;
  onTranslatedArray?: (translated: string[]) => void;

  // Smart Dual-Field Auto-Detection Mode
  kmText?: string;
  enText?: string;
  onTranslateToKm?: (translated: string) => void;
  onTranslateToEn?: (translated: string) => void;

  // Smart Dual-Array Auto-Detection Mode
  kmArray?: string[];
  enArray?: string[];
  onTranslateArrayToKm?: (translated: string[]) => void;
  onTranslateArrayToEn?: (translated: string[]) => void;

  fieldHint?: string;
  label?: string;
  className?: string;
  size?: 'xs' | 'sm';
  showBadge?: boolean;
}

export const FieldAiTranslator: React.FC<FieldAiTranslatorProps> = ({
  sourceText,
  sourceArray,
  sourceLang = 'auto',
  targetLang = 'auto',
  fieldHint,
  onTranslatedText,
  onTranslatedArray,
  kmText,
  enText,
  onTranslateToKm,
  onTranslateToEn,
  kmArray,
  enArray,
  onTranslateArrayToKm,
  onTranslateArrayToEn,
  label,
  className = '',
  size = 'xs',
  showBadge = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Determine if this is dual-field mode
  const isDualFieldMode = (kmText !== undefined || enText !== undefined) && (onTranslateToKm || onTranslateToEn);
  const isDualArrayMode = (kmArray !== undefined || enArray !== undefined) && (onTranslateArrayToKm || onTranslateArrayToEn);

  // Compute smart detection state for dual fields
  const hasKm = Boolean(kmText && kmText.trim().length > 0);
  const hasEn = Boolean(enText && enText.trim().length > 0);

  const hasKmArray = Boolean(kmArray && kmArray.length > 0 && kmArray.some(it => it.trim()));
  const hasEnArray = Boolean(enArray && enArray.length > 0 && enArray.some(it => it.trim()));

  // Determine detected translation direction for dual mode
  let dualDirection: 'en_to_km' | 'km_to_en' | 'both_filled' | 'both_empty' = 'both_empty';
  if (isDualFieldMode) {
    if (hasEn && !hasKm) {
      dualDirection = 'en_to_km';
    } else if (hasKm && !hasEn) {
      dualDirection = 'km_to_en';
    } else if (hasEn && hasKm) {
      dualDirection = 'both_filled';
    }
  } else if (isDualArrayMode) {
    if (hasEnArray && !hasKmArray) {
      dualDirection = 'en_to_km';
    } else if (hasKmArray && !hasEnArray) {
      dualDirection = 'km_to_en';
    } else if (hasEnArray && hasKmArray) {
      dualDirection = 'both_filled';
    }
  }

  // Single field detection
  let singleDetectedDirection = 'auto';
  if (!isDualFieldMode && !isDualArrayMode && sourceText) {
    const detected = detectTextLanguage(sourceText);
    singleDetectedDirection = detected === 'km' ? 'km_to_en' : 'en_to_km';
  }

  const handleTranslate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    // CASE 1: Smart Dual-Field Mode
    if (isDualFieldMode) {
      // Condition A: English OK, Khmer Blank -> Translate EN to KM
      if (hasEn && !hasKm && onTranslateToKm) {
        setIsLoading(true);
        try {
          const res = await translateTextField(enText!, 'km', 'en', fieldHint);
          if (res.success && res.translatedText) {
            onTranslateToKm(res.translatedText);
            onTranslatedText?.(res.translatedText);
            setIsDone(true);
            setStatusMessage('Translated to ខ្មែរ!');
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Smart dual translate failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Condition B: Khmer OK, English Blank -> Translate KM to EN
      if (hasKm && !hasEn && onTranslateToEn) {
        setIsLoading(true);
        try {
          const res = await translateTextField(kmText!, 'en', 'km', fieldHint);
          if (res.success && res.translatedText) {
            onTranslateToEn(res.translatedText);
            onTranslatedText?.(res.translatedText);
            setIsDone(true);
            setStatusMessage('Translated to EN!');
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Smart dual translate failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Condition C: Both are filled -> Re-translate or sync
      if (hasKm && hasEn) {
        setIsLoading(true);
        try {
          // If onTranslateToEn is available, refresh English from Khmer
          const res = await translateTextField(kmText!, 'en', 'km', fieldHint);
          if (res.success && res.translatedText && onTranslateToEn) {
            onTranslateToEn(res.translatedText);
            onTranslatedText?.(res.translatedText);
            setIsDone(true);
            setStatusMessage('Synchronized!');
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Re-sync failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }
    }

    // CASE 2: Smart Dual-Array Mode (e.g. Highlights, Inclusions)
    if (isDualArrayMode) {
      if (hasEnArray && !hasKmArray && onTranslateArrayToKm) {
        setIsLoading(true);
        try {
          const res = await translateArrayField(enArray!, 'km', 'en', fieldHint);
          if (res.success && res.translatedItems) {
            onTranslateArrayToKm(res.translatedItems);
            onTranslatedArray?.(res.translatedItems);
            setIsDone(true);
            setStatusMessage('List translated to ខ្មែរ!');
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Dual array translation failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (hasKmArray && !hasEnArray && onTranslateArrayToEn) {
        setIsLoading(true);
        try {
          const res = await translateArrayField(kmArray!, 'en', 'km', fieldHint);
          if (res.success && res.translatedItems) {
            onTranslateArrayToEn(res.translatedItems);
            onTranslatedArray?.(res.translatedItems);
            setIsDone(true);
            setStatusMessage('List translated to EN!');
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Dual array translation failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (hasKmArray && hasEnArray && onTranslateArrayToEn) {
        setIsLoading(true);
        try {
          const res = await translateArrayField(kmArray!, 'en', 'km', fieldHint);
          if (res.success && res.translatedItems) {
            onTranslateArrayToEn(res.translatedItems);
            setIsDone(true);
            setStatusMessage('List re-synced!');
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Dual array re-sync failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }
    }

    // CASE 3: Single Array Translation
    if (sourceArray && onTranslatedArray) {
      if (sourceArray.length === 0) return;
      setIsLoading(true);
      try {
        const res = await translateArrayField(sourceArray, targetLang, sourceLang, fieldHint);
        if (res.success && res.translatedItems) {
          onTranslatedArray(res.translatedItems);
          setIsDone(true);
          setStatusMessage('Translated!');
          setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2000);
        }
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // CASE 4: Single Text Translation with Smart Language Detection
    if (sourceText !== undefined && onTranslatedText) {
      if (!sourceText.trim()) return;
      setIsLoading(true);
      try {
        // Smart auto-detect direction if target or source was auto
        const detected = detectTextLanguage(sourceText);
        let effTarget = targetLang;
        let effSource = sourceLang;

        if (effTarget === 'auto' || !effTarget || effTarget === effSource) {
          effTarget = detected === 'km' ? 'en' : 'km';
        }
        if (effSource === 'auto' || !effSource) {
          effSource = detected;
        }

        const res = await translateTextField(sourceText, effTarget, effSource, fieldHint);
        if (res.success && typeof res.translatedText === 'string') {
          onTranslatedText(res.translatedText);
          setIsDone(true);
          setStatusMessage('Translated!');
          setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2000);
        }
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Determine button label and tooltip
  let dynamicLabel = label;
  let dynamicTooltip = 'Click to auto-translate with AI smart detection';

  if (!label) {
    if (isDualFieldMode) {
      if (dualDirection === 'en_to_km') {
        dynamicLabel = '⚡ Auto-Translate EN ➔ KM (ខ្មែរ)';
        dynamicTooltip = 'English detected! Click to auto-translate into Khmer field';
      } else if (dualDirection === 'km_to_en') {
        dynamicLabel = '⚡ Auto-Translate KM ➔ EN (English)';
        dynamicTooltip = 'Khmer detected! Click to auto-translate into English field';
      } else if (dualDirection === 'both_filled') {
        dynamicLabel = '✨ Smart Sync (EN ⇋ KM)';
        dynamicTooltip = 'Both fields filled. Click to re-synchronize translation';
      } else {
        dynamicLabel = '✨ Smart AI Translate';
        dynamicTooltip = 'Type in either English or Khmer to auto-translate';
      }
    } else if (isDualArrayMode) {
      if (dualDirection === 'en_to_km') {
        dynamicLabel = '⚡ Auto-Translate All EN ➔ KM';
      } else if (dualDirection === 'km_to_en') {
        dynamicLabel = '⚡ Auto-Translate All KM ➔ EN';
      } else {
        dynamicLabel = '✨ Smart Sync All Items';
      }
    } else {
      if (targetLang === 'km') {
        dynamicLabel = 'ខ្មែរ';
        dynamicTooltip = 'Translate into Khmer (ខ្មែរ)';
      } else if (targetLang === 'en') {
        dynamicLabel = 'EN';
        dynamicTooltip = 'Translate into English';
      } else if (singleDetectedDirection === 'km_to_en') {
        dynamicLabel = 'EN';
        dynamicTooltip = 'Khmer detected: Translate into English';
      } else if (singleDetectedDirection === 'en_to_km') {
        dynamicLabel = 'ខ្មែរ';
        dynamicTooltip = 'English detected: Translate into Khmer';
      } else {
        dynamicLabel = '✨ AI Translate';
      }
    }
  }

  const isButtonDisabled = isLoading || (
    isDualFieldMode
      ? (!hasKm && !hasEn)
      : isDualArrayMode
      ? (!hasKmArray && !hasEnArray)
      : (sourceArray ? sourceArray.length === 0 : !sourceText?.trim())
  );

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={isButtonDisabled}
      title={dynamicTooltip}
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg transition-all cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed ${
        size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${
        isDone
          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
          : dualDirection === 'en_to_km' || dualDirection === 'km_to_en'
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/70 dark:to-purple-950/70 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:shadow-xs active:scale-95'
          : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs hover:shadow-xs active:scale-95'
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
          <span>{statusMessage || 'Translated!'}</span>
        </>
      ) : (
        <>
          {dualDirection === 'en_to_km' ? (
            <span className="text-[11px]">🇺🇸➔🇰🇭</span>
          ) : dualDirection === 'km_to_en' ? (
            <span className="text-[11px]">🇰🇭➔🇺🇸</span>
          ) : isDualFieldMode ? (
            <ArrowRightLeft className="w-3 h-3 text-indigo-500" />
          ) : (
            <Sparkles className="w-3 h-3 text-amber-500" />
          )}
          <span>{dynamicLabel}</span>
        </>
      )}
    </button>
  );
};
