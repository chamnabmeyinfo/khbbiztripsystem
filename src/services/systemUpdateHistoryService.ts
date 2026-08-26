import { SystemSettings, SystemUpdateCategory, SystemUpdateChangeDiff, SystemUpdateHistoryRecord } from '../types';

export const INITIAL_SYSTEM_UPDATES: SystemUpdateHistoryRecord[] = [
  {
    id: 'upd_release_v520',
    version: 'v5.2.0',
    title: 'Settings Aside Navigation, Real-Time Translation Fix & Category Master CRUD',
    category: 'release_version',
    description: 'Redesigned the administrative settings workspace with a responsive left aside sidebar, resolved Khmer-to-English translation inversion, and implemented comprehensive Tour Category lifecycle management.',
    highlights: [
      'Interactive left aside sidebar with grouped modules, search filtering, and active state badges',
      'Bidirectional neural translation with 1-click dual sync buttons [🇰🇭➔🇺🇸 To EN] and [🇺🇸➔🇰🇭 To KM]',
      'Master Tour Package Category CRUD engine with customizable emojis, color badges, and bilingual naming',
      'Guaranteed bidirectional state synchronization for all *Km and *En multilingual fields'
    ],
    updatedBy: 'Chamnab Mey',
    updatedByRole: 'Super Admin & Founder',
    timestamp: '2026-08-25T20:30:00.000Z',
    source: 'system_release',
    status: 'applied'
  },
  {
    id: 'upd_release_v510',
    version: 'v5.1.0',
    title: 'Inbound CRM Webhook Automation & Corporate Telegram Channel Bot',
    category: 'crm_integration',
    description: 'Introduced self-service CRM integration architecture, live OpenAPI 3.0 specs, inbound lead webhook listener, and real-time Telegram bot dispatches.',
    highlights: [
      'Inbound webhook receiver for external CRM deal-won triggers (/api/webhooks/crm-leads)',
      'Automated delegate profile, booking, and preliminary invoice provisioning from won deals',
      'Telegram Bot push broadcasts on booking confirmations, customer payments, and delegate check-ins',
      'Fine-grained departmental RBAC clearances across 15 operational modules'
    ],
    updatedBy: 'Tim Vutha',
    updatedByRole: 'Chief Executive Officer',
    timestamp: '2026-08-20T14:15:00.000Z',
    source: 'system_release',
    status: 'applied'
  },
  {
    id: 'upd_release_v500',
    version: 'v5.0.0',
    title: 'Back-Office ERP Engine, Multi-Currency Settlement & Procurement Workflow',
    category: 'currency_pricing',
    description: 'Built the complete enterprise procurement and financial reconciliation ecosystem with live currency exchange rates for USD, KHR, EUR, CNY, VND, THB, and JPY.',
    highlights: [
      'Trip costing matrix with fixed & variable margin calculations per adult/child',
      'Supplier management and automated Purchase Order (PO) generation',
      'Real-time FX conversion with Cambodian Riel (KHR) National Bank parity',
      'Comprehensive Profit & Loss (P&L) and monthly cash flow reconciliation'
    ],
    updatedBy: 'Chamnab Mey',
    updatedByRole: 'Super Admin',
    timestamp: '2026-08-10T09:00:00.000Z',
    source: 'system_release',
    status: 'applied'
  },
  {
    id: 'upd_release_v480',
    version: 'v4.8.0',
    title: 'Multi-Language Delegation Portals & Biometric Passkey Authentication',
    category: 'i18n_translation',
    description: 'Launched support for 12 international delegation languages and WebAuthn biometric security credentials.',
    highlights: [
      'Full localization engine supporting Khmer, English, Chinese, Vietnamese, Thai, Japanese, and French',
      'FIDO2 / WebAuthn biometric fingerprint and FaceID passkey sign-in',
      'Offline caching service worker for delegate itinerary inspection during flights'
    ],
    updatedBy: 'Sophea Chamnab',
    updatedByRole: 'Operations Manager',
    timestamp: '2026-07-28T11:45:00.000Z',
    source: 'system_release',
    status: 'applied'
  }
];

