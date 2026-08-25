import { User, UserRole, PermissionKey, Department } from '../types';

export interface RoleConfig {
  id: UserRole;
  title: string;
  shortTitle: string;
  displayName?: string;
  description: string;
  department: Department;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeColor?: string;
  level: number; // 1 (Traveler) to 7 (Super Admin)
  defaultPermissions: PermissionKey[];
  permissions?: PermissionKey[];
  accessibleTabs: string[];
}

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Administration' | 'Operations' | 'Procurement' | 'Finances' | 'AI & System';
  riskLevel: 'critical' | 'high' | 'medium' | 'standard';
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Administration
  {
    key: 'users_view',
    label: 'View Users & Roles',
    description: 'Inspect corporate user list, roles, and assigned permissions.',
    category: 'Administration',
    riskLevel: 'standard'
  },
  {
    key: 'users_manage',
    label: 'Manage Users & Permissions',
    description: 'Create, invite, edit, suspend, or delete users and reassign roles.',
    category: 'Administration',
    riskLevel: 'critical'
  },
  {
    key: 'audit_logs_view',
    label: 'View Security Audit Logs',
    description: 'Inspect administrative audit trails and login security events.',
    category: 'Administration',
    riskLevel: 'high'
  },
  {
    key: 'system_settings_manage',
    label: 'Manage System Settings',
    description: 'Configure company profile, tax policies, currency rates, and data backup.',
    category: 'Administration',
    riskLevel: 'critical'
  },

  // Operations
  {
    key: 'crm_leads_view',
    label: 'View Inbound CRM Leads',
    description: 'Access the list of leads won from CRM, view delegate details and status.',
    category: 'Operations',
    riskLevel: 'standard'
  },
  {
    key: 'crm_leads_manage',
    label: 'Manage Inbound CRM Leads & Manifest',
    description: 'Advance operational stages, edit passenger manifests, and trigger 2-way CRM syncs.',
    category: 'Operations',
    riskLevel: 'high'
  },
  {
    key: 'packages_view',
    label: 'View Tour Packages',
    description: 'Browse package catalog, schedules, and itineraries.',
    category: 'Operations',
    riskLevel: 'standard'
  },
  {
    key: 'packages_manage',
    label: 'Manage Tour Packages',
    description: 'Create, update pricing, customize itineraries, and publish tour packages.',
    category: 'Operations',
    riskLevel: 'high'
  },
  {
    key: 'bookings_view',
    label: 'View Bookings',
    description: 'View customer reservations, delegate passenger lists, and status.',
    category: 'Operations',
    riskLevel: 'standard'
  },
  {
    key: 'bookings_manage',
    label: 'Manage Bookings & Vouchers',
    description: 'Approve bookings, modify travel dates, cancel trips, and issue official vouchers.',
    category: 'Operations',
    riskLevel: 'high'
  },
  {
    key: 'costing_view',
    label: 'View Cost Estimations',
    description: 'Inspect package cost templates and break-even calculations.',
    category: 'Operations',
    riskLevel: 'medium'
  },
  {
    key: 'costing_manage',
    label: 'Manage Costing & Margin Safeguards',
    description: 'Build supplier cost breakdowns, per-adult/per-child formulas, and set profit margins.',
    category: 'Operations',
    riskLevel: 'high'
  },
  {
    key: 'support_manage',
    label: 'Support & Concierge Desk',
    description: 'Respond to traveler inquiries, live chats, and broadcast emergency notifications.',
    category: 'Operations',
    riskLevel: 'standard'
  },

  // Procurement
  {
    key: 'suppliers_view',
    label: 'View Suppliers & Vendors',
    description: 'Access the registered hotels, airlines, guides, and ground transport directory.',
    category: 'Procurement',
    riskLevel: 'standard'
  },
  {
    key: 'suppliers_manage',
    label: 'Manage Suppliers & Vendor Terms',
    description: 'Onboard suppliers, configure Net 15/30/60 payment terms, and ratings.',
    category: 'Procurement',
    riskLevel: 'high'
  },
  {
    key: 'purchase_orders_view',
    label: 'View Purchase Orders',
    description: 'Browse supplier purchase orders and fulfillment tracking.',
    category: 'Procurement',
    riskLevel: 'standard'
  },
  {
    key: 'purchase_orders_manage',
    label: 'Manage & Issue Purchase Orders',
    description: 'Draft, approve, and issue contractual Purchase Orders (POs) to suppliers.',
    category: 'Procurement',
    riskLevel: 'high'
  },

  // Finances
  {
    key: 'finances_view',
    label: 'View Financial Summaries',
    description: 'Inspect P&L reports, Cash Flow statements, and statutory VAT invoices.',
    category: 'Finances',
    riskLevel: 'high'
  },
  {
    key: 'finances_manage',
    label: 'Manage Payments & Settlements',
    description: 'Record inbound customer payments and execute outbound supplier payouts.',
    category: 'Finances',
    riskLevel: 'critical'
  },
  {
    key: 'expenses_approve',
    label: 'Approve & Reimburse Expenses',
    description: 'Audit, approve, reject, and mark operational trip expenses as reimbursed.',
    category: 'Finances',
    riskLevel: 'high'
  },

  // AI & System
  {
    key: 'ai_copilot_access',
    label: 'Access AI Operations Copilot',
    description: 'Leverage the conversational AI ERP Copilot for rapid multi-entity actions.',
    category: 'AI & System',
    riskLevel: 'medium'
  }
];

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  super_admin: {
    id: 'super_admin',
    title: 'Super Administrator',
    shortTitle: 'Super Admin',
    displayName: 'Super Administrator',
    description: 'Unrestricted full access across all ERP modules, user management, security controls, and financial operations.',
    department: 'Executive Leadership',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-800',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    level: 7,
    defaultPermissions: ALL_PERMISSIONS.map(p => p.key),
    permissions: ALL_PERMISSIONS.map(p => p.key),
    accessibleTabs: [
      'overview',
      'users',
      'inbound_leads',
      'bookings',
      'packages',
      'costing',
      'profit_loss',
      'cash_flow',
      'invoices',
      'suppliers',
      'purchase_orders',
      'payments',
      'expenses',
      'recycle_bin',
      'crm',
      'ai_copilot',
      'settings'
    ]
  },
  admin: {
    id: 'admin',
    title: 'Executive Administrator',
    shortTitle: 'Admin',
    displayName: 'Executive Administrator',
    description: 'General back-office executive oversight with access to trips, suppliers, procurement, and finances.',
    department: 'Executive Leadership',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800',
    badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    level: 6,
    defaultPermissions: ALL_PERMISSIONS.map(p => p.key),
    permissions: ALL_PERMISSIONS.map(p => p.key),
    accessibleTabs: [
      'overview',
      'users',
      'inbound_leads',
      'bookings',
      'packages',
      'costing',
      'profit_loss',
      'cash_flow',
      'invoices',
      'suppliers',
      'purchase_orders',
      'payments',
      'expenses',
      'recycle_bin',
      'crm',
      'ai_copilot',
      'settings'
    ]
  },
  operations_manager: {
    id: 'operations_manager',
    title: 'Trip & Operations Manager',
    shortTitle: 'Operations',
    displayName: 'Trip & Operations Manager',
    description: 'Oversees expedition itineraries, bookings, traveler reservations, package costing, and vouchers.',
    department: 'Trip Operations',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    level: 5,
    defaultPermissions: [
      'crm_leads_view',
      'crm_leads_manage',
      'packages_view',
      'packages_manage',
      'bookings_view',
      'bookings_manage',
      'costing_view',
      'costing_manage',
      'suppliers_view',
      'support_manage',
      'ai_copilot_access'
    ],
    permissions: [
      'crm_leads_view',
      'crm_leads_manage',
      'packages_view',
      'packages_manage',
      'bookings_view',
      'bookings_manage',
      'costing_view',
      'costing_manage',
      'suppliers_view',
      'support_manage',
      'ai_copilot_access'
    ],
    accessibleTabs: [
      'overview',
      'inbound_leads',
      'packages',
      'bookings',
      'costing',
      'suppliers',
      'invoices',
      'crm',
      'ai_copilot'
    ]
  },
  procurement_officer: {
    id: 'procurement_officer',
    title: 'Procurement & Vendor Manager',
    shortTitle: 'Procurement',
    displayName: 'Procurement & Vendor Manager',
    description: 'Manages supplier relationships, hotel/transport agreements, contractual Purchase Orders, and vendor terms.',
    department: 'Procurement & Sourcing',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    level: 4,
    defaultPermissions: [
      'suppliers_view',
      'suppliers_manage',
      'purchase_orders_view',
      'purchase_orders_manage',
      'costing_view',
      'packages_view',
      'ai_copilot_access'
    ],
    permissions: [
      'suppliers_view',
      'suppliers_manage',
      'purchase_orders_view',
      'purchase_orders_manage',
      'costing_view',
      'packages_view',
      'ai_copilot_access'
    ],
    accessibleTabs: [
      'overview',
      'suppliers',
      'purchase_orders',
      'costing',
      'packages',
      'ai_copilot'
    ]
  },
  finance_officer: {
    id: 'finance_officer',
    title: 'Finance Controller & Accountant',
    shortTitle: 'Finance',
    displayName: 'Finance Controller & Accountant',
    description: 'Audits trip profit & loss, cash flow, tax invoices, customer settlements, supplier payouts, and expense claims.',
    department: 'Finance & Accounting',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    level: 4,
    defaultPermissions: [
      'finances_view',
      'finances_manage',
      'expenses_approve',
      'costing_view',
      'purchase_orders_view',
      'bookings_view',
      'ai_copilot_access'
    ],
    permissions: [
      'finances_view',
      'finances_manage',
      'expenses_approve',
      'costing_view',
      'purchase_orders_view',
      'bookings_view',
      'ai_copilot_access'
    ],
    accessibleTabs: [
      'overview',
      'profit_loss',
      'cash_flow',
      'invoices',
      'payments',
      'expenses',
      'costing',
      'ai_copilot'
    ]
  },
  support_agent: {
    id: 'support_agent',
    title: 'Customer Relations & Support',
    shortTitle: 'Support',
    displayName: 'Customer Relations & Support',
    description: 'Assists trade delegates, manages concierge inquiries, live chats, and traveler notifications.',
    department: 'Customer Experience',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    level: 3,
    defaultPermissions: [
      'bookings_view',
      'packages_view',
      'support_manage'
    ],
    permissions: [
      'bookings_view',
      'packages_view',
      'support_manage'
    ],
    accessibleTabs: [
      'overview',
      'bookings',
      'packages',
      'invoices'
    ]
  },
  general_staff: {
    id: 'general_staff',
    title: 'General Staff (Pending Assignment)',
    shortTitle: 'Staff (Pending)',
    displayName: 'General Staff (Pending Assignment)',
    description: 'Newly registered corporate staff account pending department role and permission allocation by an Administrator.',
    department: 'General Staff',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    level: 2,
    defaultPermissions: [],
    permissions: [],
    accessibleTabs: []
  },
  traveler: {
    id: 'traveler',
    title: 'B2B Trade Delegate / Traveler',
    shortTitle: 'Delegate',
    displayName: 'B2B Trade Delegate / Traveler',
    description: 'Standard traveler account for exploring packages, booking expeditions, and downloading invoices & vouchers.',
    department: 'Trade Delegates',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    level: 1,
    defaultPermissions: [
      'packages_view',
      'bookings_view'
    ],
    permissions: [
      'packages_view',
      'bookings_view'
    ],
    accessibleTabs: []
  }
};

