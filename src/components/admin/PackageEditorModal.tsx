import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TourPackage,
  TourPackageStatus,
  ItineraryStep,
  GuideScheduleSlot,
  OptionalTourProgram,
  TourGuide,
  EmergencyContact
} from '../../types';
import { parseTourPackageFromText, translateEntirePackage } from '../../services/geminiService';
import { FieldAiTranslator } from './FieldAiTranslator';
import { BilingualListEditor } from './BilingualListEditor';
import {
  X,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  User,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Phone,
  Send,
  Building,
  Utensils,
  ChevronDown,
  ChevronUp,
  FileText,
  Wand2,
  ClipboardPaste,
  Loader2,
  CheckCheck,
  Zap,
  ArrowRight,
  Info,
  Upload,
  UploadCloud,
  Camera,
  Check,
  Pencil,
  Edit3,
  Users,
  Target,
  HelpCircle,
  Languages,
  RefreshCw,
  Tag
} from 'lucide-react';
import { PackageCategoryModal } from './PackageCategoryModal';

/**
 * Utility to compress and convert client image files into lightweight Base64 DataURLs.
 */
const compressAndReadImage = (file: File, maxWidth = 1600, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface PackageEditorModalProps {
  pkg?: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkgData: TourPackage) => void;
  initialOpenWithAi?: boolean;
}

type TabType = 'basic' | 'media' | 'guide' | 'itinerary' | 'optional' | 'terms' | 'emergency';

