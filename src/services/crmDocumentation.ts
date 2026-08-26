/**
 * CRM Integration & Cooperation Documentation Engine
 * 
 * Provides comprehensive technical documentation, OpenAPI 3.0 specification,
 * field mapping dictionaries, sample payloads, and multi-language code generators
 * for external CRM systems (HubSpot, Salesforce, Zoho, Custom ERPs) to cooperate seamlessly.
 */

export interface CrmFieldMapping {
  crmField: string;
  crmType: string;
  bizTripField: string;
  bizTripType: string;
  required: boolean;
  description: string;
  exampleValue: any;
}

export interface CrmEventDoc {
  eventType: string;
  direction: 'inbound' | 'outbound';
  description: string;
  trigger: string;
  httpMethod: 'POST';
  endpoint: string;
  payloadSample: Record<string, any>;
  responseSample: Record<string, any>;
  headers: Record<string, string>;
}

export const CRM_SYSTEM_OVERVIEW = {
  name: 'KHB BizTrip Expedition & Trade Mission Operations System',
  version: '2.4.0',
  description: 'Enterprise B2B delegation logistics, tour package management, supplier procurement, costing engine, and delegate passenger manifest management platform.',
  cooperationPurpose: 'Enables external CRM platforms to automatically provision trade expedition bookings when deals are closed won, sync delegate manifests, receive live operational stage updates, and broadcast flight/schedule notifications.',
  contactEmail: 'tech@khbevents.com',
  apiVersion: 'v1 / v2-realtime',
  authMethods: ['x-crm-token Header', 'Authorization: Bearer <token>', 'x-api-key Header']
};

export const CRM_FIELD_MAPPINGS: CrmFieldMapping[] = [
  {
    crmField: 'crm_lead_id',
    crmType: 'string',
    bizTripField: 'crmLeadId',
    bizTripType: 'string',
    required: true,
    description: 'Unique identifier of the deal/lead record in the external CRM system',
    exampleValue: 'lead_2026_khb_99182'
  },
  {
    crmField: 'name',
    crmType: 'string',
    bizTripField: 'customerName',
    bizTripType: 'string',
    required: true,
    description: 'Full name of the primary trade delegation leader / customer',
    exampleValue: 'Ouk Seyha'
  },
  {
    crmField: 'company',
    crmType: 'string',
    bizTripField: 'companyName',
    bizTripType: 'string',
    required: false,
    description: 'Enterprise or chamber organization sending the delegation',
    exampleValue: 'Phnom Penh Logistics Group'
  },
  {
    crmField: 'email',
    crmType: 'string (email)',
    bizTripField: 'customerEmail',
    bizTripType: 'string (email)',
    required: true,
    description: 'Primary corporate email address for trip notifications and itineraries',
    exampleValue: 'seyha@pplogistics.com.kh'
  },
  {
    crmField: 'phone',
    crmType: 'string (e.164)',
    bizTripField: 'customerPhone',
    bizTripType: 'string',
    required: false,
    description: 'Mobile phone or WhatsApp number for concierge and airport coordination',
    exampleValue: '+855 12 888 999'
  },
  {
    crmField: 'deal_value',
    crmType: 'number (USD)',
    bizTripField: 'totalPriceUSD',
    bizTripType: 'number (USD)',
    required: true,
    description: 'Total contracted revenue for the expedition package in USD',
    exampleValue: 16000
  },
  {
    crmField: 'pax_count',
    crmType: 'integer',
    bizTripField: 'paxCount',
    bizTripType: 'integer',
    required: false,
    description: 'Total number of delegates traveling in this delegation group (defaults to 1)',
    exampleValue: 4
  },
  {
    crmField: 'event_type / destination',
    crmType: 'string',
    bizTripField: 'packageDestination',
    bizTripType: 'string',
    required: true,
    description: 'Target trade mission destination (e.g., China Business Trip, Canton Fair, Dubai Expo)',
    exampleValue: 'China Business Trip (Canton Fair & Shenzhen Tech)'
  },
  {
    crmField: 'tour_departure_date',
    crmType: 'string (YYYY-MM-DD)',
    bizTripField: 'departureDate',
    bizTripType: 'string (YYYY-MM-DD)',
    required: false,
    description: 'Scheduled flight departure date for the expedition',
    exampleValue: '2026-10-15'
  },
  {
    crmField: 'assigned_agent',
    crmType: 'string',
    bizTripField: 'salesOwner',
    bizTripType: 'string',
    required: false,
    description: 'CRM sales executive who closed the deal',
    exampleValue: 'Sophea Chamnab'
  },
  {
    crmField: 'passengers',
    crmType: 'array of objects',
    bizTripField: 'passengers',
    bizTripType: 'LeadPassenger[]',
    required: false,
    description: 'Full delegate manifest list (name, passport, dietary, room type, VIP tier)',
    exampleValue: [
      {
        name: 'Ouk Seyha',
        passportNumber: 'N1029384',
        roomType: 'single_suite',
        dietary: 'None',
        vipStatus: true
      },
      {
        name: 'Chhim Ratanak',
        passportNumber: 'N9928174',
        roomType: 'shared_twin',
        dietary: 'Halal',
        vipStatus: false
      }
    ]
  },
  {
    crmField: 'notes',
    crmType: 'string',
    bizTripField: 'specialRequirements',
    bizTripType: 'string',
    required: false,
    description: 'Special requests (e.g. VIP translator, executive limousine, factory visits)',
    exampleValue: 'Delegation requires English-Mandarin industrial translator and VIP lounge pass.'
  }
];

