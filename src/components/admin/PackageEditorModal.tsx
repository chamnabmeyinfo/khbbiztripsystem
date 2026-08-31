import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TourPackage,
  TourPackageStatus,
  TourVideo,
  ItineraryStep,
  GuideScheduleSlot,
  OptionalTourProgram,
  TourGuide,
  EmergencyContact
} from '../../types';
import { parseTourPackageFromText, translateEntirePackage } from '../../services/geminiService';
import { getLocalizedPackage } from '../../utils/packageLocalization';
import { FieldAiTranslator } from './FieldAiTranslator';
import { BilingualListEditor } from './BilingualListEditor';
import {
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Film,
  Video,
  Play,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Compass,
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
  Tag,
  Search,
  Plane,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LayoutList,
  Columns,
  SlidersHorizontal,
  LayoutGrid
} from 'lucide-react';
import { PackageCategoryModal } from './PackageCategoryModal';
import { uploadImage } from '../../services/imageUploadService';

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
  const [navLayoutStyle, setNavLayoutStyle] = useState<'aside' | 'tabs'>('aside');
  const [asideTabSearch, setAsideTabSearch] = useState<string>('');
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState<boolean>(false);

  // AI Auto-Fill / Text Importer State
  const [isAiImporterOpen, setIsAiImporterOpen] = useState<boolean>(initialOpenWithAi || !pkg);
  const [rawTextToParse, setRawTextToParse] = useState<string>('');
  const [isParsingAi, setIsParsingAi] = useState<boolean>(false);
  const [aiSuccessSummary, setAiSuccessSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Live Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewLang, setPreviewLang] = useState<'km' | 'en'>(language === 'en' ? 'en' : 'km');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Auto-Save & Success Indicator State
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [savedPackageTitle, setSavedPackageTitle] = useState<string>('');
  const [savedAtTimestamp, setSavedAtTimestamp] = useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);

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
  const [priceUSD, setPriceUSD] = useState<number>(pkg ? (pkg.priceUSD ?? 0) : 350);
  const [discountPriceUSD, setDiscountPriceUSD] = useState<number | undefined>(pkg ? pkg.discountPriceUSD : undefined);
  const [durationDays, setDurationDays] = useState<number>(pkg?.durationDays || 4);
  const [durationNights, setDurationNights] = useState<number>(pkg?.durationNights ?? Math.max(0, (pkg?.durationDays || 4) - 1));
  const [hotelStars, setHotelStars] = useState<number>(pkg?.hotelStars || 4);
  const [flightIncluded, setFlightIncluded] = useState<boolean>(pkg?.flightIncluded ?? true);
  const [availableDates, setAvailableDates] = useState<string[]>(pkg?.availableDates || (pkg ? [] : ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']));
  const [newDateInput, setNewDateInput] = useState('');
  const [availableDatesText, setAvailableDatesText] = useState(pkg?.availableDates?.join(', ') || (pkg ? '' : '2026-10-29, 2026-10-30, 2026-10-31, 2026-11-01'));
  const [tags, setTags] = useState<string[]>(pkg?.tags || ['trending', 'popular', 'cultural']);
  const [newTagInput, setNewTagInput] = useState('');
  const [rating, setRating] = useState<number>(pkg?.rating ?? 5.0);
  const [reviewCount, setReviewCount] = useState<number>(pkg?.reviewCount ?? 1);
  const [bookedThisMonth, setBookedThisMonth] = useState<number>(pkg?.bookedThisMonth ?? 0);
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

  // Video Gallery & Featured Video State
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState<string>(pkg?.featuredVideoUrl || '');
  const [videos, setVideos] = useState<TourVideo[]>(pkg?.videos || []);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoTitleKm, setNewVideoTitleKm] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('');

  // Highlights Bilingual State
  const [highlightsKm, setHighlightsKm] = useState<string[]>(() => {
    if (pkg) {
      if (pkg.highlightsKm !== undefined) return pkg.highlightsKm;
      if (pkg.highlights !== undefined) return pkg.highlights;
      return [];
    }
    return [
      '🤝 ស្វែងរកផលិតផលបោះដុំពាក់ព័ន្ធនឹង តែ កាហ្វេ ការដុតនំ និងការលក់រាយ (Wholesale Sourcing)',
      '⚙️ សម្ភារៈ និងឧបករណ៍ឆុងកាហ្វេ ធ្វើនំ និងបច្ចេកវិទ្យាពាក់ព័ន្ធនឹងលក់រាយ (Equipment & RetailTech)',
      '🏢 ប្រេនល្បីៗនៅវៀតណាម និងអន្តរជាតិសម្រាប់ទិញសិទ្ធិ Franchise មកកម្ពុជា (Franchise Opportunities)'
    ];
  });
  const [highlightsEn, setHighlightsEn] = useState<string[]>(() => pkg?.highlightsEn || []);

  // Who Should Join Bilingual State
  const [whoShouldJoinKm, setWhoShouldJoinKm] = useState<string[]>(() => {
    if (pkg) {
      if (pkg.whoShouldJoinKm !== undefined) return pkg.whoShouldJoinKm;
      if (pkg.whoShouldJoin !== undefined) return pkg.whoShouldJoin;
      return [];
    }
    return [
      'ម្ចាស់ហាងកាហ្វេ ម្ចាស់ហាងនំ Bakery និងភោជនីយដ្ឋាន ដែលចង់ស្វែងរកប្រភពទំនិញបោះដុំផ្ទាល់ពីរោងចក្រ',
      'សហគ្រិន និងអ្នកវិនិយោគដែលចង់ទិញសិទ្ធិអាជីវកម្ម (Franchise) មកបើកដំណើរការនៅកម្ពុជា',
      'អ្នកនាំចូល និងចែកចាយ (Importers & Wholesalers) សម្ភារៈ គ្រឿងផ្សំ និងឧបករណ៍ឧស្សាហកម្មម្ហូបអាហារ'
    ];
  });
  const [whoShouldJoinEn, setWhoShouldJoinEn] = useState<string[]>(() => pkg?.whoShouldJoinEn || []);

  // Why You Should Join Bilingual State
  const [whyShouldJoinKm, setWhyShouldJoinKm] = useState<string[]>(() => {
    if (pkg) {
      if (pkg.whyShouldJoinKm !== undefined) return pkg.whyShouldJoinKm;
      if (pkg.whyShouldJoin !== undefined) return pkg.whyShouldJoin;
      return [];
    }
    return [
      'ទទួលបានតម្លៃដើមផ្ទាល់ពីរោងចក្រផលិត (Factory-Direct Wholesale Pricing) ដោយគ្មានឈ្មួញកណ្តាល',
      'ជួបពិភាក្សា និងចរចាផ្ទាល់ជាមួយដៃគូផ្គត់ផ្គង់ និងម្ចាស់ប្រេនល្បីៗជាង ១,០០០ ក្រុមហ៊ុន',
      'សេវាសម្រួលបែបបទឆ្លងដែន VIP Fast-Track និងការស្នាក់នៅសណ្ឋាគារលំដាប់ ៤ ផ្កាយប្រណិត'
    ];
  });
  const [whyShouldJoinEn, setWhyShouldJoinEn] = useState<string[]>(() => pkg?.whyShouldJoinEn || []);

  // Inclusions Bilingual State
  const [inclusionsKm, setInclusionsKm] = useState<string[]>(() => {
    if (pkg) {
      if (pkg.inclusionsKm !== undefined) return pkg.inclusionsKm;
      if (pkg.inclusions !== undefined) return pkg.inclusions;
      return [];
    }
    return [
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
    ];
  });
  const [inclusionsEn, setInclusionsEn] = useState<string[]>(() => pkg?.inclusionsEn || []);

  // Exclusions Bilingual State
  const [exclusionsKm, setExclusionsKm] = useState<string[]>(() => {
    if (pkg) {
      if (pkg.exclusionsKm !== undefined) return pkg.exclusionsKm;
      if (pkg.exclusions !== undefined) return pkg.exclusions;
      return [];
    }
    return [
      'អាហារថ្ងៃត្រង់ និងអាហារពេលល្ងាចផ្ទាល់ខ្លួន (លើកលែងតែកម្មវិធីដែលបានបញ្ជាក់)',
      'ការចំណាយផ្ទាល់ខ្លួន (ទិញទំនិញ, សេវាបោកអ៊ុត, ទូរស័ព្ទ)',
      'ថ្លៃកម្មវិធីជម្រើសបន្ថែម (Optional Tour Programs / VIP 1-on-1 Dinner)',
      'ធានារ៉ាប់រងការធ្វើដំណើរក្រៅប្រទេសផ្ទាល់ខ្លួន'
    ];
  });
  const [exclusionsEn, setExclusionsEn] = useState<string[]>(() => pkg?.exclusionsEn || []);

  // Terms & Conditions Bilingual State
  const [termsAndConditionsKm, setTermsAndConditionsKm] = useState<string[]>(() => {
    if (pkg) {
      if (pkg.termsAndConditionsKm !== undefined) return pkg.termsAndConditionsKm;
      if (pkg.termsAndConditions !== undefined) return pkg.termsAndConditions;
      return [];
    }
    return [
      'លិខិតឆ្លងដែន (Passport) ត្រូវតែមានសុពលភាពយ៉ាងតិច ៦ ខែ គិតចាប់ពីថ្ងៃចេញដំណើរ។',
      'ការកក់កន្លែង និងធានាសិទ្ធិចូលរួម ត្រូវតម្កល់ប្រាក់កក់យ៉ាងតិច 50% នៃតម្លៃសរុបពេលចុះឈ្មោះ។',
      'ការបង់ប្រាក់បង្គ្រប់ 100% ត្រូវធ្វើឡើងយ៉ាងតិច ៧ ថ្ងៃ មុនកាលបរិច្ឆេទចេញដំណើរ។',
      'ករណីលុបចោលការធ្វើដំណើរមុន ១៥ ថ្ងៃ នឹងទទួលបានការបង្វិលប្រាក់វិញ 70%។ ករណីលុបចោលក្រោម ៧ ថ្ងៃ មិនអាចបង្វិលប្រាក់បានទេ។',
      'អ្នកចូលរួមត្រូវគោរពតាមពេលវេលា និងការណែនាំរបស់មគ្គុទ្ទេសក៍ និងអ្នកសម្របសម្រួលបេសកកម្ម។',
      'ក្រុមហ៊ុនសូមរក្សាសិទ្ធិកែប្រែកាលវិភាគ ឬសណ្ឋាគារក្នុងកម្រិតស្មើគ្នា ករណីមានប្រធានសក្តិ ឬហេតុការណ៍ចៃដន្យ។'
    ];
  });
  const [termsAndConditionsEn, setTermsAndConditionsEn] = useState<string[]>(() => pkg?.termsAndConditionsEn || []);

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

  // Synchronize state when pkg changes
  useEffect(() => {
    if (pkg) {
      setStatus(pkg.status || 'active');
      setTitle(pkg.title || '');
      setTitleKm(pkg.titleKm || pkg.title || '');
      setTitleEn(pkg.titleEn || '');
      setDestination(pkg.destination || '');
      setDestinationKm(pkg.destinationKm || pkg.destination || '');
      setDestinationEn(pkg.destinationEn || '');
      setCountry(pkg.country || 'Vietnam');
      setCountryKm(pkg.countryKm || pkg.country || '');
      setCountryEn(pkg.countryEn || '');
      setCategory(pkg.category || 'trade_mission');
      setCategoryKm(pkg.categoryKm || '');
      setCategoryEn(pkg.categoryEn || '');
      setIsCantonFair(pkg.isCantonFair ?? (pkg.category === 'canton_fair' || !!pkg.cantonFairPhase));
      setCantonFairPhase(pkg.cantonFairPhase);
      setPriceUSD(pkg.priceUSD ?? 0);
      setDiscountPriceUSD(pkg.discountPriceUSD);
      setDurationDays(pkg.durationDays || 1);
      setDurationNights(pkg.durationNights ?? Math.max(0, (pkg.durationDays || 1) - 1));
      setHotelStars(pkg.hotelStars || 4);
      setFlightIncluded(pkg.flightIncluded ?? true);
      setAvailableDates(pkg.availableDates || []);
      setAvailableDatesText(pkg.availableDates?.join(', ') || '');
      setTags(pkg.tags || []);
      setRating(pkg.rating ?? 5.0);
      setReviewCount(pkg.reviewCount ?? 0);
      setBookedThisMonth(pkg.bookedThisMonth ?? 0);
      setLat(pkg.coordinates?.lat || 10.8231);
      setLng(pkg.coordinates?.lng || 106.6297);
      setMapX(pkg.coordinates?.mapX || 74);
      setMapY(pkg.coordinates?.mapY || 62);
      setDescription(pkg.description || '');
      setDescriptionKm(pkg.descriptionKm || pkg.description || '');
      setDescriptionEn(pkg.descriptionEn || '');
      setImages(pkg.images || []);
      setVideos(pkg.videos || []);
      setFeaturedVideoUrl(pkg.featuredVideoUrl || '');
      setHighlightsKm(pkg.highlightsKm !== undefined ? pkg.highlightsKm : (pkg.highlights || []));
      setHighlightsEn(pkg.highlightsEn !== undefined ? pkg.highlightsEn : []);
      setWhoShouldJoinKm(pkg.whoShouldJoinKm !== undefined ? pkg.whoShouldJoinKm : (pkg.whoShouldJoin || []));
      setWhoShouldJoinEn(pkg.whoShouldJoinEn !== undefined ? pkg.whoShouldJoinEn : []);
      setWhyShouldJoinKm(pkg.whyShouldJoinKm !== undefined ? pkg.whyShouldJoinKm : (pkg.whyShouldJoin || []));
      setWhyShouldJoinEn(pkg.whyShouldJoinEn !== undefined ? pkg.whyShouldJoinEn : []);
      setInclusionsKm(pkg.inclusionsKm !== undefined ? pkg.inclusionsKm : (pkg.inclusions || []));
      setInclusionsEn(pkg.inclusionsEn !== undefined ? pkg.inclusionsEn : []);
      setExclusionsKm(pkg.exclusionsKm !== undefined ? pkg.exclusionsKm : (pkg.exclusions || []));
      setExclusionsEn(pkg.exclusionsEn !== undefined ? pkg.exclusionsEn : []);
      setTermsAndConditionsKm(pkg.termsAndConditionsKm !== undefined ? pkg.termsAndConditionsKm : (pkg.termsAndConditions || []));
      setTermsAndConditionsEn(pkg.termsAndConditionsEn !== undefined ? pkg.termsAndConditionsEn : []);
      setItinerary(pkg.itinerary || []);
      setOptionalPrograms(pkg.optionalPrograms || []);
      if (pkg.tourGuide) {
        setGuideName(pkg.tourGuide.name || '');
        setGuideNameKm(pkg.tourGuide.nameKm || pkg.tourGuide.name || '');
        setGuideNameEn(pkg.tourGuide.nameEn || '');
        setGuideTitle(pkg.tourGuide.title || '');
        setGuideTitleKm(pkg.tourGuide.titleKm || pkg.tourGuide.title || '');
        setGuideTitleEn(pkg.tourGuide.titleEn || '');
        setGuidePhone(pkg.tourGuide.phone || '');
        setGuideTelegram(pkg.tourGuide.telegram || '');
        setGuideLanguages(pkg.tourGuide.languages || []);
        setGuideBadge(pkg.tourGuide.badgeNumber || '');
        setGuidePhoto(pkg.tourGuide.photoUrl || '');
        setGuideBio(pkg.tourGuide.bio || '');
        setGuideBioKm(pkg.tourGuide.bioKm || pkg.tourGuide.bio || '');
        setGuideBioEn(pkg.tourGuide.bioEn || '');
        setBriefingMeetingPoint(pkg.tourGuide.briefingMeetingPoint || '');
        setBriefingMeetingPointKm(pkg.tourGuide.briefingMeetingPointKm || pkg.tourGuide.briefingMeetingPoint || '');
        setBriefingMeetingPointEn(pkg.tourGuide.briefingMeetingPointEn || '');
        setBriefingTime(pkg.tourGuide.briefingTime || '');
        setBriefingTimeKm(pkg.tourGuide.briefingTimeKm || pkg.tourGuide.briefingTime || '');
        setBriefingTimeEn(pkg.tourGuide.briefingTimeEn || '');
      }
      if (pkg.emergencyContact) {
        setEmergencyCountry(pkg.emergencyContact.country || pkg.country || '');
        setEmergencyPolice(pkg.emergencyContact.police || '');
        setEmergencyAmbulance(pkg.emergencyContact.ambulance || '');
        setEmergencyHelpline(pkg.emergencyContact.touristHelpline || '');
        setEmergencyEmbassy(pkg.emergencyContact.embassySupport || '');
      }
    }
  }, [pkg]);

  // Background Auto-Save Engine (Saves transient form draft to localStorage)
  useEffect(() => {
    if (!title.trim() && !titleKm.trim() && !titleEn.trim()) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const draftKey = `khb_editor_draft_${pkg?.id || 'new'}`;
        const draftData = {
          pkgId: pkg?.id,
          status,
          title, titleKm, titleEn,
          destination, destinationKm, destinationEn,
          country, category, priceUSD, discountPriceUSD, durationDays, durationNights,
          description, descriptionKm, descriptionEn,
          images, itinerary, optionalPrograms,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
        setAutoSaveStatus('saved');
        setLastAutoSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        console.warn('Auto-save to localStorage failed', e);
        setAutoSaveStatus('idle');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    title, titleKm, titleEn, destination, destinationKm, destinationEn,
    country, category, priceUSD, discountPriceUSD, durationDays, durationNights,
    description, descriptionKm, descriptionEn, images, itinerary, optionalPrograms, status, pkg?.id
  ]);

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
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const guidePhotoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [isVideoDraggingOver, setIsVideoDraggingOver] = useState<boolean>(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<string | null>(null);

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
    setImageUploadProgress('Preparing photos...');
    const uploadedUrls: string[] = [];

    const fileArray = Array.from(files);
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file.type.startsWith('image/')) continue;
      setImageUploadProgress(`Processing photo ${i + 1} of ${fileArray.length}...`);
      try {
        const permanentUrl = await uploadImage(file, {
          folder: 'packages',
          maxWidth: 1200,
          maxHeight: 900,
          quality: 0.78,
          maxSizeBytes: 65000,
          onProgress: (status) => setImageUploadProgress(`${status} (${i + 1}/${fileArray.length})`)
        });
        uploadedUrls.push(permanentUrl);
      } catch (err) {
        console.error('Failed to compress/upload image:', err);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages(prev => [...prev, ...uploadedUrls]);
    }
    setIsUploadingImages(false);
    setImageUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetHeroImage = (index: number) => {
    if (index === 0 || index >= images.length) return;
    setImages(prev => {
      const hero = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [hero, ...rest];
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleGuidePhotoUpload = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const permanentUrl = await uploadImage(file, {
        folder: 'guides',
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.80,
        maxSizeBytes: 45000
      });
      setGuidePhoto(permanentUrl);
    } catch (err) {
      console.error('Failed to upload guide photo:', err);
    }
    if (guidePhotoInputRef.current) guidePhotoInputRef.current.value = '';
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const splitUrls = newImageUrl
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 0);
    
    if (splitUrls.length > 0) {
      setImages(prev => [...prev, ...splitUrls]);
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Extract thumbnail snapshot and duration from local video file
   */
  const extractVideoMetadata = (file: File): Promise<{ dataUrl: string; duration: string; thumbnailUrl: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const fileUrl = URL.createObjectURL(file);
      video.src = fileUrl;

      let isResolved = false;

      const finishWithReader = (thumb: string, durationStr: string) => {
        if (isResolved) return;
        isResolved = true;
        const reader = new FileReader();
        reader.onload = (e) => {
          const videoDataUrl = (e.target?.result as string) || fileUrl;
          resolve({
            dataUrl: videoDataUrl,
            duration: durationStr,
            thumbnailUrl: thumb
          });
        };
        reader.onerror = () => {
          resolve({
            dataUrl: fileUrl,
            duration: durationStr,
            thumbnailUrl: thumb
          });
        };
        reader.readAsDataURL(file);
      };

      video.onloadedmetadata = () => {
        const seekTime = Math.min(1.0, (video.duration || 2) / 2);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(video.videoWidth || 640, 800);
          canvas.height = Math.min(video.videoHeight || 360, 450);
          const ctx = canvas.getContext('2d');
          let thumbDataUrl = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80';
          if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          }

          const totalSeconds = Math.round(video.duration || 0);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          const formattedDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

          finishWithReader(thumbDataUrl, formattedDuration);
        } catch {
          finishWithReader('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80', '02:00');
        }
      };

      video.onerror = () => {
        finishWithReader('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80', '02:00');
      };

      // Safety timeout after 4 seconds
      setTimeout(() => {
        if (!isResolved) {
          finishWithReader('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80', '02:00');
        }
      }, 4000);
    });
  };

  const handleVideoFilesUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingVideo(true);
    setVideoUploadProgress('Reading and processing video file...');

    const fileArray = Array.from(files);
    const newAddedVideos: TourVideo[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v|avi|mkv|ogg)$/i)) {
        continue;
      }
      setVideoUploadProgress(`Extracting thumbnail & duration (${i + 1}/${fileArray.length})...`);
      try {
        const { dataUrl, duration, thumbnailUrl } = await extractVideoMetadata(file);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const videoEntry: TourVideo = {
          id: `vid_up_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title: cleanName || `${title || 'Mission'} Official Video`,
          titleKm: undefined,
          url: dataUrl,
          thumbnailUrl,
          duration,
          isFeatured: videos.length === 0 && !featuredVideoUrl
        };
        newAddedVideos.push(videoEntry);
      } catch (err) {
        console.error('Failed to process video file:', err);
      }
    }

    if (newAddedVideos.length > 0) {
      if (!featuredVideoUrl && newAddedVideos[0]) {
        setFeaturedVideoUrl(newAddedVideos[0].url);
      }
      setVideos(prev => [...prev, ...newAddedVideos]);
    }

    setIsUploadingVideo(false);
    setVideoUploadProgress(null);
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;
    const newVid: TourVideo = {
      id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: newVideoTitle.trim() || `${title || 'Mission'} Video Clip`,
      titleKm: newVideoTitleKm.trim() || undefined,
      url: newVideoUrl.trim(),
      duration: newVideoDuration.trim() || undefined,
      isFeatured: videos.length === 0 && !featuredVideoUrl
    };
    if (!featuredVideoUrl) {
      setFeaturedVideoUrl(newVid.url);
    }
    setVideos(prev => [...prev, newVid]);
    setNewVideoTitle('');
    setNewVideoTitleKm('');
    setNewVideoUrl('');
    setNewVideoDuration('');
  };

  const handleRemoveVideo = (index: number) => {
    const removedVid = videos[index];
    const remaining = videos.filter((_, i) => i !== index);
    setVideos(remaining);
    if (removedVid && (removedVid.url === featuredVideoUrl || removedVid.isFeatured)) {
      setFeaturedVideoUrl(remaining.length > 0 ? remaining[0].url : '');
      if (remaining.length > 0) {
        remaining[0].isFeatured = true;
      }
    }
  };

  const handleSetFeaturedVideo = (videoUrl: string) => {
    setFeaturedVideoUrl(videoUrl);
    setVideos(prev => prev.map(v => ({ ...v, isFeatured: v.url === videoUrl })));
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
      featuredVideoUrl: featuredVideoUrl.trim() || undefined,
      videos: (videos || []).filter(v => v.url && v.url.trim()),
      highlights: isEnglishMain
        ? (highlightsEn.length > 0 ? highlightsEn : (highlightsKm.length > 0 ? highlightsKm : []))
        : (highlightsKm.length > 0 ? highlightsKm : (highlightsEn.length > 0 ? highlightsEn : [])),
      highlightsKm: highlightsKm || [],
      highlightsEn: highlightsEn || [],
      whoShouldJoin: isEnglishMain
        ? (whoShouldJoinEn.length > 0 ? whoShouldJoinEn : (whoShouldJoinKm.length > 0 ? whoShouldJoinKm : []))
        : (whoShouldJoinKm.length > 0 ? whoShouldJoinKm : (whoShouldJoinEn.length > 0 ? whoShouldJoinEn : [])),
      whoShouldJoinKm: whoShouldJoinKm || [],
      whoShouldJoinEn: whoShouldJoinEn || [],
      whyShouldJoin: isEnglishMain
        ? (whyShouldJoinEn.length > 0 ? whyShouldJoinEn : (whyShouldJoinKm.length > 0 ? whyShouldJoinKm : []))
        : (whyShouldJoinKm.length > 0 ? whyShouldJoinKm : (whyShouldJoinEn.length > 0 ? whyShouldJoinEn : [])),
      whyShouldJoinKm: whyShouldJoinKm || [],
      whyShouldJoinEn: whyShouldJoinEn || [],
      inclusions: isEnglishMain
        ? (inclusionsEn.length > 0 ? inclusionsEn : (inclusionsKm.length > 0 ? inclusionsKm : []))
        : (inclusionsKm.length > 0 ? inclusionsKm : (inclusionsEn.length > 0 ? inclusionsEn : [])),
      inclusionsKm: inclusionsKm || [],
      inclusionsEn: inclusionsEn || [],
      exclusions: isEnglishMain
        ? (exclusionsEn.length > 0 ? exclusionsEn : (exclusionsKm.length > 0 ? exclusionsKm : []))
        : (exclusionsKm.length > 0 ? exclusionsKm : (exclusionsEn.length > 0 ? exclusionsEn : [])),
      exclusionsKm: exclusionsKm || [],
      exclusionsEn: exclusionsEn || [],
      termsAndConditions: isEnglishMain
        ? (termsAndConditionsEn.length > 0 ? termsAndConditionsEn : (termsAndConditionsKm.length > 0 ? termsAndConditionsKm : []))
        : (termsAndConditionsKm.length > 0 ? termsAndConditionsKm : (termsAndConditionsEn.length > 0 ? termsAndConditionsEn : [])),
      termsAndConditionsKm: termsAndConditionsKm || [],
      termsAndConditionsEn: termsAndConditionsEn || [],
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
        assemblyTime: step.assemblyTime?.trim() || undefined,
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
          time: slot.time?.trim() || '08:30 AM',
          type: slot.type || 'briefing',
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
        id: prog.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        additionalCostUSD: Number(prog.additionalCostUSD) || 0,
        durationHours: Number(prog.durationHours) || 1,
        includesGuide: prog.includesGuide ?? true,
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

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSavedPackageTitle(updatedPackage.title);
    setSavedAtTimestamp(nowTime);
    setShowSuccessToast(true);

    try {
      localStorage.removeItem(`khb_editor_draft_${pkg?.id || 'new'}`);
    } catch {}

    onSave(updatedPackage);

    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1600);
  };

  const studios: { id: TabType; studioNum: number; label: string; shortTitle: string; icon: any; desc: string; badge: string; badgeColor: string; isFilled: boolean }[] = [
    {
      id: 'basic',
      studioNum: 1,
      label: '1. Core & Pricing',
      shortTitle: 'Core & Pricing',
      icon: DollarSign,
      desc: 'Title, code, pricing, seats',
      badge: `${durationDays || 1}D/${durationNights || 0}N • $${priceUSD || 0}`,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      isFilled: Boolean((titleEn || titleKm || title) && priceUSD > 0)
    },
    {
      id: 'media',
      studioNum: 2,
      label: '2. Media & Highlights',
      shortTitle: 'Media & Highlights',
      icon: ImageIcon,
      desc: 'Cover, gallery, inclusions',
      badge: `${images?.length || 0} 📸 • ${inclusionsKm?.length || inclusionsEn?.length || 0} Incls`,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      isFilled: Boolean((images?.length || 0) > 0)
    },
    {
      id: 'guide',
      studioNum: 3,
      label: '3. Tour Director & Escort',
      shortTitle: 'Director & Escort',
      icon: User,
      desc: 'Guide bio, phone & badge',
      badge: guideName ? 'Assigned' : 'Optional',
      badgeColor: guideName ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      isFilled: Boolean(guideName)
    },
    {
      id: 'itinerary',
      studioNum: 4,
      label: '4. Itinerary & Schedule',
      shortTitle: 'Itinerary & Schedule',
      icon: Clock,
      desc: 'Day-by-day & hourly agenda',
      badge: `${itinerary?.length || 0} Days Plan`,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      isFilled: Boolean((itinerary?.length || 0) > 0)
    },
    {
      id: 'optional',
      studioNum: 5,
      label: '5. Optional Programs',
      shortTitle: 'Optional Programs',
      icon: Sparkles,
      desc: 'Add-ons & excursions',
      badge: `${optionalPrograms?.length || 0} Programs`,
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      isFilled: Boolean((optionalPrograms?.length || 0) > 0)
    },
    {
      id: 'terms',
      studioNum: 6,
      label: '6. Terms & Conditions',
      shortTitle: 'Terms & Policies',
      icon: FileText,
      desc: 'Policies, refund & rules',
      badge: `${termsAndConditionsKm?.length || termsAndConditionsEn?.length || 0} Policies`,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      isFilled: Boolean((termsAndConditionsKm?.length || 0) > 0 || (termsAndConditionsEn?.length || 0) > 0)
    },
    {
      id: 'emergency',
      studioNum: 7,
      label: '7. Emergency & Map',
      shortTitle: 'Emergency & GPS',
      icon: Shield,
      desc: 'Hotlines & GPS pin location',
      badge: emergencyPolice || emergencyAmbulance ? 'Configured' : 'Optional',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      isFilled: Boolean(emergencyPolice || emergencyAmbulance)
    }
  ];

  // Inner Sub-Section Navigation & Controller State
  const [innerNavStyle, setInnerNavStyle] = useState<'tabs' | 'aside'>('tabs');
  const [innerViewMode, setInnerViewMode] = useState<'all' | 'focus'>('all');
  const [activeSubSection, setActiveSubSection] = useState<string>('all');
  const [subSectionSearch, setSubSectionSearch] = useState<string>('');

  // Sub-sections mapping per active studio tab
  const subSectionsMap: Record<TabType, Array<{ id: string; label: string; icon: React.FC<{ className?: string }>; desc: string; isFilled: boolean }>> = {
    basic: [
      { id: 'studio-basic-status', label: '1. Status & Visibility', icon: CheckCircle2, desc: 'Active / Draft / Archived selector', isFilled: Boolean(status) },
      { id: 'studio-basic-titles', label: '2. Naming & Titles', icon: FileText, desc: 'English & Khmer multilingual titles', isFilled: Boolean(titleEn || titleKm || title) },
      { id: 'studio-basic-destination', label: '3. Destination Geography', icon: MapPin, desc: 'City, province & country localization', isFilled: Boolean(destinationEn || destinationKm || destination) },
      { id: 'studio-basic-classification', label: '4. Category & Canton Fair', icon: Tag, desc: 'Catalog grouping & Canton Fair phase setup', isFilled: Boolean(category) },
      { id: 'studio-basic-pricing', label: '5. Pricing & Duration', icon: DollarSign, desc: 'Commercial rates, early bird deals & hotel rating', isFilled: Boolean(priceUSD > 0) },
      { id: 'studio-basic-dates', label: '6. Departure Dates', icon: Calendar, desc: 'Scheduled departure dates list', isFilled: availableDates.length > 0 },
      { id: 'studio-basic-marketing', label: '7. Marketing Badges & Rating', icon: Sparkles, desc: 'Preset tags, rating & booking count metrics', isFilled: tags.length > 0 }
    ],
    media: [
      { id: 'studio-media-overview', label: '1. Package Overview', icon: FileText, desc: 'Bilingual detailed mission overview', isFilled: Boolean(descriptionEn || descriptionKm || description) },
      { id: 'studio-media-video', label: '2. Video Gallery & Default Play', icon: Film, desc: 'Video tours & default auto-player', isFilled: Boolean(featuredVideoUrl || videos.length > 0) },
      { id: 'studio-media-gallery', label: '3. Image Gallery & Highlights', icon: ImageIcon, desc: 'Hero photo cover, gallery & highlights', isFilled: images.length > 0 }
    ],
    guide: [
      { id: 'studio-guide-director', label: '1. Tour Director Profile', icon: Users, desc: 'Lead coordinator, phone, telegram & photo', isFilled: Boolean(guideName || guideNameEn) },
      { id: 'studio-guide-briefing', label: '2. Pre-Departure Briefing', icon: Compass, desc: 'Meeting point, departure time & guidelines', isFilled: Boolean(briefingMeetingPoint || briefingMeetingPointEn) }
    ],
    itinerary: [
      { id: 'studio-itinerary-days', label: '1. Day-by-Day Agenda', icon: Calendar, desc: 'Structured day-by-day itinerary schedule', isFilled: itinerary.length > 0 }
    ],
    optional: [
      { id: 'studio-optional-programs', label: '1. Add-on Tours & VIP Excursions', icon: Plus, desc: 'Optional networking dinners & factory visits', isFilled: optionalPrograms.length > 0 }
    ],
    terms: [
      { id: 'studio-terms-policies', label: '1. Terms, Policies & Cancellation', icon: FileText, desc: 'Deposit schedules, passport rules & refund terms', isFilled: termsAndConditionsKm.length > 0 || termsAndConditionsEn.length > 0 }
    ],
    emergency: [
      { id: 'studio-emergency-hotlines', label: '1. Emergency Contacts', icon: Shield, desc: 'Local police, ambulance, coordinator phone & embassy', isFilled: Boolean(emergencyPolice || emergencyAmbulance || emergencyHelpline) },
      { id: 'studio-emergency-location', label: '2. GPS Coordinates & Map Pin', icon: MapPin, desc: 'Geographic coordinates & visual map coordinates', isFilled: Boolean(lat && lng) }
    ]
  };

  const currentSubSections = subSectionsMap[activeTab] || [];
  const currentSubIdx = currentSubSections.findIndex(s => s.id === activeSubSection);
  const prevSubSection = currentSubIdx > 0 ? currentSubSections[currentSubIdx - 1] : null;
  const nextSubSection = currentSubIdx >= 0 && currentSubIdx < currentSubSections.length - 1 ? currentSubSections[currentSubIdx + 1] : null;

  const handleSelectSubSection = (subSectionId: string) => {
    setActiveSubSection(subSectionId);
    // Smooth scroll to the target element if in 'all' view mode
    if (innerViewMode === 'all') {
      setTimeout(() => {
        const el = document.getElementById(subSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
          setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2'), 1800);
        }
      }, 50);
    }
  };

  const constructPreviewPackage = (): TourPackage => {
    const parsedDates = availableDatesText
      .split(/[\n,]+/)
      .map(d => d.trim())
      .filter(Boolean);
    const finalAvailableDates = availableDates.length > 0
      ? availableDates
      : (parsedDates.length > 0 ? parsedDates : ['2026-10-29']);

    const primaryTitle = (isEnglishMain ? (titleEn || titleKm || title) : (titleKm || title || titleEn)).trim() || 'Untitled Tour Package';
    const primaryDest = (isEnglishMain ? (destinationEn || destinationKm || destination) : (destinationKm || destination || destinationEn)).trim() || 'Guangzhou';
    const primaryCountry = (isEnglishMain ? (countryEn || countryKm || country) : (countryKm || country || countryEn)).trim() || 'China';
    const primaryCategory = (isEnglishMain ? (categoryEn || categoryKm || category) : (categoryKm || category || categoryEn)).trim() || 'trade_mission';
    const primaryDesc = (isEnglishMain ? (descriptionEn || descriptionKm || description) : (descriptionKm || description || descriptionEn)).trim() || 'Tour package details...';

    return {
      ...(pkg || {}),
      id: pkg?.id || `pkg_preview_${Date.now()}`,
      status: status || 'active',
      title: primaryTitle,
      titleKm: (titleKm || title || titleEn).trim() || primaryTitle,
      titleEn: titleEn.trim() || undefined,
      destination: primaryDest,
      destinationKm: (destinationKm || destination || destinationEn).trim() || primaryDest,
      destinationEn: destinationEn.trim() || undefined,
      country: primaryCountry,
      countryKm: (countryKm || country || countryEn).trim() || primaryCountry,
      countryEn: countryEn.trim() || undefined,
      category: primaryCategory,
      categoryKm: (categoryKm || category || categoryEn).trim() || primaryCategory,
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
      descriptionKm: (descriptionKm || description || descriptionEn).trim() || primaryDesc,
      descriptionEn: descriptionEn.trim() || undefined,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80'],
      featuredVideoUrl: featuredVideoUrl.trim() || undefined,
      videos: (videos || []).filter(v => v.url && v.url.trim()),
      highlights: isEnglishMain
        ? (highlightsEn.length > 0 ? highlightsEn : (highlightsKm.length > 0 ? highlightsKm : []))
        : (highlightsKm.length > 0 ? highlightsKm : (highlightsEn.length > 0 ? highlightsEn : [])),
      highlightsKm: highlightsKm || [],
      highlightsEn: highlightsEn || [],
      whoShouldJoin: isEnglishMain
        ? (whoShouldJoinEn.length > 0 ? whoShouldJoinEn : (whoShouldJoinKm.length > 0 ? whoShouldJoinKm : []))
        : (whoShouldJoinKm.length > 0 ? whoShouldJoinKm : (whoShouldJoinEn.length > 0 ? whoShouldJoinEn : [])),
      whoShouldJoinKm: whoShouldJoinKm || [],
      whoShouldJoinEn: whoShouldJoinEn || [],
      whyShouldJoin: isEnglishMain
        ? (whyShouldJoinEn.length > 0 ? whyShouldJoinEn : (whyShouldJoinKm.length > 0 ? whyShouldJoinKm : []))
        : (whyShouldJoinKm.length > 0 ? whyShouldJoinKm : (whyShouldJoinEn.length > 0 ? whyShouldJoinEn : [])),
      whyShouldJoinKm: whyShouldJoinKm || [],
      whyShouldJoinEn: whyShouldJoinEn || [],
      inclusions: isEnglishMain
        ? (inclusionsEn.length > 0 ? inclusionsEn : (inclusionsKm.length > 0 ? inclusionsKm : []))
        : (inclusionsKm.length > 0 ? inclusionsKm : (inclusionsEn.length > 0 ? inclusionsEn : [])),
      inclusionsKm: inclusionsKm || [],
      inclusionsEn: inclusionsEn || [],
      exclusions: isEnglishMain
        ? (exclusionsEn.length > 0 ? exclusionsEn : (exclusionsKm.length > 0 ? exclusionsKm : []))
        : (exclusionsKm.length > 0 ? exclusionsKm : (exclusionsEn.length > 0 ? exclusionsEn : [])),
      exclusionsKm: exclusionsKm || [],
      exclusionsEn: exclusionsEn || [],
      termsAndConditions: isEnglishMain
        ? (termsAndConditionsEn.length > 0 ? termsAndConditionsEn : (termsAndConditionsKm.length > 0 ? termsAndConditionsKm : []))
        : (termsAndConditionsKm.length > 0 ? termsAndConditionsKm : (termsAndConditionsEn.length > 0 ? termsAndConditionsEn : [])),
      termsAndConditionsKm: termsAndConditionsKm || [],
      termsAndConditionsEn: termsAndConditionsEn || [],
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
        name: (isEnglishMain ? (guideNameEn || guideNameKm || guideName) : (guideNameKm || guideName || guideNameEn)).trim() || 'Guide Team',
        nameKm: (guideNameKm || guideName || guideNameEn).trim(),
        nameEn: guideNameEn.trim() || undefined,
        title: (isEnglishMain ? (guideTitleEn || guideTitleKm || guideTitle) : (guideTitleKm || guideTitle || guideTitleEn)).trim() || 'Senior Escort',
        titleKm: (guideTitleKm || guideTitle || guideTitleEn).trim(),
        titleEn: guideTitleEn.trim() || undefined,
        phone: guidePhone.trim() || '+855 12 345 678',
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
        guideAgenda: (step.guideAgenda || []).map(g => ({
          ...g,
          activity: (isEnglishMain ? (g.activityEn || g.activity || g.activityKm || '') : (g.activityKm || g.activity || g.activityEn || '')).trim(),
          activityKm: (g.activityKm || g.activity || g.activityEn || '').trim(),
          activityEn: g.activityEn?.trim() || undefined,
          location: (isEnglishMain ? (g.locationEn || g.location || g.locationKm || '') : (g.locationKm || g.location || g.locationEn || '').trim()),
          locationKm: (g.locationKm || g.location || g.locationEn || '').trim(),
          locationEn: g.locationEn?.trim() || undefined
        }))
      })),
      optionalPrograms: optionalPrograms || []
    };
  };

  const currentIdx = studios.findIndex(s => s.id === activeTab);
  const currentStudio = studios[currentIdx] || studios[0];
  const prevStudio = currentIdx > 0 ? studios[currentIdx - 1] : null;
  const nextStudio = currentIdx < studios.length - 1 ? studios[currentIdx + 1] : null;
  const CurrentIcon = currentStudio.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* SUCCESS NOTIFICATION TOAST */}
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl bg-slate-900 text-white border border-emerald-500/50 shadow-2xl flex items-center gap-4 animate-in slide-in-from-top duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 animate-bounce text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <span>Tour Package Updated & Synchronized!</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">Live Sync</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              "{savedPackageTitle}" updated at {savedAtTimestamp}. Cloud Firestore & LocalStorage synced.
            </p>
          </div>
          <button type="button" onClick={() => setShowSuccessToast(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {isEditing ? 'Edit Tour Package & Master Information' : 'Create & Publish New Tour Package'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" /> AI Copilot Enabled
                </span>
                
                {/* Auto-Save Status Badge */}
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" /> Auto-Saving...
                  </span>
                )}
                {autoSaveStatus === 'saved' && lastAutoSavedTime && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" title="Draft saved automatically to local storage">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-Saved {lastAutoSavedTime}
                  </span>
                )}
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

        {/* Modal Main Body Layout: Left Aside Navigation Menu & Right Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* 1. ASIDE MENU STYLE (When navLayoutStyle === 'aside') */}
          {navLayoutStyle === 'aside' && (
            <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 shrink-0 flex flex-col justify-between overflow-y-auto">
              {/* Aside Navigation Items */}
              <div className="p-3 sm:p-4 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Aside Menu
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-mono">
                      7 Studios
                    </span>
                  </div>
                  {/* Quick Style Switcher */}
                  <button
                    type="button"
                    onClick={() => setNavLayoutStyle('tabs')}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Switch to Top Tab Bar Style"
                  >
                    <LayoutList className="w-3 h-3 text-indigo-500" />
                    <span>Tab Style</span>
                  </button>
                </div>

                {/* Aside Search Filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={asideTabSearch}
                    onChange={(e) => setAsideTabSearch(e.target.value)}
                    placeholder="Search studios..."
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {asideTabSearch && (
                    <button
                      type="button"
                      onClick={() => setAsideTabSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Aside Navigation List */}
                <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                  {studios
                    .filter(tab => !asideTabSearch.trim() || tab.label.toLowerCase().includes(asideTabSearch.toLowerCase()) || tab.desc.toLowerCase().includes(asideTabSearch.toLowerCase()))
                    .map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer shrink-0 md:shrink border group relative ${
                          isActive
                            ? 'border-indigo-500/80 bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                            : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate font-black text-xs">{tab.label}</span>
                            {tab.isFilled && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-300' : 'bg-emerald-500'} shrink-0`} title="Studio configured" />
                            )}
                          </div>
                          <div className={`text-[10px] truncate font-normal hidden md:block ${isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            {tab.desc}
                          </div>
                          <div className="mt-1 hidden md:block">
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                              isActive ? 'bg-white/20 text-white border-white/30' : tab.badgeColor
                            }`}>
                              {tab.badge}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Aside Footer Quick Actions & AI Translator */}
              <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-indigo-500" />
                  <span>AI Language Copilot</span>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleTranslateEntirePackage(isEnglishMain ? 'en' : 'km', isEnglishMain ? 'km' : 'en')}
                    disabled={isTranslatingAll}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    title="Translate entire package between EN and KM"
                  >
                    {isTranslatingAll ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[11px]">Translating package...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] truncate">
                          {isEnglishMain ? '✨ AI All: 🇺🇸 EN ➔ 🇰🇭 KM' : '✨ AI All: 🇰🇭 KM ➔ 🇺🇸 EN'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px] truncate">Manage Categories</span>
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* 2. MAIN CONTENT AREA (Supports both Tab Style and Aside Menu Style) */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-900">
            {/* TAB STYLE TOP NAVIGATION BAR (When navLayoutStyle === 'tabs') */}
            {navLayoutStyle === 'tabs' && (
              <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 shrink-0 px-4 py-2.5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <LayoutList className="w-3 h-3 text-indigo-500" />
                      Studio Tabs
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-mono">
                      7 Sections
                    </span>
                  </div>

                  {/* Top Controls: Switch to Aside Menu & Quick Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleTranslateEntirePackage(isEnglishMain ? 'en' : 'km', isEnglishMain ? 'km' : 'en')}
                      disabled={isTranslatingAll}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                      title="Translate entire package between EN and KM"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{isEnglishMain ? 'AI: EN ➔ KM' : 'AI: KM ➔ EN'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCategoryManagerOpen(true)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span>Categories</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNavLayoutStyle('aside')}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Switch to Left Aside Menu Style"
                    >
                      <Columns className="w-3 h-3" />
                      <span>Aside Menu Style</span>
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrolling Tab Pills */}
                <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {studios.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border group relative ${
                          isActive
                            ? 'border-indigo-500/80 bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                            : 'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-950 dark:hover:text-white shadow-2xs'
                        }`}
                      >
                        <div className={`p-1 rounded-lg shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{tab.shortTitle}</span>
                        {tab.isFilled && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-300' : 'bg-emerald-500'} shrink-0`} />
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          #{tab.studioNum}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Scrollable Tab Form Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
              {/* Studio Header Banner & Step Navigation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 dark:from-slate-800/80 dark:via-indigo-950/20 dark:to-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${currentStudio.badgeColor} border shadow-2xs`}>
                    <CurrentIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 font-mono">
                        Studio {currentStudio.studioNum} of 7
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${currentStudio.badgeColor}`}>
                        {currentStudio.badge}
                      </span>
                      {/* Layout Toggle Pill inside Studio Banner */}
                      <button
                        type="button"
                        onClick={() => setNavLayoutStyle(navLayoutStyle === 'aside' ? 'tabs' : 'aside')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        title={`Switch to ${navLayoutStyle === 'aside' ? 'Top Tab Style' : 'Left Aside Menu Style'}`}
                      >
                        {navLayoutStyle === 'aside' ? <LayoutList className="w-2.5 h-2.5 text-indigo-500" /> : <Columns className="w-2.5 h-2.5 text-indigo-500" />}
                        <span>{navLayoutStyle === 'aside' ? 'Switch to Tab Style' : 'Switch to Aside Menu'}</span>
                      </button>
                    </div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white truncate mt-1">
                      {currentStudio.label}
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentStudio.desc}
                    </p>
                  </div>
                </div>

                {/* Step Navigation Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {prevStudio && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(prevStudio.id)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      title={`Previous Studio: ${prevStudio.shortTitle}`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prev:</span>
                      <span>{prevStudio.shortTitle}</span>
                    </button>
                  )}
                  {nextStudio && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(nextStudio.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1 cursor-pointer shadow-xs shadow-indigo-500/20"
                      title={`Next Studio: ${nextStudio.shortTitle}`}
                    >
                      <span className="hidden sm:inline">Next:</span>
                      <span>{nextStudio.shortTitle}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
          
          
              {/* STUDIO SUB-SECTION NAVIGATION CONTROLLER (Controls elements inside active studio) */}
              {currentSubSections.length > 1 && (
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <LayoutList className="w-3 h-3 text-indigo-500" />
                        <span>Section Navigator</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-mono">
                        {currentSubSections.length} Elements
                      </span>
                      {activeSubSection !== 'all' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <span>🎯 Focus Mode Active</span>
                        </span>
                      )}
                    </div>

                    {/* Controller Mode Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                      {/* Toggle between All Sections and Focus Single Section */}
                      <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setInnerViewMode('all');
                            setActiveSubSection('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            innerViewMode === 'all' && activeSubSection === 'all'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Layers className="w-3 h-3" />
                          <span>Show All</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInnerViewMode('focus');
                            if (activeSubSection === 'all' && currentSubSections[0]) {
                              setActiveSubSection(currentSubSections[0].id);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            innerViewMode === 'focus' || activeSubSection !== 'all'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Target className="w-3 h-3" />
                          <span>Focus Mode</span>
                        </button>
                      </div>

                      {/* Toggle Sub-Section Navigation Style (Tabs vs Aside) */}
                      <button
                        type="button"
                        onClick={() => setInnerNavStyle(innerNavStyle === 'tabs' ? 'aside' : 'tabs')}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title={`Switch to ${innerNavStyle === 'tabs' ? 'Sub-Aside Menu Style' : 'Sub-Tabs Style'}`}
                      >
                        {innerNavStyle === 'tabs' ? <Columns className="w-3 h-3 text-indigo-500" /> : <LayoutList className="w-3 h-3 text-indigo-500" />}
                        <span className="hidden sm:inline">{innerNavStyle === 'tabs' ? 'Aside Menu' : 'Top Tabs'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scrolling Pill Tabs for Sub-Sections */}
                  {innerNavStyle === 'tabs' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => {
                          setInnerViewMode('all');
                          setActiveSubSection('all');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                          activeSubSection === 'all'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>All Sections ({currentSubSections.length})</span>
                      </button>

                      {currentSubSections.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = activeSubSection === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSelectSubSection(sub.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border group ${
                              isSubActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-500'}`} />
                            <span>{sub.label}</span>
                            {sub.isFilled && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-emerald-300' : 'bg-emerald-500'} shrink-0`} title="Configured" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Section Aside Layout Container (When innerNavStyle === 'aside') */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {innerNavStyle === 'aside' && currentSubSections.length > 1 && (
                  <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-0 space-y-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {currentStudio.shortTitle} Sections
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {currentSubSections.length}
                        </span>
                      </div>

                      {/* Sub-Section Search Filter */}
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={subSectionSearch}
                          onChange={(e) => setSubSectionSearch(e.target.value)}
                          placeholder="Filter sections..."
                          className="w-full pl-7 pr-6 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {subSectionSearch && (
                          <button
                            type="button"
                            onClick={() => setSubSectionSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* All Sections Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setInnerViewMode('all');
                          setActiveSubSection('all');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                          activeSubSection === 'all'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <div className="min-w-0 flex-1 truncate">
                          <span>Show All Sections</span>
                        </div>
                      </button>

                      {/* Sub-Sections List */}
                      <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-0.5">
                        {currentSubSections
                          .filter(sub => !subSectionSearch.trim() || sub.label.toLowerCase().includes(subSectionSearch.toLowerCase()) || sub.desc.toLowerCase().includes(subSectionSearch.toLowerCase()))
                          .map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = activeSubSection === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => handleSelectSubSection(sub.id)}
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                                  isSubActive
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <div className={`p-1.5 rounded-lg shrink-0 ${isSubActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                  <SubIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate">{sub.label}</span>
                                    {sub.isFilled && (
                                      <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-emerald-300' : 'bg-emerald-500'} shrink-0`} />
                                    )}
                                  </div>
                                  <div className={`text-[10px] truncate font-normal ${isSubActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {sub.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </aside>
                )}

                <div className="flex-1 min-w-0 space-y-6 w-full">

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

              {/* Section 2: Titles & Nomenclature */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Tour Naming & Multilingual Titles
                      </h3>
                      <p className="text-[11px] text-slate-500">Official package title in English and Khmer with AI auto-translation</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Titles: Conditional Order Based on Platform Language */}
                  {isEnglishMain ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                              🇺🇸 EN
                            </span>
                            <span>Tour Title (English / Primary) *</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="e.g. Vietnam Coffee, Tea, Bakery & Franchise B2B Mission"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"Guangzhou Canton Fair 2026 Phase 1 VIP Mission"</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              🇰🇭 KM
                            </span>
                            <span className="font-khmer">ចំណងជើងដំណើរទស្សនកិច្ច (ខ្មែរ / Khmer Secondary)</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium font-khmer focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="ឧទាហរណ៍៖ ដំណើរទស្សនកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                          ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"បេសកកម្មពាណិជ្ជកម្មពិព័រណ៍ក្វាងចូវ Canton Fair 2026"</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              🇰🇭 KM
                            </span>
                            <span className="font-khmer">ចំណងជើងដំណើរទស្សនកិច្ច (ខ្មែរ / Khmer Primary) *</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium font-khmer focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="ឧទាហរណ៍៖ ដំណើរទស្សនកិច្ចពាណិជ្ជកម្មពិសេស: តែ កាហ្វេ ដុតនំ ការលក់រាយ & Franchise"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                          ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"បេសកកម្មពាណិជ្ជកម្មពិព័រណ៍ក្វាងចូវ Canton Fair 2026"</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                              🇺🇸 EN
                            </span>
                            <span>Tour Title (English Title)</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="e.g. Vietnam Coffee, Tea, Bakery & Franchise B2B Mission"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"Guangzhou Canton Fair 2026 Phase 1 VIP Mission"</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 3: Geographic Destination & Country */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Destination Geography & Country
                      </h3>
                      <p className="text-[11px] text-slate-500">City, province, and country localization for filtering and maps</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Destinations: Conditional Order Based on Platform Language */}
                  {isEnglishMain ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                              🇺🇸 EN
                            </span>
                            <span>Destination City / Province (English / Primary) *</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="e.g. Ho Chi Minh City & Phu Quoc Island"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"Guangzhou & Shenzhen"</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              🇰🇭 KM
                            </span>
                            <span className="font-khmer">គោលដៅទីក្រុង/ខេត្ត (ខ្មែរ / Khmer Secondary)</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-khmer focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="ឧទាហរណ៍៖ ហូជីមិញ + កោះត្រល់"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                          ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"ក្វាងចូវ & សិនជិន"</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              🇰🇭 KM
                            </span>
                            <span className="font-khmer">គោលដៅទីក្រុង/ខេត្ត (ខ្មែរ / Primary) *</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-khmer focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="ឧទាហរណ៍៖ ហូជីមិញ + កោះត្រល់"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                          ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"ក្វាងចូវ & សិនជិន"</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                              🇺🇸 EN
                            </span>
                            <span>Destination City (English)</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="e.g. Ho Chi Minh City & Phu Quoc Island"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"Guangzhou & Shenzhen"</span>
                        </p>
                      </div>
                    </>
                  )}

                  {/* Country: Conditional Order Based on Platform Language */}
                  {isEnglishMain ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                              🇺🇸 EN
                            </span>
                            <span>Country (English / Primary) *</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="e.g. Vietnam, Thailand, China, Japan"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"China", "Vietnam", "Thailand"</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              🇰🇭 KM
                            </span>
                            <span className="font-khmer">ប្រទេស (ខ្មែរ / Khmer Secondary)</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-khmer focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="ឧទាហរណ៍៖ វៀតណាម, ប្រទេសថៃ, ចិន"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                          ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"ប្រទេសចិន", "ប្រទេសវៀតណាម", "ប្រទេសថៃ"</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                              🇰🇭 KM
                            </span>
                            <span className="font-khmer">ប្រទេស (ខ្មែរ / Primary) *</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-khmer focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="ឧទាហរណ៍៖ វៀតណាម, ប្រទេសថៃ, ប្រទេសចិន"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                          ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"ប្រទេសចិន", "ប្រទេសវៀតណាម", "ប្រទេសថៃ"</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                              🇺🇸 EN
                            </span>
                            <span>Country (English)</span>
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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="e.g. Vietnam, Thailand, China, Japan"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"China", "Vietnam", "Thailand"</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 4: Classification & Canton Fair Configuration */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Category Classification & Canton Fair Phase
                      </h3>
                      <p className="text-[11px] text-slate-500">Catalog grouping, Canton Fair VIP delegation phase setup</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Primary Package Category *
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
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
                  <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
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
                </div>
              </div>

              {/* Section 5: Commercial Pricing, Duration & Hotel Accommodation */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Commercial Pricing, Duration & Inclusions
                      </h3>
                      <p className="text-[11px] text-slate-500">Retail rates, early bird deals, duration calculations, hotel star rating</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Pricing Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Standard Price ($ USD) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          required
                          min={0}
                          value={priceUSD}
                          onChange={(e) => setPriceUSD(Number(e.target.value))}
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Early Bird Discount Price ($ USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
                        <input
                          type="number"
                          min={0}
                          value={discountPriceUSD || ''}
                          onChange={(e) => setDiscountPriceUSD(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="e.g. 299"
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration & Accommodation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Duration (Nights)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={durationNights}
                        onChange={(e) => setDurationNights(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Hotel Rating
                      </label>
                      <select
                        value={hotelStars}
                        onChange={(e) => setHotelStars(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value={3}>⭐ 3 ផ្កាយ (3-Star Hotel)</option>
                        <option value={4}>⭐⭐ 4 ផ្កាយ (4-Star Premium)</option>
                        <option value={5}>⭐⭐⭐ 5 ផ្កាយ (5-Star Luxury)</option>
                      </select>
                    </div>
                  </div>

                  {/* Flight Included Switch */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Flight Tickets Included
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Package covers round-trip international or domestic economy airfare
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flightIncluded}
                        onChange={(e) => setFlightIncluded(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 6: Available Departure Dates & Schedule */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Available Departure Dates ({availableDates.length} Dates Configured)
                      </h3>
                      <p className="text-[11px] text-slate-500">Select dates when delegations and groups will depart</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <input
                      type="date"
                      value={newDateInput}
                      onChange={(e) => setNewDateInput(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddDepartureDate}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>+ Add Departure Date</span>
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
                          className="text-slate-400 hover:text-rose-500 cursor-pointer text-xs p-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove Date"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {availableDates.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                        ⚠️ No departure dates added. Add at least one date for travelers to book.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 7: Marketing Tags & Social Proof Rating Metrics */}
              <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Marketing Badges & Social Proof
                      </h3>
                      <p className="text-[11px] text-slate-500">Preset tags, custom search tags, rating and booking counts</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Preset Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Preset Promotional Tags
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
                  </div>

                  {/* Custom Tag Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
                      placeholder="Add custom tag (e.g. b2b-expo, trade-mission)..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      + Add Tag
                    </button>
                  </div>

                  {/* Rating & Performance Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Customer Rating (0-5.0)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Verified Review Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={reviewCount}
                        onChange={(e) => setReviewCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Booked This Month
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={bookedThisMonth}
                        onChange={(e) => setBookedThisMonth(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
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
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                            🇺🇸 EN
                          </span>
                          <span>Full Package Overview (English / Primary) *</span>
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
                        placeholder="e.g. Join our exclusive B2B trade mission connecting Cambodian entrepreneurs directly with high-level manufacturers and suppliers..."
                      />
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"Join our exclusive delegation with VIP factory tours and networking events."</span>
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            🇰🇭 KM
                          </span>
                          <span className="font-khmer">សេចក្តីសង្ខេបកញ្ចប់ទស្សនកិច្ច (ខ្មែរ / Khmer Secondary)</span>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed font-khmer"
                        placeholder="ឧទាហរណ៍៖ ចូលរួមដំណើរទស្សនកិច្ចពាណិជ្ជកម្មលំដាប់ខ្ពស់ ដែលភ្ជាប់ទំនាក់ទំនងដោយផ្ទាល់ជាមួយរោងចក្រផលិត..."
                      />
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                        ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"ចូលរួមគណៈប្រតិភូអាជីវកម្មពិសេសជាមួយការទស្សនកិច្ចរោងចក្រ និងកម្មវិធីជំនួបពាណិជ្ជកម្ម B2B។"</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            🇰🇭 KM
                          </span>
                          <span className="font-khmer">សេចក្តីសង្ខេបកញ្ចប់ទស្សនកិច្ច (ខ្មែរ / Primary) *</span>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed font-khmer"
                        placeholder="ឧទាហរណ៍៖ ចូលរួមដំណើរទស្សនកិច្ចពាណិជ្ជកម្មលំដាប់ខ្ពស់ ដែលភ្ជាប់ទំនាក់ទំនងដោយផ្ទាល់ជាមួយរោងចក្រផលិត..."
                      />
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-khmer">
                        ភាសា៖ <span className="font-semibold text-amber-600 dark:text-amber-400">ខ្មែរ (Khmer)</span> • ឧទាហរណ៍៖ <span className="text-slate-600 dark:text-slate-300">"ចូលរួមគណៈប្រតិភូអាជីវកម្មពិសេសជាមួយការទស្សនកិច្ចរោងចក្រ និងកម្មវិធីជំនួបពាណិជ្ជកម្ម B2B។"</span>
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                            🇺🇸 EN
                          </span>
                          <span>Full Package Overview (English Description)</span>
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
                        placeholder="e.g. Join our exclusive B2B trade mission connecting Cambodian entrepreneurs directly with high-level manufacturers and suppliers..."
                      />
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        Language: <span className="font-semibold text-blue-600 dark:text-blue-400">English (EN)</span> • Example: <span className="text-slate-600 dark:text-slate-300">"Join our exclusive delegation with VIP factory tours and networking events."</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* 🎬 Video Gallery & Featured Video (Default Auto-Play) */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
                        <Film className="w-4 h-4" />
                      </span>
                      <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Featured Video & Video Gallery ({videos.length} Videos)
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Set official video tours to <strong>auto-play by default</strong> when delegates open this package (YouTube, Vimeo, or MP4 video URLs).
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800/40">
                    Auto-Play Video Default
                  </span>
                </div>

                {/* Primary Featured Video Quick Input */}
                <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-red-500" />
                      <span>Primary Featured Video URL (Default Player)</span>
                    </label>
                    {featuredVideoUrl && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        ✓ Active Default Video
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={featuredVideoUrl}
                      onChange={(e) => setFeaturedVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/... or https://cdn.site.com/video.mp4"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-800/60 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    {featuredVideoUrl && (
                      <a
                        href={featuredVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-red-700 transition-colors shadow-xs"
                        title="Preview video in new tab"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Test</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Hidden File Input for Video Upload */}
                <input
                  type="file"
                  ref={videoFileInputRef}
                  multiple
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v,video/*,.mp4,.webm,.mov,.m4v,.avi,.mkv"
                  onChange={(e) => handleVideoFilesUpload(e.target.files)}
                  className="hidden"
                />

                {/* Drag and Drop / Click to Upload Video Files Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsVideoDraggingOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsVideoDraggingOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsVideoDraggingOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleVideoFilesUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => videoFileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                    isVideoDraggingOver
                      ? 'border-red-500 bg-red-50/80 dark:bg-red-950/50 scale-[1.01]'
                      : 'border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50/60 dark:hover:bg-red-950/40 hover:border-red-400'
                  }`}
                >
                  {isUploadingVideo ? (
                    <div className="flex flex-col items-center gap-2 text-red-600 dark:text-red-400 py-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-bold">{videoUploadProgress || 'Processing & uploading video...'}</span>
                      <span className="text-[11px] text-slate-400">Extracting thumbnail snapshot and duration</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                          <span>Click to browse video files from device</span>
                          <span className="text-slate-400 font-normal">or drag & drop here</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Supports MP4, WebM, MOV, M4V, AVI (automatically extracts thumbnail snapshot and duration)
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Add Video to Gallery Form (or via URL) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-red-500" />
                    <span>Or Add Video via YouTube / Vimeo / CDN URL</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-5">
                      <input
                        type="url"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="Video URL (YouTube / Vimeo / MP4)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        placeholder="Video Title (e.g. Expo Walkthrough)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={newVideoDuration}
                        onChange={(e) => setNewVideoDuration(e.target.value)}
                        placeholder="Duration (03:45)..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="w-full h-full min-h-[34px] px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                        title="Add Video to List"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Gallery Grid */}
                {videos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {videos.map((vid, idx) => {
                      const isFeatured = vid.url === featuredVideoUrl || vid.isFeatured;
                      return (
                        <div
                          key={vid.id || idx}
                          className={`p-3 rounded-2xl border transition-all space-y-2 relative bg-white dark:bg-slate-800/80 shadow-xs ${
                            isFeatured
                              ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <Film className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span className="truncate">{vid.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {vid.url}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {vid.duration ? `⏱️ ${vid.duration}` : 'Video Clip'}
                            </span>
                            {isFeatured ? (
                              <span className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                                ⭐ Default Play
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetFeaturedVideo(vid.url)}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Image Gallery & Upload Zone */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Tour Package Image Gallery ({images.length} Images)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Upload photos directly from your device or paste image URLs. The first image is used as the primary hero cover.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {images.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Remove all photos from this tour gallery?')) {
                            setImages([]);
                          }
                        }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/40">
                      JPG, PNG, WEBP, AVIF
                    </span>
                  </div>
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
                      <span className="text-xs font-bold">{imageUploadProgress || 'Optimizing & Uploading Photos...'}</span>
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
                      placeholder="Or paste direct image URLs (comma or line separated)..."
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add URL</span>
                  </button>
                </div>

                {/* Image Thumbnails Grid */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {images.map((imgUrl, i) => (
                      <div
                        key={i}
                        className={`relative rounded-2xl overflow-hidden border transition-all aspect-[16/10] bg-slate-100 dark:bg-slate-800 shadow-sm flex flex-col justify-between ${
                          i === 0
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-300'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Photo ${i + 1}`}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />

                        {/* Top Bar Badges & Actions */}
                        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-auto">
                          {i === 0 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-600/90 text-white text-[9px] font-bold shadow-md flex items-center gap-1 backdrop-blur-xs">
                              ⭐ Hero Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetHeroImage(i)}
                              className="px-2 py-0.5 rounded-lg bg-black/70 hover:bg-indigo-600 text-white text-[9px] font-bold transition-all cursor-pointer backdrop-blur-xs shadow-md"
                              title="Make this the primary hero cover image"
                            >
                              ⭐ Set Hero
                            </button>
                          )}

                          <div className="flex items-center gap-1">
                            {i > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(i, 'left')}
                                className="p-1 rounded-lg bg-black/70 hover:bg-indigo-600 text-white text-[10px] transition-all cursor-pointer backdrop-blur-xs shadow-md"
                                title="Move image left"
                              >
                                ◀
                              </button>
                            )}
                            {i < images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(i, 'right')}
                                className="p-1 rounded-lg bg-black/70 hover:bg-indigo-600 text-white text-[10px] transition-all cursor-pointer backdrop-blur-xs shadow-md"
                                title="Move image right"
                              >
                                ▶
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-md"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Info Bar */}
                        <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-between pointer-events-none">
                          <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono backdrop-blur-xs">
                            #{i + 1}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] truncate max-w-[120px] font-mono backdrop-blur-xs">
                            {imgUrl.startsWith('data:') ? 'Local Image' : imgUrl.split('/').pop()?.split('?')[0] || 'Image'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs">
                    No images added yet. Upload photos from your device or paste image URLs above.
                  </div>
                )}
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
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Emergency Contacts Card */}
              {(innerViewMode === 'all' || activeSubSection === 'all' || activeSubSection === 'studio-emergency-hotlines') && (
              <div id="studio-emergency-hotlines" className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs transition-all scroll-mt-20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Official Emergency Hotlines & Consular Support
                    </h3>
                    <p className="text-[11px] text-slate-500">24/7 security lines, emergency dispatch, and diplomatic support for delegates</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Emergency Jurisdiction / Country / City
                    </label>
                    <input
                      type="text"
                      value={emergencyCountry || ''}
                      onChange={(e) => setEmergencyCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500/20"
                      placeholder="e.g. Vietnam (Ho Chi Minh City & Phu Quoc)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Local Police Hotline
                    </label>
                    <input
                      type="text"
                      value={emergencyPolice || ''}
                      onChange={(e) => setEmergencyPolice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500/20"
                      placeholder="e.g. 113"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Ambulance / Medical Emergency
                    </label>
                    <input
                      type="text"
                      value={emergencyAmbulance || ''}
                      onChange={(e) => setEmergencyAmbulance(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500/20"
                      placeholder="e.g. 115"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mission Tourist Helpline / Coordinator Phone
                    </label>
                    <input
                      type="text"
                      value={emergencyHelpline || ''}
                      onChange={(e) => setEmergencyHelpline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-teal-500/20"
                      placeholder="e.g. 060 815 515 (Mr. Tim Vutha)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Royal Embassy / Consulate Support
                    </label>
                    <input
                      type="text"
                      value={emergencyEmbassy || ''}
                      onChange={(e) => setEmergencyEmbassy(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-teal-500/20"
                      placeholder="e.g. +84 28 3829 2751 (Royal Embassy of Cambodia)"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Coordinates & Map Pin Card */}
              {(innerViewMode === 'all' || activeSubSection === 'all' || activeSubSection === 'studio-emergency-location') && (
              <div id="studio-emergency-location" className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-2xs transition-all scroll-mt-20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      GPS Coordinates & Destination Pinning
                    </h3>
                    <p className="text-[11px] text-slate-500">Geographic coordinates and visual map coordinates for tour location display</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              )}
            </div>
          )}

                </div>
              </div>
            </div>

            {/* Sticky Modal Footer Controls */}
            <div className="sticky bottom-0 px-6 py-3.5 sm:py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 z-20 shadow-[0_-8px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_20px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="hidden sm:inline">Real-time sync to Cloud Firestore, Local Storage & Audit Trail</span>
                  <span className="sm:hidden">Auto-syncs to Cloud & Storage</span>
                </div>
                {autoSaveStatus === 'saved' && lastAutoSavedTime && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-mono">
                    💾 Auto-Saved: {lastAutoSavedTime}
                  </span>
                )}
                {autoSaveStatus === 'saving' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 font-mono flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 text-amber-600 animate-spin" /> Auto-Saving...
                  </span>
                )}
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{status === 'draft' ? '🚀 Publish Live (Active)' : isEditing ? 'Save All Package Updates' : 'Publish Tour Package'}</span>
                </button>
              </div>
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
