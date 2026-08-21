import { SystemSettings } from '../types';

export interface ThemePalette {
  themeName: string;
  presetKey: 'navy' | 'emerald' | 'crimson' | 'indigo' | 'amber' | 'cyan' | 'slate' | 'custom';
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  accentGlow: string;
  bgDark: string;
  bgLight: string;
  cardDark: string;
  cardLight: string;
  textContrast: string;
  description: string;
  rationale?: string;
  fontScaleRecommendation?: 'compact' | 'normal' | 'comfortable' | 'large' | 'extra-large';
}

export const THEME_PRESETS: Record<string, ThemePalette> = {
  navy: {
    themeName: 'Diplomatic Navy & Oceanic Azure (Default)',
    presetKey: 'navy',
    primary: '#0284c7', // Sky 600
    primaryHover: '#0369a1', // Sky 700
    secondary: '#0f172a', // Slate 900
    accent: '#f59e0b', // Amber 500
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    bgDark: '#0b1120',
    bgLight: '#f8fafc',
    cardDark: '#0f172a',
    cardLight: '#ffffff',
    textContrast: '#ffffff',
    description: 'Official corporate international delegation theme with high-contrast sky blue and royal amber accents.',
  },
  emerald: {
    themeName: 'Canton Fair & Sourcing Jade Emerald',
    presetKey: 'emerald',
    primary: '#059669', // Emerald 600
    primaryHover: '#047857', // Emerald 700
    secondary: '#064e3b', // Emerald 900
    accent: '#fbbf24', // Amber 400
    accentGlow: 'rgba(251, 191, 36, 0.25)',
    bgDark: '#022c22',
    bgLight: '#f0fdf4',
    cardDark: '#064e3b',
    cardLight: '#ffffff',
    textContrast: '#ffffff',
    description: 'Vibrant trade mission theme optimized for Guangzhou, manufacturing hubs, and agricultural expos.',
  },
  crimson: {
    themeName: 'Executive Crimson & Luxury Ruby',
    presetKey: 'crimson',
    primary: '#be123c', // Rose 700
    primaryHover: '#9f1239', // Rose 800
    secondary: '#31102b',
    accent: '#f59e0b', // Amber 500
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    bgDark: '#1c0a18',
    bgLight: '#fff1f2',
    cardDark: '#2d0f28',
    cardLight: '#ffffff',
    textContrast: '#ffffff',
    description: 'High-prestige VIP delegation styling with deep burgundy framing and warm gold badges.',
  },
  indigo: {
    themeName: 'Cyber FinTech & Global Tech Cobalt',
    presetKey: 'indigo',
    primary: '#4f46e5', // Indigo 600
    primaryHover: '#4338ca', // Indigo 700
    secondary: '#1e1b4b', // Indigo 950
    accent: '#10b981', // Emerald 500
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    bgDark: '#0c0a2a',
    bgLight: '#eef2ff',
    cardDark: '#1e1b4b',
    cardLight: '#ffffff',
    textContrast: '#ffffff',
    description: 'Modern technology summit and digital innovation trade mission aesthetic with vivid indigo accents.',
  },
  amber: {
    themeName: 'Royal Phnom Penh Heritage & Imperial Saffron',
    presetKey: 'amber',
    primary: '#d97706', // Amber 600
    primaryHover: '#b45309', // Amber 700
    secondary: '#1c1917', // Stone 900
    accent: '#06b6d4', // Cyan 500
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    bgDark: '#141210',
    bgLight: '#fffbeb',
    cardDark: '#1f1a16',
    cardLight: '#ffffff',
    textContrast: '#ffffff',
    description: 'Inspired by Cambodian national hospitality, Khmer Angkor heritage gold, and bilateral summits.',
  },
  cyan: {
    themeName: 'Tokyo Midnight & Maritime Commerce Cyan',
    presetKey: 'cyan',
    primary: '#0891b2', // Cyan 600
    primaryHover: '#0e7490', // Cyan 700
    secondary: '#082f49', // Sky 950
    accent: '#f43f5e', // Rose 500
    accentGlow: 'rgba(244, 63, 94, 0.25)',
    bgDark: '#041826',
    bgLight: '#ecfeff',
    cardDark: '#0c283c',
    cardLight: '#ffffff',
    textContrast: '#ffffff',
    description: 'Fresh maritime and logistics delegation styling with electric cyan and contrast ruby badges.',
  },
  slate: {
    themeName: 'Monochrome Executive Titanium Slate',
    presetKey: 'slate',
    primary: '#475569', // Slate 600
    primaryHover: '#334155', // Slate 700
    secondary: '#090d16',
    accent: '#38bdf8', // Sky 400
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    bgDark: '#020617',
    bgLight: '#f1f5f9',
    cardDark: '#0f172a',
    cardLight: '#ffffff',
    textContrast: '#ffffff',
    description: 'Ultra-clean minimalist executive titanium palette designed for high-density enterprise data views.',
  }
};