export const CRM_EVENTS_REGISTRY: CrmEventDoc[] = [
  {
    eventType: 'lead.won',
    direction: 'inbound',
    description: 'Triggered when a deal/lead reaches "Closed Won" in the CRM. Automatically provisions the trip, generates the passenger manifest, and creates operational handover tasks.',
    trigger: 'Sales rep closes deal or marks stage "Won" in CRM pipeline',
    httpMethod: 'POST',
    endpoint: '/api/webhooks/crm-leads',
    headers: {
      'Content-Type': 'application/json',
      'x-crm-token': 'khb_crm_secret_2026',
      'x-crm-source': 'KHB_EVENTS_CRM'
    },
    payloadSample: {
      event: 'lead.won',
      timestamp: '2026-08-25T11:00:00.000Z',
      source: 'KHB_EVENTS_CRM',
      data: {
        crm_lead_id: 'lead_2026_canton_9812',
        name: 'Ouk Seyha',
        company: 'Phnom Penh Logistics Group',
        email: 'seyha@pplogistics.com.kh',
        phone: '+855 12 888 999',
        event_type: 'China Business Trip (Canton Fair)',
        deal_value: 16000,
        commission_rate: 0.08,
        status: 'Won',
        assigned_agent: 'Sophea Chamnab',
        booking_reference: 'KHB-TRIP-2026-8912',
        pax_count: 2,
        tour_departure_date: '2026-10-15',
        passengers: [
          {
            name: 'Ouk Seyha',
            passportNumber: 'N1029384',
            roomType: 'single_suite',
            vipStatus: true
          },
          {
            name: 'Chhim Ratanak',
            passportNumber: 'N9928174',
            roomType: 'shared_twin',
            vipStatus: false
          }
        ],
        notes: 'Requested VIP translator for medical equipment pavilion.',
        created_at: '2026-08-25T10:30:00.000Z'
      }
    },
    responseSample: {
      success: true,
      statusCode: 200,
      leadId: 'lead_inbound_1756119600000_ab12',
      bookingId: 'b_1756119600000_9812',
      bookingCode: 'KHB-TRIP-2026-8912',
      tasksCreated: 8,
      message: 'Inbound won lead registered & operational handover tasks provisioned successfully.'
    }
  },
  {
    eventType: 'booking.status_updated',
    direction: 'inbound',
    description: 'Allows CRM to update the status of an ongoing booking (e.g. "confirmed", "in_progress", "completed", "cancelled").',
    trigger: 'Payment confirmed or trip amended in CRM finance module',
    httpMethod: 'POST',
    endpoint: '/api/webhooks/crm',
    headers: {
      'Content-Type': 'application/json',
      'x-crm-token': 'khb_crm_secret_2026'
    },
    payloadSample: {
      event: 'booking.status_updated',
      timestamp: '2026-08-25T11:15:00.000Z',
      data: {
        bookingCode: 'KHB-TRIP-2026-8912',
        status: 'confirmed',
        crmNotes: 'Full invoice settlement received. Delegate badge generated.',
        verifiedAt: '2026-08-25T11:14:00.000Z'
      }
    },
    responseSample: {
      success: true,
      message: 'Booking KHB-TRIP-2026-8912 status updated to confirmed.'
    }
  },
  {
    eventType: 'flight.status_changed',
    direction: 'inbound',
    description: 'Delivers airline gate changes, delays, and schedule revisions directly to delegates\' mobile travel portal.',
    trigger: 'CRM airline feed or flight tracking radar update',
    httpMethod: 'POST',
    endpoint: '/api/webhooks/crm',
    headers: {
      'Content-Type': 'application/json',
      'x-crm-token': 'khb_crm_secret_2026'
    },
    payloadSample: {
      event: 'flight.status_changed',
      timestamp: '2026-08-25T11:20:00.000Z',
      data: {
        bookingCode: 'KHB-TRIP-2026-8912',
        flightStatus: {
          flightNumber: 'TD 742',
          airline: 'Cambodia Angkor Air',
          status: 'Delayed',
          gate: 'B24',
          departureTime: '10:15 AM (Delayed +45m)',
          notes: 'Air traffic flow control at Guangzhou Baiyun International.'
        }
      }
    },
    responseSample: {
      success: true,
      message: 'Flight status broadcasted to delegate portal.'
    }
  },
  {
    eventType: 'customer.vip_upgraded',
    direction: 'inbound',
    description: 'Promotes a trade delegate to VIP Platinum / Delegation Leader tier with fast-track badges.',
    trigger: 'VIP status granted in CRM account management',
    httpMethod: 'POST',
    endpoint: '/api/webhooks/crm',
    headers: {
      'Content-Type': 'application/json',
      'x-crm-token': 'khb_crm_secret_2026'
    },
    payloadSample: {
      event: 'customer.vip_upgraded',
      timestamp: '2026-08-25T11:25:00.000Z',
      data: {
        email: 'seyha@pplogistics.com.kh',
        vipTag: 'VIP Platinum Delegation Leader',
        benefits: [
          'Fast-track Canton Fair entry badge',
          'VIP Executive Lounge Access',
          'Private Chauffeured Transfer'
        ]
      }
    },
    responseSample: {
      success: true,
      message: 'Delegate upgraded to VIP Platinum tier.'
    }
  },
  {
    eventType: 'trip.fulfillment_progress_sync',
    direction: 'outbound',
    description: 'Dispatched by KHB BizTrip back into the external CRM whenever operations team updates milestones (Flight Booked, Hotel Confirmed, Visa Issued, Manifest Locked).',
    trigger: 'Trip coordinator completes checklist items or advances stage',
    httpMethod: 'POST',
    endpoint: 'https://khbcrm.vercel.app/api/webhooks/inbound',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <crm_api_token>'
    },
    payloadSample: {
      event: 'trip.fulfillment_progress_sync',
      timestamp: '2026-08-25T11:30:00.000Z',
      source: 'KHB_BIZTRIP_ERP',
      leadId: 'lead_inbound_1756119600000_ab12',
      crmLeadId: 'lead_2026_canton_9812',
      bookingCode: 'KHB-TRIP-2026-8912',
      stage: 'flight_booked',
      progressPercent: 45,
      completedChecklist: [
        'Initial Customer Contact',
        'Flight Tickets Issued & E-Tickets Sent'
      ],
      pendingChecklist: [
        'Hotel Group Booking Confirmed',
        'Business Visa / Entry Passes Approved',
        'Bilingual Guide & Coach Assigned'
      ],
      updatedAt: '2026-08-25T11:30:00.000Z'
    },
    responseSample: {
      success: true,
      statusCode: 200,
      message: 'CRM deal record updated with latest fulfillment progress.'
    }
  }
];

