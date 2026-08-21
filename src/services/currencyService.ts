import { CurrencyCode, LanguageCode } from '../types';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUSD: number; // e.g. 1 USD = 0.92 EUR
  flag: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromUSD: 1.0,
    flag: '🇺🇸',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromUSD: 0.92,
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateFromUSD: 0.79,
    flag: '🇬🇧',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rateFromUSD: 154.5,
    flag: '🇯🇵',
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    rateFromUSD: 3.67,
    flag: '🇦🇪',
  },
  ILS: {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli Shekel',
    rateFromUSD: 3.72,
    flag: '🇮🇱',
  },
};

export function convertFromUSD(amountUSD: number, targetCurrency: CurrencyCode): number {
  const rate = CURRENCY_CONFIGS[targetCurrency]?.rateFromUSD || 1.0;
  const result = amountUSD * rate;
  if (targetCurrency === 'JPY') {
    return Math.round(result);
  }
  return Math.round(result * 100) / 100;
}

export function convertToUSD(amountInCurrency: number, sourceCurrency: CurrencyCode): number {
  const rate = CURRENCY_CONFIGS[sourceCurrency]?.rateFromUSD || 1.0;
  return Math.round((amountInCurrency / rate) * 100) / 100;
}

export function formatMoney(amountInUSD: number, targetCurrency: CurrencyCode, lang: LanguageCode = 'en'): string {
  const converted = convertFromUSD(amountInUSD, targetCurrency);
  const localeMap: Record<LanguageCode, string> = {
    en: 'en-US',
    km: 'km-KH',
    ar: 'ar-AE',
    he: 'he-IL',
    es: 'es-ES',
    ja: 'ja-JP',
  };

  try {
    return new Intl.NumberFormat(localeMap[lang] || 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: targetCurrency === 'JPY' ? 0 : 2,
      minimumFractionDigits: targetCurrency === 'JPY' ? 0 : 2,
    }).format(converted);
  } catch {
    const sym = CURRENCY_CONFIGS[targetCurrency]?.symbol || '$';
    return `${sym}${converted.toLocaleString()}`;
  }
}

export function formatRawMoney(amountInCurrency: number, targetCurrency: CurrencyCode, lang: LanguageCode = 'en'): string {
  const localeMap: Record<LanguageCode, string> = {
    en: 'en-US',
    km: 'km-KH',
    ar: 'ar-AE',
    he: 'he-IL',
    es: 'es-ES',
    ja: 'ja-JP',
  };

  try {
    return new Intl.NumberFormat(localeMap[lang] || 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: targetCurrency === 'JPY' ? 0 : 2,
      minimumFractionDigits: targetCurrency === 'JPY' ? 0 : 2,
    }).format(amountInCurrency);
  } catch {
    const sym = CURRENCY_CONFIGS[targetCurrency]?.symbol || '$';
    return `${sym}${amountInCurrency.toLocaleString()}`;
  }
}