export interface FontOption {
  key: string;
  label: string;
  category: string;
  fontStack: string;
  sampleText?: string;
}

export const FONT_LATIN_OPTIONS: FontOption[] = [
  { key: 'plus-jakarta', label: 'Plus Jakarta Sans', category: 'Modern Geometric (Default)', fontStack: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", sampleText: 'Official Trade Delegation' },
  { key: 'inter', label: 'Inter', category: 'Clean Neutral Enterprise', fontStack: "'Inter', system-ui, -apple-system, sans-serif", sampleText: 'Global B2B Commerce' },
  { key: 'outfit', label: 'Outfit', category: 'Contemporary Tech Display', fontStack: "'Outfit', system-ui, -apple-system, sans-serif", sampleText: 'Executive Summit 2026' },
  { key: 'poppins', label: 'Poppins', category: 'Friendly Geometric', fontStack: "'Poppins', system-ui, -apple-system, sans-serif", sampleText: 'VIP Travel & Agendas' },
  { key: 'dm-sans', label: 'DM Sans', category: 'Boutique B2B Agency', fontStack: "'DM Sans', system-ui, -apple-system, sans-serif", sampleText: 'Bilateral Matching Hub' },
  { key: 'playfair', label: 'Playfair Display', category: 'Luxury Editorial Serif', fontStack: "'Playfair Display', Georgia, serif", sampleText: 'Diplomatic Mission Portfolio' },
  { key: 'merriweather', label: 'Merriweather', category: 'Refined Business Serif', fontStack: "'Merriweather', Georgia, serif", sampleText: 'Corporate Governance' },
  { key: 'jetbrains-mono', label: 'JetBrains Mono', category: 'High-Tech Financial Data', fontStack: "'JetBrains Mono', monospace", sampleText: 'USD $3,500.00 / PAX' },
  { key: 'system', label: 'System Native UI', category: 'Apple / Windows OS', fontStack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', sampleText: 'System Operating Baseline' },
];

export const FONT_KHMER_OPTIONS: FontOption[] = [
  { key: 'kantumruy-pro', label: 'Kantumruy Pro (កន្ទុំរុយ ប្រូ)', category: 'Modern Clean Sans (Default)', fontStack: "'Kantumruy Pro', 'Hanuman', 'Battambang', system-ui, sans-serif", sampleText: 'បេសកកម្មពាណិជ្ជកម្មកម្ពុជា' },
  { key: 'hanuman', label: 'Hanuman (ហនុមាន)', category: 'Traditional Elegant Serif', fontStack: "'Hanuman', 'Battambang', system-ui, sans-serif", sampleText: 'ប្រតិភូធុរកិច្ចអន្តរជាតិ' },
  { key: 'battambang', label: 'Battambang (បាត់ដំបង)', category: 'Bold Display Sans', fontStack: "'Battambang', 'Hanuman', system-ui, sans-serif", sampleText: 'ពិព័រណ៍ពាណិជ្ជកម្មក្វាងចូវ' },
  { key: 'koulen', label: 'Koulen (គូលែន)', category: 'Angkorian Display Header', fontStack: "'Koulen', 'Battambang', system-ui, sans-serif", sampleText: 'កម្ពុជា-ចិន សម្ព័ន្ធភាព' },
  { key: 'siemreap', label: 'Siemreap (សៀមរាប)', category: 'Classic High Legibility', fontStack: "'Siemreap', 'Hanuman', system-ui, sans-serif", sampleText: 'ដំណើរកម្សាន្តធុរកិច្ច VIP' },
];

export const FONT_HEADING_OPTIONS: FontOption[] = [
  { key: 'inherit', label: 'Match Body Font (Default)', category: 'Unified Font Stack', fontStack: 'inherit', sampleText: 'Trade Delegation Agenda' },
  { key: 'playfair', label: 'Playfair Display', category: 'Luxury Editorial Serif', fontStack: "'Playfair Display', Georgia, serif", sampleText: 'Diplomatic Summit 2026' },
  { key: 'cinzel', label: 'Cinzel', category: 'Imperial Diplomatic Serif', fontStack: "'Cinzel', Georgia, serif", sampleText: 'MINISTERIAL TRADE EXPEDITION' },
  { key: 'outfit', label: 'Outfit', category: 'Modern Display Sans', fontStack: "'Outfit', sans-serif", sampleText: 'Global Sourcing & Supply' },
  { key: 'plus-jakarta', label: 'Plus Jakarta Sans', category: 'High-Tech Corporate', fontStack: "'Plus Jakarta Sans', sans-serif", sampleText: 'Enterprise Logistics Rail' },
  { key: 'poppins', label: 'Poppins', category: 'Bold Rounded Modern', fontStack: "'Poppins', sans-serif", sampleText: 'Bilateral Matching Hub' },
  { key: 'jetbrains-mono', label: 'JetBrains Mono', category: 'Monospace Financial & Code', fontStack: "'JetBrains Mono', monospace", sampleText: 'PORTAL_TERMINAL_2026' },
];

/**
 * Calculates relative luminance and optimal anti-blend high-contrast text color (WCAG 2.1)
 */
export function hexToRgb(hex?: string): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 3) {
    return {
      r: parseInt(sanitized[0] + sanitized[0], 16),
      g: parseInt(sanitized[1] + sanitized[1], 16),
      b: parseInt(sanitized[2] + sanitized[2], 16),
    };
  }
  if (sanitized.length === 6) {
    return {
      r: parseInt(sanitized.substring(0, 2), 16),
      g: parseInt(sanitized.substring(2, 4), 16),
      b: parseInt(sanitized.substring(4, 6), 16),
    };
  }
  return null;
}