export const CRM_CAPABILITY_PILLARS = [
  {
    id: 'expedition_packages',
    title: 'Tour & Trade Mission Package Catalog',
    badge: 'Core Catalog',
    color: 'sky',
    description: 'Manages multi-tier trade mission packages (e.g. Canton Fair, Shenzhen Tech, Dubai Expo, Bangkok Medical Expo), inclusive services, day-by-day itineraries, flight schedules, and dual-currency pricing.',
    crmInteroperability: 'CRM can read available tour package IDs, prices, departure dates, and seat availability to automatically match won deals with specific expedition packages.',
    keyEntities: ['PackageTitle', 'Destination', 'PriceUSD', 'PriceKHR', 'DepartureDate', 'ItineraryDays', 'Inclusions', 'AvailableSeats']
  },
  {
    id: 'won_leads_pipeline',
    title: 'Inbound Won Leads & Delegation Handover',
    badge: 'Automated Handover',
    color: 'emerald',
    description: 'When sales reps win a deal in CRM, the system automatically registers the expedition lead, provisions the booking record, and initializes the 8-Stage Handover Checklist.',
    crmInteroperability: 'CRM dispatches `lead.won` webhook with deal size, passenger count, and customer contact. System auto-generates operations tasks and assigns coordinators.',
    keyEntities: ['CrmLeadId', 'ClientName', 'Company', 'DealValue', 'SalesOwner', 'OperationalStage', 'HandoverTasks']
  },
  {
    id: 'passenger_manifest',
    title: 'Traveler & Delegate Passenger Manifest',
    badge: 'Manifest Operations',
    color: 'indigo',
    description: 'Full delegate manifest tracker capturing passport numbers, expiry dates, rooming allocations (Single Suite vs Shared Twin), dietary restrictions, and VIP protocols.',
    crmInteroperability: 'CRM can pass initial passenger lists in the `lead.won` payload or update delegate VIP tier via `customer.vip_upgraded`. System syncs finalized manifest back to CRM.',
    keyEntities: ['PassengerName', 'PassportNumber', 'RoomType', 'DietaryRequirements', 'VipStatus', 'EmergencyContact']
  },
  {
    id: 'flight_hotel_telemetry',
    title: 'Flight Status & Accommodation Radar',
    badge: 'Real-Time Telemetry',
    color: 'amber',
    description: 'Tracks international flight PNRs, airline gate assignments, delay alerts, and 5-star hotel group room blocks for trade delegates.',
    crmInteroperability: 'CRM airline feeds or flight tracking systems push `flight.status_changed` webhooks to instantly notify trade delegates via their mobile portal.',
    keyEntities: ['FlightNumber', 'Airline', 'Gate', 'FlightStatus', 'DepartureTime', 'HotelName', 'RoomBlockCode']
  },
  {
    id: 'financial_settlements',
    title: 'Invoicing, Multi-Currency & Payments',
    badge: 'Finance & Tax',
    color: 'purple',
    description: 'Automated invoice generation, dual-currency USD/KHR conversion, partial deposit tracking, receipt vouchers, and tax/VAT compliance reporting.',
    crmInteroperability: 'System notifies CRM when invoices are generated, deposits are verified, or final payments settle (`finance.payment_settled`).',
    keyEntities: ['InvoiceNumber', 'TotalUSD', 'TotalKHR', 'PaidAmount', 'PaymentStatus', 'ExchangeRate', 'TaxAmount']
  },
  {
    id: 'suppliers_procurement',
    title: 'Suppliers & Purchase Orders (PO)',
    badge: 'Procurement',
    color: 'rose',
    description: 'Manages external suppliers (airlines, luxury coach operators, 5-star hotels, bilingual translation guides, trade hall ticket distributors) and purchase order settlements.',
    crmInteroperability: 'Operations team costs and books suppliers per delegation group, maintaining accurate profit/loss and gross margins visible to management.',
    keyEntities: ['SupplierName', 'Category', 'PoNumber', 'CommittedCost', 'PaymentDueDate', 'SettlementStatus']
  }
];

