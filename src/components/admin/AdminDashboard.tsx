import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMoney, formatRawMoney } from '../../services/currencyService';
import {
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  BarChart3,
  Shield,
  Plane,
  Sparkles,
  QrCode,
  Building2,
  Calculator,
  ShoppingCart,
  CreditCard,
  Receipt,
  PieChart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArchiveRestore,
  Settings,
  Globe,
  ChevronRight,
  LogOut,
  Layers,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { BookingStatus, TourPackage } from '../../types';
import { SuppliersSection } from './SuppliersSection';
import { CostingSection } from './CostingSection';
import { PurchaseOrdersSection } from './PurchaseOrdersSection';
import { PaymentsSection } from './PaymentsSection';
import { ExpensesSection } from './ExpensesSection';
import { ProfitLossSection } from './ProfitLossSection';
import { CashFlowSection } from './CashFlowSection';
import { RecycleBinSection } from './RecycleBinSection';
import { AiCopilotSection } from './AiCopilotSection';
import { SettingsSection } from './SettingsSection';
import { UserManagementSection } from './UserManagementSection';
import { PackageManagementSection } from './PackageManagementSection';
import { ROLE_CONFIGS } from '../../services/rolePermissions';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    isStaff,
    isSuperAdmin,
    users,
    canAccessTab,
    setActiveView,
    packages,
    bookings,
    invoices,
    suppliers,
    purchaseOrders,
    expenses,
    deletedItems,
    updateBookingStatusByAdmin,
    addPackage,
    deletePackage,
    deleteBooking,
    deleteInvoice,
    setSelectedBooking,
    setSelectedInvoice,
    setActiveModal,
    getMonthlyFinancialSummary,
    currency,
    language,
    logout,
    t
  } = useApp();

  type AdminTab =
    | 'overview'
    | 'users'
    | 'bookings'
    | 'packages'
    | 'invoices'
    | 'suppliers'
    | 'costing'
    | 'purchase_orders'
    | 'payments'
    | 'expenses'
    | 'profit_loss'
    | 'cash_flow'
    | 'recycle_bin'
    | 'ai_copilot'
    | 'settings';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Package create modal state
  const [showNewPackageModal, setShowNewPackageModal] = useState(false);
  const [deletingPkgId, setDeletingPkgId] = useState<string | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [newPkgTitle, setNewPkgTitle] = useState('');
  const [newPkgDestination, setNewPkgDestination] = useState('');
  const [newPkgCountry, setNewPkgCountry] = useState('');
  const [newPkgPriceUSD, setNewPkgPriceUSD] = useState(350);
  const [newPkgDays, setNewPkgDays] = useState(4);
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgImg, setNewPkgImg] = useState('https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&auto=format&fit=crop&q=80');

  // If not logged in as staff, display authorization screen
  if (!currentUser || !isAdmin) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Staff Back-Office Restricted
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              This portal is restricted to authorized staff members. Please sign in with your corporate account ending in <span className="font-semibold text-emerald-600 dark:text-emerald-400">@khbmedia.asia</span> or <span className="font-semibold text-emerald-600 dark:text-emerald-400">@khbevents.com</span> to access the management back-office.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveModal('auth')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Staff Sign In</span>
            </button>
            <button
              onClick={() => setActiveView('marketing')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  interface NavItem {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    highlight?: boolean;
    badgeColor?: string;
  }

  interface NavGroup {
    groupTitle: string;
    items: NavItem[];
  }

  // Sidebar navigation menu grouping with RBAC permission filtering
  const RAW_NAV_GROUPS: NavGroup[] = [
    {
      groupTitle: t('navGroupExecutive'),
      items: [
        { id: 'overview' as AdminTab, label: t('navOverview'), icon: BarChart3 },
        { id: 'profit_loss' as AdminTab, label: t('navProfitLoss'), icon: PieChart },
        { id: 'cash_flow' as AdminTab, label: t('navCashFlow'), icon: TrendingUp },
        { id: 'invoices' as AdminTab, label: t('navInvoices'), icon: FileText, count: invoices.length }
      ]
    },
    {
      groupTitle: t('navGroupTrips'),
      items: [
        { id: 'packages' as AdminTab, label: t('navPackages'), icon: Plane, count: packages.length },
        { id: 'bookings' as AdminTab, label: t('navBookings'), icon: Briefcase, count: bookings.length },
        { id: 'costing' as AdminTab, label: t('navCosting'), icon: Calculator }
      ]
    },
    {
      groupTitle: t('navGroupProcurement'),
      items: [
        { id: 'suppliers' as AdminTab, label: t('navSuppliers'), icon: Building2, count: suppliers.length },
        { id: 'purchase_orders' as AdminTab, label: t('navPurchaseOrders'), icon: ShoppingCart, count: purchaseOrders.length }
      ]
    },
    {
      groupTitle: t('navGroupFinances'),
      items: [
        { id: 'payments' as AdminTab, label: t('navPayments'), icon: CreditCard },
        { id: 'expenses' as AdminTab, label: t('navExpenses'), icon: Receipt, count: expenses.length },
        { id: 'recycle_bin' as AdminTab, label: t('navRecycleBin'), icon: ArchiveRestore, count: deletedItems.length, badgeColor: 'bg-rose-500 text-white' }
      ]
    },
    {
      groupTitle: language === 'km' ? 'អភិបាលកិច្ច & សុវត្ថិភាព' : 'Governance & Security',
      items: [
        { id: 'users' as AdminTab, label: language === 'km' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់ & RBAC' : 'User Management (RBAC)', icon: Users, count: users.length },
        { id: 'ai_copilot' as AdminTab, label: t('navAiCopilot'), icon: Sparkles, highlight: true },
        { id: 'settings' as AdminTab, label: t('navSettings'), icon: Settings }
      ]
    }
  ];

  // Filter groups and items by user clearance
  const NAV_GROUPS: NavGroup[] = RAW_NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => canAccessTab(item.id))
  })).filter(group => group.items.length > 0);

  const totalRevenueUSD = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPriceUSD, 0);

  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalTaxCollectedUSD = Math.round(totalRevenueUSD * 0.07 * 100) / 100;
  const totalTravelersCount = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.numberOfAdults + b.numberOfChildren, 0);

  const financialSummary = getMonthlyFinancialSummary();

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.packageTitle.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.packageDestination.toLowerCase().includes(bookingSearch.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportTaxCSV = () => {
    const headers = ['Month', 'Total Bookings', 'Gross Revenue (USD)', 'Tax Rate (%)', 'Tax Collected (USD)', 'Net Revenue (USD)'];
    const rows = financialSummary.map(m => [
      m.month,
      m.totalBookings,
      m.grossRevenueUSD.toFixed(2),
      (m.taxRatePercent * 100).toFixed(1) + '%',
      m.taxCollectedUSD.toFixed(2),
      m.netRevenueUSD.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KHB_Tax_Report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgTitle || !newPkgDestination) return;

    addPackage({
      title: newPkgTitle,
      destination: newPkgDestination,
      country: newPkgCountry || 'Vietnam',
      coordinates: { lat: 10.8231, lng: 106.6297, mapX: 72, mapY: 58 },
      durationDays: newPkgDays,
      durationNights: Math.max(1, newPkgDays - 1),
      priceUSD: newPkgPriceUSD,
      discountPriceUSD: Math.round(newPkgPriceUSD * 0.85),
      flightIncluded: true,
      hotelStars: 4,
      rating: 5.0,
      reviewCount: 1,
      bookedThisMonth: 0,
      tags: ['trending', 'luxury', 'cultural'],
      images: [newPkgImg],
      description: newPkgDesc || 'Exclusive B2B Trade Mission organized by KHB Events.',
      highlights: ['B2B Matchmaking', '4-Star Hotel Accommodations', 'VIP Coach & Ferry Included'],
      itinerary: [
        { day: 1, title: 'Arrival & Exhibition Registration', description: 'VIP coach arrival and expo check-in.' }
      ],
      inclusions: ['VIP Coach', 'Hotel 4-Star with Breakfast', 'VIP Expo Passes', 'Customs Fast-Track'],
      exclusions: ['Personal shopping & dinners'],
      availableDates: ['2026-10-29'],
      emergencyContact: {
        police: '113',
        ambulance: '115',
        touristHelpline: '+855 60 815 515 (Mr. Tim Vutha)',
        embassySupport: '+84 24 3942 4015',
        country: newPkgCountry || 'Vietnam'
      }
    });

    setShowNewPackageModal(false);
    setNewPkgTitle('');
    setNewPkgDestination('');
  };

  const currentTabLabel = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────────────── */}
      {showMobileSidebar && (
        <div
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* ── LEFT ASIDE SIDEBAR (ENTERPRISE ERP NAVIGATION) ─────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:z-20 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xl md:shadow-none md:sticky md:top-18 md:h-[calc(100vh-4.5rem)] transition-transform duration-300 ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Top Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
                  KHB BIZ ERP
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">
                {t('backOfficeManagement')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Identity Card */}
        <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              <span>{currentUser.name.split('(')[0]}</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {currentUser.email}
            </div>
            <div className="mt-1">
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${ROLE_CONFIGS[currentUser.role]?.badgeBg || 'bg-slate-100'} ${ROLE_CONFIGS[currentUser.role]?.badgeText || 'text-slate-700'} ${ROLE_CONFIGS[currentUser.role]?.badgeBorder || 'border-slate-200'}`}>
                {ROLE_CONFIGS[currentUser.role]?.shortTitle || ROLE_CONFIGS[currentUser.role]?.title || currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.groupTitle}
              </div>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : item.highlight
                        ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className="truncate text-xs">{item.label}</span>
                    </div>

                    {item.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Bottom Footer Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 shrink-0 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveView('marketing')}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-sky-500" />
            <span>{t('viewPublicSite')}</span>
          </button>

          <button
            onClick={logout}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CONTENT AREA (RIGHT OF LEFT ASIDE) ─────────── */}
      <main className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Header Bar inside Main Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <span>{t('adminBackOffice')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentTabLabel}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentTabLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Actions Button */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>⚡ {t('quickActions')}</span>
              </button>

              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700">
                    Instant Shortcuts
                  </div>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      setActiveTab('ai_copilot');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-2.5 cursor-pointer font-bold"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>✨ Ask AI Copilot (Auto-CRUD)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      setShowNewPackageModal(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Plane className="w-4 h-4 text-sky-500" />
                    <span>New Tour Package</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      setActiveTab('purchase_orders');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                    <span>Create Purchase Order</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      setActiveTab('expenses');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-rose-500" />
                    <span>Log Trip Expense</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      setActiveTab('suppliers');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>Add Supplier</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      setActiveTab('settings');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>System Settings</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TAB: OVERVIEW ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">Total Group Revenue</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {formatMoney(totalRevenueUSD, currency, language)}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>From {confirmedBookingsCount} confirmed bookings</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">Delegates & Pax</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {totalTravelersCount} Pax
                  </div>
                  <div className="text-[11px] text-sky-600 dark:text-sky-400 font-bold flex items-center gap-0.5 mt-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{bookings.length} Total reservations</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">Active Suppliers</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {suppliers.length} Vendors
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hotels, coach & airlines</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-400">Tax & VAT Invoiced</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    {formatMoney(totalTaxCollectedUSD, currency, language)}
                  </div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5 mt-1">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>7.0% Standard VAT</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            {packages.length > 0 ? (
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    Featured Trade Mission
                  </span>
                  <h3 className="text-xl font-black mt-1">
                    {packages[0].title}
                  </h3>
                  <p className="text-xs text-white/90 mt-0.5">
                    Destination: <span className="font-bold underline">{packages[0].destination}</span> • {packages[0].durationDays} Days / {packages[0].durationNights} Nights • ${packages[0].priceUSD} USD
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-md hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Manage Delegates ({bookings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('costing')}
                    className="px-4 py-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Inspect Trip Costing
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    Catalog Ready
                  </span>
                  <h3 className="text-xl font-black mt-1">
                    Publish Your Next Business Mission Tour
                  </h3>
                  <p className="text-xs text-white/90 mt-0.5">
                    Use the "Add Tour Package" button or ask ✨ AI Operations Copilot to automatically construct and publish a new trade package.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNewPackageModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow-md hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Package</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bookings Table Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Registered Business Delegates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Latest bookings across all active trade mission packages
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  View All Bookings &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Delegate / Company</th>
                      <th className="pb-3">Travel Dates</th>
                      <th className="pb-3">Pax</th>
                      <th className="pb-3">Paid Total</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          {language === 'km' ? 'មិនទាន់មានការចុះឈ្មោះប្រតិភូនោះទេ' : 'No Delegate Bookings Found'}
                        </td>
                      </tr>
                    ) : (
                      bookings.slice(0, 5).map(b => (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {b.bookingCode}
                          </td>
                          <td className="py-3 font-bold text-slate-900 dark:text-white">
                            {b.userName}
                            <div className="text-[10px] text-slate-400 font-normal">{b.userEmail}</div>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">
                            {b.startDate} to {b.endDate}
                          </td>
                          <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {b.numberOfAdults} Adults
                          </td>
                          <td className="py-3 font-mono font-black text-slate-900 dark:text-white">
                            ${b.totalPriceUSD.toFixed(2)}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: BOOKINGS ─────────────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delegation Bookings & Travelers ({filteredBookings.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Manage traveler flight gates, hotel vouchers, and status updates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search code, name, email..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Traveler</th>
                    <th className="pb-3">Package Destination</th>
                    <th className="pb-3">Departure Date</th>
                    <th className="pb-3">Pax</th>
                    <th className="pb-3">Total (USD)</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        {language === 'km' ? 'មិនទាន់មានការចុះឈ្មោះប្រតិភូនៅឡើយទេ' : 'No Delegate Bookings Found'}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{b.bookingCode}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {b.userName}
                          <div className="text-[10px] text-slate-400 font-normal">{b.userEmail}</div>
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300">{b.packageDestination}</td>
                        <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{b.startDate}</td>
                        <td className="py-3 font-mono font-bold">{b.numberOfAdults}</td>
                        <td className="py-3 font-mono font-black">${b.totalPriceUSD}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {deletingBookingId === b.id ? (
                            <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteBooking(b.id);
                                  setDeletingBookingId(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingBookingId(null)}
                                className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingBookingId(b.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: PACKAGES ─────────────────────────────────────────────── */}
        {activeTab === 'packages' && (
          <div className="animate-in fade-in duration-200">
            <PackageManagementSection />
          </div>
        )}

        {/* ── TAB: INVOICES ─────────────────────────────────────────────── */}
        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tax Invoices & Official Receipts ({invoices.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Download accountant CSV or inspect statutory VAT invoices.
                </p>
              </div>
              <button
                onClick={handleExportTaxCSV}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Tax CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Invoice #</th>
                    <th className="pb-3">Customer / Company</th>
                    <th className="pb-3">Issue Date</th>
                    <th className="pb-3">Subtotal</th>
                    <th className="pb-3">VAT Tax</th>
                    <th className="pb-3">Total USD</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        {language === 'km' ? 'មិនទាន់មានវិក្កយបត្រពន្ធនៅឡើយទេ' : 'No Invoices Generated Yet'}
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{inv.customerName}</td>
                        <td className="py-3 font-mono text-slate-500">{inv.issueDate}</td>
                        <td className="py-3 font-mono">${inv.subtotalUSD.toFixed(2)}</td>
                        <td className="py-3 font-mono text-purple-600">${inv.taxAmountUSD.toFixed(2)}</td>
                        <td className="py-3 font-mono font-black">${inv.totalUSD.toFixed(2)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {inv.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ERP & GOVERNANCE SUB-SECTIONS ───────────────────────────── */}
        {activeTab === 'users' && <div className="animate-in fade-in duration-200"><UserManagementSection /></div>}
        {activeTab === 'suppliers' && <div className="animate-in fade-in duration-200"><SuppliersSection /></div>}
        {activeTab === 'costing' && <div className="animate-in fade-in duration-200"><CostingSection /></div>}
        {activeTab === 'purchase_orders' && <div className="animate-in fade-in duration-200"><PurchaseOrdersSection /></div>}
        {activeTab === 'payments' && <div className="animate-in fade-in duration-200"><PaymentsSection /></div>}
        {activeTab === 'expenses' && <div className="animate-in fade-in duration-200"><ExpensesSection /></div>}
        {activeTab === 'profit_loss' && <div className="animate-in fade-in duration-200"><ProfitLossSection /></div>}
        {activeTab === 'cash_flow' && <div className="animate-in fade-in duration-200"><CashFlowSection /></div>}
        {activeTab === 'recycle_bin' && <div className="animate-in fade-in duration-200"><RecycleBinSection /></div>}
        {activeTab === 'ai_copilot' && <div className="animate-in fade-in duration-200"><AiCopilotSection /></div>}
        {activeTab === 'settings' && <div className="animate-in fade-in duration-200"><SettingsSection /></div>}

        {/* ── CREATE TOUR PACKAGE MODAL ─────────────────────────────────── */}
        {showNewPackageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white">Create New Tour Package</h3>
                <button onClick={() => setShowNewPackageModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleCreatePackage} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Title</label>
                  <input
                    type="text"
                    required
                    value={newPkgTitle}
                    onChange={(e) => setNewPkgTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    placeholder="e.g. Thailand B2B Franchise Expo 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Destination</label>
                    <input
                      type="text"
                      required
                      value={newPkgDestination}
                      onChange={(e) => setNewPkgDestination(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      placeholder="e.g. Bangkok & Pattaya"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Price (USD)</label>
                    <input
                      type="number"
                      required
                      value={newPkgPriceUSD}
                      onChange={(e) => setNewPkgPriceUSD(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowNewPackageModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Publish Package</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
