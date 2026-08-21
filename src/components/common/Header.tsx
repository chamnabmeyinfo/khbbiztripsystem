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
  ChevronRight,
  Fingerprint,
  Menu,
  X,
  Plane,
  CheckCircle,
  Palette,
  Sparkles,
  Settings,
  Sliders,
  CreditCard,
  Building2,
  Database,
  Lock,
  ArrowRight,
  Receipt
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
    navigateToSettings,
    t
  } = useApp();

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCurrDropdown, setShowCurrDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
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
            {t('reconnect') || 'Reconnect'}
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
                  {systemSettings?.companyTagline || t('tagline')}
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
                    {t('selectCurrency') || 'Select Currency'}
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
                      {language === 'km' ? 'កម្មវិធីគណនាប្តូរប្រាក់ ↗' : 'Open Currency Converter ↗'}
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

            {/* Settings & Options Hub Trigger */}
            <div className="relative">
              <button
                id="header-settings-options-trigger"
                onClick={() => {
                  setShowSettingsDropdown(!showSettingsDropdown);
                  setShowLangDropdown(false);
                  setShowCurrDropdown(false);
                  setShowNotifDropdown(false);
                  setShowUserDropdown(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer group shadow-xs ${
                  showSettingsDropdown
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/25 ring-2 ring-indigo-500/30'
                    : 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
                title={language === 'km' ? 'ការកំណត់ប្រព័ន្ធ & ជម្រើស' : 'System Settings & Options'}
                aria-label="Settings and Options"
                aria-expanded={showSettingsDropdown}
              >
                <div className="relative flex items-center justify-center">
                  <Settings
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showSettingsDropdown
                        ? 'rotate-90 text-white'
                        : 'text-indigo-600 dark:text-indigo-400 group-hover:rotate-45'
                    }`}
                  />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                </div>
                <span className="hidden xl:inline text-xs font-bold tracking-tight">
                  {language === 'km' ? 'ការកំណត់' : 'Settings'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showSettingsDropdown ? 'rotate-180 opacity-100 text-white' : 'opacity-60 group-hover:opacity-100'
                  }`}
                />
              </button>

              {/* Settings & Options Dropdown Menu */}
              {showSettingsDropdown && (
                <div
                  className={`absolute ${
                    rtl ? 'left-0' : 'right-0'
                  } mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
                >
                  {/* Top Header Ribbon & Quick Direct Navigation */}
                  <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{language === 'km' ? 'ការកំណត់ & ជម្រើសប្រព័ន្ធ' : 'Settings & Options Hub'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'km' ? 'ជ្រើសរើសជម្រើសដើម្បីចូលទៅកាន់ទំព័រការកំណត់' : 'Select an option to open in Settings'}
                      </p>
                    </div>
                  </div>

                  {/* Direct Launch Full Settings Action */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('features');
                      }}
                      className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-xs font-bold flex items-center justify-between shadow-md shadow-indigo-500/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/20 text-white">
                          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        <div className="text-left">
                          <div className="font-extrabold text-xs">
                            {language === 'km' ? 'ចូលទៅផ្ទាំងគ្រប់គ្រងការកំណត់' : 'Go to System Settings'}
                          </div>
                          <div className="text-[10px] text-indigo-100 font-normal">
                            {language === 'km' ? 'មើល និងកែប្រែជម្រើសប្រព័ន្ធទាំងអស់' : 'View and customize all configuration options'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Settings Option Categories */}
                  <div className="px-2 py-1 max-h-80 overflow-y-auto space-y-1">
                    {/* Option 1: AI Theme & Color Studio */}
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('theme');
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/60 group-hover:scale-105 transition-transform">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{language === 'km' ? 'ស្ទីលពណ៌ & ពុម្ពអក្សរ AI' : 'AI Theme & Color Studio'}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">AI</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'km' ? 'កែប្រែពណ៌ប្រធានបទ ពុម្ពអក្សរខ្មែរ & ទំហំ' : 'Color palette presets, Khmer typography & scales'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Option 2: Trade Mission & Branding */}
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('branding');
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60 group-hover:scale-105 transition-transform">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === 'km' ? 'ព័ត៌មានម៉ាកសញ្ញា & គណៈប្រតិភូ' : 'Trade Mission & Brand Profile'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'km' ? 'ឡូហ្គោក្រុមហ៊ុន ព័ត៌មានអ្នកសម្របសម្រួល & ហត្ថលេខា' : 'Company logo, banner, lead coordinator & credentials'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Option 3: Feature Modules & Controls */}
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('features');
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === 'km' ? 'ម៉ូឌុលមុខងារ & គោលការណ៍' : 'Feature Controls & Flags'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'km' ? 'បើក/បិទ AI Copilot, ការកក់, វិក្កយបត្រពន្ធ' : 'Toggle AI Copilot, Customer Booking, Tax Invoicing'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Option 4: Payment Gateways */}
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('payments');
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800/60 group-hover:scale-105 transition-transform">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === 'km' ? 'ច្រកទូទាត់ប្រាក់ (Gateways)' : 'Payment Gateways & QR'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'km' ? 'ABA PayWay, ACLEDA X-Pay, Wing, កាតឥណទាន' : 'ABA PayWay, ACLEDA, Wing, Biometric & Cards'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Option 5: Financial Defaults & VAT */}
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('financials');
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/60 group-hover:scale-105 transition-transform">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === 'km' ? 'អត្រាពន្ធ VAT & កម្រៃប្រាក់ចំណេញ' : 'VAT Tax, Margins & Defaults'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'km' ? 'អត្រាពន្ធ VAT %, ភាគរយចំណេញ និងចំនួនក្រុម' : 'Default VAT rate %, adult profit margins & min group size'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Option 6: Security & Governance */}
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('security');
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800/60 group-hover:scale-105 transition-transform">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === 'km' ? 'សុវត្ថិភាព & ការគ្រប់គ្រង RBAC' : 'Security & Access Governance'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'km' ? 'ដែនដី Admin, ការផ្ទៀងផ្ទាត់ជីវមាត្រ & សិទ្ធិ' : 'Admin domain restriction, biometrics & clearance tiers'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Option 7: Backup & JSON Recovery */}
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        navigateToSettings('backup');
                      }}
                      className="w-full p-2 rounded-xl text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/60 group-hover:scale-105 transition-transform">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {language === 'km' ? 'បម្រុងទុក & ស្តារទិន្នន័យ (JSON)' : 'System Backup & Data Recovery'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {language === 'km' ? 'នាំចេញ/នាំចូល JSON និងការសម្អាត Recycle Bin' : 'Full loss-free JSON export, import & purge rules'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>

                  {/* Bottom Modal Shortcut */}
                  <div className="px-3 pt-2.5 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        setShowThemeModal(true);
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === 'km' ? 'បើកផ្ទាំង AI Theme Generator Modal ↗' : 'Launch AI Theme Generator Modal ↗'}</span>
                    </button>
                  </div>
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
