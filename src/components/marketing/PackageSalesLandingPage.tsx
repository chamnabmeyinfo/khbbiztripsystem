import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currencyService';
import { DynamicHead } from '../common/DynamicHead';
import {
  ArrowLeft,
  Share2,
  Check,
  Star,
  Clock,
  MapPin,
  Building,
  Utensils,
  Plane,
  ShieldCheck,
  Calendar,
  Sparkles,
  Phone,
  Send,
  Download,
  AlertCircle,
  CheckCircle2,
  Flame,
  FileText,
  BadgeCheck,
  Globe,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Tag,
  CreditCard,
  Users,
  Compass,
  Briefcase,
  Gift
} from 'lucide-react';
import { VideoGalleryPlayer } from '../common/VideoGalleryPlayer';

export const PackageSalesLandingPage: React.FC = () => {
  const {
    selectedPackage,
    packages,
    setSelectedPackage,
    setActiveView,
    setActiveModal,
    currency,
    language,
    t
  } = useApp();

  // Fallback to first package if none selected
  const pkg = selectedPackage || packages[0];

  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<string>(
    pkg?.availableDates?.[0] || '2026-10-29'
  );
  const [selectedOptionalProgramIds, setSelectedOptionalProgramIds] = useState<string[]>([]);
  const [activeDayTab, setActiveDayTab] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!pkg) {
    return (
      <div className="min-h-screen py-24 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-slate-500">No tour package selected.</p>
          <button
            onClick={() => setActiveView('marketing')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Back to All Missions
          </button>
        </div>
      </div>
    );
  }

  const highlightsList = (language === 'km' && pkg.highlightsKm && pkg.highlightsKm.length > 0)
    ? pkg.highlightsKm
    : (language !== 'km' && pkg.highlightsEn && pkg.highlightsEn.length > 0
        ? pkg.highlightsEn
        : (pkg.highlights || []));

  const whoShouldJoinList = (language === 'km' && pkg.whoShouldJoinKm && pkg.whoShouldJoinKm.length > 0)
    ? pkg.whoShouldJoinKm
    : (language !== 'km' && pkg.whoShouldJoinEn && pkg.whoShouldJoinEn.length > 0
        ? pkg.whoShouldJoinEn
        : (pkg.whoShouldJoin && pkg.whoShouldJoin.length > 0
            ? pkg.whoShouldJoin
            : [
                language === 'km' ? 'ម្ចាស់ហាងកាហ្វេ ម្ចាស់ហាងនំ Bakery និងភោជនីយដ្ឋាន ដែលចង់ស្វែងរកប្រភពទំនិញបោះដុំផ្ទាល់ពីរោងចក្រ' : 'Coffee shop, bakery, and F&B restaurant owners seeking direct factory-wholesale pricing and suppliers',
                language === 'km' ? 'សហគ្រិន និងអ្នកវិនិយោគដែលចង់ទិញសិទ្ធិអាជីវកម្ម (Franchise) មកបើកដំណើរការនៅកម្ពុជា' : 'Entrepreneurs & investors looking to license proven international F&B franchise brands for Cambodia',
                language === 'km' ? 'អ្នកនាំចូល និងចែកចាយ (Importers & Wholesalers) សម្ភារៈ គ្រឿងផ្សំ និងឧបករណ៍ឧស្សាហកម្មម្ហូបអាហារ' : 'Importers & commercial distributors of raw bakery ingredients, packaging, and commercial food equipment'
              ]));

  const whyShouldJoinList = (language === 'km' && pkg.whyShouldJoinKm && pkg.whyShouldJoinKm.length > 0)
    ? pkg.whyShouldJoinKm
    : (language !== 'km' && pkg.whyShouldJoinEn && pkg.whyShouldJoinEn.length > 0
        ? pkg.whyShouldJoinEn
        : (pkg.whyShouldJoin && pkg.whyShouldJoin.length > 0
            ? pkg.whyShouldJoin
            : [
                language === 'km' ? 'ទទួលបានតម្លៃដើមផ្ទាល់ពីរោងចក្រផលិត (Factory-Direct Wholesale Pricing) ដោយគ្មានឈ្មួញកណ្តាល' : 'Acquire direct factory-gate wholesale pricing without broker markups and middleman fees',
                language === 'km' ? 'ជួបពិភាក្សា និងចរចាផ្ទាល់ជាមួយដៃគូផ្គត់ផ្គង់ និងម្ចាស់ប្រេនល្បីៗជាង ១,០០០ ក្រុមហ៊ុន' : 'Meet and negotiate in person with 1,000+ top verified international manufacturers and brand owners',
                language === 'km' ? 'សេវាសម្រួលបែបបទឆ្លងដែន VIP Fast-Track និងការស្នាក់នៅសណ្ឋាគារលំដាប់ ៤ ផ្កាយប្រណិត' : 'Enjoy seamless VIP Fast-Track border clearance, 4-star luxury accommodation, and dedicated translators'
              ]));

  const inclusionsList = (language === 'km' && pkg.inclusionsKm && pkg.inclusionsKm.length > 0)
    ? pkg.inclusionsKm
    : (language !== 'km' && pkg.inclusionsEn && pkg.inclusionsEn.length > 0
        ? pkg.inclusionsEn
        : (pkg.inclusions || []));

  const exclusionsList = (language === 'km' && pkg.exclusionsKm && pkg.exclusionsKm.length > 0)
    ? pkg.exclusionsKm
    : (language !== 'km' && pkg.exclusionsEn && pkg.exclusionsEn.length > 0
        ? pkg.exclusionsEn
        : (pkg.exclusions || []));

  const termsList = (language === 'km' && pkg.termsAndConditionsKm && pkg.termsAndConditionsKm.length > 0)
    ? pkg.termsAndConditionsKm
    : (language !== 'km' && pkg.termsAndConditionsEn && pkg.termsAndConditionsEn.length > 0
        ? pkg.termsAndConditionsEn
        : (pkg.termsAndConditions || []));

  // Price calculations
  const basePrice = pkg.discountPriceUSD || pkg.priceUSD;
  const originalPrice = pkg.priceUSD;
  const hasDiscount = pkg.discountPriceUSD && pkg.discountPriceUSD < pkg.priceUSD;
  const discountSavings = hasDiscount ? originalPrice - (pkg.discountPriceUSD || 0) : 0;

  // Optional programs total
  const optionalAddonsTotal = useMemo(() => {
    return (pkg.optionalPrograms || [])
      .filter(p => selectedOptionalProgramIds.includes(p.id))
      .reduce((sum, p) => sum + p.additionalCostUSD, 0);
  }, [pkg.optionalPrograms, selectedOptionalProgramIds]);

  const totalCalculatedPrice = basePrice + optionalAddonsTotal;

  const handleToggleOptionalProgram = (programId: string) => {
    if (selectedOptionalProgramIds.includes(programId)) {
      setSelectedOptionalProgramIds(selectedOptionalProgramIds.filter(id => id !== programId));
    } else {
      setSelectedOptionalProgramIds([...selectedOptionalProgramIds, programId]);
    }
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#package/${pkg.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleProceedToCheckout = () => {
    setSelectedPackage(pkg);
    setActiveModal('checkout');
  };

  const handleOpenPdfAgenda = () => {
    setSelectedPackage(pkg);
    setActiveModal('agenda_pdf');
  };

  const images = pkg.images && pkg.images.length > 0
    ? pkg.images
    : ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80'];

  const displayTitle = language === 'km' && pkg.titleKm ? pkg.titleKm : pkg.title;
  const displayDestination = language === 'km' && pkg.destinationKm ? pkg.destinationKm : pkg.destination;
  const displayDescription = language === 'km' && pkg.descriptionKm ? pkg.descriptionKm : pkg.description;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Dynamic SEO Meta Tags */}
      <DynamicHead customPackage={pkg} />

      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <nav className="sticky top-18 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => setActiveView('marketing')}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'km' ? 'ត្រឡប់ទៅកម្មវិធីទាំងអស់' : 'All Trade Delegations'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              title="Copy landing page share link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenPdfAgenda}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Dossier</span>
            </button>

            <button
              onClick={handleProceedToCheckout}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'កក់កៅអីឥឡូវនេះ' : 'Book Mission'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Early Bird Limited Banner ─────────────────────────────────────── */}
      {hasDiscount && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white text-xs py-2 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-white/20">
                <Flame className="w-4 h-4 fill-white" />
              </span>
              <span className="font-extrabold tracking-wide uppercase">
                {language === 'km'
                  ? `⚡ ការបញ្ចុះតម្លៃពិសេស Early Bird សន្សំបាន ${formatMoney(discountSavings, currency, language)} ក្នុងមួយកៅអី!`
                  : `⚡ Official Early Bird Special: Save ${formatMoney(discountSavings, currency, language)} Per Delegate!`}
              </span>
            </div>
            <span className="hidden md:inline text-[11px] font-bold bg-black/20 px-2.5 py-0.5 rounded-full">
              Limited VIP Seats Remaining
            </span>
          </div>
        </div>
      )}

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Visual Media Gallery + Delegate Registration Fee */}
          <div className="lg:col-span-7 space-y-6">
            {/* Featured Video Tour & Media Gallery (Auto-Plays Video by Default) */}
            <VideoGalleryPlayer
              videos={pkg.videos}
              featuredVideoUrl={pkg.featuredVideoUrl}
              images={images}
              title={displayTitle}
              defaultMode="video"
              aspectRatioClass="aspect-[16/10] sm:aspect-[16/9]"
            />

            {/* ── Delegate Registration Fee & Instant Checkout Box (Under Gallery) ── */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white shadow-2xl border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-extrabold block">
                    {language === 'km' ? 'តម្លៃចុះឈ្មោះគណៈប្រតិភូ (Delegate Registration Fee)' : 'Delegate Registration Fee'}
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                      {formatMoney(totalCalculatedPrice, currency, language)}
                    </span>
                    {hasDiscount && (
                      <span className="text-base line-through text-slate-400 font-mono">
                        {formatMoney(originalPrice + optionalAddonsTotal, currency, language)}
                      </span>
                    )}
                    <span className="text-xs text-slate-300 font-medium">/ delegate</span>
                  </div>
                </div>

                {hasDiscount && (
                  <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>Save {formatMoney(discountSavings, currency, language)}</span>
                  </span>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Standard Delegate Seat:</span>
                  <span className="font-mono font-bold text-white">{formatMoney(basePrice, currency, language)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-slate-300">Optional VIP Add-ons:</span>
                  <span className="font-mono font-bold text-indigo-300">
                    {optionalAddonsTotal > 0 ? `+${formatMoney(optionalAddonsTotal, currency, language)}` : '$0.00'}
                  </span>
                </div>
              </div>

              {/* Included Benefits Quick Check */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>VIP Flights & Transit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pkg.hotelStars}-Star Hotel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>B2B Badges Included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Official VAT Invoice</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="sm:col-span-7 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400 hover:from-indigo-600 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-indigo-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{language === 'km' ? 'កក់កៅអីឥឡូវនេះ (Book Now)' : 'Reserve Delegate Seat Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPdfAgenda}
                  className="sm:col-span-5 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-sky-300" />
                  <span>{language === 'km' ? 'ទាញយក Dossier PDF' : 'Download PDF Dossier'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant confirmation & guaranteed departure</span>
                </span>
                <span className="font-mono text-slate-500">Departure: 📅 {selectedDepartureDate}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Pitch, Canton Fair, Details & Date Selection */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{pkg.category || 'B2B Business Expedition'}</span>
                </div>
                {pkg.isCantonFair && pkg.cantonFairPhase && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                    <span>🇨🇳 Canton Fair {pkg.cantonFairPhase}</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {displayTitle}
              </h1>

              {/* Canton Fair Phase 1, 2, 3 Switcher if Canton Fair Package */}
              {pkg.isCantonFair && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-red-900 dark:text-red-300">
                    <span className="flex items-center gap-1.5">
                      <span>🇨🇳</span>
                      <span>{language === 'km' ? 'ជ្រើសរើសវគ្គ Canton Fair (Phase 1, 2, 3):' : 'Select Canton Fair Phase (1, 2, 3):'}</span>
                    </span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-full font-extrabold">
                      Pazhou Complex
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { phase: 'Phase 1', label: 'Phase 1', sub: 'Electronics & Machinery', pkgId: 'pkg_canton_fair_phase_1_2026' },
                      { phase: 'Phase 2', label: 'Phase 2', sub: 'Home & Consumer Goods', pkgId: 'pkg_canton_fair_phase_2_2026' },
                      { phase: 'Phase 3', label: 'Phase 3', sub: 'Textiles & Medical/Food', pkgId: 'pkg_canton_fair_phase_3_2026' }
                    ].map(item => {
                      const isActive = pkg.cantonFairPhase === item.phase;
                      const targetPkg = packages.find(p => p.id === item.pkgId || (p.isCantonFair && p.cantonFairPhase === item.phase));
                      return (
                        <button
                          key={item.phase}
                          type="button"
                          onClick={() => {
                            if (targetPkg) {
                              setSelectedPackage(targetPkg);
                            }
                          }}
                          className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-red-100/50 dark:hover:bg-red-950/50 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="text-xs font-black flex items-center justify-between">
                            <span>{item.label}</span>
                            {isActive && <Check className="w-3 h-3" />}
                          </div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {item.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {displayDescription}
              </p>
            </div>

            {/* Value Highlights Pill Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
                  <span className="text-[11px] text-slate-400">Comprehensive schedule</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">{pkg.hotelStars}-Star Hotel</span>
                  <span className="text-[11px] text-slate-400">Executive accommodations</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">VIP Transit</span>
                  <span className="text-[11px] text-slate-400">Border Fast-Track</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">KHB Guaranteed</span>
                  <span className="text-[11px] text-slate-400">100% Verified Mission</span>
                </div>
              </div>
            </div>

            {/* Departure Date Selection */}
            {pkg.availableDates && pkg.availableDates.length > 0 && (
              <div className="space-y-2.5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Select Mission Departure Date:</span>
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {selectedDepartureDate}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {pkg.availableDates.map((dateStr, dIdx) => (
                    <button
                      key={dIdx}
                      type="button"
                      onClick={() => setSelectedDepartureDate(dateStr)}
                      className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer text-center ${
                        selectedDepartureDate === dateStr
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      📅 {dateStr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mission Key Logistics & Inclusions Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-indigo-600" />
                  <span>Executive Delegate Inclusions</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  All-Inclusive
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-500">✓</span>
                  <span>Direct Airport Transfers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-500">✓</span>
                  <span>Full Trade Expo Passes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-500">✓</span>
                  <span>Official Business Translators</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-500">✓</span>
                  <span>B2B Factory Direct Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Sourcing & Trade Mission Highlights ─────────────────────────── */}
      {highlightsList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {language === 'km' ? 'គោលបំណងសំខាន់នៃបេសកកម្មពាណិជ្ជកម្ម' : 'Key Sourcing & Mission Objectives'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct commercial matchmaking, wholesale procurement, and business growth benefits.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {highlightsList.map((hl, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-start gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {hl}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Who Should Join & Why You Should Join Sections ─────────────────────── */}
      {(whoShouldJoinList.length > 0 || whyShouldJoinList.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Who Should Join */}
            {whoShouldJoinList.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {language === 'km' ? 'អ្នកណាខ្លះគួរចូលរួម? (Who Should Join?)' : 'Who Should Join This Mission?'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Target delegate profiles and executive enterprise participants.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {whoShouldJoinList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/50 border border-indigo-100/60 dark:border-slate-700/60 flex items-start gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why You Should Join */}
            {whyShouldJoinList.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {language === 'km' ? 'ហេតុអ្វីអ្នកគួរចូលរួម? (Why You Should Join)' : 'Why You Should Join'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Direct factory pricing, exclusive networking, and measurable ROI.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {whyShouldJoinList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-slate-800/50 border border-emerald-100/60 dark:border-slate-700/60 flex items-start gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Day-by-Day Agenda & Timeline ──────────────────────────────────── */}
      {pkg.itinerary && pkg.itinerary.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 text-xs font-bold mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Official Expedition Schedule</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {language === 'km' ? 'កាលវិភាគលម្អិតប្រចាំថ្ងៃ' : 'Day-by-Day Expedition Schedule'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive hour-by-hour itinerary with verified assembly checkpoints and VIP logistics.
                </p>
              </div>

              {/* Day Tabs Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {pkg.itinerary.map((day, dIdx) => (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => setActiveDayTab(dIdx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeDayTab === dIdx
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Day Detail Card */}
            {pkg.itinerary[activeDayTab] && (() => {
              const currentDay = pkg.itinerary[activeDayTab];
              return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-mono font-black text-sm flex items-center justify-center shadow-md">
                        D{currentDay.day}
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {currentDay.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {currentDay.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {currentDay.hotelName && (
                        <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-1.5">
                          🏨 {currentDay.hotelName}
                        </span>
                      )}
                      {currentDay.mealsIncluded && currentDay.mealsIncluded.length > 0 && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-1.5">
                          🍽️ {currentDay.mealsIncluded.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assembly Point & Time Strip */}
                  {(currentDay.assemblyPoint || currentDay.assemblyTime) && (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Assembly Point: {currentDay.assemblyPoint || 'Designated Hotel Portico'}</span>
                      </div>
                      {currentDay.assemblyTime && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-bold text-[11px] self-start sm:self-auto">
                          🕒 Assembly Time: {currentDay.assemblyTime}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hourly Agenda Slots */}
                  {currentDay.guideAgenda && currentDay.guideAgenda.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Hour-by-Hour Escort Timeline ({currentDay.guideAgenda.length} Slots)
                      </h4>
                      <div className="space-y-2.5">
                        {currentDay.guideAgenda.map((slot, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                  {slot.activity}
                                </span>
                                {slot.notes && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    💡 {slot.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-auto">
                              {slot.location && (
                                <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{slot.location}</span>
                                </span>
                              )}
                              <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-[11px]">
                                {slot.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* ── Lead Tour Director & Escort Profile ────────────────────────────── */}
      {pkg.tourGuide && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 shadow-xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
                <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-indigo-500/30 shadow-2xl bg-slate-800">
                  <img
                    src={
                      pkg.tourGuide.photoUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={pkg.tourGuide.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-white">{pkg.tourGuide.name}</h3>
                  <p className="text-xs text-indigo-300 font-medium">{pkg.tourGuide.title || 'Lead Trade Mission Director'}</p>
                  {pkg.tourGuide.badgeNumber && (
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                      Badge: {pkg.tourGuide.badgeNumber}
                    </span>
                  )}
                </div>

                {/* Spoken Languages */}
                {pkg.tourGuide.languages && pkg.tourGuide.languages.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {pkg.tourGuide.languages.map((lang, lIdx) => (
                      <span
                        key={lIdx}
                        className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-slate-300"
                      >
                        🗣️ {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Official KHB Escort & Briefing Coordinator</span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    Direct Coordinator & Logistics Support
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {pkg.tourGuide.bio ||
                      'Mr. Tim Vutha and our senior operations escort team coordinate direct VIP fast-track border crossing, hotel check-in, language translation, and high-level B2B matchmaking meetings throughout the entire trip.'}
                  </p>
                </div>

                {/* Briefing Schedule */}
                {(pkg.tourGuide.briefingMeetingPoint || pkg.tourGuide.briefingTime) && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      Departure Briefing Protocol:
                    </span>
                    <p className="text-slate-300 text-xs">
                      📍 {pkg.tourGuide.briefingMeetingPoint || 'KHB Head Office Departure Bay'}
                    </p>
                    <p className="text-slate-400 text-xs font-mono">
                      🕒 {pkg.tourGuide.briefingTime || '06:00 AM Departure Day'}
                    </p>
                  </div>
                )}

                {/* Direct Action Contacts */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {pkg.tourGuide.phone && (
                    <a
                      href={`tel:${pkg.tourGuide.phone}`}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {pkg.tourGuide.phone}</span>
                    </a>
                  )}
                  {pkg.tourGuide.telegram && (
                    <a
                      href={`https://t.me/${pkg.tourGuide.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram Direct Chat</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── VIP Optional Add-On Programs ──────────────────────────────────── */}
      {pkg.optionalPrograms && pkg.optionalPrograms.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
                <Gift className="w-3.5 h-3.5" />
                <span>Custom Executive Upgrades</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {language === 'km' ? 'កម្មវិធីបន្ថែមពិសេស (VIP Optional Programs)' : 'VIP Optional Add-On Programs'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select high-value optional activities to customize your trade mission experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pkg.optionalPrograms.map((prog, pIdx) => {
                const isSelected = selectedOptionalProgramIds.includes(prog.id);
                return (
                  <div
                    key={pIdx}
                    onClick={() => handleToggleOptionalProgram(prog.id)}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {prog.title}
                        </h4>
                        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs shrink-0 shadow-xs">
                          +{formatMoney(prog.additionalCostUSD, currency, language)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {prog.description}
                      </p>
                    </div>

                    {prog.highlights && prog.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prog.highlights.map((h, hIdx) => (
                          <span
                            key={hIdx}
                            className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        ⏱️ {prog.durationHours} Hours • {prog.recommendedAudience || 'All Delegates'}
                      </span>
                      <span
                        className={`font-bold flex items-center gap-1 text-xs ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : '+ Add to Package'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Included vs Excluded Benefits ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inclusions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-200/60 dark:border-emerald-950 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base sm:text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <h3>{language === 'km' ? 'អត្ថប្រយោជន៍រួមបញ្ចូល (What’s Included)' : 'What’s Included in Mission'}</h3>
            </div>
            <div className="space-y-2.5">
              {inclusionsList.map((inc, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-200/60 dark:border-rose-950 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-base sm:text-lg">
              <AlertCircle className="w-5 h-5" />
              <h3>{language === 'km' ? 'មិនរាប់បញ្ចូល (Exclusions)' : 'Not Included in Package'}</h3>
            </div>
            <div className="space-y-2.5">
              {exclusionsList.map((exc, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{exc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Terms, Policies & Conditions ───────────────────────────────────── */}
      {termsList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {language === 'km' ? 'លក្ខខណ្ឌ និងគោលការណ៍ចូលរួម' : 'Reservation Policies & Terms'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Essential passport validity rules, payment milestones, cancellation terms, and delegate code of conduct.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {termsList.map((term, tIdx) => (
                <div
                  key={tIdx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {tIdx + 1}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {term}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Emergency Contacts & Consular Assurance ────────────────────────── */}
      {pkg.emergencyContact && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Emergency Jurisdiction</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{pkg.emergencyContact.country}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">24/7 Tourist Helpline</span>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{pkg.emergencyContact.touristHelpline}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Royal Embassy / Consulate</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{pkg.emergencyContact.embassySupport}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Sticky Conversion Bottom Bar ───────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                {language === 'km' ? 'តម្លៃវិនិយោគសរុប' : 'Total Delegate Investment'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {formatMoney(totalCalculatedPrice, currency, language)}
                </span>
                {hasDiscount && (
                  <span className="text-xs line-through text-slate-400 font-mono hidden sm:inline">
                    {formatMoney(originalPrice + optionalAddonsTotal, currency, language)}
                  </span>
                )}
              </div>
            </div>

            <div className="hidden md:block pl-4 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              <span>{language === 'km' ? '📅 ថ្ងៃចេញដំណើរ: ' : '📅 Departure: '}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedDepartureDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenPdfAgenda}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('pdfDossier') || 'Dossier'}</span>
            </button>

            <button
              onClick={handleProceedToCheckout}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4" />
              <span>{language === 'km' ? 'កក់កៅអីឥឡូវនេះ (Book Now)' : 'Reserve Seat Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
