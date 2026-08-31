import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCY_CONFIGS } from '../../services/currencyService';
import { isRTL, SUPPORTED_LANGUAGES } from '../../i18n/translations';
import { LanguageCode, CurrencyCode, UserRole } from '../../types';
import { ROLE_CONFIGS, isStaffMember } from '../../services/rolePermissions';
import {
  Compass,
  Globe,
  DollarSign,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Bell,
  User,
  Shield,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Fingerprint,
  Menu,
  X,
  Plane,
  CheckCircle,
  Building2,
  Receipt,
  Sparkles,
  ArrowRight,
  Trash2,
  CheckCheck,
  Filter,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Star
} from 'lucide-react';
import { ViewContextMenu, ViewContextMenuState } from './ViewContextMenu';
import { AutoSaveStatusPill } from './AutoSaveStatusPill';

export const Header: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    isStaff,
    language,
    currency,
    darkMode,
    offlineMode,
    notifications,
    unreadNotificationCount,
    activeView,
    systemSettings,
    defaultView,
    setDefaultView,
    resetDefaultView,
    setActiveView,
    setAdminActiveTab,
    setLanguage,
    setCurrency,
    toggleDarkMode,
    toggleOfflineMode,
    setActiveModal,
    switchRole,
    logout,
    markNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    clearAllNotifications,
    handleNotificationClick,
    navigateToSettings,
    t
  } = useApp();

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCurrDropdown, setShowCurrDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'leads' | 'bookings'>('all');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewContextMenu, setViewContextMenu] = useState<ViewContextMenuState | null>(null);

  const handleOpenViewContextMenu = (
    e: React.MouseEvent,
    targetView: typeof activeView,
    title: string,
    subtitle?: string
  ) => {
    e.preventDefault();
    setViewContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      targetView,
      title,
      subtitle,
      isCurrentDefaultView: defaultView === targetView
    });
  };

  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const target = event.target as Node;
      if (langRef.current && !langRef.current.contains(target)) {
        setShowLangDropdown(false);
      }
      if (currRef.current && !currRef.current.contains(target)) {
        setShowCurrDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setShowUserDropdown(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLangDropdown(false);
        setShowCurrDropdown(false);
        setShowNotifDropdown(false);
        setShowUserDropdown(false);
      }
    };

    // Using capture: true ensures outside clicks are caught even if child elements prevent bubbling
    document.addEventListener('pointerdown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleCurrDropdown = () => {
    setShowCurrDropdown(prev => !prev);
    setShowLangDropdown(false);
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  };

  const toggleLangDropdown = () => {
    setShowLangDropdown(prev => !prev);
    setShowCurrDropdown(false);
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  };

  const toggleNotifDropdown = () => {
    setShowNotifDropdown(prev => !prev);
    setShowCurrDropdown(false);
    setShowLangDropdown(false);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(prev => !prev);
    setShowCurrDropdown(false);
    setShowLangDropdown(false);
    setShowNotifDropdown(false);
  };

  const rtl = isRTL(language);

  const enabledCodes = systemSettings?.enabledLanguages || ['en', 'km', 'ar', 'he', 'es', 'ja', 'zh', 'vi', 'th', 'fr', 'ko', 'de'];
  const languagesList = SUPPORTED_LANGUAGES.filter(l => enabledCodes.includes(l.code)).map(l => ({
    code: l.code,
    label: l.label,
    native: l.nativeName,
    flag: l.flag
  }));

  return (
    <header className="sticky top-0 z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Offline Mode Banner when active */}
      {offlineMode && (
        <div className="bg-amber-500 text-slate-950 text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>{t('offlineMode')} — {t('offlineNotice')}</span>
          <button
            onClick={toggleOfflineMode}
            className="underline hover:text-white ml-2 text-xs cursor-pointer"
          >
            {t('reconnect') || 'Reconnect'}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setActiveView('marketing')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer min-w-0"
            >
              {systemSettings?.companyLogoUrl ? (
                <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-800 p-0.5 sm:p-1 border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-900/5 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={systemSettings.companyLogoUrl}
                    alt={systemSettings.companyName || 'Trade Mission'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-[spin_20s_linear_infinite]" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm sm:text-lg lg:text-xl font-black tracking-tight bg-gradient-to-r from-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400 bg-clip-text text-transparent block truncate max-w-[130px] xs:max-w-[190px] sm:max-w-xs">
                  {systemSettings?.companyName ? systemSettings.companyName.split('—')[0].trim() : t('appName')}
                </span>
                <span className="hidden sm:block text-[10px] text-slate-600 dark:text-slate-300 font-bold tracking-wide uppercase truncate max-w-[220px]">
                  {systemSettings?.companyTagline || t('tagline')}
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveView('marketing')}
              onContextMenu={(e) =>
                handleOpenViewContextMenu(
                  e,
                  'marketing',
                  t('explorePackages') || 'Explore Packages',
                  'Public Tour Catalog Landing'
                )
              }
              title={
                defaultView === 'marketing'
                  ? '⭐ Current Default View (Right-click for options)'
                  : 'Right-click to set as default startup view'
              }
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'marketing'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{t('explorePackages')}</span>
              {defaultView === 'marketing' && (
                <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveModal('auth');
                } else {
                  setActiveView('customer_portal');
                }
              }}
              onContextMenu={(e) =>
                handleOpenViewContextMenu(
                  e,
                  'customer_portal',
                  t('myTrips') || 'My Trips Portal',
                  'Customer Booking & Itinerary Dashboard'
                )
              }
              title={
                defaultView === 'customer_portal'
                  ? '⭐ Current Default View (Right-click for options)'
                  : 'Right-click to set as default startup view'
              }
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'customer_portal'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{t('myTrips')}</span>
              {defaultView === 'customer_portal' && (
                <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
              )}
            </button>

            {(isAdmin || isStaff || currentUser?.email?.toLowerCase().trim() === 'chamnabmey.info@gmail.com') && (
              <button
                onClick={() => setActiveView('admin_dashboard')}
                onContextMenu={(e) =>
                  handleOpenViewContextMenu(
                    e,
                    'admin_dashboard',
                    t('adminDashboard') || 'Admin Dashboard',
                    'Back-Office Enterprise Management ERP'
                  )
                }
                title={
                  defaultView === 'admin_dashboard'
                    ? '⭐ Current Default View (Right-click for options)'
                    : 'Right-click to set as default startup view'
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'admin_dashboard'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{t('adminDashboard')}</span>
                {defaultView === 'admin_dashboard' && (
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                )}
              </button>
            )}
          </nav>

          {/* Right Action Icons: Language, Currency, Notifications, Dark Mode, Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Offline Toggle Tool (Desktop) */}
            <button
              onClick={toggleOfflineMode}
              title={offlineMode ? 'Switch to Online Mode' : 'Simulate Offline Mode (PWA)'}
              className={`hidden md:flex p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer items-center gap-1 ${
                offlineMode
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {offlineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </button>

            {/* Currency Selector & Converter Button (Desktop) */}
            <div ref={currRef} className="hidden md:block relative">
              <button
                onClick={toggleCurrDropdown}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  showCurrDropdown
                    ? 'bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                aria-expanded={showCurrDropdown}
              >
                <span>{CURRENCY_CONFIGS[currency].flag}</span>
                <span>{currency}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showCurrDropdown ? 'rotate-180 text-sky-500' : ''}`} />
              </button>

              {showCurrDropdown && (
                <div
                  className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    {t('selectCurrency') || 'Select Currency'}
                  </div>
                  {Object.values(CURRENCY_CONFIGS).map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setShowCurrDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                        currency === curr.code
                          ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50/50 dark:bg-slate-700/50'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{curr.flag}</span>
                        <span>{curr.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{curr.code}</span>
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setShowCurrDropdown(false);
                        setActiveModal('currency');
                      }}
                      className="w-full text-center py-1 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                    >
                      {language === 'km' ? 'កម្មវិធីគណនាប្តូរប្រាក់ ↗' : 'Open Currency Converter ↗'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector (Desktop) */}
            <div ref={langRef} className="hidden md:block relative">
              <button
                onClick={toggleLangDropdown}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  showLangDropdown
                    ? 'bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                aria-expanded={showLangDropdown}
              >
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showLangDropdown ? 'rotate-180 text-sky-500' : ''}`} />
              </button>

              {showLangDropdown && (
                <div
                  className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-52 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    Language / ភាសា
                  </div>
                  {languagesList.map(langItem => (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setLanguage(langItem.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer transition-colors ${
                        language === langItem.code
                          ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50/50 dark:bg-slate-700/50'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{langItem.flag}</span>
                        <span>{langItem.native}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{langItem.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auto-Save & Cloud Database Status Pill */}
            <AutoSaveStatusPill variant="compact" className="hidden md:inline-flex" />

            {/* Push Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={toggleNotifDropdown}
                className={`p-2 rounded-lg transition-all relative cursor-pointer ${
                  showNotifDropdown
                    ? 'bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-label="Notifications"
                title="Notifications & Alerts"
                aria-expanded={showNotifDropdown}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {showNotifDropdown && (
                <div
                  className={`fixed inset-x-3 top-16 max-w-sm mx-auto sm:static sm:inset-x-auto sm:top-auto sm:absolute ${rtl ? 'sm:left-0' : 'sm:right-0'} sm:mt-2 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}
                >
                  {/* Header Bar */}
                  <div className="px-4 pb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t('notifications')}
                      </span>
                      {unreadNotificationCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          {unreadNotificationCount} new
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          ({notifications.length})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationsAsRead();
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAllNotifications();
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Clear all alerts"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Chips */}
                  <div className="px-3 pt-2 pb-1.5 flex items-center gap-1 overflow-x-auto border-b border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => setNotifFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        notifFilter === 'all'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter('unread')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        notifFilter === 'unread'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Unread ({unreadNotificationCount})
                    </button>
                    <button
                      onClick={() => setNotifFilter('leads')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        notifFilter === 'leads'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Won Leads & CRM
                    </button>
                    <button
                      onClick={() => setNotifFilter('bookings')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        notifFilter === 'bookings'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Bookings & Trips
                    </button>
                  </div>

                  {/* Notification List Items */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 py-1">
                    {(() => {
                      const displayedList = notifications.filter(n => {
                        if (notifFilter === 'unread') return !n.read;
                        if (notifFilter === 'leads') {
                          return n.type === 'lead_won' || n.type === 'crm' || n.type === 'task' || n.title.toLowerCase().includes('lead') || n.title.toLowerCase().includes('handover');
                        }
                        if (notifFilter === 'bookings') {
                          return n.type === 'booking' || n.type === 'flight' || n.type === 'hotel' || n.title.toLowerCase().includes('booking') || n.title.toLowerCase().includes('flight');
                        }
                        return true;
                      });

                      if (displayedList.length === 0) {
                        return (
                          <div className="py-8 px-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                              <Bell className="w-5 h-5 opacity-40" />
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              No notifications found
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {notifFilter !== 'all' ? 'Try switching filter tabs above.' : 'All operational alerts are cleared.'}
                            </p>
                          </div>
                        );
                      }

                      return displayedList.map(notif => {
                        const isWonLead = notif.type === 'lead_won' || notif.title.toLowerCase().includes('lead') || notif.title.toLowerCase().includes('handover');
                        const isFlight = notif.type === 'flight' || notif.title.toLowerCase().includes('flight');
                        const isHotel = notif.type === 'hotel';
                        const isBooking = notif.type === 'booking';
                        const isFinance = notif.type === 'finance' || notif.title.toLowerCase().includes('vat') || notif.title.toLowerCase().includes('invoice') || notif.title.toLowerCase().includes('tax');
                        const isChat = notif.type === 'chat';

                        let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                        let icon = <Bell className="w-3.5 h-3.5 text-slate-500" />;
                        let actionPrompt = 'Click to open details';

                        if (isWonLead) {
                          badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
                          icon = <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
                          actionPrompt = 'Review Handover Checklist ↗';
                        } else if (isFlight) {
                          badgeColor = 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
                          icon = <Plane className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
                          actionPrompt = 'Check Flight Status ↗';
                        } else if (isHotel) {
                          badgeColor = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
                          icon = <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
                          actionPrompt = 'View Hotel Details ↗';
                        } else if (isBooking) {
                          badgeColor = 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800';
                          icon = <CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
                          actionPrompt = 'Open Booking & Voucher ↗';
                        } else if (isFinance) {
                          badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
                          icon = <Receipt className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
                          actionPrompt = 'View Tax Invoice ↗';
                        } else if (isChat) {
                          badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
                          icon = <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
                          actionPrompt = 'Open Concierge Chat ↗';
                        }

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setShowNotifDropdown(false);
                              handleNotificationClick(notif);
                            }}
                            className={`group p-3 transition-all cursor-pointer relative hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                              !notif.read ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Icon Badge */}
                              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}>
                                {icon}
                              </div>

                              {/* Notification Body */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-xs font-semibold truncate ${
                                    !notif.read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {notif.title}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      {notif.timestamp}
                                    </span>
                                    {!notif.read && (
                                      <span className="w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
                                    )}
                                  </div>
                                </div>

                                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                                  {notif.message}
                                </p>

                                {/* Action Cue Footer */}
                                <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/50">
                                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 flex items-center gap-1">
                                    <span>{actionPrompt}</span>
                                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                                  </span>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notif.read ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markNotificationAsRead(notif.id);
                                        }}
                                        className="p-1 text-slate-400 hover:text-sky-600 rounded transition-colors"
                                        title="Mark as read"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                      </button>
                                    ) : null}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notif.id);
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                      title="Remove notification"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Fast Navigation Shortcut Bar */}
                  <div className="px-3 pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    {isAdmin || isStaff ? (
                      <>
                        <button
                          onClick={() => {
                            setShowNotifDropdown(false);
                            setActiveView('admin_dashboard');
                            setAdminActiveTab('inbound_leads');
                          }}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Won Leads Handover</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowNotifDropdown(false);
                            setActiveView('admin_dashboard');
                            setAdminActiveTab('bookings');
                          }}
                          className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>All Bookings</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowNotifDropdown(false);
                            setActiveView('customer_portal');
                          }}
                          className="font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plane className="w-3 h-3" />
                          <span>My Trips & Vouchers</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowNotifDropdown(false);
                            setActiveView('marketing');
                          }}
                          className="font-semibold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore Tours</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={toggleUserDropdown}
                  className={`flex items-center gap-2 pl-2 pr-2 py-1 rounded-xl transition-all cursor-pointer shadow-2xs border ${
                    showUserDropdown
                      ? 'bg-slate-100 dark:bg-slate-800 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50'
                  }`}
                  aria-expanded={showUserDropdown}
                >
                  <div className="relative shrink-0">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-slate-900" />
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                      {currentUser.name.split('(')[0].trim()}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                      {ROLE_CONFIGS[currentUser.role]?.shortTitle || ROLE_CONFIGS[currentUser.role]?.title || 'Staff'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180 text-sky-500' : ''}`} />
                </button>

                {showUserDropdown && (
                  <div
                    className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150`}
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {isStaffMember(currentUser) ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_CONFIGS[currentUser.role]?.badgeColor || 'bg-emerald-100 text-emerald-700'}`}>
                            <Shield className="w-2.5 h-2.5" />
                            <span>{ROLE_CONFIGS[currentUser.role]?.displayName || 'KHB Staff Member'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                            Verified Delegate / Traveler
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveView('customer_portal');
                        }}
                        className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 text-sky-500" />
                        {t('myTrips')}
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveModal('profile_settings');
                        }}
                        className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Fingerprint className="w-4 h-4 text-teal-500" />
                        {t('setupBiometrics')} & Settings
                      </button>

                      {(isAdmin || isStaff || currentUser?.email?.toLowerCase().trim() === 'chamnabmey.info@gmail.com') ? (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setActiveView('admin_dashboard');
                          }}
                          className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                        >
                          <Shield className="w-4 h-4" />
                          {t('adminBackOffice')}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setActiveModal('auth');
                          }}
                          className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-emerald-600" />
                          <span>Staff Login (khbevents.com)</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium cursor-pointer"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveModal('auth')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-sky-500/20 hover:from-sky-700 hover:to-teal-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('signIn')}</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3.5 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          {/* User Profile / Sign-in Card */}
          {currentUser ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center gap-3">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</div>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Shield className="w-2.5 h-2.5" />
                      <span>{ROLE_CONFIGS[currentUser.role]?.displayName || 'Member'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveModal('profile_settings');
                  }}
                  className="py-2 px-3 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-teal-500" />
                  <span>{t('settings') || 'Settings'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{t('logout') || 'Sign Out'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-600/10 via-indigo-600/10 to-teal-600/10 border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('welcomeGuest') || 'Welcome Delegate'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sign in to access verified vouchers & itineraries
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('auth');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 shrink-0 cursor-pointer"
              >
                {t('signIn')}
              </button>
            </div>
          )}

          {/* Navigation Views */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveView('marketing');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                activeView === 'marketing'
                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-sky-500" />
                <span>{t('explorePackages')}</span>
              </div>
              {defaultView === 'marketing' && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />}
            </button>

            <button
              onClick={() => {
                if (!currentUser) setActiveModal('auth');
                else setActiveView('customer_portal');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                activeView === 'customer_portal'
                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-sky-500" />
                <span>{t('myTrips')}</span>
              </div>
              {defaultView === 'customer_portal' && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />}
            </button>

            {(isAdmin || isStaff) && (
              <button
                onClick={() => {
                  setActiveView('admin_dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  activeView === 'admin_dashboard'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>{t('adminDashboard')}</span>
                </div>
                {defaultView === 'admin_dashboard' && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />}
              </button>
            )}
          </div>

          {/* Language Switcher Bar */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>Language / ភាសា</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {languagesList.map(langItem => (
                <button
                  key={langItem.code}
                  onClick={() => setLanguage(langItem.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                    language === langItem.code
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{langItem.flag}</span>
                  <span>{langItem.native}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Switcher Bar */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Currency / រូបិយប័ណ្ណ</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveModal('currency');
                }}
                className="text-sky-600 dark:text-sky-400 lowercase font-semibold hover:underline"
              >
                Converter ↗
              </button>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {Object.values(CURRENCY_CONFIGS).map(curr => (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer font-mono ${
                    currency === curr.code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{curr.flag}</span>
                  <span>{curr.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode & Offline Toggle Rows */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-1.5">
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>{darkMode ? 'Light' : 'Dark'}</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">{darkMode ? 'On' : 'Off'}</span>
            </button>

            <button
              onClick={toggleOfflineMode}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-between cursor-pointer border ${
                offlineMode
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {offlineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                <span>Offline</span>
              </div>
              <span className="text-[10px] uppercase font-mono">{offlineMode ? 'Active' : 'Off'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating View Context Menu on Right Click */}
      <ViewContextMenu
        menu={viewContextMenu}
        onClose={() => setViewContextMenu(null)}
        onSetDefaultView={(view) => {
          setDefaultView(view);
          setViewContextMenu(null);
        }}
        onResetDefault={() => {
          resetDefaultView();
          setViewContextMenu(null);
        }}
        onOpenView={(view) => {
          setActiveView(view);
          setViewContextMenu(null);
        }}
      />
    </header>
  );
};
