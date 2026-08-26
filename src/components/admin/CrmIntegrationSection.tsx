import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Webhook,
  Send,
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  Globe,
  Server,
  Zap,
  Sliders,
  Layers,
  FileJson,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Search,
  Filter,
  Trash2,
  Play,
  Sparkles,
  Shield,
  Lock,
  ChevronRight,
  ExternalLink,
  Users,
  Briefcase,
  BookOpen,
  Download,
  Code2,
  Terminal,
  FileCode,
  Table as TableIcon,
  Workflow,
  CheckCheck,
  FileText
} from 'lucide-react';
import { CrmConfig, CrmWebhookEventType, CrmWebhookEvent, CrmSyncLog } from '../../types';
import {
  CRM_SYSTEM_OVERVIEW,
  CRM_FIELD_MAPPINGS,
  CRM_EVENTS_REGISTRY,
  OPERATIONAL_STAGES_DOC,
  CRM_CAPABILITY_PILLARS,
  CRM_COOPERATION_SCENARIOS,
  generateCurlSnippet,
  generateTypeScriptSnippet,
  generatePythonSnippet,
  generatePhpSnippet,
  generateGoSnippet,
  generateZapierWebhookGuide,
  generateOpenApiSpec,
  generateMarkdownIntegrationGuide,
  generateCrmAiPrompt,
  generateCapabilityManifestJson,
  CrmEventDoc
} from '../../services/crmDocumentation';