export const CRM_COOPERATION_SCENARIOS = [
  {
    scenarioId: 'deal_won_automation',
    title: 'Scenario 1: Deal Closed Won → Automatic Trip Provisioning',
    direction: 'Inbound (CRM → BizTrip)',
    summary: 'When a trade expedition deal is marked "Closed Won" in CRM, automatically provision the expedition reservation and create the 8-task operational handover checklist without manual entry.',
    steps: [
      'Sales rep closes deal in CRM (e.g. 4 delegates for Canton Fair, $16,000).',
      'CRM webhook automation triggers HTTP POST to /api/webhooks/crm-leads with payload.',
      'BizTrip System verifies token, generates Booking Code KHB-TRIP-2026-XXXX, and assigns Trip Coordinator.',
      '8 Standard fulfillment tasks (Flights, Hotels, Visas, Guides, Manifest, Briefing, Concierge, Feedback) are created in Won Leads Pipeline.',
      'BizTrip responds with 200 OK containing new booking ID and task count.'
    ]
  },
  {
    scenarioId: 'realtime_flight_alerts',
    title: 'Scenario 2: Flight Schedule / Gate Change Broadcast',
    direction: 'Inbound (CRM → BizTrip)',
    summary: 'When an airline updates flight departure time, delay, or terminal gate, broadcast the change immediately to all delegates\' mobile travel portal.',
    steps: [
      'CRM or airline tracking service detects schedule change (e.g. Flight TD-742 Delayed 45m).',
      'CRM posts `flight.status_changed` webhook to /api/webhooks/crm.',
      'BizTrip updates delegate flight card and sends instant push notification.'
    ]
  },
  {
    scenarioId: 'bidirectional_progress_sync',
    title: 'Scenario 3: Live 2-Way Operational Progress Sync',
    direction: 'Outbound (BizTrip → CRM)',
    summary: 'As the BizTrip operations team completes fulfillment tasks (e.g. Flight Tickets Issued, Visa Approved, Hotel Confirmed), BizTrip pushes live progress back to the CRM deal record.',
    steps: [
      'Operations coordinator marks "Business Visas & Fair Badges Approved" as Completed in BizTrip.',
      'BizTrip automatically dispatches `trip.fulfillment_progress_sync` to CRM inbound webhook.',
      'CRM updates Deal custom fields (Fulfillment Stage = visa_issued, Progress = 75%).'
    ]
  },
  {
    scenarioId: 'payment_reconciliation_sync',
    title: 'Scenario 4: Customer Payment & Receipt Settlement',
    direction: 'Outbound (BizTrip → CRM)',
    summary: 'When client makes a deposit or final payment in BizTrip, financial status is synced back to CRM invoices and revenue reporting.',
    steps: [
      'Accountant records deposit payment in BizTrip Finance module.',
      'BizTrip dispatches `finance.payment_settled` to CRM with receipt voucher details.',
      'CRM updates account billing status and triggers customer receipt email.'
    ]
  }
];

