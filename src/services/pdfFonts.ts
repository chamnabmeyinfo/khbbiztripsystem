import jsPDF from 'jspdf';
import { LanguageCode } from '../types';

import notoSansKhmerRegularUrl from '@expo-google-fonts/noto-sans-khmer/400Regular/NotoSansKhmer_400Regular.ttf';
import notoSansKhmerBoldUrl from '@expo-google-fonts/noto-sans-khmer/700Bold/NotoSansKhmer_700Bold.ttf';
import notoSansArabicRegularUrl from '@expo-google-fonts/noto-sans-arabic/400Regular/NotoSansArabic_400Regular.ttf';
import notoSansArabicBoldUrl from '@expo-google-fonts/noto-sans-arabic/700Bold/NotoSansArabic_700Bold.ttf';
import notoSansHebrewRegularUrl from '@expo-google-fonts/noto-sans-hebrew/400Regular/NotoSansHebrew_400Regular.ttf';
import notoSansHebrewBoldUrl from '@expo-google-fonts/noto-sans-hebrew/700Bold/NotoSansHebrew_700Bold.ttf';
import notoSansJpRegularUrl from '@expo-google-fonts/noto-sans-jp/400Regular/NotoSansJP_400Regular.ttf';
import notoSansJpBoldUrl from '@expo-google-fonts/noto-sans-jp/700Bold/NotoSansJP_700Bold.ttf';

export interface PdfFontConfig {
  family: string;
  isRtl: boolean;
  isEmbedded: boolean;
}

interface FontAsset {
  family: string;
  regularUrl: string;
  boldUrl: string;
  regularFileName: string;
  boldFileName: string;
}

const FONT_MAP: Partial<Record<LanguageCode, FontAsset>> = {
  km: {
    family: 'NotoSansKhmer',
    regularUrl: notoSansKhmerRegularUrl,
    boldUrl: notoSansKhmerBoldUrl,
    regularFileName: 'NotoSansKhmer-Regular.ttf',
    boldFileName: 'NotoSansKhmer-Bold.ttf',
  },
  ar: {
    family: 'NotoSansArabic',
    regularUrl: notoSansArabicRegularUrl,
    boldUrl: notoSansArabicBoldUrl,
    regularFileName: 'NotoSansArabic-Regular.ttf',
    boldFileName: 'NotoSansArabic-Bold.ttf',
  },
  he: {
    family: 'NotoSansHebrew',
    regularUrl: notoSansHebrewRegularUrl,
    boldUrl: notoSansHebrewBoldUrl,
    regularFileName: 'NotoSansHebrew-Regular.ttf',
    boldFileName: 'NotoSansHebrew-Bold.ttf',
  },
  ja: {
    family: 'NotoSansJP',
    regularUrl: notoSansJpRegularUrl,
    boldUrl: notoSansJpBoldUrl,
    regularFileName: 'NotoSansJP-Regular.ttf',
    boldFileName: 'NotoSansJP-Bold.ttf',
  },
};

const base64Cache: Record<string, string> = {};

function extractBase64FromDataUri(dataUri: string): string {
  const commaIndex = dataUri.indexOf(',');
  if (commaIndex === -1) return dataUri;
  return dataUri.substring(commaIndex + 1);
}

function isDataUri(url: string): boolean {
  return url.startsWith('data:');
}

async function fetchTtfAsBase64(url: string): Promise<string> {
  if (base64Cache[url]) return base64Cache[url];

  if (isDataUri(url)) {
    const base64 = extractBase64FromDataUri(url);
    base64Cache[url] = base64;
    return base64;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font fetch failed: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  base64Cache[url] = base64;
  return base64;
}

export async function loadPdfFont(doc: jsPDF, lang: LanguageCode): Promise<PdfFontConfig> {
  const isRtl = lang === 'ar' || lang === 'he';
  const asset = FONT_MAP[lang];

  if (!asset) {
    return { family: 'helvetica', isRtl, isEmbedded: false };
  }

  try {
    const [regularB64, boldB64] = await Promise.all([
      fetchTtfAsBase64(asset.regularUrl),
      fetchTtfAsBase64(asset.boldUrl),
    ]);

    doc.addFileToVFS(asset.regularFileName, regularB64);
    doc.addFileToVFS(asset.boldFileName, boldB64);
    doc.addFont(asset.regularFileName, asset.family, 'normal');
    doc.addFont(asset.boldFileName, asset.family, 'bold');

    return { family: asset.family, isRtl, isEmbedded: true };
  } catch (error) {
    console.warn(`[PDF Fonts] Falling back to helvetica for language "${lang}":`, error);
    return { family: 'helvetica', isRtl, isEmbedded: false };
  }
}
