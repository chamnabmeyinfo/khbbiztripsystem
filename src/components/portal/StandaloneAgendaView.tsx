import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getAgendaPreviewHtml, generateShortAgendaUrl, parseAgendaUrlParams } from '../../services/agendaExportService';
import { LanguageCode } from '../../types';
import { DynamicHead } from '../common/DynamicHead';
import { ArrowLeft, Globe, Printer, Share2, Check, ExternalLink } from 'lucide-react';

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'km', label: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
];

export const StandaloneAgendaView: React.FC = () => {
  const { packages, language: defaultLang } = useApp();
  
  const parsed = useMemo(() => {
    return parseAgendaUrlParams(
      typeof window !== 'undefined' ? window.location.search : '',
      packages,
      defaultLang || 'en'
    );
  }, [packages, defaultLang]);

  const { pkg, date, travelerName, selectedOptions } = parsed;
  const [currentLang, setCurrentLang] = useState<LanguageCode>(parsed.lang);
  const [copiedLink, setCopiedLink] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for language changes from inside the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'KHB_CHANGE_LANG' && event.data.lang) {
        handleLangChange(event.data.lang as LanguageCode);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sync document title and social metadata with tour package attributes
  useEffect(() => {
    if (!pkg) return;
    const cleanTitle = `${pkg.title} | KHB Business Trips`;
    const cleanDesc = `📍 ${pkg.destination}, ${pkg.country} • 🗓️ ${pkg.durationDays} Days / ${pkg.durationNights} Nights • 💼 Official B2B Trade Mission Agenda`;
    const cleanImg = pkg.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';

    document.title = cleanTitle;

    const setMeta = (name: string, content: string, isProp = false) => {
      const selector = isProp ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProp) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', cleanDesc);
    setMeta('og:title', pkg.title, true);
    setMeta('og:description', cleanDesc, true);
    setMeta('og:image', cleanImg, true);
    setMeta('og:site_name', 'KHB Business Trips', true);
    setMeta('og:type', 'article', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pkg.title);
    setMeta('twitter:description', cleanDesc);
    setMeta('twitter:image', cleanImg);
  }, [pkg]);

  const getShortUrl = (langToUse: LanguageCode = currentLang) => {
    if (!pkg) return window.location.href;
    return generateShortAgendaUrl({
      packageId: pkg.id,
      selectedDate: date,
      defaultDate: pkg.availableDates?.[0],
      travelerName,
      language: langToUse,
      selectedOptions,
    });
  };

  const handleLangChange = (newLang: LanguageCode) => {
    setCurrentLang(newLang);
    if (typeof window !== 'undefined') {
      const shortUrl = getShortUrl(newLang);
      window.history.replaceState({}, '', shortUrl);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }
  };

  const handleCopyShareLink = async () => {
    const shortUrl = getShortUrl();
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    } catch {
      window.prompt('Copy short client share link:', shortUrl);
    }
  };

  const htmlDoc = useMemo(() => {
    if (!pkg) return '';
    return getAgendaPreviewHtml({
      packageData: pkg,
      selectedDate: date,
      travelerName,
      numberOfAdults: 1,
      selectedOptionalProgramIds: selectedOptions,
      language: currentLang,
      format: 'html',
    });
  }, [pkg, date, travelerName, selectedOptions, currentLang]);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans p-4">
        <div className="text-center p-8 bg-slate-800 rounded-3xl border border-slate-700 max-w-md shadow-2xl">
          <h2 className="text-xl font-black text-white">Document Not Found</h2>
          <p className="text-slate-400 text-xs mt-2">The requested tour package agenda could not be located.</p>
          <a
            href="/"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 rounded-xl text-white font-bold text-xs shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to KHB Portal</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen h-[100dvh] max-h-[100dvh] bg-slate-950 flex flex-col overflow-hidden select-text">
      <DynamicHead customPackage={pkg} />
      {/* Top Client View Action Navigation Bar */}
      <header className="px-2.5 sm:px-6 py-2 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap z-30 shrink-0 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-colors"
            title="Go to KHB Portal Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">KHB Portal</span>
          </a>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-xs sm:text-sm tracking-wide">
                KHB Trips
              </span>
              <span className="hidden md:inline text-slate-500">•</span>
              <span className="hidden md:inline text-slate-300 font-medium truncate max-w-xs">
                {pkg.title}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Interactive Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-slate-200">
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden md:inline font-bold text-[11px] text-slate-400">Language:</span>
            <select
              value={currentLang}
              onChange={e => handleLangChange(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.code} value={opt.code} className="bg-slate-900 text-white">
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Copy Share Link */}
          <button
            onClick={handleCopyShareLink}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border font-bold text-xs inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs leading-none ${
              copiedLink
                ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
            title="Copy Direct Link to Share"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-[11px]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Print / Save as PDF Button */}
          <button
            onClick={handlePrint}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-sky-500/20 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 leading-none"
            title="Print or Save as A4 PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Print</span>
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Fluid HTML Document View */}
      <main className="w-full flex-1 relative bg-slate-200 dark:bg-slate-950 overflow-hidden">
        <iframe
          ref={iframeRef}
          srcDoc={htmlDoc}
          title={pkg.title}
          className="w-full h-full border-none bg-slate-200"
          style={{ width: '100%', height: '100%' }}
        />
      </main>
    </div>
  );
};