export function generateGoSnippet(
  endpointUrl: string,
  eventDoc: CrmEventDoc,
  token: string
): string {
  const url = `${endpointUrl}${eventDoc.endpoint}`;
  return `// Go (net/http)
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

func main() {
	endpoint := "${url}"
	payload := ${JSON.stringify(eventDoc.payloadSample, null, 4)}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("Error marshalling JSON: %v\\n", err)
		return
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error creating request: %v\\n", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-crm-token", "${token || 'khb_crm_secret_2026'}")
	req.Header.Set("x-crm-source", "KHB_EVENTS_CRM")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\\n", err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("Response Status: %s\\nResponse Body: %s\\n", resp.Status, string(body))
}`;
}

export function generateZapierWebhookGuide(
  endpointUrl: string,
  eventDoc: CrmEventDoc,
  token: string
): string {
  const url = `${endpointUrl}${eventDoc.endpoint}`;
  return `{
  "action": "Webhooks by Zapier / Custom Request",
  "method": "POST",
  "url": "${url}",
  "headers": {
    "Content-Type": "application/json",
    "x-crm-token": "${token || 'khb_crm_secret_2026'}",
    "x-crm-source": "ZAPIER_CRM_AUTOMATION"
  },
  "data": ${JSON.stringify(eventDoc.payloadSample, null, 2)}
}`;
}

export function generateCrmAiPrompt(originUrl: string = 'https://trip.khbevents.com'): string {
  return `You are integrating an external CRM system (HubSpot, Salesforce, Zoho, Custom ERP) with the KHB BizTrip Expedition & Trade Mission Operations System.

Here is the complete specification of what KHB BizTrip has and how your CRM should cooperate with it:

1. SYSTEM IDENTITY & ROLE:
- Name: KHB BizTrip Expedition & Operations System (v2.4.0)
- Role: Specialized B2B Trade Expedition ERP handling delegate booking management, passenger manifests (passports, rooming, dietary), flight/hotel logistics, 8-stage fulfillment tasks, multi-currency invoicing, and supplier procurement.

2. INBOUND WEBHOOK ENDPOINT (CRM -> KHB BizTrip):
- URL: ${originUrl}/api/webhooks/crm-leads
- Method: POST
- Authentication Header: x-crm-token: khb_crm_secret_2026  (or Authorization: Bearer <token>)
- Required Payload Structure for Won Deals:
  {
    "event": "lead.won",
    "source": "YOUR_CRM_NAME",
    "data": {
      "crm_lead_id": "YOUR_CRM_DEAL_ID_REQUIRED",
      "name": "Customer / Delegation Leader Name",
      "company": "Company Name",
      "email": "customer@company.com",
      "phone": "+855 12 345 678",
      "event_type": "China Business Trip (Canton Fair)",
      "deal_value": 16000,
      "pax_count": 2,
      "tour_departure_date": "2026-10-15",
      "assigned_agent": "Sales Rep Name",
      "passengers": [
        { "name": "Delegate 1", "passportNumber": "N123456", "roomType": "single_suite", "vipStatus": true },
        { "name": "Delegate 2", "passportNumber": "N654321", "roomType": "shared_twin", "vipStatus": false }
      ]
    }
  }

3. OUTBOUND NOTIFICATIONS (KHB BizTrip -> CRM):
- As operations coordinators fulfill tasks, KHB BizTrip will POST to your CRM webhook (e.g. ${originUrl}/api/crm/push-inbound-sync) with:
  - event: "trip.fulfillment_progress_sync"
  - stage: lead_received | customer_contacted | flight_booked | hotel_confirmed | visa_issued | guide_assigned | manifest_locked | trip_completed
  - progressPercent: 0 to 100
  - completedChecklist: ["Flight Booked", "Visa Approved"]

4. MACHINE-READABLE OPENAPI SPEC:
- ${originUrl}/api/crm/openapi.json

Use this specification to configure your CRM workflows, Zapier / Make / n8n recipes, or custom webhook dispatchers without any further manual documentation required.`;
}

export const OPERATIONAL_STAGES_DOC = [
  {
    stage: 'lead_received',
    title: '1. Inbound Lead Won & Ingested',
    description: 'Automatic generation of reservation record, default passenger list, and operational handover tasks.',
    progress: 10
  },
  {
    stage: 'customer_contacted',
    title: '2. Customer Contacted & Onboarded',
    description: 'Traveler concierge reaches out to confirm delegate passport copies and special dietary/rooming needs.',
    progress: 25
  },
  {
    stage: 'flight_booked',
    title: '3. International Flights Booked',
    description: 'Group airline reservation locked, PNR numbers generated, and e-tickets issued.',
    progress: 45
  },
  {
    stage: 'hotel_confirmed',
    title: '4. Executive Hotel Confirmed',
    description: '5-Star hotel room block secured with rooming list confirmed for all delegates.',
    progress: 60
  },
  {
    stage: 'visa_issued',
    title: '5. Business Visas & Fair Badges',
    description: 'Official invitation letters, embassy visas, and trade exhibition badges approved.',
    progress: 75
  },
  {
    stage: 'guide_assigned',
    title: '6. Tour Guide & Coach Assigned',
    description: 'Bilingual expedition guide, VIP luxury coach, and airport meet-and-greet locked in.',
    progress: 90
  },
  {
    stage: 'manifest_locked',
    title: '7. Final Manifest Locked & Ready',
    description: 'All pre-trip briefings complete, vouchers released to traveler portal, ready for takeoff.',
    progress: 95
  },
  {
    stage: 'trip_completed',
    title: '8. Mission Successfully Completed',
    description: 'Delegation returned, post-trip feedback collected, and financial reconciliations closed.',
    progress: 100
  }
];

