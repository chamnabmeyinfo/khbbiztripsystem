import {
  Booking,
  User,
  CrmConfig,
  CrmWebhookEvent,
  CrmSyncLog,
  CrmWebhookEventType,
} from '../types';

const CRM_SYNC_LOGS_KEY = 'khb_crm_sync_logs';
const CRM_WEBHOOK_EVENTS_KEY = 'khb_crm_webhook_events';

export const DEFAULT_CRM_CONFIG: CrmConfig = {
  crmEndpointUrl: 'https://crm.khbevents.com/api/webhooks/inbound',
  crmApiToken: 'khb_trip_sec_8932_xab7',
  crmAuthType: 'bearer',
  crmHeaderKey: 'Authorization',
  crmWebhookSecret: 'khb_trip_sec_8932_xab7',
  crmAutoSyncBookings: true,
  crmAutoSyncCustomers: true,
  crmOrganizationId: 'KHB-DELEGATION-HQ',
  lastSyncAt: new Date().toISOString(),
  syncStatus: 'connected',
};

// ─── Local Storage Log Helpers ───────────────────────────────────────────────

export function getStoredCrmLogs(): CrmSyncLog[] {
  try {
    const raw = localStorage.getItem(CRM_SYNC_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCrmSyncLog(log: Omit<CrmSyncLog, 'id' | 'timestamp'>): CrmSyncLog {
  const newLog: CrmSyncLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };
  try {
    const existing = getStoredCrmLogs();
    const updated = [newLog, ...existing].slice(0, 100);
    localStorage.setItem(CRM_SYNC_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to persist CRM sync log in LocalStorage:', e);
  }
  return newLog;
}

export function clearStoredCrmLogs(): void {
  try {
    localStorage.removeItem(CRM_SYNC_LOGS_KEY);
  } catch (e) {
    console.warn('Failed to clear CRM logs:', e);
  }
}

export function getStoredWebhookEvents(): CrmWebhookEvent[] {
  try {
    const raw = localStorage.getItem(CRM_WEBHOOK_EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredWebhookEvent(event: CrmWebhookEvent): void {
  try {
    const existing = getStoredWebhookEvents();
    const filtered = existing.filter(e => e.id !== event.id);
    const updated = [event, ...filtered].slice(0, 100);
    localStorage.setItem(CRM_WEBHOOK_EVENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save webhook event in LocalStorage:', e);
  }
}

// ─── Outbound API Integration Helpers ─────────────────────────────────────────

export interface PushResult {
  success: boolean;
  statusCode: number;
  durationMs: number;
  message: string;
  response?: any;
  log?: CrmSyncLog;
}

/**
 * Pushes a single booking to the external CRM with token authentication.
 */
export async function pushBookingToExternalCrm(
  booking: Booking,
  customer?: User | null,
  config: CrmConfig = DEFAULT_CRM_CONFIG
): Promise<PushResult> {
  const startTime = Date.now();
  const endpoint = config.crmEndpointUrl || DEFAULT_CRM_CONFIG.crmEndpointUrl;

  try {
    const resp = await fetch('/api/crm/push-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointUrl: endpoint,
        apiToken: config.crmApiToken,
        authType: config.crmAuthType,
        customHeaderKey: config.crmHeaderKey,
        organizationId: config.crmOrganizationId,
        booking,
        customer,
      }),
    });

    const data = await resp.json();
    const durationMs = data.durationMs || Date.now() - startTime;
    const isSuccess = resp.ok && data.success;

    const log = saveCrmSyncLog({
      direction: 'outbound',
      entityType: 'booking',
      entityId: booking.bookingCode,
      endpoint,
      status: isSuccess ? 'success' : 'failed',
      statusCode: data.statusCode || resp.status,
      requestPayload: { bookingCode: booking.bookingCode, destination: booking.packageDestination, totalUSD: booking.totalPriceUSD },
      responsePayload: data.crmResponse || data,
      durationMs,
      errorMessage: isSuccess ? undefined : data.error || data.message || 'CRM synchronization failed',
    });

    return {
      success: isSuccess,
      statusCode: data.statusCode || resp.status,
      durationMs,
      message: data.message || (isSuccess ? `Booking ${booking.bookingCode} pushed to CRM.` : 'Failed to push booking'),
      response: data.crmResponse,
      log,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const log = saveCrmSyncLog({
      direction: 'outbound',
      entityType: 'booking',
      entityId: booking.bookingCode,
      endpoint,
      status: 'failed',
      statusCode: 500,
      requestPayload: { bookingCode: booking.bookingCode },
      durationMs,
      errorMessage: err?.message || String(err),
    });

    return {
      success: false,
      statusCode: 500,
      durationMs,
      message: err?.message || 'Network exception connecting to CRM integration proxy.',
      log,
    };
  }
}

/**
 * Pushes a single customer/delegate profile to the external CRM with token authentication.
 */
export async function pushCustomerToExternalCrm(
  customer: User,
  config: CrmConfig = DEFAULT_CRM_CONFIG
): Promise<PushResult> {
  const startTime = Date.now();
  const endpoint = config.crmEndpointUrl || DEFAULT_CRM_CONFIG.crmEndpointUrl;

  try {
    const resp = await fetch('/api/crm/push-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointUrl: endpoint,
        apiToken: config.crmApiToken,
        authType: config.crmAuthType,
        customHeaderKey: config.crmHeaderKey,
        organizationId: config.crmOrganizationId,
        customer,
      }),
    });

    const data = await resp.json();
    const durationMs = data.durationMs || Date.now() - startTime;
    const isSuccess = resp.ok && data.success;

    const log = saveCrmSyncLog({
      direction: 'outbound',
      entityType: 'customer',
      entityId: customer.id,
      endpoint,
      status: isSuccess ? 'success' : 'failed',
      statusCode: data.statusCode || resp.status,
      requestPayload: { id: customer.id, name: customer.name, email: customer.email },
      responsePayload: data.crmResponse || data,
      durationMs,
      errorMessage: isSuccess ? undefined : data.error || data.message,
    });

    return {
      success: isSuccess,
      statusCode: data.statusCode || resp.status,
      durationMs,
      message: data.message || (isSuccess ? `Customer ${customer.name} pushed to CRM.` : 'Failed to push customer'),
      response: data.crmResponse,
      log,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const log = saveCrmSyncLog({
      direction: 'outbound',
      entityType: 'customer',
      entityId: customer.id,
      endpoint,
      status: 'failed',
      statusCode: 500,
      requestPayload: { id: customer.id, name: customer.name },
      durationMs,
      errorMessage: err?.message || String(err),
    });

    return {
      success: false,
      statusCode: 500,
      durationMs,
      message: err?.message || 'Network exception connecting to CRM integration proxy.',
      log,
    };
  }
}

/**
 * Tests the connection to the external CRM endpoint.
 */
export async function testCrmApiConnection(
  config: CrmConfig = DEFAULT_CRM_CONFIG
): Promise<{ success: boolean; latencyMs: number; statusCode: number; message: string }> {
  const startTime = Date.now();
  const endpoint = config.crmEndpointUrl || DEFAULT_CRM_CONFIG.crmEndpointUrl;

  try {
    const resp = await fetch('/api/crm/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointUrl: endpoint,
        apiToken: config.crmApiToken,
        authType: config.crmAuthType,
        customHeaderKey: config.crmHeaderKey,
        organizationId: config.crmOrganizationId,
      }),
    });

    const data = await resp.json();
    const durationMs = data.latencyMs || Date.now() - startTime;
    const isSuccess = data.success !== false && (data.statusCode >= 200 && data.statusCode < 400);

    saveCrmSyncLog({
      direction: 'outbound',
      entityType: 'test',
      endpoint,
      status: isSuccess ? 'success' : 'failed',
      statusCode: data.statusCode || (isSuccess ? 200 : 500),
      durationMs,
      responsePayload: data,
      errorMessage: isSuccess ? undefined : data.message || 'Connection test returned failure status',
    });

    return {
      success: isSuccess,
      latencyMs: durationMs,
      statusCode: data.statusCode || (isSuccess ? 200 : 500),
      message: data.message || 'CRM handshake complete.',
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs: durationMs,
      statusCode: 500,
      message: err?.message || 'Failed to ping CRM server.',
    };
  }
}

