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
  Briefcase
} from 'lucide-react';
import { CrmConfig, CrmWebhookEventType, CrmWebhookEvent, CrmSyncLog } from '../../types';

export const CrmIntegrationSection: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    bookings,
    users,
    crmEvents,
    crmSyncLogs,
    pushBookingToCrm,
    pushCustomerToCrm,
    syncAllBookingsToCrm,
    syncAllCustomersToCrm,
    testCrmConnection,
    simulateWebhookTrigger,
    refreshWebhookEvents,
    addNotification,
    t
  } = useApp();

  type TabType = 'inbound_webhooks' | 'outbound_api' | 'sync_logs' | 'simulator';
  const [activeTab, setActiveTab] = useState<TabType>('inbound_webhooks');

  // Form configuration state
  const [crmConfig, setCrmConfig] = useState<CrmConfig>(
    systemSettings.crmConfig || {
      crmEndpointUrl: 'https://api.crm.khbevents.com/v1/trade-delegations',
      crmApiToken: 'khb_crm_live_tok_9948271049281746',
      crmAuthType: 'bearer',
      crmHeaderKey: 'Authorization',
      crmWebhookSecret: 'khb_crm_secret_2026',
      crmAutoSyncBookings: true,
      crmAutoSyncCustomers: true,
      crmOrganizationId: 'KHB-DELEGATION-HQ',
      lastSyncAt: new Date().toISOString(),
      syncStatus: 'connected',
    }
  );

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
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/crm-leads`
    : 'https://trip.khbevents.com/api/webhooks/crm-leads';

  // Synchronize form if systemSettings changes externally
  useEffect(() => {
    if (systemSettings.crmConfig) {
      setCrmConfig(systemSettings.crmConfig);
    }
  }, [systemSettings.crmConfig]);

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
                      value={crmConfig.crmWebhookSecret}
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
                  value={crmConfig.crmEndpointUrl}
                  onChange={e => setCrmConfig(prev => ({ ...prev, crmEndpointUrl: e.target.value }))}
                  placeholder="https://api.crm.example.com/v1/trade-delegations"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Target REST webhook/endpoint accepting delegation and booking JSON objects.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Authentication Scheme
                </label>
                <select
                  value={crmConfig.crmAuthType}
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
                    value={crmConfig.crmApiToken}
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
                    checked={crmConfig.crmAutoSyncBookings}
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
                    checked={crmConfig.crmAutoSyncCustomers}
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
                  value={simEventType}
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
                  value={simCustomMessage}
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
                value={simPayloadJson}
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
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={logFilter}
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
