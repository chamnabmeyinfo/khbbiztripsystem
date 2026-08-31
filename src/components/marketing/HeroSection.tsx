import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Calendar, Users, MapPin, Sparkles, ArrowRight, Star, ShieldCheck, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { TourPackage } from '../../types';
import { getLocalizedPackage } from '../../utils/packageLocalization';

interface HeroSectionProps {
  onSearchSubmit: (params: { destination: string; date: string; travelers: number }) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearchSubmit }) => {
  const { packages, setSelectedPackage, setActiveModal, t, language } = useApp();

  const [destinationInput, setDestinationInput] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [showTravelersDropdown, setShowTravelersDropdown] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Extract featured images from active tour packages for the hero slide
  const activePackagesWithImages = packages.filter(
    p => p.status !== 'archived' && p.status !== 'deleted' && p.images && p.images.length > 0
  );

  const heroSlides = activePackagesWithImages.length > 0
    ? activePackagesWithImages.map(pkg => {
        const loc = getLocalizedPackage(pkg, language);
        return {
          id: loc.id,
          image: loc.images[0],
          title: loc.title,
          destination: loc.destination,
          country: loc.country,
          price: loc.discountPriceUSD || loc.priceUSD,
          pkg: pkg
        };
      })
    : [
        {
          id: 'default_1',
          image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format&fit=crop&q=80',
          title: 'Global Trade Missions & Business Expeditions',
          destination: 'International',
          country: 'Worldwide',
          price: 1850,
          pkg: undefined
        }
      ];

  // Auto-play slideshow timer
  useEffect(() => {
    if (heroSlides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length, isPaused]);

  // Keep slide index in bounds if packages change
  useEffect(() => {
    if (currentSlideIndex >= heroSlides.length) {
      setCurrentSlideIndex(0);
    }
  }, [heroSlides.length, currentSlideIndex]);

  const filteredDestinations = packages.filter(p =>
    p.destination.toLowerCase().includes(destinationInput.toLowerCase()) ||
    p.title.toLowerCase().includes(destinationInput.toLowerCase()) ||
    p.country.toLowerCase().includes(destinationInput.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit({
      destination: destinationInput,
      date: selectedDate,
      travelers: adultsCount + childrenCount
    });
  };

  const handleSelectPackage = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setActiveModal('package_detail');
  };

  const currentSlide = heroSlides[currentSlideIndex] || heroSlides[0];

  return (
    <section 
      className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Slideshow with Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title || slide.destination}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-center filter brightness-75 dark:brightness-60 transform transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}
        <div className="absolute inset-0 z-2 bg-gradient-to-t from-white via-white/40 to-slate-900/60 dark:from-slate-950 dark:via-slate-950/60 dark:to-slate-950/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 shadow-md text-xs font-semibold text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-bottom-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>✈️ KHB Events • Global B2B Trade Missions & Business Expeditions</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
            {language === 'km' ? 'ដំណើរទស្សនកិច្ចពាណិជ្ជកម្ម' : 'Global Trade Missions'}.{' '}
            <span className="bg-gradient-to-r from-amber-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              {language === 'km' ? 'បេសកកម្មអាជីវកម្មអន្តរជាតិ' : 'B2B Business Expeditions'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-100 dark:text-slate-200 font-medium max-w-2xl mx-auto drop-shadow leading-relaxed">
            {language === 'km'
              ? 'ស្វែងរកដៃគូអាជីវកម្មអន្តរជាតិ ការតាំងពិព័រណ៍ និងឱកាសវិនិយោគ Franchise ជាមួយ KHB Events។'
              : 'Connect with international trade delegations, global expos, and high-growth franchise investment opportunities.'}
          </p>

          {/* Single Clear CTA Button to jump to search or explore */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#search-trips-bar"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 hover:scale-105 hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer"
            >
              <Compass className="w-5 h-5 text-slate-950" />
              <span>{language === 'km' ? 'ស្វែងរកដំណើរទស្សនកិច្ច (Explore Missions)' : 'Explore Trade Missions'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Current Slide Tour Quick Link */}
            {currentSlide?.pkg && (
              <button
                type="button"
                onClick={() => handleSelectPackage(currentSlide.pkg!)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-900 dark:text-white backdrop-blur-md border border-white/30 text-xs font-bold shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-sky-500" />
                <span className="truncate max-w-[200px]">{currentSlide.destination}</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-black">${currentSlide.price}</span>
              </button>
            )}
          </div>

          {/* Slide Indicator Dots and Arrows */}
          {heroSlides.length > 1 && (
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                {heroSlides.map((slide, idx) => {
                  const isCurrent = idx === currentSlideIndex;
                  return (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        isCurrent ? 'w-6 bg-gradient-to-r from-amber-400 to-sky-400' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      title={`${slide.destination} (${idx + 1}/${heroSlides.length})`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                title="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Search Bar Card (Modernized Executive Capsule) */}
        <div
          id="search-trips-bar"
          className="mt-6 sm:mt-10 lg:mt-12 max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 lg:p-5 ring-1 ring-black/5 dark:ring-white/10 transition-all"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            {/* Destination Autocomplete Capsule */}
            <div className="md:col-span-4 relative">
              <label className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                <span className="w-4 h-4 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MapPin className="w-2.5 h-2.5" />
                </span>
                <span>{t('destination')}</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  placeholder={language === 'km' ? 'ស្វែងរកគោលដៅ ឬពិព័រណ៍...' : 'Where to? (e.g. Canton Fair, Saigon)'}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Autocomplete suggestions dropdown */}
              {showAutocomplete && destinationInput.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white/95 dark:bg-slate-850/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDestinations.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400">
                      No missions matching "{destinationInput}". Try Guangzhou, Canton Fair, Ho Chi Minh, or Tokyo.
                    </div>
                  ) : (
                    filteredDestinations.map(pkg => (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => {
                          setDestinationInput(pkg.destination);
                          setShowAutocomplete(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-indigo-50/70 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{pkg.destination}</span>
                              {pkg.isCantonFair && (
                                <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                                  {pkg.cantonFairPhase || 'Canton'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{pkg.title}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">
                          ${pkg.discountPriceUSD || pkg.priceUSD}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Travel Date Selector Capsule */}
            <div className="md:col-span-3">
              <label className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                <span className="w-4 h-4 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="w-2.5 h-2.5" />
                </span>
                <span>{t('travelDates')}</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                min="2026-08-16"
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
              />
            </div>

            {/* Travelers / Delegates Selector Capsule */}
            <div className="md:col-span-3 relative">
              <label className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                <span className="w-4 h-4 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-2.5 h-2.5" />
                </span>
                <span>{language === 'km' ? 'គណៈប្រតិភូ / អ្នកចូលរួម' : 'Delegates'}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowTravelersDropdown(!showTravelersDropdown)}
                className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white text-left flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
              >
                <span className="truncate">
                  {language === 'km'
                    ? `${adultsCount} នាក់${childrenCount > 0 ? `, ${childrenCount} កុមារ` : ''}`
                    : `${adultsCount} Adults${childrenCount > 0 ? `, ${childrenCount} Kids` : ''}`}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">{language === 'km' ? 'កែប្រែ ▾' : 'Edit ▾'}</span>
              </button>

              {/* Travelers Counter Dropdown */}
              {showTravelersDropdown && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white/95 dark:bg-slate-850/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3.5 z-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {language === 'km' ? 'ប្រតិភូពេញវ័យ' : 'Adult Delegates'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === 'km' ? 'អាយុ ១២+ ឆ្នាំ' : 'Ages 12+'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{adultsCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {language === 'km' ? 'កុមារអមដំណើរ' : 'Accompanying Kids'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === 'km' ? 'អាយុ ០-១១ ឆ្នាំ' : 'Ages 0-11'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{childrenCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.min(6, childrenCount + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTravelersDropdown(false)}
                    className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {language === 'km' ? 'រួចរាល់' : 'Done'}
                  </button>
                </div>
              )}
            </div>

            {/* Submit Search Button */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 hover:scale-[1.02]"
              >
                <Search className="w-4 h-4" />
                <span>{language === 'km' ? 'ស្វែងរក' : 'Explore'}</span>
              </button>
            </div>
          </form>

          {/* Quick Destination Chips */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5 scrollbar-none">
            <span className="text-slate-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{language === 'km' ? 'ពេញនិយម:' : 'Trending:'}</span>
            </span>
            {packages.slice(0, 6).map(pkg => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handleSelectPackage(pkg)}
                className="px-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300"
              >
                {pkg.isCantonFair ? `🇨🇳 Canton Fair ${pkg.cantonFairPhase || ''}` : pkg.destination.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
