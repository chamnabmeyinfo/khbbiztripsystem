import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { TourPackage } from '../../types';
import {
  MapPin,
  Star,
  ArrowRight,
  Compass,
  Sparkles,
  Plane,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Crosshair,
  Building2,
  Navigation,
  Globe2,
  Maximize2,
  Clock,
  Activity,
  X
} from 'lucide-react';
import { formatMoney } from '../../services/currencyService';

interface MapRegion {
  id: string;
  name: string;
  nameKm?: string;
  zoom: number;
  centerX: number;
  centerY: number;
}

const REGIONS: MapRegion[] = [
  { id: 'all', name: 'Global Atlas', nameKm: 'ផែនទីសកល', zoom: 1, centerX: 50, centerY: 50 },
  { id: 'asean', name: 'ASEAN Corridor', nameKm: 'អាស៊ាន', zoom: 1.8, centerX: 74, centerY: 62 },
  { id: 'greater_bay', name: 'Greater Bay / Canton', nameKm: 'ក្វាងចូវ & ចិន', zoom: 1.9, centerX: 80, centerY: 46 },
  { id: 'east_asia', name: 'East Asia Hub', nameKm: 'អាស៊ីបូព៌ា', zoom: 1.7, centerX: 82, centerY: 42 },
];

export const InteractiveMap: React.FC = () => {
  const { packages, setSelectedPackage, setActiveModal, currency, language, t } = useApp();
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(packages[0]?.id || null);
  const [hoveredPkgId, setHoveredPkgId] = useState<string | null>(null);
  const [selectedFilterTag, setSelectedFilterTag] = useState<string>('all');
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapTheme, setMapTheme] = useState<'radar' | 'emerald' | 'amber'>('radar');
  const [showDetailCard, setShowDetailCard] = useState<boolean>(true);
  const [mouseGeo, setMouseGeo] = useState<{ lat: number; lng: number }>({ lat: 11.5564, lng: 104.9282 });

  // Drag & Pan state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number }>({
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Origin Hub: Phnom Penh, Cambodia
  const originHub = {
    name: 'Phnom Penh Hub (HQ)',
    nameKm: 'រាជធានីភ្នំពេញ (ទីស្នាក់ការកណ្តាល)',
    code: 'PNH',
    mapX: 72.8,
    mapY: 61.2,
    lat: 11.5564,
    lng: 104.9282
  };

  const filteredPackages = useMemo(() => {
    if (selectedFilterTag === 'all') return packages;
    if (selectedFilterTag === 'canton') return packages.filter(p => p.isCantonFair || p.category === 'canton_fair');
    if (selectedFilterTag === 'vietnam') return packages.filter(p => p.country.toLowerCase().includes('vietnam'));
    if (selectedFilterTag === 'thailand') return packages.filter(p => p.country.toLowerCase().includes('thailand'));
    return packages.filter(p => p.tags?.includes(selectedFilterTag as any));
  }, [packages, selectedFilterTag]);

  const activePkg = useMemo(() => {
    return packages.find(p => p.id === (hoveredPkgId || selectedPkgId)) || packages[0] || null;
  }, [packages, hoveredPkgId, selectedPkgId]);

  // Compute flight metrics from PNH
  const activeFlightMetrics = useMemo(() => {
    if (!activePkg || !activePkg.coordinates) return { distanceKm: 1520, duration: '2h 45m', code: 'CAN' };
    const dx = activePkg.coordinates.mapX - originHub.mapX;
    const dy = activePkg.coordinates.mapY - originHub.mapY;
    const distFactor = Math.sqrt(dx * dx + dy * dy);
    const approxKm = Math.round(distFactor * 95);
    const hours = Math.floor(approxKm / 650) + 1;
    const minutes = Math.round((approxKm % 650) / 11);
    return {
      distanceKm: Math.max(250, approxKm),
      duration: `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m`,
      code: activePkg.country.toUpperCase().slice(0, 3)
    };
  }, [activePkg, originHub]);

  const handlePinClick = (pkg: TourPackage) => {
    setSelectedPkgId(pkg.id);
    setSelectedPackage(pkg);
    setActiveModal('package_detail');
  };

  const handleRegionSelect = (region: MapRegion) => {
    setActiveRegion(region.id);
    setZoomLevel(region.zoom);
    if (region.id === 'all') {
      setPanOffset({ x: 0, y: 0 });
    } else {
      const offsetX = (50 - region.centerX) * 3.5;
      const offsetY = (50 - region.centerY) * 3.5;
      setPanOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.3, 3.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.3, 0.9));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveRegion('all');
  };

  const handleCenterHQ = () => {
    setZoomLevel(1.8);
    setPanOffset({
      x: (50 - originHub.mapX) * 3.5,
      y: (50 - originHub.mapY) * 3.5
    });
  };

  // Pointer / Touch Dragging Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Avoid initiating drag on button clicks
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panOffset.x,
      startPanY: panOffset.y
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Update live geo coordinates HUD based on cursor position
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;
      const lat = Number(((0.5 - normY) * 120).toFixed(4));
      const lng = Number(((normX - 0.5) * 240 + 100).toFixed(4));
      setMouseGeo({ lat, lng });
    }

    if (!isDragging) return;
    const deltaX = (e.clientX - dragStartRef.current.startX) / (zoomLevel * 4);
    const deltaY = (e.clientY - dragStartRef.current.startY) / (zoomLevel * 4);

    setPanOffset({
      x: Math.max(-100, Math.min(100, dragStartRef.current.startPanX + deltaX)),
      y: Math.max(-100, Math.min(100, dragStartRef.current.startPanY + deltaY))
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe capture release
      }
    }
  };

  // Wheel Zoom Listener
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || Math.abs(e.deltaY) > 5) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomLevel(prev => Math.min(prev + 0.15, 3.0));
      } else {
        setZoomLevel(prev => Math.max(prev - 0.15, 0.9));
      }
    }
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Dynamic Background Glow Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 sm:mb-8 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2.5 shadow-xs">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{language === 'km' ? 'ផែនទីបេសកកម្មអន្តរកម្ម B2B' : 'Interactive Trade Mission Atlas'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live Radar</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{t('popularDestinations')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {language === 'km'
                ? 'ចុចលើទិសដៅនានាដើម្បីពិនិត្យផ្លូវហោះហើរ កាលវិភាគបេសកកម្ម និងការចូលរួមពិព័រណ៍ពាណិជ្ជកម្មកម្រិតអន្តរជាតិ។'
                : 'Explore active trade corridors, curated factory inspection routes, and scheduled international B2B delegations.'}
            </p>
          </div>

          {/* Region Quick Filters & Map Themes */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-inner overflow-x-auto no-scrollbar max-w-full">
              {REGIONS.map(reg => (
                <button
                  key={reg.id}
                  onClick={() => handleRegionSelect(reg)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeRegion === reg.id
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {language === 'km' && reg.nameKm ? reg.nameKm : reg.name}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'canton', label: 'Canton Fair' },
                { id: 'vietnam', label: 'Vietnam F&B' },
              ].map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedFilterTag(tag.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedFilterTag === tag.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interactive Stage */}
        <div
          ref={mapContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className={`relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[440px] sm:min-h-[500px] max-h-[640px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-0 select-none group touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Top-Left Telemetry HUD */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800/90 shadow-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-mono font-bold text-slate-200 text-[11px] sm:text-xs">
                PNH HQ <span className="text-slate-500 hidden sm:inline">(11.56°N, 104.93°E)</span>
              </span>
            </div>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="text-sky-400 hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px]">
              <Plane className="w-3 h-3" />
              <span>{filteredPackages.length} Corridors</span>
            </div>
            <span className="text-slate-700 hidden md:inline">|</span>
            <div className="text-slate-400 hidden md:inline-flex items-center gap-1 font-mono text-[10.5px]">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>{mouseGeo.lat >= 0 ? `${mouseGeo.lat}°N` : `${Math.abs(mouseGeo.lat)}°S`}, {mouseGeo.lng >= 0 ? `${mouseGeo.lng}°E` : `${Math.abs(mouseGeo.lng)}°W`}</span>
            </div>
          </div>

          {/* Top-Right HUD Controls (Zoom / Reset / HQ Focus) */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800/90 shadow-xl">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleCenterHQ}
              title="Center on Phnom Penh Base Hub"
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title="Reset View"
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Gestures Helper Pill */}
          <div className="absolute bottom-3 right-3 z-30 sm:hidden bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
            Drag to pan • Pinch to zoom
          </div>

          {/* Scalable Map Canvas Container */}
          <div
            className={`w-full h-full relative flex items-center justify-center pointer-events-none ${
              isDragging ? '' : 'transition-transform duration-500 ease-out'
            }`}
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}%, ${panOffset.y}%)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Vector World Grid and Landmass SVG */}
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full text-slate-800/80 fill-current select-none pointer-events-auto"
              aria-hidden="true"
            >
              <defs>
                {/* Geodesic Flight Gradient */}
                <linearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#2dd4bf" stopOpacity="1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="hubPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                {/* Radar Sweep Gradient */}
                <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>

                {/* Radar Grid Pattern */}
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
                </pattern>
              </defs>

              {/* Coordinate Grid Background */}
              <rect width="1000" height="500" fill="url(#radarGrid)" />

              {/* Radar Rings Centered on Phnom Penh */}
              <circle cx="728" cy="306" r="60" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.35" />
              <circle cx="728" cy="306" r="140" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="3 8" opacity="0.25" />
              <circle cx="728" cy="306" r="220" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="4 12" opacity="0.15" />

              {/* Radar Sweep Beam */}
              <g transform="translate(728, 306)">
                <line x1="0" y1="0" x2="260" y2="0" stroke="#38bdf8" strokeWidth="1.2" opacity="0.5" className="animate-radar-sweep" />
              </g>

              {/* Equator & Meridian Reference Lines */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.4" />
              <line x1="728" y1="0" x2="728" y2="500" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.25" />

              {/* Continents Outlines */}
              {/* North America */}
              <path
                d="M 120,60 Q 180,45 240,65 Q 290,95 270,155 Q 245,190 200,215 Q 165,230 135,190 Q 95,145 110,95 Z"
                className="fill-slate-800/70 stroke-slate-700/60"
                strokeWidth="1"
              />
              <path
                d="M 180,40 Q 230,30 275,48 Q 295,75 255,95 Q 210,80 180,40 Z"
                className="fill-slate-800/70 stroke-slate-700/60"
                strokeWidth="0.8"
              />

              {/* South America */}
              <path
                d="M 255,250 Q 305,260 335,310 Q 345,370 315,430 Q 275,440 255,390 Q 225,330 235,280 Z"
                className="fill-slate-800/70 stroke-slate-700/60"
                strokeWidth="1"
              />

              {/* Europe & Mediterranean */}
              <path
                d="M 465,85 Q 535,75 565,115 Q 555,155 505,165 Q 455,155 445,115 Z"
                className="fill-slate-800/70 stroke-slate-700/60"
                strokeWidth="1"
              />
              <path
                d="M 435,55 Q 455,45 475,65 Q 455,85 435,65 Z"
                className="fill-slate-800/70 stroke-slate-700/60"
                strokeWidth="0.8"
              />

              {/* Africa */}
              <path
                d="M 475,175 Q 555,185 575,255 Q 565,355 515,395 Q 475,355 455,275 Q 445,215 475,175 Z"
                className="fill-slate-800/70 stroke-slate-700/60"
                strokeWidth="1"
              />

              {/* Asia & Eurasia Continental Mass */}
              <path
                d="M 575,75 Q 735,65 845,115 Q 895,175 875,255 Q 795,275 715,235 Q 635,215 585,155 Z"
                className="fill-slate-800/90 stroke-sky-900/60"
                strokeWidth="1.2"
              />

              {/* Japan Arch & Korea Peninsula */}
              <path
                d="M 835,145 Q 855,165 845,195 Q 830,175 835,145 Z"
                className="fill-slate-700/80 stroke-slate-600/70"
                strokeWidth="1"
              />
              <path
                d="M 805,155 Q 815,165 810,185 Q 800,175 805,155 Z"
                className="fill-slate-700/80 stroke-slate-600/70"
                strokeWidth="0.8"
              />

              {/* Indochina & Southeast Asia */}
              <path
                d="M 710,230 Q 755,240 765,280 Q 750,320 720,310 Q 700,270 710,230 Z"
                className="fill-slate-750/90 stroke-sky-700/80"
                strokeWidth="1.5"
              />
              {/* Maritime Southeast Asia & Indonesia */}
              <path
                d="M 725,325 Q 775,335 815,355 Q 785,385 735,365 Z"
                className="fill-slate-800/80 stroke-slate-700/60"
                strokeWidth="1"
              />
              <path
                d="M 800,270 Q 820,285 810,315 Q 795,300 800,270 Z"
                className="fill-slate-800/80 stroke-slate-700/60"
                strokeWidth="0.8"
              />

              {/* Australia & Oceania */}
              <path
                d="M 775,355 Q 875,345 895,405 Q 855,455 785,435 Q 755,395 775,355 Z"
                className="fill-slate-800/70 stroke-slate-700/60"
                strokeWidth="1"
              />

              {/* Flight Corridors (Geodesic Arcs from Phnom Penh Hub) */}
              {filteredPackages.map(pkg => {
                const isSelected = selectedPkgId === pkg.id;
                const isHovered = hoveredPkgId === pkg.id;
                const isHighlighted = isSelected || isHovered;

                // SVG coordinates (0-1000, 0-500)
                const startX = (originHub.mapX / 100) * 1000;
                const startY = (originHub.mapY / 100) * 500;
                const endX = (pkg.coordinates.mapX / 100) * 1000;
                const endY = (pkg.coordinates.mapY / 100) * 500;

                // Arc control point for curvature
                const midX = (startX + endX) / 2;
                const midY = Math.min(startY, endY) - 35;

                return (
                  <g key={`corridor-${pkg.id}`} className="transition-opacity duration-300">
                    {/* Background Guide Arc */}
                    <path
                      d={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
                      fill="none"
                      stroke={isHighlighted ? '#38bdf8' : '#334155'}
                      strokeWidth={isHighlighted ? 2.5 : 1}
                      strokeOpacity={isHighlighted ? 0.9 : 0.35}
                      strokeDasharray={isHighlighted ? '6 4' : '3 4'}
                    />

                    {/* Animated moving comet pulse on highlighted corridor */}
                    {isHighlighted && (
                      <path
                        d={`M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`}
                        fill="none"
                        stroke="url(#flightGradient)"
                        strokeWidth="3"
                        strokeDasharray="16 120"
                        className="animate-flight-dash"
                      />
                    )}
                  </g>
                );
              })}

              {/* Base Hub SVG Beacon (Phnom Penh) */}
              <g transform={`translate(${(originHub.mapX / 100) * 1000}, ${(originHub.mapY / 100) * 500})`}>
                <circle r="16" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" className="animate-ping" />
                <circle r="8" fill="#065f46" stroke="#34d399" strokeWidth="2" />
                <circle r="3" fill="#ffffff" />
              </g>
            </svg>

            {/* Base Hub HTML Label (Phnom Penh HQ) */}
            <div
              style={{
                left: `${originHub.mapX}%`,
                top: `${originHub.mapY}%`,
              }}
              className="absolute transform -translate-x-1/2 translate-y-3 z-25 pointer-events-none"
            >
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 shadow-md whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>PNH HUB</span>
              </div>
            </div>

            {/* Plotted Interactive Destination Pins */}
            {filteredPackages.map(pkg => {
              const isSelected = selectedPkgId === pkg.id;
              const isHovered = hoveredPkgId === pkg.id;
              const isHighlighted = isSelected || isHovered;

              return (
                <div
                  key={pkg.id}
                  style={{
                    left: `${pkg.coordinates.mapX + (pkg.id.includes('phase_2') ? 1.5 : pkg.id.includes('phase_3') ? -1.5 : 0)}%`,
                    top: `${pkg.coordinates.mapY + (pkg.id.includes('phase_2') ? -1.5 : pkg.id.includes('phase_3') ? 1.5 : 0)}%`,
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
                  onMouseEnter={() => setHoveredPkgId(pkg.id)}
                  onMouseLeave={() => setHoveredPkgId(null)}
                >
                  {/* Outer Radar Halo */}
                  {isHighlighted && (
                    <span className="absolute -inset-3 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                  )}

                  {/* Dynamic Pin Button */}
                  <button
                    onClick={() => handlePinClick(pkg)}
                    className={`relative group/pin flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-xs shadow-2xl transition-all duration-300 cursor-pointer ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 scale-125 z-40 ring-4 ring-amber-400/40 shadow-amber-500/30 font-black'
                        : pkg.isCantonFair
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:scale-110 hover:bg-sky-500 border border-sky-400/40'
                        : 'bg-emerald-600 text-white hover:scale-110 hover:bg-emerald-500 border border-emerald-400/40'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-bold whitespace-nowrap">
                      {pkg.isCantonFair
                        ? `Canton (${pkg.cantonFairPhase || 'Fair'})`
                        : pkg.destination.split(',')[0].split('+')[0].trim()}
                    </span>
                    <span className="text-[10px] opacity-90 font-mono hidden md:inline">
                      ${pkg.discountPriceUSD || pkg.priceUSD}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Floating Selected/Hovered Destination Detail Card (Bottom-Left Pinned) */}
          {activePkg && showDetailCard && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 border border-slate-750 shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start gap-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-800">
                  <img
                    src={activePkg.images[0]}
                    alt={activePkg.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {activePkg.isCantonFair && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px]">
                      {activePkg.cantonFairPhase || 'CANTON'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 shrink-0" />
                      {activePkg.country} • {activePkg.durationDays}D/{activePkg.durationNights}N
                    </span>
                    <div className="flex items-center text-amber-400 font-bold text-xs shrink-0">
                      <Star className="w-3 h-3 fill-current mr-0.5" />
                      <span>{activePkg.rating}</span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {language === 'km' && activePkg.titleKm ? activePkg.titleKm : activePkg.title}
                  </h4>

                  {/* Flight Telemetry Pill */}
                  <div className="flex items-center gap-2 mt-1 text-[10.5px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold">~{activeFlightMetrics.distanceKm} km</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sky-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activeFlightMetrics.duration} Nonstop
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[9px] text-slate-400 block leading-tight">
                        {language === 'km' ? 'តម្លៃក្នុងម្នាក់' : 'Investment / Seat'}
                      </span>
                      <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                        {formatMoney(activePkg.discountPriceUSD || activePkg.priceUSD, currency, language)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePinClick(activePkg)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-sky-500/20"
                      >
                        <span>{language === 'km' ? 'ពិនិត្យកម្មវិធី' : 'View Itinerary'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Destination Strip Carousel below map */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {packages.slice(0, 4).map(pkg => {
            const isSelected = selectedPkgId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => {
                  setSelectedPkgId(pkg.id);
                  if (pkg.coordinates) {
                    setPanOffset({
                      x: (50 - pkg.coordinates.mapX) * 3,
                      y: (50 - pkg.coordinates.mapY) * 3
                    });
                    setZoomLevel(1.6);
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-slate-850 border-sky-500 ring-2 ring-sky-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80'
                }`}
              >
                <img
                  src={pkg.images[0]}
                  alt={pkg.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-sky-400 font-bold flex items-center justify-between">
                    <span>{pkg.destination.split(',')[0]}</span>
                    <span className="font-mono text-emerald-400">${pkg.discountPriceUSD || pkg.priceUSD}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate mt-0.5">
                    {language === 'km' && pkg.titleKm ? pkg.titleKm : pkg.title}
                  </h5>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{pkg.availableDates[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