export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Returns non-blending high-contrast text color (#ffffff or #0f172a) for any background color
 */
export function getContrastTextColor(hexColor?: string, darkText = '#0f172a', lightText = '#ffffff'): string {
  if (!hexColor) return lightText;
  const rgb = hexToRgb(hexColor);
  if (!rgb) return lightText;
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.45 ? darkText : lightText;
}

export function isColorDark(hexColor?: string): boolean {
  if (!hexColor) return true;
  const rgb = hexToRgb(hexColor);
  if (!rgb) return true;
  return getLuminance(rgb.r, rgb.g, rgb.b) <= 0.45;
}

/**
 * Generates guaranteed high-contrast styling for badge shapes, tag pills, and colored buttons
 */
export function getOptimalBadgeStyle(bgHex?: string, isDark = false): {
  bg: string;
  text: string;
  border: string;
  badgeGlow: string;
} {
  const safeBg = bgHex || '#0284c7';
  const isBgDark = isColorDark(safeBg);
  const text = isBgDark ? '#ffffff' : '#0f172a';
  const border = isBgDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.15)';
  const badgeGlow = isBgDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.05)';

  return {
    bg: safeBg,
    text,
    border,
    badgeGlow,
  };
}

/**
 * Resolves full active color theme palette with fallbacks
 */
export function getThemeColors(settings?: SystemSettings): ThemePalette {
  if (!settings) return THEME_PRESETS.navy;
  const presetKey = settings.themePreset || 'navy';
  const base = THEME_PRESETS[presetKey] || THEME_PRESETS.navy;
  const custom = settings.customPalette;

  const primary = settings.primaryColor || custom?.primary || base.primary;
  const secondary = settings.secondaryColor || custom?.secondary || base.secondary;
  const accent = settings.accentColor || custom?.accent || base.accent;

  const textContrast = getContrastTextColor(primary, '#0f172a', '#ffffff');

  return {
    themeName: custom?.themeName || base.themeName,
    presetKey: (settings.themePreset as any) || 'navy',
    primary,
    primaryHover: custom?.primaryHover || base.primaryHover,
    secondary,
    accent,
    accentGlow: custom?.accentGlow || base.accentGlow,
    bgDark: custom?.bgDark || base.bgDark,
    bgLight: custom?.bgLight || base.bgLight,
    cardDark: custom?.cardDark || base.cardDark,
    cardLight: custom?.cardLight || base.cardLight,
    textContrast: custom?.textContrast || textContrast,
    description: custom?.rationale || base.description,
    rationale: custom?.rationale || base.rationale,
    fontScaleRecommendation: settings.fontSizeScale || base.fontScaleRecommendation || 'normal'
  };
}

