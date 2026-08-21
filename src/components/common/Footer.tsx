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
              {t('tagline')}. {language === 'km' ? 'ប្រតិបត្តិករទេសចរណ៍ និងបេសកកម្មពាណិជ្ជកម្មផ្លូវការ ផ្តល់សេវារៀបចំដំណើរទស្សនកិច្ច វិក្កយបត្រពន្ធស្វ័យប្រវត្ត និងសេវាជំនួយបន្ទាន់ ២៤/៧។' : 'Fully licensed global tour operator delivering end-to-end curated journeys, automated invoicing, and 24/7 emergency concierge support.'}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'km' ? 'ប្រព័ន្ធសុវត្ថិភាព 256-Bit SSL' : '256-Bit SSL Encrypted'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'km' ? 'ប្រតិបត្តិករទេសចរណ៍ទទួលស្គាល់ IATA' : 'Verified IATA Tour Operator'}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {language === 'km' ? 'កម្មវិធីពិសេសៗ' : 'Featured Escapes'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'Canton Fair 2026 (Phase 1, 2, 3)' : 'Canton Fair 2026 (Phase 1, 2, 3)'}</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'ពិព័រណ៍ Bakery & Coffee Expo វៀតណាម' : 'Vietnam Bakery & Coffee Expo'}</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'បេសកកម្ម Franchise & Retail ថៃ' : 'Thailand Franchise & Retail'}</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'ទស្សនកិច្ចរោងចក្រស្វ័យប្រវត្តិក្វាងចូវ' : 'Guangzhou Automation Expo'}</button></li>
              <li><button onClick={() => setActiveView('marketing')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'បេសកកម្មគ្រឿងសំណង់ & ថាមពល' : 'Green Building & Solar Expo'}</button></li>
            </ul>
          </div>

          {/* Traveler Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {language === 'km' ? 'សេវាកម្ម & ជំនួយការ' : 'Concierge & Services'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'កម្មវិធីដំណើរ & ប័ណ្ណ Voucher' : 'My Itineraries & Vouchers'}</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'តាមដានជើងហោះហើរ & សណ្ឋាគារ' : 'Flight & Hotel Status Tracker'}</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'ទាញយកកម្មវិធីមើលពេល Offline' : 'Offline Travel Access'}</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'វិក្កយបត្រពន្ធ VAT ផ្លូវការ' : 'Official VAT Tax Invoicing'}</button></li>
              <li><button onClick={() => setActiveView('customer_portal')} className="hover:text-sky-400 transition-colors">{language === 'km' ? 'ទាញយកឯកសារកាលវិភាគ A4 PDF' : 'Download A4 Agenda PDF'}</button></li>
            </ul>
          </div>

          {/* Language & Currency in Footer */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {language === 'km' ? 'ការកំណត់តំបន់' : 'Regional Settings'}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{language === 'km' ? 'ភាសា' : 'Language'}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="en">English (US)</option>
                  <option value="km">ភាសាខ្មែរ (Khmer)</option>
                  <option value="ar">العربية (Arabic - RTL)</option>
                  <option value="he">עבריត (Hebrew - RTL)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="ja">日本語 (Japanese - CJK)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{language === 'km' ? 'រូបិយប័ណ្ណបង្ហាញ' : 'Display Currency'}</label>
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
                <span>{language === 'km' ? 'ទូរស័ព្ទជំនួយបន្ទាន់: 060 815 515' : '24/7 Global SOS: +855 60 815 515'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & tax licensing statement */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            {language === 'km'
              ? '© 2026 KHB Events & Tours. រក្សាសិទ្ធិគ្រប់យ៉ាង។ វិក្កយបត្រពន្ធ និងបង្កាន់ដៃស្របតាមច្បាប់។'
              : '© 2026 KHB Trip Global Tours Inc. All rights reserved. Automated invoicing & tax filing compliant.'}
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
              <span>{t('adminBackOffice')}</span>
            </button>
            <span className="hover:text-slate-200 cursor-pointer">{language === 'km' ? 'គោលការណ៍ឯកជនភាព' : 'Privacy Policy'}</span>
            <span className="hover:text-slate-200 cursor-pointer">{language === 'km' ? 'លក្ខខណ្ឌសេវាកម្ម' : 'Terms of Service'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
