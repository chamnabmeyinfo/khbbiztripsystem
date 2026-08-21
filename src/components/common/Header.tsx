import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCY_CONFIGS } from '../../services/currencyService';
import { isRTL } from '../../i18n/translations';
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
  Fingerprint,
  Menu,
  X,
  Plane,
  CheckCircle,
  Palette,
  Sparkles
} from 'lucide-react';
import { AiThemeColorDetectorModal } from '../admin/AiThemeColorDetectorModal';

export const Header: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    language,
    currency,
    darkMode,
    offlineMode,
    notifications,
    unreadNotificationCount,
    activeView,
    systemSettings,
    setActiveView,
    setLanguage,
    setCurrency,
    toggleDarkMode,
    toggleOfflineMode,
    setActiveModal,
    switchRole,
    logout,
    markNotificationsAsRead,
    t
  } = useApp();

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCurrDropdown, setShowCurrDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rtl = isRTL(language);

  const languagesList: { code: LanguageCode; label: string; native: string; flag: string }[] = [
    { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'km', label: 'Khmer', native: 'ភាសាខ្មែរ', flag: '🇰🇭' },
    { code: 'ar', label: 'Arabic', native: 'العربية (RTL)', flag: '🇦🇪' },
    { code: 'he', label: 'Hebrew', native: 'עברית (RTL)', flag: '🇮🇱' },
    { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'ja', label: 'Japanese', native: '日本語 (CJK)', flag: '🇯🇵' },
  ];

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
            Reconnect
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('marketing')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              {systemSettings?.companyLogoUrl ? (
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-900/5 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
                  <img
                    src={systemSettings.companyLogoUrl}
                    alt={systemSettings.companyName || 'Trade Mission'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6 animate-[spin_20s_linear_infinite]" />
                </div>
              )}
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400 bg-clip-text text-transparent block truncate max-w-[200px] sm:max-w-xs">
                  {systemSettings?.companyName ? systemSettings.companyName.split('—')[0].trim() : t('appName')}
                </span>
                <span className="hidden sm:block text-[10px] text-slate-600 dark:text-slate-300 font-bold tracking-wide uppercase truncate max-w-[220px]">
                  {systemSettings?.companyTagline || 'B2B Trade Delegation'}
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveView('marketing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'marketing'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('explorePackages')}
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveModal('auth');
                } else {
                  setActiveView('customer_portal');
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === 'customer_portal'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              {t('myTrips')}
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveView('admin_dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'admin_dashboard'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                {t('adminDashboard')}
              </button>
            )}
          </nav>

          {/* Right Action Icons: Language, Currency, Notifications, Dark Mode, Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Offline Toggle Tool */}
            <button
              onClick={toggleOfflineMode}
              title={offlineMode ? 'Switch to Online Mode' : 'Simulate Offline Mode (PWA)'}
              className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                offlineMode
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {offlineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </button>

            {/* Currency Selector & Converter Button */}
            <div className="relative">
              <button
                onClick={() => setShowCurrDropdown(!showCurrDropdown)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <span>{CURRENCY_CONFIGS[currency].flag}</span>
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showCurrDropdown && (
                <div
                  className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95`}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    Select Currency
                  </div>
                  {Object.values(CURRENCY_CONFIGS).map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setShowCurrDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer ${
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
                      Open Currency Converter ↗
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangDropdown && (
                <div
                  className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50`}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    Language / اللغة
                  </div>
                  {languagesList.map(langItem => (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setLanguage(langItem.code);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer ${
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

            {/* AI Theme & Color Template Trigger */}
            <button
              onClick={() => setShowThemeModal(true)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group"
              title="AI Color Detection & UI Theme Studio"
              aria-label="AI Theme & Colors"
            >
              <Palette className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Push Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown) markNotificationsAsRead();
                }}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                aria-label="Notifications"
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
                  className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50`}
                >
                  <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('notifications')}
                    </span>
                    <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                      {notifications.length} alerts
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                            <span>{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div
                    className={`absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50`}
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

                      {isAdmin ? (
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
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {currentUser && (
            <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
              <button
                onClick={() => {
                  setActiveView('customer_portal');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Plane className="w-4 h-4" />
                {t('travelerPortal')}
              </button>
              {isAdmin ? (
                <button
                  onClick={() => {
                    setActiveView('admin_dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {t('adminBackOffice')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveModal('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Staff Login</span>
                </button>
              )}
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveView('marketing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('explorePackages')}
            </button>
            <button
              onClick={() => {
                if (!currentUser) setActiveModal('auth');
                else setActiveView('customer_portal');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('myTrips')}
            </button>
          </div>
        </div>
      )}

      {/* AI Theme & Color Detector Modal */}
      <AiThemeColorDetectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
    </header>
  );
};
