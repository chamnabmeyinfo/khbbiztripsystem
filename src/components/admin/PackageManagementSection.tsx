import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TourPackage } from '../../types';
import { PackageEditorModal } from './PackageEditorModal';
import { formatMoney } from '../../services/currencyService';
import {
  Plane,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  User,
  Phone,
  Layers,
  Compass,
  Star,
  DollarSign,
  Tag,
  ShieldAlert
} from 'lucide-react';

export const PackageManagementSection: React.FC = () => {
  const {
    packages,
    rawPackages,
    addPackage,
    updatePackage,
    deletePackage,
    setSelectedPackage,
    setActiveModal,
    openPackageSalesPage,
    currency,
    language
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingPkg, setEditingPkg] = useState<TourPackage | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [openWithAi, setOpenWithAi] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter logic
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.tourGuide?.name && pkg.tourGuide.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      pkg.category === selectedCategory ||
      (selectedCategory === 'b2b' && (pkg.tags?.includes('trade_mission' as any) || pkg.tags?.includes('trending' as any)));

    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setOpenWithAi(false);
    setIsEditorOpen(true);
  };

  const handleOpenAiCreate = () => {
    setEditingPkg(null);
    setOpenWithAi(true);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (pkg: TourPackage) => {
    const targetRawPkg = rawPackages?.find(p => p.id === pkg.id) || pkg;
    setEditingPkg(targetRawPkg);
    setOpenWithAi(false);
    setIsEditorOpen(true);
  };

  const handleDuplicate = (pkg: TourPackage) => {
    const duplicated: TourPackage = {
      ...pkg,
      id: `pkg_${Date.now()}`,
      title: `${pkg.title} (Copy / Batch 2)`,
      bookedThisMonth: 0
    };
    addPackage(duplicated);
  };

  const handleSavePackage = (savedPkg: TourPackage) => {
    if (editingPkg) {
      updatePackage(savedPkg);
    } else {
      addPackage(savedPkg);
    }
  };

  const handlePreview = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setActiveModal('package_detail');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tour Catalog</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {packages.length} Packages
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-time DB synced</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Package Price</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              ${packages.length > 0 ? Math.round(packages.reduce((sum, p) => sum + (p.discountPriceUSD || p.priceUSD), 0) / packages.length) : 0} USD
            </div>
            <div className="text-[11px] text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1 mt-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Base B2B delegation tariff</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Trade Missions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {packages.filter(p => p.category === 'trade_mission' || p.tags?.includes('cultural' as any)).length} Live
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>With official Expo passes</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Tour Guides</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {packages.filter(p => !!p.tourGuide).length} Leads
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 mt-1">
              <User className="w-3.5 h-3.5" />
              <span>Trilingual escort coordinators</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Tour Package Inventory & Master Information Management</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
                {filteredPackages.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit every single field: Title, Prices, Inclusions, Daily Itineraries, Guide Agendas, Optional Programs, and Emergency Contacts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAiCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>✨ AI Paste & Auto-Input</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tour Package</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by package title, city destination, country, or lead guide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'All Packages' },
              { id: 'trade_mission', label: 'B2B Trade Missions' },
              { id: 'franchise', label: 'Franchise & Retail' },
              { id: 'coffee_tea_bakery', label: 'Coffee & Bakery' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tour Package Cards Grid */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            No Tour Packages Matching "{searchTerm}"
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or click "Create New Tour Package" to add a new business expedition.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPackages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Image Banner Header */}
                <div className="relative aspect-[16/8] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={pkg.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80'}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                      {pkg.destination}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-bold font-mono">
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </span>
                  </div>

                  {/* Pricing Badge */}
                  <div className="absolute top-3 right-3 flex flex-col items-end">
                    {pkg.discountPriceUSD ? (
                      <div className="bg-emerald-600/95 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl shadow-lg text-right">
                        <div className="text-[10px] line-through text-emerald-200 font-mono">${pkg.priceUSD}</div>
                        <div className="text-sm font-black font-mono">${pkg.discountPriceUSD} USD</div>
                      </div>
                    ) : (
                      <div className="bg-slate-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl font-black font-mono text-sm">
                        ${pkg.priceUSD} USD
                      </div>
                    )}
                  </div>

                  {/* Title & Coordinator on Hero */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-sm">
                      {pkg.title}
                    </h4>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  {/* Lead Coordinator Box */}
                  {pkg.tourGuide && (
                    <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {pkg.tourGuide.photoUrl ? (
                            <img src={pkg.tourGuide.photoUrl} alt="Guide" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                            Lead Coordinator & Guide
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {pkg.tourGuide.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{pkg.tourGuide.phone}</span>
                        </div>
                        {pkg.tourGuide.telegram && (
                          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                            {pkg.tourGuide.telegram}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Highlights Summary */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Included Package Features ({pkg.inclusions?.length || 0} Inclusions)
                    </div>
                    <div className="space-y-1">
                      {(pkg.inclusions || []).slice(0, 3).map((inc, i) => (
                        <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span className="line-clamp-1">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Itinerary Schedule Counts */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Itinerary</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {pkg.itinerary?.length || 0} Days Plan
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Add-Ons</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {pkg.optionalPrograms?.length || 0} Programs
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Hotel Standard</div>
                      <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center justify-center gap-0.5">
                        <span>{pkg.hotelStars || 4}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openPackageSalesPage(pkg)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Open live public landing sales page for this package"
                  >
                    <span>🚀 Sales Page</span>
                  </button>

                  <button
                    onClick={() => handlePreview(pkg)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Quick modal preview"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    <span>Quick View</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(pkg)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Clone / Duplicate Package"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Clone</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Package</span>
                  </button>

                  {deletingId === pkg.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          deletePackage(pkg.id);
                          setDeletingId(null);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1.5 rounded-xl border text-xs text-slate-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(pkg.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Featured Modal Editor */}
      {isEditorOpen && (
        <PackageEditorModal
          key={editingPkg ? editingPkg.id : (openWithAi ? 'new-ai' : 'new-manual')}
          pkg={editingPkg}
          isOpen={isEditorOpen}
          initialOpenWithAi={openWithAi}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSavePackage}
        />
      )}
    </div>
  );
};
