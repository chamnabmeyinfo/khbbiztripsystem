import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TourPackage, ItineraryStep, GuideScheduleSlot, TourGuide, LanguageCode, SystemSettings } from '../types';
import { getLocalizedPackage } from '../utils/packageLocalization';
import { getPdfLabels, PdfLabels } from './pdfTranslations';
import {
  getThemeColors,
  getTypographySettings,
  generateThemeCssString,
  getResolvedThemePalette,
  getResolvedTypography,
  getThemeGoogleFontsUrl,
  generateThemeCssVariables,
  ThemePalette,
} from './aiThemeService';

import notoSansKhmerRegular from '@expo-google-fonts/noto-sans-khmer/400Regular/NotoSansKhmer_400Regular.ttf';
import notoSansKhmerBold from '@expo-google-fonts/noto-sans-khmer/700Bold/NotoSansKhmer_700Bold.ttf';
import notoSansArabicRegular from '@expo-google-fonts/noto-sans-arabic/400Regular/NotoSansArabic_400Regular.ttf';
import notoSansArabicBold from '@expo-google-fonts/noto-sans-arabic/700Bold/NotoSansArabic_700Bold.ttf';
import notoSansHebrewRegular from '@expo-google-fonts/noto-sans-hebrew/400Regular/NotoSansHebrew_400Regular.ttf';
import notoSansHebrewBold from '@expo-google-fonts/noto-sans-hebrew/700Bold/NotoSansHebrew_700Bold.ttf';

export type ExportFormat = 'html_pdf' | 'pdf_image' | 'html' | 'doc' | 'pdf_vector';

export interface WatermarkOptions {
  enabled: boolean;
  text: string;
  opacity?: number; // 0.05 to 0.40
  color?: string; // hex color code
  fontSize?: number;
  layout?: 'diagonal' | 'center_stamp' | 'confidential_bar';
}

export interface AgendaExportOptions {
  packageData: TourPackage;
  selectedDate?: string;
  travelerName?: string;
  numberOfAdults?: number;
  selectedOptionalProgramIds?: string[];
  language?: LanguageCode;
  watermark?: WatermarkOptions;
  systemSettings?: SystemSettings;
}

export function getExportColors(settings?: SystemSettings) {
  const palette = getResolvedThemePalette(settings);
  return {
    navy: palette.secondary || '#0f172a',
    sky: palette.primary || '#0284c7',
    skyDark: palette.primaryHover || palette.primary || '#0369a1',
    skyLight: palette.presetKey === 'emerald' ? '#d1fae5' : palette.presetKey === 'crimson' ? '#ffe4e6' : palette.presetKey === 'indigo' ? '#e0e7ff' : palette.presetKey === 'amber' ? '#fef3c7' : palette.presetKey === 'cyan' ? '#cffafe' : '#bae6fd',
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1e293b',
    amber50: '#fffbeb',
    amber200: '#fde68a',
    amber500: palette.accent || '#f59e0b',
    amber800: '#92400e',
    emerald50: '#f0fdf4',
    emerald200: '#bbf7d0',
    emerald500: '#16a34a',
    emerald600: '#059669',
    rose50: '#fef2f2',
    rose200: '#fecaca',
    rose600: '#dc2626',
    rose800: '#991b1b',
    blue50: '#eff6ff',
    blue200: '#bfdbfe',
    blue900: '#1e3a8a',
    white: '#ffffff',
    indigo: palette.presetKey === 'indigo' ? palette.primary : '#6366f1',
    accentGlow: palette.accentGlow || 'rgba(245, 158, 11, 0.25)',
  };
}

let C = getExportColors();

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeFilename(title: string): string {
  return String(title || 'agenda').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
}

function buildDefaultGuide(labels: PdfLabels): TourGuide {
  return {
    name: labels.defaultGuideName,
    title: labels.defaultGuideTitle,
    phone: '060 815 515',
    telegram: '@VuthaTim',
    languages: ['Khmer', 'English', 'Vietnamese'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-TG-2026-08',
    emergencyContact: '+855 60 815 515',
    bio: labels.defaultGuideBio,
    briefingMeetingPoint: labels.defaultBriefingPoint,
    briefingTime: labels.defaultBriefingTime,
  };
}

function getStepAgendaSlots(step: ItineraryStep, labels: PdfLabels): GuideScheduleSlot[] {
  if (step.guideAgenda && step.guideAgenda.length > 0) return step.guideAgenda;
  return [
    { time: '07:00 AM - 08:30 AM', activity: labels.defaultBreakfastActivity, location: step.hotelName || labels.hotelRestaurant, type: 'briefing', notes: labels.defaultBreakfastNote },
    { time: '08:45 AM - 09:15 AM', activity: labels.defaultAssemblyActivity, location: labels.defaultAssemblyLocation, type: 'gathering', notes: labels.defaultAssemblyNote },
    { time: '09:30 AM - 12:30 PM', activity: step.title || labels.defaultExhibitionActivity, location: labels.defaultExhibitionLocation, type: 'exhibition', notes: labels.defaultExhibitionNote },
    { time: '12:30 PM - 02:00 PM', activity: labels.defaultLunchActivity, location: labels.defaultLunchLocation, type: 'networking_lunch', notes: step.mealsIncluded?.includes('Lunch') ? labels.defaultLunchNoteIncluded : labels.defaultLunchNoteOptional },
    { time: '02:15 PM - 05:30 PM', activity: labels.defaultB2bActivity, location: labels.defaultB2bLocation, type: 'b2b_meeting', notes: labels.defaultB2bNote },
    { time: '06:00 PM onwards', activity: labels.defaultEveningActivity, location: step.hotelName || labels.defaultEveningLocation, type: 'free_time', notes: labels.defaultEveningNote },
  ];
}

function getFontFamily(lang: LanguageCode, settings?: SystemSettings): string {
  const typo = getResolvedTypography(settings);
  if (lang === 'km') return typo.khmerFont;
  if (lang === 'ar') return "'Noto Sans Arabic', Arial, sans-serif";
  if (lang === 'he') return "'Noto Sans Hebrew', Arial, sans-serif";
  if (lang === 'ja') return "'Noto Sans JP', Arial, sans-serif";
  return typo.latinFont;
}

function getGoogleFontsHref(lang?: LanguageCode): string {
  return getThemeGoogleFontsUrl();
}

function buildFontFaceCSS(lang: LanguageCode): string {
  if (lang === 'km') return `@font-face{font-family:'Noto Sans Khmer';src:url(${notoSansKhmerRegular}) format('truetype');font-weight:normal;font-style:normal;}@font-face{font-family:'Noto Sans Khmer';src:url(${notoSansKhmerBold}) format('truetype');font-weight:bold;font-style:normal;}`;
  if (lang === 'ar') return `@font-face{font-family:'Noto Sans Arabic';src:url(${notoSansArabicRegular}) format('truetype');font-weight:normal;font-style:normal;}@font-face{font-family:'Noto Sans Arabic';src:url(${notoSansArabicBold}) format('truetype');font-weight:bold;font-style:normal;}`;
  if (lang === 'he') return `@font-face{font-family:'Noto Sans Hebrew';src:url(${notoSansHebrewRegular}) format('truetype');font-weight:normal;font-style:normal;}@font-face{font-family:'Noto Sans Hebrew';src:url(${notoSansHebrewBold}) format('truetype');font-weight:bold;font-style:normal;}`;
  return '';
}

const DESTINATION_GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
];

function getGalleryImages(pkg: TourPackage): string[] {
  const existing = (pkg.images || []).filter(url => Boolean(url && url.trim()));
  const combined = [...existing];
  for (const fb of DESTINATION_GALLERY_FALLBACKS) {
    if (combined.length >= 7) break;
    if (!combined.includes(fb)) {
      combined.push(fb);
    }
  }
  const count = Math.min(Math.max(combined.length, 4), 7);
  return combined.slice(0, count);
}

function buildImageGallery(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const allImages = getGalleryImages(pkg);
  if (allImages.length === 0) return '';

  const mainImg = allImages[0];
  const subImgs = allImages.slice(1); 

  const subHtml = subImgs.map((img, idx) => `
    <div data-bg-img="${escapeHtml(img)}" class="gallery-thumb-item" style="border-radius:7px;border:1px solid ${C.slate200};overflow:hidden;background:${C.slate100} url('${escapeHtml(img)}') no-repeat center center / cover;position:relative;box-shadow:0 1px 2px rgba(0,0,0,0.03);aspect-ratio:16/10;">
      <img src="${escapeHtml(img)}" alt="${escapeHtml(pkg.destination)} Photo ${idx + 2}" crossOrigin="anonymous" referrerPolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
    </div>
  `).join('');

  return `
  <div data-pdf-block="1" style="margin-top:16px;width:100%;box-sizing:border-box;">
    <div style="font-size:10.5px;font-weight:bold;color:${C.slate500};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px;">
      <span>📸 ${escapeHtml(labels.galleryTitle || 'Official Tour & Destination Photo Gallery')}</span>
      <span style="font-size:9.5px;color:${C.slate400};font-weight:normal;">1 Featured + ${subImgs.length} Mission Photos (${allImages.length} Photos Total)</span>
    </div>

    <div data-bg-img="${escapeHtml(mainImg)}" class="gallery-hero-box" style="width:100%;height:135px;border-radius:9px;border:1px solid ${C.slate200};position:relative;overflow:hidden;background:${C.slate100} url('${escapeHtml(mainImg)}') no-repeat center center / cover;margin-bottom:7px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
      <img src="${escapeHtml(mainImg)}" alt="Featured ${escapeHtml(pkg.destination)}" crossOrigin="anonymous" referrerPolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
      <div class="gallery-hero-badge-left" style="position:absolute;bottom:8px;left:10px;max-width:calc(100% - 20px);background:rgba(15,23,42,0.88);color:#fff;padding:4px 10px;border-radius:6px;font-size:9px;font-weight:bold;display:inline-flex;align-items:center;gap:4px;line-height:1.2;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        <span>📍</span>
        <span style="overflow:hidden;text-overflow:ellipsis;">${escapeHtml(pkg.destination)}, ${escapeHtml(pkg.country)} (Mission Center)</span>
      </div>
      <div class="gallery-hero-badge-right" style="position:absolute;top:8px;right:10px;background:${C.sky};color:#fff;padding:0 8px;height:18px;border-radius:5px;font-size:8.5px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;text-align:center;text-transform:uppercase;letter-spacing:0.4px;box-sizing:border-box;vertical-align:middle;white-space:nowrap;">
        <span class="pdf-pill-text">★ Featured</span>
      </div>
    </div>

    <div class="gallery-sub-grid" style="display:grid;grid-template-columns:repeat(${Math.min(subImgs.length, 6)}, 1fr);gap:6px;width:100%;">
      ${subHtml}
    </div>
  </div>`;
}

