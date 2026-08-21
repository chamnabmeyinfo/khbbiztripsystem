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
  fontScaleRecommendation?: 'compact' | 'normal' | 'comfortable' | 'large';
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

/**
 * Applies dynamic CSS variables and dataset attributes to document root
 */
export function applyThemeToDOM(settings: SystemSettings, darkMode: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const presetKey = settings.themePreset || 'navy';
  const basePalette = THEME_PRESETS[presetKey] || THEME_PRESETS.navy;

  const primary = settings.primaryColor || settings.customPalette?.primary || basePalette.primary;
  const secondary = settings.secondaryColor || settings.customPalette?.secondary || basePalette.secondary;
  const accent = settings.accentColor || settings.customPalette?.accent || basePalette.accent;

  // Set CSS custom properties
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-primary-hover', settings.customPalette?.primaryHover || basePalette.primaryHover);
  root.style.setProperty('--color-accent-glow', settings.customPalette?.accentGlow || basePalette.accentGlow);

  // Set data attributes for global component styling
  root.dataset.themePreset = presetKey;
  root.dataset.fontSizeScale = settings.fontSizeScale || 'normal';

  // Apply Font Size scaling
  const scale = settings.fontSizeScale || 'normal';
  if (scale === 'compact') {
    root.style.fontSize = '14.5px';
  } else if (scale === 'comfortable') {
    root.style.fontSize = '16.5px';
  } else if (scale === 'large') {
    root.style.fontSize = '17.5px';
  } else {
    root.style.fontSize = '16px';
  }
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
