import { TourPackage, ItineraryStep, GuideScheduleSlot, OptionalTourProgram, TourGuide, LanguageCode } from '../types';
import { OFFICIAL_BIZTRIP_PACKAGE } from '../services/mockData';

/**
 * Resolves a localized text string based on active language.
 */
export function getLocalizedText(
  khmerVal: string | undefined,
  englishVal: string | undefined,
  fallbackVal: string,
  lang: LanguageCode = 'km'
): string {
  if (lang === 'km') {
    return khmerVal?.trim() || fallbackVal || englishVal || '';
  }
  // For 'en' and all other non-Khmer languages, prefer English
  return englishVal?.trim() || (khmerVal ? undefined : fallbackVal) || fallbackVal || khmerVal || '';
}

/**
 * Resolves a localized array of strings based on active language.
 */
export function getLocalizedArray(
  khmerArr: string[] | undefined,
  englishArr: string[] | undefined,
  fallbackArr: string[],
  lang: LanguageCode = 'km'
): string[] {
  if (lang === 'km') {
    return khmerArr && khmerArr.length > 0 ? khmerArr : fallbackArr || englishArr || [];
  }
  return englishArr && englishArr.length > 0 ? englishArr : fallbackArr || khmerArr || [];
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
        activity: getLocalizedText(slotActKm, slotActEn, slot.activity, lang),
        location: slot.location ? getLocalizedText(slotLocKm, slotLocEn, slot.location, lang) : (slotLocEn || slotLocKm),
        notes: slot.notes ? getLocalizedText(slotNotesKm, slotNotesEn, slot.notes, lang) : (slotNotesEn || slotNotesKm),
      };
    });

    return {
      ...step,
      title: getLocalizedText(stepTitleKm, stepTitleEn, step.title, lang),
      description: getLocalizedText(stepDescKm, stepDescEn, step.description, lang),
      hotelName: step.hotelName ? getLocalizedText(stepHotelKm, stepHotelEn, step.hotelName, lang) : (stepHotelEn || stepHotelKm),
      mealsIncluded: getLocalizedArray(stepMealsKm, stepMealsEn, step.mealsIncluded || [], lang),
      dayHighlights: getLocalizedArray(stepHighlightsKm, stepHighlightsEn, step.dayHighlights || [], lang),
      assemblyPoint: step.assemblyPoint ? getLocalizedText(stepAssemblyKm, stepAssemblyEn, step.assemblyPoint, lang) : (stepAssemblyEn || stepAssemblyKm),
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
      title: getLocalizedText(progTitleKm, progTitleEn, prog.title, lang),
      description: getLocalizedText(progDescKm, progDescEn, prog.description, lang),
      recommendedAudience: prog.recommendedAudience ? getLocalizedText(progAudKm, progAudEn, prog.recommendedAudience, lang) : (progAudEn || progAudKm),
      highlights: getLocalizedArray(progHlKm, progHlEn, prog.highlights || [], lang),
      includedMeals: prog.includedMeals ? getLocalizedArray(progMealsKm, progMealsEn, prog.includedMeals, lang) : (progMealsEn || progMealsKm),
      meetingPoint: prog.meetingPoint ? getLocalizedText(progMeetingKm, progMeetingEn, prog.meetingPoint, lang) : (progMeetingEn || progMeetingKm),
    };
  });

  const tourGuideSource = pkg.tourGuide;
  const localizedTourGuide: TourGuide | undefined = tourGuideSource ? {
    ...tourGuideSource,
    name: getLocalizedText(tourGuideSource.nameKm, tourGuideSource.nameEn, tourGuideSource.name, lang),
    title: getLocalizedText(tourGuideSource.titleKm, tourGuideSource.titleEn, tourGuideSource.title, lang),
    bio: tourGuideSource.bio ? getLocalizedText(tourGuideSource.bioKm, tourGuideSource.bioEn, tourGuideSource.bio, lang) : (tourGuideSource.bioEn || tourGuideSource.bioKm),
    briefingMeetingPoint: tourGuideSource.briefingMeetingPoint ? getLocalizedText(tourGuideSource.briefingMeetingPointKm, tourGuideSource.briefingMeetingPointEn, tourGuideSource.briefingMeetingPoint, lang) : (tourGuideSource.briefingMeetingPointEn || tourGuideSource.briefingMeetingPointKm),
    briefingTime: tourGuideSource.briefingTime ? getLocalizedText(tourGuideSource.briefingTimeKm, tourGuideSource.briefingTimeEn, tourGuideSource.briefingTime, lang) : (tourGuideSource.briefingTimeEn || tourGuideSource.briefingTimeKm),
  } : undefined;

  return {
    ...pkg,
    title: getLocalizedText(titleKm, titleEn, pkg.title, lang),
    description: getLocalizedText(descriptionKm, descriptionEn, pkg.description, lang),
    destination: getLocalizedText(destinationKm, destinationEn, pkg.destination, lang),
    country: getLocalizedText(countryKm, countryEn, pkg.country, lang),
    category: pkg.category ? getLocalizedText(categoryKm, categoryEn, pkg.category, lang) : (categoryEn || categoryKm),
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
