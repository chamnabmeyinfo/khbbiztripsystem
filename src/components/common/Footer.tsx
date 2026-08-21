import React from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENCY_CONFIGS } from '../../services/currencyService';
import { LanguageCode, CurrencyCode } from '../../types';
import { Compass, ShieldCheck, PhoneCall, Globe2, Heart, Award, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, currency, setLanguage, setCurrency, setActiveView, setActiveModal, isAdmin, t } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-teal-400 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Compass className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{t('appName')}</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {t('tagline')}. Fully licensed global tour operator delivering end-to-end curated journeys, automated invoicing, and 24/7 emergency concierge support.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified IATA Tour Operator</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Featured Escapes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">Kyoto Cherry Blossom</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">Amalfi Coast & Capri</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">Bali Ubud & Nusa Penida</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">Swiss Alps Glacier Express</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">Iceland Glacial Northern Lights</button></li>
            </ul>
          </div>

          {/* Traveler Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Concierge & Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">My Itineraries & Vouchers</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">Flight & Hotel Status Tracker</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">Offline Travel Access</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">Official VAT Tax Invoicing</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">Biometric Sign-in Setup</button></li>
            </ul>
          </div>

          {/* Language & Currency in Footer */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Regional Settings
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="en">English (US)</option>
                  <option value="km">ភាសាខ្មែរ (Khmer)</option>
                  <option value="ar">العربية (Arabic - RTL)</option>
                  <option value="he">עברית (Hebrew - RTL)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="ja">日本語 (Japanese - CJK)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Display Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {Object.values(CURRENCY_CONFIGS).map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>24/7 Global SOS: +1 800-TRIP-DESK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & tax licensing statement */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 KHB Trip Global Tours Inc. All rights reserved. Automated invoicing & tax filing compliant.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveView('admin_dashboard');
                } else {
                  setActiveModal('auth');
                }
              }}
              className="hover:text-emerald-400 cursor-pointer flex items-center gap-1 font-semibold text-slate-300"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Back-Office Portal</span>
            </button>
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-200 cursor-pointer">Tax ID # US-98421092</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