export function generateCapabilityManifestJson(originUrl: string = 'https://trip.khbevents.com'): Record<string, any> {
  return {
    system: {
      name: CRM_SYSTEM_OVERVIEW.name,
      version: CRM_SYSTEM_OVERVIEW.version,
      description: CRM_SYSTEM_OVERVIEW.description,
      purpose: CRM_SYSTEM_OVERVIEW.cooperationPurpose,
      baseUrl: originUrl,
      contact: CRM_SYSTEM_OVERVIEW.contactEmail
    },
    capabilities: CRM_CAPABILITY_PILLARS,
    cooperationScenarios: CRM_COOPERATION_SCENARIOS,
    events: CRM_EVENTS_REGISTRY,
    fieldMappings: CRM_FIELD_MAPPINGS,
    operationalStages: OPERATIONAL_STAGES_DOC,
    authMethods: CRM_SYSTEM_OVERVIEW.authMethods,
    endpoints: {
      inboundLeads: `${originUrl}/api/webhooks/crm-leads`,
      inboundLifecycle: `${originUrl}/api/webhooks/crm`,
      inboundEventsStream: `${originUrl}/api/webhooks/crm/events`,
      outboundPushBooking: `${originUrl}/api/crm/push-booking`,
      outboundPushCustomer: `${originUrl}/api/crm/push-customer`,
      outboundProgressSync: `${originUrl}/api/crm/push-inbound-sync`,
      connectionTest: `${originUrl}/api/crm/test-connection`,
      openApiJson: `${originUrl}/api/crm/openapi.json`,
      capabilitiesJson: `${originUrl}/api/crm/capabilities`
    }
  };
}

// ─── Multi-Language Code Generators ───────────────────────────────────────────

export function generateCurlSnippet(
  endpointUrl: string,
  eventDoc: CrmEventDoc,
  token: string
): string {
  const url = `${endpointUrl}${eventDoc.endpoint}`;
  return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "x-crm-token: ${token || 'khb_crm_secret_2026'}" \\
  -H "x-crm-source: KHB_EVENTS_CRM" \\
  -d '${JSON.stringify(eventDoc.payloadSample, null, 2)}'`;
}

export function generateTypeScriptSnippet(
  endpointUrl: string,
  eventDoc: CrmEventDoc,
  token: string
): string {
  const url = `${endpointUrl}${eventDoc.endpoint}`;
  return `// TypeScript / Node.js (Axios / Fetch)
import axios from 'axios';

async function dispatchCrmWebhook() {
  const endpoint = "${url}";
  const payload = ${JSON.stringify(eventDoc.payloadSample, null, 2)};

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-crm-token': '${token || 'khb_crm_secret_2026'}',
        'x-crm-source': 'KHB_EVENTS_CRM'
      },
      timeout: 10000
    });

    console.log('✅ Webhook Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Webhook Dispatch Failed:', error?.response?.data || error.message);
    throw error;
  }
}

dispatchCrmWebhook();`;
}

export function generatePythonSnippet(
  endpointUrl: string,
  eventDoc: CrmEventDoc,
  token: string
): string {
  const url = `${endpointUrl}${eventDoc.endpoint}`;
  return `# Python 3.x (requests library)
import requests
import json

url = "${url}"
headers = {
    "Content-Type": "application/json",
    "x-crm-token": "${token || 'khb_crm_secret_2026'}",
    "x-crm-source": "KHB_EVENTS_CRM"
}
payload = ${JSON.stringify(eventDoc.payloadSample, null, 4)}

try:
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
    print("✅ KHB BizTrip Webhook Accepted:", response.json())
except requests.exceptions.RequestException as e:
    print("❌ Failed to push webhook:", e)
`;
}

export function generatePhpSnippet(
  endpointUrl: string,
  eventDoc: CrmEventDoc,
  token: string
): string {
  const url = `${endpointUrl}${eventDoc.endpoint}`;
  return `<?php
