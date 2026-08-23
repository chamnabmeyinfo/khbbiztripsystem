import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  InboundWonLead,
  LeadPassenger,
  LeadOperationalStage,
} from '../../types';
import {
  Users,
  Building2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Send,
  Webhook,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileText,
  Plane,
  Hotel,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Printer,
  QrCode,
  Download,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  MessageSquare
} from 'lucide-react';

const STAGE_CONFIG: Record<
  LeadOperationalStage,
  { labelEn: string; labelKm: string; color: string; badgeBg: string; badgeText: string; icon: React.ComponentType<{ className?: string }> }
> = {
  won_ingested: {
    labelEn: 'Won & Ingested',
    labelKm: 'ទទួលបានពី CRM',
    color: 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/60',
    badgeText: 'text-sky-700 dark:text-sky-300',
    icon: Webhook,
  },
  manifest_pending: {
    labelEn: 'Manifest & Passports',
    labelKm: 'រៀបចំបញ្ជីលិខិតឆ្លងដែន',
    color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    icon: Users,
  },
  logistics_confirmed: {
    labelEn: 'Logistics & Flights',
    labelKm: 'សំបុត្រយន្តហោះ & សណ្ឋាគារ',
    color: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    icon: Plane,
  },
  finance_settled: {
    labelEn: 'Payment Verified',
    labelKm: 'ផ្ទៀងផ្ទាត់ការទូទាត់ប្រាក់',
    color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    icon: DollarSign,
  },
  vouchers_dispatched: {
    labelEn: 'Vouchers Dispatched',
    labelKm: 'បានចេញប័ណ្ណកម្មវិធី (Ready)',
    color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    icon: Award,
  },
  trip_completed: {
    labelEn: 'Mission Completed',
    labelKm: 'បេសកកម្មបានបញ្ចប់',
    color: 'border-slate-500 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    icon: CheckCircle2,
  },
};

const STAGES_LIST: LeadOperationalStage[] = [
  'won_ingested',
  'manifest_pending',
  'logistics_confirmed',
  'finance_settled',
  'vouchers_dispatched',
  'trip_completed',
];