function buildHeader(pkg: TourPackage, labels: PdfLabels, opts: { selectedDate: string; travelerName: string; docRef: string; systemSettings?: SystemSettings }): string {
  const C = getExportColors(opts.systemSettings);
  const settings = opts.systemSettings;
  const companyName = settings?.companyName || labels.systemName;
  const companyTagline = settings?.companyTagline || labels.officialAgenda;
  const companyLogo = settings?.companyLogoUrl;
  const taxVat = settings?.taxVatNumber || 'VAT-KHB-2026';
  const mocReg = settings?.companyRegistrationNumber;

  const issueDate = new Date().toISOString().split('T')[0];
  const price = pkg.discountPriceUSD || pkg.priceUSD;
  const hasDiscount = pkg.discountPriceUSD && pkg.discountPriceUSD < pkg.priceUSD;

  const logoHtml = companyLogo ? `
    <div style="width:48px;height:48px;border-radius:10px;background:#ffffff;padding:2px;box-shadow:0 2px 6px rgba(0,0,0,0.15);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
      <img src="${escapeHtml(companyLogo)}" alt="Logo" style="width:100%;height:100%;object-fit:contain;display:block;" />
    </div>
  ` : '';

  const cantonHtml = pkg.isCantonFair ? `
    <div class="pdf-tag-pill pdf-tag-pill-amber" style="min-height:22px;height:auto;display:inline-flex;align-items:center;gap:4px;background:${C.amber500};color:${C.navy};padding:2px 10px;border-radius:5px;font-size:10px;font-weight:bold;margin-top:8px;box-sizing:border-box;max-width:100%;flex-wrap:wrap;">
      <span class="pdf-pill-text" style="display:inline-flex;align-items:center;gap:4px;">
        <span>🏛️</span>
        <span>${escapeHtml(labels.cantonFairDelegation)}${pkg.cantonFairPhase ? ` • ${escapeHtml(pkg.cantonFairPhase)}` : ''}</span>
      </span>
    </div>
  ` : '';

  const perPersonText = labels.perPerson.startsWith('/') ? labels.perPerson : `/ ${labels.perPerson}`;

  const priceHtml = hasDiscount ? `
    <div class="header-price-row" style="font-size:13.5px;color:#ffffff;font-weight:bold;margin-top:6px;display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;">
      <span style="color:#ffffff;">$${price} USD ${escapeHtml(perPersonText)}</span>
      <span style="font-size:11px;color:rgba(255,255,255,0.75);text-decoration:line-through;">$${pkg.priceUSD}</span>
      <span class="pdf-tag-pill pdf-tag-pill-emerald" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.emerald600};color:${C.white};font-size:9.5px;padding:0 8px;border-radius:4px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">${escapeHtml(labels.saveDiscount)} $${pkg.priceUSD - (pkg.discountPriceUSD || 0)}</span></span>
    </div>
  ` : `
    <div style="font-size:13.5px;color:#ffffff;font-weight:bold;margin-top:6px;">$${price} USD ${escapeHtml(perPersonText)}</div>
  `;

  return `
  <div class="header-main-box" data-pdf-block="1" style="background:linear-gradient(135deg, ${C.navy} 0%, ${C.skyDark} 100%);border-radius:12px;overflow:hidden;padding:22px 24px;border-left:5px solid ${C.sky};display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;box-sizing:border-box;color:#ffffff;">
    <div class="header-brand-box" style="flex:1;min-width:0;display:flex;align-items:center;gap:14px;">
      ${logoHtml}
      <div style="min-width:0;flex:1;">
        <div style="font-size:19px;font-weight:bold;color:#ffffff;line-height:1.3;word-break:break-word;">${escapeHtml(companyName)}</div>
        <div style="font-size:12.5px;color:#ffffff;opacity:0.95;margin-top:4px;line-height:1.4;">${escapeHtml(companyTagline)}</div>
        <div style="font-size:10px;color:#ffffff;opacity:0.85;margin-top:5px;line-height:1.4;">
          ${escapeHtml(labels.operationsSubtitle)}
          ${taxVat ? ` • <span style="color:#ffffff;font-weight:600;">VAT: ${escapeHtml(taxVat)}</span>` : ''}
          ${mocReg ? ` • <span style="color:#ffffff;">MoC: ${escapeHtml(mocReg)}</span>` : ''}
        </div>
        ${cantonHtml}
      </div>
    </div>
    <div class="header-meta-box" style="text-align:right;flex-shrink:0;max-width:280px;width:auto;word-break:break-word;">
      <div style="font-size:11px;color:${C.amber500};font-weight:bold;">${escapeHtml(labels.verifiedBriefing)}</div>
      <div style="font-size:10px;color:#ffffff;margin-top:5px;word-break:break-all;">${escapeHtml(labels.docRef)}: <strong style="color:#ffffff;">${escapeHtml(opts.docRef)}</strong></div>
      <div style="font-size:10px;color:#ffffff;margin-top:2px;">${escapeHtml(labels.issueDate)}: <strong style="color:#ffffff;">${escapeHtml(issueDate)}</strong></div>
      ${priceHtml}
      <div style="font-size:10px;color:#ffffff;opacity:0.95;margin-top:4px;">${escapeHtml(labels.departureDate)}: <strong style="color:#ffffff;">${escapeHtml(opts.selectedDate)}</strong></div>
      <div style="font-size:10px;color:#ffffff;opacity:0.95;margin-top:2px;word-break:break-word;">${escapeHtml(labels.delegateSignature)}: <strong style="color:#ffffff;">${escapeHtml(opts.travelerName)}</strong></div>
    </div>
  </div>`;
}

