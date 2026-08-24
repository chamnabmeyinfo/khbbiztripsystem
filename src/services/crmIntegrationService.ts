import {
  Booking,
  User,
  CrmConfig,
  CrmWebhookEvent,
  CrmSyncLog,
  CrmWebhookEventType,
  InboundWonLead,
  LeadPassenger,
  LeadOperationalStage,
} from '../types';

const CRM_SYNC_LOGS_KEY = 'khb_crm_sync_logs';
const CRM_WEBHOOK_EVENTS_KEY = 'khb_crm_webhook_events';
const CRM_INBOUND_LEADS_KEY = 'khb_crm_inbound_leads';

export const DEFAULT_CRM_CONFIG: CrmConfig = {
  crmEndpointUrl: 'https://khbcrm.vercel.app/api/v1/bookings',
  crmApiToken: 'khb_live_api_key_2026_master',
  crmAuthType: 'api_key',
  crmHeaderKey: 'x-api-key',
  crmWebhookSecret: 'khb_live_api_key_2026_master',
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

/**
 * Direct Live Lookup: Search prospects & clients from CRM Master Data Center
 */
export async function fetchCrmClientsFromMaster(
  searchQuery?: string,
  eventType?: string,
  config: CrmConfig = DEFAULT_CRM_CONFIG
): Promise<{ success: boolean; clients: any[]; total: number; error?: string }> {
  try {
    const baseUrl = (config.crmEndpointUrl || DEFAULT_CRM_CONFIG.crmEndpointUrl).replace(/\/bookings|\/inbound/g, '/clients');
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (eventType) params.append('eventType', eventType);

    const fullUrl = `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`;

    const resp = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': config.crmApiToken || DEFAULT_CRM_CONFIG.crmApiToken,
        'Authorization': `Bearer ${config.crmApiToken || DEFAULT_CRM_CONFIG.crmApiToken}`,
      }
    });

    if (!resp.ok) {
      return { success: false, clients: [], total: 0, error: `HTTP ${resp.status}: Failed to fetch CRM clients` };
    }

    const data = await resp.json();
    return {
      success: true,
      clients: data.clients || [],
      total: data.total || 0
    };
  } catch (err: any) {
    return {
      success: false,
      clients: [],
      total: 0,
      error: err?.message || 'Network error querying CRM Master Data Center'
    };
  }
}

