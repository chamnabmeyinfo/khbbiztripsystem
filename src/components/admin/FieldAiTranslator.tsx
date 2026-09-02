import React, { useState } from 'react';
import { Sparkles, Loader2, Check, ArrowRightLeft, Languages, ChevronDown, Cpu } from 'lucide-react';
import {
  translateTextField,
  translateArrayField,
  detectTextLanguage,
  smartTranslateFieldPair,
  matchesTargetScript,
  getActiveTranslationModel,
  setActiveTranslationModel,
  getActiveAiTranslationConfig,
  getActiveTranslationProviderLabel,
  TRANSLATION_MODEL_OPTIONS,
  shortModelLabel
} from '../../services/geminiService';

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
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(() => getActiveTranslationModel());

  // Active provider & model catalog for the dropdown
  const activeProvider = getActiveAiTranslationConfig()?.provider || 'gemini';
  const providerLabel = getActiveTranslationProviderLabel();
  const modelOptions = TRANSLATION_MODEL_OPTIONS[activeProvider] || [];

  const handleSelectModel = (modelId: string) => {
    setActiveTranslationModel(modelId);
    setSelectedModel(modelId);
    setIsModelMenuOpen(false);
  };

  // Dropdown allowing the user to choose which AI model performs the translation
  const renderModelPicker = () => (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModelMenuOpen(v => !v);
        }}
        title={`Translation model: ${selectedModel ? shortModelLabel(selectedModel) : 'Auto (Server Default)'} — click to change`}
        className="inline-flex items-center justify-center w-5 h-[18px] rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 shadow-2xs active:scale-95 cursor-pointer"
      >
        <ChevronDown className="w-3 h-3" />
      </button>
      {isModelMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModelMenuOpen(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-1.5 text-left">
            <div className="px-2 py-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Translation Model</span>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {providerLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectModel('');
              }}
              className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-left cursor-pointer ${!selectedModel ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''}`}
            >
              <span className="mt-0.5 w-3 shrink-0">{!selectedModel ? <Check className="w-3 h-3 text-emerald-500" /> : null}</span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">⚡ Auto (Server Default)</span>
                <span className="block text-[9px] text-slate-400 dark:text-slate-500">Automatic best-model cascade</span>
              </span>
            </button>
            {modelOptions.map(m => (
              <button
                type="button"
                key={m.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectModel(m.id);
                }}
                className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-left cursor-pointer ${selectedModel === m.id ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''}`}
              >
                <span className="mt-0.5 w-3 shrink-0">{selectedModel === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : null}</span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">{m.label}</span>
                  {m.description && <span className="block text-[9px] text-slate-400 dark:text-slate-500">{m.description}</span>}
                  <span className="block text-[9px] font-mono text-slate-400 dark:text-slate-500 truncate">{m.id}</span>
                </span>
              </button>
            ))}
            {modelOptions.length === 0 && (
              <div className="px-2 py-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                Uses the model configured in Admin → Settings → AI Provider.
              </div>
            )}
            {selectedModel && (
              <div className="px-2 py-1.5 mt-0.5 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 dark:text-slate-500">
                Current: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{selectedModel}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Builds a success status message that includes which model performed the translation
  const buildDoneMessage = (base: string, modelUsed?: string): string =>
    modelUsed ? `${base} · ${shortModelLabel(modelUsed)}` : base;

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
    if (preferredDirection === 'en_to_km') {
      dualDirection = 'en_to_km';
    } else if (preferredDirection === 'km_to_en') {
      dualDirection = 'km_to_en';
    } else if (hasEn && !hasKm) {
      dualDirection = 'en_to_km';
    } else if (hasKm && !hasEn) {
      dualDirection = 'km_to_en';
    } else if (hasEn && hasKm) {
      dualDirection = 'both_filled';
    }
  } else if (isDualArrayMode) {
    if (preferredDirection === 'en_to_km') {
      dualDirection = 'en_to_km';
    } else if (preferredDirection === 'km_to_en') {
      dualDirection = 'km_to_en';
    } else if (hasEnArray && !hasKmArray) {
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

  const handleTranslate = async (e: React.MouseEvent, forcedDir?: 'km_to_en' | 'en_to_km') => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    const activeDir = forcedDir || (dualDirection !== 'both_filled' && dualDirection !== 'both_empty' ? dualDirection : preferredDirection !== 'auto' ? preferredDirection : (hasKm ? 'km_to_en' : 'en_to_km'));

    // CASE 1: Smart Dual-Field Mode
    if (isDualFieldMode) {
      // Direct: KM to EN (Khmer -> English)
      if (activeDir === 'km_to_en' && onTranslateToEn) {
        const textToTranslate = (kmText && kmText.trim()) || (enText && enText.trim()) || '';
        if (!textToTranslate) return;
        setIsLoading(true);
        try {
          const res = await translateTextField(textToTranslate, 'en', 'km', fieldHint);
          if (res.success && res.translatedText && matchesTargetScript(res.translatedText, 'en')) {
            onTranslateToEn(res.translatedText);
            onTranslatedText?.(res.translatedText);
            setIsDone(true);
            setStatusMessage(buildDoneMessage('Translated to EN (🇺🇸)!', res.modelUsed));
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Smart dual translate to EN failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Direct: EN to KM (English -> Khmer)
      if (activeDir === 'en_to_km' && onTranslateToKm) {
        const textToTranslate = (enText && enText.trim()) || (kmText && kmText.trim()) || '';
        if (!textToTranslate) return;
        setIsLoading(true);
        try {
          const res = await translateTextField(textToTranslate, 'km', 'en', fieldHint);
          if (res.success && res.translatedText && matchesTargetScript(res.translatedText, 'km')) {
            onTranslateToKm(res.translatedText);
            onTranslatedText?.(res.translatedText);
            setIsDone(true);
            setStatusMessage(buildDoneMessage('Translated to ខ្មែរ (🇰🇭)!', res.modelUsed));
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Smart dual translate to KM failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Fallback: If both filled and no forced dir, check text script
      if (hasKm && onTranslateToEn) {
        setIsLoading(true);
        try {
          const res = await translateTextField(kmText!, 'en', 'km', fieldHint);
          if (res.success && res.translatedText && matchesTargetScript(res.translatedText, 'en')) {
            onTranslateToEn(res.translatedText);
            onTranslatedText?.(res.translatedText);
            setIsDone(true);
            setStatusMessage(buildDoneMessage('KM ➔ EN Synced!', res.modelUsed));
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
      if (activeDir === 'km_to_en' && onTranslateArrayToEn) {
        const itemsToTranslate = (hasKmArray && kmArray) || (hasEnArray && enArray) || [];
        if (!itemsToTranslate.length) return;
        setIsLoading(true);
        try {
          const res = await translateArrayField(itemsToTranslate, 'en', 'km', fieldHint);
          if (res.success && res.translatedItems) {
            // Per-item script validation: untranslated/echo items become empty instead of leaking
            const validated = res.translatedItems.map(it => (it && matchesTargetScript(it, 'en')) ? it : '');
            onTranslateArrayToEn(validated);
            onTranslatedArray?.(validated);
            setIsDone(true);
            setStatusMessage(buildDoneMessage('List translated to EN!', res.modelUsed));
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Dual array translation failed:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (activeDir === 'en_to_km' && onTranslateArrayToKm) {
        const itemsToTranslate = (hasEnArray && enArray) || (hasKmArray && kmArray) || [];
        if (!itemsToTranslate.length) return;
        setIsLoading(true);
        try {
          const res = await translateArrayField(itemsToTranslate, 'km', 'en', fieldHint);
          if (res.success && res.translatedItems) {
            // Per-item script validation: untranslated/echo items become empty instead of leaking
            const validated = res.translatedItems.map(it => (it && matchesTargetScript(it, 'km')) ? it : '');
            onTranslateArrayToKm(validated);
            onTranslatedArray?.(validated);
            setIsDone(true);
            setStatusMessage(buildDoneMessage('List translated to ខ្មែរ!', res.modelUsed));
            setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2200);
          }
        } catch (err) {
          console.error('Dual array translation failed:', err);
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
          setStatusMessage(buildDoneMessage('Translated!', res.modelUsed));
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
        if (res.success && res.translatedText && matchesTargetScript(res.translatedText, effTarget)) {
          onTranslatedText(res.translatedText);
          setIsDone(true);
          setStatusMessage(buildDoneMessage('Translated!', res.modelUsed));
          setTimeout(() => { setIsDone(false); setStatusMessage(''); }, 2000);
        }
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // If dual field mode has both filled and no custom label, show dual directional quick-sync buttons
  if (isDualFieldMode && hasKm && hasEn && onTranslateToKm && onTranslateToEn && preferredDirection === 'auto' && !label) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={(e) => handleTranslate(e, 'km_to_en')}
          disabled={isLoading}
          title="Translate Khmer field into English (🇰🇭 ➔ 🇺🇸)"
          className="inline-flex items-center gap-1 font-bold rounded-lg px-2 py-0.5 text-[10px] bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <span>🇰🇭➔🇺🇸 To EN</span>}
        </button>
        <button
          type="button"
          onClick={(e) => handleTranslate(e, 'en_to_km')}
          disabled={isLoading}
          title="Translate English field into Khmer (🇺🇸 ➔ 🇰🇭)"
          className="inline-flex items-center gap-1 font-bold rounded-lg px-2 py-0.5 text-[10px] bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <span>🇺🇸➔🇰🇭 To KM</span>}
        </button>
        {renderModelPicker()}
      </div>
    );
  }

  // If dual array mode has both filled and both callbacks exist, show dual quick-sync buttons
  if (isDualArrayMode && hasKmArray && hasEnArray && onTranslateArrayToKm && onTranslateArrayToEn && preferredDirection === 'auto' && !label) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={(e) => handleTranslate(e, 'km_to_en')}
          disabled={isLoading}
          title="Translate all Khmer items to English (🇰🇭 ➔ 🇺🇸)"
          className="inline-flex items-center gap-1 font-bold rounded-lg px-2 py-0.5 text-[10px] bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <span>🇰🇭➔🇺🇸 All to EN</span>}
        </button>
        <button
          type="button"
          onClick={(e) => handleTranslate(e, 'en_to_km')}
          disabled={isLoading}
          title="Translate all English items to Khmer (🇺🇸 ➔ 🇰🇭)"
          className="inline-flex items-center gap-1 font-bold rounded-lg px-2 py-0.5 text-[10px] bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <span>🇺🇸➔🇰🇭 All to KM</span>}
        </button>
        {renderModelPicker()}
      </div>
    );
  }

  // Determine button label and tooltip
  let dynamicLabel = label;
  let dynamicTooltip = 'Click to auto-translate with AI smart detection';

  if (!label) {
    if (isDualFieldMode) {
      if (preferredDirection === 'km_to_en' || (hasKm && !hasEn)) {
        dynamicLabel = '⚡ Translate 🇰🇭 KM ➔ 🇺🇸 EN';
        dynamicTooltip = 'Khmer detected! Click to auto-translate into English field';
      } else if (preferredDirection === 'en_to_km' || (hasEn && !hasKm)) {
        dynamicLabel = '⚡ Translate 🇺🇸 EN ➔ 🇰🇭 KM';
        dynamicTooltip = 'English detected! Click to auto-translate into Khmer field';
      } else if (dualDirection === 'both_filled') {
        dynamicLabel = '⚡ Sync 🇰🇭 KM ⇄ 🇺🇸 EN';
        dynamicTooltip = 'Click to re-synchronize translation between fields';
      } else {
        dynamicLabel = '✨ AI Translate (🇰🇭 ⇄ 🇺🇸)';
        dynamicTooltip = 'Type in either English or Khmer to auto-translate';
      }
    } else if (isDualArrayMode) {
      if (preferredDirection === 'km_to_en' || (hasKmArray && !hasEnArray)) {
        dynamicLabel = '⚡ Translate All 🇰🇭 KM ➔ 🇺🇸 EN';
      } else if (preferredDirection === 'en_to_km' || (hasEnArray && !hasKmArray)) {
        dynamicLabel = '⚡ Translate All 🇺🇸 EN ➔ 🇰🇭 KM';
      } else {
        dynamicLabel = '✨ AI Sync All (🇰🇭 ⇄ 🇺🇸)';
      }
    } else {
      if (targetLang === 'km') {
        dynamicLabel = '🇰🇭 KM';
        dynamicTooltip = 'Translate into Khmer (ខ្មែរ)';
      } else if (targetLang === 'en') {
        dynamicLabel = '🇺🇸 EN';
        dynamicTooltip = 'Translate into English';
      } else if (singleDetectedDirection === 'km_to_en') {
        dynamicLabel = '🇺🇸 EN';
        dynamicTooltip = 'Khmer detected: Translate into English';
      } else if (singleDetectedDirection === 'en_to_km') {
        dynamicLabel = '🇰🇭 KM';
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
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
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
            : dualDirection === 'en_to_km' || preferredDirection === 'en_to_km'
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/70 dark:to-indigo-950/70 hover:from-purple-100 hover:to-indigo-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs hover:shadow-xs active:scale-95'
            : 'bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/70 dark:to-sky-950/70 hover:from-indigo-100 hover:to-sky-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:shadow-xs active:scale-95'
        }`}
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
            {preferredDirection === 'en_to_km' || (hasEn && !hasKm && preferredDirection === 'auto') ? (
              <span className="text-[11px]">🇺🇸➔🇰🇭</span>
            ) : preferredDirection === 'km_to_en' || (hasKm && !hasEn && preferredDirection === 'auto') ? (
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
      {renderModelPicker()}
    </div>
  );
};
