import jsPDF from 'jspdf';
import { TourPackage, ItineraryStep, GuideScheduleSlot, OptionalTourProgram, TourGuide, LanguageCode } from '../types';
import { getLocalizedPackage } from '../utils/packageLocalization';
import { loadPdfFont, PdfFontConfig } from './pdfFonts';
import { getPdfLabels, PdfLabels } from './pdfTranslations';

export interface GenerateAgendaPdfOptions {
  packageData: TourPackage;
  selectedDate?: string;
  travelerName?: string;
  numberOfAdults?: number;
  selectedOptionalProgramIds?: string[];
  currencySymbol?: string;
  language?: LanguageCode;
}

interface RenderContext {
  doc: jsPDF;
  pkg: TourPackage;
  labels: PdfLabels;
  font: PdfFontConfig;
  lang: LanguageCode;
  selectedDate: string;
  travelerName: string;
  numberOfAdults: number;
  selectedOptionalProgramIds: string[];
  currencySymbol: string;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  currentY: number;
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
  if (step.guideAgenda && step.guideAgenda.length > 0) {
    return step.guideAgenda;
  }
  return [
    {
      time: '07:00 AM - 08:30 AM',
      activity: labels.defaultBreakfastActivity,
      location: step.hotelName || labels.defaultBreakfastLocation,
      type: 'briefing',
      notes: labels.defaultBreakfastNote,
    },
    {
      time: '08:45 AM - 09:15 AM',
      activity: labels.defaultAssemblyActivity,
      location: labels.defaultAssemblyLocation,
      type: 'gathering',
      notes: labels.defaultAssemblyNote,
    },
    {
      time: '09:30 AM - 12:30 PM',
      activity: step.title || labels.defaultExhibitionActivity,
      location: labels.defaultExhibitionLocation,
      type: 'exhibition',
      notes: labels.defaultExhibitionNote,
    },
    {
      time: '12:30 PM - 02:00 PM',
      activity: labels.defaultLunchActivity,
      location: labels.defaultLunchLocation,
      type: 'networking_lunch',
      notes: step.mealsIncluded?.includes('Lunch') ? labels.defaultLunchNoteIncluded : labels.defaultLunchNoteOptional,
    },
    {
      time: '02:15 PM - 05:30 PM',
      activity: labels.defaultB2bActivity,
      location: labels.defaultB2bLocation,
      type: 'b2b_meeting',
      notes: labels.defaultB2bNote,
    },
    {
      time: '06:00 PM onwards',
      activity: labels.defaultEveningActivity,
      location: step.hotelName || labels.defaultEveningLocation,
      type: 'free_time',
      notes: labels.defaultEveningNote,
    },
  ];
}

function setFont(ctx: RenderContext, style: 'normal' | 'bold' | 'italic' = 'normal') {
  if (ctx.font.isEmbedded) {
    ctx.doc.setFont(ctx.font.family, style === 'italic' ? 'normal' : style);
  } else {
    ctx.doc.setFont('helvetica', style);
  }
}

function textAlign(align: 'left' | 'right' | 'center', ctx: RenderContext): 'left' | 'right' | 'center' {
  if (!ctx.font.isRtl) return align;
  if (align === 'left') return 'right';
  if (align === 'right') return 'left';
  return align;
}

function textX(x: number, ctx: RenderContext): number {
  if (!ctx.font.isRtl) return x;
  return ctx.pageWidth - x;
}

function addPageHeader(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth, pageWidth } = ctx;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, ctx.currentY, contentWidth, 8, 'F');
  setFont(ctx, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`${labels.systemName} • ${labels.officialAgenda}`, margin + 4, ctx.currentY + 5.5, { align: textAlign('left', ctx) });
  setFont(ctx, 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`${labels.destination}: ${pkg.destination}, ${pkg.country}`, pageWidth - margin - 4, ctx.currentY + 5.5, { align: textAlign('right', ctx) });
  ctx.currentY += 12;
}

