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
  preferredDirection?: 'km_to_en' | 'en_to_km' | 'auto';

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
  preferredDirection = 'auto',
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

  const hasKmArray = Boolean(kmArray && kmArray.length > 0 && kmArray.some(it => it && it.trim().length > 0));
  const hasEnArray = Boolean(enArray && enArray.length > 0 && enArray.some(it => it && it.trim().length > 0));

  // Determine detected translation direction for dual mode
  let dualDirection: 'en_to_km' | 'km_to_en' | 'both_filled' | 'both_empty' = 'both_empty';
  if (isDualFieldMode) {
    if (preferredDirection === 'en_to_km' && (hasEn || !hasKm)) {
      dualDirection = 'en_to_km';
    } else if (preferredDirection === 'km_to_en' && (hasKm || !hasEn)) {
      dualDirection = 'km_to_en';
    } else if (hasEn && !hasKm) {
      dualDirection = 'en_to_km';
    } else if (hasKm && !hasEn) {
      dualDirection = 'km_to_en';
    } else if (hasEn && hasKm) {
      dualDirection = preferredDirection === 'en_to_km' ? 'en_to_km' : preferredDirection === 'km_to_en' ? 'km_to_en' : 'both_filled';
    }
  } else if (isDualArrayMode) {
    if (preferredDirection === 'en_to_km' && (hasEnArray || !hasKmArray)) {
      dualDirection = 'en_to_km';
    } else if (preferredDirection === 'km_to_en' && (hasKmArray || !hasEnArray)) {
      dualDirection = 'km_to_en';
    } else if (hasEnArray && !hasKmArray) {
      dualDirection = 'en_to_km';
    } else if (hasKmArray && !hasEnArray) {
      dualDirection = 'km_to_en';
    } else if (hasEnArray && hasKmArray) {
      dualDirection = preferredDirection === 'en_to_km' ? 'en_to_km' : preferredDirection === 'km_to_en' ? 'km_to_en' : 'both_filled';
    }
  }

  // Single field detection
  let singleDetectedDirection = 'auto';
  if (!isDualFieldMode && !isDualArrayMode && sourceText) {
    const detected = detectTextLanguage(sourceText);
    singleDetectedDirection = detected === 'km' ? 'km_to_en' : 'en_to_km';
  }

  const handleTranslate = async (e: React.MouseEvent, forcedDir?: 'km_to_en' | 'en_to_km') => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    const activeDir = forcedDir || (dualDirection !== 'both_filled' && dualDirection !== 'both_empty' ? dualDirection : preferredDirection);

    // CASE 1: Smart Dual-Field Mode
    if (isDualFieldMode) {
      // Direct: EN to KM
      if ((activeDir === 'en_to_km' || (hasEn && !hasKm)) && onTranslateToKm) {
        if (!hasEn) return;
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

      // Direct: KM to EN
      if ((activeDir === 'km_to_en' || (hasKm && !hasEn)) && onTranslateToEn) {
        if (!hasKm) return;
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

      // Condition C: Both are filled -> Default to KM -> EN or EN -> KM
      if (hasKm && hasEn) {
        setIsLoading(true);
        try {
          if (onTranslateToEn && (!onTranslateToKm || activeDir === 'km_to_en')) {
            const res = await translateTextField(kmText!, 'en', 'km', fieldHint);
            if (res.success && res.translatedText) {
              onTranslateToEn(res.translatedText);
              onTranslatedText?.(res.translatedText);
              setIsDone(true);
              setStatusMessage('KM ➔ EN Synced!');
              setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
            }
          } else if (onTranslateToKm) {
            const res = await translateTextField(enText!, 'km', 'en', fieldHint);
            if (res.success && res.translatedText) {
              onTranslateToKm(res.translatedText);
              onTranslatedText?.(res.translatedText);
              setIsDone(true);
              setStatusMessage('EN ➔ KM Synced!');
              setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
            }
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
      if ((activeDir === 'en_to_km' || (hasEnArray && !hasKmArray)) && onTranslateArrayToKm) {
        if (!hasEnArray) return;
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

      if ((activeDir === 'km_to_en' || (hasKmArray && !hasEnArray)) && onTranslateArrayToEn) {
        if (!hasKmArray) return;
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

      if (hasKmArray && hasEnArray) {
        setIsLoading(true);
        try {
          if (activeDir === 'en_to_km' && onTranslateArrayToKm) {
            const res = await translateArrayField(enArray!, 'km', 'en', fieldHint);
            if (res.success && res.translatedItems) {
              onTranslateArrayToKm(res.translatedItems);
              setIsDone(true);
              setStatusMessage('Synced to ខ្មែរ!');
              setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
            }
          } else if (onTranslateArrayToEn) {
            const res = await translateArrayField(kmArray!, 'en', 'km', fieldHint);
            if (res.success && res.translatedItems) {
              onTranslateArrayToEn(res.translatedItems);
              setIsDone(true);
              setStatusMessage('Synced to EN!');
              setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
            }
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

  // If dual array mode has both filled and both callbacks exist, we can show dual quick-sync buttons
  if (isDualArrayMode && hasKmArray && hasEnArray && onTranslateArrayToKm && onTranslateArrayToEn && !label) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={(e) => handleTranslate(e, 'km_to_en')}
          disabled={isLoading}
          title="Translate all Khmer items to English"
          className="inline-flex items-center gap-1 font-bold rounded-lg px-2 py-0.5 text-[10px] bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <span>🇰🇭➔🇺🇸 All to EN</span>}
        </button>
        <button
          type="button"
          onClick={(e) => handleTranslate(e, 'en_to_km')}
          disabled={isLoading}
          title="Translate all English items to Khmer"
          className="inline-flex items-center gap-1 font-bold rounded-lg px-2 py-0.5 text-[10px] bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <span>🇺🇸➔🇰🇭 All to KM</span>}
        </button>
      </div>
    );
  }

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
        dynamicLabel = preferredDirection === 'en_to_km' ? '⚡ Sync EN ➔ KM' : preferredDirection === 'km_to_en' ? '⚡ Sync KM ➔ EN' : '✨ Smart Sync (EN ⇋ KM)';
        dynamicTooltip = 'Click to re-synchronize translation between fields';
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
      onClick={(e) => handleTranslate(e)}
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