/**
 * Resolves complete typography parameters, alignment, spacing, padding, and CSS font stacks
 */
export function getTypographySettings(settings?: SystemSettings) {
  const latinOption = FONT_LATIN_OPTIONS.find(f => f.key === settings?.fontFamilyLatin) || FONT_LATIN_OPTIONS[0];
  const khmerOption = FONT_KHMER_OPTIONS.find(f => f.key === settings?.fontFamilyKhmer) || FONT_KHMER_OPTIONS[0];
  const headingOption = FONT_HEADING_OPTIONS.find(f => f.key === settings?.fontFamilyHeading) || FONT_HEADING_OPTIONS[0];

  const letterSpacingMap: Record<string, string> = {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    widest: '0.05em',
  };

  const headingLetterSpacingMap: Record<string, string> = {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.05em',
    widest: '0.1em',
  };

  const lineHeightMap: Record<string, string> = {
    snug: '1.4',
    normal: '1.55',
    relaxed: '1.7',
    loose: '1.9',
  };

  const fontWeightMap: Record<string, number> = {
    normal: 400,
    semibold: 600,
    bold: 700,
    black: 900,
  };

  const paragraphSpacingMap: Record<string, string> = {
    compact: '0.5rem',
    normal: '0.875rem',
    relaxed: '1.25rem',
    loose: '1.75rem',
  };

  const contentPaddingMap: Record<string, string> = {
    compact: '0.75rem',
    normal: '1.25rem',
    spacious: '1.75rem',
    generous: '2.25rem',
  };

  const borderRadiusMap: Record<string, string> = {
    none: '0px',
    subtle: '8px',
    rounded: '16px',
    pill: '24px',
  };

  const cardBorderWidthMap: Record<string, string> = {
    none: '0px',
    thin: '1px',
    medium: '2px',
  };

  return {
    fontFamilyLatin: settings?.fontFamilyLatin || 'plus-jakarta',
    fontFamilyKhmer: settings?.fontFamilyKhmer || 'kantumruy-pro',
    fontFamilyHeading: settings?.fontFamilyHeading || 'inherit',
    headingFontWeight: settings?.headingFontWeight || 'bold',
    headingFontWeightNum: fontWeightMap[settings?.headingFontWeight || 'bold'] || 700,
    fontLineHeight: settings?.fontLineHeight || 'normal',
    lineHeightCss: lineHeightMap[settings?.fontLineHeight || 'normal'] || '1.55',
    fontLetterSpacing: settings?.fontLetterSpacing || 'normal',
    letterSpacingCss: letterSpacingMap[settings?.fontLetterSpacing || 'normal'] || '0em',
    headingLetterSpacing: settings?.headingLetterSpacing || 'normal',
    headingLetterSpacingCss: headingLetterSpacingMap[settings?.headingLetterSpacing || 'normal'] || '0em',
    headingTransform: settings?.headingTransform || 'none',
    textAlign: settings?.textAlign || 'left',
    paragraphSpacing: settings?.paragraphSpacing || 'normal',
    paragraphSpacingCss: paragraphSpacingMap[settings?.paragraphSpacing || 'normal'] || '0.875rem',
    contentPadding: settings?.contentPadding || 'normal',
    contentPaddingCss: contentPaddingMap[settings?.contentPadding || 'normal'] || '1.25rem',
    borderRadiusPreset: settings?.borderRadiusPreset || 'rounded',
    borderRadiusCss: borderRadiusMap[settings?.borderRadiusPreset || 'rounded'] || '16px',
    cardBorderWidth: settings?.cardBorderWidth || 'thin',
    cardBorderWidthCss: cardBorderWidthMap[settings?.cardBorderWidth || 'thin'] || '1px',
    fontSizeScale: settings?.fontSizeScale || 'normal',
    fontSmoothing: settings?.fontSmoothing || 'antialiased',
    fontBoldBoost: !!settings?.fontBoldBoost,
    highContrastText: settings?.highContrastText !== false,
    textShadowPreset: settings?.textShadowPreset || 'none',
    latinStack: latinOption.fontStack,
    khmerStack: khmerOption.fontStack,
    headingStack: headingOption.fontStack,
  };
}