// ─── Inbound Webhook Simulator & Receiver Helpers ─────────────────────────────

/**
 * Simulates a CRM webhook trigger for testing from the Admin UI.
 */
export async function simulateCrmWebhook(
  eventType: CrmWebhookEventType,
  payload: any,
  source = 'KHB Admin Webhook Simulator',
  customMessage?: string
): Promise<{ success: boolean; event: CrmWebhookEvent; message: string }> {
  try {
    const resp = await fetch('/api/webhooks/crm/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        payload,
        source,
        customMessage,
      }),
    });

    const data = await resp.json();
    if (data.success && data.event) {
      saveStoredWebhookEvent(data.event);
      saveCrmSyncLog({
        direction: 'inbound',
        entityType: 'webhook',
        entityId: data.event.affectedEntityId || data.event.id,
        endpoint: '/api/webhooks/crm/simulate',
        status: 'success',
        statusCode: 200,
        requestPayload: payload,
        responsePayload: data.event,
        durationMs: 15,
      });
      return {
        success: true,
        event: data.event,
        message: data.message || 'Simulated event received.',
      };
    }
    throw new Error(data.error || 'Simulation failed');
  } catch (err: any) {
    const fallbackEvent: CrmWebhookEvent = {
      id: `wh_sim_${Date.now()}`,
      eventType,
      timestamp: new Date().toISOString(),
      source,
      payload,
      status: 'processed',
      message: customMessage || `Simulated CRM event: ${eventType}`,
      affectedEntityId: payload?.bookingCode || payload?.bookingId || payload?.userId,
    };
    saveStoredWebhookEvent(fallbackEvent);
    return {
      success: true,
      event: fallbackEvent,
      message: 'Simulated locally via client fallback.',
    };
  }
}

/**
 * Fetches the latest webhook events from server queue.
 */
export async function fetchServerWebhookEvents(): Promise<CrmWebhookEvent[]> {
  try {
    const resp = await fetch('/api/webhooks/crm/events');
    if (!resp.ok) return getStoredWebhookEvents();
    const data = await resp.json();
    return Array.isArray(data.events) ? data.events : getStoredWebhookEvents();
  } catch {
    return getStoredWebhookEvents();
  }
}