/**
 * Check if an email domain is authorized for Google SSO
 * Restricted to @khbmedia.asia and @khbevents.com (and super admin chamnabmey.info@gmail.com)
 */
export function isAllowedGoogleDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower.endsWith('@khbmedia.asia') ||
    lower.endsWith('@khbevents.com') ||
    lower === 'chamnabmey.info@gmail.com' ||
    lower === 'vutha.tim@khbmedia.asia' ||
    lower === 'vutha.tim@khbevents.com'
  );
}

export const ERP_TABS_LIST = [
  { id: 'overview', label: 'Executive Dashboard & Overview', category: 'General' },
  { id: 'users', label: 'User Directory & Security RBAC', category: 'Administration' },
  { id: 'profit_loss', label: 'Profit & Loss Statement (P&L)', category: 'Finances' },
  { id: 'cash_flow', label: 'Cash Flow & Settlements', category: 'Finances' },
  { id: 'invoices', label: 'VAT Tax Invoices & Billing', category: 'Finances' },
  { id: 'packages', label: 'Tour Packages & Missions', category: 'Operations' },
  { id: 'bookings', label: 'Traveler Bookings & Vouchers', category: 'Operations' },
  { id: 'costing', label: 'Costing Templates & Margins', category: 'Operations' },
  { id: 'suppliers', label: 'Supplier & Vendor Directory', category: 'Procurement' },
  { id: 'purchase_orders', label: 'Purchase Orders (PO)', category: 'Procurement' },
  { id: 'payments', label: 'Payments & Disbursements', category: 'Finances' },
  { id: 'expenses', label: 'Operational Trip Expenses', category: 'Finances' },
  { id: 'recycle_bin', label: 'Recycle Bin & Data Recovery', category: 'Administration' },
  { id: 'ai_copilot', label: 'AI ERP Operations Copilot', category: 'AI & System' },
  { id: 'settings', label: 'System Settings & Gateway Config', category: 'Administration' }
];