// PHP cURL Integration
$endpoint = "${url}";
$data = ${JSON.stringify(eventDoc.payloadSample, null, 4)};

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-crm-token: ${token || 'khb_crm_secret_2026'}',
    'x-crm-source: KHB_EVENTS_CRM'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo '❌ cURL Error: ' . curl_error($ch);
} else {
    echo "✅ HTTP {$httpCode} Response: " . $response;
}
curl_close($ch);
?>`;
}

// ─── Machine-Readable OpenAPI 3.0 Specification Generator ──────────────────────

export function generateOpenApiSpec(originUrl: string = 'https://trip.khbevents.com'): Record<string, any> {
  return {
    openapi: '3.0.3',
    info: {
      title: 'KHB BizTrip Expedition & ERP Integration API',
      version: '2.4.0',
      description: 'REST and Webhook API specification for external CRMs (HubSpot, Salesforce, Zoho, Custom ERP) to cooperate with KHB BizTrip Expedition Operations System.',
      contact: {
        name: 'KHB Technology & Operations Team',
        email: 'tech@khbevents.com',
        url: 'https://khbevents.com'
      }
    },
    servers: [
      {
        url: originUrl,
        description: 'Primary Production / Staging Gateway'
      },
      {
        url: 'https://khbcrm.vercel.app',
        description: 'Vercel Deployment Endpoint'
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-crm-token',
          description: 'Secret authentication token or API key for webhook verification.'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT or API Key',
          description: 'Standard Bearer authorization header.'
        }
      },
      schemas: {
        LeadPassenger: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Ouk Seyha' },
            passportNumber: { type: 'string', example: 'N1029384' },
            roomType: { type: 'string', enum: ['single_suite', 'shared_twin'], example: 'single_suite' },
            dietary: { type: 'string', example: 'None / Halal / Vegetarian' },
            vipStatus: { type: 'boolean', example: true }
          },
          required: ['name']
        },
        InboundWonLeadPayload: {
          type: 'object',
          properties: {
            event: { type: 'string', example: 'lead.won' },
            timestamp: { type: 'string', format: 'date-time' },
            source: { type: 'string', example: 'KHB_EVENTS_CRM' },
            data: {
              type: 'object',
              properties: {
                crm_lead_id: { type: 'string', example: 'lead_2026_canton_9812' },
                name: { type: 'string', example: 'Ouk Seyha' },
                company: { type: 'string', example: 'Phnom Penh Logistics Group' },
                email: { type: 'string', format: 'email', example: 'seyha@pplogistics.com.kh' },
                phone: { type: 'string', example: '+855 12 888 999' },
                event_type: { type: 'string', example: 'China Business Trip (Canton Fair)' },
                deal_value: { type: 'number', example: 16000 },
                pax_count: { type: 'integer', example: 4 },
                tour_departure_date: { type: 'string', format: 'date', example: '2026-10-15' },
                assigned_agent: { type: 'string', example: 'Sophea Chamnab' },
                notes: { type: 'string', example: 'VIP translator required' },
                passengers: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/LeadPassenger' }
                }
              },
              required: ['crm_lead_id', 'name', 'email', 'deal_value']
            }
          },
          required: ['data']
        }
      }
    },
    paths: {
      '/api/webhooks/crm-leads': {
        post: {
          summary: 'Inbound Deal Won Webhook',
          description: 'Receives won deals from CRM, provisions the trip booking, builds the passenger manifest, and creates the operational checklist.',
          security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InboundWonLeadPayload' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Inbound lead provisioned successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      leadId: { type: 'string', example: 'lead_inbound_1756119600000_ab12' },
                      bookingCode: { type: 'string', example: 'KHB-TRIP-2026-8912' },
                      tasksCreated: { type: 'integer', example: 8 }
                    }
                  }
                }
              }
            },
            '401': { description: 'Unauthorized / Invalid Webhook Token' },
            '400': { description: 'Malformed JSON Payload or Missing Required Fields' }
          }
        }
      },
      '/api/webhooks/crm': {
        post: {
          summary: 'General Inbound Lifecycle Webhook',
          description: 'Handles lifecycle updates: booking status updates, flight delays, VIP upgrades, and urgent broadcasts.',
          security: [{ ApiKeyHeader: [] }],
          responses: {
            '200': { description: 'Lifecycle event accepted and processed' }
          }
        }
      },
      '/api/crm/push-inbound-sync': {
        post: {
          summary: 'Outbound 2-Way Operational Progress Dispatcher',
          description: 'Pushes real-time fulfillment stage and handover checklist progress back into the external CRM deal record.',
          responses: {
            '200': { description: 'Fulfillment milestone synchronized with CRM' }
          }
        }
      },
      '/api/crm/push-booking': {
        post: {
          summary: 'Outbound Booking Dispatch',
          description: 'Pushes newly confirmed booking reservations into the CRM pipeline.',
          responses: {
            '200': { description: 'Booking synchronized with CRM' }
          }
        }
      },
      '/api/crm/push-customer': {
        post: {
          summary: 'Outbound Trade Delegate Profile Dispatch',
          description: 'Synchronizes delegate profile details with CRM contacts.',
          responses: {
            '200': { description: 'Delegate profile synchronized' }
          }
        }
      },
      '/api/crm/test-connection': {
        post: {
          summary: 'Test CRM Handshake & Latency',
          description: 'Verifies network connectivity and authentication tokens with external CRM endpoint.',
          responses: {
            '200': { description: 'Ping successful' }
          }
        }
      }
    }
  };
}

// ─── Markdown Document Export Generator ──────────────────────────────────────

export function generateMarkdownIntegrationGuide(originUrl: string = 'https://trip.khbevents.com'): string {
  const webhookUrl = `${originUrl}/api/webhooks/crm-leads`;
  
  return `# KHB BizTrip & Expedition Operations System
