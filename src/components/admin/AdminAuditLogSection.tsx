import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
  Trash2,
  Terminal,
  Code,
  Zap,
  Shield,
  Server,
  Eye,
  SlidersHorizontal,
  X,
  Play,
  Globe,
  Database,
  Layers,
  Info,
} from 'lucide-react';
import { IntegrationAuditLog } from '../../types';
import {
  fetchServerIntegrationAuditLogs,
  simulateServerAuditLog,
  clearServerIntegrationAuditLogs,
} from '../../services/crmIntegrationService';
import { useApp } from '../../context/AppContext';

export const AdminAuditLogSection: React.FC = () => {
  const { language } = useApp();

  const [logs, setLogs] = useState<IntegrationAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [latencyFilter, setLatencyFilter] = useState<'all' | 'fast' | 'moderate' | 'slow'>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');

  // Selected Log for Deep Dive Drawer
  const [selectedLog, setSelectedLog] = useState<IntegrationAuditLog | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'request' | 'response' | 'curl'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Simulation state
  const [simulating, setSimulating] = useState<boolean>(false);
  const [showSimulateMenu, setShowSimulateMenu] = useState<boolean>(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState<boolean>(false);

  // Load audit logs
  const loadLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetchServerIntegrationAuditLogs({
        direction: directionFilter,
        status: statusFilter,
        search: searchQuery,
        limit: 200,
      });
      setLogs(res.logs || []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [directionFilter, statusFilter, searchQuery]);

  // Initial fetch
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Auto-refresh interval (every 6 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      loadLogs(true);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoRefresh, loadLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Direction
      if (directionFilter !== 'all' && log.direction !== directionFilter) return false;

      // Status
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;

      // Entity type
      if (entityTypeFilter !== 'all' && log.entityType !== entityTypeFilter) return false;

      // Latency filter
      if (latencyFilter === 'fast' && log.durationMs >= 100) return false;
      if (latencyFilter === 'moderate' && (log.durationMs < 100 || log.durationMs > 500)) return false;
      if (latencyFilter === 'slow' && log.durationMs <= 500) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchEndpoint = log.endpoint?.toLowerCase().includes(q);
        const matchEntityId = log.entityId?.toLowerCase().includes(q);
        const matchEventType = log.eventType?.toLowerCase().includes(q);
        const matchSource = log.source?.toLowerCase().includes(q);
        const matchError = log.errorMessage?.toLowerCase().includes(q);
        const matchStatus = String(log.statusCode).includes(q);
        const matchReqPayload = JSON.stringify(log.requestPayload || '').toLowerCase().includes(q);
        const matchRespPayload = JSON.stringify(log.responsePayload || '').toLowerCase().includes(q);

        if (
          !matchEndpoint &&
          !matchEntityId &&
          !matchEventType &&
          !matchSource &&
          !matchError &&
          !matchStatus &&
          !matchReqPayload &&
          !matchRespPayload
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logs, directionFilter, statusFilter, entityTypeFilter, latencyFilter, searchQuery]);

  // Key KPI stats
  const metrics = useMemo(() => {
    const total = logs.length;
    const inbound = logs.filter((l) => l.direction === 'inbound');
    const outbound = logs.filter((l) => l.direction === 'outbound');
    const failed = logs.filter((l) => l.status === 'failed' || l.statusCode >= 400);

    const inboundSuccess = inbound.filter((l) => l.status === 'success' && l.statusCode < 400).length;
    const inboundRate = inbound.length > 0 ? Math.round((inboundSuccess / inbound.length) * 100) : 100;

    const avgLatency =
      outbound.length > 0
        ? Math.round(outbound.reduce((acc, l) => acc + (l.durationMs || 0), 0) / outbound.length)
        : 0;

    return {
      total,
      inboundCount: inbound.length,
      inboundRate,
      outboundCount: outbound.length,
      avgLatency,
      failedCount: failed.length,
    };
  }, [logs]);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate cURL command for a log
  const generateCurlCommand = (log: IntegrationAuditLog): string => {
    const method = log.method || (log.direction === 'inbound' ? 'POST' : 'POST');
    const endpoint = log.endpoint.startsWith('http') ? log.endpoint : `http://localhost:3000${log.endpoint}`;
    let curl = `curl -X ${method} "${endpoint}" \\\n`;
    curl += `  -H "Content-Type: application/json" \\\n`;
    if (log.source) {
      curl += `  -H "X-Source: ${log.source}" \\\n`;
    }
    if (log.requestPayload && Object.keys(log.requestPayload).length > 0) {
      curl += `  -d '${JSON.stringify(log.requestPayload, null, 2)}'`;
    }
    return curl;
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `khb_integration_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Direction', 'Method', 'Endpoint', 'Entity_Type', 'Entity_ID', 'Status_Code', 'Status', 'Duration_MS', 'Source', 'Error'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.direction}"`,
      `"${l.method || 'POST'}"`,
      `"${l.endpoint}"`,
      `"${l.entityType || ''}"`,
      `"${l.entityId || ''}"`,
      l.statusCode,
      `"${l.status}"`,
      l.durationMs,
      `"${l.source || ''}"`,
      `"${(l.errorMessage || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khb_integration_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Clear logs handler
  const handleClearLogs = async () => {
    await clearServerIntegrationAuditLogs();
    setLogs([]);
    setSelectedLog(null);
    setClearConfirmOpen(false);
  };

  // Simulation trigger helper
  const handleTriggerSimulation = async (type: 'inbound_lead' | 'inbound_status' | 'outbound_booking' | 'auth_fail') => {
    setSimulating(true);
    setShowSimulateMenu(false);
    try {
      if (type === 'inbound_lead') {
        await simulateServerAuditLog({
          direction: 'inbound',
          endpoint: '/api/webhooks/crm-leads',
          method: 'POST',
          entityType: 'lead',
          source: 'HubSpot Enterprise Webhook',
          eventType: 'lead.won',
          statusCode: 200,
          status: 'success',
          durationMs: Math.floor(20 + Math.random() * 25),
          requestPayload: {
            event: 'lead.won',
            booking_reference: `KHB-TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            client_name: 'Leng Sreymom',
            client_company: 'Cambodia Agri-Tech Export Group',
            deal_value: 6800,
            pax_count: 2,
            destination: 'Guangzhou Canton Fair',
          },
          responsePayload: {
            success: true,
            status: 'processed',
            message: 'Trip booking registered successfully in operational pipeline',
          },
        });
      } else if (type === 'inbound_status') {
        await simulateServerAuditLog({
          direction: 'inbound',
          endpoint: '/api/webhooks/crm',
          method: 'POST',
          entityType: 'booking',
          entityId: 'TRP-84920',
          source: 'Salesforce KHB Gateway',
          eventType: 'booking.status_updated',
          statusCode: 200,
          status: 'success',
          durationMs: Math.floor(18 + Math.random() * 20),
          requestPayload: {
            event: 'booking.status_updated',
            bookingCode: 'TRP-84920',
            status: 'confirmed',
            notes: 'Visa & delegation hotel block confirmed via Guangzhou chamber.',
          },
          responsePayload: {
            success: true,
            message: 'Booking TRP-84920 verified & confirmed via CRM webhook.',
          },
        });
      } else if (type === 'outbound_booking') {
        await simulateServerAuditLog({
          direction: 'outbound',
          endpoint: 'https://khbcrm.vercel.app/api/v1/bookings',
          method: 'POST',
          entityType: 'booking',
          entityId: `TRP-${Math.floor(80000 + Math.random() * 10000)}`,
          source: 'KHB ERP Outbound Gateway',
          statusCode: 200,
          status: 'success',
          durationMs: Math.floor(95 + Math.random() * 60),
          requestPayload: {
            bookingCode: `TRP-${Math.floor(80000 + Math.random() * 10000)}`,
            totalUSD: 5400,
            paxCount: 2,
            customerName: 'Heng Samnang',
            paymentStatus: 'deposit_paid',
          },
          responsePayload: {
            success: true,
            lead_id: `lead_${Date.now()}`,
            message: 'Booking successfully synchronized with KHB Events CRM.',
          },
        });
      } else if (type === 'auth_fail') {
        await simulateServerAuditLog({
          direction: 'inbound',
          endpoint: '/api/webhooks/crm-leads',
          method: 'POST',
          entityType: 'webhook',
          source: 'Unknown External Crawler',
          eventType: 'custom.event',
          statusCode: 401,
          status: 'failed',
          durationMs: 14,
          errorMessage: 'Unauthorized CRM webhook signature or token mismatch.',
          requestPayload: { unauthorized_probe: true, test: 123 },
          responsePayload: {
            success: false,
            error: 'Unauthorized CRM webhook signature or token mismatch.',
          },
        });
      }
      await loadLogs();
    } catch (e) {
      console.warn('Simulation failed:', e);
    } finally {
      setSimulating(false);
    }
  };

  // Helper for latency badge color
  const getLatencyBadge = (durationMs: number) => {
    if (durationMs < 100) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {durationMs}ms
        </span>
      );
    }
    if (durationMs <= 500) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {durationMs}ms
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        {durationMs}ms
      </span>
    );
  };

  // Helper for status badge
  const getStatusBadge = (statusCode: number, status: string) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {statusCode} OK
        </span>
      );
    }
    if (statusCode === 401 || statusCode === 403) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
          <Shield className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          {statusCode} Auth
        </span>
      );
    }
    if (statusCode >= 400 && statusCode < 500) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          {statusCode} Client Err
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
        <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        {statusCode || 500} Server Err
      </span>
    );
  };

  // Diagnostic analysis for the selected log
  const getDiagnosticTip = (log: IntegrationAuditLog) => {
    if (log.statusCode === 401) {
      return {
        type: 'error',
        title: 'Authentication & Signature Mismatch (401)',
        message: 'The incoming webhook signature or Authorization Bearer token did not match the configured secret.',
        action: 'Inspect Settings > CRM Integration and ensure the CRM Webhook Secret matches the signing secret in your CRM webhook portal.',
      };
    }
    if (log.statusCode === 502) {
      return {
        type: 'error',
        title: 'Bad Gateway / Domain Unreachable (502)',
        message: 'The outbound request could not reach the target external CRM server. DNS lookup or TCP handshake timed out.',
        action: 'Verify that the target endpoint URL is online, reachable, and correctly spelled.',
      };
    }
    if (log.statusCode >= 500) {
      return {
        type: 'error',
        title: 'Internal Server Error (500)',
        message: log.errorMessage || 'An unhandled exception occurred during processing.',
        action: 'Review the raw request payload format for invalid types or missing required fields.',
      };
    }
    if (log.durationMs > 600) {
      return {
        type: 'warning',
        title: 'High Latency Advisory',
        message: `Response latency was ${log.durationMs}ms, exceeding the recommended 500ms threshold.`,
        action: 'Consider reviewing target network connectivity or enabling async batching for large payloads.',
      };
    }
    return {
      type: 'success',
      title: 'Healthy Transmission Verified (200 OK)',
      message: 'The transaction completed smoothly with strict payload schema compliance.',
      action: 'No operational action required. Transaction archived.',
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {language === 'km' ? 'កំណត់ហេតុសវនកម្មប្រព័ន្ធ (Audit Log)' : 'Integration & API Audit Log'}
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  Live Traffic
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'km'
                  ? 'តាមដានសំណើ API ចេញ និង CRM Webhooks ចូល តាមលំដាប់ពេលវេលា រួមទាំង latency និង raw payloads សម្រាប់ដោះស្រាយបញ្ហា'
                  : 'Chronological monitor for outbound API requests, inbound CRM webhooks, status codes, latency diagnostics, and raw payloads.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Cluster 1: Live Stream Polling & Manual Refresh */}
          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                autoRefresh
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Toggle live log polling (6 seconds)"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span>{autoRefresh ? 'Live (6s)' : 'Paused'}</span>
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => loadLogs()}
              disabled={refreshing}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 transition-all disabled:opacity-50 cursor-pointer"
              title="Manually refresh audit logs"
              aria-label="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            </button>
          </div>

          {/* Cluster 2: Developer Traffic Simulator */}
          <div className="relative">
            <button
              onClick={() => setShowSimulateMenu(!showSimulateMenu)}
              disabled={simulating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-2xs cursor-pointer"
              title="Simulate incoming webhooks or outbound CRM transmissions"
            >
              <Zap className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${simulating ? 'animate-bounce' : ''}`} />
              <span>{simulating ? 'Simulating...' : 'Simulate Traffic'}</span>
            </button>

            {showSimulateMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowSimulateMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Trigger Test Scenario
                  </div>
                  <button
                    onClick={() => handleTriggerSimulation('inbound_lead')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Inbound Lead Won (HubSpot)</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">200 OK • New delegation delegate lead</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTriggerSimulation('inbound_status')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Inbound Booking Confirmed</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">200 OK • Update status for TRP-84920</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTriggerSimulation('outbound_booking')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Outbound CRM Push Relay</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">200 OK • Push booking to external CRM</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTriggerSimulation('auth_fail')}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-rose-700 dark:text-rose-300">Simulate Signature Mismatch</div>
                      <div className="text-[11px] text-rose-500 dark:text-rose-400">401 Unauthorized • Test alert handling</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Cluster 3: Data Export & Management */}
          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/90 p-1 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
            <span className="pl-2 pr-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Export</span>
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Export filtered logs as JSON"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>JSON</span>
            </button>
            <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Export filtered logs as CSV"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>CSV</span>
            </button>
          </div>

          {/* Clear Logs Button */}
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-rose-200 dark:hover:border-rose-800 transition-colors shadow-2xs cursor-pointer"
            title="Clear all logs"
            aria-label="Clear all logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Events */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Traffic Events
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.total}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">recorded records</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Ring buffer holds up to 300 logs
          </div>
        </div>

        {/* Inbound Webhooks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Inbound CRM Webhooks
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.inboundCount}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {metrics.inboundRate}% Success
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            HubSpot, Salesforce, & Lead Gateways
          </div>
        </div>

        {/* Failures / Security Flags */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Failures / Diagnostics
            </span>
            <div
              className={`p-2 rounded-xl ${
                metrics.failedCount > 0
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                metrics.failedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {metrics.failedCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {metrics.failedCount > 0 ? 'Requires attention' : 'All systems normal'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {metrics.failedCount > 0 ? '4xx/5xx responses flagged' : 'Zero unhandled errors'}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by endpoint, booking code, client name, status code, error, or payload text..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Direction Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setDirectionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                directionFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All Traffic
            </button>
            <button
              onClick={() => setDirectionFilter('inbound')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                directionFilter === 'inbound'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" />
              Inbound Webhooks
            </button>
            <button
              onClick={() => setDirectionFilter('outbound')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                directionFilter === 'outbound'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              Outbound API
            </button>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters:
          </span>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 rounded-md ${
                statusFilter === 'all'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-2 py-0.5 rounded-md ${
                statusFilter === 'success'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Success (2xx)
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-2 py-0.5 rounded-md ${
                statusFilter === 'failed'
                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Errors (4xx / 5xx)
            </button>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Latency Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Latency:</span>
            <button
              onClick={() => setLatencyFilter('all')}
              className={`px-2 py-0.5 rounded-md ${
                latencyFilter === 'all'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLatencyFilter('fast')}
              className={`px-2 py-0.5 rounded-md ${
                latencyFilter === 'fast'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              &lt;100ms
            </button>
            <button
              onClick={() => setLatencyFilter('moderate')}
              className={`px-2 py-0.5 rounded-md ${
                latencyFilter === 'moderate'
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              100-500ms
            </button>
            <button
              onClick={() => setLatencyFilter('slow')}
              className={`px-2 py-0.5 rounded-md ${
                latencyFilter === 'slow'
                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              &gt;500ms
            </button>
          </div>

          {/* Reset button if active filters */}
          {(directionFilter !== 'all' || statusFilter !== 'all' || latencyFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setDirectionFilter('all');
                setStatusFilter('all');
                setLatencyFilter('all');
                setSearchQuery('');
              }}
              className="ml-auto text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Chronological Table of Events */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            Showing {filteredLogs.length} of {logs.length} audit entries
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Chronological Order (Newest First)
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading integration audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Audit Logs Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              No recent inbound webhooks or outbound requests match the current filter criteria.
            </p>
            <button
              onClick={() => handleTriggerSimulation('inbound_lead')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
            >
              Simulate Test Traffic Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Time & Direction</th>
                  <th className="py-3 px-4">Event / Entity</th>
                  <th className="py-3 px-4">Target Endpoint</th>
                  <th className="py-3 px-4">Status & Code</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Payload Summary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const dateObj = new Date(log.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString();
                  const dateFormatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                  // Short preview snippet
                  let previewText = '';
                  if (log.errorMessage) {
                    previewText = `Error: ${log.errorMessage}`;
                  } else if (log.requestPayload) {
                    const keys = Object.keys(log.requestPayload).slice(0, 3);
                    previewText = keys
                      .map((k) => `${k}: ${String(log.requestPayload[k]).slice(0, 20)}`)
                      .join(' • ');
                  }

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      {/* Time & Direction */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              log.direction === 'inbound'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                            }`}
                            title={log.direction === 'inbound' ? 'Inbound Webhook' : 'Outbound API'}
                          >
                            {log.direction === 'inbound' ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {timeFormatted}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {dateFormatted} • {log.direction.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Event / Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white text-xs">
                          {log.eventType || log.entityType?.toUpperCase() || 'HTTP_EVENT'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {log.entityId || log.source || 'Standard Payload'}
                        </div>
                      </td>

                      {/* Target Endpoint */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {log.method || (log.direction === 'inbound' ? 'POST' : 'POST')}
                          </span>
                          <span
                            className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate"
                            title={log.endpoint}
                          >
                            {log.endpoint}
                          </span>
                        </div>
                        {log.source && (
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            Source: {log.source}
                          </div>
                        )}
                      </td>

                      {/* Status & HTTP Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(log.statusCode, log.status)}
                      </td>

                      {/* Latency */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getLatencyBadge(log.durationMs || 0)}
                      </td>

                      {/* Payload Summary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p
                          className={`text-xs truncate ${
                            log.statusCode >= 400
                              ? 'text-rose-600 dark:text-rose-400 font-medium'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                          title={previewText}
                        >
                          {previewText || 'No body content'}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deep-Dive Payload Inspector Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    selectedLog.direction === 'inbound'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                  }`}
                >
                  {selectedLog.direction === 'inbound' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedLog.direction === 'inbound' ? 'Inbound Webhook' : 'Outbound API Request'}
                    </h3>
                    {getStatusBadge(selectedLog.statusCode, selectedLog.status)}
                    {getLatencyBadge(selectedLog.durationMs)}
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedLog.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), 'full_log')}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="Copy full JSON record"
                >
                  {copiedField === 'full_log' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            <div className="px-5 pt-4">
              {(() => {
                const diag = getDiagnosticTip(selectedLog);
                return (
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      diag.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                        : diag.type === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    }`}
                  >
                    {diag.type === 'error' ? (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    ) : diag.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-1">
                      <div className="font-bold">{diag.title}</div>
                      <div>{diag.message}</div>
                      <div className="text-[11px] opacity-85 font-medium pt-0.5">
                        Tip: {diag.action}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveInspectorTab('overview')}
                className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeInspectorTab === 'overview'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Overview & Metadata
              </button>
              <button
                onClick={() => setActiveInspectorTab('request')}
                className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeInspectorTab === 'request'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Raw Request Payload
              </button>
              <button
                onClick={() => setActiveInspectorTab('response')}
                className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeInspectorTab === 'response'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Raw Response Payload
              </button>
              <button
                onClick={() => setActiveInspectorTab('curl')}
                className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeInspectorTab === 'curl'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                cURL Snippet
              </button>
            </div>

            {/* Inspector Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeInspectorTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-slate-400 font-medium">Timestamp</div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 mt-1">
                        {selectedLog.timestamp}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-slate-400 font-medium">Latency / Processing Time</div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 mt-1">
                        {selectedLog.durationMs} milliseconds
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-slate-400 font-medium">HTTP Status Code</div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 mt-1">
                        {selectedLog.statusCode} ({selectedLog.status})
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="text-slate-400 font-medium">Entity Type & Reference</div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 mt-1">
                        {selectedLog.entityType || 'N/A'} • {selectedLog.entityId || 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <div className="text-slate-400 font-medium">Endpoint URL</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                      {selectedLog.endpoint}
                    </div>
                  </div>

                  {selectedLog.source && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                      <div className="text-slate-400 font-medium">Traffic Source / User Agent</div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 select-all">
                        {selectedLog.source}
                      </div>
                    </div>
                  )}

                  {selectedLog.requestHeaders && Object.keys(selectedLog.requestHeaders).length > 0 && (
                    <div className="space-y-2">
                      <div className="font-bold text-slate-700 dark:text-slate-300">Request Headers</div>
                      <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto select-all">
                        {JSON.stringify(selectedLog.requestHeaders, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeInspectorTab === 'request' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Raw Request Body (JSON)
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(JSON.stringify(selectedLog.requestPayload || {}, null, 2), 'req_body')
                      }
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedField === 'req_body' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy JSON
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto select-all border border-slate-800 leading-relaxed max-h-[480px]">
                    {JSON.stringify(selectedLog.requestPayload || {}, null, 2)}
                  </pre>
                </div>
              )}

              {activeInspectorTab === 'response' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Raw Server Response (JSON)
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(JSON.stringify(selectedLog.responsePayload || {}, null, 2), 'resp_body')
                      }
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedField === 'resp_body' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy JSON
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-sky-400 font-mono text-xs overflow-x-auto select-all border border-slate-800 leading-relaxed max-h-[480px]">
                    {JSON.stringify(selectedLog.responsePayload || {}, null, 2)}
                  </pre>
                </div>
              )}

              {activeInspectorTab === 'curl' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      cURL Command for Troubleshooting in Terminal
                    </span>
                    <button
                      onClick={() => handleCopy(generateCurlCommand(selectedLog), 'curl_cmd')}
                      className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedField === 'curl_cmd' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy cURL
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-amber-300 font-mono text-xs overflow-x-auto select-all border border-slate-800 leading-relaxed max-h-[480px]">
                    {generateCurlCommand(selectedLog)}
                  </pre>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Click outside or press Escape to close inspector
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Clear Integration Audit Logs?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will flush the in-memory server audit queue and local cache.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to clear all {logs.length} logged records? This action cannot be undone. You can export a JSON or CSV backup before clearing.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Clear All Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminAuditLogSection;