export const CATEGORY_METADATA: Record<SystemUpdateCategory, { label: string; bg: string; text: string; border: string; icon: string }> = {
  system_settings: {
    label: 'System Settings',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: '⚙️'
  },
  feature_toggle: {
    label: 'Feature Toggles',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: '🎛️'
  },
  branding_theme: {
    label: 'Branding & Theme',
    bg: 'bg-pink-50 dark:bg-pink-950/60',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-800',
    icon: '🎨'
  },
  currency_pricing: {
    label: 'Financial & Pricing',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '💰'
  },
  payment_gateway: {
    label: 'Payment Gateways',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    icon: '💳'
  },
  crm_integration: {
    label: 'CRM & Webhooks',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: '🔌'
  },
  package_catalog: {
    label: 'Package Catalog',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: '📦'
  },
  category_manage: {
    label: 'Tour Categories',
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    icon: '🏷️'
  },
  security_access: {
    label: 'Security & Access',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    icon: '🛡️'
  },
  i18n_translation: {
    label: 'Languages & i18n',
    bg: 'bg-cyan-50 dark:bg-cyan-950/60',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    icon: '🌐'
  },
  release_version: {
    label: 'Official Release',
    bg: 'bg-violet-50 dark:bg-violet-950/60',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
    icon: '🚀'
  },
  database_sync: {
    label: 'Database & Sync',
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    icon: '🗄️'
  },
  manual_maintenance: {
    label: 'Maintenance & Notes',
    bg: 'bg-orange-50 dark:bg-orange-950/60',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    icon: '📝'
  }
};