## Official CRM Integration & Cooperation Specification (v2.4.0)

This document provides external CRM platforms (HubSpot, Salesforce, Zoho, Custom ERPs) with the technical specification required to integrate with the **KHB BizTrip Expedition & Trade Mission System**.

---

### 1. Architectural Role & Overview
- **System Name**: KHB BizTrip Expedition & Trade Mission Operations System
- **Role**: Specialized B2B Delegation Logistics, Tour Package Management, Costing Engine, Passenger Manifests, and Expedition Operations ERP.
- **Integration Scope**: 
  1. **Inbound Automation**: Automatic trip reservation, delegate manifest generation, and operational task provisioning when a CRM deal is won.
  2. **Real-Time Webhook Lifecycle**: Flight tracking alerts, gate updates, VIP tier upgrades, payment confirmations, and urgent alerts delivered directly to delegates.
  3. **Outbound 2-Way Progress Sync**: Real-time milestone updates (Flight Booked, Hotel Confirmed, Visa Issued, Manifest Locked) broadcast back to CRM deals.

---

### 2. Inbound Webhook Endpoint
- **URL**: \`${webhookUrl}\`
- **Method**: \`POST\`
- **Authentication**: Include header \`x-crm-token: <your_secret_token>\` or \`Authorization: Bearer <token>\`
- **Content-Type**: \`application/json\`

#### Inbound Deal Won Payload Example:
\`\`\`json
{
  "event": "lead.won",
  "timestamp": "${new Date().toISOString()}",
  "source": "KHB_EVENTS_CRM",
  "data": {
    "crm_lead_id": "lead_2026_canton_9812",
    "name": "Ouk Seyha",
    "company": "Phnom Penh Logistics Group",
    "email": "seyha@pplogistics.com.kh",
    "phone": "+855 12 888 999",
    "event_type": "China Business Trip (Canton Fair)",
    "deal_value": 16000,
    "pax_count": 2,
    "tour_departure_date": "2026-10-15",
    "assigned_agent": "Sophea Chamnab",
    "passengers": [
      {
        "name": "Ouk Seyha",
        "passportNumber": "N1029384",
        "roomType": "single_suite",
        "vipStatus": true
      },
      {
        "name": "Chhim Ratanak",
        "passportNumber": "N9928174",
        "roomType": "shared_twin",
        "vipStatus": false
      }
    ],
    "notes": "VIP translator requested for machinery hall."
  }
}
\`\`\`

---

### 3. Field Mapping Dictionary

| CRM Field | Type | KHB BizTrip Field | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
${CRM_FIELD_MAPPINGS.map(f => `| \`${f.crmField}\` | \`${f.crmType}\` | \`${f.bizTripField}\` | ${f.required ? '**Yes**' : 'No'} | ${f.description} |`).join('\n')}

---

### 4. Operational Fulfillment Stages (2-Way Sync)

When a deal is won, KHB BizTrip automatically advances through 8 operational stages and syncs progress back to the CRM:

${OPERATIONAL_STAGES_DOC.map(s => `- **${s.title}** (${s.progress}% Progress): ${s.description}`).join('\n')}

---

### 5. Code Examples

#### cURL:
\`\`\`bash
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-crm-token: khb_crm_secret_2026" \\
  -H "x-crm-source: KHB_EVENTS_CRM" \\
  -d '{
    "event": "lead.won",
    "data": {
      "crm_lead_id": "lead_2026_01",
      "name": "Ouk Seyha",
      "email": "seyha@pplogistics.com.kh",
      "event_type": "China Business Trip",
      "deal_value": 16000,
      "pax_count": 2
    }
  }'
\`\`\`

---

### 6. Machine-Readable OpenAPI 3.0 Specification
To import our endpoints directly into **Postman**, **Swagger UI**, **Zapier**, **Make**, or **n8n**, use:
- **OpenAPI JSON Endpoint**: \`${originUrl}/api/crm/openapi.json\`

---
*Generated by KHB BizTrip System v2.4.0 • Contact: tech@khbevents.com*
`;
}