export const InboundWonLeadsSection: React.FC = () => {
  const {
    inboundLeads,
    addInboundLead,
    updateInboundLead,
    updateLeadOperationalStage,
    updateLeadManifest,
    syncLeadToCrm,
    deleteInboundLead,
    bookings,
    invoices,
    packages,
    simulateWebhookTrigger,
    addNotification,
    language,
  } = useApp();

  const isKm = language === 'km';

  // Filters & View State
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Selected Lead Modal State
  const [selectedLead, setSelectedLead] = useState<InboundWonLead | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'manifest' | 'logistics' | 'finance' | 'crm_sync' | 'badges'>('overview');

  // Passenger Editing State inside Modal
  const [isAddingPassenger, setIsAddingPassenger] = useState(false);
  const [newPaxName, setNewPaxName] = useState('');
  const [newPaxJobTitle, setNewPaxJobTitle] = useState('');
  const [newPaxPassport, setNewPaxPassport] = useState('');
  const [newPaxExpiry, setNewPaxExpiry] = useState('');
  const [newPaxDiet, setNewPaxDiet] = useState('No restrictions');
  const [newPaxRoom, setNewPaxRoom] = useState<'single' | 'twin_share' | 'deluxe_suite'>('single');
  const [newPaxPhone, setNewPaxPhone] = useState('');
  const [newPaxEmail, setNewPaxEmail] = useState('');

  // 2-Way Sync in Progress state
  const [syncingEventType, setSyncingEventType] = useState<string | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return inboundLeads.filter(lead => {
      const matchesSearch =
        lead.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.assignedAgent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.tripCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.crmLeadId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = stageFilter === 'all' || lead.operationalStage === stageFilter;
      const matchesCategory = categoryFilter === 'all' || lead.tripCategory.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesStage && matchesCategory;
    });
  }, [inboundLeads, searchTerm, stageFilter, categoryFilter]);

  // Aggregate Metrics
  const totalPipelineUSD = useMemo(() => {
    return inboundLeads.reduce((sum, l) => sum + (l.dealValueUSD || 0), 0);
  }, [inboundLeads]);

  const totalPaxCount = useMemo(() => {
    return inboundLeads.reduce((sum, l) => sum + (l.paxCount || 1), 0);
  }, [inboundLeads]);

  const activeOperationsCount = useMemo(() => {
    return inboundLeads.filter(l => l.operationalStage !== 'trip_completed').length;
  }, [inboundLeads]);

  const manifestsCompletedCount = useMemo(() => {
    return inboundLeads.filter(l => l.manifest && l.manifest.length > 0 && l.manifest.every(p => !!p.passportNumber)).length;
  }, [inboundLeads]);

  // Categories list for filter dropdown
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    inboundLeads.forEach(l => {
      if (l.tripCategory) set.add(l.tripCategory);
    });
    return Array.from(set);
  }, [inboundLeads]);

  // Quick Simulation Preset Trigger
  const handleSimulateWonLead = async (preset: 'china' | 'canton' | 'vietnam') => {
    const timestamp = Date.now();
    let leadData: any;

    if (preset === 'china') {
      leadData = {
        crm_lead_id: `lead_${timestamp}_chn`,
        name: 'Ouk Seyha',
        company: 'Phnom Penh Logistics Group',
        email: `seyha_${timestamp.toString().slice(-4)}@pplogistics.com.kh`,
        phone: '+855 12 888 999',
        event_type: 'China Business Trip',
        deal_value: 16000,
        commission_rate: 0.08,
        status: 'Won',
        assigned_agent: 'Sophea Chamnab',
        booking_reference: `KHB-TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        pax_count: 4,
        tour_departure_date: '2026-10-15',
        notes: 'Client requested 4 VIP executive delegation passes with translator support.',
      };
    } else if (preset === 'canton') {
      leadData = {
        crm_lead_id: `lead_${timestamp}_ctn`,
        name: 'Chea Sokhom',
        company: 'Mekong Agro-Industrial Export Co.',
        email: `sokhom_${timestamp.toString().slice(-4)}@mekongagro.com.kh`,
        phone: '+855 16 999 111',
        event_type: 'Canton Fair Phase 1',
        deal_value: 9600,
        commission_rate: 0.08,
        status: 'Won',
        assigned_agent: 'Kosal Vireak',
        booking_reference: `KHB-TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        pax_count: 3,
        tour_departure_date: '2026-10-15',
        notes: 'Paid in full via Bank Wire. Sourcing industrial processing equipment in Hall 8.',
      };
    } else {
      leadData = {
        crm_lead_id: `lead_${timestamp}_vtn`,
        name: 'Ly Bunheng',
        company: 'Angkor Tech & Green Energy Ltd',
        email: `bunheng_${timestamp.toString().slice(-4)}@angkortech.com.kh`,
        phone: '+855 77 444 888',
        event_type: 'Vietnam Business Trip',
        deal_value: 5400,
        commission_rate: 0.08,
        status: 'Won',
        assigned_agent: 'Sophea Chamnab',
        booking_reference: `KHB-TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        pax_count: 2,
        tour_departure_date: '2026-11-05',
        notes: 'B2B Renewable Energy and Smart Solar Matchmaking Session.',
      };
    }

    await simulateWebhookTrigger(
      'lead.won',
      { event: 'lead.won', data: leadData },
      'KHB_EVENTS_CRM',
      `Simulated Won Deal: ${leadData.company} ($${leadData.deal_value})`
    );
  };

  // Add Passenger to Manifest
  const handleAddPassenger = () => {
    if (!selectedLead || !newPaxName.trim()) return;

    const newPax: LeadPassenger = {
      id: `pax_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: newPaxName.trim(),
      jobTitle: newPaxJobTitle.trim() || 'Delegate',
      passportNumber: newPaxPassport.trim(),
      passportExpiry: newPaxExpiry.trim(),
      nationality: 'Cambodian',
      dietaryRequirement: newPaxDiet,
      roomType: newPaxRoom,
      phone: newPaxPhone.trim(),
      email: newPaxEmail.trim(),
      badgeIssued: false,
    };

    const updatedManifest = [...(selectedLead.manifest || []), newPax];
    updateLeadManifest(selectedLead.id, updatedManifest);

    setSelectedLead({
      ...selectedLead,
      manifest: updatedManifest,
      paxCount: updatedManifest.length,
    });

    setNewPaxName('');
    setNewPaxJobTitle('');
    setNewPaxPassport('');
    setNewPaxExpiry('');
    setNewPaxPhone('');
    setNewPaxEmail('');
    setIsAddingPassenger(false);

    addNotification('Passenger Added', `Added ${newPax.name} to manifest (${selectedLead.bookingCode}).`, 'booking');
  };

  // Delete Passenger from Manifest
  const handleDeletePassenger = (paxId: string) => {
    if (!selectedLead) return;
    const updatedManifest = (selectedLead.manifest || []).filter(p => p.id !== paxId);
    updateLeadManifest(selectedLead.id, updatedManifest);
    setSelectedLead({
      ...selectedLead,
      manifest: updatedManifest,
      paxCount: updatedManifest.length,
    });
  };

  // Toggle Badge Issued Status
  const handleToggleBadgeIssued = (paxId: string) => {
    if (!selectedLead) return;
    const updatedManifest = (selectedLead.manifest || []).map(p =>
      p.id === paxId ? { ...p, badgeIssued: !p.badgeIssued } : p
    );
    updateLeadManifest(selectedLead.id, updatedManifest);
    setSelectedLead({
      ...selectedLead,
      manifest: updatedManifest,
    });
  };

  // Trigger 2-Way Sync back to CRM
  const handleTrigger2WaySync = async (
    eventType: 'trip.booking_confirmed' | 'trip.passenger_manifest_updated' | 'trip.payment_confirmed'
  ) => {
    if (!selectedLead) return;
    setSyncingEventType(eventType);
    try {
      const res = await syncLeadToCrm(selectedLead.id, eventType);
      if (res.success) {
        setSelectedLead(prev => prev ? { ...prev, crmSyncStatus: 'synced', lastSyncedAt: new Date().toISOString() } : null);
      }
    } finally {
      setSyncingEventType(null);
    }
  };

  // Advance Stage
  const handleAdvanceStage = (lead: InboundWonLead, newStage: LeadOperationalStage) => {
    updateLeadOperationalStage(lead.id, newStage);
    if (selectedLead && selectedLead.id === lead.id) {
      setSelectedLead({ ...selectedLead, operationalStage: newStage });
    }
  };

  // Export Manifest CSV
  const handleExportManifestCSV = (lead?: InboundWonLead) => {
    const targetLeads = lead ? [lead] : inboundLeads;
    const headers = [
      'Booking Code',
      'Company',
      'Lead Contact',
      'Trip Category',
      'Departure Date',
      'Passenger Name',
      'Job Title',
      'Passport Number',
      'Passport Expiry',
      'Dietary Requirements',
      'Room Type',
      'Badge Issued',
    ];

    const rows: any[] = [];
    targetLeads.forEach(l => {
      if (l.manifest && l.manifest.length > 0) {
        l.manifest.forEach(p => {
          rows.push([
            l.bookingCode,
            `"${l.clientCompany}"`,
            `"${l.clientName}"`,
            `"${l.tripCategory}"`,
            l.departureDate,
            `"${p.name}"`,
            `"${p.jobTitle || 'Delegate'}"`,
            p.passportNumber || 'N/A',
            p.passportExpiry || 'N/A',
            `"${p.dietaryRequirement || 'None'}"`,
            p.roomType || 'single',
            p.badgeIssued ? 'YES' : 'NO',
          ]);
        });
      } else {
        rows.push([
          l.bookingCode,
          `"${l.clientCompany}"`,
          `"${l.clientName}"`,
          `"${l.tripCategory}"`,
          l.departureDate,
          `"${l.clientName}"`,
          'Lead Delegate',
          'Pending',
          'Pending',
          'None',
          'single',
          'NO',
        ]);
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KHB_Delegation_Manifest_${lead ? lead.bookingCode : 'ALL'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Header & Summary KPIs ─── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isKm ? 'សមាហរណកម្ម CRM ផ្ទាល់' : 'Live CRM Won Leads Hub'}
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {isKm ? 'គ្រប់គ្រងប្រតិភូនាំចូលពី CRM (Won Leads Operations)' : 'Inbound CRM Won Leads & Delegation Hub'}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {isKm
                  ? 'រៀបចំចាត់ចែងគណៈប្រតិភូពាណិជ្ជកម្មដែលបានបិទការលក់ (Won) ពី CRM ដោយស្វ័យប្រវត្តិ គ្រប់គ្រងបញ្ជីលិខិតឆ្លងដែន សំបុត្រយន្តហោះ សណ្ឋាគារ និងធ្វើសមកាលកម្មទិន្នន័យត្រឡប់ទៅវិញ។'
                  : 'Automate post-sale operations for deals closed in KHB CRM. Manage traveler manifests, passport compliance, flight/hotel allocations, tax invoices, and 2-way CRM synchronization.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="dropdown relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer">
                  <Sparkles className="w-4 h-4" />
                  <span>{isKm ? 'តេស្តនាំចូលពី CRM' : 'Simulate Won Lead'}</span>
                </button>
                <div className="absolute right-0 mt-1 w-64 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 text-xs">
                  <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {isKm ? 'ជ្រើសរើសគំរូកិច្ចសន្យា' : 'Select Ingestion Preset'}
                  </p>
                  <button
                    onClick={() => handleSimulateWonLead('china')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white font-semibold transition flex items-center justify-between"
                  >
                    <span>China Business Trip ($16k)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">4 Pax</span>
                  </button>
                  <button
                    onClick={() => handleSimulateWonLead('canton')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white font-semibold transition flex items-center justify-between"
                  >
                    <span>Canton Fair Phase 1 ($9.6k)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">3 Pax</span>
                  </button>
                  <button
                    onClick={() => handleSimulateWonLead('vietnam')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white font-semibold transition flex items-center justify-between"
                  >
                    <span>Vietnam Delegation ($5.4k)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">2 Pax</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleExportManifestCSV()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>{isKm ? 'ទាញយក Manifest CSV' : 'Export Manifest CSV'}</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>{isKm ? 'ចំនួនកិច្ចសន្យា Won' : 'Won Deals'}</span>
                <Webhook className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">{inboundLeads.length}</div>
              <div className="text-[11px] text-sky-300 font-medium">
                {totalPaxCount} {isKm ? 'សមាជិកប្រតិភូសរុប' : 'Total Delegates (Pax)'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>{isKm ? 'ទំហំទឹកប្រាក់កិច្ចសន្យា' : 'Inbound Revenue'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-emerald-400">
                ${totalPipelineUSD.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-300 font-medium">
                {isKm ? 'ពីប្រព័ន្ធ KHB CRM' : 'Closed Deal Pipeline'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>{isKm ? 'ប្រតិបត្តិការកំពុងដើរ' : 'Active Delegations'}</span>
                <Plane className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-amber-400">{activeOperationsCount}</div>
              <div className="text-[11px] text-amber-300 font-medium">
                {isKm ? 'កំពុងដំណើរការប្រតិបត្តិការ' : 'Operations in Progress'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>{isKm ? 'លិខិតឆ្លងដែនរួចរាល់' : 'Passport Ready'}</span>
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-purple-400">
                {manifestsCompletedCount}/{inboundLeads.length || 1}
              </div>
              <div className="text-[11px] text-purple-300 font-medium">
                {isKm ? 'បានផ្ទៀងផ្ទាត់លិខិតឆ្លងដែន' : 'Manifest Verified'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar & View Toggle ─── */}
      <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isKm ? 'ស្វែងរកតាមក្រុមហ៊ុន ឈ្មោះ កូដកក់ ឬភ្នាក់ងារ...' : 'Search by company, delegate, booking code...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">{isKm ? 'គ្រប់ដំណាក់កាល (All Stages)' : 'All Operational Stages'}</option>
              {STAGES_LIST.map(st => (
                <option key={st} value={st}>
                  {isKm ? STAGE_CONFIG[st].labelKm : STAGE_CONFIG[st].labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          {categoriesList.length > 0 && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">{isKm ? 'គ្រប់កម្មវិធីបេសកកម្ម (All Trips)' : 'All Trip Categories'}</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-end md:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kanban Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Table / Manifest</span>
          </button>
        </div>
      </div>

      {/* ─── KANBAN BOARD VIEW ─── */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STAGES_LIST.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.operationalStage === stage);
            const stageCfg = STAGE_CONFIG[stage];
            const Icon = stageCfg.icon;

            return (
              <div
                key={stage}
                className="flex flex-col rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 min-h-[380px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">
                      {isKm ? stageCfg.labelKm : stageCfg.labelEn}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${stageCfg.badgeBg} ${stageCfg.badgeText}`}>
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-[11px] text-slate-400 font-medium">{isKm ? 'គ្មានទិន្នន័យ' : 'No delegations in this stage'}</p>
                    </div>
                  ) : (
                    stageLeads.map(lead => {
                      const manifestCount = lead.manifest?.length || 0;
                      const verifiedPassportCount = lead.manifest?.filter(p => !!p.passportNumber).length || 0;
                      const isManifestComplete = manifestCount > 0 && verifiedPassportCount === manifestCount;

                      return (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setDetailTab('overview');
                          }}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 hover:border-sky-500/80 dark:hover:border-sky-400 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                              {lead.bookingCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {lead.departureDate}
                            </span>
                          </div>

                          {/* Company & Name */}
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                              {lead.clientCompany}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {lead.clientName} • <span className="font-semibold text-slate-600 dark:text-slate-300">{lead.tripCategory}</span>
                            </p>
                          </div>

                          {/* Key Metrics */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60">
                            <div className="font-black text-emerald-600 dark:text-emerald-400">
                              ${lead.dealValueUSD?.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <Users className="w-3 h-3" />
                              <span className="font-bold">{lead.paxCount} Pax</span>
                            </div>
                          </div>

                          {/* Manifest Progress Bar */}
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Manifest:</span>
                              <span className={isManifestComplete ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                                {verifiedPassportCount}/{lead.paxCount} Passports
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  isManifestComplete ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, (verifiedPassportCount / (lead.paxCount || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Stage Transition Shortcut */}
                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            <span className="text-slate-400">Agent: <span className="font-medium text-slate-600 dark:text-slate-300">{lead.assignedAgent.split(' ')[0]}</span></span>
                            {stage !== 'trip_completed' && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  const currentIndex = STAGES_LIST.indexOf(stage);
                                  if (currentIndex < STAGES_LIST.length - 1) {
                                    handleAdvanceStage(lead, STAGES_LIST[currentIndex + 1]);
                                  }
                                }}
                                className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold hover:underline"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TABLE / MANIFEST VIEW ─── */}
      {viewMode === 'table' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Booking Code</th>
                  <th className="pb-3">Company & Contact</th>
                  <th className="pb-3">Trip Category</th>
                  <th className="pb-3">Departure</th>
                  <th className="pb-3">Pax</th>
                  <th className="pb-3">Deal Value</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3">CRM Sync</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                      {isKm ? 'រកមិនឃើញទិន្នន័យគណៈប្រតិភូដែលត្រូវនឹងការស្វែងរកទេ' : 'No inbound delegations found matching your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => {
                    const stageCfg = STAGE_CONFIG[lead.operationalStage];
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {lead.bookingCode}
                        </td>
                        <td className="py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{lead.clientCompany}</div>
                          <div className="text-[11px] text-slate-400">{lead.clientName} • {lead.clientPhone}</div>
                        </td>
                        <td className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {lead.tripCategory}
                        </td>
                        <td className="py-3.5 font-mono text-slate-500 dark:text-slate-400">
                          {lead.departureDate}
                        </td>
                        <td className="py-3.5 font-bold text-slate-700 dark:text-slate-300">
                          {lead.paxCount} Pax
                        </td>
                        <td className="py-3.5 font-black text-emerald-600 dark:text-emerald-400">
                          ${lead.dealValueUSD?.toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${stageCfg.badgeBg} ${stageCfg.badgeText}`}>
                            {isKm ? stageCfg.labelKm : stageCfg.labelEn}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {isKm ? 'បានភ្ជាប់' : 'Synced'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setDetailTab('overview');
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 rounded-lg hover:bg-sky-100 transition"
                          >
                            {isKm ? 'មើលលម្អិត' : 'Manage'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── LEAD DETAIL & MANAGEMENT MODAL / DRAWER ─── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                    {selectedLead.bookingCode}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STAGE_CONFIG[selectedLead.operationalStage].badgeBg} ${STAGE_CONFIG[selectedLead.operationalStage].badgeText}`}>
                    {isKm ? STAGE_CONFIG[selectedLead.operationalStage].labelKm : STAGE_CONFIG[selectedLead.operationalStage].labelEn}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  {selectedLead.clientCompany} ({selectedLead.clientName})
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedLead.tripCategory} • CRM Lead ID: <span className="font-mono text-slate-300">{selectedLead.crmLeadId}</span> • Agent: <span className="text-slate-300">{selectedLead.assignedAgent}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto text-xs">
              <button
                onClick={() => setDetailTab('overview')}
                className={`pb-3 font-bold transition border-b-2 ${
                  detailTab === 'overview'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {isKm ? 'ព័ត៌មានទូទៅ' : 'Overview & Details'}
              </button>
              <button
                onClick={() => setDetailTab('manifest')}
                className={`pb-3 font-bold transition border-b-2 flex items-center gap-1.5 ${
                  detailTab === 'manifest'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isKm ? 'បញ្ជីលិខិតឆ្លងដែន' : 'Passenger Manifest'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
                  {selectedLead.manifest?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setDetailTab('logistics')}
                className={`pb-3 font-bold transition border-b-2 flex items-center gap-1.5 ${
                  detailTab === 'logistics'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>{isKm ? 'ជើងហោះហើរ & សណ្ឋាគារ' : 'Logistics & Vouchers'}</span>
              </button>
              <button
                onClick={() => setDetailTab('badges')}
                className={`pb-3 font-bold transition border-b-2 flex items-center gap-1.5 ${
                  detailTab === 'badges'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isKm ? 'បោះពុម្ពប័ណ្ណប្រតិភូ' : 'Delegate Badges'}</span>
              </button>
              <button
                onClick={() => setDetailTab('crm_sync')}
                className={`pb-3 font-bold transition border-b-2 flex items-center gap-1.5 ${
                  detailTab === 'crm_sync'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Webhook className="w-3.5 h-3.5" />
                <span>{isKm ? 'សមកាលកម្ម CRM (2-Way)' : '2-Way CRM Sync'}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* ─── TAB 1: OVERVIEW ─── */}
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stage Advancement Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {isKm ? 'ផ្លាស់ប្តូរដំណាក់កាលប្រតិបត្តិការ' : 'Operational Lifecycle Stage'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {STAGES_LIST.map(stage => {
                        const isCurrent = selectedLead.operationalStage === stage;
                        const cfg = STAGE_CONFIG[stage];
                        return (
                          <button
                            key={stage}
                            onClick={() => handleAdvanceStage(selectedLead, stage)}
                            className={`p-2.5 rounded-xl text-xs font-bold transition text-left flex flex-col justify-between cursor-pointer border ${
                              isCurrent
                                ? 'bg-sky-500 text-white border-sky-600 shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                            }`}
                          >
                            <span className="text-[10px] opacity-80 uppercase">{stage.replace(/_/g, ' ')}</span>
                            <span className="mt-1 line-clamp-1">{isKm ? cfg.labelKm : cfg.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Client & Organization Info */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-sky-500" />
                        {isKm ? 'ព័ត៌មានក្រុមហ៊ុន & អ្នកទំនាក់ទំនង' : 'Client & Enterprise Details'}
                      </h4>
                      <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-700/60">
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'ក្រុមហ៊ុន' : 'Company'}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.clientCompany}</span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'ប្រធានប្រតិភូ' : 'Lead Delegate'}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.clientName}</span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'អ៊ីមែល' : 'Email'}:</span>
                          <span className="font-mono text-sky-600 dark:text-sky-400">{selectedLead.clientEmail}</span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'ទូរស័ព្ទ' : 'Phone'}:</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">{selectedLead.clientPhone}</span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'ភ្នាក់ងារលក់ (CRM)' : 'Sales Agent'}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.assignedAgent}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deal & Finance Summary */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        {isKm ? 'កិច្ចសន្យា & ហិរញ្ញវត្ថុ' : 'Deal Value & Settlement'}
                      </h4>
                      <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-700/60">
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'តម្លៃកិច្ចសន្យា' : 'Total Deal Value'}:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            ${selectedLead.dealValueUSD?.toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'ចំនួនប្រតិភូ (Pax)' : 'Delegates'}:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.paxCount} Pax</span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'កាលបរិច្ឆេទចេញដំណើរ' : 'Departure Date'}:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedLead.departureDate}</span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="text-slate-400">{isKm ? 'ស្ថានភាពទូទាត់' : 'Payment Status'}:</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                            {selectedLead.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Special Requests */}
                  {selectedLead.notes && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {isKm ? 'កំណត់សម្គាល់ពី CRM / តម្រូវការពិសេស' : 'Notes from CRM Sales Representative'}
                      </div>
                      <p className="text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                        {selectedLead.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 2: PASSENGER MANIFEST ─── */}
              {detailTab === 'manifest' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {isKm ? 'បញ្ជីឈ្មោះប្រតិភូ & លិខិតឆ្លងដែន' : 'Passenger Manifest & Passport Verification'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isKm
                          ? 'បន្ថែម កែប្រែ ឬផ្ទៀងផ្ទាត់លិខិតឆ្លងដែនរបស់គណៈប្រតិភូ ដើម្បីរៀបចំសំបុត្រយន្តហោះ និងសណ្ឋាគារ។'
                          : 'Compile and verify delegate passport credentials for flight booking, hotel rooming list, and consular visas.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingPassenger(!isAddingPassenger)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isKm ? 'បន្ថែមសមាជិក' : 'Add Passenger'}</span>
                    </button>
                  </div>

                  {/* Add Passenger Form */}
                  {isAddingPassenger && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        {isKm ? 'ព័ត៌មានសមាជិកប្រតិភូថ្មី' : 'New Passenger Details'}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Full Name *</label>
                          <input
                            type="text"
                            value={newPaxName}
                            onChange={e => setNewPaxName(e.target.value)}
                            placeholder="e.g. Ouk Seyha"
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Job Title</label>
                          <input
                            type="text"
                            value={newPaxJobTitle}
                            onChange={e => setNewPaxJobTitle(e.target.value)}
                            placeholder="e.g. Chief Executive Officer"
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Passport Number</label>
                          <input
                            type="text"
                            value={newPaxPassport}
                            onChange={e => setNewPaxPassport(e.target.value)}
                            placeholder="e.g. N10849201"
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Passport Expiry Date</label>
                          <input
                            type="date"
                            value={newPaxExpiry}
                            onChange={e => setNewPaxExpiry(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Dietary Needs</label>
                          <select
                            value={newPaxDiet}
                            onChange={e => setNewPaxDiet(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          >
                            <option value="No restrictions">No restrictions</option>
                            <option value="Halal">Halal (Strict)</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Seafood Only">Seafood Only</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1 font-semibold">Room Arrangement</label>
                          <select
                            value={newPaxRoom}
                            onChange={e => setNewPaxRoom(e.target.value as any)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          >
                            <option value="single">Single Occupancy (VIP)</option>
                            <option value="twin_share">Twin Sharing</option>
                            <option value="deluxe_suite">Executive Suite</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setIsAddingPassenger(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddPassenger}
                          className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow"
                        >
                          Save Passenger
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Passenger Manifest Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-2">#</th>
                          <th className="pb-2">Delegate Name</th>
                          <th className="pb-2">Job Title</th>
                          <th className="pb-2">Passport No.</th>
                          <th className="pb-2">Expiry</th>
                          <th className="pb-2">Diet</th>
                          <th className="pb-2">Room</th>
                          <th className="pb-2">Badge</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(!selectedLead.manifest || selectedLead.manifest.length === 0) ? (
                          <tr>
                            <td colSpan={9} className="py-6 text-center text-slate-400 font-medium">
                              {isKm ? 'មិនទាន់មានទិន្នន័យសមាជិកនៅឡើយទេ' : 'No passengers added to manifest yet.'}
                            </td>
                          </tr>
                        ) : (
                          selectedLead.manifest.map((pax, idx) => (
                            <tr key={pax.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-3 font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-3 font-bold text-slate-900 dark:text-white">{pax.name}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-300">{pax.jobTitle || 'Delegate'}</td>
                              <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {pax.passportNumber || <span className="text-amber-500">Pending</span>}
                              </td>
                              <td className="py-3 font-mono text-slate-500">{pax.passportExpiry || '—'}</td>
                              <td className="py-3 text-slate-600 dark:text-slate-300">{pax.dietaryRequirement || 'None'}</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                                  {pax.roomType || 'single'}
                                </span>
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() => handleToggleBadgeIssued(pax.id)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                    pax.badgeIssued
                                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  {pax.badgeIssued ? 'Issued' : 'Pending'}
                                </button>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleDeletePassenger(pax.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: LOGISTICS & VOUCHERS ─── */}
              {detailTab === 'logistics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Flight Status */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Plane className="w-4 h-4 text-sky-500" />
                        {isKm ? 'ការរៀបចំជើងហោះហើរ (Flight Logistics)' : 'Charter / Commercial Flight Allocation'}
                      </h4>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Flight:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {selectedLead.flightStatus?.flightNumber || 'TD 742 (TripDesk Global Skyways)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Route:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Phnom Penh (PNH) ➔ Guangzhou Baiyun (CAN)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className="font-bold text-emerald-500">
                            {selectedLead.flightStatus?.status || 'Scheduled & Reserved'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Hotel Allocation */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Hotel className="w-4 h-4 text-amber-500" />
                        {isKm ? 'សណ្ឋាគារ & ការស្នាក់នៅ' : 'Executive Hotel Reservation'}
                      </h4>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hotel:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedLead.hotelStatus?.hotelName || 'Guangzhou Marriott Hotel Pazhou (5-Star)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Confirmation Code:</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {selectedLead.hotelStatus?.confirmationCode || `HTL-CRM-${Math.floor(100000 + Math.random() * 900000)}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rooming:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Deluxe B2B Executive Room (Buffet Breakfast Incl.)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vouchers Download */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-indigo-950 dark:text-indigo-200">
                        {isKm ? 'ប័ណ្ណកម្មវិធីផ្លូវការ & កម្មវិធីលម្អិត (Official Vouchers)' : 'Official Delegation Itinerary Voucher & Agenda'}
                      </h4>
                      <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                        {isKm
                          ? 'ទាញយក ឬផ្ញើឯកសារ PDF កម្មវិធី និងប័ណ្ណស្វាគមន៍ទៅកាន់គណៈប្រតិភូ។'
                          : 'Printable digital voucher with emergency contacts, guide meeting point, and QR check-in.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleExportManifestCSV(selectedLead)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isKm ? 'ទាញយក PDF' : 'Download Dossier'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAB 4: DELEGATE BADGES ─── */}
              {detailTab === 'badges' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {isKm ? 'បោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនគណៈប្រតិភូ (Official Badges)' : 'Printable Delegate Credentials & Badges'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {isKm
                          ? 'ទម្រង់ប័ណ្ណផ្លូវការសម្រាប់ពាក់ចូលរួមពិព័រណ៍ និងជំនួបពាណិជ្ជកម្ម B2B។'
                          : 'Official executive delegation accreditation pass with QR verification.'}
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-sky-400" />
                      <span>{isKm ? 'បោះពុម្ពទាំងអស់' : 'Print All Badges'}</span>
                    </button>
                  </div>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {((selectedLead.manifest && selectedLead.manifest.length > 0) ? selectedLead.manifest : [
                      { id: 'p1', name: selectedLead.clientName, jobTitle: 'Executive Delegate Leader', passportNumber: 'N10849201' }
                    ]).map((pax, idx) => (
                      <div
                        key={pax.id || idx}
                        className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/40 shadow-xl relative overflow-hidden space-y-4"
                      >
                        <div className="flex items-start justify-between border-b border-indigo-800/60 pb-3">
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                              KHB TRADE MISSION 2026
                            </div>
                            <div className="text-xs font-black text-slate-200">
                              {selectedLead.tripCategory}
                            </div>
                          </div>
                          <QrCode className="w-8 h-8 text-sky-400" />
                        </div>

                        <div className="space-y-1">
                          <div className="text-lg font-black text-white">{pax.name}</div>
                          <div className="text-xs font-bold text-emerald-400">{pax.jobTitle || 'Executive Delegate'}</div>
                          <div className="text-xs text-slate-300 font-medium">{selectedLead.clientCompany}</div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-3 border-t border-indigo-800/60 font-mono text-slate-400">
                          <span>Ref: {selectedLead.bookingCode}</span>
                          <span>Passport: {pax.passportNumber || 'VERIFIED'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 5: 2-WAY CRM SYNC ─── */}
              {detailTab === 'crm_sync' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-sky-500" />
                      {isKm ? 'ធ្វើសមកាលកម្មទិន្នន័យត្រឡប់ទៅ KHB Events CRM' : 'Bidirectional CRM Dispatcher Gateway'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {isKm
                        ? 'បញ្ជូនបច្ចុប្បន្នភាពនៃបញ្ជីលិខិតឆ្លងដែន ការទូទាត់ប្រាក់ ឬការបញ្ជាក់ពីប្រតិបត្តិការត្រឡប់ទៅកាន់ប្រព័ន្ធ CRM វិញ។'
                        : 'Notify KHB Events CRM in real-time when customer manifests are finalized, payments are verified, or delegation passes are dispatched.'}
                    </p>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        1. Confirm Booking
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispatches <code className="font-mono text-sky-500">trip.booking_confirmed</code> event to CRM.
                      </p>
                      <button
                        onClick={() => handleTrigger2WaySync('trip.booking_confirmed')}
                        disabled={syncingEventType === 'trip.booking_confirmed'}
                        className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {syncingEventType === 'trip.booking_confirmed' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Dispatch Confirmation</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        2. Sync Manifest Passports
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispatches <code className="font-mono text-sky-500">trip.passenger_manifest_updated</code> with passport numbers.
                      </p>
                      <button
                        onClick={() => handleTrigger2WaySync('trip.passenger_manifest_updated')}
                        disabled={syncingEventType === 'trip.passenger_manifest_updated'}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {syncingEventType === 'trip.passenger_manifest_updated' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Users className="w-3.5 h-3.5" />
                        )}
                        <span>Sync Manifest</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        3. Confirm Payment Settlement
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispatches <code className="font-mono text-sky-500">trip.payment_confirmed</code> to update lead financials in CRM.
                      </p>
                      <button
                        onClick={() => handleTrigger2WaySync('trip.payment_confirmed')}
                        disabled={syncingEventType === 'trip.payment_confirmed'}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {syncingEventType === 'trip.payment_confirmed' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <DollarSign className="w-3.5 h-3.5" />
                        )}
                        <span>Dispatch Payment OK</span>
                      </button>
                    </div>
                  </div>

                  {/* Connection Status Box */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold">
                        {isKm ? 'ប្រព័ន្ធបានភ្ជាប់ជាមួយ KHB Events CRM រួចរាល់' : 'Connected to KHB Events CRM Gateway'}
                      </span>
                    </div>
                    <div className="font-mono text-slate-400">
                      Last Synced: {new Date(selectedLead.lastSyncedAt || selectedLead.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm(`Delete inbound lead ${selectedLead.bookingCode} (${selectedLead.clientCompany})?`)) {
                    deleteInboundLead(selectedLead.id);
                    setSelectedLead(null);
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 text-rose-500 hover:text-rose-700 text-xs font-bold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isKm ? 'លុបទិន្នន័យ' : 'Delete Lead'}</span>
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                {isKm ? 'បិទផ្ទាំង' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InboundWonLeadsSection;
