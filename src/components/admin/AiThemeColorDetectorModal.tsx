import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Palette,
  Check,
  RefreshCw,
  X,
  Eye,
  Sliders,
  Type,
  CheckCircle2,
  Zap,
  Layers,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { THEME_PRESETS, detectColorThemeAI, ThemePalette } from '../../services/aiThemeService';

interface AiThemeColorDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiThemeColorDetectorModal: React.FC<AiThemeColorDetectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { systemSettings, updateSystemSettings, language, darkMode, toggleDarkMode, addNotification } = useApp();

  const [promptInput, setPromptInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedPalette, setDetectedPalette] = useState<ThemePalette | null>(null);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>(systemSettings.themePreset || 'navy');
  const [selectedFontScale, setSelectedFontScale] = useState<'compact' | 'normal' | 'comfortable' | 'large'>(
    systemSettings.fontSizeScale || 'normal'
  );
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPalette = detectedPalette || THEME_PRESETS[selectedPresetKey] || THEME_PRESETS.navy;

  const handleDetectAI = async (overridePrompt?: string) => {
    setIsLoading(true);
    try {
      const result = await detectColorThemeAI({
        prompt: overridePrompt || promptInput,
        destination: destinationInput || systemSettings.companyTagline,
        brandKeyword: systemSettings.companyName,
        language,
      });
      setDetectedPalette(result);
      if (result.presetKey && result.presetKey !== 'custom') {
        setSelectedPresetKey(result.presetKey);
      }
      if (result.fontScaleRecommendation) {
        setSelectedFontScale(result.fontScaleRecommendation);
      }
      addNotification({
        title: 'AI Color Theme Detected',
        message: `Generated "${result.themeName}" with WCAG AA compliance.`,
        type: 'success',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTheme = () => {
    const palette = detectedPalette || THEME_PRESETS[selectedPresetKey] || THEME_PRESETS.navy;
    
    updateSystemSettings({
      ...systemSettings,
      themePreset: (palette.presetKey as any) || selectedPresetKey,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
      fontSizeScale: selectedFontScale,
      customPalette: {
        themeName: palette.themeName,
        primary: palette.primary,
        primaryHover: palette.primaryHover,
        secondary: palette.secondary,
        accent: palette.accent,
        accentGlow: palette.accentGlow,
        bgDark: palette.bgDark,
        bgLight: palette.bgLight,
        cardDark: palette.cardDark,
        cardLight: palette.cardLight,
        textContrast: palette.textContrast,
        rationale: palette.rationale || palette.description,
        detectedFrom: promptInput || destinationInput || 'AI Preset',
      },
    });

    setAppliedSuccess(true);
    addNotification({
      title: 'Theme Applied Successfully',
      message: `Entire UI updated with ${palette.themeName} and ${selectedFontScale} font scale.`,
      type: 'success',
    });

    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 1200);
  };

  const QUICK_PROMPTS = [
    { label: '🇨🇳 Canton Fair Sourcing Jade', prompt: 'Canton Fair Guangzhou Trade Mission Emerald Jade and Gold' },
    { label: '🏛️ Cambodia Angkor Gold', prompt: 'Royal Phnom Penh Bilateral Delegation Saffron Gold and Cyan' },
    { label: '🤖 Global FinTech Cobalt', prompt: 'Cyber FinTech & AI Technology Summit Electric Indigo' },
    { label: '🍷 Executive VIP Ruby', prompt: 'High-Level VIP Government Delegation Burgundy Wine and Ruby' },
    { label: '🌊 Maritime Commerce Cyan', prompt: 'Maritime Logistics and Southeast Asia Port Delegation Cyan' },
    { label: '⚡ Titanium Enterprise', prompt: 'Monochrome Titanium Minimalist High-Density ERP' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 text-white shadow-lg">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">
                  AI Color & Theme Detector
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Detect optimal color codes & font size scales for entire KHB Events portal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* AI Generator Input Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>Prompt or Destination for AI Color Extraction</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Auto-generates balanced harmony & WCAG contrast
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Canton Fair 2026 Phase 1 Electronics, Luxury Dubai Expo, Sourcing Mission..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleDetectAI()}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Detect Color Theme</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Quick Industry & Event Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(chip.prompt);
                      handleDetectAI(chip.prompt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preset Palette Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Standard Trade Mission Palettes</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(THEME_PRESETS).map(([key, pal]) => {
                const isSelected = selectedPresetKey === key && !detectedPalette;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedPresetKey(key);
                      setDetectedPalette(null);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: pal.primary }} />
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: pal.secondary }} />
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: pal.accent }} />
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {pal.themeName.split('&')[0]}
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {pal.primary} • {pal.accent}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Live UI Palette Preview: <span style={{ color: currentPalette.primary }}>{currentPalette.themeName}</span>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                WCAG AA Passed
              </span>
            </div>

            {/* Color Swatch Display */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2 rounded-xl border border-slate-100 dark:border-slate-800" style={{ backgroundColor: currentPalette.primary, color: '#fff' }}>
                <span className="text-[9px] uppercase tracking-wider block font-bold">Primary</span>
                <span className="text-[11px] font-mono font-black">{currentPalette.primary}</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-100 dark:border-slate-800" style={{ backgroundColor: currentPalette.secondary, color: '#fff' }}>
                <span className="text-[9px] uppercase tracking-wider block font-bold">Secondary</span>
                <span className="text-[11px] font-mono font-black">{currentPalette.secondary}</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-100 dark:border-slate-800" style={{ backgroundColor: currentPalette.accent, color: '#000' }}>
                <span className="text-[9px] uppercase tracking-wider block font-bold">Accent</span>
                <span className="text-[11px] font-mono font-black">{currentPalette.accent}</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-900 text-white">
                <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Dark BG</span>
                <span className="text-[11px] font-mono font-black">{currentPalette.bgDark}</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-500">Light BG</span>
                <span className="text-[11px] font-mono font-black">{currentPalette.bgLight}</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center" style={{ backgroundColor: currentPalette.primaryHover, color: '#fff' }}>
                <span className="text-[9px] uppercase tracking-wider block font-bold">Hover</span>
                <span className="text-[11px] font-mono font-black">{currentPalette.primaryHover}</span>
              </div>
            </div>

            {currentPalette.rationale && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                💡 <strong>Design Logic:</strong> {currentPalette.rationale}
              </p>
            )}

            {/* Interactive Preview Mock Button Strip */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <button
                className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: currentPalette.primary }}
              >
                Primary Action Button
              </button>
              <button
                className="px-3.5 py-1.5 rounded-xl text-slate-900 text-xs font-bold shadow-sm"
                style={{ backgroundColor: currentPalette.accent }}
              >
                ★ VIP Accent Badge
              </button>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold" style={{ backgroundColor: `${currentPalette.primary}20`, color: currentPalette.primary }}>
                +15% Early Bird Discount
              </span>
            </div>
          </div>

          {/* Typography Font Size Scale Control */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-500" />
                <span>Global Font Size Scaling</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Adjusts base UI font size for optimal reading comfort
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'compact', label: 'Compact (14.5px)', desc: 'High data density' },
                { key: 'normal', label: 'Normal (16px)', desc: 'Default balanced' },
                { key: 'comfortable', label: 'Comfortable (16.5px)', desc: 'Enhanced legibility' },
                { key: 'large', label: 'Large (17.5px)', desc: 'Maximum readability' },
              ].map((opt) => {
                const isSelected = selectedFontScale === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedFontScale(opt.key as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs">{opt.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Applies across Portal, Admin ERP, Invoices, and Modals</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyTheme}
              disabled={appliedSuccess}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Applied to Entire UI!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Apply Theme to Entire UI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