export const CrmIntegrationSection: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    bookings,
    users,
    crmEvents,
    crmSyncLogs,
    inboundLeads,
    setAdminActiveTab,
    pushBookingToCrm,
    pushCustomerToCrm,
    syncAllBookingsToCrm,
    syncAllCustomersToCrm,
    syncAllLeadsProgressToCrm,
    testCrmConnection,
    simulateWebhookTrigger,
    refreshWebhookEvents,
    addNotification,
    t
  } = useApp();

  type TabType = 'inbound_webhooks' | 'outbound_api' | 'simulator' | 'sync_logs' | 'docs';
  const [activeTab, setActiveTab] = useState<TabType>('inbound_webhooks');


  // Form configuration state
  const [crmConfig, setCrmConfig] = useState<CrmConfig>(() => ({
    crmEndpointUrl: systemSettings?.crmConfig?.crmEndpointUrl || 'https://khbcrm.vercel.app/api/webhooks/inbound',
    crmApiToken: systemSettings?.crmConfig?.crmApiToken || 'khb_crm_live_tok_9948271049281746',
    crmAuthType: systemSettings?.crmConfig?.crmAuthType || 'bearer',
    crmHeaderKey: systemSettings?.crmConfig?.crmHeaderKey || 'Authorization',
    crmWebhookSecret: systemSettings?.crmConfig?.crmWebhookSecret || 'khb_crm_secret_2026',
    crmAutoSyncBookings: systemSettings?.crmConfig?.crmAutoSyncBookings ?? true,
    crmAutoSyncCustomers: systemSettings?.crmConfig?.crmAutoSyncCustomers ?? true,
    crmOrganizationId: systemSettings?.crmConfig?.crmOrganizationId || 'KHB-DELEGATION-HQ',
    lastSyncAt: systemSettings?.crmConfig?.lastSyncAt || new Date().toISOString(),
    syncStatus: systemSettings?.crmConfig?.syncStatus || 'connected',
  }));

  const [showApiToken, setShowApiToken] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Ping test state
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    statusCode: number;
    message: string;
  } | null>(null);

  // Batch sync state
  const [isSyncingAllBookings, setIsSyncingAllBookings] = useState(false);
  const [isSyncingAllCustomers, setIsSyncingAllCustomers] = useState(false);
  const [isSyncingAllLeads, setIsSyncingAllLeads] = useState(false);
  const [batchSyncResult, setBatchSyncResult] = useState<{ type: string; total: number; success: number } | null>(null);

  // Simulator state
  const [simEventType, setSimEventType] = useState<CrmWebhookEventType>('booking.status_updated');
  const [simCustomMessage, setSimCustomMessage] = useState('');
  const [simPayloadJson, setSimPayloadJson] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; message: string } | null>(null);

  // Log filter and inspect modal
  const [logFilter, setLogFilter] = useState<'all' | 'inbound' | 'outbound' | 'errors'>('all');
  const [logSearch, setLogSearch] = useState('');
  const [inspectedItem, setInspectedItem] = useState<any | null>(null);

  // Default origin webhook URL
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://trip.khbevents.com';
  const webhookUrl = `${originUrl}/api/webhooks/crm-leads`;

  // Documentation Portal State
  const [docsSubTab, setDocsSubTab] = useState<'overview' | 'ai_prompt' | 'events' | 'code' | 'mappings' | 'workflow' | 'openapi'>('overview');
  const [selectedDocEventIndex, setSelectedDocEventIndex] = useState(0);
  const [selectedCodeLang, setSelectedCodeLang] = useState<'curl' | 'ts' | 'python' | 'php' | 'go' | 'zapier'>('curl');

  const handleDownloadOpenApiJson = () => {
    const spec = generateOpenApiSpec(originUrl);
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KHB-BizTrip-CRM-OpenAPI-v2.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification('OpenAPI Spec Exported', 'Downloaded machine-readable OpenAPI 3.0 JSON specification.', 'system');
  };

  const handleDownloadCapabilityManifest = () => {
    const manifest = generateCapabilityManifestJson(originUrl);
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KHB-BizTrip-Capabilities.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification('Manifest Exported', 'Downloaded machine-readable CRM capability manifest JSON.', 'system');
  };

  const handleDownloadMarkdownGuide = () => {
    const md = generateMarkdownIntegrationGuide(originUrl);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KHB-CRM-Integration-Specification-v2.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification('Guide Exported', 'Downloaded markdown CRM integration specification.', 'system');
  };

  // Synchronize form if systemSettings changes externally
  useEffect(() => {
    if (systemSettings?.crmConfig) {
      setCrmConfig(prev => ({
        ...prev,
        ...systemSettings.crmConfig,
        crmEndpointUrl: systemSettings.crmConfig.crmEndpointUrl || prev.crmEndpointUrl || '',
        crmApiToken: systemSettings.crmConfig.crmApiToken || prev.crmApiToken || '',
        crmAuthType: systemSettings.crmConfig.crmAuthType || prev.crmAuthType || 'bearer',
        crmHeaderKey: systemSettings.crmConfig.crmHeaderKey || prev.crmHeaderKey || 'Authorization',
        crmWebhookSecret: systemSettings.crmConfig.crmWebhookSecret || prev.crmWebhookSecret || '',
        crmOrganizationId: systemSettings.crmConfig.crmOrganizationId || prev.crmOrganizationId || '',
        crmAutoSyncBookings: systemSettings.crmConfig.crmAutoSyncBookings ?? prev.crmAutoSyncBookings ?? true,
        crmAutoSyncCustomers: systemSettings.crmConfig.crmAutoSyncCustomers ?? prev.crmAutoSyncCustomers ?? true,
      }));
    }
  }, [systemSettings?.crmConfig]);

  // Preset generator for the simulator
  const loadPreset = (presetType: 'deal_won' | 'confirm_booking' | 'cancel_booking' | 'flight_delay' | 'vip_upgrade' | 'broadcast') => {
    const sampleBooking = bookings[0] || { bookingCode: 'KHB-TRIP-2026-8912', id: 'b_sample_1' };
    const sampleUser = users[0] || { name: 'Ouk Seyha', email: 'seyha@pplogistics.com.kh' };

    switch (presetType) {
      case 'deal_won':
        setSimEventType('lead.won');
        setSimCustomMessage('KHB Events CRM: Lead Won (Ouk Seyha - China Business Trip $16,000)');
        setSimPayloadJson(JSON.stringify({
          event: 'lead.won',
          timestamp: new Date().toISOString(),
          source: 'KHB_EVENTS_CRM',
          data: {
            crm_lead_id: `lead_${Date.now()}_ab12`,
            name: 'Ouk Seyha',
            company: 'Phnom Penh Logistics Group',
            email: 'seyha@pplogistics.com.kh',
            phone: '+855 12 888 999',
            event_type: 'China Business Trip',
            deal_value: 16000,
            commission_rate: 0.08,
            status: 'Won',
            assigned_agent: 'Sophea Chamnab',
            booking_reference: 'KHB-TRIP-2026-8912',
            pax_count: 4,
            tour_departure_date: '2026-10-15',
            notes: 'Client requested 4 VIP executive delegation passes with translator support.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }, null, 2));
        break;
      case 'confirm_booking':
        setSimEventType('booking.status_updated');
        setSimCustomMessage(`CRM: Verified & Confirmed Booking ${sampleBooking.bookingCode}`);
        setSimPayloadJson(JSON.stringify({
          bookingCode: sampleBooking.bookingCode,
          bookingId: sampleBooking.id,
          status: 'confirmed',
          customerName: sampleUser.name,
          crmNotes: 'Payment verified via CRM finance webhook. Delegate badge issued.',
          verifiedAt: new Date().toISOString()
        }, null, 2));
        break;
      case 'cancel_booking':
        setSimEventType('booking.cancelled');
        setSimCustomMessage(`CRM: Cancellation Request for ${sampleBooking.bookingCode}`);
        setSimPayloadJson(JSON.stringify({
          bookingCode: sampleBooking.bookingCode,
          bookingId: sampleBooking.id,
          status: 'cancelled',
          reason: 'Client requested itinerary amendment due to bilateral schedule shift.',
          refundProcessed: true,
          cancelledAt: new Date().toISOString()
        }, null, 2));
        break;
      case 'flight_delay':
        setSimEventType('flight.status_changed');
        setSimCustomMessage('CRM Airline Sync: Flight TD-742 Delayed 45m (Gate B24)');
        setSimPayloadJson(JSON.stringify({
          bookingCode: sampleBooking.bookingCode,
          flightStatus: {
            flightNumber: 'TD 742',
            airline: 'TripDesk Global Skyways',
            status: 'Delayed',
            gate: 'B24',
            departureTime: '10:15 AM (Delayed +45m)',
            notes: 'Air traffic flow control at Guangzhou Baiyun International.'
          }
        }, null, 2));
        break;
      case 'vip_upgrade':
        setSimEventType('customer.vip_upgraded');
        setSimCustomMessage(`CRM: ${sampleUser.name} Upgraded to VIP Platinum Tier`);
        setSimPayloadJson(JSON.stringify({
          userId: sampleUser.id,
          name: sampleUser.name,
          email: sampleUser.email,
          vipTag: 'VIP Platinum Delegation Leader',
          benefits: ['Fast-track Canton Fair entry', 'Executive Lounge Access', 'Private Chauffeured Transfer']
        }, null, 2));
        break;
      case 'broadcast':
        setSimEventType('notification.broadcast');
        setSimCustomMessage('CRM Broadcast: Urgent Assembly at Hotel Landmark Lobby');
        setSimPayloadJson(JSON.stringify({
          title: '📢 Delegation Advisory Notice',
          message: 'All Canton Fair Phase 1 delegates: Official briefing begins at 07:45 AM at Hotel Landmark VIP Lounge.',
          type: 'flight',
          priority: 'urgent',
          broadcastId: `BC_${Date.now()}`
        }, null, 2));
        break;
    }
  };

  // Initialize preset on first simulator view
  useEffect(() => {
    if (!simPayloadJson) {
      loadPreset('confirm_booking');
    }
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateNewSecret = () => {
    const newSecret = `khb_sec_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    setCrmConfig(prev => ({ ...prev, crmWebhookSecret: newSecret }));
    addNotification('Webhook Secret Generated', 'Remember to save settings to activate new secret.', 'system');
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    const updatedSettings = {
      ...systemSettings,
      crmConfig: {
        ...crmConfig,
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'connected' as const,
      }
    };
    updateSystemSettings(updatedSettings);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      addNotification('CRM Settings Saved', 'Outbound API & Inbound Webhook parameters updated.', 'system');
    }, 600);
  };

  const handleRunConnectionTest = async () => {
    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await testCrmConnection(crmConfig);
      setConnectionTestResult({
        success: res.success,
        latencyMs: res.latencyMs,
        statusCode: (res as any).statusCode || (res.success ? 200 : 500),
        message: res.message,
      });
    } catch (e: any) {
      setConnectionTestResult({
        success: false,
        latencyMs: 50,
        statusCode: 500,
        message: e?.message || 'Handshake failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    setSimResult(null);
    try {
      let parsedPayload: any = {};
      try {
        parsedPayload = JSON.parse(simPayloadJson);
      } catch {
        parsedPayload = { rawText: simPayloadJson };
      }

      const ok = await simulateWebhookTrigger(simEventType, parsedPayload, 'Admin Webhook Simulator', simCustomMessage);
      setSimResult({
        success: ok,
        message: ok ? 'Webhook processed! Portal status & notifications updated live.' : 'Webhook simulation failed.'
      });
    } catch (e: any) {
      setSimResult({ success: false, message: e?.message || 'Simulation error' });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSyncAllBookings = async () => {
    setIsSyncingAllBookings(true);
    try {
      const result = await syncAllBookingsToCrm();
      setBatchSyncResult({ type: 'bookings', total: result.total, success: result.success });
    } finally {
      setIsSyncingAllBookings(false);
    }
  };

  const handleSyncAllCustomers = async () => {
    setIsSyncingAllCustomers(true);
    try {
      const result = await syncAllCustomersToCrm();
      setBatchSyncResult({ type: 'customers', total: result.total, success: result.success });
    } finally {
      setIsSyncingAllCustomers(false);
    }
  };

  const handleSyncAllLeads = async () => {
    setIsSyncingAllLeads(true);
    try {
      const result = await syncAllLeadsProgressToCrm();
      setBatchSyncResult({ type: 'won leads operational flows', total: result.total, success: result.success });
    } finally {
      setIsSyncingAllLeads(false);
    }
  };

  // Filtered logs
  const filteredLogs = crmSyncLogs.filter(log => {
    if (logFilter === 'inbound' && log.direction !== 'inbound') return false;
    if (logFilter === 'outbound' && log.direction !== 'outbound') return false;
    if (logFilter === 'errors' && log.status !== 'failed') return false;
    if (logSearch) {
      const q = logSearch.toLowerCase();
      return (
        log.entityId?.toLowerCase().includes(q) ||
        log.endpoint?.toLowerCase().includes(q) ||
        log.errorMessage?.toLowerCase().includes(q) ||
        log.entityType?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalInbound = crmEvents.length;
  const totalOutbound = crmSyncLogs.filter(l => l.direction === 'outbound').length;
  const successfulCalls = crmSyncLogs.filter(l => l.status === 'success').length;
  const healthRate = crmSyncLogs.length > 0 ? Math.round((successfulCalls / crmSyncLogs.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* ─── Top Stats & Health Banner ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Listener Active
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {totalInbound} Webhooks
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Receiving on /api/webhooks/crm
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Outbound API
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {totalOutbound} Dispatches
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Token-authenticated pipeline
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Sync Health
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {healthRate}% Success
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {successfulCalls} of {crmSyncLogs.length || 1} transactions OK
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Auto-Sync
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {crmConfig.crmAutoSyncBookings ? 'Enabled' : 'Paused'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Auto pushes on booking / status
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inbound_webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'inbound_webhooks'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Webhook className="w-4 h-4" />
          Inbound Webhook Listener
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-white/20 text-white font-mono">
            {crmEvents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outbound_api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'outbound_api'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Outbound API & Push Rules
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'simulator'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Play className="w-4 h-4" />
          Interactive Webhook Simulator
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500 font-bold">
            Live Test
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sync_logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'sync_logs'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Real-Time Sync Audit Logs
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
            {crmSyncLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'docs'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Integration Guide & OpenAPI Specs
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
            OpenAPI 3.0
          </span>
        </button>

        <button
          onClick={() => setAdminActiveTab('inbound_leads')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer ml-auto"
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Won Leads Operations Hub</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white font-mono font-bold animate-pulse">
            {inboundLeads.length}
          </span>
        </button>
      </div>

      {/* ─── TAB 1: Inbound Webhooks ─── */}
      {activeTab === 'inbound_webhooks' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-sky-500" />
                  Live Webhook Receiver Endpoint
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  External CRMs (HubSpot, Salesforce, Zoho, Custom ERP) can send HTTP POST payloads to update bookings, flight statuses, and delegate tiers in real time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshWebhookEvents}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Stream
                </button>
              </div>
            </div>

            {/* Webhook URL Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Inbound Webhook URL (POST)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 select-all overflow-x-auto">
                  {webhookUrl}
                </div>
                <button
                  onClick={() => handleCopy(webhookUrl, 'webhook_url')}
                  className="flex items-center gap-1.5 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition"
                >
                  {copiedField === 'webhook_url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedField === 'webhook_url' ? 'Copied' : 'Copy URL'}
                </button>
              </div>
            </div>

            {/* Webhook Secret Key */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Webhook Secret / Verification Token</span>
                  <button
                    onClick={handleGenerateNewSecret}
                    className="text-sky-500 hover:text-sky-600 text-[11px] font-bold lowercase hover:underline"
                  >
                    Generate New Secret
                  </button>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={crmConfig.crmWebhookSecret || ''}
                      onChange={e => setCrmConfig(prev => ({ ...prev, crmWebhookSecret: e.target.value }))}
                      className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleCopy(crmConfig.crmWebhookSecret, 'webhook_secret')}
                    className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Copy Secret"
                  >
                    {copiedField === 'webhook_secret' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Send in header: <code className="font-mono text-sky-500">x-crm-token</code> or <code className="font-mono text-sky-500">Authorization: Bearer &lt;secret&gt;</code>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Supported Real-Time Event Types
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'booking.status_updated', desc: 'Auto updates booking status' },
                    { label: 'flight.status_changed', desc: 'Updates flight & gate' },
                    { label: 'customer.vip_upgraded', desc: 'Grants VIP tier' },
                    { label: 'booking.cancelled', desc: 'Processes refund & cancellation' },
                    { label: 'notification.broadcast', desc: 'Broadcasts urgent alerts' },
                  ].map(item => (
                    <span
                      key={item.label}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium"
                      title={item.desc}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Events Stream Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Live Inbound Activity Stream ({crmEvents.length})
              </h3>
              <button
                onClick={() => setActiveTab('simulator')}
                className="text-xs font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1"
              >
                Launch Simulator <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {crmEvents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Webhook className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Webhook Events Received Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Send a POST request to the webhook URL above or use the interactive simulator to test real-time triggers.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Event Type</th>
                      <th className="pb-3">Source</th>
                      <th className="pb-3">Affected Target</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {crmEvents.map(evt => (
                      <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-mono text-slate-500">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3">
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                            {evt.eventType}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                          {evt.source}
                        </td>
                        <td className="py-3">
                          {evt.affectedEntityId ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                              {evt.affectedEntityId}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Processed
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setInspectedItem(evt)}
                            className="px-2 py-1 text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 dark:bg-sky-950/40 rounded hover:bg-sky-100 transition"
                          >
                            Inspect Payload
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: Outbound API Integration ─── */}
      {activeTab === 'outbound_api' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-sky-500" />
                  Secure Outbound CRM Connection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure token-based authentication to push new bookings, status changes, and trade delegates to external CRM platforms.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunConnectionTest}
                  disabled={testingConnection}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                  Test Connection & Ping
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <Check className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {saveSuccess ? 'Saved!' : 'Save Parameters'}
                </button>
              </div>
            </div>

            {/* Test result alert */}
            {connectionTestResult && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center justify-between ${
                  connectionTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {connectionTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  <div>
                    <span className="font-bold">{connectionTestResult.message}</span>
                    <span className="ml-2 font-mono">
                      (Status {connectionTestResult.statusCode} • {connectionTestResult.latencyMs}ms roundtrip)
                    </span>
                  </div>
                </div>
                <button onClick={() => setConnectionTestResult(null)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  External CRM Endpoint URL
                </label>
                <input
                  type="url"
                  value={crmConfig.crmEndpointUrl || ''}
                  onChange={e => setCrmConfig(prev => ({ ...prev, crmEndpointUrl: e.target.value }))}
                  placeholder="https://khbcrm.vercel.app/api/webhooks/inbound"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Quick Endpoints:</span>
                  <button
                    type="button"
                    onClick={() => setCrmConfig(prev => ({ ...prev, crmEndpointUrl: 'https://khbcrm.vercel.app/api/webhooks/inbound' }))}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:bg-emerald-100 transition"
                  >
                    ⚡ crm-khbevents-com.vercel.app (Live Vercel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrmConfig(prev => ({ ...prev, crmEndpointUrl: 'https://khbcrm.vercel.app/api/webhooks/inbound' }))}
                    className="text-[10px] px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-mono font-bold hover:bg-sky-100 transition"
                  >
                    crm.khbevents.com (Custom Domain)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrmConfig(prev => ({ ...prev, crmEndpointUrl: 'http://localhost:3001/api/webhooks/inbound' }))}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono hover:bg-slate-200 transition"
                  >
                    localhost:3001
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Target REST webhook endpoint accepting delegation and booking JSON objects.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Authentication Scheme
                </label>
                <select
                  value={crmConfig.crmAuthType || 'bearer'}
                  onChange={e => setCrmConfig(prev => ({ ...prev, crmAuthType: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="bearer">Bearer Token (Authorization: Bearer &lt;token&gt;)</option>
                  <option value="api_key">API Key Header (X-API-Key: &lt;key&gt;)</option>
                  <option value="custom_header">Custom Header Name</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  API Token / Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showApiToken ? 'text' : 'password'}
                    value={crmConfig.crmApiToken || ''}
                    onChange={e => setCrmConfig(prev => ({ ...prev, crmApiToken: e.target.value }))}
                    placeholder="khb_crm_live_tok_..."
                    className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiToken(!showApiToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Organization / Tenant ID (Optional)
                </label>
                <input
                  type="text"
                  value={crmConfig.crmOrganizationId || ''}
                  onChange={e => setCrmConfig(prev => ({ ...prev, crmOrganizationId: e.target.value }))}
                  placeholder="KHB-DELEGATION-HQ"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            {/* Auto-Sync Rules */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Automated Push Triggers & Rules
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!crmConfig.crmAutoSyncBookings}
                    onChange={e => setCrmConfig(prev => ({ ...prev, crmAutoSyncBookings: e.target.checked }))}
                    className="mt-0.5 rounded text-sky-500 focus:ring-sky-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Auto-Push New Bookings & Status Updates
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Automatically dispatches payload to CRM whenever a customer books a trip or an admin amends dates/flight details.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!crmConfig.crmAutoSyncCustomers}
                    onChange={e => setCrmConfig(prev => ({ ...prev, crmAutoSyncCustomers: e.target.checked }))}
                    className="mt-0.5 rounded text-sky-500 focus:ring-sky-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Auto-Push Trade Delegate Profiles
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Transmits new customer lead records into CRM pipeline upon registration or company affiliation update.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Batch Sync Operations Center */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Batch Synchronization Center
              </h4>

              {batchSyncResult && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                  <span>
                    Batch Sync Completed: {batchSyncResult.success} of {batchSyncResult.total} {batchSyncResult.type} synchronized with external CRM.
                  </span>
                  <button onClick={() => setBatchSyncResult(null)} className="text-indigo-400 hover:text-indigo-600">
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSyncAllLeads}
                  disabled={isSyncingAllLeads || inboundLeads.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 transition disabled:opacity-50 cursor-pointer"
                  title="Broadcast live fulfillment progress for all active won leads to external CRM"
                >
                  {isSyncingAllLeads ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4 text-sky-200" />}
                  Sync All Won Leads Progress ({inboundLeads.length})
                </button>

                <button
                  onClick={handleSyncAllBookings}
                  disabled={isSyncingAllBookings}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {isSyncingAllBookings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4 text-sky-400" />}
                  Sync All Active Bookings ({bookings.length})
                </button>

                <button
                  onClick={handleSyncAllCustomers}
                  disabled={isSyncingAllCustomers}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {isSyncingAllCustomers ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4 text-emerald-400" />}
                  Sync All Delegate Profiles ({users.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Webhook Simulator ─── */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-amber-500" />
                  Interactive CRM Webhook Simulator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Test and observe how the KHB BizTrip portal handles real-time CRM updates without needing external tools.
                </p>
              </div>
            </div>

            {/* Quick Action Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Test Scenario Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset('deal_won')}
                  className="p-3 text-left rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 hover:border-emerald-500 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition text-xs space-y-1"
                >
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">🤝 CRM Lead Won</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Ouk Seyha ($16k China Trip)</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadPreset('confirm_booking')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">✅ Confirm Booking</div>
                  <div className="text-[11px] text-slate-500">Marks TRP status confirmed</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadPreset('cancel_booking')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">❌ Cancel & Refund</div>
                  <div className="text-[11px] text-slate-500">Cancels booking via CRM</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadPreset('flight_delay')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">✈️ Flight Alert</div>
                  <div className="text-[11px] text-slate-500">Gate update & flight delay</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadPreset('vip_upgrade')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">👑 VIP Tier Upgrade</div>
                  <div className="text-[11px] text-slate-500">Sets Platinum badge</div>
                </button>

                <button
                  type="button"
                  onClick={() => loadPreset('broadcast')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white">📢 Urgent Broadcast</div>
                  <div className="text-[11px] text-slate-500">Fires push notification</div>
                </button>
              </div>
            </div>

            {/* Simulator Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Event Type
                </label>
                <select
                  value={simEventType || 'booking.status_updated'}
                  onChange={e => setSimEventType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="lead.won">lead.won (KHB Events CRM Lead Won & Provision)</option>
                  <option value="deal.won">deal.won (Deal Closed Won & Provision Booking)</option>
                  <option value="trip.booking_confirmed">trip.booking_confirmed (Trip Portal Booking Confirmed)</option>
                  <option value="trip.payment_confirmed">trip.payment_confirmed (Deposit / Full Payment Received)</option>
                  <option value="booking.status_updated">booking.status_updated</option>
                  <option value="booking.cancelled">booking.cancelled</option>
                  <option value="flight.status_changed">flight.status_changed</option>
                  <option value="customer.vip_upgraded">customer.vip_upgraded</option>
                  <option value="notification.broadcast">notification.broadcast</option>
                  <option value="custom.event">custom.event</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Custom Event Label / Reason
                </label>
                <input
                  type="text"
                  value={simCustomMessage || ''}
                  onChange={e => setSimCustomMessage(e.target.value)}
                  placeholder="CRM Trade Mission Sync Notice"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* JSON Payload Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Webhook JSON Payload</span>
                <span className="text-[11px] text-slate-400 font-normal">Editable JSON object</span>
              </label>
              <textarea
                value={simPayloadJson || ''}
                onChange={e => setSimPayloadJson(e.target.value)}
                rows={8}
                className="w-full p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {simResult && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  simResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                {simResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-rose-500" />}
                <span className="font-bold">{simResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isSimulating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Dispatch Simulated Webhook Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Real-Time Sync Logs ─── */}
      {activeTab === 'sync_logs' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-md font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  API & Webhook Audit Log Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete audit log of all inbound webhook events and outbound CRM API transmissions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch || ''}
                    onChange={e => setLogSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={logFilter || 'all'}
                  onChange={e => setLogFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Traffic</option>
                  <option value="inbound">Inbound Webhooks</option>
                  <option value="outbound">Outbound Dispatches</option>
                  <option value="errors">Errors Only</option>
                </select>
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Layers className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No logs matching criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Direction</th>
                      <th className="pb-3">Entity</th>
                      <th className="pb-3">Target Endpoint</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Latency</th>
                      <th className="pb-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 font-mono text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3">
                          {log.direction === 'inbound' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
                              <ArrowDownLeft className="w-3 h-3" /> INBOUND
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-mono font-bold text-[11px]">
                              <ArrowUpRight className="w-3 h-3" /> OUTBOUND
                            </span>
                          )}
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {log.entityId || log.entityType}
                        </td>
                        <td className="py-3 text-slate-500 font-mono text-[11px] max-w-[200px] truncate">
                          {log.endpoint}
                        </td>
                        <td className="py-3">
                          {log.status === 'success' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              HTTP {log.statusCode} OK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                              HTTP {log.statusCode} ERR
                            </span>
                          )}
                        </td>
                        <td className="py-3 font-mono text-slate-400">
                          {log.durationMs}ms
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setInspectedItem(log)}
                            className="px-2.5 py-1 text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 dark:bg-sky-950/40 rounded hover:bg-sky-100 transition"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 5: Integration Guide & OpenAPI Documentation Hub ─── */}
      {activeTab === 'docs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Docs Top Hero Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    OpenAPI 3.0 & REST Webhooks
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    v2.4.0 Live Engine
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-sky-400" />
                  CRM Cooperation & Integration Documentation Portal
                </h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Everything an external CRM system (HubSpot, Salesforce, Zoho, or Custom ERP) needs to connect, provision expedition bookings, sync delegate manifests, and receive real-time operational fulfillment milestones.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDocsSubTab('ai_prompt')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  title="Copy ready-to-use prompt for CRM AI assistants and engineers"
                >
                  <Sparkles className="w-4 h-4" />
                  AI & Developer Prompt
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCapabilityManifest}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  title="Download machine-readable system capability manifest JSON"
                >
                  <Download className="w-4 h-4" />
                  Capability Manifest JSON
                </button>

                <button
                  type="button"
                  onClick={handleDownloadOpenApiJson}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition cursor-pointer"
                  title="Download machine-readable OpenAPI 3.0 JSON specification"
                >
                  <Download className="w-4 h-4" />
                  OpenAPI JSON
                </button>

                <button
                  type="button"
                  onClick={handleDownloadMarkdownGuide}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Download full Markdown integration specification"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Markdown Guide
                </button>
              </div>
            </div>

            {/* Quick Live Spec Link Box */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-mono text-[11px] text-slate-400">OpenAPI Endpoint:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-mono text-[11px] border border-slate-800">
                    {originUrl}/api/crm/openapi.json
                  </code>
                </div>
                <div className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-[11px] text-slate-400">Capability Manifest:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-mono text-[11px] border border-slate-800">
                    {originUrl}/api/crm/capabilities
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(`${originUrl}/api/crm/capabilities`, 'manifest_endpoint')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'manifest_endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'manifest_endpoint' ? 'Copied' : 'Copy Manifest URL'}
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => handleCopy(`${originUrl}/api/crm/openapi.json`, 'openapi_endpoint')}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'openapi_endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'openapi_endpoint' ? 'Copied' : 'Copy OpenAPI URL'}
                </button>
              </div>
            </div>
          </div>

          {/* Docs Sub-Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setDocsSubTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                docsSubTab === 'overview'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              1. System Capabilities & Role
            </button>

            <button
              onClick={() => setDocsSubTab('ai_prompt')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                docsSubTab === 'ai_prompt'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              2. CRM AI & Developer Prompt
            </button>

            <button
              onClick={() => setDocsSubTab('events')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                docsSubTab === 'events'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Webhook className="w-3.5 h-3.5" />
              3. Webhook & Event Catalog ({CRM_EVENTS_REGISTRY.length})
            </button>

            <button
              onClick={() => setDocsSubTab('code')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                docsSubTab === 'code'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              4. Code Generator (6 Languages)
            </button>

            <button
              onClick={() => setDocsSubTab('mappings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                docsSubTab === 'mappings'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              5. Field Mapping Dictionary ({CRM_FIELD_MAPPINGS.length})
            </button>

            <button
              onClick={() => setDocsSubTab('workflow')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                docsSubTab === 'workflow'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              6. 2-Way Handover Protocol
            </button>

            <button
              onClick={() => setDocsSubTab('openapi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                docsSubTab === 'openapi'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              7. Raw OpenAPI 3.0 Schema
            </button>
          </div>

          {/* SUB-DOC 1: SYSTEM OVERVIEW & CAPABILITY PILLARS */}
          {docsSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-500" />
                    KHB BizTrip System Capabilities & CRM Interoperability
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    KHB BizTrip is the specialized trade mission operations ERP backend. Review the core capability pillars below to see exactly what this system has and how your CRM can cooperate with each capability.
                  </p>
                </div>

                {/* Capability Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CRM_CAPABILITY_PILLARS.map(pillar => (
                    <div
                      key={pillar.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            {pillar.badge}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {pillar.id}</span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {pillar.title}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          CRM Cooperation:
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          {pillar.crmInteroperability}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {pillar.keyEntities.map(k => (
                            <span key={k} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 4 Practical Cooperation Scenarios */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-indigo-500" />
                      4 Primary Cooperation Interaction Scenarios
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Clear interaction flows showing how external CRMs and KHB BizTrip exchange data end-to-end.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {CRM_COOPERATION_SCENARIOS.map(scenario => (
                      <div
                        key={scenario.scenarioId}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                            {scenario.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {scenario.direction}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {scenario.summary}
                        </p>
                        <div className="space-y-1.5 pt-2">
                          {scenario.steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                              <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentication & Security Protocol */}
                <div className="p-5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                  <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Authentication & Security Standards
                  </h5>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    All webhook endpoints accept incoming requests secured with token verification. Include your webhook secret via one of the following methods:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <span className="text-slate-400">Header Option A (Recommended):</span>
                      <div className="mt-1 text-sky-600 dark:text-sky-400 font-bold">x-crm-token: &lt;your_secret&gt;</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <span className="text-slate-400">Header Option B (Standard Bearer):</span>
                      <div className="mt-1 text-sky-600 dark:text-sky-400 font-bold">Authorization: Bearer &lt;your_secret&gt;</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-DOC: AI PROMPT FOR CRM DEVELOPER */}
          {docsSubTab === 'ai_prompt' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Self-Service AI & Developer Onboarding Prompt
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Give this exact prompt to your CRM developer or paste it into ChatGPT / Claude / Gemini to build the integration automatically with zero manual explanation required.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(generateCrmAiPrompt(originUrl), 'ai_prompt_text')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                  >
                    {copiedField === 'ai_prompt_text' ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                    {copiedField === 'ai_prompt_text' ? 'Copied Prompt!' : 'Copy Complete AI Prompt'}
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-mono text-emerald-400 font-bold">KHB-BizTrip-CRM-Integration-Prompt.txt</span>
                    <span>Ready for AI Agents, Zapier, Make & Developers</span>
                  </div>
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                    {generateCrmAiPrompt(originUrl)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* SUB-DOC 2: WEBHOOK & EVENT CATALOG */}
          {docsSubTab === 'events' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event Selector List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Select Event Schema to Inspect
                  </label>
                  <div className="space-y-1.5">
                    {CRM_EVENTS_REGISTRY.map((evt, idx) => (
                      <button
                        key={evt.eventType}
                        type="button"
                        onClick={() => setSelectedDocEventIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                          selectedDocEventIndex === idx
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-700 font-bold text-sky-900 dark:text-sky-200 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs truncate">{evt.eventType}</span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              evt.direction === 'inbound'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                            }`}
                          >
                            {evt.direction}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {evt.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Details & Schemas */}
                {CRM_EVENTS_REGISTRY[selectedDocEventIndex] && (
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                          {CRM_EVENTS_REGISTRY[selectedDocEventIndex].httpMethod} {CRM_EVENTS_REGISTRY[selectedDocEventIndex].endpoint}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Trigger: <strong>{CRM_EVENTS_REGISTRY[selectedDocEventIndex].trigger}</strong>
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
                        {CRM_EVENTS_REGISTRY[selectedDocEventIndex].eventType}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {CRM_EVENTS_REGISTRY[selectedDocEventIndex].description}
                      </p>
                    </div>

                    {/* Request Payload Sample */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">HTTP Request JSON Payload:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(JSON.stringify(CRM_EVENTS_REGISTRY[selectedDocEventIndex].payloadSample, null, 2), 'doc_req_payload')}
                          className="text-sky-500 hover:text-sky-600 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedField === 'doc_req_payload' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedField === 'doc_req_payload' ? 'Copied' : 'Copy JSON'}
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[260px]">
                        {JSON.stringify(CRM_EVENTS_REGISTRY[selectedDocEventIndex].payloadSample, null, 2)}
                      </pre>
                    </div>

                    {/* Response Sample */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Expected HTTP Response (200 OK):</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(JSON.stringify(CRM_EVENTS_REGISTRY[selectedDocEventIndex].responseSample, null, 2), 'doc_res_payload')}
                          className="text-sky-500 hover:text-sky-600 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedField === 'doc_res_payload' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedField === 'doc_res_payload' ? 'Copied' : 'Copy Response'}
                        </button>
                      </div>
                      <pre className="p-3.5 rounded-xl bg-slate-950 text-sky-400 font-mono text-xs overflow-x-auto max-h-[160px]">
                        {JSON.stringify(CRM_EVENTS_REGISTRY[selectedDocEventIndex].responseSample, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-DOC 3: INTERACTIVE CODE GENERATOR */}
          {docsSubTab === 'code' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-500" />
                      Live Multi-Language Webhook Code Snippets
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Ready-to-use client code with pre-filled headers and payload structure.
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectedCodeLang('curl')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCodeLang === 'curl' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      cURL (CLI)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCodeLang('ts')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCodeLang === 'ts' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Node.js / TS
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCodeLang('python')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCodeLang === 'python' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Python
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCodeLang('go')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCodeLang === 'go' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Go (Golang)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCodeLang('php')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCodeLang === 'php' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      PHP
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCodeLang('zapier')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCodeLang === 'zapier' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Zapier / n8n / Make
                    </button>
                  </div>
                </div>

                {/* Target Event Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Event to Generate:
                  </div>
                  <select
                    value={selectedDocEventIndex}
                    onChange={e => setSelectedDocEventIndex(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {CRM_EVENTS_REGISTRY.map((evt, idx) => (
                      <option key={evt.eventType} value={idx}>
                        {evt.eventType} ({evt.description.slice(0, 40)}...)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Code Block Preview */}
                {(() => {
                  const currentDoc = CRM_EVENTS_REGISTRY[selectedDocEventIndex] || CRM_EVENTS_REGISTRY[0];
                  let snippet = '';
                  if (selectedCodeLang === 'curl') {
                    snippet = generateCurlSnippet(originUrl, currentDoc, crmConfig.crmWebhookSecret);
                  } else if (selectedCodeLang === 'ts') {
                    snippet = generateTypeScriptSnippet(originUrl, currentDoc, crmConfig.crmWebhookSecret);
                  } else if (selectedCodeLang === 'python') {
                    snippet = generatePythonSnippet(originUrl, currentDoc, crmConfig.crmWebhookSecret);
                  } else if (selectedCodeLang === 'go') {
                    snippet = generateGoSnippet(originUrl, currentDoc, crmConfig.crmWebhookSecret);
                  } else if (selectedCodeLang === 'php') {
                    snippet = generatePhpSnippet(originUrl, currentDoc, crmConfig.crmWebhookSecret);
                  } else if (selectedCodeLang === 'zapier') {
                    snippet = generateZapierWebhookGuide(originUrl, currentDoc, crmConfig.crmWebhookSecret);
                  }

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          Target: {originUrl}{currentDoc.endpoint}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(snippet, 'code_snippet')}
                          className="flex items-center gap-1 px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold text-xs shadow-sm transition"
                        >
                          {copiedField === 'code_snippet' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedField === 'code_snippet' ? 'Code Copied!' : 'Copy Code Snippet'}
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed">
                        {snippet}
                      </pre>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* SUB-DOC 4: FIELD MAPPING DICTIONARY */}
          {docsSubTab === 'mappings' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-sky-500" />
                      CRM Data Dictionary & Field Mapping Specifications
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Clear field-by-field translation mapping external CRM lead/deal attributes to KHB BizTrip data entities.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">CRM Field Key</th>
                        <th className="px-3 py-3 border-b border-slate-200 dark:border-slate-800">Type</th>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">KHB BizTrip Field</th>
                        <th className="px-3 py-3 border-b border-slate-200 dark:border-slate-800">Required?</th>
                        <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Description & Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {CRM_FIELD_MAPPINGS.map(field => (
                        <tr key={field.crmField} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                            {field.crmField}
                          </td>
                          <td className="px-3 py-3 font-mono text-[11px] text-slate-500">
                            {field.crmType}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {field.bizTripField}
                          </td>
                          <td className="px-3 py-3">
                            {field.required ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                Required
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            <p>{field.description}</p>
                            <div className="mt-1 font-mono text-[10px] text-slate-400">
                              Example: {typeof field.exampleValue === 'object' ? JSON.stringify(field.exampleValue) : String(field.exampleValue)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-DOC 5: 2-WAY HANDOVER PROTOCOL & STAGES */}
          {docsSubTab === 'workflow' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-sky-500" />
                    8-Stage Expedition Fulfillment & Handover Lifecycle
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upon deal won ingestion, KHB BizTrip coordinates these 8 operational stages and transmits milestone updates back into your CRM deal record.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {OPERATIONAL_STAGES_DOC.map(stage => (
                    <div
                      key={stage.stage}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{stage.title}</span>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {stage.progress}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-DOC 6: RAW OPENAPI 3.0 SCHEMA VIEWER */}
          {docsSubTab === 'openapi' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                      <FileCode className="w-4 h-4 text-sky-500" />
                      OpenAPI 3.0.3 Specification Document
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Compliant with OpenAPI Specification 3.0.3. Compatible with Swagger UI, Postman, Zapier, and n8n.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(generateOpenApiSpec(originUrl), null, 2), 'raw_openapi')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition"
                    >
                      {copiedField === 'raw_openapi' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === 'raw_openapi' ? 'Copied' : 'Copy JSON'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadOpenApiJson}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .json
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed">
                  {JSON.stringify(generateOpenApiSpec(originUrl), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Inspect Modal ─── */}
      {inspectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-md font-black text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                <FileJson className="w-5 h-5 text-sky-500" />
                Inspect Payload Snapshot
              </h3>
              <button
                onClick={() => setInspectedItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl overflow-x-auto max-h-[400px]">
              <pre className="text-xs font-mono text-emerald-400">
                {JSON.stringify(inspectedItem, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleCopy(JSON.stringify(inspectedItem, null, 2), 'inspected_json')}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                {copiedField === 'inspected_json' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedField === 'inspected_json' ? 'Copied to Clipboard' : 'Copy JSON'}
              </button>

              <button
                onClick={() => setInspectedItem(null)}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
