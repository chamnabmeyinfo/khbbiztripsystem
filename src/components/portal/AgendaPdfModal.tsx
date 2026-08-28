import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { generateTourAgendaPdf } from '../../services/pdfAgendaService';
import { getLocalizedPackage } from '../../utils/packageLocalization';
import {
  X,
  Download,
  Printer,
  Calendar,
  UserCheck,
  ShieldCheck,
  FileText,
  Check,
  PlusCircle,
  ZoomIn,
  ZoomOut,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Share2,
  Link2,
  Globe,
  Stamp,
  Sparkles,
  Layers,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { OptionalTourProgram, LanguageCode } from '../../types';
import {
  getAgendaPreviewHtml,
  getAgendaBodyHtml,
  downloadAgendaHtml,
  downloadAgendaDoc,
  downloadAgendaImagePdf,
  downloadAgendaHtmlToPdf,
  generateShortAgendaUrl,
  ExportFormat,
  WatermarkOptions
} from '../../services/agendaExportService';

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'html_pdf', label: 'HTML As PDF (Exact 1:1)' },
  { value: 'pdf_image', label: 'PDF (Rasterized Image)' },
  { value: 'html', label: 'HTML Web Page (.html)' },
  { value: 'doc', label: 'Word Document (.doc)' },
];

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'km', label: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪' },
  { code: 'he', label: 'עבריត', flag: '🇮🇱' },
];

const WATERMARK_PRESETS = [
  'OFFICIAL DELEGATION',
  'CONFIDENTIAL • KHB B2B',
  'TRADE MISSION COPY',
  'DELEGATE REVIEW ONLY',
  'ACCREDITED PASS',
  'DRAFT AGENDA'
];

const WATERMARK_COLORS = [
  { name: 'Navy', hex: '#0f172a', bg: 'bg-slate-900' },
  { name: 'Sky', hex: '#0284c7', bg: 'bg-sky-600' },
  { name: 'Emerald', hex: '#059669', bg: 'bg-emerald-600' },
  { name: 'Crimson', hex: '#dc2626', bg: 'bg-red-600' },
  { name: 'Amber', hex: '#d97706', bg: 'bg-amber-600' },
];