/**
 * Check if a user is a staff/back-office member
 */
export function isStaffMember(user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'traveler') return false;
  return [
    'super_admin',
    'admin',
    'operations_manager',
    'procurement_officer',
    'finance_officer',
    'support_agent',
    'general_staff'
  ].includes(user.role);
}

/**
 * Check if a user has a specific permission
 */
export function userHasPermission(user: User | null, permission: PermissionKey): boolean {
  if (!user) return false;
  if (user.status === 'suspended' || user.status === 'inactive') return false;

  // Chamnab Mey, Tim Vutha, super_admin, or admin has ALL permissions unconditionally
  if (
    user.email === 'chamnabmey.info@gmail.com' ||
    user.email === 'vutha.tim@khbmedia.asia' ||
    user.email === 'vutha.tim@khbevents.com' ||
    user.role === 'super_admin' ||
    user.role === 'admin'
  ) {
    return true;
  }

  // Check custom user permissions override first if defined
  if (user.customPermissions && Array.isArray(user.customPermissions)) {
    return user.customPermissions.includes(permission);
  }

  // Fallback to role-based default permissions
  const roleConfig = ROLE_CONFIGS[user.role];
  if (!roleConfig) return false;

  return roleConfig.defaultPermissions.includes(permission);
}

/**
 * Get all effective permissions for a user
 */