function buildTitleBlock(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const cat = pkg.category || labels.officialAgenda;
  const stars = pkg.rating ? '★'.repeat(Math.round(pkg.rating)) : '';
  const ratingHtml = pkg.rating ? `<span style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle;"><span style="color:${C.amber500};font-size:13px;line-height:1;">${stars}</span><span style="color:${C.slate500};font-size:10.5px;line-height:1;">${pkg.rating} (${pkg.reviewCount} ${escapeHtml(labels.reviewsCount || 'reviews')})</span></span>` : '';
  const tagsHtml = pkg.tags?.length ? pkg.tags.map(tag => `<span class="pdf-tag-pill pdf-tag-pill-sky" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.sky};color:${C.white};padding:0 8px;border-radius:4px;font-size:8.5px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-right:4px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">${escapeHtml(tag)}</span></span>`).join('') : '';
  const bookedHtml = pkg.bookedThisMonth ? `<span class="pdf-tag-pill pdf-tag-pill-emerald" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:rgba(5,150,105,0.12);border:1px solid rgba(5,150,105,0.25);color:${C.emerald600};font-size:10px;font-weight:bold;padding:0 8px;border-radius:4px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">🔥 ${pkg.bookedThisMonth} ${escapeHtml(labels.bookedThisMonth || 'booked this month')}</span></span>` : '';
  const cantonBadge = pkg.isCantonFair ? `<span class="pdf-tag-pill pdf-tag-pill-amber" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.amber500};color:${C.navy};padding:0 8px;border-radius:4px;font-size:8.5px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-right:4px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">🏛️ Canton Fair</span></span>` : '';

  return `
  <div data-pdf-block="1" style="background:${C.slate50};border:1px solid ${C.slate200};border-radius:10px;padding:18px 20px;margin-top:16px;width:100%;box-sizing:border-box;">
    <div class="title-header-row" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <div style="font-size:18px;font-weight:bold;color:${C.navy};flex:1;min-width:200px;line-height:1.35;word-break:break-word;">${escapeHtml(pkg.title)}</div>
      ${ratingHtml ? `<div style="flex-shrink:0;">${ratingHtml}</div>` : ''}
    </div>
    <div class="title-meta-details" style="font-size:11.5px;color:${C.slate600};margin-top:8px;line-height:1.6;word-break:break-word;">
      ${escapeHtml(labels.destination)}: <strong>${escapeHtml(pkg.destination)}, ${escapeHtml(pkg.country)}</strong>
      &nbsp;|&nbsp; ${escapeHtml(labels.category)}: ${escapeHtml(cat)}
      &nbsp;|&nbsp; ${escapeHtml(labels.duration)}: ${pkg.durationDays} ${escapeHtml(labels.days)} / ${pkg.durationNights} ${escapeHtml(labels.nights)}
    </div>
    ${tagsHtml || bookedHtml || cantonBadge ? `<div style="margin-top:9px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${cantonBadge}${tagsHtml}${bookedHtml}</div>` : ''}
  </div>`;
}

function buildBadges(pkg: TourPackage, labels: PdfLabels, selectedDate: string, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const badges = [
    { label: labels.destination, value: `${pkg.destination}`, color: C.skyDark, icon: '📍' },
    { label: labels.duration, value: `${pkg.durationDays}D / ${pkg.durationNights}N`, color: C.indigo, icon: '⏱️' },
    { label: labels.accommodation, value: `${pkg.hotelStars}-${labels.starHotel}`, color: C.amber500, icon: '⭐' },
    { label: labels.flightStatus, value: pkg.flightIncluded ? labels.flightIncluded : labels.groundEscort, color: C.emerald600, icon: '✈️' },
  ];
  const badgeDivs = badges.map(b => `
    <div class="badge-item-card" style="flex:1;min-width:0;background:${C.slate50};border:1px solid ${C.slate200};border-radius:10px;padding:12px 8px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.02);display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;">
      <div style="font-size:9.5px;font-weight:bold;color:${C.slate400};text-transform:uppercase;letter-spacing:0.4px;text-align:center;display:flex;align-items:center;justify-content:center;gap:3px;line-height:1.2;word-break:break-word;">
        <span>${b.icon}</span><span>${escapeHtml(b.label)}</span>
      </div>
      <div style="font-size:12px;font-weight:bold;color:${b.color};margin-top:5px;text-align:center;line-height:1.3;word-break:break-word;">
        ${escapeHtml(b.value)}
      </div>
    </div>
  `).join('');
  return `<div class="badges-row" data-pdf-block="1" style="display:flex;gap:8px;margin-top:14px;width:100%;box-sizing:border-box;">${badgeDivs}</div>`;
}

function buildTourDirector(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const guide = pkg.tourGuide || buildDefaultGuide(labels);
  const name = settings?.leadCoordinatorName || guide.name;
  const title = settings?.leadCoordinatorTitle || guide.title;
  const phone = settings?.leadCoordinatorPhone || guide.phone;
  const telegram = settings?.leadCoordinatorTelegram || guide.telegram || '@VuthaTim';
  const photoUrl = settings?.leadCoordinatorAvatar || guide.photoUrl;
  const bio = settings?.leadCoordinatorBio || guide.bio;

  const bioHtml = bio ? `<div style="font-size:11px;color:${C.slate600};margin-top:10px;line-height:1.6;font-style:italic;border-top:1px dashed ${C.amber200};padding-top:8px;">"${escapeHtml(bio)}"</div>` : '';
  const langsHtml = guide.languages?.length ? `<div style="font-size:11px;color:${C.slate600};margin-top:5px;line-height:1.4;">${escapeHtml(labels.languages || 'Languages')}: <strong>${guide.languages.map(escapeHtml).join(', ')}</strong></div>` : '';
  const photoHtml = photoUrl ? `
    <div class="guide-photo-box" style="width:64px;height:64px;border-radius:12px;border:2px solid ${C.amber500};overflow:hidden;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.08);background:${C.slate100};">
      <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(name)}" crossOrigin="anonymous" referrerPolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;display:block;" />
    </div>
  ` : '';

  return `
  <div data-pdf-block="1" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px 20px;margin-top:16px;box-shadow:0 1px 4px rgba(0,0,0,0.02);width:100%;box-sizing:border-box;">
    <div class="guide-box" style="display:flex;align-items:flex-start;gap:14px;width:100%;">
      ${photoHtml}
      <div class="guide-details-box" style="flex:1;min-width:0;">
        <div style="font-size:10.5px;font-weight:bold;color:${C.amber800};text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.designatedDirector)}</div>
        <div style="font-size:14.5px;font-weight:bold;color:${C.navy};margin-top:3px;word-break:break-word;">${escapeHtml(name)} <span style="font-size:11.5px;font-weight:normal;color:${C.slate500};">(${escapeHtml(title)})</span></div>
        <div class="guide-contacts-row" style="font-size:11px;color:${C.slate600};margin-top:4px;line-height:1.5;display:flex;flex-wrap:wrap;gap:3px 10px;">
          <span>${escapeHtml(labels.directPhone)}: <strong>${escapeHtml(phone)}</strong></span>
          <span>${escapeHtml(labels.telegram)}: <strong>${escapeHtml(telegram)}</strong></span>
          <span>${escapeHtml(labels.badgeNumber)}: <strong style="font-family:monospace;color:${C.amber800};">${escapeHtml(guide.badgeNumber || 'KHB-TG-2026')}</strong></span>
        </div>
        ${langsHtml}
        <div class="guide-assembly-badge" style="font-size:10.5px;color:${C.slate700};margin-top:6px;background:rgba(245,158,11,0.14);padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:4px;line-height:1.35;box-sizing:border-box;word-break:break-word;width:100%;">
          <span style="flex-shrink:0;">📍</span>
          <span><strong>${escapeHtml(labels.assemblyPoint)}:</strong> ${escapeHtml(guide.briefingMeetingPoint)} (${escapeHtml(guide.briefingTime)})</span>
        </div>
        ${bioHtml}
      </div>
    </div>
  </div>`;
}

function buildDescription(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  return `
  <div data-pdf-block="1" style="margin-top:14px;width:100%;box-sizing:border-box;">
    <div style="font-size:13px;font-weight:bold;color:${C.navy};text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.missionDescription)}</div>
    <div style="font-size:12px;color:${C.slate700};margin-top:6px;line-height:1.7;letter-spacing:0.1px;word-break:break-word;">${escapeHtml(pkg.description)}</div>
  </div>`;
}

function buildHighlights(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  if (!pkg.highlights || pkg.highlights.length === 0) return '';
  const items = pkg.highlights.map(h => `<div data-pdf-break="1" class="highlight-item-card" style="flex:1 1 45%;min-width:260px;background:${C.slate50};border:1px solid ${C.slate200};border-radius:8px;padding:10px 12px;font-size:11px;font-weight:600;color:${C.slate800};line-height:1.5;display:flex;align-items:flex-start;gap:8px;box-sizing:border-box;word-break:break-word;"><span style="color:${C.sky};font-weight:bold;flex-shrink:0;margin-top:2px;">&#9679;</span><span style="flex:1;">${escapeHtml(h)}</span></div>`);
  return `
  <div data-pdf-block="1" style="margin-top:14px;width:100%;box-sizing:border-box;">
    <div style="font-size:13px;font-weight:bold;color:${C.navy};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.keyHighlights)}</div>
    <div class="highlights-grid" style="display:flex;flex-wrap:wrap;gap:7px;width:100%;">${items.join('')}</div>
  </div>`;
}

function buildWhoShouldJoin(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  if (!pkg.whoShouldJoin || pkg.whoShouldJoin.length === 0) return '';
  const items = pkg.whoShouldJoin.map(item => `
    <div data-pdf-break="1" class="who-should-join-card" style="flex:1 1 45%;min-width:260px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 12px;font-size:11px;font-weight:600;color:${C.slate800};line-height:1.5;display:flex;align-items:flex-start;gap:8px;box-sizing:border-box;word-break:break-word;">
      <span style="color:${C.emerald600};font-weight:bold;flex-shrink:0;margin-top:2px;">👥</span>
      <span style="flex:1;">${escapeHtml(item)}</span>
    </div>
  `);
  return `
  <div data-pdf-block="1" style="margin-top:14px;width:100%;box-sizing:border-box;">
    <div style="font-size:13px;font-weight:bold;color:${C.navy};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.whoShouldJoin || 'Who Should Join?')}</div>
    <div class="who-should-join-grid" style="display:flex;flex-wrap:wrap;gap:7px;width:100%;">${items.join('')}</div>
  </div>`;
}

function buildWhyShouldJoin(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  if (!pkg.whyShouldJoin || pkg.whyShouldJoin.length === 0) return '';
  const items = pkg.whyShouldJoin.map(item => `
    <div data-pdf-break="1" class="why-should-join-card" style="flex:1 1 45%;min-width:260px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;font-size:11px;font-weight:600;color:${C.slate800};line-height:1.5;display:flex;align-items:flex-start;gap:8px;box-sizing:border-box;word-break:break-word;">
      <span style="color:${C.skyDark};font-weight:bold;flex-shrink:0;margin-top:2px;">🚀</span>
      <span style="flex:1;">${escapeHtml(item)}</span>
    </div>
  `);
  return `
  <div data-pdf-block="1" style="margin-top:14px;width:100%;box-sizing:border-box;">
    <div style="font-size:13px;font-weight:bold;color:${C.navy};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.whyShouldJoin || 'Why You Should Join')}</div>
    <div class="why-should-join-grid" style="display:flex;flex-wrap:wrap;gap:7px;width:100%;">${items.join('')}</div>
  </div>`;
}

