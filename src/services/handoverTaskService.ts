import { InboundWonLead, LeadHandoverTask, LeadOperationalStage } from '../types';

/**
 * Generates the standard 8-step Handover & Fulfillment Task Checklist
 * for newly ingested KHB CRM Business Trip & Trade Delegation Leads.
 */
export function generateDefaultHandoverTasks(
  lead: InboundWonLead,
  officerName = 'Sophea Chamnab (Operations Lead)'
): LeadHandoverTask[] {
  const departureDate = lead.departureDate || '2026-10-15';
  const targetCompany = lead.clientCompany || 'Trade Delegation';
  const paxCount = lead.paxCount || 1;

  // Calculate proportional milestone due dates prior to departure
  const depDateObj = new Date(departureDate);
  const addDays = (days: number) => {
    const d = new Date(depDateObj);
    d.setDate(d.getDate() + days);
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return [
    {
      id: `task_${Date.now()}_1`,
      title: `1. Intake Verification & Direct Leader Contact`,
      titleKm: `១. ផ្ទៀងផ្ទាត់ទិន្នន័យនាំចូល & ទាក់ទងប្រធានប្រតិភូ`,
      description: `Contact delegation leader ${lead.clientName} (${lead.clientPhone || lead.clientEmail}) from ${targetCompany}. Confirm group head count (${paxCount} Pax), room configuration, and specific trade mission objectives.`,
      category: 'lead_intake',
      assignedTo: lead.assignedAgent || officerName,
      assignedRole: 'Lead Coordinator',
      status: 'completed', // Auto-completed upon initial ingestion
      priority: 'high',
      dueDate: todayStr,
      completedAt: new Date().toISOString(),
      completedBy: 'System CRM Ingestion',
      isAutomatic: true,
      notes: `Ingested from CRM Deal ${lead.dealTitle || lead.crmLeadId}. Contact initiated.`,
    },
    {
      id: `task_${Date.now()}_2`,
      title: `2. Delegate Passport Collection & Manifest Verification`,
      titleKm: `២. ប្រមូលលិខិតឆ្លងដែន & បំពេញបញ្ជីឈ្មោះប្រតិភូ`,
      description: `Collect scanned passport bio pages for all ${paxCount} delegates. Ensure min 6 months validity from ${departureDate}, record dietary preferences (Halal/Veg/etc.), and assign room occupancy.`,
      category: 'manifest_passports',
      assignedTo: 'Manifest & Compliance Desk',
      assignedRole: 'Manifest Officer',
      status: lead.manifest && lead.manifest.length >= paxCount ? 'completed' : 'in_progress',
      priority: 'urgent',
      dueDate: addDays(-21),
      isAutomatic: false,
      notes: `${lead.manifest?.length || 0}/${paxCount} delegate profiles currently registered in manifest.`,
    },
    {
      id: `task_${Date.now()}_3`,
      title: `3. Business Visa & Canton Fair Badge Accreditation`,
      titleKm: `៣. ស្នើសុំទិដ្ឋាការជំនួញ & ប័ណ្ណចូលរួម Canton Fair`,
      description: `Process B2B visa invitation letters, submit official trade delegation paperwork, and pre-register buyer badges for ${lead.tripCategory}.`,
      category: 'visa_permits',
      assignedTo: 'Visa & Protocol Unit',
      assignedRole: 'Visa Specialist',
      status: 'pending',
      priority: 'high',
      dueDate: addDays(-14),
      isAutomatic: false,
      notes: `Government invitation and trade chamber accreditation submission required.`,
    },
    {
      id: `task_${Date.now()}_4`,
      title: `4. Airline Group Ticketing & Flight Manifest Lock`,
      titleKm: `៤. ចេញសំបុត្រយន្តហោះជាក្រុម & បញ្ជាក់ម៉ោងហោះហើរ`,
      description: `Finalize group flight bookings (e.g. Phnom Penh -> Destination), lock in seat allocation, confirm 30kg group baggage allowances, and issue e-ticket vouchers.`,
      category: 'flights_logistics',
      assignedTo: 'Aviation & Logistics Desk',
      assignedRole: 'Logistics Manager',
      status: lead.flightStatus ? 'in_progress' : 'pending',
      priority: 'high',
      dueDate: addDays(-10),
      isAutomatic: false,
      notes: `Carrier confirmation reference code linked to booking ${lead.bookingCode}.`,
    },
    {
      id: `task_${Date.now()}_5`,
      title: `5. Hotel Rooming List & VIP Ground Coach Dispatch`,
      titleKm: `៥. បញ្ជាក់បញ្ជីបន្ទប់សណ្ឋាគារ & រថយន្តដឹកជញ្ជូន VIP`,
      description: `Confirm 4/5-star executive hotel rooming roster (Single/Twin), banquet dining reservations, and assign bilingual driver + air-conditioned coach for city transit.`,
      category: 'hotel_rooming',
      assignedTo: 'Hospitality & Supplier Coordinator',
      assignedRole: 'Ground Operations',
      status: lead.hotelStatus ? 'in_progress' : 'pending',
      priority: 'medium',
      dueDate: addDays(-7),
      isAutomatic: false,
      notes: `Hotel confirmation voucher prepared for ${targetCompany}.`,
    },
    {
      id: `task_${Date.now()}_6`,
      title: `6. B2B Commercial Invoicing & Payment Settlement`,
      titleKm: `៦. ចេញវិក្កយបត្រពាណិជ្ជកម្ម & ផ្ទៀងផ្ទាត់ការទូទាត់ប្រាក់`,
      description: `Generate formal VAT tax invoice (${lead.invoiceId || 'INV-CRM'}), verify corporate wire transfer / card deposit ($${lead.dealValueUSD.toLocaleString()} USD), and issue official e-receipt.`,
      category: 'finance_invoice',
      assignedTo: 'Finance & Treasury Department',
      assignedRole: 'Finance Officer',
      status: lead.paymentStatus === 'fully_paid' ? 'completed' : lead.paymentStatus === 'deposit_paid' ? 'in_progress' : 'pending',
      priority: 'urgent',
      dueDate: addDays(-5),
      completedAt: lead.paymentStatus === 'fully_paid' ? new Date().toISOString() : undefined,
      isAutomatic: false,
      notes: `Current payment balance: $${lead.depositPaidUSD || 0} / $${lead.dealValueUSD} USD (${lead.paymentStatus.toUpperCase()}).`,
    },
    {
      id: `task_${Date.now()}_7`,
      title: `7. Pre-Departure Briefing & Digital Mission App Kit`,
      titleKm: `៧. សិក្ខាសាលាតម្រង់ទិសមុនចេញដំណើរ & ប្រគល់កញ្ចប់កម្មវិធី`,
      description: `Conduct pre-trip orientation via Zoom / In-Person, distribute physical lanyard badges, customs declaration guides, and activate digital mobile itinerary credentials.`,
      category: 'briefing_materials',
      assignedTo: officerName,
      assignedRole: 'Trip Director',
      status: 'pending',
      priority: 'medium',
      dueDate: addDays(-3),
      isAutomatic: false,
      notes: `Delegate onboarding package & emergency WhatsApp hotline setup.`,
    },
    {
      id: `task_${Date.now()}_8`,
      title: `8. 2-Way CRM Status Sync & Handover Closure Callback`,
      titleKm: `៨. ធ្វើបច្ចុប្បន្នភាពត្រឡប់ទៅ CRM (2-Way Webhook Sync)`,
      description: `Transmit operational readiness webhook callback to KHB CRM Master Center, recording successful handover and itinerary lock.`,
      category: 'crm_feedback',
      assignedTo: 'CRM Automation Engine',
      assignedRole: 'System Dispatcher',
      status: 'pending',
      priority: 'medium',
      dueDate: addDays(-1),
      isAutomatic: true,
      notes: `Ready for automated webhook feedback relay to KHB CRM API.`,
    },
  ];
}

/**
 * Calculates handover task completion stats
 */
export function calculateHandoverProgress(tasks?: LeadHandoverTask[]) {
  if (!tasks || tasks.length === 0) {
    return { total: 0, completed: 0, inProgress: 0, pending: 0, percent: 0 };
  }
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'pending' || t.status === 'blocked').length;
  const percent = Math.round((completed / total) * 100);

  return { total, completed, inProgress, pending, percent };
}