export function getUserEffectivePermissions(user: User | null): PermissionKey[] {
  if (!user) return [];
  if (user.status === 'suspended' || user.status === 'inactive') return [];

  if (
    user.email === 'chamnabmey.info@gmail.com' ||
    user.email === 'vutha.tim@khbmedia.asia' ||
    user.email === 'vutha.tim@khbevents.com' ||
    user.role === 'super_admin' ||
    user.role === 'admin'
  ) {
    return ALL_PERMISSIONS.map(p => p.key);
  }

  if (user.customPermissions && Array.isArray(user.customPermissions)) {
    return user.customPermissions;
  }

  const roleConfig = ROLE_CONFIGS[user.role];
  return roleConfig?.defaultPermissions || [];
}

/**
 * Check if a user can access a specific admin tab
 */
export function userCanAccessTab(user: User | null, tab: string): boolean {
  if (!user) return false;
  if (user.status === 'suspended' || user.status === 'inactive') return false;

  if (
    user.email === 'chamnabmey.info@gmail.com' ||
    user.email === 'vutha.tim@khbmedia.asia' ||
    user.email === 'vutha.tim@khbevents.com' ||
    user.role === 'super_admin' ||
    user.role === 'admin'
  ) {
    return true;
  }

  // Check custom accessible tabs override if defined
  if (user.customAccessibleTabs && Array.isArray(user.customAccessibleTabs)) {
    return user.customAccessibleTabs.includes(tab);
  }

  const roleConfig = ROLE_CONFIGS[user.role];
  if (!roleConfig) return false;

  return roleConfig.accessibleTabs.includes(tab);
}

/**
 * Get all effective accessible tabs for a user
 */
export function getUserEffectiveTabs(user: User | null): string[] {
  if (!user) return [];
  if (user.status === 'suspended' || user.status === 'inactive') return [];

  if (
    user.email === 'chamnabmey.info@gmail.com' ||
    user.email === 'vutha.tim@khbmedia.asia' ||
    user.email === 'vutha.tim@khbevents.com' ||
    user.role === 'super_admin' ||
    user.role === 'admin'
  ) {
    return ERP_TABS_LIST.map(t => t.id);
  }

  if (user.customAccessibleTabs && Array.isArray(user.customAccessibleTabs)) {
    return user.customAccessibleTabs;
  }

  const roleConfig = ROLE_CONFIGS[user.role];
  return roleConfig?.accessibleTabs || [];
}

/**
 * Get formatted role badge metadata
 */
export function getRoleBadge(role: UserRole) {
  const cfg = ROLE_CONFIGS[role] || ROLE_CONFIGS.traveler;
  return {
    label: cfg.shortTitle,
    fullTitle: cfg.title,
    badgeBg: cfg.badgeBg,
    badgeText: cfg.badgeText,
    badgeBorder: cfg.badgeBorder,
    department: cfg.department
  };
}
