import { TourPackage, ItineraryStep, GuideScheduleSlot, OptionalTourProgram, TourGuide, LanguageCode } from '../types';

const KHMER_CHAR_REGEX = /[\u1780-\u17FF]/;

/**
 * Built-in domain translation dictionary to convert common Khmer terms into English
 * in case a custom user tour or old database record lacks an explicit englishVal.
 */
const TRAVEL_FALLBACK_TERMS_EN: Record<string, string> = {
  'បេសកកម្មពាណិជ្ជកម្ម': 'Business Trade Mission',
  'ដំណើរទស្សនកិច្ចពាណិជ្ជកម្ម': 'Business Trade Mission',
  'ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស': 'Special Business Trade Mission',
  'ពិព័រណ៍ក្វាងចូវ': 'Guangzhou Canton Fair',
  'ក្វាងចូវ': 'Guangzhou',
  'វៀតណាម': 'Vietnam',
  'ប្រទេសវៀតណាម': 'Vietnam',
  'ប្រទេសចិន': 'China',
  'ចិន': 'China',
  'ប្រទេសថៃ': 'Thailand',
  'ថៃ': 'Thailand',
  'កម្ពុជា': 'Cambodia',
  'ភ្នំពេញ': 'Phnom Penh',
  'ហូជីមិញ': 'Ho Chi Minh City',
  'កោះត្រល់': 'Phu Quoc Island',
  'កំពត': 'Kampot',
  'សណ្ឋាគារ': 'Hotel',
  'អាហារពេលព្រឹក': 'Breakfast',
  'អាហារថ្ងៃត្រង់': 'Lunch',
  'អាហារពេលល្ងាច': 'Dinner',
  'សំបុត្រយន្តហោះ': 'Flight Ticket',
  'មគ្គុទ្ទេសក៍': 'Tour Guide / Escort',
  'ថ្ងៃទី': 'Day',
  'ទាំងអស់': 'All',
  'កក់': 'Book Now',
};

/**
 * Resolves a localized text string based on active language.
 */
export function getLocalizedText(
  khmerVal: string | undefined,
  englishVal: string | undefined,
  fallbackVal: string = '',
  lang: LanguageCode = 'km'
): string {
  // Khmer language mode
  if (lang === 'km') {
    if (khmerVal && khmerVal.trim()) return khmerVal.trim();
    if (fallbackVal && fallbackVal.trim() && KHMER_CHAR_REGEX.test(fallbackVal)) return fallbackVal.trim();
    return khmerVal?.trim() || fallbackVal?.trim() || englishVal?.trim() || '';
  }

  // English & other multilingual modes (lang !== 'km')
  if (englishVal && englishVal.trim()) {
    return englishVal.trim();
  }

  // Check if fallbackVal is already in English/Latin (contains NO Khmer characters)
  if (fallbackVal && fallbackVal.trim() && !KHMER_CHAR_REGEX.test(fallbackVal)) {
    return fallbackVal.trim();
  }

  // Check if khmerVal has no Khmer characters (e.g. written in English originally)
  if (khmerVal && khmerVal.trim() && !KHMER_CHAR_REGEX.test(khmerVal)) {
    return khmerVal.trim();
  }

  // If text contains English in parentheses e.g. "ហូជីមិញ + កោះត្រល់ (Ho Chi Minh & Phu Quoc)" -> extract "Ho Chi Minh & Phu Quoc"
  const candidate = englishVal || fallbackVal || khmerVal || '';
  const parenMatch = candidate.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1] && !KHMER_CHAR_REGEX.test(parenMatch[1])) {
    return parenMatch[1].trim();
  }

  // Check dictionary translations
  for (const [kmTerm, enTerm] of Object.entries(TRAVEL_FALLBACK_TERMS_EN)) {
    if (candidate.includes(kmTerm)) {
      // If candidate also contains English terms like "Phase 1", preserve it
      const latinParts = candidate.match(/[A-Za-z0-9\s&+\-:,()]+/g)?.map(s => s.trim()).filter(Boolean).join(' ');
      if (latinParts && latinParts.length > 3) {
        return `${enTerm}: ${latinParts}`;
      }
      return enTerm;
    }
  }

  // Fallback to whatever text exists if no other option
  return candidate.trim();
}

/**
 * Resolves a localized array of strings based on active language.
 */
export function getLocalizedArray(
  khmerArr: string[] | undefined,
  englishArr: string[] | undefined,
  fallbackArr: string[] = [],
  lang: LanguageCode = 'km'
): string[] {
  if (lang === 'km') {
    if (khmerArr && khmerArr.length > 0) return khmerArr;
    if (fallbackArr && fallbackArr.length > 0 && fallbackArr.some(item => KHMER_CHAR_REGEX.test(item))) {
      return fallbackArr;
    }
    return khmerArr || fallbackArr || englishArr || [];
  }

  // For English / non-Khmer:
  if (englishArr && englishArr.length > 0) {
    return englishArr;
  }

  // Check fallback array for English items
  if (fallbackArr && fallbackArr.length > 0) {
    const latinItems = fallbackArr.map(item => {
      if (!KHMER_CHAR_REGEX.test(item)) return item;
      const parenMatch = item.match(/\(([^)]+)\)/);
      if (parenMatch && parenMatch[1] && !KHMER_CHAR_REGEX.test(parenMatch[1])) {
        return parenMatch[1].trim();
      }
      return item;
    });
    return latinItems;
  }

  return englishArr || fallbackArr || khmerArr || [];
}