/**
 * Generates raw CSS variables string for injection into standalone HTML exports and print previews
 */
export function generateThemeCssString(settings?: SystemSettings): string {
  const colors = getThemeColors(settings);
  const typo = getTypographySettings(settings);
  const primaryContrast = getContrastTextColor(colors.primary);
  const secondaryContrast = getContrastTextColor(colors.secondary);
  const accentContrast = getContrastTextColor(colors.accent);

  return `
    :root {
      --color-primary: ${colors.primary};
      --color-primary-hover: ${colors.primaryHover};
      --color-primary-contrast: ${primaryContrast};
      --color-secondary: ${colors.secondary};
      --color-secondary-contrast: ${secondaryContrast};
      --color-accent: ${colors.accent};
      --color-accent-contrast: ${accentContrast};
      --color-accent-glow: ${colors.accentGlow};
      --color-bg-dark: ${colors.bgDark};
      --color-bg-light: ${colors.bgLight};
      --color-card-dark: ${colors.cardDark};
      --color-card-light: ${colors.cardLight};
      --color-text-contrast: ${colors.textContrast};
      --font-family-latin: ${typo.latinStack};
      --font-family-khmer: ${typo.khmerStack};
      --font-family-heading: ${typo.headingStack};
      --font-heading-weight: ${typo.headingFontWeightNum};
      --font-line-height: ${typo.lineHeightCss};
      --font-letter-spacing: ${typo.letterSpacingCss};
      --heading-letter-spacing: ${typo.headingLetterSpacingCss};
      --heading-transform: ${typo.headingTransform};
      --text-align-default: ${typo.textAlign};
      --paragraph-spacing: ${typo.paragraphSpacingCss};
      --content-padding: ${typo.contentPaddingCss};
      --border-radius-preset: ${typo.borderRadiusCss};
      --card-border-width: ${typo.cardBorderWidthCss};
    }
  `;
}

/**
 * Applies dynamic CSS variables, high-contrast anti-blend rules, and dataset attributes to document root
 */
export function applyThemeToDOM(settings: SystemSettings, darkMode: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const colors = getThemeColors(settings);
  const typo = getTypographySettings(settings);

  const primaryContrast = getContrastTextColor(colors.primary);
  const secondaryContrast = getContrastTextColor(colors.secondary);
  const accentContrast = getContrastTextColor(colors.accent);

  // Set CSS custom properties for Colors & Anti-Blend Contrast
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-hover', colors.primaryHover);
  root.style.setProperty('--color-primary-contrast', primaryContrast);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-contrast', secondaryContrast);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-contrast', accentContrast);
  root.style.setProperty('--color-accent-glow', colors.accentGlow);
  root.style.setProperty('--color-bg-dark', colors.bgDark);
  root.style.setProperty('--color-bg-light', colors.bgLight);
  root.style.setProperty('--color-card-dark', colors.cardDark);
  root.style.setProperty('--color-card-light', colors.cardLight);
  root.style.setProperty('--color-text-contrast', colors.textContrast);

  // Set data attributes for global component styling
  root.dataset.themePreset = colors.presetKey;
  root.dataset.fontSizeScale = settings.fontSizeScale || 'normal';

  // Apply Font Size scaling
  const scale = settings.fontSizeScale || 'normal';
  if (scale === 'compact') {
    root.style.fontSize = '14.5px';
  } else if (scale === 'comfortable') {
    root.style.fontSize = '16.5px';
  } else if (scale === 'large') {
    root.style.fontSize = '17.5px';
  } else if (scale === 'extra-large') {
    root.style.fontSize = '19px';
  } else {
    root.style.fontSize = '16px';
  }

  // Apply Font Families and Typography detail metrics
  root.style.setProperty('--font-family-latin', typo.latinStack);
  root.style.setProperty('--font-family-khmer', typo.khmerStack);
  root.style.setProperty('--font-family-heading', typo.headingStack);
  root.style.setProperty('--font-heading-weight', String(typo.headingFontWeightNum));
  root.style.setProperty('--font-letter-spacing', typo.letterSpacingCss);
  root.style.setProperty('--font-line-height', typo.lineHeightCss);
  root.style.setProperty('--heading-letter-spacing', typo.headingLetterSpacingCss);
  root.style.setProperty('--heading-transform', typo.headingTransform);
  root.style.setProperty('--text-align-default', typo.textAlign);
  root.style.setProperty('--paragraph-spacing', typo.paragraphSpacingCss);
  root.style.setProperty('--content-padding', typo.contentPaddingCss);
  root.style.setProperty('--border-radius-preset', typo.borderRadiusCss);
  root.style.setProperty('--card-border-width', typo.cardBorderWidthCss);

  // Apply Body Font Stack and Alignment Defaults
  root.style.fontFamily = typo.latinStack;
  root.style.letterSpacing = typo.letterSpacingCss;
  root.style.lineHeight = typo.lineHeightCss;

  // Smoothing & High Contrast Boost
  if (settings.fontSmoothing === 'subpixel') {
    root.style.setProperty('-webkit-font-smoothing', 'auto');
    root.style.setProperty('-moz-osx-font-smoothing', 'auto');
  } else {
    root.style.setProperty('-webkit-font-smoothing', 'antialiased');
    root.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
  }

  if (settings.fontBoldBoost) {
    root.classList.add('font-bold-boost');
  } else {
    root.classList.remove('font-bold-boost');
  }

  if (settings.highContrastText !== false) {
    root.classList.add('high-contrast-mode');
  } else {
    root.classList.remove('high-contrast-mode');
  }
}