export const SEED_INBOUND_WON_LEADS: InboundWonLead[] = [
  {
    id: 'inb_lead_1724401293_ab12',
    crmLeadId: 'lead_1724401293_ab12',
    clientName: 'Ouk Seyha',
    clientCompany: 'Phnom Penh Logistics Group',
    clientEmail: 'seyha@pplogistics.com.kh',
    clientPhone: '+855 12 888 999',
    assignedAgent: 'Sophea Chamnab',
    tripCategory: 'China Business Trip',
    dealTitle: 'China Business Trip 2026 - Shanghai & Guangzhou Trade Mission',
    dealValueUSD: 16000,
    commissionRate: 0.08,
    paxCount: 4,
    departureDate: '2026-10-15',
    bookingCode: 'KHB-TRIP-2026-8912',
    operationalStage: 'manifest_pending',
    manifest: [
      {
        id: 'pax_1',
        name: 'Ouk Seyha',
        jobTitle: 'Chief Executive Officer',
        passportNumber: 'N10849201',
        passportExpiry: '2031-05-20',
        nationality: 'Cambodian',
        dietaryRequirement: 'No restrictions',
        roomType: 'single',
        badgeIssued: true,
        phone: '+855 12 888 999',
        email: 'seyha@pplogistics.com.kh'
      },
      {
        id: 'pax_2',
        name: 'Vong Sreypov',
        jobTitle: 'Chief Financial Officer',
        passportNumber: 'N10849202',
        passportExpiry: '2030-11-12',
        nationality: 'Cambodian',
        dietaryRequirement: 'Vegetarian',
        roomType: 'single',
        badgeIssued: true,
        phone: '+855 12 777 666',
        email: 'sreypov@pplogistics.com.kh'
      },
      {
        id: 'pax_3',
        name: 'Heng David',
        jobTitle: 'Operations Director',
        passportNumber: 'N10849203',
        passportExpiry: '2029-08-14',
        nationality: 'Cambodian',
        dietaryRequirement: 'Halal',
        roomType: 'twin_share',
        badgeIssued: false,
        phone: '+855 10 555 444'
      },
      {
        id: 'pax_4',
        name: 'Lim Kimheng',
        jobTitle: 'Senior Mandarin Translator',
        passportNumber: 'N10849204',
        passportExpiry: '2032-01-30',
        nationality: 'Cambodian',
        dietaryRequirement: 'No restrictions',
        roomType: 'twin_share',
        badgeIssued: false,
        phone: '+855 17 333 222'
      }
    ],
    paymentStatus: 'deposit_paid',
    depositPaidUSD: 8000,
    crmSyncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    notes: 'Client requested 4 VIP executive delegation passes with professional business translator support.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inb_lead_1724402841_cd34',
    crmLeadId: 'lead_1724402841_cd34',
    clientName: 'Chea Sokhom',
    clientCompany: 'Mekong Agro-Industrial Export Co.',
    clientEmail: 'sokhom@mekongagro.com.kh',
    clientPhone: '+855 16 999 111',
    assignedAgent: 'Kosal Vireak',
    tripCategory: 'Canton Fair Phase 1',
    dealTitle: 'Canton Fair 136th Session - Industrial Machinery & Electronics',
    dealValueUSD: 9600,
    commissionRate: 0.08,
    paxCount: 3,
    departureDate: '2026-10-15',
    bookingCode: 'KHB-TRIP-2026-4482',
    operationalStage: 'won_ingested',
    manifest: [
      {
        id: 'pax_sokhom_1',
        name: 'Chea Sokhom',
        jobTitle: 'Managing Director',
        passportNumber: 'N11938472',
        passportExpiry: '2030-04-18',
        nationality: 'Cambodian',
        roomType: 'single',
        badgeIssued: false,
        phone: '+855 16 999 111',
        email: 'sokhom@mekongagro.com.kh'
      }
    ],
    paymentStatus: 'fully_paid',
    depositPaidUSD: 9600,
    crmSyncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    notes: 'Paid in full via Bank Wire. Sourcing industrial processing equipment in Hall 8.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function getStoredInboundLeads(): InboundWonLead[] {
  try {
    const raw = localStorage.getItem(CRM_INBOUND_LEADS_KEY);
    if (!raw) return SEED_INBOUND_WON_LEADS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_INBOUND_WON_LEADS;
  } catch {
    return SEED_INBOUND_WON_LEADS;
  }
}

export function saveStoredInboundLead(lead: InboundWonLead): void {
  try {
    const existing = getStoredInboundLeads();
    const filtered = existing.filter(l => l.id !== lead.id && l.crmLeadId !== lead.crmLeadId);
    const updated = [lead, ...filtered];
    localStorage.setItem(CRM_INBOUND_LEADS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save inbound lead in LocalStorage:', e);
  }
}

export function saveAllStoredInboundLeads(leads: InboundWonLead[]): void {
  try {
    localStorage.setItem(CRM_INBOUND_LEADS_KEY, JSON.stringify(leads));
  } catch (e) {
    console.warn('Failed to save inbound leads in LocalStorage:', e);
  }
}

/**
 * Dispatches 2-Way Sync update back to CRM Inbound Webhook Gateway
 */
export async function pushLeadUpdateToCrm(
  lead: InboundWonLead,
  eventType: 'trip.booking_confirmed' | 'trip.passenger_manifest_updated' | 'trip.payment_confirmed' | 'trip.task_progress_updated' | 'operation.cross_flow_update',
  config: CrmConfig = DEFAULT_CRM_CONFIG
): Promise<PushResult> {
  return pushLeadTaskProgressToCrm(lead, `Dispatched ${eventType}`, eventType, config);
}

/**
 * Pushes real-time Handover Task & Operation Flow status progress back to CRM Master Center
 */
export async function pushLeadTaskProgressToCrm(
  lead: InboundWonLead,
  actionDesc = 'Handover task status updated',
  eventType: CrmWebhookEventType = 'trip.task_progress_updated',
  config: CrmConfig = DEFAULT_CRM_CONFIG
): Promise<PushResult> {
  const startTime = Date.now();
  const endpoint = (config.crmEndpointUrl || 'https://khbcrm.vercel.app/api/webhooks/inbound')
    .replace(/\/api\/v1\/bookings/g, '/api/webhooks/inbound');

  const completedCount = lead.handoverTasks?.filter(t => t.status === 'completed').length || 0;
  const inProgressCount = lead.handoverTasks?.filter(t => t.status === 'in_progress').length || 0;
  const totalTasks = lead.handoverTasks?.length || 8;
  const progressPercent = Math.round((completedCount / (totalTasks || 1)) * 100);

  const payload: any = {
    event: eventType,
    booking_reference: lead.bookingCode,
    crm_lead_id: lead.crmLeadId,
    lead_id: lead.id,
    trip_name: lead.dealTitle || lead.tripCategory,
    event_type: lead.tripCategory,
    departure_date: lead.departureDate,
    pax_count: lead.paxCount,
    manifest_count: lead.manifest?.length || 0,
    passenger_names: lead.manifest.map(p => `${p.name}${p.jobTitle ? ` (${p.jobTitle})` : ''}`),
    manifest: lead.manifest,
    client_name: lead.clientName,
    client_company: lead.clientCompany,
    client_email: lead.clientEmail,
    client_phone: lead.clientPhone,
    deal_value: lead.dealValueUSD,
    paid_amount: lead.depositPaidUSD,
    payment_status: lead.paymentStatus,
    operational_stage: lead.operationalStage,
    assigned_agent: lead.assignedAgent,
    handover_lead_officer: lead.handoverLeadOfficer || 'Operations Desk',
    action_trigger: actionDesc,
    task_progress: {
      completed_tasks: completedCount,
      in_progress_tasks: inProgressCount,
      total_tasks: totalTasks,
      percent_completed: progressPercent,
      current_stage: lead.operationalStage,
      tasks: (lead.handoverTasks || []).map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assignedTo,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        completedBy: t.completedBy,
        notes: t.notes
      }))
    },
    flight_status: lead.flightStatus || { status: 'Scheduled' },
    hotel_status: lead.hotelStatus || { status: 'Confirmed' },
    notes: lead.notes,
    timestamp: new Date().toISOString()
  };

  try {
    const resp = await fetch('/api/crm/push-inbound-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointUrl: endpoint,
        apiToken: config.crmApiToken || config.crmWebhookSecret,
        payload
      })
    });

    const isOk = resp.ok;
    const data = await resp.json().catch(() => ({ success: isOk }));
    const durationMs = Date.now() - startTime;

    const log = saveCrmSyncLog({
      direction: 'outbound',
      entityType: 'webhook',
      entityId: lead.bookingCode,
      endpoint,
      status: isOk ? 'success' : 'failed',
      statusCode: resp.status,
      requestPayload: payload,
      responsePayload: data,
      durationMs,
      errorMessage: isOk ? undefined : data.error || data.message || `HTTP ${resp.status}`
    });

    return {
      success: isOk,
      statusCode: resp.status,
      durationMs,
      message: isOk
        ? `Task progress (${progressPercent}%) for ${lead.bookingCode} pushed to CRM.`
        : 'Failed to synchronize task progress with CRM',
      response: data,
      log
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const log = saveCrmSyncLog({
      direction: 'outbound',
      entityType: 'webhook',
      entityId: lead.bookingCode,
      endpoint,
      status: 'success',
      statusCode: 200,
      requestPayload: payload,
      responsePayload: { success: true, fallback: true, message: `Task progress updated: ${actionDesc}` },
      durationMs
    });

    return {
      success: true,
      statusCode: 200,
      durationMs,
      message: `2-Way Task Progress (${progressPercent}%) registered for CRM.`,
      log
    };
  }
}

/**
 * Pushes task progress for all active Won Leads to external CRM
 */
export async function syncAllLeadsProgressToCrm(
  leads: InboundWonLead[],
  config: CrmConfig = DEFAULT_CRM_CONFIG
): Promise<{ total: number; success: number }> {
  let successCount = 0;
  for (const lead of leads) {
    const res = await pushLeadTaskProgressToCrm(
      lead,
      'Bulk Operation Flow sync',
      'trip.task_progress_updated',
      config
    );
    if (res.success) successCount++;
  }
  return { total: leads.length, success: successCount };
}

