import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Globe,
  DollarSign,
  Moon,
  Sun,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  Wifi,
  WifiOff,
  Bell
} from 'lucide-react';
import { LanguageCode, CurrencyCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../i18n/translations';
import { CURRENCY_CONFIGS } from '../../services/currencyService';

export const ProfileSettingsModal: React.FC = () => {
  const {
    currentUser,
    activeModal,
    setActiveModal,
    language,
    setLanguage,
    currency,
    setCurrency,
    darkMode,
    setDarkMode,
    offlineMode,
    setOfflineMode,
    authenticateBiometric,
    t
  } = useApp();

  const [biometricEnabled, setBiometricEnabled] = useState(currentUser?.biometricEnabled ?? true);
  const [notificationStatus, setNotificationStatus] = useState(true);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  if (activeModal !== 'profile') return null;

  const handleToggleBiometric = async () => {
    if (!biometricEnabled) {
      const ok = await authenticateBiometric();
      if (ok) setBiometricEnabled(true);
    } else {
      setBiometricEnabled(false);
    }
  };

  const handleSave = () => {
    setShowSavedMsg(true);
    setTimeout(() => {
      setShowSavedMsg(false);
      setActiveModal(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('profile')} & Preferences
            </h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* User Info Pill */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm">
              {currentUser?.name ? currentUser.name[0] : 'T'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {currentUser?.name || 'Traveler User'}
              </h4>
              <p className="text-[11px] text-slate-500 truncate font-mono">
                {currentUser?.email || 'traveler@example.com'} • {currentUser?.role === 'admin' ? 'STAFF / ADMIN (khbevents.com)' : 'VERIFIED TRAVELER'}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>{t('language')} (with auto RTL layout)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    language === lang.code
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </span>
                  {lang.dir === 'rtl' && (
                    <span className="text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                      RTL
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-500" />
              <span>Display & Booking Currency</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
            >
              {Object.values(CURRENCY_CONFIGS).map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.symbol}) — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preferences Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* Biometric Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Biometric WebAuthn</div>
                  <div className="text-[10px] text-slate-400">Touch ID / Face ID quick unlock</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleBiometric}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  biometricEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    biometricEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Theme Appearance</div>
                  <div className="text-[10px] text-slate-400">{darkMode ? 'Dark OLED mode' : 'Crisp Light mode'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  darkMode ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    darkMode ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Offline Cache Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {offlineMode ? <WifiOff className="w-4 h-4 text-amber-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Simulate Offline Mode</div>
                  <div className="text-[10px] text-slate-400">Test offline cached voucher rendering</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOfflineMode(!offlineMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  offlineMode ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    offlineMode ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {showSavedMsg ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
