import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from './HeroSection';
import { InteractiveMap } from './InteractiveMap';
import { TrendingDeals } from './TrendingDeals';
import { Testimonials } from './Testimonials';
import {
  ShieldCheck,
  CreditCard,
  Headphones,
  FileCheck2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  CheckCircle,
  Globe2,
  Calendar
} from 'lucide-react';
import { TourPackage } from '../../types';
import { formatMoney } from '../../services/currencyService';

export const LandingPage: React.FC = () => {
  const { packages, setSelectedPackage, setActiveModal, currency, language, t } = useApp();
  
  const [searchResults, setSearchResults] = useState<{
    query: string;
    items: TourPackage[];
  } | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSearchSubmit = ({ destination, date, travelers }: { destination: string; date: string; travelers: number }) => {
    if (!destination.trim()) {
      setSearchResults(null);
      return;
    }

    const matched = packages.filter(p =>
      p.destination.toLowerCase().includes(destination.toLowerCase()) ||
      p.title.toLowerCase().includes(destination.toLowerCase()) ||
      p.country.toLowerCase().includes(destination.toLowerCase())
    );

    setSearchResults({
      query: destination,
      items: matched
    });

    // Smooth scroll to search results section
    setTimeout(() => {
      document.getElementById('search-results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const faqs = [
    {
      q: 'How does automated tax and VAT invoicing work on TripDesk?',
      a: 'Upon booking confirmation, TripDesk automatically calculates local municipal tourism levies and standard VAT (7.5%), generating a statutory PDF invoice and receipts formatted for individual travelers and corporate tax deductions.'
    },
    {
      q: 'What is included in the small-group package price?',
      a: 'All our featured packages include boutique 4/5-star accommodations, daily artisanal breakfasts and dinners, certified private local guides, airport chauffeur transfers, and flight booking allowances where indicated.'
    },
    {
      q: 'Can I modify my departure dates after booking?',
      a: 'Yes! You can reschedule your trip directly from your traveler portal. If the new departure date is within our confirmed operator schedule, rebooking is free with zero penalty.'
    },
    {
      q: 'Are offline itineraries available during my trip?',
      a: 'Yes. Your booked itinerary, day-by-day routes, flight gates, hotel confirmation vouchers, and local emergency contact helplines are cached offline in the web app for instant access without roaming data.'
    }
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <HeroSection onSearchSubmit={handleSearchSubmit} />

      {/* Dynamic Search Results Section (if active search) */}
      {searchResults && (
        <section id="search-results-section" className="py-12 bg-sky-50 dark:bg-slate-900 border-y border-sky-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Search Results for "{searchResults.query}"
                </h3>
                <p className="text-xs text-slate-500">
                  {searchResults.items.length} matching verified luxury departures found
                </p>
              </div>
              <button
                onClick={() => setSearchResults(null)}
                className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            </div>

            {searchResults.items.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No direct matches for "{searchResults.query}". Browse our popular packages below!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {searchResults.items.map(pkg => (
                  <div
                    key={pkg.id}
                    className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-between"
                  >
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-sky-600 uppercase">
                          {pkg.destination}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {pkg.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {pkg.description}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400">From</span>
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {formatMoney(pkg.discountPriceUSD || pkg.priceUSD, currency, language)}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setActiveModal('package_detail');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feature Value Props Banner */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Automated Tax Invoicing
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Compliant VAT calculation and instant official PDF receipts for expense filing.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  100% Guaranteed Departures
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every listed date is backed by confirmed boutique hotel & tour guide allocations.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Multi-Currency & RTL
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Pay smoothly in USD, EUR, GBP, JPY, AED, or ILS with real-time rate transparency.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  24/7 Dedicated Concierge
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Direct live chat with your travel manager and offline emergency contact links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Expedition Atlas (Map) */}
      <InteractiveMap />

      {/* Trending Deals Grid */}
      <TrendingDeals />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about booking with TripDesk.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-sky-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