/**
 * Returns fully resolved color palette from SystemSettings with fallbacks
 */
export function getResolvedThemePalette(settings?: Partial<SystemSettings>): ThemePalette {
  const presetKey = settings?.themePreset || 'navy';
  const basePalette = THEME_PRESETS[presetKey] || THEME_PRESETS.navy;

  const primary = settings?.primaryColor || settings?.customPalette?.primary || basePalette.primary;
  const secondary = settings?.secondaryColor || settings?.customPalette?.secondary || basePalette.secondary;
  const accent = settings?.accentColor || settings?.customPalette?.accent || basePalette.accent;
  const primaryHover = settings?.customPalette?.primaryHover || basePalette.primaryHover;
  const accentGlow = settings?.customPalette?.accentGlow || basePalette.accentGlow;

  return {
    ...basePalette,
    primary,
    primaryHover,
    secondary,
    accent,
    accentGlow,
    themeName: settings?.customPalette?.themeName || basePalette.themeName,
    presetKey: presetKey as any,
  };
}

/**
 * Returns fully resolved font stacks and typography metrics from SystemSettings
 */
export function getResolvedTypography(settings?: Partial<SystemSettings>): {
  latinFont: string;
  khmerFont: string;
  headingFont: string;
  headingWeight: string;
  letterSpacing: string;
  lineHeight: string;
  fontSize: string;
  headingLetterSpacing: string;
  headingTransform: string;
  textAlign: string;
  paragraphSpacing: string;
  contentPadding: string;
  borderRadius: string;
  cardBorderWidth: string;
  highContrastText: boolean;
} {
  const latinFont = FONT_LATIN_OPTIONS.find((f) => f.key === settings?.fontFamilyLatin)?.fontStack || FONT_LATIN_OPTIONS[0].fontStack;
  const khmerFont = FONT_KHMER_OPTIONS.find((f) => f.key === settings?.fontFamilyKhmer)?.fontStack || FONT_KHMER_OPTIONS[0].fontStack;
  const headingFont = FONT_HEADING_OPTIONS.find((f) => f.key === settings?.fontFamilyHeading)?.fontStack || 'inherit';

  const headingWeightMap: Record<string, string> = {
    normal: '400',
    semibold: '600',
    bold: '700',
    black: '900',
  };
  const headingWeight = headingWeightMap[settings?.headingFontWeight || 'bold'] || '700';

  const letterSpacingMap: Record<string, string> = {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    widest: '0.05em',
  };
  const letterSpacing = letterSpacingMap[settings?.fontLetterSpacing || 'normal'] || '0em';

  const headingLetterSpacingMap: Record<string, string> = {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.05em',
    widest: '0.1em',
  };
  const headingLetterSpacing = headingLetterSpacingMap[settings?.headingLetterSpacing || 'normal'] || '0em';

  const lineHeightMap: Record<string, string> = {
    snug: '1.4',
    normal: '1.55',
    relaxed: '1.7',
    loose: '1.9',
  };
  const lineHeight = lineHeightMap[settings?.fontLineHeight || 'normal'] || '1.55';

  const paragraphSpacingMap: Record<string, string> = {
    compact: '0.5rem',
    normal: '0.875rem',
    relaxed: '1.25rem',
    loose: '1.75rem',
  };
  const paragraphSpacing = paragraphSpacingMap[settings?.paragraphSpacing || 'normal'] || '0.875rem';

  const contentPaddingMap: Record<string, string> = {
    compact: '0.75rem',
    normal: '1.25rem',
    spacious: '1.75rem',
    generous: '2.25rem',
  };
  const contentPadding = contentPaddingMap[settings?.contentPadding || 'normal'] || '1.25rem';

  const borderRadiusMap: Record<string, string> = {
    none: '0px',
    subtle: '8px',
    rounded: '16px',
    pill: '24px',
  };
  const borderRadius = borderRadiusMap[settings?.borderRadiusPreset || 'rounded'] || '16px';

  const cardBorderWidthMap: Record<string, string> = {
    none: '0px',
    thin: '1px',
    medium: '2px',
  };
  const cardBorderWidth = cardBorderWidthMap[settings?.cardBorderWidth || 'thin'] || '1px';

  const scale = settings?.fontSizeScale || 'normal';
  let fontSize = '16px';
  if (scale === 'compact') fontSize = '14.5px';
  else if (scale === 'comfortable') fontSize = '16.5px';
  else if (scale === 'large') fontSize = '17.5px';
  else if (scale === 'extra-large') fontSize = '19px';

  return {
    latinFont,
    khmerFont,
    headingFont,
    headingWeight,
    letterSpacing,
    lineHeight,
    fontSize,
    headingLetterSpacing,
    headingTransform: settings?.headingTransform || 'none',
    textAlign: settings?.textAlign || 'left',
    paragraphSpacing,
    contentPadding,
    borderRadius,
    cardBorderWidth,
    highContrastText: settings?.highContrastText !== false,
  };
}