function buildOptionalPrograms(pkg: TourPackage, labels: PdfLabels, selectedIds: string[], settings?: SystemSettings): string {
  const C = getExportColors(settings);
  if (!pkg.optionalPrograms || pkg.optionalPrograms.length === 0) return '';
  const progs = pkg.optionalPrograms.map(p => {
    const sel = selectedIds.includes(p.id);
    const bg = sel ? C.emerald50 : C.white;
    const border = sel ? C.emerald500 : C.slate200;
    const badge = sel ? `<span class="pdf-tag-pill pdf-tag-pill-emerald" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.emerald600};color:${C.white};padding:0 8px;border-radius:4px;font-size:9px;font-weight:bold;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">✓ ${escapeHtml(labels.includedInDelegation)}</span></span>` : '';
    
    const highlightsHtml = p.highlights?.length ? `
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">
        ${p.highlights.map(h => `<span class="pdf-tag-pill pdf-tag-pill-slate" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.slate100};border:1px solid ${C.slate200};color:${C.slate700};font-size:9px;padding:0 7px;border-radius:4px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">• ${escapeHtml(h)}</span></span>`).join('')}
      </div>
    ` : '';

    const mealsHtml = p.includedMeals?.length ? `
      <div style="font-size:10px;color:${C.emerald600};margin-top:5px;font-weight:bold;display:flex;align-items:center;gap:4px;line-height:1.35;"><span style="flex-shrink:0;">🍽️</span><span>${escapeHtml(labels.includedMealsLabel || 'Meals Included')}: ${escapeHtml(p.includedMeals.join(', '))}</span></div>
    ` : '';

    return `
    <div class="opt-program-card" data-pdf-block="1" style="background:${bg};border:1.5px solid ${border};border-radius:9px;padding:12px 14px;margin-top:10px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 3px rgba(0,0,0,0.02);width:100%;box-sizing:border-box;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:12.5px;font-weight:bold;color:${C.navy};line-height:1.35;word-break:break-word;">${escapeHtml(p.title)}</div>
        <div style="font-size:11px;color:${C.slate600};margin-top:4px;line-height:1.55;word-break:break-word;">${escapeHtml(p.description)}</div>
        ${highlightsHtml}
        ${mealsHtml}
        <div style="font-size:10px;color:${C.slate500};margin-top:5px;line-height:1.4;word-break:break-word;">${escapeHtml(labels.durationHours)}: ${p.durationHours} hrs | ${escapeHtml(labels.audience)}: ${escapeHtml(p.recommendedAudience || labels.defaultTravelerName)} | ${escapeHtml(labels.assembly)}: ${escapeHtml(p.meetingPoint || labels.defaultAssemblyLocation)}</div>
      </div>
      <div class="opt-program-price" style="text-align:right;flex-shrink:0;max-width:150px;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:4px;">
        <div style="font-size:14px;font-weight:bold;color:${C.emerald600};font-family:monospace;line-height:1.2;white-space:nowrap;">+$${p.additionalCostUSD} USD ${escapeHtml(labels.perPerson.startsWith('/') ? labels.perPerson : `/ ${labels.perPerson}`)}</div>
        ${badge}
      </div>
    </div>`;
  }).join('');
  return `<div style="margin-top:16px;width:100%;box-sizing:border-box;"><div data-pdf-block="1" data-pdf-keep-next="1" style="font-size:13px;font-weight:bold;color:${C.navy};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.optionalPrograms)}</div>${progs}</div>`;
}

function buildInclusionsExclusions(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const incs = pkg.inclusions.map(i => `<div data-pdf-break="1" style="font-size:11px;color:${C.slate700};margin-top:6px;line-height:1.55;word-break:break-word;"><span style="color:${C.emerald500};font-weight:bold;">&#10003;</span> ${escapeHtml(i)}</div>`).join('');
  const excs = pkg.exclusions.map(e => `<div data-pdf-break="1" style="font-size:11px;color:${C.slate700};margin-top:6px;line-height:1.55;word-break:break-word;"><span style="color:${C.rose600};font-weight:bold;">&#10005;</span> ${escapeHtml(e)}</div>`).join('');
  return `
  <div class="inc-exc-row" data-pdf-block="1" style="display:flex;gap:12px;margin-top:14px;width:100%;box-sizing:border-box;">
    <div style="flex:1;min-width:0;background:${C.emerald50};border:1px solid ${C.emerald200};border-radius:9px;padding:14px 16px;box-sizing:border-box;">
      <div style="font-size:12px;font-weight:bold;color:${C.emerald600};text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.packageInclusions)}</div>
      ${incs}
    </div>
    <div style="flex:1;min-width:0;background:${C.rose50};border:1px solid ${C.rose200};border-radius:9px;padding:14px 16px;box-sizing:border-box;">
      <div style="font-size:12px;font-weight:bold;color:${C.rose800};text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(labels.packageExclusions)}</div>
      ${excs}
    </div>
  </div>`;
}

function buildEmergency(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const e = pkg.emergencyContact;
  const hotline = settings?.emergencyHotline || settings?.companyPhone || '060 815 515';
  return `
  <div data-pdf-block="1" style="background:${C.blue50};border:1px solid ${C.blue200};border-radius:9px;padding:14px 16px;margin-top:14px;width:100%;box-sizing:border-box;">
    <div style="font-size:12px;font-weight:bold;color:${C.blue900};text-transform:uppercase;letter-spacing:0.5px;">🚨 ${escapeHtml(labels.emergencyAssistance)} (${escapeHtml(e.country)})</div>
    <div style="font-size:11px;color:${C.slate700};margin-top:6px;line-height:1.65;word-break:break-word;">
      <div>${escapeHtml(labels.localPolice)}: <strong>${escapeHtml(e.police)}</strong></div>
      <div style="margin-top:2px;">${escapeHtml(labels.ambulance)}: <strong>${escapeHtml(e.ambulance)}</strong></div>
      <div style="margin-top:2px;">${escapeHtml(labels.touristSos)}: <strong>${escapeHtml(e.touristHelpline)}</strong></div>
    </div>
    <div style="font-size:11px;color:${C.slate700};margin-top:5px;line-height:1.5;display:flex;flex-wrap:wrap;gap:4px 10px;word-break:break-word;">
      <span>${escapeHtml(labels.embassySupport)}: <strong>${escapeHtml(e.embassySupport)}</strong></span>
      <span>${escapeHtml(labels.khbDispatch)}: <strong>${escapeHtml(hotline)}</strong></span>
    </div>
  </div>`;
}

function buildTerms(pkg: TourPackage, labels: PdfLabels, travelerName: string, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const terms = (pkg.termsAndConditions?.length ? pkg.termsAndConditions : labels.defaultTerms);
  const items = terms.map(t => `<div data-pdf-break="1" style="font-size:10.5px;color:${C.slate700};margin-top:5px;line-height:1.6;word-break:break-word;"><span style="color:${C.amber500}; font-weight:bold;">&#8226;</span> ${escapeHtml(t)}</div>`).join('');
  const signatureImg = settings?.leadCoordinatorSignatureUrl ? `
    <div style="margin-top:4px;">
      <img src="${escapeHtml(settings.leadCoordinatorSignatureUrl)}" alt="Signature" style="max-height:32px;object-fit:contain;display:inline-block;" />
    </div>
  ` : '';

  return `
  <div data-pdf-block="1" style="background:${C.amber50};border:1px solid #fbbf24;border-radius:9px;padding:14px 16px;margin-top:14px;width:100%;box-sizing:border-box;">
    <div style="font-size:12px;font-weight:bold;color:${C.amber800};text-transform:uppercase;letter-spacing:0.5px;">📜 ${escapeHtml(labels.termsAndConditions)}</div>
    ${items}
  </div>
  <div class="signatures-row" data-pdf-block="1" style="display:flex;justify-content:space-between;margin-top:18px;border-top:1px dashed ${C.slate300};padding-top:12px;width:100%;box-sizing:border-box;flex-wrap:wrap;gap:8px;">
    <div style="flex:1;min-width:180px;font-size:10.5px;color:${C.slate500};word-break:break-word;">${escapeHtml(labels.delegateSignature)}: <strong>${escapeHtml(travelerName)}</strong></div>
    <div style="flex:1;min-width:180px;text-align:right;font-size:10.5px;color:${C.slate500};word-break:break-word;">
      <div>${escapeHtml(labels.operationsSeal)}: <strong>${escapeHtml(settings?.companyName || 'KHB OPERATIONS DIRECTORY')}</strong></div>
      ${signatureImg}
    </div>
  </div>`;
}

function buildPageHeader(pkg: TourPackage, labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const companyName = settings?.companyName || labels.systemName;
  return `
  <div class="page-top-header" style="background:${C.navy};border-radius:8px;padding:9px 14px;border-left:4px solid ${C.sky};display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;box-sizing:border-box;width:100%;">
    <div style="font-size:11.5px;font-weight:bold;color:${C.white};display:flex;align-items:center;gap:6px;flex:1;min-width:0;flex-wrap:wrap;">
      <span>${escapeHtml(companyName)}</span>
      <span style="color:${C.skyLight};">•</span>
      <span style="color:${C.skyLight};font-weight:normal;word-break:break-word;">${escapeHtml(pkg.title)}</span>
    </div>
    <div style="font-size:9.5px;color:${C.slate400};text-align:right;flex-shrink:0;word-break:break-word;">
      ${escapeHtml(labels.destination)}: <strong>${escapeHtml(pkg.destination)}</strong> | Ref: <strong>KHB-AGN-${pkg.id.slice(0, 8).toUpperCase()}</strong>
    </div>
  </div>`;
}

function buildPageFooter(pkg: TourPackage, labels: PdfLabels, pageNum: number, totalPages: number, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const hotline = settings?.emergencyHotline || settings?.companyPhone || '+855 60 815 515';
  const telegram = settings?.leadCoordinatorTelegram || settings?.telegramChannel || '@VuthaTim';
  return `
  <div class="page-bottom-footer" style="border-top:1px solid ${C.slate200};padding-top:8px;margin-top:16px;display:flex;justify-content:space-between;align-items:center;font-size:9px;color:${C.slate400};box-sizing:border-box;width:100%;flex-wrap:wrap;gap:6px;">
    <div style="word-break:break-word;">${escapeHtml(labels.hotline)}: <strong>${escapeHtml(hotline)}</strong> • Telegram: <strong>${escapeHtml(telegram)}</strong></div>
    <div>${escapeHtml(labels.confidentialDocument)} • ${escapeHtml(labels.page)} ${pageNum} / ${totalPages}</div>
  </div>`;
}

function buildItineraryDays(steps: ItineraryStep[], labels: PdfLabels, settings?: SystemSettings): string {
  const C = getExportColors(settings);
  const daysHtml = steps.map(step => {
    const slots = getStepAgendaSlots(step, labels);
    
    const hasMeta = !!(step.hotelName || (step.mealsIncluded && step.mealsIncluded.length > 0));
    const metaTagsHtml = hasMeta ? `
      <div class="day-meta-tags" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
        ${step.hotelName ? `<span class="day-meta-pill" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.white};border:1px solid ${C.slate200};color:${C.slate600};padding:0 7px;border-radius:4px;font-size:9px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">🏨 ${escapeHtml(step.hotelName)}</span></span>` : ''}
        ${step.mealsIncluded?.length ? `<span class="day-meta-pill" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.white};border:1px solid ${C.slate200};color:${C.slate600};padding:0 7px;border-radius:4px;font-size:9px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">🍽️ ${escapeHtml(step.mealsIncluded.join(', '))}</span></span>` : ''}
      </div>
    ` : '';
    
    const assemblyPart = (step.assemblyPoint || step.assemblyTime) ? `
      <div style="font-size:10.5px;color:${C.amber800};background:#fef3c7;padding:5px 10px;border-bottom:1px solid ${C.slate200};display:flex;align-items:center;gap:4px;line-height:1.35;word-break:break-word;">
        <span style="flex-shrink:0;">📍</span>
        <span><strong>${escapeHtml(labels.assemblyPoint)}:</strong> ${escapeHtml(step.assemblyPoint || '')} ${step.assemblyTime ? `(${escapeHtml(step.assemblyTime)})` : ''}</span>
      </div>
    ` : '';

    const dayHighlightsPart = step.dayHighlights?.length ? `
      <div style="display:flex;flex-wrap:wrap;gap:4px;padding:5px 10px;background:#f0f9ff;border-bottom:1px solid ${C.slate200};align-items:center;">
        ${step.dayHighlights.map(h => `<span class="day-meta-pill" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.white};border:1px solid ${C.skyLight};color:${C.skyDark};font-size:9px;font-weight:bold;padding:0 7px;border-radius:4px;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">★ ${escapeHtml(h)}</span></span>`).join('')}
      </div>
    ` : '';

    const slotRows = slots.map(s => {
      const locPart = s.location ? `<div style="font-size:10px;color:${C.slate500};margin-top:1px;display:flex;align-items:center;gap:3px;line-height:1.35;word-break:break-word;"><span style="flex-shrink:0;">📍</span><span>${escapeHtml(s.location)}</span></div>` : '';
      const notePart = s.notes ? `<div style="font-size:10px;color:${C.slate600};font-style:italic;margin-top:1px;display:flex;align-items:center;gap:3px;line-height:1.35;word-break:break-word;"><span style="flex-shrink:0;">💡</span><span>${escapeHtml(labels.note)} ${escapeHtml(s.notes)}</span></div>` : '';
      return `
      <div class="itinerary-slot-row" style="border-bottom:1px solid ${C.slate100};padding:7px 10px;display:flex;align-items:center;gap:10px;box-sizing:border-box;width:100%;">
        <div class="itinerary-time-badge" style="min-width:150px;width:150px;height:26px;white-space:nowrap;flex-shrink:0;font-size:10px;font-weight:bold;color:${C.skyDark};font-family:monospace;background:${C.white};border:1px solid ${C.slate200};border-radius:5px;padding:0 7px;display:inline-flex;align-items:center;justify-content:center;gap:3px;text-align:center;box-sizing:border-box;line-height:1;">
          <span class="pdf-pill-text" style="display:inline-flex;align-items:center;gap:3px;"><span>⏱️</span><span>${escapeHtml(s.time)}</span></span>
        </div>
        <div class="itinerary-slot-body" style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-size:11.5px;font-weight:bold;color:${C.navy};line-height:1.35;word-break:break-word;">${escapeHtml(s.activity)}</div>
          ${locPart}${notePart}
        </div>
      </div>`;
    }).join('');

    const descPart = step.description ? `<div style="padding:7px 10px;font-size:10px;color:${C.slate600};font-style:italic;line-height:1.5;background:${C.white};border-bottom:1px solid ${C.slate100};word-break:break-word;">${escapeHtml(labels.overview)} ${escapeHtml(step.description)}</div>` : '';

    return `
    <div class="itinerary-day-box" data-pdf-block="1" style="border:1px solid ${C.slate200};border-radius:8px;overflow:hidden;margin-top:10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);width:100%;box-sizing:border-box;page-break-inside:avoid;break-inside:avoid;">
      <div class="itinerary-day-header" style="background:${C.slate100};padding:8px 12px;border-bottom:1px solid ${C.slate200};display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;width:100%;box-sizing:border-box;">
        <div class="day-title-group" style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
          <span class="day-number-badge" style="display:inline-block;vertical-align:middle;text-align:center;height:18px;line-height:18px;background:${C.navy};color:${C.white};padding:0 8px;border-radius:4px;font-size:9px;font-weight:bold;flex-shrink:0;box-sizing:border-box;white-space:nowrap;"><span class="pdf-pill-text">${escapeHtml(labels.day)} ${step.day}</span></span>
          <span class="day-title-text" style="font-size:12px;font-weight:bold;color:${C.navy};word-break:break-word;line-height:1.35;">${escapeHtml(step.title)}</span>
        </div>
        ${metaTagsHtml}
      </div>
      ${assemblyPart}
      ${dayHighlightsPart}
      ${descPart}
      <div style="background:${C.slate50};width:100%;">${slotRows}</div>
    </div>`;
  }).join('');

  return daysHtml;
}

function buildA4Pages(pkg: TourPackage, labels: PdfLabels, opts: { selectedDate: string; travelerName: string; selectedOptionalProgramIds: string[]; watermark?: WatermarkOptions; systemSettings?: SystemSettings }, lang: LanguageCode = 'en'): string[] {
  // Sync color palette for this render pass
  C = getExportColors(opts.systemSettings);
  const typo = getResolvedTypography(opts.systemSettings);

  const dir = (lang === 'ar' || lang === 'he') ? 'rtl' : 'ltr';
  const docRef = `KHB-AGN-${pkg.id.slice(0, 8).toUpperCase()}`;

  const itinerarySteps = pkg.itinerary || [];

  // PAGE 1: Cover & Mission Executive Profile
  const page1Content = `
    <div style="margin-bottom:12px;width:100%;box-sizing:border-box;">
      ${buildHeader(pkg, labels, { selectedDate: opts.selectedDate, travelerName: opts.travelerName, docRef, systemSettings: opts.systemSettings })}
      ${buildImageGallery(pkg, labels, opts.systemSettings)}
      ${buildTitleBlock(pkg, labels, opts.systemSettings)}
      ${buildBadges(pkg, labels, opts.selectedDate, opts.systemSettings)}
      ${buildTourDirector(pkg, labels, opts.systemSettings)}
      ${buildDescription(pkg, labels, opts.systemSettings)}
    </div>
  `;

  // Value, Highlights & Commercial compliance blocks
  const hasHighlights = pkg.highlights && pkg.highlights.length > 0;
  const hasWhoShouldJoin = (pkg.whoShouldJoin && pkg.whoShouldJoin.length > 0) || (pkg.whoShouldJoinKm && pkg.whoShouldJoinKm.length > 0);
  const hasWhyShouldJoin = (pkg.whyShouldJoin && pkg.whyShouldJoin.length > 0) || (pkg.whyShouldJoinKm && pkg.whyShouldJoinKm.length > 0);
  const hasPrograms = pkg.optionalPrograms && pkg.optionalPrograms.length > 0;

  const benefitsBlock = (hasHighlights || hasWhoShouldJoin || hasWhyShouldJoin) ? `
    ${buildHighlights(pkg, labels, opts.systemSettings)}
    ${buildWhoShouldJoin(pkg, labels, opts.systemSettings)}
    ${buildWhyShouldJoin(pkg, labels, opts.systemSettings)}
  ` : '';

  const programsBlock = hasPrograms ? buildOptionalPrograms(pkg, labels, opts.selectedOptionalProgramIds, opts.systemSettings) : '';

  const complianceBlock = `
    ${buildInclusionsExclusions(pkg, labels, opts.systemSettings)}
    ${buildEmergency(pkg, labels, opts.systemSettings)}
    ${buildTerms(pkg, labels, opts.travelerName, opts.systemSettings)}
  `;

  const dynamicPages: string[] = [];
  const DAYS_PER_PAGE = 2;
  const totalItinPages = Math.max(1, Math.ceil(itinerarySteps.length / DAYS_PER_PAGE));

  for (let i = 0; i < itinerarySteps.length; i += DAYS_PER_PAGE) {
    const chunk = itinerarySteps.slice(i, i + DAYS_PER_PAGE);
    const pageIndex = Math.floor(i / DAYS_PER_PAGE) + 1;
    const isSingleDayChunk = chunk.length === 1;

    dynamicPages.push(`
      <div style="margin-bottom:12px;width:100%;box-sizing:border-box;">
        ${buildPageHeader(pkg, labels, opts.systemSettings)}
        <div style="font-size:13px;font-weight:bold;color:${C.navy};font-family:${typo.headingFont};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${escapeHtml(labels.detailedItinerary)} ${totalItinPages > 1 ? `(Part ${pageIndex}/${totalItinPages})` : ''}</div>
        ${buildItineraryDays(chunk, labels, opts.systemSettings)}
        ${isSingleDayChunk && hasHighlights ? buildHighlights(pkg, labels, opts.systemSettings) : ''}
      </div>
    `);
  }

  if (itinerarySteps.length === 0) {
    dynamicPages.push(`
      <div style="margin-bottom:12px;width:100%;box-sizing:border-box;">
        ${buildPageHeader(pkg, labels, opts.systemSettings)}
        <div style="font-size:13px;font-weight:bold;color:${C.navy};font-family:${typo.headingFont};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${escapeHtml(labels.detailedItinerary)}</div>
        <div style="font-size:11.5px;color:${C.slate500};font-style:italic;padding:10px 0;">${escapeHtml(lang === 'km' ? 'កាលវិភាគលម្អិតនឹងត្រូវបានចែកចាយពេលជួបជុំគណៈប្រតិភូ។' : 'Detailed itinerary will be distributed upon group assembly.')}</div>
        ${benefitsBlock}
      </div>
    `);
    if (programsBlock && programsBlock.trim().length > 0) {
      dynamicPages.push(`
        <div style="margin-bottom:12px;width:100%;box-sizing:border-box;">
          ${buildPageHeader(pkg, labels, opts.systemSettings)}
          ${programsBlock}
        </div>
      `);
    }
  } else {
    // If benefits were not attached to a single trailing day, give benefits a dedicated clean page
    const benefitsAlreadyRendered = itinerarySteps.length % DAYS_PER_PAGE === 1 && hasHighlights;
    const remainingBenefits = !benefitsAlreadyRendered ? benefitsBlock : (
      (hasWhoShouldJoin || hasWhyShouldJoin) ? `
        ${buildWhoShouldJoin(pkg, labels, opts.systemSettings)}
        ${buildWhyShouldJoin(pkg, labels, opts.systemSettings)}
      ` : ''
    );

    if (remainingBenefits && remainingBenefits.trim().length > 0) {
      dynamicPages.push(`
        <div style="margin-bottom:12px;width:100%;box-sizing:border-box;">
          ${buildPageHeader(pkg, labels, opts.systemSettings)}
          ${remainingBenefits}
        </div>
      `);
    }

    // VIP Commercial Optional Programs on dedicated clean page
    if (programsBlock && programsBlock.trim().length > 0) {
      dynamicPages.push(`
        <div style="margin-bottom:12px;width:100%;box-sizing:border-box;">
          ${buildPageHeader(pkg, labels, opts.systemSettings)}
          ${programsBlock}
        </div>
      `);
    }
  }

  // Commercial Compliance, Inclusions/Exclusions, Emergency & Authorizations Page
  dynamicPages.push(`
    <div style="margin-bottom:12px;width:100%;box-sizing:border-box;">
      ${buildPageHeader(pkg, labels, opts.systemSettings)}
      ${complianceBlock}
    </div>
  `);

  const allPageBodies = [page1Content, ...dynamicPages];
  const totalPages = allPageBodies.length;
  const watermarkHtml = buildWatermarkHtml(opts.watermark);

  return allPageBodies.map((content, idx) => {
    const pageNum = idx + 1;
    return `
    <div class="pdf-a4-page" data-page="${pageNum}" dir="${dir}" style="font-family:${getFontFamily(lang, opts.systemSettings)};width:100%;max-width:794px;min-height:1123px;padding:32px 36px 28px 36px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;background:#ffffff;position:relative;margin:0 auto 28px auto;">
      ${watermarkHtml}
      <div style="flex:1;display:flex;flex-direction:column;width:100%;box-sizing:border-box;position:relative;z-index:1;">
        ${content}
      </div>
      <div style="position:relative;z-index:2;margin-top:14px;">
        ${buildPageFooter(pkg, labels, pageNum, totalPages, opts.systemSettings)}
      </div>
    </div>`;
  });
}

function buildWatermarkHtml(watermark?: WatermarkOptions): string {
  if (!watermark || !watermark.enabled || !watermark.text?.trim()) return '';
  const text = escapeHtml(watermark.text.trim());
  const opacity = watermark.opacity !== undefined ? watermark.opacity : 0.12;
  const color = watermark.color || '#0f172a';
  const fontSize = watermark.fontSize || 36;
  const layout = watermark.layout || 'diagonal';

  if (layout === 'confidential_bar') {
    return `
      <div class="pdf-watermark-overlay" style="position:absolute;top:18px;left:0;right:0;width:100%;pointer-events:none;z-index:9999;display:flex;align-items:center;justify-content:center;user-select:none;">
        <div style="background:${color};color:#ffffff;opacity:${Math.min(1, opacity + 0.5)};font-size:11px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;padding:5px 24px;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
          🛡️ ${text}
        </div>
      </div>
    `;
  }
  const rotation = layout === 'center_stamp' ? '0deg' : '-32deg';

  return `
    <div class="pdf-watermark-overlay" style="position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;pointer-events:none;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden;user-select:none;">
      <div style="transform:rotate(${rotation});color:${color};opacity:${opacity};font-size:${fontSize}px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;font-family:'Montserrat',sans-serif,Arial;border:3.5px dashed ${color};padding:14px 34px;border-radius:14px;text-align:center;line-height:1.2;white-space:nowrap;box-shadow:0 0 0 6px rgba(255,255,255,0.45);max-width:90%;">
        ${text}
      </div>
    </div>
  `;
}

function buildAgendaBody(pkg: TourPackage, labels: PdfLabels, opts: { selectedDate: string; travelerName: string; selectedOptionalProgramIds: string[]; watermark?: WatermarkOptions; systemSettings?: SystemSettings }, lang: LanguageCode = 'en'): string {
  const pages = buildA4Pages(pkg, labels, opts, lang);
  return `<div id="agenda-content" style="width:100%;">${pages.join('\n')}</div>`;
}

function buildStandaloneHtmlDocument(body: string, pkg: TourPackage, lang: LanguageCode, title: string, settings?: SystemSettings): string {
  const labels = getPdfLabels(lang);
  const cleanTitle = escapeHtml(pkg.title);
  const cleanDesc = escapeHtml(`📍 ${pkg.destination}, ${pkg.country} • 🗓️ ${pkg.durationDays} Days / ${pkg.durationNights} Nights • 💼 Official B2B Trade Mission Agenda`);
  const cleanImage = escapeHtml(pkg.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80');
  const palette = getResolvedThemePalette(settings);
  const typo = getResolvedTypography(settings);
  const themeCss = generateThemeCssVariables(settings);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<title>${cleanTitle} | ${escapeHtml(settings?.companyName || 'KHB Business Trips')}</title>
<meta name="description" content="${cleanDesc}">

<!-- Open Graph / Social Media Preview (Telegram, WhatsApp, Facebook, LinkedIn) -->
<meta property="og:site_name" content="${escapeHtml(settings?.companyName || 'KHB Business Trips')}">
<meta property="og:title" content="${cleanTitle}">
<meta property="og:description" content="${cleanDesc}">
<meta property="og:image" content="${cleanImage}">
<meta property="og:image:alt" content="${cleanTitle}">
<meta property="og:type" content="article">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${cleanTitle}">
<meta name="twitter:description" content="${cleanDesc}">
<meta name="twitter:image" content="${cleanImage}">

<meta name="theme-color" content="${palette.secondary}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="format-detection" content="telephone=no">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Battambang:wght@300;400;700;900&family=Cinzel:wght@500;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800;1,9..40,400&family=Hanuman:wght@300;400;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Koulen&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+Hebrew:wght@400;700&family=Noto+Sans+JP:wght@400;700&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Siemreap&display=swap" rel="stylesheet">

<style>
  ${themeCss}
  * { 
    box-sizing: border-box; 
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }
  body { 
    margin: 0; 
    padding: 20px 12px 40px 12px; 
    background: #e2e8f0; 
    font-family: ${getFontFamily(lang, settings)}; 
    letter-spacing: ${typo.letterSpacing};
    line-height: ${typo.lineHeight};
    -webkit-font-smoothing: antialiased;
    -webkit-overflow-scrolling: touch;
    overflow-x: hidden;
  }
  h1, h2, h3, h4, h5, h6, .font-heading {
    font-family: ${typo.headingFont};
    font-weight: ${typo.headingWeight};
  }
  .no-print-toolbar {
    position: sticky;
    top: 10px;
    z-index: 1000;
    max-width: 794px;
    width: 100%;
    margin: 0 auto 16px auto;
    padding: 10px 16px;
    background: ${palette.secondary};
    color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    gap: 12px;
  }
  .no-print-toolbar button {
    background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryHover});
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .no-print-toolbar button:active {
    transform: scale(0.98);
  }
  #agenda-content { 
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 100%;
  }
  .pdf-a4-page {
    width: 100%;
    max-width: 794px;
    min-height: 1123px;
    margin: 0 auto;
    padding: 32px 36px 30px 36px;
    background: #ffffff !important;
    box-shadow: 0 6px 24px rgba(0,0,0,0.08);
    border-radius: 8px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
    overflow-x: hidden;
  }
  .pdf-a4-page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
    margin-bottom: 0 !important;
  }
  .header-main-box {
    color: #ffffff !important;
  }
  .header-main-box div,
  .header-main-box span,
  .header-main-box p,
  .header-main-box strong,
  .header-main-box h1,
  .header-main-box h2,
  .header-main-box h3,
  .header-main-box h4 {
    color: #ffffff !important;
  }
  .header-main-box .pdf-tag-pill-emerald {
    color: #ffffff !important;
  }
  .header-main-box .pdf-tag-pill-amber {
    color: #0f172a !important;
  }
  .header-main-box .pdf-tag-pill-amber span {
    color: #0f172a !important;
  }
  .pdf-tag-pill {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    vertical-align: middle !important;
    text-align: center !important;
    height: 18px !important;
    line-height: 1 !important;
    padding: 0 8px !important;
    border-radius: 4px !important;
    font-family: inherit !important;
    font-size: 8.5px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }
  .pdf-tag-pill .pdf-pill-text,
  .day-meta-pill .pdf-pill-text,
  .day-number-badge .pdf-pill-text,
  .gallery-hero-badge-right .pdf-pill-text,
  .itinerary-time-badge .pdf-pill-text,
  .pdf-pill-text {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    vertical-align: middle !important;
    position: static !important;
    top: 0 !important;
  }
  .pdf-tag-pill-sky {
    background: ${palette.primary} !important;
    color: #ffffff !important;
  }
  .pdf-tag-pill-amber {
    background: ${palette.accent} !important;
    color: ${palette.secondary} !important;
  }
  .pdf-tag-pill-emerald {
    background: #059669 !important;
    color: #ffffff !important;
  }
  .pdf-tag-pill-slate {
    background: #f1f5f9 !important;
    border: 1px solid #e2e8f0 !important;
    color: #334155 !important;
  }
  .day-meta-pill {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    vertical-align: middle !important;
    text-align: center !important;
    height: 18px !important;
    line-height: 1 !important;
    padding: 0 7px !important;
    border-radius: 4px !important;
    font-family: inherit !important;
    font-size: 9px !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
  }
  .day-number-badge {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    vertical-align: middle !important;
    text-align: center !important;
    height: 18px !important;
    line-height: 1 !important;
    padding: 0 8px !important;
    border-radius: 4px !important;
    font-family: inherit !important;
    font-size: 9.5px !important;
    font-weight: 700 !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
  }

  /* HTML2Canvas Rasterization Correction */
  body.pdf-canvas-export .pdf-tag-pill,
  body.pdf-canvas-export .day-meta-pill,
  body.pdf-canvas-export .day-number-badge,
  body.pdf-canvas-export .gallery-hero-badge-right {
    display: inline-block !important;
    vertical-align: middle !important;
    text-align: center !important;
    line-height: 18px !important;
  }
  body.pdf-canvas-export .pdf-tag-pill .pdf-pill-text,
  body.pdf-canvas-export .day-meta-pill .pdf-pill-text,
  body.pdf-canvas-export .day-number-badge .pdf-pill-text,
  body.pdf-canvas-export .gallery-hero-badge-right .pdf-pill-text,
  body.pdf-canvas-export .itinerary-time-badge .pdf-pill-text,
  body.pdf-canvas-export .pdf-pill-text {
    position: relative !important;
    top: -5px !important;
    display: inline-block !important;
    line-height: 1 !important;
    vertical-align: middle !important;
  }
  img { 
    max-width: 100%; 
    object-fit: cover !important;
    object-position: center !important;
    display: block; 
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  /* Responsive Tablet Styling */
  @media screen and (min-width: 769px) and (max-width: 1024px) {
    body {
      padding: 16px 12px 36px 12px !important;
    }
    .pdf-a4-page {
      padding: 24px 26px 24px 26px !important;
      max-width: 760px !important;
    }
    .itinerary-time-badge {
      min-width: 145px !important;
      width: 145px !important;
    }
  }
  /* Responsive Mobile & Telegram In-App Browser Styling */
  @media screen and (max-width: 768px) {
    body {
      padding: 6px 4px 24px 4px !important;
      background: #f1f5f9 !important;
    }
    .no-print-toolbar {
      flex-direction: column !important;
      align-items: stretch !important;
      text-align: center !important;
      padding: 10px 12px !important;
      gap: 8px !important;
      border-radius: 10px !important;
    }
    .no-print-toolbar button {
      width: 100% !important;
      padding: 10px 14px !important;
    }
    #agenda-content {
      gap: 12px !important;
    }
    .pdf-a4-page {
      padding: 14px 10px 16px 10px !important;
      min-height: auto !important;
      border-radius: 10px !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
      margin-bottom: 8px !important;
    }
    .header-main-box {
      flex-direction: column !important;
      align-items: flex-start !important;
      padding: 14px 12px !important;
      gap: 12px !important;
    }
    .header-meta-box {
      width: 100% !important;
      text-align: left !important;
      border-top: 1px solid rgba(255,255,255,0.15) !important;
      padding-top: 10px !important;
      margin-top: 2px !important;
    }
    .badges-row {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 6px !important;
    }
    .gallery-sub-grid {
      grid-template-columns: repeat(3, 1fr) !important;
      height: auto !important;
      gap: 5px !important;
    }
    .gallery-sub-grid > div {
      height: 52px !important;
    }
    .guide-box {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      gap: 12px !important;
    }
    .itinerary-day-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
      padding: 10px 12px !important;
      width: 100% !important;
    }
    .day-title-group {
      width: 100% !important;
      display: flex !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .day-number-badge {
      margin-top: 2px !important;
      flex-shrink: 0 !important;
    }
    .day-title-text {
      flex: 1 !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      word-break: break-word !important;
    }
    .day-meta-tags {
      width: 100% !important;
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: flex-start !important;
      gap: 5px !important;
      border-top: 1px dashed rgba(0,0,0,0.08) !important;
      padding-top: 6px !important;
      margin-top: 2px !important;
    }
    .day-meta-pill {
      font-size: 9px !important;
      padding: 2px 6px !important;
      word-break: break-word !important;
      max-width: 100% !important;
    }
    .itinerary-slot-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 6px !important;
      padding: 8px 10px !important;
    }
    .itinerary-time-badge {
      width: 100% !important;
      min-width: 100% !important;
      justify-content: flex-start !important;
      height: 26px !important;
      font-size: 10px !important;
    }
    .inc-exc-row {
      flex-direction: column !important;
      gap: 10px !important;
    }
    .opt-program-card {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 10px !important;
      padding: 12px !important;
    }
    .opt-program-price {
      width: 100% !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-top: 1px solid rgba(0,0,0,0.06) !important;
      padding-top: 8px !important;
      margin-top: 2px !important;
    }
    .signatures-row {
      flex-direction: column !important;
      gap: 8px !important;
    }
    .signatures-row > div:last-child {
      text-align: left !important;
    }
    .page-top-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
      padding: 8px 10px !important;
    }
    .page-bottom-footer {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 4px !important;
      text-align: left !important;
    }
    .highlight-item-card {
      min-width: 100% !important;
      flex: 1 1 100% !important;
      margin: 0 !important;
    }
    .header-brand-box {
      width: 100% !important;
    }
    .gallery-hero-badge-left {
      font-size: 8px !important;
      padding: 3px 8px !important;
      max-width: calc(100% - 16px) !important;
    }
  }
  @media print { 
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    html, body { 
      width: 100% !important;
      height: auto !important;
      min-height: 100% !important;
      background: #ffffff !important; 
      padding: 0 !important; 
      margin: 0 !important; 
      overflow: visible !important;
    } 
    .no-print, .no-print-toolbar, .print\:hidden {
      display: none !important;
    }
    #agenda-content { 
      display: block !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      gap: 0 !important;
    } 
    .pdf-a4-page {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      max-height: none !important;
      min-height: auto !important;
      margin: 0 !important;
      padding: 0 0 6mm 0 !important;
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      page-break-before: auto !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      break-inside: avoid-page !important;
      box-sizing: border-box !important;
      overflow: visible !important;
      position: relative !important;
    }
    .pdf-a4-page:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    .page-bottom-footer {
      margin-top: 14px !important;
      padding-top: 8px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    p, span, div, li, td, th,
    [data-pdf-block],
    [data-pdf-break],
    .header-main-box,
    .gallery-hero-box,
    .gallery-sub-grid,
    .badges-row,
    .guide-box,
    .guide-details-box,
    .itinerary-day-box,
    .itinerary-slot-row,
    .inc-exc-row,
    .opt-program-card,
    .signatures-row,
    .highlight-item-card,
    .who-should-join-card,
    .why-should-join-card,
    .summary-block,
    .financial-summary-grid,
    .print-friendly-summary,
    tr,
    tbody tr,
    figure,
    blockquote,
    .avoid-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      break-inside: avoid-page !important;
      -webkit-column-break-inside: avoid !important;
      orphans: 3;
      widows: 3;
    }
    h1, h2, h3, h4, h5, h6,
    .page-top-header,
    .itinerary-day-header,
    .section-heading {
      page-break-after: avoid !important;
      break-after: avoid !important;
      break-after: avoid-page !important;
    }
    table {
      page-break-inside: auto !important;
      break-inside: auto !important;
    }
    .print-friendly-headers thead,
    thead {
      display: table-header-group !important;
    }
    .print-friendly-headers tfoot,
    tfoot {
      display: table-footer-group !important;
    }
    .print-friendly-headers tbody tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .print-friendly-headers .summary-block,
    .print-friendly-headers .financial-summary-grid,
    .print-friendly-summary {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      break-before: auto !important;
    }
  }
</style>
</head>
<body>
  <div class="no-print-toolbar no-print">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <strong>${escapeHtml(settings?.companyName || labels.systemName)}</strong> • <span>${escapeHtml(pkg.title)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);">
        <span style="font-size:11px;opacity:0.8;">🌐</span>
        <select onchange="changeDocLanguage(this.value)" style="background:transparent;color:#fff;border:none;font-size:11px;font-weight:bold;cursor:pointer;outline:none;">
          <option value="en" ${lang === 'en' ? 'selected' : ''} style="background:#0f172a;color:#fff;">🇬🇧 English</option>
          <option value="km" ${lang === 'km' ? 'selected' : ''} style="background:#0f172a;color:#fff;">🇰🇭 ភាសាខ្មែរ</option>
          <option value="ja" ${lang === 'ja' ? 'selected' : ''} style="background:#0f172a;color:#fff;">🇯🇵 日本語</option>
          <option value="es" ${lang === 'es' ? 'selected' : ''} style="background:#0f172a;color:#fff;">🇪🇸 Español</option>
          <option value="ar" ${lang === 'ar' ? 'selected' : ''} style="background:#0f172a;color:#fff;">🇦🇪 العربية</option>
          <option value="he" ${lang === 'he' ? 'selected' : ''} style="background:#0f172a;color:#fff;">🇮🇱 עברית</option>
        </select>
      </div>
      <button onclick="triggerDownloadPdf()" style="background:linear-gradient(135deg, #059669, #047857);color:#ffffff;border:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:bold;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.25);white-space:nowrap;">
        📥 Download HTML as PDF
      </button>
      <button onclick="window.print()">
        🖨️ Print / Save as PDF (A4)
      </button>
    </div>
  </div>
  <script>
    function triggerDownloadPdf() {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'KHB_DOWNLOAD_HTML_PDF' }, '*');
      } else {
        window.print();
      }
    }
    function changeDocLanguage(newLang) {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'KHB_CHANGE_LANG', lang: newLang }, '*');
      }
      try {
        var url = new URL(window.location.href);
        if (url.searchParams.has('agenda') || url.searchParams.has('pkg') || url.searchParams.has('a') || url.searchParams.has('p')) {
          url.searchParams.set('lang', newLang);
          window.location.href = url.toString();
        }
      } catch(e) {}
    }
  </script>
  ${body}
</body>
</html>`;
}

function buildDocDocument(body: string, title: string): string {
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${escapeHtml(title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
</head>
<body>${body}</body>
</html>`;
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

export function getAgendaBodyHtml(options: AgendaExportOptions): string {
  const { packageData: rawPkg, selectedDate, travelerName, selectedOptionalProgramIds = [], language = 'en', watermark, systemSettings } = options;
  const labels = getPdfLabels(language);
  const pkg = getLocalizedPackage(rawPkg, language);
  const date = selectedDate || pkg.availableDates[0] || '2026-09-15';
  const name = travelerName || labels.defaultTravelerName;
  return buildAgendaBody(pkg, labels, { selectedDate: date, travelerName: name, selectedOptionalProgramIds, watermark, systemSettings }, language);
}

export function getAgendaPreviewHtml(options: AgendaExportOptions & { format?: ExportFormat }): string {
  const { packageData: rawPkg, selectedDate, travelerName, selectedOptionalProgramIds = [], language = 'en', format = 'html_pdf', watermark, systemSettings } = options;
  const labels = getPdfLabels(language);
  const pkg = getLocalizedPackage(rawPkg, language);
  const date = selectedDate || pkg.availableDates[0] || '2026-09-15';
  const name = travelerName || labels.defaultTravelerName;
  const body = buildAgendaBody(pkg, labels, { selectedDate: date, travelerName: name, selectedOptionalProgramIds, watermark, systemSettings }, language);

  if (format === 'doc') {
    const fontsHref = getGoogleFontsHref(language);
    const fontsLink = fontsHref ? `<link href="${fontsHref}" rel="stylesheet">` : '';
    const palette = getResolvedThemePalette(systemSettings);
    return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pkg.title)} - Word Document (.doc) Preview</title>
${fontsLink}
<style>
  * { box-sizing: border-box; }
  body { 
    margin: 0; 
    padding: 30px 10px; 
    background: #f1f5f9; 
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; 
    -webkit-font-smoothing: antialiased;
  }
  .doc-preview-wrapper {
    max-width: 840px;
    margin: 0 auto;
    background: #ffffff;
    padding: 40px 48px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    border: 1px solid #cbd5e1;
    border-radius: 4px;
  }
  .doc-header-strip {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid ${palette.primary};
    padding: 12px 18px;
    margin-bottom: 24px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #475569;
  }
  .pdf-a4-page {
    border-bottom: 2px dashed #e2e8f0;
    padding-bottom: 30px;
    margin-bottom: 30px;
  }
  .pdf-a4-page:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  img { max-width: 100%; display: block; }
</style>
</head>
<body>
  <div class="doc-preview-wrapper">
    <div class="doc-header-strip">
      <span>📄 <strong>Word Document Format (.doc)</strong> — Compatible with Microsoft Word</span>
      <span>Ref: KHB-AGN-${pkg.id.slice(0, 8).toUpperCase()}</span>
    </div>
    ${body}
  </div>
</body>
</html>`;
  }

  return buildStandaloneHtmlDocument(body, pkg, language, `${systemSettings?.companyName || labels.systemName} - ${pkg.title}`, systemSettings);
}

export async function downloadAgendaHtml(options: AgendaExportOptions): Promise<void> {
  const { packageData: rawPkg, selectedDate, travelerName, selectedOptionalProgramIds = [], language = 'en', watermark, systemSettings } = options;
  const labels = getPdfLabels(language);
  const pkg = getLocalizedPackage(rawPkg, language);
  const date = selectedDate || pkg.availableDates[0] || '2026-09-15';
  const name = travelerName || labels.defaultTravelerName;
  const body = buildAgendaBody(pkg, labels, { selectedDate: date, travelerName: name, selectedOptionalProgramIds, watermark, systemSettings }, language);
  const fullDoc = buildStandaloneHtmlDocument(body, pkg, language, `${systemSettings?.companyName || labels.systemName} - ${pkg.title}`, systemSettings);
  const safeDest = sanitizeFilename(pkg.destination);
  downloadBlob(fullDoc, `KHB_Tour_Agenda_${safeDest}.html`, 'text/html');
}

export async function downloadAgendaDoc(options: AgendaExportOptions): Promise<void> {
  const { packageData: rawPkg, selectedDate, travelerName, selectedOptionalProgramIds = [], language = 'en', watermark, systemSettings } = options;
  const labels = getPdfLabels(language);
  const pkg = getLocalizedPackage(rawPkg, language);
  const date = selectedDate || pkg.availableDates[0] || '2026-09-15';
  const name = travelerName || labels.defaultTravelerName;
  const body = buildAgendaBody(pkg, labels, { selectedDate: date, travelerName: name, selectedOptionalProgramIds, watermark, systemSettings }, language);
  const docContent = buildDocDocument(body, `${systemSettings?.companyName || labels.systemName} - ${pkg.title}`);
  const safeDest = sanitizeFilename(pkg.destination);
  downloadBlob(docContent, `KHB_Tour_Agenda_${safeDest}.doc`, 'application/msword');
}

async function waitForImagesToLoad(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  const bgEls = Array.from(root.querySelectorAll('[data-bg-img]')) as HTMLElement[];
  const bgUrls = bgEls.map(el => el.getAttribute('data-bg-img')).filter(Boolean) as string[];

  const imgPromises = imgs.map(img => {
    if (img.complete && img.naturalHeight > 0) return Promise.resolve();
    return new Promise<void>(resolve => {
      const onDone = () => {
        img.removeEventListener('load', onDone);
        img.removeEventListener('error', onDone);
        resolve();
      };
      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
      setTimeout(onDone, 3000);
    });
  });

  const bgPromises = bgUrls.map(url => {
    return new Promise<void>(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      const onDone = () => resolve();
      img.onload = onDone;
      img.onerror = onDone;
      img.src = url;
      setTimeout(onDone, 3000);
    });
  });

  await Promise.all([...imgPromises, ...bgPromises]);
}

export async function downloadAgendaImagePdf(options: AgendaExportOptions): Promise<void> {
  await downloadAgendaHtmlToPdf(options);
}

export async function downloadAgendaHtmlToPdf(options: AgendaExportOptions): Promise<void> {
  const { packageData: rawPkg, selectedDate, travelerName, selectedOptionalProgramIds = [], language = 'en', watermark, systemSettings } = options;
  const labels = getPdfLabels(language);
  const pkg = getLocalizedPackage(rawPkg, language);
  const date = selectedDate || pkg.availableDates[0] || '2026-09-15';
  const name = travelerName || labels.defaultTravelerName;

  const body = buildAgendaBody(pkg, labels, { selectedDate: date, travelerName: name, selectedOptionalProgramIds, watermark, systemSettings }, language);
  const fullHtml = buildStandaloneHtmlDocument(body, pkg, language, `${systemSettings?.companyName || labels.systemName} - ${pkg.title}`, systemSettings);

  let iframe: HTMLIFrameElement | null = null;

  try {
    iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:860px;height:auto;min-height:1200px;border:none;background:#ffffff;';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Unable to access iframe document');

    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();

    await new Promise<void>((resolve) => {
      const checkReady = () => {
        const pages = iframeDoc?.querySelectorAll('.pdf-a4-page');
        if (pages && pages.length > 0) {
          resolve();
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
    });

    const iframeWindow = iframe.contentWindow;
    if (iframeWindow && iframeWindow.document.fonts && iframeWindow.document.fonts.ready) {
      try { await iframeWindow.document.fonts.ready; } catch {}
    }

    const pageEls = Array.from(iframeDoc.querySelectorAll('.pdf-a4-page')) as HTMLElement[];
    await waitForImagesToLoad(iframeDoc.body);
    // Apply canvas rasterization baseline compensation exclusively for html2canvas
    iframeDoc.body.classList.add('pdf-canvas-export');
    await new Promise(r => setTimeout(r, 400));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    const a4WidthMm = 210;
    const a4HeightMm = 297;

    for (let i = 0; i < pageEls.length; i++) {
      const pageEl = pageEls[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2.2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
      });

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');
    }

    const safeTitle = sanitizeFilename(pkg.title);
    const safeDest = sanitizeFilename(pkg.destination);
    pdf.save(`KHB_Tour_Agenda_${safeDest}_${safeTitle}.pdf`);
  } finally {
    if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
  }
}

export interface ShortAgendaParams {
  packageId: string;
  selectedDate?: string;
  travelerName?: string;
  language?: LanguageCode;
  selectedOptions?: string[];
  defaultDate?: string;
  defaultDelegateName?: string;
}

export function generateShortAgendaUrl(params: ShortAgendaParams): string {
  const q = new URLSearchParams();
  
  // Package: 'a' for agenda package ID
  q.set('a', params.packageId);

  // Date: 'd' (only if provided and different from default)
  if (params.selectedDate && params.defaultDate && params.selectedDate !== params.defaultDate) {
    q.set('d', params.selectedDate);
  } else if (params.selectedDate && !params.defaultDate) {
    q.set('d', params.selectedDate);
  }

  // Delegate name: 'n' (only if custom and not default placeholder)
  const isDefaultName = !params.travelerName || 
    params.travelerName.trim() === '' || 
    params.travelerName === 'Valued Business Delegate' ||
    params.travelerName === params.defaultDelegateName;
  if (!isDefaultName && params.travelerName) {
    q.set('n', params.travelerName.trim());
  }

  // Language: 'l' (only if not 'en')
  if (params.language && params.language !== 'en') {
    q.set('l', params.language);
  }

  // Options: 'o' (compact map)
  if (params.selectedOptions && params.selectedOptions.length > 0) {
    const compactOpts = params.selectedOptions.map(opt => {
      if (opt === 'opt_vip_matchmaking') return 'vip';
      if (opt === 'opt_night_market_foodie') return 'food';
      if (opt === 'opt_factory_visit') return 'factory';
      return opt;
    });
    q.set('o', compactOpts.join(','));
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  return `${origin}${pathname}?${q.toString()}`;
}

export function parseAgendaUrlParams(search: string, packages: TourPackage[], defaultLang: LanguageCode) {
  const p = new URLSearchParams(search);

  // 1. Package matching (checks 'a', 'agenda', 'p', 'pkg')
  const rawPkgId = p.get('a') || p.get('agenda') || p.get('p') || p.get('pkg') || '';
  let pkg = packages.find(pkgItem => pkgItem.id === rawPkgId);
  if (!pkg && rawPkgId) {
    const numericIdx = parseInt(rawPkgId, 10);
    if (!isNaN(numericIdx) && numericIdx >= 1 && numericIdx <= packages.length) {
      pkg = packages[numericIdx - 1];
    } else {
      pkg = packages.find(pkgItem => pkgItem.id.toLowerCase().includes(rawPkgId.toLowerCase()));
    }
  }
  if (!pkg) pkg = packages[0];

  // 2. Date matching (checks 'd', 'date')
  const date = p.get('d') || p.get('date') || pkg?.availableDates?.[0] || '2026-09-15';

  // 3. Delegate name matching (checks 'n', 'delegate', 'name')
  const travelerName = p.get('n') || p.get('delegate') || p.get('name') || 'Valued Business Delegate';

  // 4. Language matching (checks 'l', 'lang', 'language')
  const rawLang = p.get('l') || p.get('lang') || p.get('language');
  const lang = (rawLang as LanguageCode) || defaultLang || 'en';

  // 5. Options matching (checks 'o', 'opts', 'options')
  const rawOpts = p.get('o') || p.get('opts') || p.get('options') || '';
  const selectedOptions = rawOpts
    ? rawOpts.split(',').map(item => item.trim()).filter(Boolean).map(item => {
        if (item === 'vip') return 'opt_vip_matchmaking';
        if (item === 'food') return 'opt_night_market_foodie';
        if (item === 'factory') return 'opt_factory_visit';
        return item;
      })
    : [];

  return {
    pkg,
    date,
    travelerName,
    lang,
    selectedOptions,
  };
}
