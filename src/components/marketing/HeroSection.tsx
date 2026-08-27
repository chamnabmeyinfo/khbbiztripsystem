import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Calendar, Users, MapPin, Sparkles, ArrowRight, Star, ShieldCheck, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { TourPackage } from '../../types';

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
    ? activePackagesWithImages.map(pkg => ({
        id: pkg.id,
        image: pkg.images[0],
        title: pkg.title,
        destination: pkg.destination,
        country: pkg.country,
        price: pkg.discountPriceUSD || pkg.priceUSD,
        pkg: pkg
      }))
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

        {/* Dynamic Search Bar Card */}
        <div
          id="search-trips-bar"
          className="mt-12 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 lg:p-5"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Destination Autocomplete */}
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                {t('destination')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-sky-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  placeholder={t('whereTo')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Autocomplete suggestions dropdown */}
              {showAutocomplete && destinationInput.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 z-50 max-h-56 overflow-y-auto">
                  {filteredDestinations.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400">
                      No tours matching "{destinationInput}". Try Kyoto, Amalfi, Bali, or Swiss Alps.
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
                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {pkg.destination}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{pkg.title}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">
                          From ${pkg.discountPriceUSD || pkg.priceUSD}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Travel Date Selector */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                {t('travelDates')}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                <input
                  type="date"
                  value={selectedDate}
                  min="2026-08-16"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Travelers Selector */}
            <div className="md:col-span-3 relative">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                {t('travelers')}
              </label>
              <button
                type="button"
                onClick={() => setShowTravelersDropdown(!showTravelersDropdown)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white text-left flex items-center justify-between cursor-pointer"
              >
                <Users className="w-4 h-4 text-teal-500 absolute left-3 top-3" />
                <span>
                  {language === 'km'
                    ? `${adultsCount} នាក់ (ពេញវ័យ)${childrenCount > 0 ? `, ${childrenCount} កុមារ` : ''}`
                    : `${adultsCount} Adults${childrenCount > 0 ? `, ${childrenCount} Kids` : ''}`}
                </span>
                <span className="text-[10px] text-slate-400">{language === 'km' ? 'កែប្រែ ▾' : 'Edit ▾'}</span>
              </button>

              {/* Travelers Counter Dropdown */}
              {showTravelersDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {language === 'km' ? 'មនុស្សពេញវ័យ' : 'Adults'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === 'km' ? 'អាយុ ១២+ ឆ្នាំ' : 'Ages 12+'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{adultsCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {language === 'km' ? 'កុមារ' : 'Children'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === 'km' ? 'អាយុ ០-១១ ឆ្នាំ (បញ្ចុះតម្លៃ ៣០%)' : 'Ages 0-11 (30% off)'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{childrenCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.min(6, childrenCount + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTravelersDropdown(false)}
                    className="w-full py-1.5 rounded-lg bg-sky-50 dark:bg-slate-700 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-100 cursor-pointer"
                  >
                    {language === 'km' ? 'រួចរាល់' : 'Done'}
                  </button>
                </div>
              )}
            </div>

            {/* Submit Search Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full mt-4 md:mt-0 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{language === 'km' ? 'ស្វែងរក' : 'Search'}</span>
              </button>
            </div>
          </form>

          {/* Quick Destination Chips */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1">
              {language === 'km' ? 'ពេញនិយម:' : 'Trending:'}
            </span>
            {packages.slice(0, 5).map(pkg => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handleSelectPackage(pkg)}
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {pkg.destination.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