/**
 * Generates the complete Google Fonts stylesheet link tag for any custom HTML/PDF export
 */
export function getThemeGoogleFontsUrl(): string {
  return 'https://fonts.googleapis.com/css2?family=Battambang:wght@300;400;700;900&family=Cinzel:wght@500;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800;1,9..40,400&family=Hanuman:wght@300;400;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Koulen&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+Hebrew:wght@400;700&family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+Khmer:wght@400;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Siemreap&display=swap';
}

/**
 * Returns CSS variables and style block for embedded standalone HTML documents and prints
 */
export function generateThemeCssVariables(settings?: Partial<SystemSettings>): string {
  const palette = getResolvedThemePalette(settings);
  const typo = getResolvedTypography(settings);
  const primaryContrast = getContrastTextColor(palette.primary);
  const secondaryContrast = getContrastTextColor(palette.secondary);
  const accentContrast = getContrastTextColor(palette.accent);

  return `
    :root {
      --color-primary: ${palette.primary};
      --color-primary-hover: ${palette.primaryHover};
      --color-primary-contrast: ${primaryContrast};
      --color-secondary: ${palette.secondary};
      --color-secondary-contrast: ${secondaryContrast};
      --color-accent: ${palette.accent};
      --color-accent-contrast: ${accentContrast};
      --color-accent-glow: ${palette.accentGlow};
      --color-bg-dark: ${palette.bgDark};
      --color-bg-light: ${palette.bgLight};
      --font-family-latin: ${typo.latinFont};
      --font-family-khmer: ${typo.khmerFont};
      --font-family-heading: ${typo.headingFont};
      --font-heading-weight: ${typo.headingWeight};
      --font-letter-spacing: ${typo.letterSpacing};
      --font-line-height: ${typo.lineHeight};
      --base-font-size: ${typo.fontSize};
      --heading-letter-spacing: ${typo.headingLetterSpacing};
      --heading-transform: ${typo.headingTransform};
      --text-align-default: ${typo.textAlign};
      --paragraph-spacing: ${typo.paragraphSpacing};
      --content-padding: ${typo.contentPadding};
      --border-radius-preset: ${typo.borderRadius};
      --card-border-width: ${typo.cardBorderWidth};
    }
  `;
}

