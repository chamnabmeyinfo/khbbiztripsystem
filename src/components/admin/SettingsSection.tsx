import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Sliders,
  Shield,
  CreditCard,
  Building2,
  Receipt,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Bot,
  ShoppingCart,
  Percent,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Smartphone,
  Save,
  Globe,
  Bell,
  Wifi,
  Trash2,
  Link2,
  PhoneCall,
  Send,
  Mail,
  MessageSquare,
  Award,
  Briefcase,
  UserCheck,
  MapPin,
  Landmark,
  Share2,
  ExternalLink,
  ShieldCheck,
  Image,
  Camera,
  Info,
  Check,
  Stamp,
  Palette,
  Type,
  CaseSensitive,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Maximize2,
  Minimize2,
  Square,
  Sparkle,
  Layers,
  Eye,
  Sun,
  Moon,
  Contrast,
  FileText,
  Space,
  Webhook
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { AiThemeColorDetectorModal } from './AiThemeColorDetectorModal';
import { CrmIntegrationSection } from './CrmIntegrationSection';
import {
  THEME_PRESETS,
  FONT_LATIN_OPTIONS,
  FONT_KHMER_OPTIONS,
  FONT_HEADING_OPTIONS,
  getContrastTextColor,
  getOptimalBadgeStyle,
  isColorDark,
} from '../../services/aiThemeService';

const LOGO_PRESETS = [
  {
    name: 'KHB Corporate Gold',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=200&auto=format&fit=crop&q=80',
    desc: 'Official Embassy & Delegation Crest',
  },
  {
    name: 'Cambodia-China Trade Seal',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    desc: 'B2B Trade Mission Seal',
  },
  {
    name: 'Canton Fair Partner Badge',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80',
    desc: 'Guangzhou Sourcing Delegation',
  },
  {
    name: 'Lotus B2B Enterprise Shield',
    url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=80',
    desc: 'Corporate Leadership Crest',
  },
];

const COORDINATOR_AVATAR_PRESETS = [
  {
    name: 'Mr. Tim Vutha (Official Headshot)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    desc: 'Chief Trade Mission Director',
  },
  {
    name: 'Diplomatic Liaison Officer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    desc: 'Government & Embassy Liaison',
  },
  {
    name: 'Senior Trade Facilitator',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    desc: 'B2B Matchmaking Head',
  },
  {
    name: 'VIP Delegate Hostess',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    desc: 'Concierge Protocol Lead',
  },
];

