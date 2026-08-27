import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TourPackage } from '../../types';
import { formatMoney } from '../../services/currencyService';
import {
  Star,
  Clock,
  Plane,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Flame,
  Play
} from 'lucide-react';

export const TrendingDeals: React.FC = () => {
  const { packages, setSelectedPackage, setActiveModal, openPackageSalesPage, currency, language, t } = useApp();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filtered = selectedTag === 'all'
    ? packages
    : packages.filter(p => {
        if (selectedTag === 'canton_all') return p.isCantonFair || p.title.toLowerCase().includes('canton') || p.category === 'canton_fair';
        if (selectedTag === 'canton_phase_1') return p.cantonFairPhase === 'Phase 1' || (p.title.includes('Phase 1') && p.isCantonFair);
        if (selectedTag === 'canton_phase_2') return p.cantonFairPhase === 'Phase 2' || (p.title.includes('Phase 2') && p.isCantonFair);
        if (selectedTag === 'canton_phase_3') return p.cantonFairPhase === 'Phase 3' || (p.title.includes('Phase 3') && p.isCantonFair);
        if (selectedTag === 'vietnam') return p.country?.toLowerCase().includes('vietnam') || p.destination?.toLowerCase().includes('ho chi minh');
        if (selectedTag === 'b2b' || selectedTag === 'trade_mission') return true;
        if (selectedTag === 'franchise' && (p.title.toLowerCase().includes('franchise') || p.description.toLowerCase().includes('franchise'))) return true;
        if (p.tags?.includes(selectedTag as any)) return true;
        return false;
      });

  const handleOpenSalesLanding = (pkg: TourPackage) => {
    openPackageSalesPage(pkg);
  };

  const handleOpenDetail = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setActiveModal('package_detail');
  };

  const handleQuickBook = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setActiveModal('checkout');
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>B2B Business Trade Mission & Canton Fair</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {language === 'km' ? 'ដំណើរទស្សនកិច្ចពាណិជ្ជកម្ម & Canton Fair 2026' : 'Official Trade Missions & Canton Fair 2026'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              {language === 'km'
                ? 'កម្មវិធីពិសេស Canton Fair (Phase 1, 2, 3) និងបេសកកម្មពាណិជ្ជកម្មរៀបចំដោយ KHB Events សម្រាប់សហគ្រិនកម្ពុជា។'
                : 'Canton Fair (Phase 1, 2, 3) & B2B trade delegations curated by KHB Events for Cambodian entrepreneurs.'}
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none flex-wrap">
            {[
              { id: 'all', label: language === 'km' ? 'ទាំងអស់' : 'All Tours' },
              { id: 'canton_all', label: '🇨🇳 Canton Fair 2026' },
              { id: 'canton_phase_1', label: '⚙️ Phase 1 (Electronics & Machinery)' },
              { id: 'canton_phase_2', label: '🏠 Phase 2 (Home & Gifts)' },
              { id: 'canton_phase_3', label: '👗 Phase 3 (Textiles & Medical)' },
              { id: 'vietnam', label: '🇻🇳 Vietnam Expos' },
              { id: 'franchise', label: '🏢 Franchise & Retail' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTag(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tab.id
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid / Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs max-w-2xl mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'km' ? 'មិនទាន់មានកញ្ចប់ទស្សនកិច្ចផ្សព្វផ្សាយនៅឡើយទេ' : 'No Active Trade Missions Available'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {language === 'km'
                ? 'លោកអ្នកអាចបង្កើតកញ្ចប់ដំណើរកម្សាន្ត និងបេសកកម្មពាណិជ្ជកម្មថ្មីបានយ៉ាងងាយស្រួលតាមរយៈ Admin Back-Office ឬ ✨ AI Operations Copilot។'
                : 'You can create and publish new business tour packages and delegations easily via the Admin Back-Office or ✨ AI Operations Copilot.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(pkg => {
              const hasDiscount = pkg.discountPriceUSD && pkg.discountPriceUSD < pkg.priceUSD;
              const savingsUSD = hasDiscount ? pkg.priceUSD - (pkg.discountPriceUSD || 0) : 0;

              return (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Badges */}
                  <div
                    onClick={() => handleOpenSalesLanding(pkg)}
                    className="relative aspect-[16/10] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Top Left Social Proof & Tags */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      {pkg.isCantonFair && pkg.cantonFairPhase && (
                        <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-red-400/30">
                          <span>🇨🇳 Canton Fair {pkg.cantonFairPhase}</span>
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                          {t('saveAmount') || 'Save'} {formatMoney(savingsUSD, currency, language)}
                        </span>
                      )}
                      {(pkg.featuredVideoUrl || (pkg.videos && pkg.videos.length > 0)) && (
                        <span className="px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-red-400/30 backdrop-blur-xs">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Video Tour</span>
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-md">
                        <TrendingUp className="w-3 h-3" />
                        <span>{pkg.bookedThisMonth} {t('bookedThisMonth')}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold">{pkg.rating.toFixed(1)}</span>
                        <span className="text-white/70">({pkg.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        <span>{pkg.durationDays}{t('days')} / {pkg.durationNights}{t('nights')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div onClick={() => handleOpenSalesLanding(pkg)} className="cursor-pointer">
                      <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {pkg.destination}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Footer Price & Buttons */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          {t('startingFrom')}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                            {formatMoney(pkg.discountPriceUSD || pkg.priceUSD, currency, language)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {formatMoney(pkg.priceUSD, currency, language)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenSalesLanding(pkg)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="View dedicated landing sale page"
                        >
                          <span>{t('salesPage') || 'Sales Page'}</span>
                        </button>
                        <button
                          onClick={() => handleQuickBook(pkg)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                        >
                          {t('bookNow')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
