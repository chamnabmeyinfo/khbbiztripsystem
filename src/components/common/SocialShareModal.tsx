import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TourPackage } from '../../types';
import { formatMoney } from '../../services/currencyService';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  Send,
  Download,
  Flame,
  Globe,
  Radio,
  BarChart2,
  Tag
} from 'lucide-react';

export interface SocialShareModalProps {
  customPackage?: TourPackage | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  customPackage,
  isOpen,
  onClose
}) => {
  const {
    selectedPackage,
    packages,
    activeModal,
    setActiveModal,
    currency,
    language,
    t
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [selectedUtmPreset, setSelectedUtmPreset] = useState<string>('none');
  const [customUtmSource, setCustomUtmSource] = useState<string>('');
  const [customUtmCampaign, setCustomUtmCampaign] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'share' | 'campaign' | 'qr'>('share');
  const [captionLang, setCaptionLang] = useState<'km' | 'en'>(language === 'km' ? 'km' : 'en');
  const qrRef = useRef<SVGSVGElement | null>(null);

  const isModalOpen = isOpen !== undefined ? isOpen : activeModal === 'social_share';
  const pkg = customPackage || selectedPackage || packages[0];

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setActiveModal(null);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://khbevents.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Base Permalink for this Tour Package
  const baseShareUrl = useMemo(() => {
    if (!pkg) return `${origin}${pathname}`;
    return `${origin}${pathname}#package/${pkg.id}`;
  }, [origin, pathname, pkg]);

  // Tracked Share URL with UTM tags
  const shareUrl = useMemo(() => {
    if (!pkg) return baseShareUrl;
    const params = new URLSearchParams();

    if (selectedUtmPreset === 'facebook_boost') {
      params.set('utm_source', 'facebook');
      params.set('utm_medium', 'paid_ad');
      params.set('utm_campaign', `boost_${pkg.id}`);
    } else if (selectedUtmPreset === 'telegram_channel') {
      params.set('utm_source', 'telegram');
      params.set('utm_medium', 'channel_post');
      params.set('utm_campaign', `channel_${pkg.id}`);
    } else if (selectedUtmPreset === 'tiktok_bio') {
      params.set('utm_source', 'tiktok');
      params.set('utm_medium', 'bio_link');
      params.set('utm_campaign', `bio_${pkg.id}`);
    } else if (selectedUtmPreset === 'linkedin_b2b') {
      params.set('utm_source', 'linkedin');
      params.set('utm_medium', 'b2b_outreach');
      params.set('utm_campaign', `b2b_${pkg.id}`);
    } else if (selectedUtmPreset === 'custom') {
      if (customUtmSource.trim()) params.set('utm_source', customUtmSource.trim());
      if (customUtmCampaign.trim()) params.set('utm_campaign', customUtmCampaign.trim());
      params.set('utm_medium', 'social');
    }

    const qs = params.toString();
    return qs ? `${origin}${pathname}?pkg=${pkg.id}&${qs}#package/${pkg.id}` : baseShareUrl;
  }, [baseShareUrl, pkg, selectedUtmPreset, customUtmSource, customUtmCampaign, origin, pathname]);

  // Pre-formatted social media post copy
  const socialCaption = useMemo(() => {
    if (!pkg) return '';
    const displayTitle = captionLang === 'km' && pkg.titleKm ? pkg.titleKm : pkg.title;
    const displayDest = captionLang === 'km' && pkg.destinationKm ? pkg.destinationKm : pkg.destination;
    const priceText = formatMoney(pkg.discountPriceUSD || pkg.priceUSD, currency, captionLang);
    const dateText = pkg.availableDates?.[0] || 'October 2026';

    if (captionLang === 'km') {
      return `📢 ដំណើរទស្សនកិច្ចពាណិជ្ជកម្មផ្លូវការ (Official B2B Trade Mission)
✈️ ${displayTitle}

📍 ទីតាំង: ${displayDest}, ${pkg.country}
⏱️ រយៈពេល: ${pkg.durationDays} ថ្ងៃ / ${pkg.durationNights} យប់
🗓️ កាលបរិច្ឆេទចេញដំណើរ: ${dateText}
💰 តម្លៃពិសេស Early Bird: ${priceText}/នាក់ (សណ្ឋាគារ ៤-៥ ផ្កាយ + ជើងហោះហើរ + អ្នកបកប្រែពាណិជ្ជកម្ម)

🎬 ទស្សនាវីដេអូផ្លូវការ & ចុះឈ្មោះកៅអី VIP តាមតំណភ្ជាប់ខាងក្រោម:
👉 ${shareUrl}

☎️ ទំនាក់ទំនងចុះឈ្មោះបន្ទាន់: 060 815 515 / 012 345 678
🏢 រៀបចំដោយ KHB Events • Cambodia`;
    }

    return `📢 Official B2B Trade Mission & Business Delegation
✈️ ${displayTitle}

📍 Destination: ${displayDest}, ${pkg.country}
⏱️ Duration: ${pkg.durationDays} Days / ${pkg.durationNights} Nights
🗓️ Departure Date: ${dateText}
💰 Early Bird Registration Fee: ${priceText}/delegate (All-Inclusive VIP Logistics, Lodging, Translators & Passes)

🎬 Watch the Official Video Tour & Register Online:
👉 ${shareUrl}

☎️ Inquiries & VIP Delegation Registration: +855 60 815 515
🏢 Organized by KHB Events • Cambodia`;
  }, [pkg, captionLang, currency, shareUrl]);

  if (!isModalOpen || !pkg) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(socialCaption)}`;
    window.open(tgUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(socialCaption)}`;
    window.open(waUrl, '_blank');
  };

  const handleShareLinkedIn = () => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(liUrl, '_blank', 'width=600,height=500');
  };

  const handleShareTwitter = () => {
    const tweetText = `Explore ${pkg.title} with KHB Events! Watch video & register:`;
    const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(tweetText)}`;
    window.open(twUrl, '_blank', 'width=600,height=400');
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('package-social-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${pkg.id}_KHB.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200" id="social-share-modal">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full my-auto max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Social Media Boost & Post Link</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Dedicated URL
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Each tour package has a permanent landing page with auto-play video for social ads & boosts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Package Summary Strip */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3.5 shrink-0">
          <img
            src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80'}
            alt={pkg.title}
            className="w-14 h-11 rounded-xl object-cover shadow-xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {pkg.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span>📍 {pkg.destination}</span>
              <span>•</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                ${pkg.discountPriceUSD || pkg.priceUSD} USD
              </span>
              <span>•</span>
              <span>{pkg.durationDays}D/{pkg.durationNights}N</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'share'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share & Post Link</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('campaign')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'campaign'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Ad Boost & UTM Tracker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code Generator</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* TAB 1: SHARE & POST LINK */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Direct Link Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Direct Tour Package Post Link</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
                    ✓ opens dedicated sales page with auto-play video
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Open landing page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* 1-Click Social Media Launchers */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  1-Click Direct Social Media Share
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={handleShareFacebook}
                    className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTelegram}
                    className="p-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                    <span>Telegram</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <Send className="w-5 h-5 rotate-45" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareLinkedIn}
                    className="p-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <Globe className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareTwitter}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <Radio className="w-5 h-5" />
                    <span>Twitter / X</span>
                  </button>
                </div>
              </div>

              {/* Ready-Made Post Caption for Boosts */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pre-Written Social Media Caption & Post Copy</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCaptionLang('km')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        captionLang === 'km' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      ភាសាខ្មែរ
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptionLang('en')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        captionLang === 'en' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    readOnly
                    value={socialCaption}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-sans leading-relaxed select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      copiedCaption
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Caption Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Post Caption</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AD BOOST & UTM CAMPAIGN BUILDER */}
          {activeTab === 'campaign' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Track Social Ad Conversions & Boost Campaigns</span>
                </div>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Select a social advertising platform below to automatically append UTM tracking codes to your link.
                </p>
              </div>

              {/* Preset Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Quick Tracking Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'none', label: 'Clean Link (No UTM)', desc: 'Standard direct post link' },
                    { id: 'facebook_boost', label: '🔵 Facebook Boosted Ad', desc: 'utm_source=facebook&utm_medium=paid_ad' },
                    { id: 'telegram_channel', label: '✈️ Telegram Channel Post', desc: 'utm_source=telegram&utm_medium=channel_post' },
                    { id: 'tiktok_bio', label: '📱 TikTok Bio / Video', desc: 'utm_source=tiktok&utm_medium=bio_link' },
                    { id: 'linkedin_b2b', label: '💼 LinkedIn B2B Sponsor', desc: 'utm_source=linkedin&utm_medium=b2b_outreach' },
                    { id: 'custom', label: '⚙️ Custom UTM Campaign', desc: 'Define your own campaign parameters' }
                  ].map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedUtmPreset(preset.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedUtmPreset === preset.id
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom UTM Inputs */}
              {selectedUtmPreset === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      UTM Source (e.g. facebook_ad, influencer_tim)
                    </label>
                    <input
                      type="text"
                      value={customUtmSource}
                      onChange={(e) => setCustomUtmSource(e.target.value)}
                      placeholder="facebook_ad"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Campaign Name (e.g. canton_fair_2026_q4)
                    </label>
                    <input
                      type="text"
                      value={customUtmCampaign}
                      onChange={(e) => setCustomUtmCampaign(e.target.value)}
                      placeholder="canton_fair_2026_q4"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Generated Tracked Link */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Tracked Campaign Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QR CODE GENERATOR */}
          {activeTab === 'qr' && (
            <div className="space-y-6 text-center">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 inline-block mx-auto shadow-md">
                <QRCodeSVG
                  id="package-social-qr-svg"
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl mx-auto"
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Scan to Open Tour Package & Play Video
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Download high-resolution QR code for printed flyers, roll-up banners, trade show brochures, or presentation slides.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res QR Code (PNG)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