export const SettingsSection: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    resetSystemSettings,
    exportSystemBackupJSON,
    importSystemBackupJSON,
    settingsSubTab,
    setSettingsSubTab,
    addNotification
  } = useApp();

  type SubTabType = 'features' | 'crm' | 'payments' | 'branding' | 'theme' | 'financials' | 'security' | 'backup';
  const [activeSubTab, setActiveSubTabState] = useState<SubTabType>(
    (settingsSubTab as SubTabType) || 'features'
  );

  const setActiveSubTab = (tab: SubTabType) => {
    setActiveSubTabState(tab);
    setSettingsSubTab(tab);
  };

  useEffect(() => {
    if (settingsSubTab && ['features', 'crm', 'payments', 'branding', 'theme', 'financials', 'security', 'backup'].includes(settingsSubTab)) {
      setActiveSubTabState(settingsSubTab as SubTabType);
    }
  }, [settingsSubTab]);
  const [formData, setFormData] = useState<SystemSettings>(systemSettings);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showAiThemeModal, setShowAiThemeModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync form when systemSettings updates from Firestore / Context
  useEffect(() => {
    setFormData(systemSettings);
  }, [systemSettings]);

  const handleChange = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleFeatureToggle = (featureKey: keyof SystemSettings, value: boolean) => {
    const updated = {
      ...formData,
      [featureKey]: value
    };
    setFormData(updated);
    updateSystemSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePaymentToggle = (gatewayKey: keyof SystemSettings['paymentGateways'], value: boolean) => {
    const updatedGateways = {
      ...formData.paymentGateways,
      [gatewayKey]: value
    };
    const updated = {
      ...formData,
      paymentGateways: updatedGateways
    };
    setFormData(updated);
    updateSystemSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSystemSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importSystemBackupJSON(content);
        if (success) {
          setFormData(systemSettings);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Ribbon ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight">
                System Settings & Feature Control Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                v5.0 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Configure global feature flags, payment gateways, coordinator branding, tax rates, and export full system backups.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => resetSystemSettings()}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'features', label: '⚡ Feature Toggles', icon: Sliders },
          { id: 'crm', label: '🔗 CRM & Webhook API', icon: Webhook },
          { id: 'payments', label: '💳 Payment Gateways', icon: CreditCard },
          { id: 'branding', label: '🏢 Trade Mission Branding', icon: Building2 },
          { id: 'theme', label: '🎨 Theme & Typography', icon: Palette },
          { id: 'financials', label: '📐 Tax & Costing Defaults', icon: Percent },
          { id: 'security', label: '🔒 Security & Access Rules', icon: Shield },
          { id: 'backup', label: '💾 Backup & Restore (JSON)', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB: CRM & WEBHOOK INTEGRATION SUITE ───────────────────────── */}
      {activeSubTab === 'crm' && <CrmIntegrationSection />}

      {/* ── TAB 1: FEATURE TOGGLES ────────────────────────────────────── */}
      {activeSubTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'enableAiCopilot',
              title: '✨ AI Operations Copilot (Auto-CRUD)',
              desc: 'Enables the sticky left AI assistant for Back-Office staff to create and edit trips by text.',
              icon: Sparkles
            },
            {
              key: 'enableCustomerBooking',
              title: '🛒 Public Traveler Self-Booking & Checkout',
              desc: 'Allows delegates to register and pay online via the public booking portal.',
              icon: ShoppingCart
            },
            {
              key: 'enableEarlyBirdDiscount',
              title: '💥 Early Bird Special Pricing ($299)',
              desc: 'Displays the $299 early bird promotion badge on the homepage and booking modals.',
              icon: Percent
            },
            {
              key: 'enableTaxInvoicing',
              title: '🧾 Automated Tax & VAT Invoicing (7%)',
              desc: 'Generates official PDF tax invoices and receipts with VAT breakdowns on confirmation.',
              icon: Receipt
            },
            {
              key: 'enableSupportChat',
              title: '💬 24/7 Concierge Support Chat',
              desc: 'Displays the bottom-right live concierge chat widget for delegates and travelers.',
              icon: Bot
            },
            {
              key: 'enableDataRecovery',
              title: '🗑️ Data Recovery Center & Recycle Bin',
              desc: 'Soft-deletes items with 1-click recovery instead of permanent deletion.',
              icon: Trash2
            },
            {
              key: 'enableOfflineCache',
              title: '📴 Offline Itinerary & Emergency Helplines Cache',
              desc: 'Enables browser local caching for offline flight gates, routes, and emergency contacts.',
              icon: Wifi
            },
            {
              key: 'enablePushNotifications',
              title: '🔔 Real-Time Flight & System Alerts',
              desc: 'Broadcasts notifications for flight gates, hotel confirmations, and PO status changes.',
              icon: Bell
            }
          ].map(item => {
            const isEnabled = (formData as any)[item.key];
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${
                  isEnabled
                    ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-2xl ${
                      isEnabled
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => handleChange(item.key as any, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: PAYMENT GATEWAYS ───────────────────────────────────── */}
      {activeSubTab === 'payments' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Accepted Payment Methods & Cambodian Banking Gateways
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ⚡ Live Dynamic Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enable or disable specific payment rails. Changes update the Delegate Checkout Page in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {Object.values(formData.paymentGateways || {}).filter(Boolean).length} of 6 Enabled
              </span>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                key: 'abaPayWay', 
                name: 'ABA PayWay (KHQR)', 
                badge: 'Bakong / ABA Mobile',
                desc: 'Instant KHQR code scan via ABA Mobile App in USD & KHR', 
                color: 'text-sky-600 dark:text-sky-400',
                borderActive: 'border-sky-500/40 bg-sky-50/50 dark:bg-sky-950/20'
              },
              { 
                key: 'acledaXPay', 
                name: 'ACLEDA X-Pay (KHQR)', 
                badge: 'ACLEDA Mobile',
                desc: 'Direct merchant KHQR checkout via ACLEDA Mobile Banking', 
                color: 'text-blue-700 dark:text-blue-400',
                borderActive: 'border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20'
              },
              { 
                key: 'wingBank', 
                name: 'Wing Bank / WingPay', 
                badge: 'WingPay QR',
                desc: 'Instant Wing Account & Visa/Mastercard payment gateway', 
                color: 'text-lime-600 dark:text-lime-400',
                borderActive: 'border-lime-500/40 bg-lime-50/50 dark:bg-lime-950/20'
              },
              { 
                key: 'cards', 
                name: 'Credit & Debit Cards (Stripe)', 
                badge: 'Visa / MC / JCB / UnionPay',
                desc: 'Global card processing with 3D-Secure 2.0 fraud protection', 
                color: 'text-indigo-600 dark:text-indigo-400',
                borderActive: 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20'
              },
              { 
                key: 'applePay', 
                name: 'Apple Pay & Google Pay', 
                badge: '1-Touch Express',
                desc: 'Instant mobile device express checkout via Apple Wallet & G-Pay', 
                color: 'text-slate-800 dark:text-slate-200',
                borderActive: 'border-slate-500/40 bg-slate-100/70 dark:bg-slate-900/60'
              },
              { 
                key: 'biometricWallet', 
                name: 'Biometric Passkey Wallet', 
                badge: 'WebAuthn FaceID / TouchID',
                desc: 'W3C WebAuthn hardware passkey & biometric instant settlement', 
                color: 'text-amber-600 dark:text-amber-400',
                borderActive: 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
              }
            ].map(gw => {
              const isEnabled = formData.paymentGateways[gw.key as keyof typeof formData.paymentGateways];
              return (
                <div
                  key={gw.key}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isEnabled
                      ? `${gw.borderActive} shadow-sm`
                      : 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold ${gw.color}`}>{gw.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                          {gw.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {gw.desc}
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => handlePaymentToggle(gw.key as any, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                    <span className={isEnabled ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {isEnabled ? '● Active on Checkout' : '○ Disabled'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {gw.key}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>
                <strong>Corporate Bank Wire Transfers</strong> are always available as an official backup rail using the company accounts registered in the Profile & Branding tab.
              </span>
            </div>
            <button
              onClick={() => handleSaveAll()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shrink-0 cursor-pointer"
            >
              Force Sync All Rails
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: OFFICIAL TRADE MISSION & COORDINATOR PROFILE ──────────────── */}
      {activeSubTab === 'branding' && (
        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                  Official Trade Delegation & Accreditation
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Identity
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Official Trade Mission & Coordinator Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                Upload your official delegation seal/logo, letterhead banners, government statutory licenses, lead coordinator photo, signature, direct VIP Telegram/WhatsApp, and emergency hotline.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Branding</span>
            </button>
          </div>

          {/* ── Live Dual Preview (Mission Badge + Coordinator VIP Credential) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Mission Official Badge Preview */}
            <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Official Delegation Seal
                  </span>
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-md text-slate-300">
                    {formData.taxVatNumber || 'VAT-KHB-2026'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-lg border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {formData.companyLogoUrl ? (
                      <img
                        src={formData.companyLogoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-black text-white truncate">
                      {formData.companyName || 'Cambodia Trade Delegation'}
                    </h4>
                    <p className="text-[11px] text-indigo-200 line-clamp-2 mt-0.5">
                      {formData.companyTagline || 'Connecting Cambodian Business Leaders to Global Trade Hubs'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                  <div>
                    <span className="text-slate-400 block">MoC Reg:</span>
                    <span className="font-mono font-bold text-white">{formData.companyRegistrationNumber || 'MOC-00049281'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">MoT License:</span>
                    <span className="font-mono font-bold text-white">{formData.tourismLicenseNumber || 'MOT-KH-B2B-2026'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-indigo-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {formData.companyCityCountry || 'Phnom Penh, Cambodia'}
                </span>
                <span className="font-semibold text-emerald-400">● Accreditation Active</span>
              </div>
            </div>

            {/* Coordinator VIP Pass Preview */}
            <div className="lg:col-span-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    Lead Mission Coordinator Pass
                  </span>
                  <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md border border-teal-500/30">
                    VIP Protocol Officer
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 p-0.5 ring-2 ring-teal-400 shadow-lg shrink-0 overflow-hidden relative">
                    {formData.leadCoordinatorAvatar ? (
                      <img
                        src={formData.leadCoordinatorAvatar}
                        alt={formData.leadCoordinatorName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                        {formData.leadCoordinatorName?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-black text-white truncate">
                      {formData.leadCoordinatorName || 'Lead Mission Director'}
                    </h4>
                    <p className="text-[11px] text-teal-200 font-medium truncate mt-0.5">
                      {formData.leadCoordinatorTitle || 'Chief Trade Mission Director & Delegation Head'}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-1 font-mono truncate">
                      📞 {formData.leadCoordinatorPhone || '060 815 515'} • ✉️ {formData.leadCoordinatorEmail || 'coordinator@khbmedia.asia'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-[10px] text-slate-300 line-clamp-2">
                  {formData.leadCoordinatorBio || 'Senior trade facilitator orchestrating bilateral business delegations and Canton Fair matchmaking.'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-teal-300 font-mono">
                  Telegram: {formData.leadCoordinatorTelegram || '@VuthaTim'}
                </span>
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" />
                  24/7 Desk: {formData.emergencyHotline || 'Hotline Active'}
                </span>
              </div>
            </div>
          </div>

          {/* ── SECTION 1: TRADE MISSION IDENTITY & LOGO UPLOAD ─────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Trade Mission Visual Branding & Logo Studio
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload high-resolution delegation logos, letterhead banners, and official trade mission titles.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Logo Upload & Link Inputs */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Trade Mission Seal / Logo (PNG, SVG, JPG)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={formData.companyLogoUrl || ''}
                        onChange={(e) => handleChange('companyLogoUrl', e.target.value)}
                        placeholder="https://example.com/mission-seal.png"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                      />
                      <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <label className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>Upload Logo Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const result = uploadEvent.target?.result as string;
                              if (result) {
                                handleChange('companyLogoUrl', result);
                                addNotification('Logo Uploaded', 'Official trade mission logo updated successfully.', 'system');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Direct local file upload automatically converts images to secure base64 format for instant rendering.
                  </p>
                </div>

                {/* Letterhead Banner URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mission Letterhead Banner / Hero Header Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={formData.companyBannerUrl || ''}
                        onChange={(e) => handleChange('companyBannerUrl', e.target.value)}
                        placeholder="https://example.com/banner-wide.jpg"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                      />
                      <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <label className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const result = uploadEvent.target?.result as string;
                              if (result) {
                                handleChange('companyBannerUrl', result);
                                addNotification('Banner Uploaded', 'Mission letterhead banner updated successfully.', 'system');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Logos 1-Click */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    ✨ Quick Preset Delegation Badges (1-Click Apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {LOGO_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          handleChange('companyLogoUrl', preset.url);
                          addNotification('Preset Applied', `Applied ${preset.name} badge.`, 'system');
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          formData.companyLogoUrl === preset.url
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold truncate">{preset.name}</div>
                          <div className="text-[9px] text-slate-400 truncate">{preset.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Logo Active Rendering
                </span>
                <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 shadow-sm flex items-center justify-center overflow-hidden">
                  {formData.companyLogoUrl ? (
                    <img
                      src={formData.companyLogoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {formData.companyName || 'Trade Mission'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    High-DPI 1:1 Square & Vector Compatible
                  </span>
                </div>
              </div>
            </div>

            {/* Mission Titles & Slogans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Trade Mission / Corporate Legal Name
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="e.g. KHB Events Co., Ltd. — Cambodia Trade Delegation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mission Theme / Delegation Purpose Slogan
                </label>
                <input
                  type="text"
                  value={formData.companyTagline || ''}
                  onChange={(e) => handleChange('companyTagline', e.target.value)}
                  placeholder="e.g. Connecting Cambodian Leaders to Global Factories & Canton Fair 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Website URL
                </label>
                <input
                  type="url"
                  value={formData.companyWebsite || ''}
                  onChange={(e) => handleChange('companyWebsite', e.target.value)}
                  placeholder="https://khbevents.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Accreditation & Endorsement Badge
                </label>
                <input
                  type="text"
                  value={formData.tradeMissionAccreditation || ''}
                  onChange={(e) => handleChange('tradeMissionAccreditation', e.target.value)}
                  placeholder="e.g. Official B2B Tour Operator & Delegation Partner — Approved by MoT & MoC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: LEAD TRADE MISSION COORDINATOR PROFILE ───────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Lead Trade Mission Coordinator & Delegation Officer Profile
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload coordinator headshot, digital signature stamp, and direct VIP communication lines for delegates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Coordinator Avatar Upload & Presets */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Coordinator Headshot / Photo (PNG or JPG)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={formData.leadCoordinatorAvatar || ''}
                        onChange={(e) => handleChange('leadCoordinatorAvatar', e.target.value)}
                        placeholder="https://example.com/coordinator-photo.jpg"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                      />
                      <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <label className="px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>Upload Headshot</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const result = uploadEvent.target?.result as string;
                              if (result) {
                                handleChange('leadCoordinatorAvatar', result);
                                addNotification('Avatar Uploaded', 'Coordinator headshot updated.', 'system');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Digital Signature / Stamp Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Coordinator Digital Signature / Official Stamp (For Vouchers & Certificates)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={formData.leadCoordinatorSignatureUrl || ''}
                        onChange={(e) => handleChange('leadCoordinatorSignatureUrl', e.target.value)}
                        placeholder="https://example.com/signature-stamp.png"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                      />
                      <Stamp className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <label className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>Upload Stamp</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const result = uploadEvent.target?.result as string;
                              if (result) {
                                handleChange('leadCoordinatorSignatureUrl', result);
                                addNotification('Signature Uploaded', 'Official approval stamp updated.', 'system');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 1-Click Avatar Presets */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    👤 Quick Coordinator Avatar Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {COORDINATOR_AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          handleChange('leadCoordinatorAvatar', preset.url);
                          addNotification('Avatar Selected', `Applied ${preset.name}.`, 'system');
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          formData.leadCoordinatorAvatar === preset.url
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold truncate">{preset.name}</div>
                          <div className="text-[9px] text-slate-400 truncate">{preset.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coordinator Active Avatar Preview Card */}
              <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Coordinator Active Profile
                </span>
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-teal-500/30 overflow-hidden flex items-center justify-center shadow-md">
                  {formData.leadCoordinatorAvatar ? (
                    <img
                      src={formData.leadCoordinatorAvatar}
                      alt={formData.leadCoordinatorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCheck className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {formData.leadCoordinatorName || 'Mr. Tim Vutha'}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block mt-0.5">
                    {formData.leadCoordinatorTitle || 'Lead Mission Director'}
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinator Detailed Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Coordinator Full Name
                </label>
                <input
                  type="text"
                  value={formData.leadCoordinatorName || ''}
                  onChange={(e) => handleChange('leadCoordinatorName', e.target.value)}
                  placeholder="e.g. Mr. Tim Vutha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Title / Mission Role
                </label>
                <input
                  type="text"
                  value={formData.leadCoordinatorTitle || ''}
                  onChange={(e) => handleChange('leadCoordinatorTitle', e.target.value)}
                  placeholder="e.g. Chief Trade Mission Director & Delegation Head"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Phone / Mobile / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.leadCoordinatorPhone || ''}
                  onChange={(e) => handleChange('leadCoordinatorPhone', e.target.value)}
                  placeholder="060 815 515"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  VIP Direct Telegram Link / Handle
                </label>
                <input
                  type="text"
                  value={formData.leadCoordinatorTelegram || ''}
                  onChange={(e) => handleChange('leadCoordinatorTelegram', e.target.value)}
                  placeholder="https://t.me/VuthaTim"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Coordinator Direct Email
                </label>
                <input
                  type="email"
                  value={formData.leadCoordinatorEmail || ''}
                  onChange={(e) => handleChange('leadCoordinatorEmail', e.target.value)}
                  placeholder="vutha.tim@khbmedia.asia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WeChat ID (Canton Fair & China Liaison)
                </label>
                <input
                  type="text"
                  value={formData.leadCoordinatorWeChat || ''}
                  onChange={(e) => handleChange('leadCoordinatorWeChat', e.target.value)}
                  placeholder="TimVutha_KHB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Coordinator Professional Background & Delegate Welcome Note
                </label>
                <textarea
                  rows={2}
                  value={formData.leadCoordinatorBio || ''}
                  onChange={(e) => handleChange('leadCoordinatorBio', e.target.value)}
                  placeholder="Senior trade facilitator orchestrating bilateral business delegations, VIP factory visits, and Canton Fair procurement matchmaking for Cambodian enterprises."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: GOVERNMENT STATUTORY CREDENTIALS & COMPLIANCE ───── */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Government Statutory Credentials & Tax Compliance
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  These official license and VAT numbers appear on all customer tax invoices and certified receipts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ministry of Commerce (MoC) Reg #
                </label>
                <input
                  type="text"
                  value={formData.companyRegistrationNumber || ''}
                  onChange={(e) => handleChange('companyRegistrationNumber', e.target.value)}
                  placeholder="MOC-00049281-2024"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ministry of Tourism (MoT) Tour Operator License #
                </label>
                <input
                  type="text"
                  value={formData.tourismLicenseNumber || ''}
                  onChange={(e) => handleChange('tourismLicenseNumber', e.target.value)}
                  placeholder="MOT-KH-B2B-2026-092"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  General Department of Taxation (GDT) VAT #
                </label>
                <input
                  type="text"
                  value={formData.taxVatNumber || ''}
                  onChange={(e) => handleChange('taxVatNumber', e.target.value)}
                  placeholder="VAT-KHB-2026-8899"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 4: HEADQUARTERS & 24/7 ON-GROUND HELPLINES ─────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Headquarters & 24/7 On-Ground Delegation Helplines
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Contact details printed on hotel vouchers, itinerary packages, and emergency cards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Head Office Street Address
                </label>
                <input
                  type="text"
                  value={formData.companyAddress || ''}
                  onChange={(e) => handleChange('companyAddress', e.target.value)}
                  placeholder="#128, Preah Norodom Blvd, Sangkat Tonle Bassac, Khan Chamkarmon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City & Country
                </label>
                <input
                  type="text"
                  value={formData.companyCityCountry || ''}
                  onChange={(e) => handleChange('companyCityCountry', e.target.value)}
                  placeholder="Phnom Penh, Cambodia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  24/7 VIP Emergency Helpline
                </label>
                <input
                  type="text"
                  value={formData.emergencyHotline || ''}
                  onChange={(e) => handleChange('emergencyHotline', e.target.value)}
                  placeholder="+855 60 815 515 (24/7 VIP Concierge Desk)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  General Inquiries Email
                </label>
                <input
                  type="email"
                  value={formData.companyEmail || ''}
                  onChange={(e) => handleChange('companyEmail', e.target.value)}
                  placeholder="contact@khbevents.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  On-Ground Delegation Support Pavilion / Desk
                </label>
                <input
                  type="text"
                  value={formData.delegationSupportDesk || ''}
                  onChange={(e) => handleChange('delegationSupportDesk', e.target.value)}
                  placeholder="Hotel Landmark Canton Executive Desk & KHB Pavilion"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 5: OFFICIAL SETTLEMENT BANKING RAILS ────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Corporate Settlement Bank Rails & KHQR
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bank wire instructions automatically attached to commercial VAT tax invoices and registration proformas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="ABA Bank (Advanced Bank of Asia Ltd.)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary Account Name
                </label>
                <input
                  type="text"
                  value={formData.bankAccountName || ''}
                  onChange={(e) => handleChange('bankAccountName', e.target.value)}
                  placeholder="KHB EVENTS CO., LTD."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Number / KHQR Handle
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber || ''}
                  onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                  placeholder="000 888 999 (USD) / KHQR ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  value={formData.bankSwiftBic || ''}
                  onChange={(e) => handleChange('bankSwiftBic', e.target.value)}
                  placeholder="ABAAKHPP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Settlement Branch Location
                </label>
                <input
                  type="text"
                  value={formData.bankBranch || ''}
                  onChange={(e) => handleChange('bankBranch', e.target.value)}
                  placeholder="Central Head Office Branch, Phnom Penh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 6: SOCIAL & BROADCAST CHANNELS ─────────────────────── */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                6
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delegate Broadcasts & Social Media Channels
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Keep delegates updated with live trade alerts, itinerary changes, and business networking news.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Telegram Broadcast Channel
                </label>
                <input
                  type="url"
                  value={formData.telegramChannel || ''}
                  onChange={(e) => handleChange('telegramChannel', e.target.value)}
                  placeholder="https://t.me/khbtradehub"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/khbevents"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  LinkedIn Corporate Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/company/khb-events"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setFormData(systemSettings);
                addNotification('Reverted', 'Form restored to saved settings.', 'system');
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer transition-all"
            >
              Reset to Saved
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish All Trade Mission Info</span>
            </button>
          </div>
        </form>
      )}

      {/* ── TAB: AI THEME & COLOR & FONT TYPOGRAPHY ───────────────────── */}
      {activeSubTab === 'theme' && (
        <div className="space-y-6">
          {/* AI Banner Hero */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  Gemini Smart Palette & Font Engine
                </span>
                <span className="text-xs text-indigo-200">WCAG AA Contrast Verified</span>
              </div>
              <h3 className="text-lg font-black tracking-tight">
                AI Color Detection & Dynamic Typography Studio
              </h3>
              <p className="text-xs text-slate-300">
                Customize brand colors, interface font families, Khmer script typography, heading weights, line spacing, and letter spacing across the entire KHB Events portal and ERP.
              </p>
            </div>

            <button
              onClick={() => setShowAiThemeModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Launch Theme & Font Studio Modal</span>
            </button>
          </div>

          {/* 1. Theme Presets Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  <span>Curated Business Delegation Color Palettes</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a pre-tuned chromatic system or customize individual primary and accent hex colors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {Object.entries(THEME_PRESETS).map(([key, pal]) => {
                const isSelected = (formData.themePreset || 'navy') === key;
                return (
                  <div
                    key={key}
                    onClick={() => {
                      const updated = {
                        ...formData,
                        themePreset: key as any,
                        primaryColor: pal.primary,
                        secondaryColor: pal.secondary,
                        accentColor: pal.accent,
                      };
                      setFormData(updated);
                      updateSystemSettings(updated);
                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 2000);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: pal.primary }} />
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: pal.secondary }} />
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: pal.accent }} />
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-600 text-white flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {pal.themeName}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {pal.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Pri: {pal.primary}</span>
                      <span>Acc: {pal.accent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Primary Latin & Multi-Lingual Font Family */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CaseSensitive className="w-4 h-4 text-indigo-500" />
                  <span>Primary Interface Font Family (Latin & Global UI)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Governs all body copy, data tables, form inputs, dialogs, and navigation elements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FONT_LATIN_OPTIONS.map((f) => {
                const isSelected = (formData.fontFamilyLatin || 'plus-jakarta') === f.key;
                return (
                  <div
                    key={f.key}
                    onClick={() => {
                      const updated = {
                        ...formData,
                        fontFamilyLatin: f.key as any,
                      };
                      setFormData(updated);
                      updateSystemSettings(updated);
                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 2000);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{f.label}</span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-600 text-white flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{f.category.split(' ')[0]}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{f.category}</div>
                    <div
                      className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 truncate"
                      style={{ fontFamily: f.fontStack }}
                    >
                      {f.sampleText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Khmer Script Typography (សម្រាប់ភាសាខ្មែរ) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkle className="w-4 h-4 text-amber-500" />
                  <span>Khmer Script Typography (ពុម្ពអក្សរភាសាខ្មែរ)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  High-fidelity font styling for Cambodian trade missions, official itineraries, and bilateral contracts.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FONT_KHMER_OPTIONS.map((f) => {
                const isSelected = (formData.fontFamilyKhmer || 'kantumruy-pro') === f.key;
                return (
                  <div
                    key={f.key}
                    onClick={() => {
                      const updated = {
                        ...formData,
                        fontFamilyKhmer: f.key as any,
                      };
                      setFormData(updated);
                      updateSystemSettings(updated);
                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 2000);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{f.label}</span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{f.category.split(' ')[0]}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{f.category}</div>
                    <div
                      className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-base text-slate-900 dark:text-white font-medium truncate"
                      style={{ fontFamily: f.fontStack }}
                    >
                      {f.sampleText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Heading Font Style & Weight Matrix */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-sky-500" />
                <span>Headings & Title Typography Configuration</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize display headline typeface and structural stroke weights for section banners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Heading Font Family */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Headline Font Family
                </label>
                <select
                  value={formData.fontFamilyHeading || 'inherit'}
                  onChange={(e) => {
                    const updated = { ...formData, fontFamilyHeading: e.target.value as any };
                    setFormData(updated);
                    updateSystemSettings(updated);
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FONT_HEADING_OPTIONS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label} &mdash; {f.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Heading Font Weight */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Headline Stroke Weight
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'normal', label: 'Regular 400' },
                    { key: 'semibold', label: 'Medium 600' },
                    { key: 'bold', label: 'Bold 700' },
                    { key: 'black', label: 'Heavy 900' },
                  ].map((w) => {
                    const isSelected = (formData.headingFontWeight || 'bold') === w.key;
                    return (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, headingFontWeight: w.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-1.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Typography Baseline, Alignment, Spacing, Padding & Shape Geometry */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Typography, Spacing, Alignment & Geometry Studio</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fine-tune optical readability, text alignment, paragraph margins, card padding, line height, and corner geometry.
              </p>
            </div>

            {/* Baseline Font Scale */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Baseline Font Scale
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {[
                  { key: 'compact', label: 'Compact (14.5px)', desc: 'High ERP table density', scale: '90%' },
                  { key: 'normal', label: 'Normal (16px)', desc: 'Default standard balanced layout', scale: '100%' },
                  { key: 'comfortable', label: 'Comfortable (16.5px)', desc: 'Enhanced mobile legibility', scale: '105%' },
                  { key: 'large', label: 'Large (17.5px)', desc: 'Executive high-visibility mode', scale: '115%' },
                  { key: 'extra-large', label: 'Extra Large (19px)', desc: 'Ultra-clear presentation mode', scale: '125%' },
                ].map((opt) => {
                  const isSelected = (formData.fontSizeScale || 'normal') === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          fontSizeScale: opt.key as any,
                        };
                        setFormData(updated);
                        updateSystemSettings(updated);
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 font-bold ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{opt.label}</span>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">{opt.scale}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-normal">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row: Text Alignment & Paragraph Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              {/* Text Alignment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-blue-500" />
                  <span>Document & Text Alignment</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'left', label: 'Left Aligned', icon: AlignLeft },
                    { key: 'center', label: 'Centered', icon: AlignCenter },
                    { key: 'justify', label: 'Justified', icon: AlignJustify },
                  ].map((align) => {
                    const isSelected = (formData.textAlign || 'left') === align.key;
                    const IconComp = align.icon;
                    return (
                      <button
                        key={align.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, textAlign: align.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{align.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paragraph Spacing */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Paragraph Spacing (Margin Bottom)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'compact', label: 'Compact', val: '0.5rem' },
                    { key: 'normal', label: 'Normal', val: '0.875rem' },
                    { key: 'relaxed', label: 'Relaxed', val: '1.25rem' },
                    { key: 'loose', label: 'Loose', val: '1.75rem' },
                  ].map((ps) => {
                    const isSelected = (formData.paragraphSpacing || 'normal') === ps.key;
                    return (
                      <button
                        key={ps.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, paragraphSpacing: ps.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div>{ps.label}</div>
                        <div className="text-[9px] opacity-75 font-mono">{ps.val}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row: Content Padding & Corner Radius */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              {/* Card / Content Padding Scale */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-amber-500" />
                  <span>Card & Container Padding</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'compact', label: 'Compact', val: '12px' },
                    { key: 'normal', label: 'Normal', val: '20px' },
                    { key: 'spacious', label: 'Spacious', val: '28px' },
                    { key: 'generous', label: 'Generous', val: '36px' },
                  ].map((cp) => {
                    const isSelected = (formData.contentPadding || 'normal') === cp.key;
                    return (
                      <button
                        key={cp.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, contentPadding: cp.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div>{cp.label}</div>
                        <div className="text-[9px] opacity-75 font-mono">{cp.val}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Corner Radius & Geometry */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Square className="w-4 h-4 text-purple-500" />
                  <span>Border Radius & Corner Geometry</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'none', label: 'Sharp', val: '0px' },
                    { key: 'subtle', label: 'Subtle', val: '8px' },
                    { key: 'rounded', label: 'Rounded', val: '16px' },
                    { key: 'pill', label: 'Pill / Soft', val: '24px' },
                  ].map((br) => {
                    const isSelected = (formData.borderRadiusPreset || 'rounded') === br.key;
                    return (
                      <button
                        key={br.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, borderRadiusPreset: br.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div>{br.label}</div>
                        <div className="text-[9px] opacity-75 font-mono">{br.val}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row: Heading Transform & Heading Letter Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-indigo-500" />
                  <span>Heading Text Transform</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'none', label: 'Normal Case' },
                    { key: 'uppercase', label: 'UPPERCASE' },
                    { key: 'capitalize', label: 'Capitalize' },
                  ].map((ht) => {
                    const isSelected = (formData.headingTransform || 'none') === ht.key;
                    return (
                      <button
                        key={ht.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, headingTransform: ht.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {ht.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CaseSensitive className="w-4 h-4 text-cyan-500" />
                  <span>Heading Tracking (Kerning)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'tight', label: 'Tight' },
                    { key: 'normal', label: '0 Normal' },
                    { key: 'wide', label: '+0.05 Wide' },
                    { key: 'widest', label: '+0.10 Exp' },
                  ].map((ls) => {
                    const isSelected = (formData.headingLetterSpacing || 'normal') === ls.key;
                    return (
                      <button
                        key={ls.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, headingLetterSpacing: ls.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-cyan-600 bg-cyan-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {ls.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Line Height & Letter Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-teal-500" />
                  <span>Body Line Height (Leading)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'snug', label: 'Snug (1.4x)' },
                    { key: 'normal', label: 'Normal (1.55x)' },
                    { key: 'relaxed', label: 'Relaxed (1.7x)' },
                    { key: 'loose', label: 'Loose (1.9x)' },
                  ].map((lh) => {
                    const isSelected = (formData.fontLineHeight || 'normal') === lh.key;
                    return (
                      <button
                        key={lh.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, fontLineHeight: lh.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {lh.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CaseSensitive className="w-4 h-4 text-purple-500" />
                  <span>Body Letter Spacing (Tracking)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'tight', label: 'Tight (-0.025)' },
                    { key: 'normal', label: '0 Normal' },
                    { key: 'wide', label: '+0.025' },
                    { key: 'widest', label: '+0.05' },
                  ].map((ls) => {
                    const isSelected = (formData.fontLetterSpacing || 'normal') === ls.key;
                    return (
                      <button
                        key={ls.key}
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, fontLetterSpacing: ls.key as any };
                          setFormData(updated);
                          updateSystemSettings(updated);
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        }}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {ls.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Anti-Blend Text Color on Colored Backgrounds & Contrast Protection */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Contrast className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Anti-Blend Font Color & Shape Background Contrast</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        WCAG 2.1 AAA
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically resolves text color on all colored background shapes and buttons so font never blends with background
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.highContrastText !== false}
                    onChange={(e) => {
                      const updated = { ...formData, highContrastText: e.target.checked };
                      setFormData(updated);
                      updateSystemSettings(updated);
                      setIsSaved(true);
                      setTimeout(() => setIsSaved(false), 2000);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Live Shape Contrast Diagnostic Badges */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Live Shape Background Anti-Blend Contrast Verification:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Primary Color Badge */}
                  {(() => {
                    const bg = formData.primaryColor || '#0284c7';
                    const textColor = getContrastTextColor(bg);
                    return (
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                        style={{ backgroundColor: bg, color: textColor }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Primary Shape ({textColor === '#ffffff' ? 'Light Font' : 'Dark Font'})</span>
                      </span>
                    );
                  })()}

                  {/* Secondary Color Badge */}
                  {(() => {
                    const bg = formData.secondaryColor || '#0f172a';
                    const textColor = getContrastTextColor(bg);
                    return (
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                        style={{ backgroundColor: bg, color: textColor }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Secondary ({textColor === '#ffffff' ? 'Light Font' : 'Dark Font'})</span>
                      </span>
                    );
                  })()}

                  {/* Accent Color Badge */}
                  {(() => {
                    const bg = formData.accentColor || '#f59e0b';
                    const textColor = getContrastTextColor(bg);
                    return (
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                        style={{ backgroundColor: bg, color: textColor }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accent ({textColor === '#ffffff' ? 'Light Font' : 'Dark Font'})</span>
                      </span>
                    );
                  })()}

                  {/* Emerald Badge */}
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirmed Pass</span>
                  </span>

                  {/* Amber Badge */}
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 text-slate-900 shadow-sm flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>VIP Badge</span>
                  </span>
                </div>
              </div>
            </div>

            {/* High-Contrast Bold Stroke Boost */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  High-Contrast Bold Stroke Boost
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Enhances text stroke density for elevated visibility in bright daylight or mobile screens
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.fontBoldBoost}
                  onChange={(e) => {
                    const updated = { ...formData, fontBoldBoost: e.target.checked };
                    setFormData(updated);
                    updateSystemSettings(updated);
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* 6. Live Interactive Typography & Theme Sandbox */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Interactive Typography & Shape Sandbox
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Live DOM Rendered
              </span>
            </div>

            <div
              className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-4 transition-all"
              style={{
                borderRadius: formData.borderRadiusPreset === 'none' ? '0px' : formData.borderRadiusPreset === 'subtle' ? '8px' : formData.borderRadiusPreset === 'pill' ? '24px' : '16px',
                padding: formData.contentPadding === 'compact' ? '12px' : formData.contentPadding === 'spacious' ? '28px' : formData.contentPadding === 'generous' ? '36px' : '20px',
                textAlign: (formData.textAlign || 'left') as any,
              }}
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Headline Font & Case Transform:
                </span>
                <h2
                  className="text-xl font-heading text-slate-900 dark:text-white mt-1"
                  style={{
                    letterSpacing: formData.headingLetterSpacing === 'tight' ? '-0.025em' : formData.headingLetterSpacing === 'wide' ? '0.05em' : formData.headingLetterSpacing === 'widest' ? '0.1em' : '0em',
                    textTransform: (formData.headingTransform || 'none') as any,
                  }}
                >
                  KHB Events &bull; 137th Canton Fair International Trade Expedition
                </h2>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Khmer Script Rendering (អក្សរខ្មែរ):
                </span>
                <p
                  className="text-base font-khmer text-slate-800 dark:text-slate-200 mt-1"
                  style={{
                    marginBottom: formData.paragraphSpacing === 'compact' ? '0.5rem' : formData.paragraphSpacing === 'relaxed' ? '1.25rem' : formData.paragraphSpacing === 'loose' ? '1.75rem' : '0.875rem',
                  }}
                >
                  បេសកកម្មពាណិជ្ជកម្មកម្ពុជា-ចិន ដំណើរកម្សាន្តធុរកិច្ច VIP និងកិច្ចប្រជុំផ្គូផ្គងដៃគូយុទ្ធសាស្ត្រ
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Body Typography & Spacing:
                </span>
                <p
                  className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed"
                  style={{
                    marginBottom: formData.paragraphSpacing === 'compact' ? '0.5rem' : formData.paragraphSpacing === 'relaxed' ? '1.25rem' : formData.paragraphSpacing === 'loose' ? '1.75rem' : '0.875rem',
                  }}
                >
                  Join over 1,500 delegates across ASEAN for 5 days of bilateral networking, B2B matchmaking sessions, automated tax-compliant invoicing, and guided VIP factory tours.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3 flex-wrap">
                {(() => {
                  const primaryBg = formData.primaryColor || '#0284c7';
                  const primaryText = getContrastTextColor(primaryBg);
                  const accentBg = formData.accentColor || '#f59e0b';
                  const accentText = getContrastTextColor(accentBg);

                  return (
                    <>
                      <button
                        type="button"
                        className="px-4 py-2 text-xs font-bold shadow-sm transition-transform active:scale-95"
                        style={{
                          backgroundColor: primaryBg,
                          color: primaryText,
                          borderRadius: formData.borderRadiusPreset === 'none' ? '0px' : formData.borderRadiusPreset === 'subtle' ? '6px' : formData.borderRadiusPreset === 'pill' ? '9999px' : '12px',
                        }}
                      >
                        Register Delegation Seat
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-xs font-bold shadow-sm"
                        style={{
                          backgroundColor: accentBg,
                          color: accentText,
                          borderRadius: formData.borderRadiusPreset === 'none' ? '0px' : formData.borderRadiusPreset === 'subtle' ? '6px' : formData.borderRadiusPreset === 'pill' ? '9999px' : '12px',
                        }}
                      >
                        ★ VIP Express Pass ($3,500)
                      </button>
                    </>
                  );
                })()}
                <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Alignment: {formData.textAlign || 'left'} &bull; Radius: {formData.borderRadiusPreset || 'rounded'} &bull; Padding: {formData.contentPadding || 'normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: FINANCIALS & COSTING DEFAULTS ──────────────────────── */}
      {activeSubTab === 'financials' && (
        <form onSubmit={handleSaveAll} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Financial Margin Rules & Tax Rates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Default formulas used by the Costing Engine to calculate recommended adult and child prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                VAT / Tourism Tax (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.taxRatePercent ?? 0}
                onChange={(e) => handleChange('taxRatePercent', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Adult Margin (%)
              </label>
              <input
                type="number"
                value={formData.defaultAdultMarginPercent ?? 15}
                onChange={(e) => handleChange('defaultAdultMarginPercent', parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Child Discount (%)
              </label>
              <input
                type="number"
                value={formData.defaultChildDiscountPercent ?? 20}
                onChange={(e) => handleChange('defaultChildDiscountPercent', parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Min Delegation Size (Pax)
              </label>
              <input
                type="number"
                value={formData.defaultMinGroupSize ?? 30}
                onChange={(e) => handleChange('defaultMinGroupSize', parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
              />
            </div>
          </div>
        </form>
      )}

      {/* ── TAB 5: SECURITY RULES ─────────────────────────────────────── */}
      {activeSubTab === 'security' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Back-Office Access & Staff Authentication Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control which domains and biometric credentials are authorized to view and modify business records.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Restrict Staff Login to Domain
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Only accounts ending in @{formData.allowedAdminDomain} can access the Back-Office ERP.
                </div>
              </div>
              <input
                type="text"
                value={formData.allowedAdminDomain || ''}
                onChange={(e) => handleChange('allowedAdminDomain', e.target.value)}
                className="w-48 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono text-right"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Biometric Passkeys (Fingerprint / FaceID)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Allow passwordless WebAuthn biometric login for authorized staff and delegates.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableBiometricAuth}
                  onChange={(e) => handleChange('enableBiometricAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: BACKUP & RESTORE ───────────────────────────────────── */}
      {activeSubTab === 'backup' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete System Backup & Disaster Recovery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Export a standalone JSON snapshot containing all packages, suppliers, POs, expenses, bookings, and configuration settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export Full System Snapshot
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Download complete database as a single JSON file.
                  </p>
                </div>
              </div>
              <button
                onClick={exportSystemBackupJSON}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup (.JSON)</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Restore from JSON Backup
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a previously saved snapshot to restore system state.
                  </p>
                </div>
              </div>
              <label className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload & Restore Backup (.JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* AI Theme & Color Detector Modal */}
      <AiThemeColorDetectorModal
        isOpen={showAiThemeModal}
        onClose={() => setShowAiThemeModal(false)}
      />
    </div>
  );
};