export const PackageEditorModal: React.FC<PackageEditorModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSave,
  initialOpenWithAi = false
}) => {
  const isEditing = !!pkg;
  const { language, packageCategories } = useApp();
  const isEnglishMain = language === 'en';

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState<boolean>(false);

  // AI Auto-Fill / Text Importer State
  const [isAiImporterOpen, setIsAiImporterOpen] = useState<boolean>(initialOpenWithAi || !pkg);
  const [rawTextToParse, setRawTextToParse] = useState<string>('');
  const [isParsingAi, setIsParsingAi] = useState<boolean>(false);
  const [aiSuccessSummary, setAiSuccessSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Basic Info State
  const [status, setStatus] = useState<TourPackageStatus>(pkg?.status || 'active');
  const [title, setTitle] = useState(pkg?.title || '');
  const [titleKm, setTitleKm] = useState(pkg?.titleKm || pkg?.title || '');
  const [titleEn, setTitleEn] = useState(pkg?.titleEn || '');
  const [destination, setDestination] = useState(pkg?.destination || '');
  const [destinationKm, setDestinationKm] = useState(pkg?.destinationKm || pkg?.destination || '');
  const [destinationEn, setDestinationEn] = useState(pkg?.destinationEn || '');
  const [country, setCountry] = useState(pkg?.country || 'Vietnam');
  const [countryKm, setCountryKm] = useState(pkg?.countryKm || pkg?.country || '');
  const [countryEn, setCountryEn] = useState(pkg?.countryEn || '');
  const [category, setCategory] = useState(pkg?.category || 'trade_mission');
  const [categoryKm, setCategoryKm] = useState(pkg?.categoryKm || '');
  const [categoryEn, setCategoryEn] = useState(pkg?.categoryEn || '');
  const [isCantonFair, setIsCantonFair] = useState<boolean>(pkg?.isCantonFair ?? (pkg?.category === 'canton_fair' || !!pkg?.cantonFairPhase));
  const [cantonFairPhase, setCantonFairPhase] = useState<'Phase 1' | 'Phase 2' | 'Phase 3' | 'All Phases' | 'Multi-Phase' | undefined>(pkg?.cantonFairPhase);
  const [priceUSD, setPriceUSD] = useState<number>(pkg?.priceUSD || 350);
  const [discountPriceUSD, setDiscountPriceUSD] = useState<number | undefined>(pkg?.discountPriceUSD || 299);
  const [durationDays, setDurationDays] = useState<number>(pkg?.durationDays || 4);
  const [durationNights, setDurationNights] = useState<number>(pkg?.durationNights || 3);
  const [hotelStars, setHotelStars] = useState<number>(pkg?.hotelStars || 4);
  const [flightIncluded, setFlightIncluded] = useState<boolean>(pkg?.flightIncluded ?? true);
  const [availableDates, setAvailableDates] = useState<string[]>(pkg?.availableDates || ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  const [newDateInput, setNewDateInput] = useState('');
  const [availableDatesText, setAvailableDatesText] = useState(pkg?.availableDates?.join(', ') || '2026-10-29, 2026-10-30, 2026-10-31, 2026-11-01');
  const [tags, setTags] = useState<string[]>(pkg?.tags || ['trending', 'popular', 'cultural']);
  const [newTagInput, setNewTagInput] = useState('');
  const [rating, setRating] = useState<number>(pkg?.rating || 5.0);
  const [reviewCount, setReviewCount] = useState<number>(pkg?.reviewCount || 32);
  const [bookedThisMonth, setBookedThisMonth] = useState<number>(pkg?.bookedThisMonth || 18);
  const [lat, setLat] = useState<number>(pkg?.coordinates?.lat || 10.8231);
  const [lng, setLng] = useState<number>(pkg?.coordinates?.lng || 106.6297);
  const [mapX, setMapX] = useState<number>(pkg?.coordinates?.mapX || 74);
  const [mapY, setMapY] = useState<number>(pkg?.coordinates?.mapY || 62);

  // Media & Descriptions State
  const [description, setDescription] = useState(pkg?.description || '');
  const [descriptionKm, setDescriptionKm] = useState(pkg?.descriptionKm || pkg?.description || '');
  const [descriptionEn, setDescriptionEn] = useState(pkg?.descriptionEn || '');
  const [newLanguageInput, setNewLanguageInput] = useState('');
  const [images, setImages] = useState<string[]>(pkg?.images || [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&auto=format&fit=crop&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Highlights Bilingual State
  const [highlightsKm, setHighlightsKm] = useState<string[]>(
    pkg?.highlightsKm || pkg?.highlights || [
      '🤝 ស្វែងរកផលិតផលបោះដុំពាក់ព័ន្ធនឹង តែ កាហ្វេ ការដុតនំ និងការលក់រាយ (Wholesale Sourcing)',
      '⚙️ សម្ភារៈ និងឧបករណ៍ឆុងកាហ្វេ ធ្វើនំ និងបច្ចេកវិទ្យាពាក់ព័ន្ធនឹងលក់រាយ (Equipment & RetailTech)',
      '🏢 ប្រេនល្បីៗនៅវៀតណាម និងអន្តរជាតិសម្រាប់ទិញសិទ្ធិ Franchise មកកម្ពុជា (Franchise Opportunities)'
    ]
  );
  const [highlightsEn, setHighlightsEn] = useState<string[]>(pkg?.highlightsEn || []);

  // Who Should Join Bilingual State
  const [whoShouldJoinKm, setWhoShouldJoinKm] = useState<string[]>(
    pkg?.whoShouldJoinKm || pkg?.whoShouldJoin || [
      'ម្ចាស់ហាងកាហ្វេ ម្ចាស់ហាងនំ Bakery និងភោជនីយដ្ឋាន ដែលចង់ស្វែងរកប្រភពទំនិញបោះដុំផ្ទាល់ពីរោងចក្រ',
      'សហគ្រិន និងអ្នកវិនិយោគដែលចង់ទិញសិទ្ធិអាជីវកម្ម (Franchise) មកបើកដំណើរការនៅកម្ពុជា',
      'អ្នកនាំចូល និងចែកចាយ (Importers & Wholesalers) សម្ភារៈ គ្រឿងផ្សំ និងឧបករណ៍ឧស្សាហកម្មម្ហូបអាហារ'
    ]
  );
  const [whoShouldJoinEn, setWhoShouldJoinEn] = useState<string[]>(pkg?.whoShouldJoinEn || []);

  // Why You Should Join Bilingual State
  const [whyShouldJoinKm, setWhyShouldJoinKm] = useState<string[]>(
    pkg?.whyShouldJoinKm || pkg?.whyShouldJoin || [
      'ទទួលបានតម្លៃដើមផ្ទាល់ពីរោងចក្រផលិត (Factory-Direct Wholesale Pricing) ដោយគ្មានឈ្មួញកណ្តាល',
      'ជួបពិភាក្សា និងចរចាផ្ទាល់ជាមួយដៃគូផ្គត់ផ្គង់ និងម្ចាស់ប្រេនល្បីៗជាង ១,០០០ ក្រុមហ៊ុន',
      'សេវាសម្រួលបែបបទឆ្លងដែន VIP Fast-Track និងការស្នាក់នៅសណ្ឋាគារលំដាប់ ៤ ផ្កាយប្រណិត'
    ]
  );
  const [whyShouldJoinEn, setWhyShouldJoinEn] = useState<string[]>(pkg?.whyShouldJoinEn || []);

  // Inclusions Bilingual State
  const [inclusionsKm, setInclusionsKm] = useState<string[]>(
    pkg?.inclusionsKm || pkg?.inclusions || [
      'រថយន្តក្រុង VIP ពីភ្នំពេញ ទៅកាន់ប្រទេសវៀតណាម (Phnom Penh to Vietnam VIP Coach)',
      'សណ្ឋាគារស្នាក់នៅស្តង់ដារ ៤ ផ្កាយ (៣ យប់ / ៤ ថ្ងៃ)',
      'អាហារពេលព្រឹកប៊ូហ្វេប្រចាំថ្ងៃនៅសណ្ឋាគារ (Daily Hotel Buffet Breakfast)',
      'រថយន្តក្រុង VIP ដឹកជញ្ជូនពេញដំណើរបេសកកម្មនៅប្រទេសវៀតណាម (Dedicated Bus in Vietnam)',
      'សំបុត្រជិះកប៉ាល់ល្បឿនលឿនពី កោះត្រល់ មកកាន់ខេត្តកំពត (High-Speed Ferry: Phu Quoc to Kampot)',
      'រថយន្តក្រុង VIP ពីខេត្តកំពត ត្រឡប់មកកាន់រាជធានីភ្នំពេញ (VIP Coach: Kampot to Phnom Penh)',
      'មគ្គុទ្ទេសក៍ទេសចរណ៍ជំនាញនិយាយ វៀតណាម-អង់គ្លេស-ខ្មែរ (Certified Bilingual Escort & Guide)',
      'ការចុះឈ្មោះ និងកាតផ្លូវការចូលទស្សនាពិព័រណ៍ទាំង ៣ ដោយឥតគិតថ្លៃ (Official VIP Expo Passes)',
      'សេវាសម្រួលបែបបទឆ្លងដែន VIP (Fast-Track Border & Immigration VIP Clearance)',
      'សំបុត្រយន្តហោះក្នុងស្រុកពី ហូជីមិញ ទៅកាន់ កោះត្រល់ (Domestic Flight: HCMC to Phu Quoc)'
    ]
  );
  const [inclusionsEn, setInclusionsEn] = useState<string[]>(pkg?.inclusionsEn || []);

  // Exclusions Bilingual State
  const [exclusionsKm, setExclusionsKm] = useState<string[]>(
    pkg?.exclusionsKm || pkg?.exclusions || [
      'អាហារថ្ងៃត្រង់ និងអាហារពេលល្ងាចផ្ទាល់ខ្លួន (លើកលែងតែកម្មវិធីដែលបានបញ្ជាក់)',
      'ការចំណាយផ្ទាល់ខ្លួន (ទិញទំនិញ, សេវាបោកអ៊ុត, ទូរស័ព្ទ)',
      'ថ្លៃកម្មវិធីជម្រើសបន្ថែម (Optional Tour Programs / VIP 1-on-1 Dinner)',
      'ធានារ៉ាប់រងការធ្វើដំណើរក្រៅប្រទេសផ្ទាល់ខ្លួន'
    ]
  );
  const [exclusionsEn, setExclusionsEn] = useState<string[]>(pkg?.exclusionsEn || []);

  // Terms & Conditions Bilingual State
  const [termsAndConditionsKm, setTermsAndConditionsKm] = useState<string[]>(
    pkg?.termsAndConditionsKm || pkg?.termsAndConditions || [
      'លិខិតឆ្លងដែន (Passport) ត្រូវតែមានសុពលភាពយ៉ាងតិច ៦ ខែ គិតចាប់ពីថ្ងៃចេញដំណើរ។',
      'ការកក់កន្លែង និងធានាសិទ្ធិចូលរួម ត្រូវតម្កល់ប្រាក់កក់យ៉ាងតិច 50% នៃតម្លៃសរុបពេលចុះឈ្មោះ។',
      'ការបង់ប្រាក់បង្គ្រប់ 100% ត្រូវធ្វើឡើងយ៉ាងតិច ៧ ថ្ងៃ មុនកាលបរិច្ឆេទចេញដំណើរ។',
      'ករណីលុបចោលការធ្វើដំណើរមុន ១៥ ថ្ងៃ នឹងទទួលបានការបង្វិលប្រាក់វិញ 70%។ ករណីលុបចោលក្រោម ៧ ថ្ងៃ មិនអាចបង្វិលប្រាក់បានទេ។',
      'អ្នកចូលរួមត្រូវគោរពតាមពេលវេលា និងការណែនាំរបស់មគ្គុទ្ទេសក៍ និងអ្នកសម្របសម្រួលបេសកកម្ម។',
      'ក្រុមហ៊ុនសូមរក្សាសិទ្ធិកែប្រែកាលវិភាគ ឬសណ្ឋាគារក្នុងកម្រិតស្មើគ្នា ករណីមានប្រធានសក្តិ ឬហេតុការណ៍ចៃដន្យ។'
    ]
  );
  const [termsAndConditionsEn, setTermsAndConditionsEn] = useState<string[]>(pkg?.termsAndConditionsEn || []);

  // Tour Guide Profile Bilingual State
  const [guideName, setGuideName] = useState(pkg?.tourGuide?.name || 'Mr. Tim Vutha & Senior Escort Team');
  const [guideNameKm, setGuideNameKm] = useState(pkg?.tourGuide?.nameKm || pkg?.tourGuide?.name || 'Mr. Tim Vutha & Senior Escort Team');
  const [guideNameEn, setGuideNameEn] = useState(pkg?.tourGuide?.nameEn || '');
  const [guideTitle, setGuideTitle] = useState(pkg?.tourGuide?.title || 'Lead Trade Mission Coordinator & Certified Tour Director');
  const [guideTitleKm, setGuideTitleKm] = useState(pkg?.tourGuide?.titleKm || pkg?.tourGuide?.title || 'Lead Trade Mission Coordinator & Certified Tour Director');
  const [guideTitleEn, setGuideTitleEn] = useState(pkg?.tourGuide?.titleEn || '');
  const [guidePhone, setGuidePhone] = useState(pkg?.tourGuide?.phone || '060 815 515');
  const [guideTelegram, setGuideTelegram] = useState(pkg?.tourGuide?.telegram || '@VuthaTim');
  const [guideLanguages, setGuideLanguages] = useState<string[]>(pkg?.tourGuide?.languages || ['Khmer', 'Vietnamese', 'English']);
  const [guideBadge, setGuideBadge] = useState(pkg?.tourGuide?.badgeNumber || 'KHB-TM-2026-01');
  const [guidePhoto, setGuidePhoto] = useState(pkg?.tourGuide?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
  const [guideBio, setGuideBio] = useState(pkg?.tourGuide?.bio || 'អ្នកសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្មជាន់ខ្ពស់ និងជាប្រធានដឹកនាំគណៈប្រតិភូពាណិជ្ជកម្មកម្ពុជា-វៀតណាម ប្រកបដោយបទពិសោធន៍ជាង ១២ ឆ្នាំ។');
  const [guideBioKm, setGuideBioKm] = useState(pkg?.tourGuide?.bioKm || pkg?.tourGuide?.bio || 'អ្នកសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្មជាន់ខ្ពស់ និងជាប្រធានដឹកនាំគណៈប្រតិភូពាណិជ្ជកម្មកម្ពុជា-វៀតណាម ប្រកបដោយបទពិសោធន៍ជាង ១២ ឆ្នាំ។');
  const [guideBioEn, setGuideBioEn] = useState(pkg?.tourGuide?.bioEn || '');
  const [briefingMeetingPoint, setBriefingMeetingPoint] = useState(pkg?.tourGuide?.briefingMeetingPoint || 'រាជធានីភ្នំពេញ (ចំណុចប្រមូលផ្តុំ KHB Head Office / រថយន្ត VIP) - ម៉ោង ០៦:០០ ព្រឹក');
  const [briefingMeetingPointKm, setBriefingMeetingPointKm] = useState(pkg?.tourGuide?.briefingMeetingPointKm || pkg?.tourGuide?.briefingMeetingPoint || 'រាជធានីភ្នំពេញ (ចំណុចប្រមូលផ្តុំ KHB Head Office / រថយន្ត VIP) - ម៉ោង ០៦:០០ ព្រឹក');
  const [briefingMeetingPointEn, setBriefingMeetingPointEn] = useState(pkg?.tourGuide?.briefingMeetingPointEn || '');
  const [briefingTime, setBriefingTime] = useState(pkg?.tourGuide?.briefingTime || '06:00 AM (ថ្ងៃទី 29/10/2026)');
  const [briefingTimeKm, setBriefingTimeKm] = useState(pkg?.tourGuide?.briefingTimeKm || pkg?.tourGuide?.briefingTime || '06:00 AM (ថ្ងៃទី 29/10/2026)');
  const [briefingTimeEn, setBriefingTimeEn] = useState(pkg?.tourGuide?.briefingTimeEn || '');

  // Package-wide Auto-Translate Loading State
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [translatingDirection, setTranslatingDirection] = useState<'km-en' | 'en-km' | null>(null);
  const [translationSuccessMessage, setTranslationSuccessMessage] = useState<string | null>(null);

  const handleTranslateEntirePackage = async (fromLang: 'km' | 'en', toLang: 'km' | 'en') => {
    setIsTranslatingAll(true);
    setTranslatingDirection(fromLang === 'km' ? 'km-en' : 'en-km');
    setTranslationSuccessMessage(null);
    try {
      const currentPkg: TourPackage = {
        ...(pkg || {}),
        id: pkg?.id || 'temp',
        title: title || titleKm,
        titleKm: titleKm || title,
        titleEn,
        destination: destination || destinationKm,
        destinationKm: destinationKm || destination,
        destinationEn,
        country: country || countryKm,
        countryKm: countryKm || country,
        countryEn,
        category: category || categoryKm,
        categoryKm: categoryKm || category,
        categoryEn,
        priceUSD: Number(priceUSD) || 0,
        discountPriceUSD: discountPriceUSD ? Number(discountPriceUSD) : undefined,
        durationDays: Number(durationDays) || 1,
        durationNights: Number(durationNights) || 0,
        hotelStars: Number(hotelStars) || 4,
        flightIncluded,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80'],
        availableDates: availableDates.length > 0 ? availableDates : ['2026-10-29'],
        tags: tags as any,
        rating: Number(rating) || 5.0,
        reviewCount: Number(reviewCount) || 1,
        bookedThisMonth: Number(bookedThisMonth) || 0,
        coordinates: {
          lat: Number(lat) || 10.8231,
          lng: Number(lng) || 106.6297,
          mapX: Number(mapX) || 74,
          mapY: Number(mapY) || 62
        },
        description: description || descriptionKm,
        descriptionKm: descriptionKm || description,
        descriptionEn,
        highlights: highlightsKm.length > 0 ? highlightsKm : [],
        highlightsKm,
        highlightsEn,
        whoShouldJoin: whoShouldJoinKm.length > 0 ? whoShouldJoinKm : [],
        whoShouldJoinKm,
        whoShouldJoinEn,
        whyShouldJoin: whyShouldJoinKm.length > 0 ? whyShouldJoinKm : [],
        whyShouldJoinKm,
        whyShouldJoinEn,
        inclusions: inclusionsKm.length > 0 ? inclusionsKm : [],
        inclusionsKm,
        inclusionsEn,
        exclusions: exclusionsKm.length > 0 ? exclusionsKm : [],
        exclusionsKm,
        exclusionsEn,
        termsAndConditions: termsAndConditionsKm.length > 0 ? termsAndConditionsKm : [],
        termsAndConditionsKm,
        termsAndConditionsEn,
        tourGuide: {
          name: guideNameKm || guideName,
          nameKm: guideNameKm || guideName,
          nameEn: guideNameEn,
          title: guideTitleKm || guideTitle,
          titleKm: guideTitleKm || guideTitle,
          titleEn: guideTitleEn,
          phone: guidePhone,
          telegram: guideTelegram,
          languages: guideLanguages,
          badgeNumber: guideBadge,
          photoUrl: guidePhoto,
          bio: guideBioKm || guideBio,
          bioKm: guideBioKm || guideBio,
          bioEn: guideBioEn,
          briefingMeetingPoint: briefingMeetingPointKm || briefingMeetingPoint,
          briefingMeetingPointKm: briefingMeetingPointKm || briefingMeetingPoint,
          briefingMeetingPointEn: briefingMeetingPointEn,
          briefingTime: briefingTimeKm || briefingTime,
          briefingTimeKm: briefingTimeKm || briefingTime,
          briefingTimeEn: briefingTimeEn
        },
        itinerary,
        optionalPrograms
      };

      const result = await translateEntirePackage(currentPkg, toLang, fromLang);
      if (result.success && result.translatedPackage) {
        const trans = result.translatedPackage;
        if (toLang === 'en') {
          if (trans.titleEn || trans.title) setTitleEn(trans.titleEn || trans.title || '');
          if (trans.destinationEn || trans.destination) setDestinationEn(trans.destinationEn || trans.destination || '');
          if (trans.countryEn || trans.country) setCountryEn(trans.countryEn || trans.country || '');
          if (trans.categoryEn || trans.category) setCategoryEn(trans.categoryEn || trans.category || '');
          if (trans.descriptionEn || trans.description) setDescriptionEn(trans.descriptionEn || trans.description || '');
          if (trans.highlightsEn?.length) setHighlightsEn(trans.highlightsEn);
          if (trans.whoShouldJoinEn?.length) setWhoShouldJoinEn(trans.whoShouldJoinEn);
          if (trans.whyShouldJoinEn?.length) setWhyShouldJoinEn(trans.whyShouldJoinEn);
          if (trans.inclusionsEn?.length) setInclusionsEn(trans.inclusionsEn);
          if (trans.exclusionsEn?.length) setExclusionsEn(trans.exclusionsEn);
          if (trans.termsAndConditionsEn?.length) setTermsAndConditionsEn(trans.termsAndConditionsEn);
          if (trans.tourGuide?.nameEn || trans.tourGuide?.name) setGuideNameEn(trans.tourGuide.nameEn || trans.tourGuide.name || '');
          if (trans.tourGuide?.titleEn || trans.tourGuide?.title) setGuideTitleEn(trans.tourGuide.titleEn || trans.tourGuide.title || '');
          if (trans.tourGuide?.bioEn || trans.tourGuide?.bio) setGuideBioEn(trans.tourGuide.bioEn || trans.tourGuide.bio || '');
          if (trans.tourGuide?.briefingMeetingPointEn || trans.tourGuide?.briefingMeetingPoint) setBriefingMeetingPointEn(trans.tourGuide.briefingMeetingPointEn || trans.tourGuide.briefingMeetingPoint || '');
          if (trans.tourGuide?.briefingTimeEn || trans.tourGuide?.briefingTime) setBriefingTimeEn(trans.tourGuide.briefingTimeEn || trans.tourGuide.briefingTime || '');
          if (trans.itinerary) setItinerary(trans.itinerary);
          if (trans.optionalPrograms) setOptionalPrograms(trans.optionalPrograms);
          setTranslationSuccessMessage('✨ AI បានបកប្រែពត៌មានដំណើរកម្សាន្តទាំងអស់ទៅជាភាសាអង់គ្លេសដោយជោគជ័យ!');
        } else {
          if (trans.titleKm || trans.title) { setTitle(trans.titleKm || trans.title || ''); setTitleKm(trans.titleKm || trans.title || ''); }
          if (trans.destinationKm || trans.destination) { setDestination(trans.destinationKm || trans.destination || ''); setDestinationKm(trans.destinationKm || trans.destination || ''); }
          if (trans.countryKm || trans.country) { setCountry(trans.countryKm || trans.country || ''); setCountryKm(trans.countryKm || trans.country || ''); }
          if (trans.categoryKm || trans.category) { setCategory(trans.categoryKm || trans.category || ''); setCategoryKm(trans.categoryKm || trans.category || ''); }
          if (trans.descriptionKm || trans.description) { setDescription(trans.descriptionKm || trans.description || ''); setDescriptionKm(trans.descriptionKm || trans.description || ''); }
          if (trans.highlightsKm?.length) setHighlightsKm(trans.highlightsKm);
          if (trans.whoShouldJoinKm?.length) setWhoShouldJoinKm(trans.whoShouldJoinKm);
          if (trans.whyShouldJoinKm?.length) setWhyShouldJoinKm(trans.whyShouldJoinKm);
          if (trans.inclusionsKm?.length) setInclusionsKm(trans.inclusionsKm);
          if (trans.exclusionsKm?.length) setExclusionsKm(trans.exclusionsKm);
          if (trans.termsAndConditionsKm?.length) setTermsAndConditionsKm(trans.termsAndConditionsKm);
          if (trans.tourGuide?.nameKm || trans.tourGuide?.name) { setGuideName(trans.tourGuide.nameKm || trans.tourGuide.name || ''); setGuideNameKm(trans.tourGuide.nameKm || trans.tourGuide.name || ''); }
          if (trans.tourGuide?.titleKm || trans.tourGuide?.title) { setGuideTitle(trans.tourGuide.titleKm || trans.tourGuide.title || ''); setGuideTitleKm(trans.tourGuide.titleKm || trans.tourGuide.title || ''); }
          if (trans.tourGuide?.bioKm || trans.tourGuide?.bio) { setGuideBio(trans.tourGuide.bioKm || trans.tourGuide.bio || ''); setGuideBioKm(trans.tourGuide.bioKm || trans.tourGuide.bio || ''); }
          if (trans.tourGuide?.briefingMeetingPointKm || trans.tourGuide?.briefingMeetingPoint) { setBriefingMeetingPoint(trans.tourGuide.briefingMeetingPointKm || trans.tourGuide.briefingMeetingPoint || ''); setBriefingMeetingPointKm(trans.tourGuide.briefingMeetingPointKm || trans.tourGuide.briefingMeetingPoint || ''); }
          if (trans.tourGuide?.briefingTimeKm || trans.tourGuide?.briefingTime) { setBriefingTime(trans.tourGuide.briefingTimeKm || trans.tourGuide.briefingTime || ''); setBriefingTimeKm(trans.tourGuide.briefingTimeKm || trans.tourGuide.briefingTime || ''); }
          if (trans.itinerary) setItinerary(trans.itinerary);
          if (trans.optionalPrograms) setOptionalPrograms(trans.optionalPrograms);
          setTranslationSuccessMessage('✨ AI បានបកប្រែពត៌មានដំណើរកម្សាន្តទាំងអស់ទៅជាភាសាខ្មែរដោយជោគជ័យ!');
        }
      }
    } catch (e: any) {
      alert(`Auto-translation error: ${e?.message || 'Unknown translation error'}`);
    } finally {
      setIsTranslatingAll(false);
      setTranslatingDirection(null);
    }
  };

  // Itinerary & Hourly Agendas State
  const [itinerary, setItinerary] = useState<ItineraryStep[]>(pkg?.itinerary || [
    {
      day: 1,
      title: 'ភ្នំពេញ - ឆ្លងដែន VIP - ទីក្រុងហូជីមិញ & ពិធីស្វាគមន៍គណៈប្រតិភូ',
      description: 'ចេញដំណើរពីរាជធានីភ្នំពេញដោយរថយន្តក្រុង VIP ឆ្លងកាត់ច្រកទ្វារព្រំដែនបាវិត/ម៉ុកបៃ ជាមួយនឹងសេវាសម្រួលបែបបទឆ្លងដែនរហ័ស។',
      hotelName: 'Grand Saigon Riverside Boutique Hotel (4-Star)',
      mealsIncluded: ['Breakfast', 'Welcome Dinner'],
      guideAgenda: [
        { time: '06:00 AM - 06:30 AM', activity: 'ជួបជុំគណៈប្រតិភូនៅភ្នំពេញ & ចែកកាតសម្គាល់បេសកកម្ម', location: 'KHB Head Office Departure Bay', notes: 'សូមរៀបចំ Passport ឱ្យបានរួចរាល់' },
        { time: '10:30 AM - 11:30 AM', activity: 'សម្រួលបែបបទឆ្លងដែន VIP Fast-Track & ចូលប្រទេសវៀតណាម', location: 'Bavet - Moc Bai Border Checkpoint' },
        { time: '05:30 PM - 08:30 PM', activity: 'កម្មវិធីណែនាំគណៈប្រតិភូ Orientation & អាហារពេលល្ងាចស្វាគមន៍', location: 'Hotel Grand Banquet Hall' }
      ]
    }
  ]);
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);

  // Optional Programs State
  const [optionalPrograms, setOptionalPrograms] = useState<OptionalTourProgram[]>(pkg?.optionalPrograms || [
    {
      id: 'opt_vip_matchmaking',
      title: 'កម្មវិធី B2B VIP Matchmaking & ជំនួបពាណិជ្ជកម្មទល់មុខ',
      description: 'ការរៀបចំជំនួបផ្ទាល់ជាមួយម្ចាស់សហគ្រាសក្នុងស្រុក 3-5 ក្រុមហ៊ុន និងអាហារពេលល្ងាចបណ្តាញពាណិជ្ជកម្ម VIP',
      additionalCostUSD: 120,
      durationHours: 3.5,
      recommendedAudience: 'Business Owners & Franchise Investors',
      highlights: ['Dedicated bilingual translator', 'Private conference lounge', 'Buyer directory'],
      includesGuide: true,
      includedMeals: ['VIP Executive Banquet'],
      meetingPoint: 'Hotel Executive Conference Lounge (5:30 PM)'
    }
  ]);

  // Emergency Contacts State
  const [emergencyCountry, setEmergencyCountry] = useState(pkg?.emergencyContact?.country || 'Vietnam (Ho Chi Minh City & Phu Quoc)');
  const [emergencyPolice, setEmergencyPolice] = useState(pkg?.emergencyContact?.police || '113');
  const [emergencyAmbulance, setEmergencyAmbulance] = useState(pkg?.emergencyContact?.ambulance || '115');
  const [emergencyHelpline, setEmergencyHelpline] = useState(pkg?.emergencyContact?.touristHelpline || '060 815 515 (Mr. Tim Vutha)');
  const [emergencyEmbassy, setEmergencyEmbassy] = useState(pkg?.emergencyContact?.embassySupport || '+84 28 3829 2751 (Royal Embassy of Cambodia in Vietnam)');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const guidePhotoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Inline Item Editing State
  const [editingHighlightIdx, setEditingHighlightIdx] = useState<number | null>(null);
  const [editingHighlightText, setEditingHighlightText] = useState<string>('');

  const [editingWhoShouldJoinIdx, setEditingWhoShouldJoinIdx] = useState<number | null>(null);
  const [editingWhoShouldJoinText, setEditingWhoShouldJoinText] = useState<string>('');

  const [editingWhyShouldJoinIdx, setEditingWhyShouldJoinIdx] = useState<number | null>(null);
  const [editingWhyShouldJoinText, setEditingWhyShouldJoinText] = useState<string>('');

  const [editingInclusionIdx, setEditingInclusionIdx] = useState<number | null>(null);
  const [editingInclusionText, setEditingInclusionText] = useState<string>('');

  const [editingExclusionIdx, setEditingExclusionIdx] = useState<number | null>(null);
  const [editingExclusionText, setEditingExclusionText] = useState<string>('');

  const [editingTermIdx, setEditingTermIdx] = useState<number | null>(null);
  const [editingTermText, setEditingTermText] = useState<string>('');

  // Helpers for Lists & Image Uploads
  const handleImageFilesUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    const uploadedUrls: string[] = [];

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressedBase64 = await compressAndReadImage(file);
        uploadedUrls.push(compressedBase64);
      } catch (err) {
        console.error('Failed to compress/read image:', err);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages(prev => [...prev, ...uploadedUrls]);
    }
    setIsUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetHeroImage = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const hero = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([hero, ...rest]);
  };

  const handleGuidePhotoUpload = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const compressedBase64 = await compressAndReadImage(file, 600, 0.85);
      setGuidePhoto(compressedBase64);
    } catch (err) {
      console.error('Failed to upload guide photo:', err);
    }
    if (guidePhotoInputRef.current) guidePhotoInputRef.current.value = '';
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Departure Dates Handlers
  const handleAddDepartureDate = () => {
    if (!newDateInput.trim()) return;
    const dateVal = newDateInput.trim();
    if (!availableDates.includes(dateVal)) {
      const updated = [...availableDates, dateVal].sort();
      setAvailableDates(updated);
      setAvailableDatesText(updated.join(', '));
    }
    setNewDateInput('');
  };

  const handleRemoveDepartureDate = (dateToRemove: string) => {
    const updated = availableDates.filter(d => d !== dateToRemove);
    setAvailableDates(updated);
    setAvailableDatesText(updated.join(', '));
  };

  // Tags Handlers
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Guide Language Handlers
  const handleAddGuideLanguage = () => {
    if (!newLanguageInput.trim()) return;
    const lang = newLanguageInput.trim();
    if (!guideLanguages.includes(lang)) {
      setGuideLanguages([...guideLanguages, lang]);
    }
    setNewLanguageInput('');
  };

  const handleRemoveGuideLanguage = (index: number) => {
    setGuideLanguages(guideLanguages.filter((_, i) => i !== index));
  };

  // Optional Program Highlights Handlers
  const handleAddOptProgHighlight = (progIndex: number, text: string) => {
    if (!text.trim()) return;
    const prog = optionalPrograms[progIndex];
    const updated = [...(prog.highlights || []), text.trim()];
    handleUpdateOptionalProgram(progIndex, 'highlights', updated);
  };

  const handleRemoveOptProgHighlight = (progIndex: number, hlIndex: number) => {
    const prog = optionalPrograms[progIndex];
    const updated = (prog.highlights || []).filter((_, i) => i !== hlIndex);
    handleUpdateOptionalProgram(progIndex, 'highlights', updated);
  };

  // Itinerary Step Handlers
  const handleAddItineraryDay = () => {
    const nextDayNum = itinerary.length + 1;
    const newDay: ItineraryStep = {
      day: nextDayNum,
      title: `Day ${nextDayNum}: Trade Mission & Business Activity`,
      description: 'Program description for delegates and participants.',
      hotelName: '4-Star Hotel / Resort',
      mealsIncluded: ['Breakfast'],
      guideAgenda: [
        { time: '08:00 AM', activity: 'Morning Assembly & Briefing', location: 'Hotel Lobby' }
      ]
    };
    setItinerary([...itinerary, newDay]);
    setExpandedDayIndex(itinerary.length);
  };

  const handleRemoveItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index).map((day, idx) => ({
      ...day,
      day: idx + 1
    }));
    setItinerary(updated);
    if (expandedDayIndex === index) {
      setExpandedDayIndex(null);
    }
  };

  const handleUpdateDayField = (index: number, field: keyof ItineraryStep, value: any) => {
    setItinerary(itinerary.map((day, i) => i === index ? { ...day, [field]: value } : day));
  };

  // Guide Agenda Item Handlers for a Day
  const handleAddAgendaItem = (dayIndex: number) => {
    const day = itinerary[dayIndex];
    const currentAgenda = day.guideAgenda || [];
    const newSlot: GuideScheduleSlot = {
      time: '09:00 AM',
      activity: 'Business Activity / Exhibition Session',
      location: 'Main Hall',
      notes: ''
    };
    handleUpdateDayField(dayIndex, 'guideAgenda', [...currentAgenda, newSlot]);
  };

  const handleUpdateAgendaItem = (dayIndex: number, slotIndex: number, field: keyof GuideScheduleSlot, value: string) => {
    const day = itinerary[dayIndex];
    const currentAgenda = day.guideAgenda || [];
    const updatedAgenda = currentAgenda.map((slot, sIdx) => sIdx === slotIndex ? { ...slot, [field]: value } : slot);
    handleUpdateDayField(dayIndex, 'guideAgenda', updatedAgenda);
  };

  const handleRemoveAgendaItem = (dayIndex: number, slotIndex: number) => {
    const day = itinerary[dayIndex];
    const currentAgenda = day.guideAgenda || [];
    handleUpdateDayField(dayIndex, 'guideAgenda', currentAgenda.filter((_, sIdx) => sIdx !== slotIndex));
  };

  // Optional Program Handlers
  const handleAddOptionalProgram = () => {
    const newProg: OptionalTourProgram = {
      id: `opt_${Date.now()}`,
      title: 'New Optional Program / Site Tour',
      description: 'Detailed description of the optional program.',
      additionalCostUSD: 50,
      durationHours: 3,
      recommendedAudience: 'All Delegates',
      highlights: ['Guided service', 'Exclusive access'],
      includesGuide: true,
      includedMeals: ['Refreshments'],
      meetingPoint: 'Hotel Main Lobby'
    };
    setOptionalPrograms([...optionalPrograms, newProg]);
  };

  const handleUpdateOptionalProgram = (index: number, field: keyof OptionalTourProgram, value: any) => {
    setOptionalPrograms(optionalPrograms.map((prog, i) => i === index ? { ...prog, [field]: value } : prog));
  };

  const handleRemoveOptionalProgram = (index: number) => {
    setOptionalPrograms(optionalPrograms.filter((_, i) => i !== index));
  };

  // AI Text-to-Package Auto Input Handler
  const handleAutoInputFromText = async (textOverride?: string) => {
    const targetText = (textOverride || rawTextToParse).trim();
    if (!targetText) {
      setAiError('សូមបញ្ចូល ឬបិទភ្ជាប់ (Paste) អត្ថបទព័ត៌មានដំណើរកម្សាន្តជាមុនសិន!');
      return;
    }

    setIsParsingAi(true);
    setAiError(null);
    setAiSuccessSummary(null);

    try {
      const result = await parseTourPackageFromText(targetText, 'km');
      if (result.success && result.packageData) {
        const d = result.packageData;
        if (d.title) setTitle(d.title);
        if (d.destination) setDestination(d.destination);
        if (d.country) setCountry(d.country);
        if (d.category) setCategory(d.category);
        if (d.priceUSD !== undefined) setPriceUSD(d.priceUSD);
        if (d.discountPriceUSD !== undefined) setDiscountPriceUSD(d.discountPriceUSD);
        if (d.durationDays !== undefined) setDurationDays(d.durationDays);
        if (d.durationNights !== undefined) setDurationNights(d.durationNights);
        if (d.hotelStars !== undefined) setHotelStars(d.hotelStars);
        if (d.flightIncluded !== undefined) setFlightIncluded(d.flightIncluded);
        if (d.availableDates && d.availableDates.length > 0) setAvailableDatesText(d.availableDates.join(', '));
        if (d.tags && d.tags.length > 0) setTags(d.tags as any);
        if (d.coordinates) {
          if (d.coordinates.lat) setLat(d.coordinates.lat);
          if (d.coordinates.lng) setLng(d.coordinates.lng);
          if (d.coordinates.mapX) setMapX(d.coordinates.mapX);
          if (d.coordinates.mapY) setMapY(d.coordinates.mapY);
        }
        if (d.description) {
          setDescription(d.description);
          setDescriptionKm(d.descriptionKm || d.description);
          if (d.descriptionEn) setDescriptionEn(d.descriptionEn);
        }
        if (d.highlights && d.highlights.length > 0) {
          setHighlightsKm(d.highlightsKm || d.highlights);
          if (d.highlightsEn) setHighlightsEn(d.highlightsEn);
        }
        if (d.whoShouldJoin && d.whoShouldJoin.length > 0) {
          setWhoShouldJoinKm(d.whoShouldJoinKm || d.whoShouldJoin);
          if (d.whoShouldJoinEn) setWhoShouldJoinEn(d.whoShouldJoinEn);
        }
        if (d.whyShouldJoin && d.whyShouldJoin.length > 0) {
          setWhyShouldJoinKm(d.whyShouldJoinKm || d.whyShouldJoin);
          if (d.whyShouldJoinEn) setWhyShouldJoinEn(d.whyShouldJoinEn);
        }
        if (d.inclusions && d.inclusions.length > 0) {
          setInclusionsKm(d.inclusionsKm || d.inclusions);
          if (d.inclusionsEn) setInclusionsEn(d.inclusionsEn);
        }
        if (d.exclusions && d.exclusions.length > 0) {
          setExclusionsKm(d.exclusionsKm || d.exclusions);
          if (d.exclusionsEn) setExclusionsEn(d.exclusionsEn);
        }
        if (d.termsAndConditions && d.termsAndConditions.length > 0) {
          setTermsAndConditionsKm(d.termsAndConditionsKm || d.termsAndConditions);
          if (d.termsAndConditionsEn) setTermsAndConditionsEn(d.termsAndConditionsEn);
        }
        if (d.images && d.images.length > 0) setImages(d.images);

        if (d.tourGuide) {
          if (d.tourGuide.name) {
            setGuideName(d.tourGuide.name);
            setGuideNameKm(d.tourGuide.nameKm || d.tourGuide.name);
            if (d.tourGuide.nameEn) setGuideNameEn(d.tourGuide.nameEn);
          }
          if (d.tourGuide.title) {
            setGuideTitle(d.tourGuide.title);
            setGuideTitleKm(d.tourGuide.titleKm || d.tourGuide.title);
            if (d.tourGuide.titleEn) setGuideTitleEn(d.tourGuide.titleEn);
          }
          if (d.tourGuide.phone) setGuidePhone(d.tourGuide.phone);
          if (d.tourGuide.telegram) setGuideTelegram(d.tourGuide.telegram);
          if (d.tourGuide.languages) setGuideLanguages(d.tourGuide.languages);
          if (d.tourGuide.badgeNumber) setGuideBadge(d.tourGuide.badgeNumber);
          if (d.tourGuide.photoUrl) setGuidePhoto(d.tourGuide.photoUrl);
          if (d.tourGuide.bio) {
            setGuideBio(d.tourGuide.bio);
            setGuideBioKm(d.tourGuide.bioKm || d.tourGuide.bio);
            if (d.tourGuide.bioEn) setGuideBioEn(d.tourGuide.bioEn);
          }
          if (d.tourGuide.briefingMeetingPoint) {
            setBriefingMeetingPoint(d.tourGuide.briefingMeetingPoint);
            setBriefingMeetingPointKm(d.tourGuide.briefingMeetingPointKm || d.tourGuide.briefingMeetingPoint);
            if (d.tourGuide.briefingMeetingPointEn) setBriefingMeetingPointEn(d.tourGuide.briefingMeetingPointEn);
          }
          if (d.tourGuide.briefingTime) {
            setBriefingTime(d.tourGuide.briefingTime);
            setBriefingTimeKm(d.tourGuide.briefingTimeKm || d.tourGuide.briefingTime);
            if (d.tourGuide.briefingTimeEn) setBriefingTimeEn(d.tourGuide.briefingTimeEn);
          }
        }

        if (d.itinerary && d.itinerary.length > 0) {
          setItinerary(d.itinerary);
        }

        if (d.optionalPrograms && d.optionalPrograms.length > 0) {
          setOptionalPrograms(d.optionalPrograms);
        }

        if (d.emergencyContact) {
          if (d.emergencyContact.country) setEmergencyCountry(d.emergencyContact.country);
          if (d.emergencyContact.police) setEmergencyPolice(d.emergencyContact.police);
          if (d.emergencyContact.ambulance) setEmergencyAmbulance(d.emergencyContact.ambulance);
          if (d.emergencyContact.touristHelpline) setEmergencyHelpline(d.emergencyContact.touristHelpline);
          if (d.emergencyContact.embassySupport) setEmergencyEmbassy(d.emergencyContact.embassySupport);
        }

        setAiSuccessSummary(result.summary || '✨ បានបំពេញទិន្នន័យលើគ្រប់ Tabs ទាំងអស់ដោយស្វ័យប្រវត្តិជោគជ័យ!');
      } else {
        setAiError('មិនអាចទាញយកទិន្នន័យបានពេញលេញ។ សូមពិនិត្យអត្ថបទឡើងវិញ។');
      }
    } catch (err: any) {
      setAiError(err?.message || 'Failed to auto-parse text');
    } finally {
      setIsParsingAi(false);
    }
  };

  const SAMPLE_PRESETS = [
    {
      label: '☕ Vietnam Coffee & Franchise (Ho Chi Minh + Phu Quoc)',
      text: `ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise នៅប្រទេសវៀតណាម (ហូជីមិញ + កោះត្រល់)
តម្លៃពិសេស: $299 (តម្លៃធម្មតា $350)
រយៈពេល: ៤ ថ្ងៃ ៣ យប់ (29/10/2026 ដល់ 01/11/2026)
សណ្ឋាគារ ៤ ផ្កាយ + សំបុត្រយន្តហោះក្នុងស្រុក HCMC ទៅ Phu Quoc
គោលបំណង & សកម្មភាពសំខាន់ៗ:
- ស្វែងរកផលិតផលបោះដុំ តែ កាហ្វេ ការដុតនំ និងម៉ាស៊ីនឆុងកាហ្វេទំនើប
- ប្រេនល្បីៗសម្រាប់ទិញសិទ្ធិ Franchise មកកម្ពុជា
- ចូលរួមពិព័រណ៍អន្តរជាតិធំៗទាំង ៣: Coffee Expo, Tea-Bakery & VIETRF 2026 នៅ SECC
- កប៉ាល់ល្បឿនលឿនពីកោះត្រល់មកកំពត + រថយន្ត VIP ភ្នំពេញ
- មគ្គុទ្ទេសក៍ទេសចរណ៍ និងអ្នកសម្របសម្រួល: លោក Tim Vutha (060 815 515, Telegram @VuthaTim)
- កម្មវិធីថ្ងៃទី១: ភ្នំពេញ ទៅ ហូជីមិញ ពិនិត្យបែបបទឆ្លងដែន VIP និង Check-in សណ្ឋាគារ ៤ ផ្កាយ
- កម្មវិធីថ្ងៃទី២: ចូលរួមពិព័រណ៍ SECC និង B2B Matchmaking
- កម្មវិធីថ្ងៃទី៣: ជិះយន្តហោះទៅកោះត្រល់ ទស្សនាចម្ការម្រេច រោងចក្រទឹកត្រី និង Sunset Sanato
- កម្មវិធីថ្ងៃទី៤: ជិះកប៉ាល់មកកំពត ពិសារក្តាមថ្ម និងជិះរថយន្ត VIP មកភ្នំពេញវិញ`
    },
    {
      label: '🏢 Bangkok Retail & Bakery Expo (4D/3N)',
      text: `Thailand Business & Retail Mission: Bangkok & Pattaya B2B Expo 2026
Price: $420 USD (Early Bird $360)
Duration: 4 Days / 3 Nights
Destination: Bangkok & Pattaya, Thailand
Dates: 2026-11-15, 2026-11-16, 2026-11-17, 2026-11-18
Highlights:
- Visit Bangkok International Trade & Exhibition Centre (BITEC)
- Wholesale bakery packaging, automated food machinery & convenience store retail tech
- Exclusive 1-on-1 supplier negotiation with Thai food conglomerates
- 4-Star Novotel Sukhumvit accommodation with daily international buffet breakfast
- VIP airport fast-track escort and dedicated Khmer-speaking business guide
- Optional evening Chao Phraya luxury river cruise dinner`
    },
    {
      label: '🇯🇵 Tokyo & Osaka High-Tech Mission (6D/5N)',
      text: `Japan AI, Automation & Robotics Business Study Mission (Tokyo & Osaka)
Price: $1,450 USD (Special Corporate Delegation $1,280)
Duration: 6 Days / 5 Nights
Destination: Tokyo & Osaka, Japan
Dates: 2026-12-05, 2026-12-06, 2026-12-07, 2026-12-08, 2026-12-09, 2026-12-10
Highlights:
- Attend Tokyo Big Sight International Robotics & Smart Logistics Expo
- Visit Shinkansen bullet train component manufacturing facility in Osaka
- Bilateral roundtable with Japan-Cambodia Business Association (JCBA)
- 4-Star Shinjuku & Umeda hotel lodging with Shinkansen high-speed rail pass included
- Certified bilingual English/Japanese/Khmer interpreter throughout the tour`
    }
  ];

  // Final Form Submission
  const handleSubmit = (e?: React.FormEvent, overrideStatus?: TourPackageStatus) => {
    if (e) e.preventDefault();

    if (!title.trim() && !titleKm.trim() && !titleEn.trim()) {
      setActiveTab('basic');
      alert('Please enter a tour package title.');
      return;
    }

    const parsedDates = availableDatesText
      .split(/[\n,]+/)
      .map(d => d.trim())
      .filter(Boolean);
    const finalAvailableDates = availableDates.length > 0
      ? availableDates
      : (parsedDates.length > 0 ? parsedDates : ['2026-10-29']);

    const primaryTitle = (isEnglishMain ? (titleEn || titleKm || title) : (titleKm || title || titleEn)).trim();
    const primaryDest = (isEnglishMain ? (destinationEn || destinationKm || destination) : (destinationKm || destination || destinationEn)).trim();
    const primaryCountry = (isEnglishMain ? (countryEn || countryKm || country) : (countryKm || country || countryEn)).trim();
    const primaryCategory = (isEnglishMain ? (categoryEn || categoryKm || category) : (categoryKm || category || categoryEn)).trim();
    const primaryDesc = (isEnglishMain ? (descriptionEn || descriptionKm || description) : (descriptionKm || description || descriptionEn)).trim();

    const updatedPackage: TourPackage = {
      ...(pkg || {}),
      id: pkg?.id || `pkg_${Date.now()}`,
      status: overrideStatus || status || 'active',
      title: primaryTitle,
      titleKm: (titleKm || title || titleEn).trim(),
      titleEn: titleEn.trim() || undefined,
      destination: primaryDest,
      destinationKm: (destinationKm || destination || destinationEn).trim(),
      destinationEn: destinationEn.trim() || undefined,
      country: primaryCountry,
      countryKm: (countryKm || country || countryEn).trim(),
      countryEn: countryEn.trim() || undefined,
      category: primaryCategory,
      categoryKm: (categoryKm || category || categoryEn).trim(),
      categoryEn: categoryEn.trim() || undefined,
      isCantonFair: isCantonFair || category === 'canton_fair',
      cantonFairPhase: isCantonFair ? cantonFairPhase : undefined,
      priceUSD: Number(priceUSD) || 0,
      discountPriceUSD: discountPriceUSD ? Number(discountPriceUSD) : undefined,
      durationDays: Number(durationDays) || 1,
      durationNights: Number(durationNights) || 0,
      hotelStars: Number(hotelStars) || 4,
      flightIncluded,
      description: primaryDesc,
      descriptionKm: (descriptionKm || description || descriptionEn).trim(),
      descriptionEn: descriptionEn.trim() || undefined,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80'],
      highlights: (isEnglishMain && highlightsEn.length > 0) ? highlightsEn : (highlightsKm.length > 0 ? highlightsKm : highlightsEn),
      highlightsKm: highlightsKm.length > 0 ? highlightsKm : undefined,
      highlightsEn: highlightsEn.length > 0 ? highlightsEn : undefined,
      whoShouldJoin: (isEnglishMain && whoShouldJoinEn.length > 0) ? whoShouldJoinEn : (whoShouldJoinKm.length > 0 ? whoShouldJoinKm : whoShouldJoinEn),
      whoShouldJoinKm: whoShouldJoinKm.length > 0 ? whoShouldJoinKm : undefined,
      whoShouldJoinEn: whoShouldJoinEn.length > 0 ? whoShouldJoinEn : undefined,
      whyShouldJoin: (isEnglishMain && whyShouldJoinEn.length > 0) ? whyShouldJoinEn : (whyShouldJoinKm.length > 0 ? whyShouldJoinKm : whyShouldJoinEn),
      whyShouldJoinKm: whyShouldJoinKm.length > 0 ? whyShouldJoinKm : undefined,
      whyShouldJoinEn: whyShouldJoinEn.length > 0 ? whyShouldJoinEn : undefined,
      inclusions: (isEnglishMain && inclusionsEn.length > 0) ? inclusionsEn : (inclusionsKm.length > 0 ? inclusionsKm : inclusionsEn),
      inclusionsKm: inclusionsKm.length > 0 ? inclusionsKm : undefined,
      inclusionsEn: inclusionsEn.length > 0 ? inclusionsEn : undefined,
      exclusions: (isEnglishMain && exclusionsEn.length > 0) ? exclusionsEn : (exclusionsKm.length > 0 ? exclusionsKm : exclusionsEn),
      exclusionsKm: exclusionsKm.length > 0 ? exclusionsKm : undefined,
      exclusionsEn: exclusionsEn.length > 0 ? exclusionsEn : undefined,
      termsAndConditions: (isEnglishMain && termsAndConditionsEn.length > 0) ? termsAndConditionsEn : (termsAndConditionsKm.length > 0 ? termsAndConditionsKm : termsAndConditionsEn),
      termsAndConditionsKm: termsAndConditionsKm.length > 0 ? termsAndConditionsKm : undefined,
      termsAndConditionsEn: termsAndConditionsEn.length > 0 ? termsAndConditionsEn : undefined,
      availableDates: finalAvailableDates,
      tags: tags as any,
      rating: Number(rating) || 5.0,
      reviewCount: Number(reviewCount) || 1,
      bookedThisMonth: Number(bookedThisMonth) || 0,
      coordinates: {
        lat: Number(lat) || 10.8231,
        lng: Number(lng) || 106.6297,
        mapX: Number(mapX) || 74,
        mapY: Number(mapY) || 62
      },
      tourGuide: {
        name: (isEnglishMain ? (guideNameEn || guideNameKm || guideName) : (guideNameKm || guideName || guideNameEn)).trim(),
        nameKm: (guideNameKm || guideName || guideNameEn).trim(),
        nameEn: guideNameEn.trim() || undefined,
        title: (isEnglishMain ? (guideTitleEn || guideTitleKm || guideTitle) : (guideTitleKm || guideTitle || guideTitleEn)).trim(),
        titleKm: (guideTitleKm || guideTitle || guideTitleEn).trim(),
        titleEn: guideTitleEn.trim() || undefined,
        phone: guidePhone.trim(),
        telegram: guideTelegram.trim(),
        languages: guideLanguages,
        badgeNumber: guideBadge.trim(),
        photoUrl: guidePhoto.trim(),
        bio: (isEnglishMain ? (guideBioEn || guideBioKm || guideBio) : (guideBioKm || guideBio || guideBioEn)).trim(),
        bioKm: (guideBioKm || guideBio || guideBioEn).trim(),
        bioEn: guideBioEn.trim() || undefined,
        briefingMeetingPoint: (isEnglishMain ? (briefingMeetingPointEn || briefingMeetingPointKm || briefingMeetingPoint) : (briefingMeetingPointKm || briefingMeetingPoint || briefingMeetingPointEn)).trim(),
        briefingMeetingPointKm: (briefingMeetingPointKm || briefingMeetingPoint || briefingMeetingPointEn).trim(),
        briefingMeetingPointEn: briefingMeetingPointEn.trim() || undefined,
        briefingTime: (briefingTimeKm || briefingTime || briefingTimeEn).trim(),
        briefingTimeKm: (briefingTimeKm || briefingTime || briefingTimeEn).trim(),
        briefingTimeEn: briefingTimeEn.trim() || undefined,
        emergencyContact: guidePhone.trim()
      },
      emergencyContact: {
        country: emergencyCountry.trim(),
        police: emergencyPolice.trim(),
        ambulance: emergencyAmbulance.trim(),
        touristHelpline: emergencyHelpline.trim(),
        embassySupport: emergencyEmbassy.trim()
      },
      itinerary: (itinerary || []).map((step, idx) => ({
        ...step,
        day: idx + 1,
        title: (isEnglishMain ? (step.titleEn || step.title || step.titleKm || `Day ${idx + 1}`) : (step.titleKm || step.title || step.titleEn || `Day ${idx + 1}`)).trim(),
        titleKm: (step.titleKm || step.title || step.titleEn || `Day ${idx + 1}`).trim(),
        titleEn: step.titleEn?.trim() || undefined,
        description: (isEnglishMain ? (step.descriptionEn || step.description || step.descriptionKm || '') : (step.descriptionKm || step.description || step.descriptionEn || '')).trim(),
        descriptionKm: (step.descriptionKm || step.description || step.descriptionEn || '').trim(),
        descriptionEn: step.descriptionEn?.trim() || undefined,
        hotelName: (isEnglishMain ? (step.hotelNameEn || step.hotelName || step.hotelNameKm) : (step.hotelNameKm || step.hotelName || step.hotelNameEn))?.trim() || undefined,
        hotelNameKm: (step.hotelNameKm || step.hotelName || step.hotelNameEn)?.trim() || undefined,
        hotelNameEn: step.hotelNameEn?.trim() || undefined,
        assemblyPoint: (isEnglishMain ? (step.assemblyPointEn || step.assemblyPoint || step.assemblyPointKm) : (step.assemblyPointKm || step.assemblyPoint || step.assemblyPointEn))?.trim() || undefined,
        assemblyPointKm: (step.assemblyPointKm || step.assemblyPoint || step.assemblyPointEn)?.trim() || undefined,
        assemblyPointEn: step.assemblyPointEn?.trim() || undefined,
        mealsIncluded: step.mealsIncluded || [],
        mealsIncludedKm: (step.mealsIncludedKm && step.mealsIncludedKm.length > 0) ? step.mealsIncludedKm : step.mealsIncluded,
        mealsIncludedEn: (step.mealsIncludedEn && step.mealsIncludedEn.length > 0) ? step.mealsIncludedEn : undefined,
        dayHighlights: step.dayHighlights || [],
        dayHighlightsKm: (step.dayHighlightsKm && step.dayHighlightsKm.length > 0) ? step.dayHighlightsKm : step.dayHighlights,
        dayHighlightsEn: (step.dayHighlightsEn && step.dayHighlightsEn.length > 0) ? step.dayHighlightsEn : undefined,
        guideAgenda: (step.guideAgenda || []).map(slot => ({
          ...slot,
          activity: (isEnglishMain ? (slot.activityEn || slot.activity || slot.activityKm || '') : (slot.activityKm || slot.activity || slot.activityEn || '')).trim(),
          activityKm: (slot.activityKm || slot.activity || slot.activityEn || '').trim(),
          activityEn: slot.activityEn?.trim() || undefined,
          location: (isEnglishMain ? (slot.locationEn || slot.location || slot.locationKm) : (slot.locationKm || slot.location || slot.locationEn))?.trim() || undefined,
          locationKm: (slot.locationKm || slot.location || slot.locationEn)?.trim() || undefined,
          locationEn: slot.locationEn?.trim() || undefined,
          notes: (isEnglishMain ? (slot.notesEn || slot.notes || slot.notesKm) : (slot.notesKm || slot.notes || slot.notesEn))?.trim() || undefined,
          notesKm: (slot.notesKm || slot.notes || slot.notesEn)?.trim() || undefined,
          notesEn: slot.notesEn?.trim() || undefined
        }))
      })),
      optionalPrograms: (optionalPrograms || []).map(prog => ({
        ...prog,
        title: (isEnglishMain ? (prog.titleEn || prog.title || prog.titleKm || '') : (prog.titleKm || prog.title || prog.titleEn || '')).trim(),
        titleKm: (prog.titleKm || prog.title || prog.titleEn || '').trim(),
        titleEn: prog.titleEn?.trim() || undefined,
        description: (isEnglishMain ? (prog.descriptionEn || prog.description || prog.descriptionKm || '') : (prog.descriptionKm || prog.description || prog.descriptionEn || '')).trim(),
        descriptionKm: (prog.descriptionKm || prog.description || prog.descriptionEn || '').trim(),
        descriptionEn: prog.descriptionEn?.trim() || undefined,
        recommendedAudience: (isEnglishMain ? (prog.recommendedAudienceEn || prog.recommendedAudience || prog.recommendedAudienceKm) : (prog.recommendedAudienceKm || prog.recommendedAudience || prog.recommendedAudienceEn))?.trim() || undefined,
        recommendedAudienceKm: (prog.recommendedAudienceKm || prog.recommendedAudience || prog.recommendedAudienceEn)?.trim() || undefined,
        recommendedAudienceEn: prog.recommendedAudienceEn?.trim() || undefined,
        meetingPoint: (isEnglishMain ? (prog.meetingPointEn || prog.meetingPoint || prog.meetingPointKm) : (prog.meetingPointKm || prog.meetingPoint || prog.meetingPointEn))?.trim() || undefined,
        meetingPointKm: (prog.meetingPointKm || prog.meetingPoint || prog.meetingPointEn)?.trim() || undefined,
        meetingPointEn: prog.meetingPointEn?.trim() || undefined,
        highlights: (isEnglishMain && prog.highlightsEn && prog.highlightsEn.length > 0) ? prog.highlightsEn : (prog.highlightsKm && prog.highlightsKm.length > 0 ? prog.highlightsKm : (prog.highlights || [])),
        highlightsKm: (prog.highlightsKm && prog.highlightsKm.length > 0) ? prog.highlightsKm : (prog.highlights || []),
        highlightsEn: (prog.highlightsEn && prog.highlightsEn.length > 0) ? prog.highlightsEn : undefined,
        includedMeals: (isEnglishMain && prog.includedMealsEn && prog.includedMealsEn.length > 0) ? prog.includedMealsEn : (prog.includedMealsKm && prog.includedMealsKm.length > 0 ? prog.includedMealsKm : (prog.includedMeals || [])),
        includedMealsKm: (prog.includedMealsKm && prog.includedMealsKm.length > 0) ? prog.includedMealsKm : (prog.includedMeals || []),
        includedMealsEn: (prog.includedMealsEn && prog.includedMealsEn.length > 0) ? prog.includedMealsEn : undefined
      }))
    };

    onSave(updatedPackage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {isEditing ? 'Edit Tour Package & Master Information' : 'Create & Publish New Tour Package'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> AI Copilot Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Update every commercial, itinerary, guide, and add-on detail, or use AI to parse raw text instantly.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiImporterOpen(!isAiImporterOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isAiImporterOpen
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/20'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isAiImporterOpen ? 'Hide AI Auto-Fill' : '✨ AI Auto-Input / Paste Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI AUTO-FILL / TEXT IMPORTER SECTION */}
        {isAiImporterOpen && (
          <div className="px-6 py-4 bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border-b border-indigo-100 dark:border-indigo-900/60 shrink-0 animate-in slide-in-from-top duration-200">
            <div className="flex items-start justify-between gap-4 mb-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  AI Auto-Input: Paste Raw Text to Auto-Fill Tour Package
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Paste any Telegram message, Facebook announcement, brochure, flyer, or WhatsApp itinerary text. AI will analyze and populate all form tabs instantly.
                </p>
              </div>

              {/* Sample Preset Buttons */}
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Try Samples:</span>
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRawTextToParse(preset.text);
                      handleAutoInputFromText(preset.text);
                    }}
                    disabled={isParsingAi}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {preset.label.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea for pasting */}
            <div className="space-y-2.5">
              <div className="relative">
                <textarea
                  rows={3}
                  value={rawTextToParse}
                  onChange={(e) => setRawTextToParse(e.target.value)}
                  placeholder="Paste raw tour information here (e.g. ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise នៅវៀតណាម, តម្លៃ $299, រយៈពេល 4 ថ្ងៃ 3 យប់, កាលវិភាគថ្ងៃទី១-៤, សណ្ឋាគារ ៤ ផ្កាយ, មគ្គុទ្ទេសក៍ លោក Tim Vutha...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white/95 dark:bg-slate-900/95 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner font-mono text-[11px] leading-relaxed"
                />
              </div>

              {/* Mobile sample buttons */}
              <div className="flex lg:hidden flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Presets:</span>
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRawTextToParse(preset.text);
                      handleAutoInputFromText(preset.text);
                    }}
                    disabled={isParsingAi}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {preset.label.split(' ')[1] || 'Sample'}
                  </button>
                ))}
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutoInputFromText()}
                    disabled={isParsingAi || !rawTextToParse.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isParsingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Text with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>✨ Analyze & Auto-Fill All Form Tabs</span>
                      </>
                    )}
                  </button>

                  {rawTextToParse && (
                    <button
                      type="button"
                      onClick={() => {
                        setRawTextToParse('');
                        setAiSuccessSummary(null);
                        setAiError(null);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Clear Text
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Supports Khmer (ខ្មែរ), English, and multilingual text formats</span>
                </div>
              </div>

              {/* Success / Error Banners */}
              {aiSuccessSummary && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      {aiSuccessSummary}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      All pricing, day-by-day itinerary schedules, hourly guide agendas, highlights, and contact information have been populated into the tabs below. You can review and fine-tune each tab before saving.
                    </p>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <p className="text-xs font-medium text-rose-800 dark:text-rose-200">
                    {aiError}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation & Master Translation Quick Bar */}
        <div className="border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Bilingual Translation Copilot:</span>
              </span>
              <span className="text-[11px] text-slate-500">Manual input supported on all fields, or translate whole package at once</span>
            </div>

            <div className="flex items-center gap-2">
              {isEnglishMain ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleTranslateEntirePackage('en', 'km')}
                    disabled={isTranslatingAll}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Auto-translate all English fields to Khmer across all tabs"
                  >
                    {isTranslatingAll && translatingDirection === 'en-km' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Auto-Translating EN ➔ KM...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>✨ AI Auto-Translate All: 🇺🇸 EN ➔ 🇰🇭 KM</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTranslateEntirePackage('km', 'en')}
                    disabled={isTranslatingAll}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Translate all Khmer text to English across all tabs"
                  >
                    {isTranslatingAll && translatingDirection === 'km-en' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Translating KM ➔ EN...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>✨ AI Translate KM ➔ EN</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleTranslateEntirePackage('km', 'en')}
                    disabled={isTranslatingAll}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Translate all Khmer text to English across all tabs"
                  >
                    {isTranslatingAll && translatingDirection === 'km-en' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Auto-Translating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>✨ AI Translate All: 🇰🇭 ➔ 🇺🇸 English</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTranslateEntirePackage('en', 'km')}
                    disabled={isTranslatingAll}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Translate all English text to Khmer across all tabs"
                  >
                    {isTranslatingAll && translatingDirection === 'en-km' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>កំពុងបកប្រែ...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>✨ AI បកប្រែទាំងអស់: 🇺🇸 ➔ 🇰🇭 ភាសាខ្មែរ</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-6 pt-1 overflow-x-auto">
            {[
              { id: 'basic', label: '1. Core & Pricing', icon: DollarSign },
              { id: 'media', label: '2. Media & Inclusions', icon: ImageIcon },
              { id: 'guide', label: '3. Tour Director & Escort', icon: User },
              { id: 'itinerary', label: '4. Itinerary & Hourly Agenda', icon: Clock },
              { id: 'optional', label: '5. Optional Programs', icon: Sparkles },
              { id: 'terms', label: '6. Terms & Conditions', icon: FileText },
              { id: 'emergency', label: '7. Emergency & Location', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BASIC & PRICING */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Package Lifecycle Status Selector */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Tour Package Visibility & Publication Status
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Control whether this package is live for traveler bookings, saved as an internal draft, or archived.
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono self-start sm:self-auto flex items-center gap-1.5 ${
                    status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : status === 'draft'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : status === 'archived'
                      ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      status === 'active' ? 'bg-emerald-500 animate-pulse' : status === 'draft' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    <span>Current: {status === 'active' ? '🟢 Active (Live)' : status === 'draft' ? '🟡 Draft (ព្រាង)' : status === 'archived' ? '⚪ Archived' : '🔴 Deleted'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Active Option */}
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      status === 'active'
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      status === 'active' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Active (ផ្សាយផ្ទាល់)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Published live on public catalog, landing pages, and available for booking.
                      </p>
                    </div>
                  </button>

                  {/* Draft Option */}
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      status === 'draft'
                        ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      status === 'draft' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Draft (ព្រាងទុក)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Internal work in progress. Hidden from travelers until you choose to publish.
                      </p>
                    </div>
                  </button>

                  {/* Archived Option */}
                  <button
                    type="button"
                    onClick={() => setStatus('archived')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      status === 'archived'
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-500 ring-2 ring-slate-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      status === 'archived' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Archived (បានផ្អាក)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Temporarily delisted from catalog. Kept intact for historical pricing & records.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Titles: Conditional Order Based on Platform Language */}
                {isEnglishMain ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Tour Title (English / Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={titleKm || title}
                          enText={titleEn}
                          preferredDirection="en_to_km"
                          fieldHint="Tour Package Title"
                          onTranslateToKm={(trans) => {
                            setTitleKm(trans);
                            setTitle(trans);
                          }}
                          onTranslateToEn={(trans) => setTitleEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                        placeholder="e.g. Vietnam Coffee, Tea, Bakery & Franchise B2B Mission"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Tour Title (ខ្មែរ / Khmer Secondary)
                        </label>
                        <FieldAiTranslator
                          kmText={titleKm || title}
                          enText={titleEn}
                          preferredDirection="km_to_en"
                          fieldHint="Tour Package Title"
                          onTranslateToKm={(trans) => {
                            setTitleKm(trans);
                            setTitle(trans);
                          }}
                          onTranslateToEn={(trans) => setTitleEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        value={titleKm || title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setTitleKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                        placeholder="e.g. ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Tour Title (ខ្មែរ / Khmer Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={titleKm || title}
                          enText={titleEn}
                          preferredDirection="km_to_en"
                          fieldHint="Tour Package Title"
                          onTranslateToKm={(trans) => {
                            setTitleKm(trans);
                            setTitle(trans);
                          }}
                          onTranslateToEn={(trans) => setTitleEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={titleKm || title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setTitleKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                        placeholder="e.g. ដំណើរទស្សនៈកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Tour Title (English Title)
                        </label>
                        <FieldAiTranslator
                          kmText={titleKm || title}
                          enText={titleEn}
                          preferredDirection="en_to_km"
                          fieldHint="Tour Package Title"
                          onTranslateToKm={(trans) => {
                            setTitleKm(trans);
                            setTitle(trans);
                          }}
                          onTranslateToEn={(trans) => setTitleEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                        placeholder="e.g. Vietnam Coffee, Tea, Bakery & Franchise B2B Mission"
                      />
                    </div>
                  </>
                )}

                {/* Destinations: Conditional Order Based on Platform Language */}
                {isEnglishMain ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Destination City / Province (English / Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={destinationKm || destination}
                          enText={destinationEn}
                          preferredDirection="en_to_km"
                          fieldHint="Destination City or Province"
                          onTranslateToKm={(trans) => {
                            setDestinationKm(trans);
                            setDestination(trans);
                          }}
                          onTranslateToEn={(trans) => setDestinationEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={destinationEn}
                        onChange={(e) => setDestinationEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. Ho Chi Minh City & Phu Quoc Island"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Destination (ខ្មែរ / Khmer Secondary)
                        </label>
                        <FieldAiTranslator
                          kmText={destinationKm || destination}
                          enText={destinationEn}
                          preferredDirection="km_to_en"
                          fieldHint="Destination City or Province"
                          onTranslateToKm={(trans) => {
                            setDestinationKm(trans);
                            setDestination(trans);
                          }}
                          onTranslateToEn={(trans) => setDestinationEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        value={destinationKm || destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setDestinationKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. ហូជីមិញ + កោះត្រល់"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Destination City / Province (ខ្មែរ / Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={destinationKm || destination}
                          enText={destinationEn}
                          preferredDirection="km_to_en"
                          fieldHint="Destination City or Province"
                          onTranslateToKm={(trans) => {
                            setDestinationKm(trans);
                            setDestination(trans);
                          }}
                          onTranslateToEn={(trans) => setDestinationEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={destinationKm || destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setDestinationKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. ហូជីមិញ + កោះត្រល់"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Destination (English)
                        </label>
                        <FieldAiTranslator
                          kmText={destinationKm || destination}
                          enText={destinationEn}
                          preferredDirection="en_to_km"
                          fieldHint="Destination City or Province"
                          onTranslateToKm={(trans) => {
                            setDestinationKm(trans);
                            setDestination(trans);
                          }}
                          onTranslateToEn={(trans) => setDestinationEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        value={destinationEn}
                        onChange={(e) => setDestinationEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. Ho Chi Minh City & Phu Quoc Island"
                      />
                    </div>
                  </>
                )}

                {/* Country: Conditional Order Based on Platform Language */}
                {isEnglishMain ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Country (English / Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={countryKm || country}
                          enText={countryEn}
                          preferredDirection="en_to_km"
                          fieldHint="Country Name"
                          onTranslateToKm={(trans) => {
                            setCountryKm(trans);
                            setCountry(trans);
                          }}
                          onTranslateToEn={(trans) => setCountryEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={countryEn}
                        onChange={(e) => setCountryEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. Vietnam, Thailand, China, Japan"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Country (ប្រទេស / Khmer Secondary)
                        </label>
                        <FieldAiTranslator
                          kmText={countryKm || country}
                          enText={countryEn}
                          preferredDirection="km_to_en"
                          fieldHint="Country Name"
                          onTranslateToKm={(trans) => {
                            setCountryKm(trans);
                            setCountry(trans);
                          }}
                          onTranslateToEn={(trans) => setCountryEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        value={countryKm || country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          setCountryKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. វៀតណាម, ប្រទេសថៃ, ចិន"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Country (ប្រទេស / Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={countryKm || country}
                          enText={countryEn}
                          preferredDirection="km_to_en"
                          fieldHint="Country Name"
                          onTranslateToKm={(trans) => {
                            setCountryKm(trans);
                            setCountry(trans);
                          }}
                          onTranslateToEn={(trans) => setCountryEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={countryKm || country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          setCountryKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. Vietnam, វៀតណាម, ប្រទេសថៃ"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Country (English)
                        </label>
                        <FieldAiTranslator
                          kmText={countryKm || country}
                          enText={countryEn}
                          preferredDirection="en_to_km"
                          fieldHint="Country Name"
                          onTranslateToKm={(trans) => {
                            setCountryKm(trans);
                            setCountry(trans);
                          }}
                          onTranslateToEn={(trans) => setCountryEn(trans)}
                        />
                      </div>
                      <input
                        type="text"
                        value={countryEn}
                        onChange={(e) => setCountryEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                        placeholder="e.g. Vietnam, Thailand, China, Japan"
                      />
                    </div>
                  </>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryManagerOpen(true)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3 h-3" />
                      <span>+ Manage Categories</span>
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__manage_new__') {
                        setIsCategoryManagerOpen(true);
                        return;
                      }
                      setCategory(val);
                      const selectedCat = packageCategories.find(c => c.id === val);
                      if (selectedCat) {
                        if (selectedCat.nameKm) setCategoryKm(selectedCat.nameKm);
                        if (selectedCat.nameEn) setCategoryEn(selectedCat.nameEn);
                      }
                      if (val === 'canton_fair') {
                        setIsCantonFair(true);
                        if (!cantonFairPhase) setCantonFairPhase('Phase 1');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white cursor-pointer"
                  >
                    {packageCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name} {cat.nameKm ? `(${cat.nameKm})` : ''}
                      </option>
                    ))}
                    {/* Fallback for legacy custom category */}
                    {category && !packageCategories.some(c => c.id === category) && (
                      <option value={category}>
                        🏷️ {category} (Custom Legacy)
                      </option>
                    )}
                    <option value="__manage_new__" className="text-indigo-600 font-bold">
                      ➕ Create / Manage Categories...
                    </option>
                  </select>
                </div>

                {/* Canton Fair Special Configuration */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🇨🇳</span>
                      <div>
                        <span className="text-xs font-bold text-red-950 dark:text-red-200 block">
                          Canton Fair 2026 Phase Assignment
                        </span>
                        <span className="text-[11px] text-red-700/80 dark:text-red-300/80">
                          Enable Phase 1, Phase 2, or Phase 3 specific filters and Pazhou Complex VIP badge flow.
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCantonFair}
                        onChange={(e) => {
                          setIsCantonFair(e.target.checked);
                          if (e.target.checked && !cantonFairPhase) setCantonFairPhase('Phase 1');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  {isCantonFair && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-red-200 dark:border-red-900/30">
                      {[
                        { val: 'Phase 1' as const, title: 'Phase 1', desc: 'Electronics, Machinery, Hardware & Clean Energy' },
                        { val: 'Phase 2' as const, title: 'Phase 2', desc: 'Houseware, Home Decor, Ceramics, Gifts & Furniture' },
                        { val: 'Phase 3' as const, title: 'Phase 3', desc: 'Textiles, Garments, Shoes, Medical & Food Sourcing' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setCantonFairPhase(item.val)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                            cantonFairPhase === item.val
                              ? 'bg-red-600 text-white border-red-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-red-300'
                          }`}
                        >
                          <div className="text-xs font-black flex items-center justify-between">
                            <span>{item.title}</span>
                            {cantonFairPhase === item.val && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div className={`text-[10px] mt-1 line-clamp-2 ${cantonFairPhase === item.val ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Standard Price ($ USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={priceUSD}
                      onChange={(e) => setPriceUSD(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Early Bird Price ($ USD)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discountPriceUSD || ''}
                      onChange={(e) => setDiscountPriceUSD(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g. 299"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                {/* Duration & Accommodation */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nights
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={durationNights}
                      onChange={(e) => setDurationNights(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hotel Stars
                    </label>
                    <select
                      value={hotelStars}
                      onChange={(e) => setHotelStars(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer"
                    >
                      <option value={3}>3 ផ្កាយ (3-Star)</option>
                      <option value={4}>4 ផ្កាយ (4-Star)</option>
                      <option value={5}>5 ផ្កាយ (5-Star Luxury)</option>
                    </select>
                  </div>
                </div>

                {/* Flight Option */}
                <div className="flex items-center gap-4 pt-2 md:col-span-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={flightIncluded}
                      onChange={(e) => setFlightIncluded(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                    <span>Includes Flight / Domestic Air Tickets</span>
                  </label>
                </div>

                {/* Departure Dates Interactive Manager */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Available Departure Dates ({availableDates.length} Dates)</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Pick date or type ISO format</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newDateInput}
                      onChange={(e) => setNewDateInput(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddDepartureDate}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                    >
                      + Add Date
                    </button>
                  </div>

                  {/* Date Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableDates.map((dateStr) => (
                      <span
                        key={dateStr}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{dateStr}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDepartureDate(dateStr)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer text-xs"
                          title="Remove Date"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags Interactive Manager */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Package Tags & Badges
                  </label>
                  
                  <div className="flex flex-wrap gap-2">
                    {['trending', 'popular', 'luxury', 'adventure', 'cultural', 'eco'].map((presetTag) => {
                      const isSelected = tags.includes(presetTag);
                      return (
                        <button
                          key={presetTag}
                          type="button"
                          onClick={() => handleToggleTag(presetTag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          #{presetTag} {isSelected ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
                      placeholder="Add custom tag (e.g. b2b-expo, trade-mission)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                {/* Ratings & Performance Stats */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Customer Rating (0-5.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Verified Review Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={reviewCount}
                      onChange={(e) => setReviewCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Booked This Month
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bookedThisMonth}
                      onChange={(e) => setBookedThisMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & INCLUSIONS */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEnglishMain ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Full Package Overview (English / Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={descriptionKm || description}
                          enText={descriptionEn}
                          preferredDirection="en_to_km"
                          fieldHint="Tour Package Full Description and Overview"
                          onTranslateToKm={(trans) => {
                            setDescriptionKm(trans);
                            setDescription(trans);
                          }}
                          onTranslateToEn={(trans) => setDescriptionEn(trans)}
                        />
                      </div>
                      <textarea
                        rows={4}
                        required
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
                        placeholder="Describe the trade mission in English..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Full Package Overview (ខ្មែរ / Khmer Secondary)
                        </label>
                        <FieldAiTranslator
                          kmText={descriptionKm || description}
                          enText={descriptionEn}
                          preferredDirection="km_to_en"
                          fieldHint="Tour Package Full Description and Overview"
                          onTranslateToKm={(trans) => {
                            setDescriptionKm(trans);
                            setDescription(trans);
                          }}
                          onTranslateToEn={(trans) => setDescriptionEn(trans)}
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={descriptionKm || description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setDescriptionKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
                        placeholder="Describe the trade mission in Khmer..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Full Package Overview (ខ្មែរ / Primary) *
                        </label>
                        <FieldAiTranslator
                          kmText={descriptionKm || description}
                          enText={descriptionEn}
                          preferredDirection="km_to_en"
                          fieldHint="Tour Package Full Description and Overview"
                          onTranslateToKm={(trans) => {
                            setDescriptionKm(trans);
                            setDescription(trans);
                          }}
                          onTranslateToEn={(trans) => setDescriptionEn(trans)}
                        />
                      </div>
                      <textarea
                        rows={4}
                        required
                        value={descriptionKm || description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setDescriptionKm(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
                        placeholder="Describe the trade mission in Khmer..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Full Package Overview (English Description)
                        </label>
                        <FieldAiTranslator
                          kmText={descriptionKm || description}
                          enText={descriptionEn}
                          preferredDirection="en_to_km"
                          fieldHint="Tour Package Full Description and Overview"
                          onTranslateToKm={(trans) => {
                            setDescriptionKm(trans);
                            setDescription(trans);
                          }}
                          onTranslateToEn={(trans) => setDescriptionEn(trans)}
                        />
                      </div>
                      <textarea
                        rows={4}
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
                        placeholder="Describe the trade mission in English..."
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Image Gallery & Upload Zone */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Tour Package Image Gallery ({images.length} Images)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Upload photos directly from your device or paste image URLs. The first image will be used as the primary hero cover.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/40">
                    JPG, PNG, WEBP, AVIF
                  </span>
                </div>

                {/* Hidden File Input for Image Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  onChange={(e) => handleImageFilesUpload(e.target.files)}
                  className="hidden"
                />

                {/* Drag and Drop / Click to Upload Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleImageFilesUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                    isDraggingOver
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-indigo-400'
                  }`}
                >
                  {isUploadingImages ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-600 dark:text-indigo-400 py-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-bold">Compressing & Uploading Photos...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                          <span>Click to browse images</span>
                          <span className="text-slate-400 font-normal">or drag & drop files here</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Supports high-resolution camera photos (automatically optimized for fast loading)
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Paste URL Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      placeholder="Or paste direct image URL (Unsplash, CDN, or Cloud Storage link)..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add URL</span>
                  </button>
                </div>

                {/* Image Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {images.map((imgUrl, i) => (
                    <div
                      key={i}
                      className={`relative group rounded-2xl overflow-hidden border transition-all aspect-[16/10] bg-slate-100 dark:bg-slate-800 shadow-xs ${
                        i === 0
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Overlay Badges & Actions */}
                      <div className="absolute top-2 inset-x-2 flex items-center justify-between">
                        {i === 0 ? (
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[9px] font-bold shadow-md flex items-center gap-1">
                            ⭐ Primary Hero
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetHeroImage(i)}
                            className="px-2 py-0.5 rounded-lg bg-black/60 hover:bg-indigo-600 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs shadow-md"
                            title="Make this the main cover image"
                          >
                            Set as Hero
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bilingual Highlights */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <BilingualListEditor
                  title="Mission Key Highlights & Selling Points"
                  icon={<Sparkles className="w-4 h-4 text-indigo-500" />}
                  hint="Prominently featured value propositions on brochure headers and app cards."
                  kmItems={highlightsKm}
                  enItems={highlightsEn}
                  onKmChange={setHighlightsKm}
                  onEnChange={setHighlightsEn}
                  badgeColor="indigo"
                  fieldCategoryHint="Tour Package Highlights and Value Propositions"
                />
              </div>

              {/* Bilingual Target Audiences & Benefits */}
              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* 1. Who Should Join */}
                <BilingualListEditor
                  title="Who Should Join? / អ្នកណាខ្លះគួរចូលរួម?"
                  icon={<Users className="w-4 h-4 text-blue-500" />}
                  hint="Define target business segments, delegate roles, and investor profiles."
                  kmItems={whoShouldJoinKm}
                  enItems={whoShouldJoinEn}
                  onKmChange={setWhoShouldJoinKm}
                  onEnChange={setWhoShouldJoinEn}
                  badgeColor="blue"
                  fieldCategoryHint="Target Audience and Delegate Profiles"
                />

                {/* 2. Why You Should Join */}
                <BilingualListEditor
                  title="Why You Should Join / ហេតុអ្វីអ្នកគួរចូលរួម?"
                  icon={<Target className="w-4 h-4 text-amber-500" />}
                  hint="Key delegate ROI, direct factory rates, B2B matchmaking, and high-value access."
                  kmItems={whyShouldJoinKm}
                  enItems={whyShouldJoinEn}
                  onKmChange={setWhyShouldJoinKm}
                  onEnChange={setWhyShouldJoinEn}
                  badgeColor="amber"
                  fieldCategoryHint="Business Value, ROI, and Unique Benefits"
                />
              </div>

              {/* Bilingual Inclusions & Exclusions */}
              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Inclusions */}
                <BilingualListEditor
                  title="Included in Package / សេវាកម្មរាប់បញ្ចូល"
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  hint="Hotel accommodations, private transport, expo badges, meals, translators, etc."
                  kmItems={inclusionsKm}
                  enItems={inclusionsEn}
                  onKmChange={setInclusionsKm}
                  onEnChange={setInclusionsEn}
                  badgeColor="emerald"
                  fieldCategoryHint="Tour Package Included Services and Amenities"
                />

                {/* Exclusions */}
                <BilingualListEditor
                  title="Exclusions (Not Included) / មិនរាប់បញ្ចូល"
                  icon={<AlertCircle className="w-4 h-4 text-rose-500" />}
                  hint="Visa fees, international flights, personal mini-bar, insurance upgrades, etc."
                  kmItems={exclusionsKm}
                  enItems={exclusionsEn}
                  onKmChange={setExclusionsKm}
                  onEnChange={setExclusionsEn}
                  badgeColor="rose"
                  fieldCategoryHint="Tour Package Exclusions and Out-of-pocket Expenses"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TOUR DIRECTOR & GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Coordinator Name (Bilingual) */}
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Tour Director / Lead Coordinator Name *
                  </label>
                  <FieldAiTranslator
                    kmText={guideNameKm || guideName}
                    enText={guideNameEn}
                    preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                    fieldHint="Tour Director or Guide Full Name"
                    onTranslateToKm={(trans) => {
                      setGuideName(trans);
                      setGuideNameKm(trans);
                    }}
                    onTranslateToEn={(trans) => setGuideNameEn(trans)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isEnglishMain ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Name (Primary) *
                        </label>
                        <input
                          type="text"
                          required
                          value={guideNameEn}
                          onChange={(e) => setGuideNameEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          placeholder="e.g. Mr. Tim Vutha"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Name (Secondary)
                        </label>
                        <input
                          type="text"
                          value={guideNameKm || guideName}
                          onChange={(e) => {
                            setGuideName(e.target.value);
                            setGuideNameKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          placeholder="e.g. លោក ទឹម វុទ្ធា"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Name (Primary) *
                        </label>
                        <input
                          type="text"
                          required
                          value={guideNameKm || guideName}
                          onChange={(e) => {
                            setGuideName(e.target.value);
                            setGuideNameKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          placeholder="e.g. លោក ទឹម វុទ្ធា"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Name
                        </label>
                        <input
                          type="text"
                          value={guideNameEn}
                          onChange={(e) => setGuideNameEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                          placeholder="e.g. Mr. Tim Vutha"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Official Title / Designation (Bilingual) */}
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Official Title / Designation *
                  </label>
                  <FieldAiTranslator
                    kmText={guideTitleKm || guideTitle}
                    enText={guideTitleEn}
                    preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                    fieldHint="Tour Director or Guide Professional Title"
                    onTranslateToKm={(trans) => {
                      setGuideTitle(trans);
                      setGuideTitleKm(trans);
                    }}
                    onTranslateToEn={(trans) => setGuideTitleEn(trans)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isEnglishMain ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Title (Primary) *
                        </label>
                        <input
                          type="text"
                          required
                          value={guideTitleEn}
                          onChange={(e) => setGuideTitleEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. Lead Trade Mission Coordinator & Tour Director"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Title (Secondary)
                        </label>
                        <input
                          type="text"
                          value={guideTitleKm || guideTitle}
                          onChange={(e) => {
                            setGuideTitle(e.target.value);
                            setGuideTitleKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. ប្រធានសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្ម & Tour Director"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Title (Primary) *
                        </label>
                        <input
                          type="text"
                          required
                          value={guideTitleKm || guideTitle}
                          onChange={(e) => {
                            setGuideTitle(e.target.value);
                            setGuideTitleKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. ប្រធានសម្របសម្រួលបេសកកម្មពាណិជ្ជកម្ម & Tour Director"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Title
                        </label>
                        <input
                          type="text"
                          value={guideTitleEn}
                          onChange={(e) => setGuideTitleEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. Lead Trade Mission Coordinator & Tour Director"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact, Telegram, Badge & Photo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Direct Phone / Hotline *
                  </label>
                  <input
                    type="text"
                    required
                    value={guidePhone}
                    onChange={(e) => setGuidePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    placeholder="e.g. 060 815 515"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Direct Telegram Username
                  </label>
                  <input
                    type="text"
                    value={guideTelegram}
                    onChange={(e) => setGuideTelegram(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-sky-600 dark:text-sky-400 font-bold"
                    placeholder="e.g. @VuthaTim"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Badge Number
                  </label>
                  <input
                    type="text"
                    value={guideBadge}
                    onChange={(e) => setGuideBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    placeholder="e.g. KHB-TM-2026-01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Coordinator Portrait / Photo
                  </label>
                  <input
                    type="file"
                    ref={guidePhotoInputRef}
                    accept="image/*"
                    onChange={(e) => handleGuidePhotoUpload(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex gap-2 items-center">
                    {guidePhoto && (
                      <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0">
                        <img src={guidePhoto} alt="Guide" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      type="url"
                      value={guidePhoto || ''}
                      onChange={(e) => setGuidePhoto(e.target.value)}
                      placeholder="Paste photo URL..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => guidePhotoInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800/40 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      title="Upload Photo File"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Briefing Meeting Point (Bilingual) */}
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Departure Assembly & Briefing Meeting Point
                  </label>
                  <FieldAiTranslator
                    kmText={briefingMeetingPointKm || briefingMeetingPoint}
                    enText={briefingMeetingPointEn}
                    preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                    fieldHint="Tour Departure Gathering Location or Meeting Point"
                    onTranslateToKm={(trans) => {
                      setBriefingMeetingPoint(trans);
                      setBriefingMeetingPointKm(trans);
                    }}
                    onTranslateToEn={(trans) => setBriefingMeetingPointEn(trans)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isEnglishMain ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Location (Primary)
                        </label>
                        <input
                          type="text"
                          value={briefingMeetingPointEn || ''}
                          onChange={(e) => setBriefingMeetingPointEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. Phnom Penh KHB Head Office Departure Bay"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Location (Secondary)
                        </label>
                        <input
                          type="text"
                          value={briefingMeetingPointKm || briefingMeetingPoint || ''}
                          onChange={(e) => {
                            setBriefingMeetingPoint(e.target.value);
                            setBriefingMeetingPointKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. រាជធានីភ្នំពេញ (ចំណុចប្រមូលផ្តុំ KHB Head Office)"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Location (Primary)
                        </label>
                        <input
                          type="text"
                          value={briefingMeetingPointKm || briefingMeetingPoint || ''}
                          onChange={(e) => {
                            setBriefingMeetingPoint(e.target.value);
                            setBriefingMeetingPointKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. រាជធានីភ្នំពេញ (ចំណុចប្រមូលផ្តុំ KHB Head Office)"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Location
                        </label>
                        <input
                          type="text"
                          value={briefingMeetingPointEn || ''}
                          onChange={(e) => setBriefingMeetingPointEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. Phnom Penh KHB Head Office Departure Bay"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Assembly Time & Briefing Schedule */}
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assembly Time & Briefing Schedule
                  </label>
                </div>
                <input
                  type="text"
                  value={briefingTime || ''}
                  onChange={(e) => setBriefingTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  placeholder="e.g. 06:00 AM (ថ្ងៃទី 29/10/2026)"
                />
              </div>

              {/* Coordinator Bio & Credentials (Bilingual) */}
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Coordinator Bio & Credentials
                  </label>
                  <FieldAiTranslator
                    kmText={guideBioKm || guideBio}
                    enText={guideBioEn}
                    preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                    fieldHint="Tour Director Professional Bio and Qualifications"
                    onTranslateToKm={(trans) => {
                      setGuideBio(trans);
                      setGuideBioKm(trans);
                    }}
                    onTranslateToEn={(trans) => setGuideBioEn(trans)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isEnglishMain ? (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Bio (Primary)
                        </label>
                        <textarea
                          rows={3}
                          value={guideBioEn}
                          onChange={(e) => setGuideBioEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="Professional biography and credentials..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Bio (Secondary)
                        </label>
                        <textarea
                          rows={3}
                          value={guideBioKm || guideBio}
                          onChange={(e) => {
                            setGuideBio(e.target.value);
                            setGuideBioKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="ជីវប្រវត្តិ និងបទពិសោធន៍របស់មគ្គុទ្ទេសក៍..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇰🇭 Khmer Bio (Primary)
                        </label>
                        <textarea
                          rows={3}
                          value={guideBioKm || guideBio}
                          onChange={(e) => {
                            setGuideBio(e.target.value);
                            setGuideBioKm(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="ជីវប្រវត្តិ និងបទពិសោធន៍របស់មគ្គុទ្ទេសក៍..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          🇺🇸 English Bio
                        </label>
                        <textarea
                          rows={3}
                          value={guideBioEn}
                          onChange={(e) => setGuideBioEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="Professional biography and credentials..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

                {/* Spoken Languages Manager */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Spoken Languages & Interpretation ({guideLanguages.length} Languages)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Khmer', 'Vietnamese', 'English', 'Thai', 'Chinese', 'French'].map((langPreset) => {
                      const isAdded = guideLanguages.includes(langPreset);
                      return (
                        <button
                          key={langPreset}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              setGuideLanguages(guideLanguages.filter(l => l !== langPreset));
                            } else {
                              setGuideLanguages([...guideLanguages, langPreset]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isAdded
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {langPreset} {isAdded ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newLanguageInput}
                      onChange={(e) => setNewLanguageInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGuideLanguage(); } }}
                      placeholder="Add custom language (e.g. Japanese, Korean)..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddGuideLanguage}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      + Add Language
                    </button>
                  </div>
                </div>
            </div>
          )}

          {/* TAB 4: ITINERARY & HOURLY AGENDAS */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400">
                    Day-by-Day Mission Schedule ({itinerary.length} Days)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure day headlines, hotels, meals, and hour-by-hour escort agenda slots.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItineraryDay}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Day</span>
                </button>
              </div>

              <div className="space-y-4">
                {itinerary.map((day, dIdx) => {
                  const isExpanded = expandedDayIndex === dIdx;
                  return (
                    <div
                      key={dIdx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 overflow-hidden"
                    >
                      {/* Day Accordion Header */}
                      <div
                        onClick={() => setExpandedDayIndex(isExpanded ? null : dIdx)}
                        className="p-4 flex items-center justify-between cursor-pointer bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                            D{day.day}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {day.title}
                            </h4>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>🏨 {day.hotelName || 'No Hotel'}</span>
                              <span>•</span>
                              <span>{(day.guideAgenda || []).length} Timeline Slots</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItineraryDay(dIdx);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                            title="Delete Day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Day Details Form Body */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 bg-white dark:bg-slate-900/60">
                          {/* Day Title (Bilingual) */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                Day Title (Bilingual)
                              </label>
                              <FieldAiTranslator
                                kmText={day.titleKm || day.title}
                                enText={day.titleEn}
                                preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                                fieldHint={`Tour Itinerary Day ${day.day} Headline Title`}
                                onTranslateToKm={(trans) => {
                                  handleUpdateDayField(dIdx, 'titleKm', trans);
                                  handleUpdateDayField(dIdx, 'title', trans);
                                }}
                                onTranslateToEn={(trans) => handleUpdateDayField(dIdx, 'titleEn', trans)}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {isEnglishMain ? (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇺🇸 English Title (Primary)
                                    </label>
                                    <input
                                      type="text"
                                      value={day.titleEn || ''}
                                      onChange={(e) => handleUpdateDayField(dIdx, 'titleEn', e.target.value)}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                      placeholder={`Day ${day.day}: Trade Mission & Business Activity`}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇰🇭 Khmer Title (Secondary)
                                    </label>
                                    <input
                                      type="text"
                                      value={day.titleKm || day.title}
                                      onChange={(e) => {
                                        handleUpdateDayField(dIdx, 'title', e.target.value);
                                        handleUpdateDayField(dIdx, 'titleKm', e.target.value);
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                      placeholder={`ថ្ងៃទី ${day.day}: កម្មវិធីបេសកកម្មពាណិជ្ជកម្ម`}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇰🇭 Khmer Title (Primary)
                                    </label>
                                    <input
                                      type="text"
                                      value={day.titleKm || day.title}
                                      onChange={(e) => {
                                        handleUpdateDayField(dIdx, 'title', e.target.value);
                                        handleUpdateDayField(dIdx, 'titleKm', e.target.value);
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                      placeholder={`ថ្ងៃទី ${day.day}: កម្មវិធីបេសកកម្មពាណិជ្ជកម្ម`}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇺🇸 English Title
                                    </label>
                                    <input
                                      type="text"
                                      value={day.titleEn || ''}
                                      onChange={(e) => handleUpdateDayField(dIdx, 'titleEn', e.target.value)}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                      placeholder={`Day ${day.day}: Trade Mission & Business Activity`}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Hotel / Accommodation
                              </label>
                              <input
                                type="text"
                                value={day.hotelName || ''}
                                onChange={(e) => handleUpdateDayField(dIdx, 'hotelName', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                placeholder="e.g. Grand Saigon Riverside Hotel (4-Star)"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Included Meals (comma separated)
                              </label>
                              <input
                                type="text"
                                value={day.mealsIncluded?.join(', ') || ''}
                                onChange={(e) => handleUpdateDayField(dIdx, 'mealsIncluded', e.target.value.split(',').map(m => m.trim()))}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                placeholder="Breakfast, Welcome Dinner"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Assembly Point / Meeting Location
                              </label>
                              <input
                                type="text"
                                value={day.assemblyPoint || ''}
                                onChange={(e) => handleUpdateDayField(dIdx, 'assemblyPoint', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                placeholder="e.g. Hotel Main Lobby Portico"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Assembly Time
                              </label>
                              <input
                                type="text"
                                value={day.assemblyTime || ''}
                                onChange={(e) => handleUpdateDayField(dIdx, 'assemblyTime', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                                placeholder="e.g. 08:30 AM"
                              />
                            </div>
                          </div>

                          {/* Day Overview Description (Bilingual) */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                Day Overview Description (Bilingual)
                              </label>
                              <FieldAiTranslator
                                kmText={day.descriptionKm || day.description}
                                enText={day.descriptionEn}
                                preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                                fieldHint={`Tour Itinerary Day ${day.day} Full Day Description`}
                                onTranslateToKm={(trans) => {
                                  handleUpdateDayField(dIdx, 'descriptionKm', trans);
                                  handleUpdateDayField(dIdx, 'description', trans);
                                }}
                                onTranslateToEn={(trans) => handleUpdateDayField(dIdx, 'descriptionEn', trans)}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {isEnglishMain ? (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇺🇸 English Description (Primary)
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={day.descriptionEn || ''}
                                      onChange={(e) => handleUpdateDayField(dIdx, 'descriptionEn', e.target.value)}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                      placeholder="Full day activity overview and schedule..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇰🇭 Khmer Description (Secondary)
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={day.descriptionKm || day.description}
                                      onChange={(e) => {
                                        handleUpdateDayField(dIdx, 'description', e.target.value);
                                        handleUpdateDayField(dIdx, 'descriptionKm', e.target.value);
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                      placeholder="ព័ត៌មានលម្អិតសកម្មភាពប្រចាំថ្ងៃ..."
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇰🇭 Khmer Description (Primary)
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={day.descriptionKm || day.description}
                                      onChange={(e) => {
                                        handleUpdateDayField(dIdx, 'description', e.target.value);
                                        handleUpdateDayField(dIdx, 'descriptionKm', e.target.value);
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                      placeholder="ព័ត៌មានលម្អិតសកម្មភាពប្រចាំថ្ងៃ..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                      🇺🇸 English Description
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={day.descriptionEn || ''}
                                      onChange={(e) => handleUpdateDayField(dIdx, 'descriptionEn', e.target.value)}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                      placeholder="Full day activity overview and schedule..."
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Hourly Agenda Section */}
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Hour-by-Hour Guide & Escort Timeline ({day.guideAgenda?.length || 0} Slots)</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddAgendaItem(dIdx)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold hover:bg-indigo-100 cursor-pointer"
                              >
                                + Add Agenda Slot
                              </button>
                            </div>

                            <div className="space-y-2">
                              {(day.guideAgenda || []).map((slot, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                                >
                                  <div className="sm:col-span-3">
                                    <input
                                      type="text"
                                      value={slot.time || ''}
                                      onChange={(e) => handleUpdateAgendaItem(dIdx, sIdx, 'time', e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                                      placeholder="08:30 AM"
                                    />
                                  </div>
                                  <div className="sm:col-span-5 flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={slot.activity || ''}
                                      onChange={(e) => handleUpdateAgendaItem(dIdx, sIdx, 'activity', e.target.value)}
                                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                      placeholder="Activity description..."
                                    />
                                    {slot.activity && (
                                      <FieldAiTranslator
                                        sourceText={slot.activity}
                                        fieldHint="Tour Itinerary Hourly Activity Slot"
                                        size="xs"
                                        onTranslatedText={(trans) => handleUpdateAgendaItem(dIdx, sIdx, 'activity', trans)}
                                      />
                                    )}
                                  </div>
                                  <div className="sm:col-span-3 flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={slot.location || ''}
                                      onChange={(e) => handleUpdateAgendaItem(dIdx, sIdx, 'location', e.target.value)}
                                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                      placeholder="Location..."
                                    />
                                    {slot.location && (
                                      <FieldAiTranslator
                                        sourceText={slot.location}
                                        fieldHint="Tour Itinerary Activity Location"
                                        size="xs"
                                        onTranslatedText={(trans) => handleUpdateAgendaItem(dIdx, sIdx, 'location', trans)}
                                      />
                                    )}
                                  </div>
                                  <div className="sm:col-span-1 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAgendaItem(dIdx, sIdx)}
                                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                      title="Remove slot"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: OPTIONAL PROGRAMS */}
          {activeTab === 'optional' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400">
                    Optional Add-on Programs ({optionalPrograms.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Give delegates high-value optional activities, VIP dinners, or factory tours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOptionalProgram}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Program</span>
                </button>
              </div>

              <div className="space-y-4">
                {optionalPrograms.map((prog, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    {/* Program Title (Bilingual) */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Program Title (Bilingual)
                        </label>
                        <div className="flex items-center gap-2">
                          <FieldAiTranslator
                            kmText={prog.titleKm || prog.title}
                            enText={prog.titleEn}
                            preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                            fieldHint="Tour Package Optional Add-on Program Name"
                            onTranslateToKm={(trans) => {
                              handleUpdateOptionalProgram(pIdx, 'titleKm', trans);
                              handleUpdateOptionalProgram(pIdx, 'title', trans);
                            }}
                            onTranslateToEn={(trans) => handleUpdateOptionalProgram(pIdx, 'titleEn', trans)}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionalProgram(pIdx)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            title="Delete Program"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {isEnglishMain ? (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇺🇸 English Title (Primary)
                              </label>
                              <input
                                type="text"
                                value={prog.titleEn || ''}
                                onChange={(e) => handleUpdateOptionalProgram(pIdx, 'titleEn', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                placeholder="e.g. Automated Smart Factory Visit & VIP Networking Dinner"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇰🇭 Khmer Title (Secondary)
                              </label>
                              <input
                                type="text"
                                value={prog.titleKm || prog.title}
                                onChange={(e) => {
                                  handleUpdateOptionalProgram(pIdx, 'title', e.target.value);
                                  handleUpdateOptionalProgram(pIdx, 'titleKm', e.target.value);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                placeholder="e.g. កម្មវិធីទស្សនកិច្ចរោងចក្រស្វ័យប្រវត្ត & ពិសាអាហារពេលល្ងាច VIP"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇰🇭 Khmer Title (Primary)
                              </label>
                              <input
                                type="text"
                                value={prog.titleKm || prog.title}
                                onChange={(e) => {
                                  handleUpdateOptionalProgram(pIdx, 'title', e.target.value);
                                  handleUpdateOptionalProgram(pIdx, 'titleKm', e.target.value);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                placeholder="e.g. កម្មវិធីទស្សនកិច្ចរោងចក្រស្វ័យប្រវត្ត & ពិសាអាហារពេលល្ងាច VIP"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇺🇸 English Title
                              </label>
                              <input
                                type="text"
                                value={prog.titleEn || ''}
                                onChange={(e) => handleUpdateOptionalProgram(pIdx, 'titleEn', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                placeholder="e.g. Automated Smart Factory Visit & VIP Networking Dinner"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Extra Cost ($ USD)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={prog.additionalCostUSD ?? 0}
                          onChange={(e) => handleUpdateOptionalProgram(pIdx, 'additionalCostUSD', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Duration (Hours)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={prog.durationHours ?? 1}
                          onChange={(e) => handleUpdateOptionalProgram(pIdx, 'durationHours', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Audience
                        </label>
                        <input
                          type="text"
                          value={prog.recommendedAudience || ''}
                          onChange={(e) => handleUpdateOptionalProgram(pIdx, 'recommendedAudience', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. Investors & Owners"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Meeting Point & Time
                        </label>
                        <input
                          type="text"
                          value={prog.meetingPoint || ''}
                          onChange={(e) => handleUpdateOptionalProgram(pIdx, 'meetingPoint', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. Hotel Executive Lounge (05:30 PM)"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Included Meals (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(prog.includedMeals || []).join(', ')}
                          onChange={(e) => handleUpdateOptionalProgram(pIdx, 'includedMeals', e.target.value.split(',').map(m => m.trim()).filter(Boolean))}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                          placeholder="e.g. Executive Seafood Banquet"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Highlights & Feature Bullet Points (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(prog.highlights || []).join(', ')}
                        onChange={(e) => handleUpdateOptionalProgram(pIdx, 'highlights', e.target.value.split(',').map(h => h.trim()).filter(Boolean))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        placeholder="e.g. Dedicated translator, Private conference lounge, Buyer directory"
                      />
                    </div>

                    {/* Program Description (Bilingual) */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Program Description (Bilingual)
                        </label>
                        <FieldAiTranslator
                          kmText={prog.descriptionKm || prog.description}
                          enText={prog.descriptionEn}
                          preferredDirection={isEnglishMain ? "en_to_km" : "km_to_en"}
                          fieldHint="Tour Package Optional Add-on Program Description"
                          onTranslateToKm={(trans) => {
                            handleUpdateOptionalProgram(pIdx, 'descriptionKm', trans);
                            handleUpdateOptionalProgram(pIdx, 'description', trans);
                          }}
                          onTranslateToEn={(trans) => handleUpdateOptionalProgram(pIdx, 'descriptionEn', trans)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {isEnglishMain ? (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇺🇸 English Description (Primary)
                              </label>
                              <textarea
                                rows={2}
                                value={prog.descriptionEn || ''}
                                onChange={(e) => handleUpdateOptionalProgram(pIdx, 'descriptionEn', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                placeholder="Detailed description of the optional activity..."
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇰🇭 Khmer Description (Secondary)
                              </label>
                              <textarea
                                rows={2}
                                value={prog.descriptionKm || prog.description}
                                onChange={(e) => {
                                  handleUpdateOptionalProgram(pIdx, 'description', e.target.value);
                                  handleUpdateOptionalProgram(pIdx, 'descriptionKm', e.target.value);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                placeholder="ការពិពណ៌នាលម្អិតអំពីកម្មវិធីបន្ថែម..."
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇰🇭 Khmer Description (Primary)
                              </label>
                              <textarea
                                rows={2}
                                value={prog.descriptionKm || prog.description}
                                onChange={(e) => {
                                  handleUpdateOptionalProgram(pIdx, 'description', e.target.value);
                                  handleUpdateOptionalProgram(pIdx, 'descriptionKm', e.target.value);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                placeholder="ការពិពណ៌នាលម្អិតអំពីកម្មវិធីបន្ថែម..."
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                🇺🇸 English Description
                              </label>
                              <textarea
                                rows={2}
                                value={prog.descriptionEn || ''}
                                onChange={(e) => handleUpdateOptionalProgram(pIdx, 'descriptionEn', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                                placeholder="Detailed description of the optional activity..."
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Tour Package Terms, Policies & Conditions
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Define essential reservation policies, passport & visa rules, payment schedules, cancellation terms, and delegate codes of conduct displayed on public brochures and customer checkout.
                  </p>
                </div>
              </div>

              {/* Bilingual Terms & Conditions List */}
              <BilingualListEditor
                title="Terms, Cancellation & Booking Policies / លក្ខខណ្ឌ និងគោលការណ៍"
                icon={<FileText className="w-4 h-4 text-amber-500" />}
                hint="Passport validity, deposit schedules, visa responsibility, cancellation terms, and code of conduct."
                kmItems={termsAndConditionsKm}
                enItems={termsAndConditionsEn}
                onKmChange={setTermsAndConditionsKm}
                onEnChange={setTermsAndConditionsEn}
                badgeColor="amber"
                fieldCategoryHint="Tour Package Terms and Conditions, Policies, and Cancellation Rules"
              />
            </div>
          )}

          {/* TAB 7: EMERGENCY & LOCATION */}
          {activeTab === 'emergency' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Official Emergency Contacts & Consular Support
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={emergencyCountry || ''}
                    onChange={(e) => setEmergencyCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Local Police Hotline
                  </label>
                  <input
                    type="text"
                    value={emergencyPolice || ''}
                    onChange={(e) => setEmergencyPolice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ambulance / Medical Hotline
                  </label>
                  <input
                    type="text"
                    value={emergencyAmbulance || ''}
                    onChange={(e) => setEmergencyAmbulance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mission Tourist Helpline / Coordinator Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyHelpline || ''}
                    onChange={(e) => setEmergencyHelpline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Royal Embassy / Consulate General Contact
                  </label>
                  <input
                    type="text"
                    value={emergencyEmbassy || ''}
                    onChange={(e) => setEmergencyEmbassy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                {/* Coordinates */}
                <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lat ?? 0}
                      onChange={(e) => setLat(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lng ?? 0}
                      onChange={(e) => setLng(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Map X (%)
                    </label>
                    <input
                      type="number"
                      value={mapX ?? 0}
                      onChange={(e) => setMapX(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Map Y (%)
                    </label>
                    <input
                      type="number"
                      value={mapY ?? 0}
                      onChange={(e) => setMapY(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Real-time sync to Cloud Firestore, Local Storage & Audit Trail</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(undefined, 'draft')}
                className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Save package as draft without publishing to public catalog"
              >
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Save as Draft</span>
              </button>

              <button
                type="submit"
                onClick={() => {
                  if (status === 'draft') setStatus('active');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{status === 'draft' ? '🚀 Publish Live (Active)' : isEditing ? 'Save All Package Updates' : 'Publish Tour Package'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Package Categories Management Sub-Modal */}
      <PackageCategoryModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onSelectCategory={(catId) => {
          setCategory(catId);
          const sel = packageCategories.find(c => c.id === catId);
          if (sel) {
            if (sel.nameKm) setCategoryKm(sel.nameKm);
            if (sel.nameEn) setCategoryEn(sel.nameEn);
          }
          if (catId === 'canton_fair') {
            setIsCantonFair(true);
            if (!cantonFairPhase) setCantonFairPhase('Phase 1');
          }
        }}
      />
    </div>
  );
};
