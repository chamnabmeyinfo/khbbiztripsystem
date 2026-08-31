import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney, convertFromUSD } from '../../services/currencyService';
import { getLocalizedPackage } from '../../utils/packageLocalization';
import {
  X,
  Star,
  Clock,
  Plane,
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Sparkles,
  ArrowRight,
  PhoneCall,
  Utensils,
  Building,
  Compass,
  UserCheck,
  Flag,
  Languages,
  PlusCircle,
  Check,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Download,
  FileText,
  AlertCircle,
  Share2,
  Edit3
} from 'lucide-react';
import { OptionalTourProgram } from '../../types';
import { downloadAgendaHtmlToPdf } from '../../services/agendaExportService';
import { VideoGalleryPlayer } from '../common/VideoGalleryPlayer';

export const PackageDetailModal: React.FC = () => {
  const {
    selectedPackage,
    setSelectedPackage,
    activeModal,
    setActiveModal,
    openPackageSalesPage,
    openPackageEditor,
    currency,
    language,
    t
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedOptionalPrograms, setSelectedOptionalPrograms] = useState<string[]>([]);
  const [expandedDayAgenda, setExpandedDayAgenda] = useState<number | null>(1);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'agenda' | 'guide' | 'options' | 'terms'>('overview');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const rawPkg = selectedPackage;
  const pkg = useMemo(() => rawPkg ? getLocalizedPackage(rawPkg, language) : null, [rawPkg, language]);

  if (activeModal !== 'package_detail' || !selectedPackage || !pkg) return null;

  const currentDepartureDate = selectedDate || pkg.availableDates[0] || '2026-09-15';

  const highlightsList = pkg.highlights || [];
  const inclusionsList = pkg.inclusions || [];
  const exclusionsList = pkg.exclusions || [];
  const termsList = pkg.termsAndConditions || [];
  const whoShouldJoinList = pkg.whoShouldJoin || [];
  const whyShouldJoinList = pkg.whyShouldJoin || [];

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadAgendaHtmlToPdf({
        packageData: rawPkg,
        selectedDate: currentDepartureDate,
        travelerName: 'Valued Business Delegate',
        numberOfAdults: adults,
        selectedOptionalProgramIds: selectedOptionalPrograms,
        language
      });
      setIsDownloadingPdf(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsDownloadingPdf(false);
    }
  };

  const handleOpenPdfPreview = () => {
    setActiveModal('agenda_pdf');
  };
  
  // Tour Guide info (with fallback defaults if package doesn't have custom guide)
  const guide = pkg.tourGuide || {
    name: 'Mr. Tim Vutha & Senior Escort Team',
    title: 'Lead Trade Mission Coordinator & Certified Tour Director',
    phone: '060 815 515',
    telegram: '@VuthaTim',
    languages: ['Khmer', 'English', 'Vietnamese'],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    badgeNumber: 'KHB-TG-2026-08',
    emergencyContact: '+855 60 815 515',
    bio: '12+ years experience directing Southeast Asian B2B trade missions, international expo escorts, and bilateral business matchmaking.',
    briefingMeetingPoint: 'Phnom Penh International Airport - Departure Hall Door 2 / Saigon Hotel Lobby',
    briefingTime: '06:30 AM (Departure Day)'
  };

  // Optional Programs (with domain-relevant fallback programs for trade missions & tour packages)
  const optionalPrograms: OptionalTourProgram[] = pkg.optionalPrograms && pkg.optionalPrograms.length > 0 ? pkg.optionalPrograms : [
    {
      id: 'opt_vip_matchmaking',
      title: language === 'km' ? 'កម្មវិធី B2B VIP Matchmaking & ជំនួបពាណិជ្ជកម្មទល់មុខ' : 'VIP 1-on-1 B2B Matchmaking & Private Dinner',
      description: language === 'km' ? 'ការរៀបចំជំនួបផ្ទាល់ជាមួយម្ចាស់សហគ្រាសក្នុងស្រុក 3-5 ក្រុមហ៊ុន និងអាហារពេលល្ងាចបណ្តាញពាណិជ្ជកម្ម VIP' : 'Pre-arranged 1-on-1 bilateral meetings with 3-5 verified enterprise owners and executive networking banquet.',
      additionalCostUSD: 120,
      durationHours: 3.5,
      recommendedAudience: 'Business Owners & Investors',
      highlights: [
        'Dedicated bilingual translator',
        'Private conference lounge with coffee service',
        'Curated buyer directory & company profiles'
      ],
      includesGuide: true,
      includedMeals: ['VIP Executive Dinner'],
      meetingPoint: 'Hotel Executive Conference Lounge (5:30 PM)'
    },
    {
      id: 'opt_night_market_foodie',
      title: language === 'km' ? 'ដំណើរកម្សាន្តពេលរាត្រី & ភ្លក់រសជាតិម្ហូបតំបន់ល្បីៗ' : 'Cultural Night Explorer & Gourmet Street Tasting',
      description: language === 'km' ? 'ដំណើរទស្សនកិច្ចពេលល្ងាចជាមួយមគ្គុទ្ទេសក៍ទេសចរណ៍ទៅកាន់ផ្សាររាត្រី និងតំបន់ទេសចរណ៍វប្បធម៌ល្បីៗ' : 'Guided evening expedition into iconic cultural landmarks, night markets, and authentic culinary hotspots.',
      additionalCostUSD: 45,
      durationHours: 3,
      recommendedAudience: 'All Travelers & Delegates',
      highlights: [
        'Safe private chauffeured transport',
        'Certified English & Khmer speaking guide',
        'Tasting of 5 traditional specialties'
      ],
      includesGuide: true,
      includedMeals: ['Tasting samples & specialty drinks'],
      meetingPoint: 'Hotel Main Lobby (6:45 PM)'
    },
    {
      id: 'opt_factory_visit',
      title: language === 'km' ? 'ដំណើរចុះពិនិត្យរោងចក្រ & មជ្ឈមណ្ឌលភស្តុភារ Logistics' : 'Industrial Park & Logistics Hub Site Inspection',
      description: language === 'km' ? 'ដំណើរទស្សនកិច្ចផ្ទាល់ទៅកាន់តំបន់សេដ្ឋកិច្ចពិសេស និងរោងចក្រផលិតស្វ័យប្រវត្តិកម្មទំនើប' : 'Exclusive site walkthrough of specialized industrial export zones and automated supply chain logistics hubs.',
      additionalCostUSD: 85,
      durationHours: 4,
      recommendedAudience: 'Importers, Exporters & Manufacturers',
      highlights: [
        'Factory floor briefing by Plant Operations Manager',
        'Logistics tariff & customs clearance guide',
        'Round-trip VIP bus transport'
      ],
      includesGuide: true,
      includedMeals: ['Networking Coffee & Refreshments'],
      meetingPoint: 'Hotel Front Driveway (1:30 PM)'
    }
  ];

  const toggleOptionalProgram = (programId: string) => {
    setSelectedOptionalPrograms(prev =>
      prev.includes(programId) ? prev.filter(id => id !== programId) : [...prev, programId]
    );
  };

  const selectedOptionsTotalUSD = optionalPrograms
    .filter(p => selectedOptionalPrograms.includes(p.id))
    .reduce((sum, p) => sum + (p.additionalCostUSD * adults), 0);

  const unitPriceUSD = pkg.discountPriceUSD || pkg.priceUSD;
  const baseSubtotalUSD = (unitPriceUSD * adults) + (unitPriceUSD * 0.7 * children);
  const subtotalUSD = baseSubtotalUSD + selectedOptionsTotalUSD;
  const taxUSD = Math.round(subtotalUSD * 0.075 * 100) / 100;
  const grandTotalUSD = Math.round((subtotalUSD + taxUSD) * 100) / 100;

  const handleProceedToCheckout = () => {
    // Proceed to checkout modal
    setActiveModal('checkout');
  };

  // Helper to generate default guide agenda for itinerary steps if not populated
  const getStepAgenda = (step: typeof pkg.itinerary[0]) => {
    if (step.guideAgenda && step.guideAgenda.length > 0) {
      return step.guideAgenda;
    }
    const isKm = language === 'km';
    // Fallback professional agenda slots
    return [
      {
        time: '07:00 AM - 08:30 AM',
        activity: isKm ? 'អាហារពេលព្រឹកប៊ូហ្វេអន្តរជាតិ & ការណែនាំពេលព្រឹក' : 'Hotel International Breakfast & Morning Briefing',
        location: step.hotelName || (isKm ? 'ភោជនីយដ្ឋានសណ្ឋាគារ' : 'Hotel Restaurant'),
        type: 'briefing' as const,
        notes: isKm ? 'មគ្គុទ្ទេសក៍ទេសចរណ៍ចែកប័ណ្ណសម្គាល់ខ្លួន និងកាលវិភាគប្រចាំថ្ងៃ' : 'Tour guide distributes entry badges and daily schedule.'
      },
      {
        time: '08:45 AM - 09:15 AM',
        activity: isKm ? 'ជួបជុំប្រតិភូ & ធ្វើដំណើរតាមរថយន្តក្រុង VIP' : 'Assembly & Group VIP Coach Transfer',
        location: isKm ? 'មុខឡប់ប៊ីសណ្ឋាគារ' : 'Hotel Main Lobby Portico',
        type: 'gathering' as const,
        notes: isKm ? 'សូមពាក់ប័ណ្ណសម្គាល់បេសកកម្មផ្លូវការ' : 'Please wear your official mission badge.'
      },
      {
        time: '09:30 AM - 12:30 PM',
        activity: step.title || (isKm ? 'ទស្សនកិច្ចស្តង់ពិព័រណ៍ និងកិច្ចប្រជុំពាណិជ្ជកម្មផ្លូវការ' : 'Official Mission Sessions / Exhibition Walkthrough'),
        location: isKm ? 'មជ្ឈមណ្ឌលពិព័រណ៍ & សន្និបាតធំ' : 'Main Exhibition & Convention Center',
        type: 'exhibition' as const,
        notes: isKm ? 'មគ្គុទ្ទេសក៍ទេសចរណ៍ប្រចាំការនៅស្តង់ព័ត៌មាន KHB សម្រាប់ជំនួយ' : 'Tour guide stationed at KHB info booth for assistance.'
      },
      {
        time: '12:30 PM - 02:00 PM',
        activity: isKm ? 'អាហារថ្ងៃត្រង់ទំនាក់ទំនងបណ្តាញអាជីវកម្ម' : 'Delegation Networking Lunch',
        location: isKm ? 'ភោជនីយដ្ឋានសាល VIP' : 'VIP Hall Restaurant',
        type: 'networking_lunch' as const,
        notes: step.mealsIncluded?.some(m => m.toLowerCase().includes('lunch') || m.includes('ថ្ងៃត្រង់')) ? (isKm ? 'រួមបញ្ចូលក្នុងកញ្ចប់' : 'Included in package') : (isKm ? 'អាហារជម្រើសក្រុម' : 'Optional group meal')
      },
      {
        time: '02:15 PM - 05:30 PM',
        activity: isKm ? 'ជំនួបពាណិជ្ជកម្ម B2B សិក្ខាសាលា & ទស្សនកិច្ចទីតាំងជាក់ស្តែង' : 'B2B Trade Meetings, Industry Workshops & Site Visits',
        location: isKm ? 'មជ្ឈមណ្ឌលសន្និបាត / តំបន់ឧស្សាហកម្ម' : 'Convention Center / Industrial Zone',
        type: 'b2b_meeting' as const,
        notes: isKm ? 'មានអ្នកបកប្រែភាសាជូនដំណើរបម្រើជូនតាមការស្នើសុំ' : 'Translators available upon request.'
      },
      {
        time: '06:00 PM onwards',
        activity: isKm ? 'ត្រឡប់មកសណ្ឋាគារ / កម្មវិធីដំណើរកម្សាន្តពេលរាត្រី & អាហារពេលល្ងាច' : 'Return to Hotel / Optional Evening Tour & Cultural Dinner',
        location: step.hotelName || (isKm ? 'កណ្តាលក្រុង' : 'City Center'),
        type: 'free_time' as const,
        notes: isKm ? 'ពេលសម្រាកផ្ទាល់ខ្លួន ឬចូលរួមកម្មវិធីបន្ថែម' : 'Free evening or join optional tour program.'
      }
    ];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200" id="package-detail-dialog">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full my-auto max-h-[94vh] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            {pkg.isCantonFair && pkg.cantonFairPhase && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider">
                🇨🇳 Canton Fair {pkg.cantonFairPhase}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold">
              {pkg.destination}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{pkg.rating} ({pkg.reviewCount} reviews)</span>
            </div>
            {selectedOptionalPrograms.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <PlusCircle className="w-3 h-3" />
                {selectedOptionalPrograms.length} Optional Tour{selectedOptionalPrograms.length > 1 ? 's' : ''} Added
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Direct Quick Edit Tour Package Button */}
            <button
              onClick={() => {
                openPackageEditor(rawPkg || pkg);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 border border-amber-400/30"
              title={language === 'km' ? 'កែសម្រួលកញ្ចប់ដំណើរកម្សាន្តនេះភ្លាមៗ' : 'Quickly edit this tour package in Package Editor'}
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{language === 'km' ? '✏️ កែប្រែកញ្ចប់' : '✏️ Edit Package'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedPackage(pkg);
                setActiveModal('social_share');
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Get direct social media post link and campaign UTM tracker"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'km' ? '📢 Boost Link' : '📢 Boost Link'}</span>
            </button>

            <button
              onClick={() => {
                openPackageSalesPage(pkg);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Open full dedicated landing sales page"
            >
              <span>🚀 Sales Page</span>
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs for Easy Deep Browsing */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto text-xs font-bold scrollbar-none shrink-0">
          <button
            onClick={() => setActiveDetailTab('overview')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDetailTab === 'overview'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ទិដ្ឋភាពទូទៅ' : 'Package Overview'}</span>
          </button>

          <button
            onClick={() => setActiveDetailTab('agenda')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDetailTab === 'agenda'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'កាលវិភាគ & របៀបវារៈមគ្គុទ្ទេសក៍' : 'Tour Guide Agenda & Schedule'}</span>
            <span className="px-1.5 py-0.2 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full text-[10px]">
              {pkg.durationDays}D
            </span>
          </button>

          <button
            onClick={() => setActiveDetailTab('guide')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDetailTab === 'guide'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'មគ្គុទ្ទេសក៍ & ក្រុមការងារ' : 'Tour Guide & Escort Team'}</span>
          </button>

          <button
            onClick={() => setActiveDetailTab('options')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDetailTab === 'options'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'ជម្រើសកម្មវិធីដំណើរបន្ថែម' : 'Optional Tour Programs'}</span>
            {optionalPrograms.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px]">
                {optionalPrograms.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveDetailTab('terms')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDetailTab === 'terms'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'លក្ខខណ្ឌ & គោលការណ៍' : 'Terms & Conditions'}</span>
            {termsList.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full text-[10px]">
                {termsList.length}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeDetailTab === 'overview' && (
            <>
              {/* Featured Video Tour & Media Gallery (Video Plays by Default) */}
              <VideoGalleryPlayer
                videos={pkg.videos}
                featuredVideoUrl={pkg.featuredVideoUrl}
                images={pkg.images}
                title={pkg.title}
                defaultMode="video"
                aspectRatioClass="aspect-[16/9] sm:aspect-[21/9]"
              />

              {/* Title & Key Meta */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {pkg.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Duration</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {pkg.durationDays} Days / {pkg.durationNights} Nights
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Flights</div>
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                      {pkg.flightIncluded ? 'Flight Credit Included' : 'Ground Package'}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Lodging</div>
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {pkg.hotelStars}-Star Boutique Hotel
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Tour Guide Escort</div>
                    <div className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                      Dedicated KHB Escort
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t('highlights')}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {highlightsList.map((hl, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-sky-50/50 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {hl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who Should Join Section */}
              {whoShouldJoinList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{t('whoShouldJoin')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {whoShouldJoinList.map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 flex items-start gap-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why You Should Join Section */}
              {whyShouldJoinList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('whyShouldJoin')}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {whyShouldJoinList.map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Guide & Agenda Teaser Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/90 border border-sky-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {language === 'km' ? 'មគ្គុទ្ទេសក៍ & កាលវិភាគរៀបរាប់លម្អិត' : 'Certified Tour Guide & Daily Agenda Available'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {guide.name} • {guide.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveDetailTab('agenda')}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'មើលរបៀបវារៈលម្អិត' : 'View Full Agenda'}</span>
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('options')}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'km' ? 'ជម្រើសបន្ថែម' : 'Optional Tours'} ({optionalPrograms.length})</span>
                  </button>
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('inclusions')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {inclusionsList.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>{t('exclusions')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {exclusionsList.map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Terms & Conditions Summary Box */}
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{language === 'km' ? 'លក្ខខណ្ឌ & គោលការណ៍សំខាន់ៗ' : 'Important Terms & Policies'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveDetailTab('terms')}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'km' ? 'មើលលម្អិតទាំងអស់' : 'View All Policies'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {termsList.slice(0, 4).map((term, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-amber-200/80 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: DETAILED TOUR GUIDE AGENDA & SCHEDULE */}
          {activeDetailTab === 'agenda' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sky-600" />
                    <span>{language === 'km' ? 'កាលវិភាគ & របៀបវារៈមគ្គុទ្ទេសក៍ប្រចាំថ្ងៃ' : 'Official Tour Guide Daily Agenda & Timetable'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'km' 
                      ? 'កម្មវិធីលម្អិតពីមួយម៉ោងទៅមួយម៉ោង ទីកន្លែងប្រមូលផ្តុំ និងការណែនាំពីមគ្គុទ្ទេសក៍ទេសចរណ៍' 
                      : 'Hour-by-hour schedule, assembly checkpoints, and designated escort activities for delegates'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {language === 'km' ? 'មគ្គុទ្ទេសក៍អមដំណើរ 24/7' : 'Full Escort Protected'}
                  </span>
                </div>
              </div>

              {/* Assembly & Dispatch Point Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {language === 'km' ? 'ទីតាំង & ម៉ោងប្រមូលផ្តុំទូទៅ (Departure Assembly):' : 'General Assembly & Departure Checkpoint:'}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                      {guide.briefingMeetingPoint} • <span className="font-bold text-amber-700 dark:text-amber-300">{guide.briefingTime}</span>
                    </p>
                  </div>
                </div>
                <a
                  href="tel:060815515"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Guide: 060 815 515</span>
                </a>
              </div>

              {/* PDF Agenda Document Download Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-sky-700/40">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-sky-400">
                      <span>Executive Document • PDF Format</span>
                    </div>
                    <h4 className="text-sm font-black text-white">
                      {language === 'km' ? 'ទាញយករបៀបវារៈផ្លូវការជាឯកសារ PDF (Official PDF Agenda)' : 'Official Tour Agenda & Mission Timetable (PDF)'}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-md">
                      {language === 'km'
                        ? 'មានកាលវិភាគម៉ោងជាក់លាក់ ព័ត៌មានលម្អិតនៃដំណើរទស្សនកិច្ច លេខកូដទំនាក់ទំនងសង្គ្រោះបន្ទាន់ និងមគ្គុទ្ទេសក៍ទេសចរណ៍'
                        : 'Complete document containing all specific timings, checkpoints, hotel lodging, and 24/7 tour director contacts.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleOpenPdfPreview}
                    className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
                  >
                    Preview Document
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    {isDownloadingPdf ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Day-by-Day Accordion with Hour-by-Hour Guide Agenda */}
              <div className="space-y-4">
                {pkg.itinerary.map(step => {
                  const agendaSlots = getStepAgenda(step);
                  const isExpanded = expandedDayAgenda === step.day;

                  return (
                    <div
                      key={step.day}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-850 overflow-hidden shadow-xs transition-all"
                    >
                      {/* Day Header Bar */}
                      <button
                        onClick={() => setExpandedDayAgenda(isExpanded ? null : step.day)}
                        className="w-full p-4 flex items-center justify-between bg-slate-50/75 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                            D{step.day}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                              <span>{language === 'km' ? `ថ្ងៃទី ${step.day}:` : `Day ${step.day}:`} {step.title}</span>
                              {step.hotelName && (
                                <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                  🏨 {step.hotelName}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hidden sm:inline-block">
                            {language === 'km' ? `កាលវិភាគ ${agendaSlots.length} ម៉ោង` : `${agendaSlots.length} Schedule Items`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Day Expanded Schedule */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 space-y-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 animate-in fade-in duration-150">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <strong>{language === 'km' ? 'សេចក្តីសង្ខេប:' : 'Day Summary:'}</strong> {step.description}
                          </p>

                          {/* Hourly Agenda Breakdown */}
                          <div className="space-y-3 pt-1">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-sky-500" />
                              <span>{language === 'km' ? 'កម្មវិធីតាមពេលវេលា & ការណែនាំមគ្គុទ្ទេសក៍' : 'Time-Slot Agenda & Guide Coordination'}</span>
                            </h4>

                            <div className="space-y-2.5 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-sky-200 dark:before:bg-slate-700">
                              {agendaSlots.map((slot, sIdx) => (
                                <div key={sIdx} className="relative flex items-start gap-3 pl-1">
                                  <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-sky-600 text-sky-600 text-[10px] font-bold flex items-center justify-center shrink-0 z-10 shadow-xs">
                                    •
                                  </div>
                                  <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 space-y-1">
                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                      <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded-md">
                                        ⏱️ {slot.time}
                                      </span>
                                      {slot.location && (
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                          <MapPin className="w-3 h-3 text-amber-500" />
                                          {slot.location}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs font-bold text-slate-900 dark:text-white pt-0.5">
                                      {slot.activity}
                                    </div>
                                    {slot.notes && (
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                        💡 {slot.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Meals info */}
                          {step.mealsIncluded && step.mealsIncluded.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40">
                              <Utensils className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold">
                                {language === 'km' ? 'អាហាររួមបញ្ចូល:' : 'Included Catering:'} {step.mealsIncluded.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TOUR GUIDE PROFILE & CONTACT */}
          {activeDetailTab === 'guide' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <img
                    src={guide.photoUrl}
                    alt={guide.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-sky-500/30 shadow-lg shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[11px] font-bold border border-sky-500/30">
                        Badge #{guide.badgeNumber || 'KHB-TG-2026'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                        ✓ Verified Tour Director
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">{guide.name}</h3>
                    <p className="text-xs text-slate-300 font-medium">{guide.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{guide.bio}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/60 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Languages className="w-3 h-3 text-sky-400" />
                      <span>Spoken Languages</span>
                    </div>
                    <div className="font-bold text-white">
                      {guide.languages.join(' • ')}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      <span>Direct Hotline / WhatsApp</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      {guide.phone}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-sky-400" />
                      <span>Telegram Dispatch</span>
                    </div>
                    <a
                      href={`https://t.me/${guide.telegram?.replace('@', '') || 'VuthaTim'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-bold text-sky-400 hover:underline inline-block"
                    >
                      {guide.telegram || '@VuthaTim'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Escort Guarantee & Standards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>{language === 'km' ? 'សេវាបកប្រែ & សម្របសម្រួលពាណិជ្ជកម្ម' : 'Translation & Trade Facilitation'}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Our lead coordinator assists delegates during booth visits, contract signings, and vendor negotiations with local partners.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'km' ? 'សុវត្ថិភាព & ការឆ្លើយតបបន្ទាន់' : 'Emergency & Logistics Security'}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    24-hour on-call assistance for medical coordination, lost passports, itinerary modifications, and airport transfers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPTIONAL TOUR PROGRAMS */}
          {activeDetailTab === 'options' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-600" />
                    <span>{language === 'km' ? 'ជម្រើសកម្មវិធីដំណើរបន្ថែម (Optional Tour Programs)' : 'Add-On Optional Tour Programs'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'km'
                      ? 'ជ្រើសរើសកម្មវិធីបន្ថែមដើម្បីបង្កើនប្រសិទ្ធភាពធុរកិច្ច និងការកម្សាន្តរបស់អ្នក'
                      : 'Customize your mission with targeted VIP B2B matchmaking, industrial site visits, or cultural night tours'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold">
                  {selectedOptionalPrograms.length} Selected
                </span>
              </div>

              {/* Optional Program Cards */}
              <div className="space-y-4">
                {optionalPrograms.map(program => {
                  const isSelected = selectedOptionalPrograms.includes(program.id);

                  return (
                    <div
                      key={program.id}
                      onClick={() => toggleOptionalProgram(program.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                              ⏱️ {program.durationHours} Hours
                            </span>
                            {program.recommendedAudience && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                                🎯 {program.recommendedAudience}
                              </span>
                            )}
                            {program.includesGuide && (
                              <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold">
                                🧑‍💼 Guide Accompanied
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {program.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {program.description}
                          </p>
                        </div>

                        {/* Price & Toggle Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Per Delegate</div>
                            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              +{formatMoney(program.additionalCostUSD, currency, language)}
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>{language === 'km' ? 'បានជ្រើសរើស' : 'Selected'}</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>{language === 'km' ? 'បន្ថែមកម្មវិធីនេះ' : 'Add to Package'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Highlights & Inclusions */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {program.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedOptionalPrograms.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedOptionalPrograms.length} Optional Program(s) Added for {adults} Delegate(s)
                    </span>
                  </div>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                    +{formatMoney(selectedOptionsTotalUSD, currency, language)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TERMS & CONDITIONS */}
          {activeDetailTab === 'terms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span>{language === 'km' ? 'លក្ខខណ្ឌ & គោលការណ៍ដំណើរបេសកកម្ម' : 'Tour Package Terms, Conditions & Policies'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'km'
                      ? 'ព័ត៌មានលម្អិតអំពីលក្ខខណ្ឌលិខិតឆ្លងដែន ការតម្កល់ប្រាក់កក់ ការទូទាត់ និងគោលការណ៍បង្វិលសង'
                      : 'Comprehensive registration requirements, deposit schedule, passport validity, and cancellation policies.'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'កិច្ចសន្យាផ្លូវការ' : 'Official Agreement'}</span>
                </span>
              </div>

              {/* Policy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                    <span>{language === 'km' ? '១. លក្ខខណ្ឌឯកសារ & លិខិតឆ្លងដែន' : '1. Travel Documents & Passport'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'km'
                      ? 'គណៈប្រតិភូ និងអ្នករួមដំណើរទាំងអស់ត្រូវមានលិខិតឆ្លងដែន (Passport) ដែលមានសុពលភាពយ៉ាងតិច ៦ ខែ គិតចាប់ពីថ្ងៃចេញដំណើរ។ ក្រុមហ៊ុន KHB ជួយសម្រួលបែបបទឆ្លងដែន Fast-Track ដោយផ្ទាល់។'
                      : 'All participating delegates must hold an international passport valid for at least 6 months from the departure date. KHB facilitates fast-track border clearance.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'km' ? '២. កាលវិភាគបង់ប្រាក់ & ប្រាក់កក់' : '2. Deposit & Payment Schedule'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'km'
                      ? 'តម្កល់ប្រាក់កក់ 50% នៃតម្លៃសរុបពេលចុះឈ្មោះដើម្បីធានាកន្លែង សណ្ឋាគារ ៤ ផ្កាយ និងសំបុត្រយន្តហោះ/កប៉ាល់។ ប្រាក់នៅសល់ 50% ត្រូវទូទាត់បង្គ្រប់យ៉ាងតិច ៧ ថ្ងៃមុនចេញដំណើរ។'
                      : 'A 50% deposit is required at booking to lock in early-bird rates, 4-star lodging, and flight reservations. Remaining balance is due 7 days prior to departure.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>{language === 'km' ? '៣. គោលការណ៍លុបចោល & បង្វិលប្រាក់' : '3. Cancellation & Refund Policy'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'km'
                      ? 'លុបចោលមុន ១៥ ថ្ងៃ ទទួលបានការបង្វិលសង 70%។ លុបចោលចន្លោះពី ៨ ដល់ ១៤ ថ្ងៃ ទទួលបាន 30%។ ការលុបចោលក្រោម ៧ ថ្ងៃ ឬអវត្តមានពេលចេញដំណើរ មិនអាចបង្វិលប្រាក់បានទេ។'
                      : 'Cancellation 15+ days prior receives 70% refund. 8-14 days prior receives 30%. Cancellations within 7 days or no-shows are strictly non-refundable.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    <span>{language === 'km' ? '៤. ការទទួលខុសត្រូវ & ប្រធានសក្តិ' : '4. Force Majeure & Protocol'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'km'
                      ? 'ក្រុមហ៊ុនសូមរក្សាសិទ្ធិកែសម្រួលកាលវិភាគ ឬសណ្ឋាគារក្នុងកម្រិតស្មើគ្នា ករណីមានប្រធានសក្តិ ស្ថានភាពអាកាសធាតុ ឬការប្រែប្រួលពីអ្នករៀបចំពិព័រណ៍អន្តរជាតិ។'
                      : 'KHB reserves the right to adjust schedules, flights, or lodging to equivalent 4-star standards in case of weather anomalies, border authorities, or force majeure.'}
                  </p>
                </div>
              </div>

              {/* Complete Itemized List */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'km' ? 'បញ្ជីលក្ខខណ្ឌលម្អិតទាំងអស់ (Itemized Policy Ledger)' : 'Itemized Package Policy Ledger'}
                </h4>
                <div className="space-y-2">
                  {termsList.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trade Mission Coordinator & Official Exhibitions Links (Footer of body) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 border border-amber-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs">
                  ℹ️ {language === 'km' ? 'ព័ត៌មានបន្ថែម & ការចុះឈ្មោះ' : 'Trade Mission Coordinator & Registration'}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ⭐ Mr. Tim Vutha: <span className="font-mono text-emerald-600 dark:text-emerald-400">060 815 515</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <a
                href="https://www.eventseye.com/fairs/f-coffee-expo-vietnam-24863-1.html"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-between font-semibold"
              >
                <span>☕ Coffee Expo Vietnam</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.eventseye.com/fairs/f-vietnam-international-coffee-tea-bakery-31109-1.html"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-between font-semibold"
              >
                <span>🥖 Coffee-Tea-Bakery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.eventseye.com/fairs/f-vietrf-vietnam-international-retailtech-franchise-show-31119-1.html"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-between font-semibold"
              >
                <span>🏢 VIETRF Franchise Show</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {language === 'km' ? '🫵 ឈប់ទទួលចុះឈ្មោះត្រឹមថ្ងៃទី 15/9/2026 (កំណត់ 30 នាក់)' : '🫵 Registration Deadline: September 15, 2026 (Capped at 30 Delegates)'}
              </span>
              <a
                href="https://t.me/VuthaTim"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors"
              >
                <span>Telegram: @VuthaTim</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Emergency Assistance Info */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Local Emergency & Assistance ({pkg.emergencyContact.country})
                </div>
                <div className="text-[11px] text-slate-500">
                  Police: {pkg.emergencyContact.police} | Ambulance: {pkg.emergencyContact.ambulance} | Coordinator: {pkg.emergencyContact.touristHelpline}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Booking Footer Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
            {/* Departure date pill */}
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase">
                Departure Date
              </label>
              <select
                value={currentDepartureDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {pkg.availableDates.map(d => (
                  <option key={d} value={d}>
                    {d} (Confirmed)
                  </option>
                ))}
              </select>
            </div>

            {/* Price Preview */}
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Total ({adults} Adults {selectedOptionalPrograms.length > 0 ? `+ ${selectedOptionalPrograms.length} Add-Ons` : ''})
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {formatMoney(grandTotalUSD, currency, language)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                openPackageEditor(rawPkg || pkg);
              }}
              className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title={language === 'km' ? 'កែសម្រួលកញ្ចប់ដំណើរកម្សាន្តនេះ' : 'Direct Edit Tour Package'}
            >
              <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
              <span>{language === 'km' ? '✏️ កែប្រែកញ្ចប់' : '✏️ Edit Package'}</span>
            </button>

            <button
              onClick={handleProceedToCheckout}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('proceedToPayment')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