/**
 * Determines recommended next operational stage based on completed handover tasks
 */
export function getRecommendedStageFromTasks(
  tasks: LeadHandoverTask[],
  currentStage: LeadOperationalStage
): LeadOperationalStage {
  const completedCategories = new Set(
    tasks.filter(t => t.status === 'completed').map(t => t.category)
  );

  if (completedCategories.has('briefing_materials') && completedCategories.has('crm_feedback')) {
    return 'vouchers_dispatched';
  }
  if (completedCategories.has('finance_invoice')) {
    return 'finance_settled';
  }
  if (completedCategories.has('flights_logistics') && completedCategories.has('hotel_rooming')) {
    return 'logistics_confirmed';
  }
  if (completedCategories.has('manifest_passports')) {
    return 'manifest_pending';
  }
  return currentStage;
}

/**
 * Web Audio API Alert Chime Synthesizer
 * Produces a crisp, professional two-tone alert chime whenever an incoming CRM lead or notification arrives
 */
export function playNotificationChime(volume = 0.35) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: High crisp chime (e.g. 880Hz A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // Ramp to D6

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Tone 2: Harmonious ring (1318.51Hz E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);

    gain2.gain.setValueAtTime(0.01, now + 0.08);
    gain2.gain.linearRampToValueAtTime(volume * 0.75, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.65);
  } catch (e) {
    // AudioContext blocked by user policy or uninitialized — gracefully ignore
    console.debug('Notification audio chime muted:', e);
  }
}