/**
 * Returns a fully localized representation of a TourPackage for UI rendering.
 */
export function getLocalizedPackage(pkg: TourPackage, lang: LanguageCode = 'km'): TourPackage {
  if (!pkg) return pkg;

  const titleKm = pkg.titleKm;
  const titleEn = pkg.titleEn;
  const descriptionKm = pkg.descriptionKm;
  const descriptionEn = pkg.descriptionEn;
  const destinationKm = pkg.destinationKm;
  const destinationEn = pkg.destinationEn;
  const countryKm = pkg.countryKm;
  const countryEn = pkg.countryEn;
  const categoryKm = pkg.categoryKm;
  const categoryEn = pkg.categoryEn;

  const highlightsKm = (pkg.highlightsKm && pkg.highlightsKm.length > 0) ? pkg.highlightsKm : undefined;
  const highlightsEn = (pkg.highlightsEn && pkg.highlightsEn.length > 0) ? pkg.highlightsEn : undefined;

  const whoShouldJoinKm = (pkg.whoShouldJoinKm && pkg.whoShouldJoinKm.length > 0) ? pkg.whoShouldJoinKm : undefined;
  const whoShouldJoinEn = (pkg.whoShouldJoinEn && pkg.whoShouldJoinEn.length > 0) ? pkg.whoShouldJoinEn : undefined;

  const whyShouldJoinKm = (pkg.whyShouldJoinKm && pkg.whyShouldJoinKm.length > 0) ? pkg.whyShouldJoinKm : undefined;
  const whyShouldJoinEn = (pkg.whyShouldJoinEn && pkg.whyShouldJoinEn.length > 0) ? pkg.whyShouldJoinEn : undefined;

  const inclusionsKm = (pkg.inclusionsKm && pkg.inclusionsKm.length > 0) ? pkg.inclusionsKm : undefined;
  const inclusionsEn = (pkg.inclusionsEn && pkg.inclusionsEn.length > 0) ? pkg.inclusionsEn : undefined;

  const exclusionsKm = (pkg.exclusionsKm && pkg.exclusionsKm.length > 0) ? pkg.exclusionsKm : undefined;
  const exclusionsEn = (pkg.exclusionsEn && pkg.exclusionsEn.length > 0) ? pkg.exclusionsEn : undefined;

  const termsKm = (pkg.termsAndConditionsKm && pkg.termsAndConditionsKm.length > 0) ? pkg.termsAndConditionsKm : undefined;
  const termsEn = (pkg.termsAndConditionsEn && pkg.termsAndConditionsEn.length > 0) ? pkg.termsAndConditionsEn : undefined;

  const itinerarySource = pkg.itinerary || [];

  const localizedItinerary: ItineraryStep[] = itinerarySource.map((step) => {
    const stepTitleKm = step.titleKm;
    const stepTitleEn = step.titleEn;
    const stepDescKm = step.descriptionKm;
    const stepDescEn = step.descriptionEn;
    const stepHotelKm = step.hotelNameKm;
    const stepHotelEn = step.hotelNameEn;
    const stepAssemblyKm = step.assemblyPointKm;
    const stepAssemblyEn = step.assemblyPointEn;

    const stepMealsKm = (step.mealsIncludedKm && step.mealsIncludedKm.length > 0) ? step.mealsIncludedKm : undefined;
    const stepMealsEn = (step.mealsIncludedEn && step.mealsIncludedEn.length > 0) ? step.mealsIncludedEn : undefined;

    const stepHighlightsKm = (step.dayHighlightsKm && step.dayHighlightsKm.length > 0) ? step.dayHighlightsKm : undefined;
    const stepHighlightsEn = (step.dayHighlightsEn && step.dayHighlightsEn.length > 0) ? step.dayHighlightsEn : undefined;

    const agendaSource = step.guideAgenda || [];

    const localizedGuideAgenda: GuideScheduleSlot[] = agendaSource.map((slot) => {
      const slotActKm = slot.activityKm;
      const slotActEn = slot.activityEn;
      const slotLocKm = slot.locationKm;
      const slotLocEn = slot.locationEn;
      const slotNotesKm = slot.notesKm;
      const slotNotesEn = slot.notesEn;

      return {
        ...slot,
        activity: getLocalizedText(slotActKm, slotActEn, slot.activity || '', lang),
        location: getLocalizedText(slotLocKm, slotLocEn, slot.location || '', lang) || undefined,
        notes: getLocalizedText(slotNotesKm, slotNotesEn, slot.notes || '', lang) || undefined,
      };
    });

    return {
      ...step,
      title: getLocalizedText(stepTitleKm, stepTitleEn, step.title || '', lang),
      description: getLocalizedText(stepDescKm, stepDescEn, step.description || '', lang),
      hotelName: getLocalizedText(stepHotelKm, stepHotelEn, step.hotelName || '', lang) || undefined,
      mealsIncluded: getLocalizedArray(stepMealsKm, stepMealsEn, step.mealsIncluded || [], lang),
      dayHighlights: getLocalizedArray(stepHighlightsKm, stepHighlightsEn, step.dayHighlights || [], lang),
      assemblyPoint: getLocalizedText(stepAssemblyKm, stepAssemblyEn, step.assemblyPoint || '', lang) || undefined,
      guideAgenda: localizedGuideAgenda
    };
  });

  const optionalProgramsSource = pkg.optionalPrograms || [];

  const localizedOptionalPrograms: OptionalTourProgram[] = optionalProgramsSource.map((prog) => {
    const progTitleKm = prog.titleKm;
    const progTitleEn = prog.titleEn;
    const progDescKm = prog.descriptionKm;
    const progDescEn = prog.descriptionEn;
    const progAudKm = prog.recommendedAudienceKm;
    const progAudEn = prog.recommendedAudienceEn;
    const progMeetingKm = prog.meetingPointKm;
    const progMeetingEn = prog.meetingPointEn;

    const progHlKm = (prog.highlightsKm && prog.highlightsKm.length > 0) ? prog.highlightsKm : undefined;
    const progHlEn = (prog.highlightsEn && prog.highlightsEn.length > 0) ? prog.highlightsEn : undefined;

    const progMealsKm = (prog.includedMealsKm && prog.includedMealsKm.length > 0) ? prog.includedMealsKm : undefined;
    const progMealsEn = (prog.includedMealsEn && prog.includedMealsEn.length > 0) ? prog.includedMealsEn : undefined;

    return {
      ...prog,
      title: getLocalizedText(progTitleKm, progTitleEn, prog.title || '', lang),
      description: getLocalizedText(progDescKm, progDescEn, prog.description || '', lang),
      recommendedAudience: getLocalizedText(progAudKm, progAudEn, prog.recommendedAudience || '', lang) || undefined,
      highlights: getLocalizedArray(progHlKm, progHlEn, prog.highlights || [], lang),
      includedMeals: getLocalizedArray(progMealsKm, progMealsEn, prog.includedMeals || [], lang),
      meetingPoint: getLocalizedText(progMeetingKm, progMeetingEn, prog.meetingPoint || '', lang) || undefined,
    };
  });

  const tourGuideSource = pkg.tourGuide;
  const localizedTourGuide: TourGuide | undefined = tourGuideSource ? {
    ...tourGuideSource,
    name: getLocalizedText(tourGuideSource.nameKm, tourGuideSource.nameEn, tourGuideSource.name || '', lang),
    title: getLocalizedText(tourGuideSource.titleKm, tourGuideSource.titleEn, tourGuideSource.title || '', lang),
    bio: getLocalizedText(tourGuideSource.bioKm, tourGuideSource.bioEn, tourGuideSource.bio || '', lang) || undefined,
    briefingMeetingPoint: getLocalizedText(tourGuideSource.briefingMeetingPointKm, tourGuideSource.briefingMeetingPointEn, tourGuideSource.briefingMeetingPoint || '', lang) || undefined,
    briefingTime: getLocalizedText(tourGuideSource.briefingTimeKm, tourGuideSource.briefingTimeEn, tourGuideSource.briefingTime || '', lang) || undefined,
  } : undefined;

  return {
    ...pkg,
    title: getLocalizedText(titleKm, titleEn, pkg.title || '', lang),
    description: getLocalizedText(descriptionKm, descriptionEn, pkg.description || '', lang),
    destination: getLocalizedText(destinationKm, destinationEn, pkg.destination || '', lang),
    country: getLocalizedText(countryKm, countryEn, pkg.country || '', lang),
    category: getLocalizedText(categoryKm, categoryEn, pkg.category || '', lang) || pkg.category,
    highlights: getLocalizedArray(highlightsKm, highlightsEn, pkg.highlights || [], lang),
    whoShouldJoin: getLocalizedArray(whoShouldJoinKm, whoShouldJoinEn, pkg.whoShouldJoin || [], lang),
    whyShouldJoin: getLocalizedArray(whyShouldJoinKm, whyShouldJoinEn, pkg.whyShouldJoin || [], lang),
    inclusions: getLocalizedArray(inclusionsKm, inclusionsEn, pkg.inclusions || [], lang),
    exclusions: getLocalizedArray(exclusionsKm, exclusionsEn, pkg.exclusions || [], lang),
    termsAndConditions: getLocalizedArray(termsKm, termsEn, pkg.termsAndConditions || [], lang),
    itinerary: localizedItinerary,
    optionalPrograms: localizedOptionalPrograms,
    tourGuide: localizedTourGuide
  };
}