export const AgendaPdfModal: React.FC = () => {
  const {
    selectedPackage,
    currentUser,
    activeModal,
    setActiveModal,
    language,
    systemSettings,
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportLanguage, setExportLanguage] = useState<LanguageCode>(language);
  const [travelerName, setTravelerName] = useState(currentUser?.name || 'Valued Business Delegate');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('html_pdf');
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [showWatermarkDrawer, setShowWatermarkDrawer] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [iframeHeight, setIframeHeight] = useState('3600px');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Security & Watermarking State
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('OFFICIAL DELEGATION');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.12);
  const [watermarkColor, setWatermarkColor] = useState<string>('#0f172a');
  const [watermarkLayout, setWatermarkLayout] = useState<'diagonal' | 'center_stamp' | 'confidential_bar'>('diagonal');

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (doc) {
        const scrollH = doc.documentElement.scrollHeight || doc.body.scrollHeight;
        if (scrollH > 500) {
          setIframeHeight(`${scrollH + 100}px`);
        }
      }
    } catch {}
  };

  useEffect(() => {
    setExportLanguage(language);
  }, [language]);

  const pkg = useMemo(() => {
    if (!selectedPackage) return null;
    return getLocalizedPackage(selectedPackage, exportLanguage);
  }, [selectedPackage, exportLanguage]);

  const currentDepartureDate = useMemo(() => {
    if (selectedDate) return selectedDate;
    if (pkg?.availableDates && pkg.availableDates.length > 0) {
      return pkg.availableDates[0];
    }
    return '2026-09-15';
  }, [selectedDate, pkg]);

  const optionalPrograms: OptionalTourProgram[] = useMemo(() => {
    if (pkg?.optionalPrograms && pkg.optionalPrograms.length > 0) {
      return pkg.optionalPrograms;
    }
    return [
      {
        id: 'opt_vip_matchmaking',
        title: exportLanguage === 'km' ? 'កម្មវិធី B2B VIP Matchmaking & ជំនួបពាណិជ្ជកម្មទល់មុខ' : 'VIP 1-on-1 B2B Matchmaking & Private Dinner',
        description: exportLanguage === 'km' ? 'ការរៀបចំជំនួបផ្ទាល់ជាមួយម្ចាស់សហគ្រាសក្នុងស្រុក 3-5 ក្រុមហ៊ុន និងអាហារពេលល្ងាចបណ្តាញពាណិជ្ជកម្ម VIP' : 'Pre-arranged 1-on-1 bilateral meetings with 3-5 verified enterprise owners and executive networking banquet.',
        additionalCostUSD: 120,
        durationHours: 3.5,
        recommendedAudience: 'Business Owners & Investors',
        highlights: ['Dedicated bilingual translator', 'Private conference lounge', 'Curated buyer directory'],
        includesGuide: true,
        includedMeals: ['VIP Executive Dinner'],
        meetingPoint: 'Hotel Executive Conference Lounge (5:30 PM)'
      },
      {
        id: 'opt_night_market_foodie',
        title: exportLanguage === 'km' ? 'ដំណើរកម្សាន្តពេលរាត្រី & ភ្លក់រសជាតិម្ហូបតំបន់ល្បីៗ' : 'Cultural Night Explorer & Gourmet Street Tasting',
        description: exportLanguage === 'km' ? 'ដំណើរទស្សនកិច្ចពេលល្ងាចជាមួយមគ្គុទ្ទេសក៍ទេសចរណ៍ទៅកាន់ផ្សាររាត្រី និងតំបន់ទេសចរណ៍វប្បធម៌ល្បីៗ' : 'Guided evening expedition into iconic cultural landmarks, night markets, and authentic culinary hotspots.',
        additionalCostUSD: 45,
        durationHours: 3,
        recommendedAudience: 'All Travelers & Delegates',
        highlights: ['Safe chauffeured transport', 'Certified bilingual escort', 'Authentic tasting menu'],
        includesGuide: true,
        includedMeals: ['Tasting samples & specialty drinks'],
        meetingPoint: 'Hotel Main Lobby (6:45 PM)'
      },
      {
        id: 'opt_factory_visit',
        title: exportLanguage === 'km' ? 'ដំណើរចុះពិនិត្យរោងចក្រ & មជ្ឈមណ្ឌលភស្តុភារ Logistics' : 'Industrial Park & Logistics Hub Site Inspection',
        description: exportLanguage === 'km' ? 'ដំណើរទស្សនកិច្ចផ្ទាល់ទៅកាន់តំបន់សេដ្ឋកិច្ចពិសេស និងរោងចក្រផលិតស្វ័យប្រវត្តិកម្មទំនើប' : 'Exclusive site walkthrough of specialized industrial export zones and automated supply chain logistics hubs.',
        additionalCostUSD: 85,
        durationHours: 4,
        recommendedAudience: 'Importers, Exporters & Manufacturers',
        highlights: ['Factory floor briefing by Plant Manager', 'Logistics tariff & customs guide', 'Round-trip VIP bus transport'],
        includesGuide: true,
        includedMeals: ['Networking Coffee & Refreshments'],
        meetingPoint: 'Hotel Front Driveway (1:30 PM)'
      }
    ];
  }, [pkg, exportLanguage]);

  const watermarkConfig: WatermarkOptions | undefined = useMemo(() => {
    if (!watermarkEnabled || !watermarkText.trim()) return undefined;
    return {
      enabled: watermarkEnabled,
      text: watermarkText.trim(),
      opacity: watermarkOpacity,
      color: watermarkColor,
      layout: watermarkLayout,
    };
  }, [watermarkEnabled, watermarkText, watermarkOpacity, watermarkColor, watermarkLayout]);

  const livePreviewHtml = useMemo(() => {
    if (!pkg) return '';
    return getAgendaPreviewHtml({
      packageData: pkg,
      selectedDate: currentDepartureDate,
      travelerName,
      numberOfAdults: 1,
      selectedOptionalProgramIds: selectedOptions,
      language: exportLanguage,
      format: exportFormat,
      watermark: watermarkConfig,
      systemSettings,
    });
  }, [pkg, currentDepartureDate, travelerName, selectedOptions, exportLanguage, exportFormat, watermarkConfig, systemSettings]);

  const agendaBodyHtml = useMemo(() => {
    if (!pkg) return '';
    return getAgendaBodyHtml({
      packageData: pkg,
      selectedDate: currentDepartureDate,
      travelerName,
      numberOfAdults: 1,
      selectedOptionalProgramIds: selectedOptions,
      language: exportLanguage,
      watermark: watermarkConfig,
      systemSettings,
    });
  }, [pkg, currentDepartureDate, travelerName, selectedOptions, exportLanguage, watermarkConfig, systemSettings]);

  if (activeModal !== 'agenda_pdf' || !selectedPackage) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      const commonOpts = {
        packageData: selectedPackage,
        selectedDate: currentDepartureDate,
        travelerName,
        numberOfAdults: 1,
        selectedOptionalProgramIds: selectedOptions,
        language: exportLanguage,
        watermark: watermarkConfig,
        systemSettings,
      };
      switch (exportFormat) {
        case 'pdf_image':
          await downloadAgendaImagePdf(commonOpts);
          break;
        case 'html_pdf':
          await downloadAgendaHtmlToPdf(commonOpts);
          break;
        case 'html':
          await downloadAgendaHtml(commonOpts);
          break;
        case 'doc':
          await downloadAgendaDoc(commonOpts);
          break;
      }
      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate document:', err);
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }
  };

  const getShareUrl = () => {
    if (!pkg) return window.location.href;
    return generateShortAgendaUrl({
      packageId: pkg.id,
      selectedDate: currentDepartureDate,
      defaultDate: pkg.availableDates?.[0],
      travelerName,
      defaultDelegateName: currentUser?.name,
      language: exportLanguage,
      selectedOptions,
    });
  };

  const handleViewHtmlOnline = () => {
    const url = getShareUrl();
    window.open(url, '_blank');
  };

  const handleCopyShareLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    } catch {
      window.prompt('Copy client share link:', url);
    }
  };

  const toggleOption = (id: string) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      id="agenda-pdf-modal"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full my-auto h-[95vh] flex flex-col overflow-hidden">
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-md print:hidden shrink-0 gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 dark:text-white truncate leading-tight">
                  {language === 'km' ? 'មើលគំរូ និងទាញយករបៀបវារៈផ្លូវការ' : 'Official Tour Agenda Preview & Export'}
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800 items-center gap-1 shrink-0">
                  <Eye className="w-3 h-3" /> Live HTML Preview
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                <span className="sm:hidden font-semibold text-sky-600 dark:text-sky-400">{selectedPackage.destination} • {selectedPackage.durationDays}D/{selectedPackage.durationNights}N</span>
                <span className="hidden sm:inline">Exact A4 page sheet layout with photo gallery, itinerary timings, and verified seal.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Zoom Controls */}
            <div className="hidden lg:flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer inline-flex items-center justify-center text-center leading-none"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-2 text-slate-700 dark:text-slate-300 inline-flex items-center justify-center text-center leading-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.2, prev + 0.1))}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer inline-flex items-center justify-center text-center leading-none"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(0.9)}
                className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-sky-600 border-l border-slate-200 dark:border-slate-700 cursor-pointer inline-flex items-center justify-center text-center leading-none"
                title="Reset Zoom"
              >
                Fit
              </button>
            </div>

            {/* View Standalone HTML */}
            <button
              onClick={handleViewHtmlOnline}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs leading-none"
              title="Open Standalone HTML Web Page in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden md:inline">View HTML</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyShareLink}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs leading-none ${
                copiedLink
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Copy Online Shareable Link for Client"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Print Button (Tablet/Desktop) */}
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs leading-none"
              title="Print Document or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden lg:inline">Print</span>
            </button>

            {/* Main Download Button with Format Dropdown */}
            <div className="relative shrink-0">
              <div className="inline-flex items-stretch rounded-xl shadow-xs overflow-hidden bg-sky-600 hover:bg-sky-700 transition-colors">
                <button
                  onClick={() => handleDownloadPdf()}
                  disabled={isGenerating}
                  className={`px-3 sm:px-3.5 py-2 font-bold text-xs text-white inline-flex items-center justify-center gap-1.5 cursor-pointer leading-none active:scale-95 transition-all ${
                    downloadSuccess ? '!bg-emerald-600' : ''
                  }`}
                  title={`Download Agenda as ${FORMAT_OPTIONS.find(f => f.value === exportFormat)?.label || 'Document'}`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                      <span className="hidden lg:inline text-[11px] font-medium opacity-90">
                        ({exportFormat === 'doc' ? 'DOC' : exportFormat === 'html' ? 'HTML' : 'PDF'})
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDownloadDropdown(prev => !prev)}
                  disabled={isGenerating}
                  className="px-2 border-l border-sky-500/60 hover:bg-sky-800/40 text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Choose Export Format (PDF, Word, HTML)"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDownloadDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Format Dropdown Menu */}
              {showDownloadDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDownloadDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-64 sm:w-72 bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                      Choose Export Format
                    </div>
                    {FORMAT_OPTIONS.map(opt => {
                      const isSelected = exportFormat === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setExportFormat(opt.value);
                            setShowDownloadDropdown(false);
                            setTimeout(() => handleDownloadPdf(), 100);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800/60'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              opt.value === 'doc'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-600'
                                : opt.value === 'html'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                            }`}>
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate text-[11px] leading-tight">
                                {opt.label}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                {opt.value === 'html_pdf'
                                  ? 'Official A4 with embedded seals'
                                  : opt.value === 'pdf_image'
                                  ? 'Rasterized image PDF'
                                  : opt.value === 'doc'
                                  ? 'Editable Microsoft Word format'
                                  : 'Standalone HTML webpage file'}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Close Modal Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors inline-flex items-center justify-center leading-none shrink-0"
              title="Close Preview"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-3 text-xs overflow-x-auto no-scrollbar print:hidden shrink-0">
          {/* Left: Summary Badge / Format Tag */}
          <div className="flex items-center gap-1.5 py-0.5 shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="font-mono text-sky-600 dark:text-sky-400 uppercase">{exportFormat === 'doc' ? 'Word Doc' : exportFormat === 'html' ? 'HTML Page' : 'PDF Document'}</span>
            </span>
          </div>

          {/* Config Controls Track */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 justify-end shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-2.5 py-1 shrink-0 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] shrink-0">Lang:</span>
              <select
                value={exportLanguage}
                onChange={e => setExportLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.code} value={opt.code} className="bg-white dark:bg-slate-900">
                    {opt.flag} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure Date Selector */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-2.5 py-1 shrink-0 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] shrink-0">Date:</span>
              <select
                value={currentDepartureDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                {selectedPackage.availableDates.map(d => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-900">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Delegate / Traveler Name Input */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-2.5 py-1 shrink-0 shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <input
                type="text"
                value={travelerName}
                onChange={e => setTravelerName(e.target.value)}
                placeholder="Delegate Name"
                className="bg-transparent text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none w-24 sm:w-32"
              />
            </div>

            {/* Watermark Drawer Button */}
            <button
              onClick={() => {
                setShowWatermarkDrawer(prev => !prev);
                if (showOptionsDrawer) setShowOptionsDrawer(false);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                watermarkEnabled
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-400/30'
                  : showWatermarkDrawer
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600'
                  : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
              title="Configure Document Watermark & Security Stamp"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${watermarkEnabled ? 'text-white' : 'text-sky-600'}`} />
              <span>Watermark {watermarkEnabled ? '(ON)' : ''}</span>
            </button>

            {/* Add-Ons Drawer Button */}
            <button
              onClick={() => {
                setShowOptionsDrawer(prev => !prev);
                if (showWatermarkDrawer) setShowWatermarkDrawer(false);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                showOptionsDrawer || selectedOptions.length > 0
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Add-Ons ({selectedOptions.length})</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-200 dark:bg-slate-950">
          {/* Security & Watermarking Control Panel */}
          {showWatermarkDrawer && (
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-xl z-30 animate-in slide-in-from-top-3 duration-200 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-sky-600" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      PDF Security Seal & Document Watermark
                    </h4>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      Adds an official anti-counterfeiting watermark across every page of the generated PDF document.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {watermarkEnabled ? 'Watermark Enabled' : 'Watermark Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={watermarkEnabled}
                      onChange={e => setWatermarkEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </label>

                  <button
                    onClick={() => setShowWatermarkDrawer(false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Watermark Text & Presets */}
                <div className="md:col-span-6 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Watermark Text Label
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={e => {
                      setWatermarkText(e.target.value);
                      if (!watermarkEnabled && e.target.value.trim()) setWatermarkEnabled(true);
                    }}
                    placeholder="e.g. OFFICIAL DELEGATION"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />

                  {/* Preset quick chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                    {WATERMARK_PRESETS.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setWatermarkText(preset);
                          setWatermarkEnabled(true);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                          watermarkText === preset && watermarkEnabled
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opacity Selector */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Opacity & Transparency ({Math.round(watermarkOpacity * 100)}%)
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: 'Subtle', val: 0.08 },
                      { label: 'Standard', val: 0.14 },
                      { label: 'Medium', val: 0.22 },
                      { label: 'Heavy', val: 0.32 }
                    ].map(op => (
                      <button
                        key={op.label}
                        type="button"
                        onClick={() => {
                          setWatermarkOpacity(op.val);
                          setWatermarkEnabled(true);
                        }}
                        className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold text-center transition-all cursor-pointer ${
                          watermarkOpacity === op.val
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Stamp Layout Style:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'diagonal', label: 'Diagonal' },
                        { id: 'center_stamp', label: 'Centered' },
                        { id: 'confidential_bar', label: 'Top Bar' }
                      ].map(layout => (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => {
                            setWatermarkLayout(layout.id as any);
                            setWatermarkEnabled(true);
                          }}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            watermarkLayout === layout.id
                              ? 'bg-sky-600 text-white font-black shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {layout.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Watermark Color Theme
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {WATERMARK_COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setWatermarkColor(c.hex);
                          setWatermarkEnabled(true);
                        }}
                        className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          watermarkColor === c.hex
                            ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full ${c.bg} shadow-inner`} />
                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showOptionsDrawer && (
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-lg z-20 animate-in slide-in-from-top-3 duration-200 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Include Optional Tour Programs in Official Agenda
                  </h4>
                </div>
                <button
                  onClick={() => setShowOptionsDrawer(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  Done
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {optionalPrograms.map(prog => {
                  const isSelected = selectedOptions.includes(prog.id);
                  return (
                    <div
                      key={prog.id}
                      onClick={() => toggleOption(prog.id)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{prog.title}</div>
                        <span className="font-mono font-black text-emerald-600 text-xs shrink-0">+${prog.additionalCostUSD}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{prog.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{prog.durationHours} hrs</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                          {isSelected ? '✓ Included' : '+ Add'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto flex justify-center p-4 sm:p-6 bg-slate-250 dark:bg-slate-950">
            <div
              className="transition-transform duration-200 origin-top shadow-2xl rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800"
              style={{
                transform: `scale(${zoomLevel})`,
                width: '840px',
                minHeight: '1123px',
                height: 'fit-content'
              }}
            >
              {exportFormat === 'doc' ? (
                <div className="p-8 sm:p-12 bg-white text-slate-900 font-sans">
                  <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-sky-600 px-4 py-3 mb-6 rounded text-xs text-slate-600 flex items-center justify-between">
                    <span>📄 <strong>Word Document Format (.doc)</strong> — Microsoft Word Compatible Layout</span>
                    <span className="font-mono">Ref: KHB-AGN-{selectedPackage.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="agenda-document-body" dangerouslySetInnerHTML={{ __html: agendaBodyHtml }} />
                </div>
              ) : (
                <div className="bg-slate-200 dark:bg-slate-900 p-0 flex flex-col items-center">
                  <div 
                    className="w-full agenda-document-body"
                    dangerouslySetInnerHTML={{ __html: agendaBodyHtml }} 
                  />
                </div>
              )}

              {/* Hidden iframe for background print triggering and isolated export generation */}
              <iframe
                ref={iframeRef}
                srcDoc={livePreviewHtml}
                onLoad={handleIframeLoad}
                title="Exact HTML Tour Agenda Preview"
                className="hidden"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between flex-wrap gap-3 print:hidden shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Export Format:</span>
            <strong className="px-2.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-bold">
              {FORMAT_OPTIONS.find(f => f.value === exportFormat)?.label || 'HTML As PDF'}
            </strong>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-400">
              Ref: KHB-AGN-{selectedPackage.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleViewHtmlOnline}
              className="px-3.5 py-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs leading-none"
              title="Open Standalone HTML Web Page in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>View HTML Link</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className={`px-3.5 py-2 rounded-xl border font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs leading-none ${
                copiedLink
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Copy Online Shareable Link for Client"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>Copy Client Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs inline-flex items-center justify-center text-center leading-none cursor-pointer transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer bg-sky-600 hover:bg-sky-700 text-white shadow-xs font-black inline-flex items-center justify-center gap-1.5 leading-none active:scale-95 ${
                downloadSuccess ? '!bg-emerald-600' : ''
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {FORMAT_OPTIONS.find(f => f.value === exportFormat)?.label || 'Document'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