export function formatFieldName(key: string): string {
  // Convert camelCase or dot.notation to human-readable Title
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[._]/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function formatFieldValue(val: any): string {
  if (val === undefined || val === null) return 'None';
  if (typeof val === 'boolean') return val ? 'Enabled (ON)' : 'Disabled (OFF)';
  if (typeof val === 'object') {
    if (Array.isArray(val)) return `[${val.length} items]`;
    return JSON.stringify(val);
  }
  return String(val);
}

export function computeSettingsDiff(
  prev: SystemSettings,
  updates: Partial<SystemSettings>
): SystemUpdateChangeDiff[] {
  const diffs: SystemUpdateChangeDiff[] = [];

  Object.entries(updates).forEach(([key, newVal]) => {
    if (key === 'paymentGateways' && newVal && typeof newVal === 'object') {
      const prevGateways = prev.paymentGateways || {};
      const newGateways = newVal as Record<string, boolean>;
      Object.entries(newGateways).forEach(([gwKey, gwVal]) => {
        const oldGwVal = (prevGateways as any)[gwKey];
        if (oldGwVal !== gwVal) {
          diffs.push({
            field: `paymentGateways.${gwKey}`,
            fieldLabel: `Payment Gateway: ${formatFieldName(gwKey)}`,
            oldValue: oldGwVal,
            newValue: gwVal,
            type: 'modified'
          });
        }
      });
    } else {
      const oldVal = (prev as any)[key];
      const isDifferent =
        typeof newVal === 'object' && newVal !== null
          ? JSON.stringify(oldVal) !== JSON.stringify(newVal)
          : oldVal !== newVal;

      if (isDifferent) {
        diffs.push({
          field: key,
          fieldLabel: formatFieldName(key),
          oldValue: oldVal,
          newValue: newVal,
          type: oldVal === undefined ? 'added' : newVal === undefined ? 'removed' : 'modified'
        });
      }
    }
  });

  return diffs;
}

export function deriveCategoryFromChanges(changes: SystemUpdateChangeDiff[]): SystemUpdateCategory {
  if (changes.some(c => c.field.startsWith('enable') && typeof c.newValue === 'boolean')) {
    return 'feature_toggle';
  }
  if (changes.some(c => c.field.startsWith('paymentGateways'))) {
    return 'payment_gateway';
  }
  if (changes.some(c => c.field.includes('Color') || c.field.includes('theme') || c.field.includes('font') || c.field.includes('Logo') || c.field.includes('Banner'))) {
    return 'branding_theme';
  }
  if (changes.some(c => c.field.includes('crm') || c.field.includes('Crm'))) {
    return 'crm_integration';
  }
  if (changes.some(c => c.field.includes('tax') || c.field.includes('Margin') || c.field.includes('Discount') || c.field.includes('Price'))) {
    return 'currency_pricing';
  }
  if (changes.some(c => c.field.includes('Language') || c.field.includes('Translation'))) {
    return 'i18n_translation';
  }
  if (changes.some(c => c.field.includes('restrict') || c.field.includes('allowed') || c.field.includes('Biometric'))) {
    return 'security_access';
  }
  return 'system_settings';
}

export function generateUpdateTitle(changes: SystemUpdateChangeDiff[], category: SystemUpdateCategory): string {
  if (changes.length === 0) return 'System Configuration Updated';
  if (changes.length === 1) {
    const change = changes[0];
    if (typeof change.newValue === 'boolean') {
      return `${change.newValue ? 'Enabled' : 'Disabled'} ${change.fieldLabel || change.field}`;
    }
    return `Updated ${change.fieldLabel || change.field}`;
  }
  const topNames = changes.slice(0, 2).map(c => c.fieldLabel || c.field).join(', ');
  const remainder = changes.length - 2;
  return `Updated ${topNames}${remainder > 0 ? ` +${remainder} more settings` : ''}`;
}

export function generateUpdateSummary(changes: SystemUpdateChangeDiff[]): string {
  if (changes.length === 0) return 'Applied system configuration updates.';
  return changes
    .map(c => `${c.fieldLabel || c.field}: ${formatFieldValue(c.oldValue)} ➔ ${formatFieldValue(c.newValue)}`)
    .join(' • ');
}

// ── Export Generators ──────────────────────────────────────────────────────────

export function exportSystemUpdatesJSON(records: SystemUpdateHistoryRecord[]) {
  const exportPayload = {
    system: 'KHB Enterprise Business Trip System',
    exportedAt: new Date().toISOString(),
    totalUpdatesCount: records.length,
    updateHistory: records
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KHB-System-Update-History-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSystemUpdatesCSV(records: SystemUpdateHistoryRecord[]) {
  const headers = ['ID', 'Version', 'Timestamp', 'Category', 'Title', 'Updated By', 'Status', 'Description', 'Changes Count'];
  const rows = records.map(r => [
    `"${r.id}"`,
    `"${r.version || 'Live'}"`,
    `"${r.timestamp}"`,
    `"${r.category}"`,
    `"${r.title.replace(/"/g, '""')}"`,
    `"${r.updatedBy}"`,
    `"${r.status}"`,
    `"${r.description.replace(/"/g, '""')}"`,
    r.changes?.length || 0
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KHB-System-Update-History-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSystemUpdatesMarkdown(records: SystemUpdateHistoryRecord[]) {
  let md = `# KHB Enterprise Business Trip System\n## System Update & Modification History Ledger\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;

  records.forEach((rec, idx) => {
    md += `### ${idx + 1}. [${rec.version || 'Config Update'}] ${rec.title}\n`;
    md += `- **Date/Time:** ${new Date(rec.timestamp).toLocaleString()}\n`;
    md += `- **Category:** ${CATEGORY_METADATA[rec.category]?.label || rec.category}\n`;
    md += `- **Author:** ${rec.updatedBy} (${rec.updatedByRole || 'Admin'})\n`;
    md += `- **Status:** ${rec.status.toUpperCase()}\n\n`;
    md += `**Description:**\n${rec.description}\n\n`;

    if (rec.highlights && rec.highlights.length > 0) {
      md += `**Key Highlights:**\n`;
      rec.highlights.forEach(h => {
        md += `- ${h}\n`;
      });
      md += '\n';
    }

    if (rec.changes && rec.changes.length > 0) {
      md += `**Detailed Changes (${rec.changes.length}):**\n`;
      rec.changes.forEach(c => {
        md += `- **${c.fieldLabel || c.field}:** \`${formatFieldValue(c.oldValue)}\` ➔ \`${formatFieldValue(c.newValue)}\`\n`;
      });
      md += '\n';
    }
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KHB-System-Changelog-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