function addFooter(ctx: RenderContext) {
  const { doc, labels, margin, pageWidth, pageHeight } = ctx;
  const pageNum = doc.getNumberOfPages();
  setFont(ctx, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.text(`${labels.hotline}: +855 60 815 515 • Telegram: @VuthaTim`, margin, pageHeight - 7.5, { align: textAlign('left', ctx) });
  doc.text(`${labels.confidentialDocument} • ${labels.page} ${pageNum}`, pageWidth - margin, pageHeight - 7.5, { align: textAlign('right', ctx) });
}

function checkPageBreak(ctx: RenderContext, neededHeight: number): boolean {
  if (ctx.currentY + neededHeight > ctx.pageHeight - 18) {
    addFooter(ctx);
    ctx.doc.addPage();
    ctx.currentY = ctx.margin + 4;
    addPageHeader(ctx);
    return true;
  }
  return false;
}

function renderCoverPage(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth, pageWidth, selectedDate, currencySymbol } = ctx;
  const guide = pkg.tourGuide || buildDefaultGuide(labels);

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, ctx.currentY, contentWidth, 32, 'F');
  doc.setFillColor(14, 165, 233);
  doc.rect(margin, ctx.currentY, 4, 32, 'F');

  setFont(ctx, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(labels.systemName, textX(margin + 8, ctx), ctx.currentY + 10, { align: textAlign('left', ctx) });

  doc.setFontSize(9);
  setFont(ctx, 'normal');
  doc.setTextColor(186, 230, 253);
  doc.text(labels.officialAgenda, textX(margin + 8, ctx), ctx.currentY + 16, { align: textAlign('left', ctx) });

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(labels.operationsSubtitle, textX(margin + 8, ctx), ctx.currentY + 22, { align: textAlign('left', ctx) });

  doc.setFontSize(8);
  setFont(ctx, 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text(labels.verifiedBriefing, textX(pageWidth - margin - 6, ctx), ctx.currentY + 10, { align: textAlign('right', ctx) });

  doc.setFontSize(7.5);
  setFont(ctx, 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(`${labels.docRef}: KHB-AGN-${pkg.id.slice(0, 8).toUpperCase()}`, textX(pageWidth - margin - 6, ctx), ctx.currentY + 16, { align: textAlign('right', ctx) });
  doc.text(`${labels.issueDate}: ${new Date().toISOString().split('T')[0]}`, textX(pageWidth - margin - 6, ctx), ctx.currentY + 22, { align: textAlign('right', ctx) });

  ctx.currentY += 36;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, ctx.currentY, contentWidth, 24, 3, 3, 'FD');

  setFont(ctx, 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(pkg.title, contentWidth - 12);
  doc.text(titleLines, textX(margin + 6, ctx), ctx.currentY + 8, { align: textAlign('left', ctx) });

  setFont(ctx, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const metaLine = `${labels.destination}: ${pkg.destination}, ${pkg.country}  |  ${labels.category}: ${pkg.category || labels.officialAgenda}  |  ${labels.duration}: ${pkg.durationDays} ${labels.days} / ${pkg.durationNights} ${labels.nights}`;
  doc.text(metaLine, textX(margin + 6, ctx), ctx.currentY + 18, { align: textAlign('left', ctx) });

  ctx.currentY += 28;

  const badgeWidth = (contentWidth - 6) / 4;
  const badgeHeight = 16;
  const priceVal = pkg.discountPriceUSD || pkg.priceUSD;
  const badges = [
    { label: labels.departureDate, value: selectedDate, color: [2, 132, 199] as number[] },
    { label: labels.packagePrice, value: `${currencySymbol}${priceVal} USD`, color: [16, 185, 129] as number[] },
    { label: labels.accommodation, value: `${pkg.hotelStars}-${labels.starHotel}`, color: [245, 158, 11] as number[] },
    { label: labels.flightStatus, value: pkg.flightIncluded ? labels.flightIncluded : labels.groundEscort, color: [99, 102, 241] as number[] },
  ];

  badges.forEach((b, idx) => {
    const bx = margin + idx * (badgeWidth + 2);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, ctx.currentY, badgeWidth, badgeHeight, 2, 2, 'FD');

    setFont(ctx, 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(b.label, textX(bx + 3, ctx), ctx.currentY + 5.5, { align: textAlign('left', ctx) });

    doc.setFontSize(8.5);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.value, textX(bx + 3, ctx), ctx.currentY + 12, { align: textAlign('left', ctx) });
  });

  ctx.currentY += badgeHeight + 5;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, ctx.currentY, contentWidth, 27, 3, 3, 'FD');

  setFont(ctx, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);
  doc.text(labels.designatedDirector, textX(margin + 5, ctx), ctx.currentY + 6.5, { align: textAlign('left', ctx) });

  setFont(ctx, 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${guide.name} (${guide.title})`, textX(margin + 5, ctx), ctx.currentY + 12.5, { align: textAlign('left', ctx) });

  setFont(ctx, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const langsStr = guide.languages?.length ? `  |  ${labels.languages}: ${guide.languages.join(', ')}` : '';
  doc.text(
    `${labels.directPhone}: ${guide.phone}  |  ${labels.telegram}: ${guide.telegram || '@VuthaTim'}  |  ${labels.badgeNumber}: ${guide.badgeNumber || 'KHB-TG-2026'}${langsStr}`,
    textX(margin + 5, ctx),
    ctx.currentY + 17.5,
    { align: textAlign('left', ctx) }
  );
  doc.text(
    `${labels.assemblyPoint}: ${guide.briefingMeetingPoint} (${guide.briefingTime})`,
    textX(margin + 5, ctx),
    ctx.currentY + 22.5,
    { align: textAlign('left', ctx) }
  );

  ctx.currentY += 31;

  setFont(ctx, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(labels.missionDescription, textX(margin, ctx), ctx.currentY + 4, { align: textAlign('left', ctx) });
  ctx.currentY += 7;

  setFont(ctx, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(pkg.description, contentWidth);
  doc.text(descLines, textX(margin, ctx), ctx.currentY, { align: textAlign('left', ctx) });
  ctx.currentY += descLines.length * 4.2 + 4;

  if (pkg.highlights && pkg.highlights.length > 0) {
    checkPageBreak(ctx, 30);
    setFont(ctx, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(labels.keyHighlights, textX(margin, ctx), ctx.currentY + 3, { align: textAlign('left', ctx) });
    ctx.currentY += 6;

    const colWidth = (contentWidth - 6) / 2;
    pkg.highlights.forEach((hl, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const hx = margin + col * (colWidth + 6);
      const hy = ctx.currentY + row * 6;

      doc.setFillColor(14, 165, 233);
      doc.circle(hx + 2, hy + 2, 1, 'F');

      setFont(ctx, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      const hlLines = doc.splitTextToSize(hl, colWidth - 6);
      doc.text(hlLines[0], textX(hx + 5, ctx), hy + 3, { align: textAlign('left', ctx) });
    });

    ctx.currentY += Math.ceil(pkg.highlights.length / 2) * 6 + 6;
  }
}

function renderItinerary(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth } = ctx;

  checkPageBreak(ctx, 40);

  doc.setFillColor(14, 165, 233);
  doc.rect(margin, ctx.currentY, contentWidth, 7, 'F');
  setFont(ctx, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(labels.detailedItinerary, textX(margin + 4, ctx), ctx.currentY + 5, { align: textAlign('left', ctx) });
  ctx.currentY += 11;

  pkg.itinerary.forEach((step) => {
    const agendaSlots = getStepAgendaSlots(step, labels);
    const estimatedDayHeight = 22 + agendaSlots.length * 9;

    checkPageBreak(ctx, Math.min(estimatedDayHeight, 55));

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, ctx.currentY, contentWidth, 9, 2, 2, 'FD');

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 2, ctx.currentY + 1.5, 14, 6, 1.5, 1.5, 'F');
    setFont(ctx, 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${labels.day} ${step.day}`, textX(margin + 9, ctx), ctx.currentY + 4.5, { align: 'center', baseline: 'middle' });

    setFont(ctx, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const dayTitleText = doc.splitTextToSize(step.title, contentWidth - 65);
    doc.text(dayTitleText[0], textX(margin + 19, ctx), ctx.currentY + 4.8, { align: textAlign('left', ctx), baseline: 'middle' });

    setFont(ctx, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const hotelPart = step.hotelName ? `🏨 ${step.hotelName}` : '';
    const mealsPart = step.mealsIncluded?.length ? `| 🍽️ ${step.mealsIncluded.join(', ')}` : '';
    const metaRight = `${hotelPart} ${mealsPart}`;
    doc.text(metaRight, textX(ctx.pageWidth - margin - 4, ctx), ctx.currentY + 5.8, { align: textAlign('right', ctx) });

    ctx.currentY += 12;

    if (step.assemblyPoint || step.assemblyTime) {
      setFont(ctx, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(146, 64, 14);
      doc.text(`📍 ${labels.assemblyPoint}: ${step.assemblyPoint || ''} ${step.assemblyTime ? `(${step.assemblyTime})` : ''}`, textX(margin + 2, ctx), ctx.currentY, { align: textAlign('left', ctx) });
      ctx.currentY += 4.5;
    }

    if (step.description) {
      setFont(ctx, 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const stepDesc = doc.splitTextToSize(`${labels.overview} ${step.description}`, contentWidth - 4);
      doc.text(stepDesc, textX(margin + 2, ctx), ctx.currentY, { align: textAlign('left', ctx) });
      ctx.currentY += stepDesc.length * 3.8 + 2;
    }

    agendaSlots.forEach((slot) => {
      checkPageBreak(ctx, 11);

      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(241, 245, 249);
      doc.roundedRect(margin + 2, ctx.currentY, contentWidth - 4, 8.5, 1.5, 1.5, 'FD');

      setFont(ctx, 'bold');
      doc.setFontSize(7);
      doc.setTextColor(2, 132, 199);
      doc.text(slot.time, textX(margin + 5, ctx), ctx.currentY + 4, { align: textAlign('left', ctx) });

      if (slot.location) {
        setFont(ctx, 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        const locLines = doc.splitTextToSize(slot.location, 38);
        doc.text(locLines[0], textX(margin + 5, ctx), ctx.currentY + 7.2, { align: textAlign('left', ctx) });
      }

      setFont(ctx, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const actLines = doc.splitTextToSize(slot.activity, contentWidth - 52);
      doc.text(actLines[0], textX(margin + 46, ctx), ctx.currentY + 4, { align: textAlign('left', ctx) });

      if (slot.notes) {
        setFont(ctx, 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        const noteLines = doc.splitTextToSize(`${labels.note} ${slot.notes}`, contentWidth - 52);
        doc.text(noteLines[0], textX(margin + 46, ctx), ctx.currentY + 7.2, { align: textAlign('left', ctx) });
      }

      ctx.currentY += 9.5;
    });

    ctx.currentY += 3;
  });
}

function renderWhoShouldJoin(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth } = ctx;
  if (!pkg.whoShouldJoin || pkg.whoShouldJoin.length === 0) return;

  checkPageBreak(ctx, 35);

  doc.setFillColor(16, 185, 129);
  doc.rect(margin, ctx.currentY, contentWidth, 7, 'F');
  setFont(ctx, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(labels.whoShouldJoin || 'Who Should Join?', textX(margin + 4, ctx), ctx.currentY + 5, { align: textAlign('left', ctx) });
  ctx.currentY += 11;

  const colWidth = (contentWidth - 6) / 2;
  const cardHeight = 12;
  pkg.whoShouldJoin.forEach((item, i) => {
    const col = i % 2;
    const hx = margin + col * (colWidth + 6);

    if (col === 0) {
      checkPageBreak(ctx, cardHeight + 4);
    }
    const hy = ctx.currentY;

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(hx, hy, colWidth, cardHeight, 2, 2, 'FD');

    doc.setFillColor(16, 185, 129);
    doc.circle(hx + 3.5, hy + 6, 1.2, 'F');

    setFont(ctx, 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    const itemLines = doc.splitTextToSize(item, colWidth - 9);
    doc.text(itemLines[0], textX(hx + 7, ctx), hy + 6.2, { align: textAlign('left', ctx), baseline: 'middle' });

    if (col === 1 || i === pkg.whoShouldJoin!.length - 1) {
      ctx.currentY += cardHeight + 3;
    }
  });

  ctx.currentY += 4;
}

function renderWhyShouldJoin(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth } = ctx;
  if (!pkg.whyShouldJoin || pkg.whyShouldJoin.length === 0) return;

  checkPageBreak(ctx, 35);

  doc.setFillColor(14, 165, 233);
  doc.rect(margin, ctx.currentY, contentWidth, 7, 'F');
  setFont(ctx, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(labels.whyShouldJoin || 'Why You Should Join', textX(margin + 4, ctx), ctx.currentY + 5, { align: textAlign('left', ctx) });
  ctx.currentY += 11;

  const colWidth = (contentWidth - 6) / 2;
  const cardHeight = 12;
  pkg.whyShouldJoin.forEach((item, i) => {
    const col = i % 2;
    const hx = margin + col * (colWidth + 6);

    if (col === 0) {
      checkPageBreak(ctx, cardHeight + 4);
    }
    const hy = ctx.currentY;

    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(hx, hy, colWidth, cardHeight, 2, 2, 'FD');

    doc.setFillColor(14, 165, 233);
    doc.circle(hx + 3.5, hy + 6, 1.2, 'F');

    setFont(ctx, 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(30, 41, 59);
    const itemLines = doc.splitTextToSize(item, colWidth - 9);
    doc.text(itemLines[0], textX(hx + 7, ctx), hy + 6.2, { align: textAlign('left', ctx), baseline: 'middle' });

    if (col === 1 || i === pkg.whyShouldJoin!.length - 1) {
      ctx.currentY += cardHeight + 3;
    }
  });

  ctx.currentY += 4;
}

function renderOptionalPrograms(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth, pageWidth, selectedOptionalProgramIds, currencySymbol } = ctx;

  if (!pkg.optionalPrograms || pkg.optionalPrograms.length === 0) return;

  checkPageBreak(ctx, 35);

  doc.setFillColor(16, 185, 129);
  doc.rect(margin, ctx.currentY, contentWidth, 7, 'F');
  setFont(ctx, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(labels.optionalPrograms, textX(margin + 4, ctx), ctx.currentY + 5, { align: textAlign('left', ctx) });
  ctx.currentY += 11;

  pkg.optionalPrograms.forEach((prog: OptionalTourProgram) => {
    checkPageBreak(ctx, 18);

    const isSelected = selectedOptionalProgramIds.includes(prog.id);

    doc.setFillColor(isSelected ? 236 : 248, isSelected ? 253 : 250, isSelected ? 245 : 252);
    doc.setDrawColor(isSelected ? 16 : 226, isSelected ? 185 : 232, isSelected ? 129 : 240);
    doc.roundedRect(margin, ctx.currentY, contentWidth, 15, 2, 2, 'FD');

    setFont(ctx, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(prog.title, textX(margin + 4, ctx), ctx.currentY + 5, { align: textAlign('left', ctx) });

    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.text(`+${currencySymbol}${prog.additionalCostUSD} ${labels.perPerson}`, textX(pageWidth - margin - 4, ctx), ctx.currentY + 5, { align: textAlign('right', ctx) });

    setFont(ctx, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const optDesc = doc.splitTextToSize(prog.description, contentWidth - 45);
    doc.text(optDesc[0], textX(margin + 4, ctx), ctx.currentY + 9.5, { align: textAlign('left', ctx) });

    const optMeta = `${labels.durationHours}: ${prog.durationHours} hrs | ${labels.audience}: ${prog.recommendedAudience || labels.defaultTravelerName} | ${labels.assembly}: ${prog.meetingPoint || labels.defaultAssemblyLocation}`;
    doc.text(optMeta, textX(margin + 4, ctx), ctx.currentY + 13.2, { align: textAlign('left', ctx) });

    if (isSelected) {
      setFont(ctx, 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(labels.includedInDelegation, textX(pageWidth - margin - 4, ctx), ctx.currentY + 13.2, { align: textAlign('right', ctx) });
    }

    ctx.currentY += 18;
  });
}

function renderInclusionsExclusions(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth } = ctx;

  checkPageBreak(ctx, 50);

  const halfWidth = (contentWidth - 6) / 2;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, ctx.currentY, halfWidth, 32, 2, 2, 'FD');

  setFont(ctx, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text(labels.packageInclusions, textX(margin + 4, ctx), ctx.currentY + 5.5, { align: textAlign('left', ctx) });

  setFont(ctx, 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  pkg.inclusions.slice(0, 5).forEach((inc, idx) => {
    const incLines = doc.splitTextToSize(`• ${inc}`, halfWidth - 8);
    doc.text(incLines[0], textX(margin + 4, ctx), ctx.currentY + 10 + idx * 4.5, { align: textAlign('left', ctx) });
  });

  const rightX = margin + halfWidth + 6;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(rightX, ctx.currentY, halfWidth, 32, 2, 2, 'FD');

  setFont(ctx, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text(labels.packageExclusions, textX(rightX + 4, ctx), ctx.currentY + 5.5, { align: textAlign('left', ctx) });

  setFont(ctx, 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  pkg.exclusions.slice(0, 5).forEach((exc, idx) => {
    const excLines = doc.splitTextToSize(`• ${exc}`, halfWidth - 8);
    doc.text(excLines[0], textX(rightX + 4, ctx), ctx.currentY + 10 + idx * 4.5, { align: textAlign('left', ctx) });
  });

  ctx.currentY += 36;
}

function renderEmergencyContacts(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth } = ctx;

  checkPageBreak(ctx, 25);

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, ctx.currentY, contentWidth, 18, 2, 2, 'FD');

  setFont(ctx, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text(`${labels.emergencyAssistance} (${pkg.emergencyContact.country})`, textX(margin + 4, ctx), ctx.currentY + 5.5, { align: textAlign('left', ctx) });

  setFont(ctx, 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `${labels.localPolice}: ${pkg.emergencyContact.police}  |  ${labels.ambulance}: ${pkg.emergencyContact.ambulance}  |  ${labels.touristSos}: ${pkg.emergencyContact.touristHelpline}`,
    textX(margin + 4, ctx),
    ctx.currentY + 10.5,
    { align: textAlign('left', ctx) }
  );
  doc.text(
    `${labels.embassySupport}: ${pkg.emergencyContact.embassySupport}  |  ${labels.khbDispatch}: 060 815 515`,
    textX(margin + 4, ctx),
    ctx.currentY + 15,
    { align: textAlign('left', ctx) }
  );

  ctx.currentY += 23;
}

function renderTermsAndSignatures(ctx: RenderContext) {
  const { doc, labels, pkg, margin, contentWidth, pageWidth } = ctx;

  const termsToRender = (pkg.termsAndConditions && pkg.termsAndConditions.length > 0)
    ? pkg.termsAndConditions
    : labels.defaultTerms;

  checkPageBreak(ctx, 30);

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin, ctx.currentY, contentWidth, 24, 2, 2, 'FD');

  setFont(ctx, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text(labels.termsAndConditions, textX(margin + 4, ctx), ctx.currentY + 5.5, { align: textAlign('left', ctx) });

  setFont(ctx, 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);
  termsToRender.forEach((term, idx) => {
    const termLines = doc.splitTextToSize(`• ${term}`, contentWidth - 8);
    doc.text(termLines[0], textX(margin + 4, ctx), ctx.currentY + 10 + idx * 3.5, { align: textAlign('left', ctx) });
  });

  ctx.currentY += 28;

  checkPageBreak(ctx, 22);

  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(margin, ctx.currentY + 12, margin + 75, ctx.currentY + 12);
  doc.line(pageWidth - margin - 75, ctx.currentY + 12, pageWidth - margin, ctx.currentY + 12);
  doc.setLineDashPattern([], 0);

  setFont(ctx, 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(labels.delegateSignature, textX(margin, ctx), ctx.currentY + 16, { align: textAlign('left', ctx) });
  doc.text(labels.operationsSeal, textX(pageWidth - margin, ctx), ctx.currentY + 16, { align: textAlign('right', ctx) });
}

export async function generateTourAgendaPdf(options: GenerateAgendaPdfOptions): Promise<void> {
  const {
    packageData: rawPkg,
    selectedDate = rawPkg.availableDates[0] || '2026-09-15',
    travelerName,
    numberOfAdults = 1,
    selectedOptionalProgramIds = [],
    currencySymbol = '$',
    language = 'en',
  } = options;

  const labels = getPdfLabels(language);
  const pkg = getLocalizedPackage(rawPkg, language);
  const resolvedTravelerName = travelerName || labels.defaultTravelerName;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const font = await loadPdfFont(doc, language);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const ctx: RenderContext = {
    doc,
    pkg,
    labels,
    font,
    lang: language,
    selectedDate,
    travelerName: resolvedTravelerName,
    numberOfAdults,
    selectedOptionalProgramIds,
    currencySymbol,
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    currentY: margin,
  };

  renderCoverPage(ctx);
  renderItinerary(ctx);
  renderWhoShouldJoin(ctx);
  renderWhyShouldJoin(ctx);
  renderOptionalPrograms(ctx);
  renderInclusionsExclusions(ctx);
  renderEmergencyContacts(ctx);
  renderTermsAndSignatures(ctx);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(ctx);
  }

  const safeTitle = pkg.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const fileName = `KHB_Tour_Agenda_${pkg.destination}_${safeTitle}.pdf`;

  doc.save(fileName);
}
