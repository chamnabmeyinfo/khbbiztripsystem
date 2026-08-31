import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TourPackage, TourPackageStatus, PackageViewMode } from '../../types';
import { PackageCategoryModal, getCategoryBadgeClasses } from './PackageCategoryModal';
import { formatMoney } from '../../services/currencyService';
import { getLocalizedPackage } from '../../utils/packageLocalization';
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
  ShieldAlert,
  FileText,
  RotateCcw,
  Check,
  ArrowRight,
  Archive,
  AlertTriangle,
  FolderSync,
  LayoutGrid,
  List,
  Table,
  Kanban,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Building,
  Activity,
  SlidersHorizontal,
  Share2
} from 'lucide-react';
import { ViewContextMenu, ViewContextMenuState } from '../common/ViewContextMenu';

export const PackageManagementSection: React.FC = () => {
  const {
    packages,
    packageCategories,
    deletedItems,
    addPackage,
    updatePackage,
    deletePackage,
    updatePackageStatus,
    clonePackageAsDraft,
    restorePackage,
    recoverItem,
    permanentDeleteItem,
    setSelectedPackage,
    setActiveModal,
    openPackageSalesPage,
    openPackageEditor,
    currency,
    language,
    defaultPackageViewMode,
    setDefaultPackageViewMode,
    setDefaultView,
    resetDefaultView
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived' | 'deleted'>('all');
  const [viewMode, setViewMode] = useState<PackageViewMode>(() => defaultPackageViewMode || 'grid');
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDefaultDropdownOpen, setIsDefaultDropdownOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ViewContextMenuState | null>(null);

  // Deleted packages from Recycle Bin
  const recycleBinPackages = useMemo(() => {
    return (deletedItems || [])
      .filter(item => item.entityType === 'package' && item.data)
      .map(item => ({
        ...(item.data as TourPackage),
        status: 'deleted' as TourPackageStatus,
        _deletedItemId: item.id
      }));
  }, [deletedItems]);

  // Combined pool based on whether we are viewing trash or active pool
  const candidatePackages = useMemo(() => {
    if (statusFilter === 'deleted') {
      return recycleBinPackages;
    }
    return packages;
  }, [statusFilter, recycleBinPackages, packages]);

  // Count calculations
  const activeCount = packages.filter(p => !p.status || p.status === 'active').length;
  const draftCount = packages.filter(p => p.status === 'draft').length;
  const archivedCount = packages.filter(p => p.status === 'archived').length;
  const deletedCount = recycleBinPackages.length;

  // Filter logic
  const filteredPackages = candidatePackages.filter(pkg => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.tourGuide?.name && pkg.tourGuide.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      pkg.category === selectedCategory ||
      (selectedCategory === 'canton_fair' && (pkg.isCantonFair || pkg.category === 'canton_fair')) ||
      (selectedCategory === 'b2b' && (pkg.tags?.includes('trade_mission' as any) || pkg.tags?.includes('trending' as any)));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (!pkg.status || pkg.status === 'active')) ||
      (statusFilter === 'draft' && pkg.status === 'draft') ||
      (statusFilter === 'archived' && pkg.status === 'archived') ||
      (statusFilter === 'deleted' && pkg.status === 'deleted');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenCreate = () => {
    openPackageEditor(null, false);
  };

  const handleOpenAiCreate = () => {
    openPackageEditor(null, true);
  };

  const handleOpenEdit = (pkg: TourPackage) => {
    openPackageEditor(pkg, false);
  };

  const handleCloneAsDraft = (pkg: TourPackage) => {
    // Call deep cloning helper in AppContext
    const cloned = clonePackageAsDraft(pkg);
    // Immediately open editor for review
    openPackageEditor(cloned, false);
  };

  const handleStatusChange = (packageId: string, newStatus: TourPackageStatus) => {
    updatePackageStatus(packageId, newStatus);
  };

  const handleRestoreDeleted = (pkg: any) => {
    if (pkg._deletedItemId) {
      recoverItem(pkg._deletedItemId);
    } else {
      restorePackage(pkg.id);
    }
  };

  const handlePermanentDelete = (pkg: any) => {
    if (pkg._deletedItemId) {
      permanentDeleteItem(pkg._deletedItemId);
    }
  };

  const handlePreview = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setActiveModal('package_detail');
  };

  const handleOpenSocialShare = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setActiveModal('social_share');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Packages */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'all'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Packages</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                {packages.length}
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 mt-1">
                <Compass className="w-3.5 h-3.5" />
                <span>All managed catalogs</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active / Live Packages */}
        <div
          onClick={() => setStatusFilter('active')}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'active'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                🟢 Live on Web (Active)
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                {activeCount}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Open for customer bookings</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Draft Packages */}
        <div
          onClick={() => setStatusFilter('draft')}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'draft'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                🟡 Drafts (ព្រាងទុក)
              </div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                {draftCount}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 mt-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Private & In Progress</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Archived & Trash */}
        <div
          onClick={() => setStatusFilter(archivedCount > 0 ? 'archived' : 'deleted')}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'archived' || statusFilter === 'deleted'
              ? 'border-slate-500 ring-2 ring-slate-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Archived & Trash
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-200 font-mono mt-1 flex items-center gap-2">
                <span>{archivedCount}</span>
                <span className="text-xs text-slate-400 font-normal">Archived</span>
                <span className="text-xs text-rose-500 font-normal">/ {deletedCount} In Bin</span>
              </div>
              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                <Archive className="w-3.5 h-3.5" />
                <span>Historical logs & Bin</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Archive className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Header, Status Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Tour Package Inventory & Master Information</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
                {filteredPackages.length} shown
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage status lifecycle (Active, Draft, Archived, Trash), duplicate as draft, and edit rich business itineraries.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsCategoryManagerOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Add, edit, or remove Tour Package Categories"
            >
              <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Categories</span>
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-200/70 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[10px] font-mono">
                {packageCategories.length}
              </span>
            </button>
            <button
              onClick={handleOpenAiCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>✨ AI Auto-Input</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Package</span>
            </button>
          </div>
        </div>

        {/* Status Filter & View Mode Controls Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>All Statuses</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-slate-200 dark:bg-slate-700">
                {packages.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active (Live)</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                statusFilter === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
              }`}>
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Drafts (ព្រាង)</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                statusFilter === 'draft' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {draftCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'archived'
                  ? 'bg-slate-700 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived (បានផ្អាក)</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                statusFilter === 'archived' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {archivedCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('deleted')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'deleted'
                  ? 'bg-rose-600 text-white shadow-xs font-black'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Recycle Bin (ធុងសំរាម)</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                statusFilter === 'deleted' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}>
                {deletedCount}
              </span>
            </button>
          </div>

          {/* View Mode Switcher (Grid / List / Table / Kanban) + Default View Chooser */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl shrink-0 self-end md:self-auto border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
            {([
              { mode: 'grid' as PackageViewMode, label: 'Grid', icon: LayoutGrid, desc: 'Card Grid' },
              { mode: 'detailed-list' as PackageViewMode, label: 'List', icon: List, desc: 'Detailed List' },
              { mode: 'table' as PackageViewMode, label: 'Table', icon: Table, desc: 'Compact Table' },
              { mode: 'kanban' as PackageViewMode, label: 'Kanban', icon: Kanban, desc: 'Kanban Board' }
            ]).map(({ mode, label, icon: Icon, desc }) => {
              const isSelected = viewMode === mode;
              const isDefault = defaultPackageViewMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      isOpen: true,
                      x: e.clientX,
                      y: e.clientY,
                      targetView: 'admin_dashboard',
                      targetTab: 'packages',
                      targetPackageViewMode: mode,
                      title: `Tour Package: ${label} View`,
                      subtitle: `${desc} • Right-click to set as default`,
                      isCurrentDefaultView: false,
                      isCurrentDefaultPackageViewMode: isDefault
                    });
                  }}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none group ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={`${desc}${isDefault ? ' (Default View)' : ' (Right-click to set as default)'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  {isDefault && (
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0 animate-in fade-in" />
                  )}
                </button>
              );
            })}

            {/* Quick Default View Chooser Menu */}
            <div className="relative border-l border-slate-200 dark:border-slate-700/80 pl-1.5 ml-0.5 flex items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDefaultDropdownOpen(!isDefaultDropdownOpen)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    defaultPackageViewMode === viewMode
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:border-amber-400 hover:text-amber-600'
                  }`}
                  title="Choose default view mode for Tour Packages"
                >
                  <Star className={`w-3 h-3 ${defaultPackageViewMode === viewMode ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">
                    {defaultPackageViewMode === viewMode ? 'Default' : 'Set Default'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isDefaultDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDefaultDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Set Default Package View
                      </div>
                      <div className="py-1 space-y-0.5">
                        {[
                          { mode: 'grid' as PackageViewMode, label: 'Grid Cards (ក្រឡា)', icon: LayoutGrid },
                          { mode: 'detailed-list' as PackageViewMode, label: 'Detailed List (បញ្ជីលម្អិត)', icon: List },
                          { mode: 'table' as PackageViewMode, label: 'Compact Table (តារាង)', icon: Table },
                          { mode: 'kanban' as PackageViewMode, label: 'Kanban Board (ក្តារ)', icon: Kanban }
                        ].map((item) => {
                          const isItemDefault = defaultPackageViewMode === item.mode;
                          return (
                            <button
                              key={item.mode}
                              type="button"
                              onClick={() => {
                                setDefaultPackageViewMode(item.mode);
                                setViewMode(item.mode);
                                setIsDefaultDropdownOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                isItemDefault
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <item.icon className="w-3.5 h-3.5 text-slate-500" />
                                <span>{item.label}</span>
                              </div>
                              {isItemDefault && <Check className="w-3.5 h-3.5 text-amber-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
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

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            {packageCategories
              .filter(c => c.isActive)
              .map(cat => {
                const count = candidatePackages.filter(p => p.category === cat.id || (cat.id === 'canton_fair' && p.isCantonFair)).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{language === 'km' && cat.nameKm ? cat.nameKm : cat.name}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                        selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Multi-View Package Display Area */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {statusFilter === 'deleted' ? 'Recycle Bin is Empty' : `No Tour Packages Matching Your Filter`}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'deleted'
              ? 'No deleted packages found in the Recycle Bin. Any removed packages can be safely restored from here.'
              : 'Try clearing the search query, switching the status tab, or click "Create Package" to add a new tour.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* 1. TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3.5 px-4">Tour Package</th>
                  <th className="py-3.5 px-3">Destination</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Pricing (USD)</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Guide / Coordinator</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredPackages.map(rawPkg => {
                  const pkg = getLocalizedPackage(rawPkg, language);
                  const currentStatus: TourPackageStatus = pkg.status || 'active';
                  const isTrashItem = statusFilter === 'deleted' || currentStatus === 'deleted';
                  const matchedCat = packageCategories.find(c => c.id === pkg.category);

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Package Name & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-12 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                              src={pkg.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80'}
                              alt={pkg.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1 text-xs">
                              {pkg.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ID: {pkg.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{pkg.destination}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{pkg.country}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {matchedCat ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClasses(matchedCat.color)}`}>
                            {matchedCat.icon ? `${matchedCat.icon} ` : ''}{language === 'km' && matchedCat.nameKm ? matchedCat.nameKm : matchedCat.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          {pkg.durationDays}D / {pkg.durationNights}N
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {pkg.discountPriceUSD ? (
                          <div>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                              ${pkg.discountPriceUSD}
                            </span>
                            <span className="ml-1.5 text-[10px] text-slate-400 line-through">
                              ${pkg.priceUSD}
                            </span>
                          </div>
                        ) : (
                          <span className="font-black text-slate-900 dark:text-white text-xs">
                            ${pkg.priceUSD}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={currentStatus}
                          disabled={isTrashItem}
                          onChange={(e) => handleStatusChange(pkg.id, e.target.value as TourPackageStatus)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border appearance-none cursor-pointer focus:outline-none ${
                            currentStatus === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : currentStatus === 'draft'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : currentStatus === 'archived'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          <option value="active">🟢 Active</option>
                          <option value="draft">🟡 Draft</option>
                          <option value="archived">⚪ Archived</option>
                          {isTrashItem && <option value="deleted">🔴 Trash</option>}
                        </select>
                      </td>

                      {/* Guide */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {pkg.tourGuide ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                              {pkg.tourGuide.photoUrl ? (
                                <img src={pkg.tourGuide.photoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                pkg.tourGuide.name.charAt(0)
                              )}
                            </div>
                            <span className="text-slate-800 dark:text-slate-200 text-xs font-bold">
                              {pkg.tourGuide.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Table Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isTrashItem ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRestoreDeleted(pkg)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Restore"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(pkg)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenSocialShare(pkg)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                              title="Social Media Boost & Post Link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openPackageSalesPage(pkg)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                              title="Sales Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePreview(pkg)}
                              className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 cursor-pointer"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCloneAsDraft(pkg)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                              title="Clone as Draft"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(pkg)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                              title="Edit Package"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deletePackage(pkg.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'detailed-list' ? (
        /* 2. DETAILED LIST VIEW */
        <div className="space-y-4">
          {filteredPackages.map(pkg => {
            const currentStatus: TourPackageStatus = pkg.status || 'active';
            const isTrashItem = statusFilter === 'deleted' || currentStatus === 'deleted';
            const matchedCat = packageCategories.find(c => c.id === pkg.category);

            return (
              <div
                key={pkg.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 ${
                  currentStatus === 'draft'
                    ? 'border-amber-200 dark:border-amber-900/60'
                    : currentStatus === 'archived'
                    ? 'border-slate-300 dark:border-slate-700 opacity-90'
                    : isTrashItem
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  {/* Thumbnail Image with Status Badge */}
                  <div className="relative w-full sm:w-36 h-28 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={pkg.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80'}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        currentStatus === 'active'
                          ? 'bg-emerald-600/90 text-white'
                          : currentStatus === 'draft'
                          ? 'bg-amber-500/90 text-white'
                          : currentStatus === 'archived'
                          ? 'bg-slate-800/90 text-slate-200'
                          : 'bg-rose-600/90 text-white'
                      }`}>
                        {currentStatus === 'active' ? '🟢 Active' : currentStatus === 'draft' ? '🟡 Draft' : currentStatus === 'archived' ? '⚪ Archived' : '🔴 Trash'}
                      </span>
                    </div>
                  </div>

                  {/* Main Information */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{pkg.destination}, {pkg.country}</span>
                      </span>
                      {matchedCat && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeClasses(matchedCat.color)}`}>
                          {matchedCat.icon ? `${matchedCat.icon} ` : ''}{matchedCat.name}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        {pkg.durationDays}D / {pkg.durationNights}N
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {pkg.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {pkg.description || 'Comprehensive business trip & trade delegation package.'}
                    </p>

                    {/* Features snippet */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{pkg.hotelStars || 4}★ Hotel</span>
                      </span>
                      <span>•</span>
                      <span>{pkg.itinerary?.length || 0} Itinerary Days</span>
                      <span>•</span>
                      <span>{pkg.optionalPrograms?.length || 0} Add-On Programs</span>
                      {pkg.tourGuide && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-indigo-500" />
                            <span>Guide: {pkg.tourGuide.name}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Actions Side */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="text-left md:text-right">
                    {pkg.discountPriceUSD ? (
                      <div>
                        <div className="text-[10px] line-through text-slate-400 font-mono">${pkg.priceUSD} USD</div>
                        <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          ${pkg.discountPriceUSD} USD
                        </div>
                      </div>
                    ) : (
                      <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                        ${pkg.priceUSD} USD
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isTrashItem ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreDeleted(pkg)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(pkg)}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleOpenSocialShare(pkg)}
                        className="px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Social Media Boost & Post Link"
                      >
                        <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Boost</span>
                      </button>
                      <button
                        onClick={() => openPackageSalesPage(pkg)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Sales Page"
                      >
                        <span>🚀 Sales</span>
                      </button>
                      <button
                        onClick={() => handlePreview(pkg)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4 text-sky-500" />
                      </button>
                      <button
                        onClick={() => handleCloneAsDraft(pkg)}
                        className="p-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Clone as Draft"
                      >
                        <Copy className="w-4 h-4 text-amber-600" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deletePackage(pkg.id)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'kanban' ? (
        /* 3. KANBAN PIPELINE BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Column */}
          <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-3xl p-4 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-black text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  🟢 Live Active Catalog
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
                {packages.filter(p => !p.status || p.status === 'active').length}
              </span>
            </div>

            <div className="space-y-3">
              {packages.filter(p => !p.status || p.status === 'active').map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={pkg.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {pkg.destination} • {pkg.durationDays}D
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {pkg.title}
                      </div>
                      <div className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${pkg.discountPriceUSD || pkg.priceUSD} USD
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStatusChange(pkg.id, 'draft')}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer"
                        title="Move to Draft"
                      >
                        → Draft
                      </button>
                      <button
                        onClick={() => handleStatusChange(pkg.id, 'archived')}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="Archive"
                      >
                        → Archive
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCloneAsDraft(pkg)}
                        className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer"
                        title="Clone as Draft"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Draft Column */}
          <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-3xl p-4 border border-amber-200 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-black text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  🟡 Drafts & Proposals
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                {packages.filter(p => p.status === 'draft').length}
              </span>
            </div>

            <div className="space-y-3">
              {packages.filter(p => p.status === 'draft').map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-amber-200/80 dark:border-amber-900/50 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={pkg.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-amber-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {pkg.destination} • {pkg.durationDays}D Plan
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {pkg.title}
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                        ${pkg.priceUSD} USD
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      onClick={() => handleStatusChange(pkg.id, 'active')}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                      title="Publish Live"
                    >
                      🚀 Publish Live
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                        title="Edit Draft"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePackage(pkg.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Archived & Inactive Column */}
          <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-300 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  ⚪ Archived & Historical
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                {packages.filter(p => p.status === 'archived').length}
              </span>
            </div>

            <div className="space-y-3">
              {packages.filter(p => p.status === 'archived').map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 opacity-90 hover:opacity-100 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={pkg.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0 grayscale"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-500">
                        {pkg.destination} • {pkg.durationDays}D
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {pkg.title}
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        ${pkg.priceUSD} USD
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      onClick={() => handleStatusChange(pkg.id, 'active')}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 cursor-pointer"
                    >
                      ↩ Reactivate
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCloneAsDraft(pkg)}
                        className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer"
                        title="Clone as Draft"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePackage(pkg.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 4. DEFAULT CARD GRID VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPackages.map(pkg => {
            const currentStatus: TourPackageStatus = pkg.status || 'active';
            const isTrashItem = statusFilter === 'deleted' || currentStatus === 'deleted';

            return (
              <div
                key={pkg.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  currentStatus === 'draft'
                    ? 'border-amber-200 dark:border-amber-900/60'
                    : currentStatus === 'archived'
                    ? 'border-slate-300 dark:border-slate-700 opacity-90'
                    : isTrashItem
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Image Banner Header */}
                  <div className="relative aspect-[16/8] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={pkg.images[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop&q=80'}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                    {/* Status Pill Badge (Top Left Corner) */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[70%]">
                      {/* Lifecycle Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                        currentStatus === 'active'
                          ? 'bg-emerald-600/90 text-white ring-1 ring-emerald-400'
                          : currentStatus === 'draft'
                          ? 'bg-amber-500/90 text-white ring-1 ring-amber-300'
                          : currentStatus === 'archived'
                          ? 'bg-slate-800/90 text-slate-200 ring-1 ring-slate-400'
                          : 'bg-rose-600/90 text-white ring-1 ring-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          currentStatus === 'active' ? 'bg-white animate-pulse' : 'bg-white'
                        }`} />
                        <span>
                          {currentStatus === 'active' ? '🟢 Live on Web' : currentStatus === 'draft' ? '🟡 Draft (ព្រាង)' : currentStatus === 'archived' ? '⚪ Archived' : '🔴 In Trash'}
                        </span>
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                        {pkg.destination}
                      </span>

                      {pkg.category && (
                        (() => {
                          const matchedCat = packageCategories.find(c => c.id === pkg.category);
                          return (
                            <span className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold border ${matchedCat ? getCategoryBadgeClasses(matchedCat.color) : 'bg-slate-900/80 text-white border-transparent'}`}>
                              {matchedCat?.icon ? `${matchedCat.icon} ` : '🏷️ '}
                              {matchedCat ? (language === 'km' && matchedCat.nameKm ? matchedCat.nameKm : matchedCat.name) : pkg.category}
                            </span>
                          );
                        })()
                      )}
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

                    {/* Title on Hero */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 drop-shadow-sm">
                        {pkg.title}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Quick Status Control Bar */}
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Package Status:</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(pkg.id, 'active')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            currentStatus === 'active'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700'
                          }`}
                          title="Publish package live to public catalog"
                        >
                          <span>🟢 Active</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(pkg.id, 'draft')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            currentStatus === 'draft'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700'
                          }`}
                          title="Save as private draft hidden from customers"
                        >
                          <span>🟡 Draft</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(pkg.id, 'archived')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            currentStatus === 'archived'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800'
                          }`}
                          title="Archive package from catalog"
                        >
                          <span>⚪ Archive</span>
                        </button>
                      </div>
                    </div>

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
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-2">
                  {isTrashItem ? (
                    /* Trash Specific Recovery Controls */
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => handleRestoreDeleted(pkg)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>♻️ Restore to Catalog</span>
                      </button>

                      <button
                        onClick={() => handlePermanentDelete(pkg)}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanent Delete</span>
                      </button>
                    </div>
                  ) : (
                    /* Normal Action Controls */
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleOpenSocialShare(pkg)}
                          className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Get direct social media post link and UTM boost campaign generator"
                        >
                          <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>📢 Boost Link</span>
                        </button>

                        <button
                          onClick={() => openPackageSalesPage(pkg)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
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

                        {/* Clone as Draft Action Button */}
                        <button
                          onClick={() => handleCloneAsDraft(pkg)}
                          className="px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Clone as new draft package"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Clone as Draft</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(pkg)}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
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
                              Confirm Trash
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
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Categories Management Modal */}
      <PackageCategoryModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />

      {/* Right-Click Context Menu for View Modes */}
      <ViewContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        onSetDefaultView={(view, tab) => setDefaultView(view, tab)}
        onSetDefaultPackageViewMode={(mode) => setDefaultPackageViewMode(mode)}
        onSelectPackageViewMode={(mode) => setViewMode(mode)}
        onResetDefault={() => resetDefaultView()}
      />
    </div>
  );
};

