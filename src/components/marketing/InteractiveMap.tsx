import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TourPackage } from '../../types';
import { MapPin, Star, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { formatMoney } from '../../services/currencyService';

export const InteractiveMap: React.FC = () => {
  const { packages, setSelectedPackage, setActiveModal, currency, language, t } = useApp();
  const [hoveredPkg, setHoveredPkg] = useState<TourPackage | null>(null);
  const [selectedFilterTag, setSelectedFilterTag] = useState<string>('all');

  const filteredPackages = selectedFilterTag === 'all'
    ? packages
    : packages.filter(p => p.tags.includes(selectedFilterTag as any));

  const handlePinClick = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setActiveModal('package_detail');
  };

  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Expedition Atlas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('popularDestinations')}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Hover over destination beacons to preview curated luxury itineraries, or click to inspect day-by-day routes and live dates.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'trending', 'b2b', 'trade_mission', 'franchise'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedFilterTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedFilterTag === tag
                    ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tag.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Map Stage Container */}
        <div className="relative w-full aspect-[16/9] min-h-[420px] max-h-[560px] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-4">
          {/* Stylized SVG World Map Outline */}
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full text-slate-800 fill-current opacity-40 select-none pointer-events-none"
            aria-hidden="true"
          >
            {/* North America */}
            <path d="M120,80 Q160,70 200,90 Q240,110 260,160 Q240,200 200,220 Q160,240 140,200 Q100,160 110,100 Z" />
            <path d="M180,50 Q230,40 280,60 Q300,90 260,110 Q210,90 180,50 Z" />
            {/* South America */}
            <path d="M260,260 Q310,270 340,320 Q350,380 320,440 Q280,450 260,400 Q230,340 240,290 Z" />
            {/* Europe */}
            <path d="M470,90 Q540,80 570,120 Q560,160 510,170 Q460,160 450,120 Z" />
            <path d="M440,60 Q460,50 480,70 Q460,90 440,70 Z" />
            {/* Africa */}
            <path d="M480,180 Q560,190 580,260 Q570,360 520,400 Q480,360 460,280 Q450,220 480,180 Z" />
            {/* Asia */}
            <path d="M580,80 Q740,70 850,120 Q900,180 880,260 Q800,280 720,240 Q640,220 590,160 Z" />
            {/* Japan Arc */}
            <path d="M840,150 Q860,170 850,200 Q835,180 840,150 Z" />
            {/* Southeast Asia & Indonesia */}
            <path d="M730,280 Q780,290 820,330 Q790,360 740,340 Z" />
            {/* Australia */}
            <path d="M780,360 Q880,350 900,410 Q860,460 790,440 Q760,400 780,360 Z" />
          </svg>

          {/* Empty Map Overlay */}
          {filteredPackages.length === 0 && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/60 backdrop-blur-xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-3">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <p className="text-sm font-bold text-white">
                Atlas Ready for New Expeditions
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Add tour packages or trade delegations from Admin Back-Office to plot new destination pins on this map.
              </p>
            </div>
          )}

          {/* Plotted Interactive Pins */}
          {filteredPackages.map(pkg => {
            const isHovered = hoveredPkg?.id === pkg.id;
            return (
              <div
                key={pkg.id}
                style={{
                  left: `${pkg.coordinates.mapX}%`,
                  top: `${pkg.coordinates.mapY}%`,
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                onMouseEnter={() => setHoveredPkg(pkg)}
                onMouseLeave={() => setHoveredPkg(null)}
              >
                {/* Glowing Radar Pulse */}
                <span className="absolute -inset-2 rounded-full bg-sky-500/30 animate-ping" />
                
                {/* Pin Button */}
                <button
                  onClick={() => handlePinClick(pkg)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-xs shadow-xl transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 scale-125 z-30 ring-4 ring-amber-400/40'
                      : 'bg-sky-500 text-white hover:bg-sky-400'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline text-[11px] whitespace-nowrap">
                    {pkg.destination.split(',')[0]}
                  </span>
                </button>

                {/* Floating Preview Card on Hover */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-sky-500/40 shadow-2xl z-40 animate-in fade-in zoom-in-95 pointer-events-auto">
                    <img
                      src={pkg.images[0]}
                      alt={pkg.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover rounded-xl mb-2"
                    />
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-white truncate">{pkg.title}</span>
                      <div className="flex items-center text-amber-400 font-bold shrink-0 ml-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{pkg.rating}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mb-2">
                      {pkg.description}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400">From</span>
                        <div className="font-bold text-sky-400 text-xs font-mono">
                          {formatMoney(pkg.discountPriceUSD || pkg.priceUSD, currency, language)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinClick(pkg);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