/**
 * Calls Gemini server endpoint or uses intelligent client heuristic to detect theme from text/image
 */
export async function detectColorThemeAI(params: {
  prompt?: string;
  imageUrl?: string;
  destination?: string;
  brandKeyword?: string;
  language?: string;
}): Promise<ThemePalette> {
  try {
    const res = await fetch('/api/ai-detect-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.mode === 'gemini_success' && data.palette && data.palette.primary) {
        const p = data.palette;
        return {
          themeName: p.themeName || 'AI Generated Theme',
          presetKey: (p.suggestedPreset as any) || 'custom',
          primary: p.primary,
          primaryHover: p.primaryHover || p.primary,
          secondary: p.secondary || '#0f172a',
          accent: p.accent || '#f59e0b',
          accentGlow: p.accentGlow || 'rgba(245, 158, 11, 0.25)',
          bgDark: p.bgDark || '#0b1120',
          bgLight: p.bgLight || '#f8fafc',
          cardDark: p.cardDark || '#111827',
          cardLight: p.cardLight || '#ffffff',
          textContrast: p.textContrast || '#ffffff',
          description: p.rationale || 'AI synthesized color code template tailored for KHB Events.',
          rationale: p.rationale,
          fontScaleRecommendation: p.fontScaleRecommendation || 'normal',
        };
      }
    }
  } catch (err) {
    console.warn('AI theme API detection notice:', err);
  }

  // Adaptive Client-Side Detection Heuristics
  const query = `${params.prompt || ''} ${params.destination || ''} ${params.brandKeyword || ''}`.toLowerCase();
  
  if (query.includes('canton') || query.includes('guangzhou') || query.includes('china') || query.includes('green') || query.includes('jade') || query.includes('factory') || query.includes('eco')) {
    return {
      ...THEME_PRESETS.emerald,
      themeName: 'AI Detected: Canton Fair & Sourcing Jade Emerald',
      rationale: 'Optimized for Canton Fair & South China manufacturing delegations with high-contrast emerald and gold accents.',
    };
  }

  if (query.includes('luxury') || query.includes('vip') || query.includes('wine') || query.includes('ruby') || query.includes('red') || query.includes('diplomatic') || query.includes('royal')) {
    return {
      ...THEME_PRESETS.crimson,
      themeName: 'AI Detected: Executive Crimson & Luxury Ruby',
      rationale: 'Selected deep royal ruby and burgundy to convey VIP status, government accreditation, and luxury travel.',
    };
  }

  if (query.includes('tech') || query.includes('ai') || query.includes('singapore') || query.includes('fintech') || query.includes('software') || query.includes('cobalt') || query.includes('purple')) {
    return {
      ...THEME_PRESETS.indigo,
      themeName: 'AI Detected: Cyber FinTech & Global Tech Cobalt',
      rationale: 'Tailored for technology delegations, electronics summits, and digital innovation missions with vibrant cobalt indigo.',
    };
  }

  if (query.includes('cambodia') || query.includes('angkor') || query.includes('phnom penh') || query.includes('gold') || query.includes('saffron') || query.includes('yellow') || query.includes('heritage')) {
    return {
      ...THEME_PRESETS.amber,
      themeName: 'AI Detected: Royal Phnom Penh Heritage Gold',
      rationale: 'Infused with Cambodian national gold and warm hospitality tones, harmonized with high-contrast cyan highlights.',
    };
  }

  if (query.includes('japan') || query.includes('tokyo') || query.includes('sea') || query.includes('phu quoc') || query.includes('vietnam') || query.includes('cyan') || query.includes('blue')) {
    return {
      ...THEME_PRESETS.cyan,
      themeName: 'AI Detected: Tokyo Midnight & Maritime Commerce Cyan',
      rationale: 'Selected electric maritime cyan and crisp white surfaces for coastal trade and modern Asian metropolitan travel.',
    };
  }

  return {
    ...THEME_PRESETS.navy,
    themeName: 'AI Detected: Diplomatic Oceanic Azure (Default)',
    rationale: 'Standard international enterprise blue designed for optimal WCAG AA contrast and professional trade missions.',
  };
}
