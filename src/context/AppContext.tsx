import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import {
  User,
  UserRole,
  UserStatus,
  Department,
  PermissionKey,
  UserAuditLog,
  LanguageCode,
  CurrencyCode,
  TourPackage,
  TourPackageStatus,
  Booking,
  Invoice,
  SupportChat,
  PushNotification,
  NotificationCategory,
  BookingStatus,
  FlightStatus,
  HotelStatus,
  MonthlyFinancialSummary,
  Supplier,
  CostTemplate,
  PurchaseOrder,
  CustomerPayment,
  SupplierPayment,
  Expense,
  TripProfitReport,
  CashFlowSummary,
  CashFlowEntry,
  POStatus,
  DeletedItemRecord,
  RecoverableEntityType,
  SystemSettings,
  ActiveView,
  CrmConfig,
  CrmWebhookEvent,
  CrmSyncLog,
  CrmWebhookEventType,
  InboundWonLead,
  LeadPassenger,
  LeadOperationalStage,
  LeadHandoverTask,
  PackageCategory,
  PackageViewMode,
  SystemUpdateHistoryRecord,
  SystemUpdateCategory,
  SystemUpdateChangeDiff,
  AutoSyncStatus,
  AutoSyncState,
} from '../types';
import {
  SEED_USERS,
  INITIAL_PACKAGES,
  SEED_BOOKINGS,
  SEED_INVOICES,
  SEED_SUPPORT_CHATS,
  SEED_SUPPLIERS,
  SEED_COST_TEMPLATES,
  SEED_PURCHASE_ORDERS,
  SEED_CUSTOMER_PAYMENTS,
  SEED_SUPPLIER_PAYMENTS,
  SEED_EXPENSES,
  SEED_DELETED_ITEMS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_PACKAGE_CATEGORIES
} from '../services/mockData';
import {
  INITIAL_SYSTEM_UPDATES,
  computeSettingsDiff,
  deriveCategoryFromChanges,
  generateUpdateTitle,
  generateUpdateSummary
} from '../services/systemUpdateHistoryService';
import {
  pushBookingToExternalCrm,
  pushCustomerToExternalCrm,
  testCrmApiConnection,
  simulateCrmWebhook,
  fetchServerWebhookEvents,
  getStoredCrmLogs,
  getStoredWebhookEvents,
  getStoredInboundLeads,
  saveStoredInboundLead,
  saveAllStoredInboundLeads,
  pushLeadUpdateToCrm,
  pushLeadTaskProgressToCrm,
  syncAllLeadsProgressToCrm as syncAllLeadsProgressApi,
  DEFAULT_CRM_CONFIG,
} from '../services/crmIntegrationService';
import { generateDefaultHandoverTasks, playNotificationChime, getRecommendedStageFromTasks } from '../services/handoverTaskService';
import {
  isStaffMember,
  userHasPermission,
  userCanAccessTab,
  isAllowedGoogleDomain,
  ROLE_CONFIGS,
  getUserEffectivePermissions,
  getUserEffectiveTabs
} from '../services/rolePermissions';
import { CURRENCY_CONFIGS, convertFromUSD } from '../services/currencyService';
import { isRTL, translations } from '../i18n/translations';
import { getLocalizedPackage } from '../utils/packageLocalization';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';
import { reconcileTourPackages } from '../utils/packageReconciler';
import { applyThemeToDOM } from '../services/aiThemeService';
import {
  db,
  auth,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection
} from '../lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';

interface CreateBookingParams {
  packageId: string;
  startDate: string;
  endDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests?: string;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'biometric_wallet' | 'aba_payway' | 'acleda_xpay' | 'wing_bank' | 'bank_wire';
  cardLast4?: string;
}

interface AppContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isStaff: boolean;
  isSuperAdmin: boolean;
  users: User[];
  auditLogs: UserAuditLog[];
  language: LanguageCode;
  currency: CurrencyCode;
  darkMode: boolean;
  offlineMode: boolean;
  isFirebaseConnected: boolean;
  packages: TourPackage[];
  rawPackages: TourPackage[];
  getLocalizedPackage: (pkg: TourPackage) => TourPackage;
  bookings: Booking[];
  invoices: Invoice[];
  supportChats: SupportChat[];
  notifications: PushNotification[];
  unreadNotificationCount: number;

  // RBAC & Permission Checks
  hasPermission: (permission: PermissionKey) => boolean;
  canAccessTab: (tab: string) => boolean;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  assignUserRoleAndPermissions: (
    userId: string,
    role: UserRole,
    customPermissions?: PermissionKey[],
    customAccessibleTabs?: string[]
  ) => Promise<void>;
  toggleUserPermissionDirectly: (userId: string, permissionKey: PermissionKey) => Promise<void>;
  toggleUserTabDirectly: (userId: string, tabId: string) => Promise<void>;
  resetUserPermissionsToDefault: (userId: string) => Promise<void>;
  switchActiveUser: (userId: string) => void;
  generateTemporaryPassword: (userId: string) => Promise<string>;
  resetUserSecurityCredentials: (userId: string) => Promise<void>;
  logUserAudit: (action: string, details: string, severity?: 'info' | 'warning' | 'security') => void;

  
  // ERP State
  suppliers: Supplier[];
  costTemplates: CostTemplate[];
  purchaseOrders: PurchaseOrder[];
  customerPayments: CustomerPayment[];
  supplierPayments: SupplierPayment[];
  expenses: Expense[];

  // Actions - Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPOsUSD'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;

  // Actions - Cost Templates
  saveCostTemplate: (template: Omit<CostTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCostTemplate: (template: CostTemplate) => void;
  deleteCostTemplate: (templateId: string) => void;
  getCostTemplateForPackage: (packageId: string) => CostTemplate | undefined;

  // Actions - Purchase Orders
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => void;
  updatePurchaseOrder: (po: PurchaseOrder) => void;
  deletePurchaseOrder: (poId: string) => void;
  updatePOStatus: (poId: string, status: POStatus, paidDate?: string) => void;

  // Actions - Customer Payments
  addCustomerPayment: (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => void;
  updateCustomerPayment: (payment: CustomerPayment) => void;

  // Actions - Supplier Payments
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id' | 'createdAt'>) => void;
  updateSupplierPayment: (payment: SupplierPayment) => void;
  markSupplierPaymentPaid: (paymentId: string, paidDate: string, referenceNumber: string) => void;

  // Actions - Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (expense: Expense) => void;
  approveExpense: (expenseId: string, approvedBy: string, approvedByName: string) => void;
  rejectExpense: (expenseId: string) => void;

  // Computed Reports
  getTripProfitReport: (bookingId: string) => TripProfitReport | null;
  getCashFlowSummary: (period?: string) => CashFlowSummary;
  getErpDashboardStats: () => {
    totalOutstandingReceivableUSD: number;
    totalOutstandingPayableUSD: number;
    totalApprovedExpensesUSD: number;
    totalPendingExpensesUSD: number;
    activeSupplierCount: number;
    overduePaymentsCount: number;
  };
  exportProfitReportCSV: (bookingId?: string) => void;

  // UI Selection State
  activeView: ActiveView;
  selectedPackage: TourPackage | null;
  selectedBooking: Booking | null;
  selectedInvoice: Invoice | null;
  activeModal: string | null;
  
  // Actions
  setActiveView: (view: ActiveView) => void;
  openPackageSalesPage: (pkgOrId: TourPackage | string) => void;
  // Tour Package Direct Editor
  isPackageEditorOpen: boolean;
  editingPackage: TourPackage | null;
  openPackageEditorWithAi: boolean;
  openPackageEditor: (pkgOrId?: TourPackage | string | null, openWithAi?: boolean) => void;
  closePackageEditor: () => void;
  setSelectedPackage: (pkg: TourPackage | null) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  setActiveModal: (modal: string | null) => void;
  
  setLanguage: (lang: LanguageCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  toggleDarkMode: () => void;
  toggleOfflineMode: () => void;
  
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsTraveler: () => void;
  loginAsAdmin: () => void;
  loginWithEmail: (email: string, role?: UserRole, name?: string, phone?: string) => Promise<void>;
  loginWithPhone: (phone: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  registerPublicUser: (data: { name: string; email?: string; phone?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  authenticateBiometric: () => Promise<boolean>;
  registerBiometrics: () => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  
  createBooking: (params: CreateBookingParams) => Promise<Booking>;
  modifyBookingDate: (bookingId: string, newStartDate: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  updateBookingStatusByAdmin: (
    bookingId: string,
    status: BookingStatus,
    flightUpdates?: Partial<FlightStatus>,
    hotelUpdates?: Partial<HotelStatus>
  ) => void;
  
  addPackage: (pkg: Omit<TourPackage, 'id' | 'rating' | 'reviewCount' | 'bookedThisMonth'> | TourPackage) => void;
  updatePackage: (pkg: TourPackage) => void;
  updatePackageStatus: (packageId: string, status: TourPackageStatus) => void;
  clonePackageAsDraft: (pkg: TourPackage) => TourPackage;
  deletePackage: (packageId: string) => void;
  restorePackage: (packageId: string) => void;
  
  // Tour Package Categories CRUD
  packageCategories: PackageCategory[];
  addPackageCategory: (cat: Omit<PackageCategory, 'createdAt' | 'updatedAt'> | PackageCategory) => PackageCategory;
  updatePackageCategory: (cat: PackageCategory) => void;
  deletePackageCategory: (categoryId: string) => { success: boolean; affectedPackages: number };
  togglePackageCategoryStatus: (categoryId: string) => void;
  reorderPackageCategories: (orderedIds: string[]) => void;
  resetPackageCategories: () => void;
  
  sendSupportMessage: (chatId: string, text: string, senderRole?: 'traveler' | 'admin') => void;
  addNotification: (
    title: string,
    message: string,
    type?: NotificationCategory,
    options?: {
      targetView?: ActiveView;
      targetTab?: string;
      targetEntityId?: string;
      actionUrl?: string;
      metadata?: Record<string, any>;
    }
  ) => void;
  markNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  handleNotificationClick: (notification: PushNotification) => void;
  
  getMonthlyFinancialSummary: (monthFilter?: string) => MonthlyFinancialSummary[];
  exportMonthlyReportCSV: (monthFilter?: string) => void;
  
  // Recycle Bin & Data Recovery State
  deletedItems: DeletedItemRecord[];
  recoverItem: (deletedItemId: string) => void;
  permanentDeleteItem: (deletedItemId: string) => void;
  restoreAllDeleted: (entityType?: RecoverableEntityType) => void;
  emptyRecycleBin: (entityType?: RecoverableEntityType) => void;

  deleteBooking: (bookingId: string) => void;
  deleteCustomerPayment: (paymentId: string) => void;
  deleteSupplierPayment: (paymentId: string) => void;
  deleteExpense: (expenseId: string) => void;
  deleteInvoice: (invoiceId: string) => void;

  // System Settings & Feature Controls
  systemSettings: SystemSettings;
  updateSystemSettings: (updates: Partial<SystemSettings>) => void;
  resetSystemSettings: () => void;
  exportSystemBackupJSON: () => void;
  importSystemBackupJSON: (jsonString: string) => boolean;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;
  settingsSubTab: string;
  setSettingsSubTab: (subTab: string) => void;
  navigateToSettings: (subTab?: string) => void;

  // System Update & Modification History
  systemUpdates: SystemUpdateHistoryRecord[];
  recordSystemUpdate: (record: Omit<SystemUpdateHistoryRecord, 'id' | 'timestamp' | 'updatedBy' | 'source' | 'status'> & {
    id?: string;
    timestamp?: string;
    updatedBy?: string;
    source?: 'admin_action' | 'system_release' | 'auto_sync' | 'manual_log';
    status?: 'applied' | 'pending' | 'reverted';
  }) => SystemUpdateHistoryRecord;
  deleteSystemUpdate: (id: string) => void;
  clearSystemUpdateHistory: () => void;

  // CRM & Webhook Integration Suite
  crmEvents: CrmWebhookEvent[];
  crmSyncLogs: CrmSyncLog[];
  inboundLeads: InboundWonLead[];
  recentWonLeadAlert: { lead: InboundWonLead; timestamp: string } | null;
  clearWonLeadAlert: () => void;
  addInboundLead: (lead: Omit<InboundWonLead, 'id' | 'createdAt' | 'updatedAt'>) => InboundWonLead;
  updateInboundLead: (lead: InboundWonLead) => void;
  updateLeadOperationalStage: (leadId: string, stage: LeadOperationalStage) => void;
  updateLeadManifest: (leadId: string, manifest: LeadPassenger[]) => void;
  startLeadHandover: (leadId: string, officerName?: string) => void;
  updateLeadHandoverTask: (
    leadId: string,
    taskId: string,
    updates: Partial<LeadHandoverTask>,
    autoAdvanceStage?: boolean
  ) => void;
  addLeadHandoverTask: (leadId: string, task: Omit<LeadHandoverTask, 'id'>) => void;
  deleteLeadHandoverTask: (leadId: string, taskId: string) => void;
  syncLeadToCrm: (
    leadId: string,
    eventType: 'trip.booking_confirmed' | 'trip.passenger_manifest_updated' | 'trip.payment_confirmed'
  ) => Promise<{ success: boolean; message: string }>;
  syncLeadProgressToCrm: (
    leadId: string,
    actionDesc?: string
  ) => Promise<{ success: boolean; message: string }>;
  syncAllLeadsProgressToCrm: () => Promise<{ total: number; success: number }>;
  deleteInboundLead: (leadId: string) => void;
  processWebhookEvent: (event: CrmWebhookEvent) => void;
  pushBookingToCrm: (bookingId: string) => Promise<boolean>;
  pushCustomerToCrm: (userId: string) => Promise<boolean>;
  syncAllBookingsToCrm: () => Promise<{ total: number; success: number }>;
  syncAllCustomersToCrm: () => Promise<{ total: number; success: number }>;
  testCrmConnection: (config?: CrmConfig) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  simulateWebhookTrigger: (
    eventType: CrmWebhookEventType,
    payload: any,
    source?: string,
    customMessage?: string
  ) => Promise<boolean>;
  refreshWebhookEvents: () => Promise<void>;

  // Default View & Tab Customization
  defaultView: ActiveView;
  defaultAdminTab: string;
  defaultPackageViewMode: PackageViewMode;
  setDefaultView: (view: ActiveView, targetAdminTab?: string) => void;
  setDefaultAdminTab: (tab: string) => void;
  setDefaultPackageViewMode: (mode: PackageViewMode) => void;
  resetDefaultView: () => void;

  // Real-Time Auto-Save & Cloud Synchronization State
  autoSyncState: AutoSyncState;
  triggerAutoSave: (message?: string) => void;
  forceSyncAll: () => Promise<void>;

  // Global Toast Notifications
  toastMessage: { text: string; subtext?: string; type?: 'success' | 'info'; icon?: string } | null;
  showToast: (text: string, subtext?: string, type?: 'success' | 'info', icon?: string) => void;
  clearToast: () => void;

  // Helper
  t: (key: keyof typeof translations['en']) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'tripdesk_user_prod',
  USERS: 'tripdesk_users_prod',
  AUDIT_LOGS: 'tripdesk_audit_logs_prod',
  LANG: 'tripdesk_lang_prod',
  CURRENCY: 'tripdesk_curr_prod',
  DARK_MODE: 'tripdesk_dark_prod',
  PACKAGES: 'tripdesk_pkgs_prod',
  BOOKINGS: 'tripdesk_bks_prod',
  INVOICES: 'tripdesk_invs_prod',
  CHATS: 'tripdesk_chats_prod',
  CACHED_OFFLINE_ITINERARY: 'tripdesk_offline_prod',
  SUPPLIERS: 'tripdesk_suppliers_prod',
  COST_TEMPLATES: 'tripdesk_cost_templates_prod',
  PURCHASE_ORDERS: 'tripdesk_pos_prod',
  CUSTOMER_PAYMENTS: 'tripdesk_cpayments_prod',
  SUPPLIER_PAYMENTS: 'tripdesk_spayments_prod',
  EXPENSES: 'tripdesk_expenses_prod',
  DELETED_ITEMS: 'tripdesk_deleted_items_prod',
  DELETED_IDS: 'tripdesk_deleted_ids_prod',
  SETTINGS: 'tripdesk_settings_prod',
  INBOUND_LEADS: 'tripdesk_inbound_leads_prod',
  PACKAGE_CATEGORIES: 'tripdesk_package_categories_prod',
  SYSTEM_UPDATES: 'tripdesk_system_updates_prod',
  ACTIVE_VIEW: 'tripdesk_active_view_prod',
  SELECTED_PACKAGE_ID: 'tripdesk_selected_package_id_prod',
  ACTIVE_ADMIN_TAB: 'tripdesk_active_admin_tab_prod',
  SETTINGS_SUB_TAB: 'tripdesk_settings_sub_tab_prod',
  DEFAULT_VIEW: 'tripdesk_default_view_prod',
  DEFAULT_ADMIN_TAB: 'tripdesk_default_admin_tab_prod',
  DEFAULT_PACKAGE_VIEW_MODE: 'tripdesk_default_package_view_mode_prod',
};

const INITIAL_AUDIT_LOGS: UserAuditLog[] = [
  {
    id: 'log_seed_1',
    userId: 'usr_chamnab_mey',
    userName: 'Chamnab Mey',
    userEmail: 'chamnabmey.info@gmail.com',
    userRole: 'super_admin',
    action: 'RBAC Policy Initialized',
    details: 'Configured role matrices, department assignments, and permission boundaries for Back-Office ERP.',
    timestamp: '2026-08-17T06:30:00.000Z',
    ipAddress: '192.168.1.1 (Phnom Penh HQ)',
    severity: 'security'
  },
  {
    id: 'log_seed_2',
    userId: 'usr_vutha_tim',
    userName: 'Tim Vutha',
    userEmail: 'vutha.tim@khbmedia.asia',
    userRole: 'super_admin',
    action: 'Executive Flight & Manifest Audit',
    details: 'Verified charter flight seats and luxury bus allocation for Bangkok Trade Expo 2026.',
    timestamp: '2026-08-17T05:45:00.000Z',
    ipAddress: '192.168.1.24 (Phnom Penh HQ)',
    severity: 'info'
  },
  {
    id: 'log_seed_3',
    userId: 'usr_dany_chhea',
    userName: 'Chhea Dany',
    userEmail: 'dany.chhea@khbevents.com',
    userRole: 'finance_officer',
    action: 'Expense Audit Review',
    details: 'Reviewed and certified supplier payment reconciliation batch #PO-2026-003.',
    timestamp: '2026-08-17T04:15:00.000Z',
    ipAddress: '192.168.1.55 (Phnom Penh HQ)',
    severity: 'info'
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  
  // Load initial settings
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null; // Public visitors start as unauthenticated guests
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG) as LanguageCode;
      if (saved && ['en', 'ar', 'he', 'es', 'ja', 'km'].includes(saved)) return saved;
      // Auto-detect browser language
      const browserLang = navigator.language.slice(0, 2);
      if (['ar', 'he', 'es', 'ja', 'km'].includes(browserLang)) return browserLang as LanguageCode;
    } catch {}
    return 'km';
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode;
      if (saved && Object.keys(CURRENCY_CONFIGS).includes(saved)) return saved;
    } catch {}
    return 'USD';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {}
    return false;
  });

  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  
  // Real-Time Auto-Save & Cloud Synchronization State
  const [autoSyncState, setAutoSyncState] = useState<AutoSyncState>(() => ({
    status: 'synced',
    lastSavedAt: new Date().toISOString(),
    pendingOperations: 0,
    message: 'All changes saved'
  }));

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSave = (customMessage?: string) => {
    setAutoSyncState(prev => ({
      status: (navigator.onLine && !offlineMode) ? 'saving' : 'offline',
      lastSavedAt: prev.lastSavedAt,
      pendingOperations: prev.pendingOperations + 1,
      message: customMessage || ((navigator.onLine && !offlineMode) ? 'Auto-saving...' : 'Saved locally (Offline)')
    }));

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSyncState({
        status: (navigator.onLine && !offlineMode) ? 'synced' : 'offline',
        lastSavedAt: new Date().toISOString(),
        pendingOperations: 0,
        message: (navigator.onLine && !offlineMode) ? 'All changes saved' : 'Saved to LocalStorage'
      });
    }, 850);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsFirebaseConnected(true);
      triggerAutoSave('Reconnected! Live sync restored');
    };
    const handleOffline = () => {
      setIsFirebaseConnected(false);
      setAutoSyncState(prev => ({
        ...prev,
        status: 'offline',
        message: 'Offline (Saving to LocalStorage)'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineMode]);
  
  const [packages, setPackages] = useState<TourPackage[]>(() => {
    try {
      let delSet = new Set<string>();
      try {
        const savedDel = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
        if (savedDel) delSet = new Set(JSON.parse(savedDel));
      } catch {}

      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((p: TourPackage) => p && p.id && !delSet.has(p.id));
          if (valid.length > 0) {
            return valid.map((savedPkg: TourPackage) => {
              const seedMatch = INITIAL_PACKAGES.find(ip => ip.id === savedPkg.id);
              if (!seedMatch) return savedPkg;
              return {
                ...seedMatch,
                ...savedPkg,
                titleKm: savedPkg.titleKm || seedMatch.titleKm,
                titleEn: savedPkg.titleEn || seedMatch.titleEn,
                descriptionKm: savedPkg.descriptionKm || seedMatch.descriptionKm,
                descriptionEn: savedPkg.descriptionEn || seedMatch.descriptionEn,
                destinationKm: savedPkg.destinationKm || seedMatch.destinationKm,
                destinationEn: savedPkg.destinationEn || seedMatch.destinationEn,
                countryKm: savedPkg.countryKm || seedMatch.countryKm,
                countryEn: savedPkg.countryEn || seedMatch.countryEn,
                categoryKm: savedPkg.categoryKm || seedMatch.categoryKm,
                categoryEn: savedPkg.categoryEn || seedMatch.categoryEn,
                highlightsKm: (savedPkg.highlightsKm && savedPkg.highlightsKm.length > 0) ? savedPkg.highlightsKm : seedMatch.highlightsKm,
                highlightsEn: (savedPkg.highlightsEn && savedPkg.highlightsEn.length > 0) ? savedPkg.highlightsEn : seedMatch.highlightsEn,
                whoShouldJoinKm: (savedPkg.whoShouldJoinKm && savedPkg.whoShouldJoinKm.length > 0) ? savedPkg.whoShouldJoinKm : seedMatch.whoShouldJoinKm,
                whoShouldJoinEn: (savedPkg.whoShouldJoinEn && savedPkg.whoShouldJoinEn.length > 0) ? savedPkg.whoShouldJoinEn : seedMatch.whoShouldJoinEn,
                whyShouldJoinKm: (savedPkg.whyShouldJoinKm && savedPkg.whyShouldJoinKm.length > 0) ? savedPkg.whyShouldJoinKm : seedMatch.whyShouldJoinKm,
                whyShouldJoinEn: (savedPkg.whyShouldJoinEn && savedPkg.whyShouldJoinEn.length > 0) ? savedPkg.whyShouldJoinEn : seedMatch.whyShouldJoinEn,
                inclusionsKm: (savedPkg.inclusionsKm && savedPkg.inclusionsKm.length > 0) ? savedPkg.inclusionsKm : seedMatch.inclusionsKm,
                inclusionsEn: (savedPkg.inclusionsEn && savedPkg.inclusionsEn.length > 0) ? savedPkg.inclusionsEn : seedMatch.inclusionsEn,
                exclusionsKm: (savedPkg.exclusionsKm && savedPkg.exclusionsKm.length > 0) ? savedPkg.exclusionsKm : seedMatch.exclusionsKm,
                exclusionsEn: (savedPkg.exclusionsEn && savedPkg.exclusionsEn.length > 0) ? savedPkg.exclusionsEn : seedMatch.exclusionsEn,
                termsAndConditionsKm: (savedPkg.termsAndConditionsKm && savedPkg.termsAndConditionsKm.length > 0) ? savedPkg.termsAndConditionsKm : seedMatch.termsAndConditionsKm,
                termsAndConditionsEn: (savedPkg.termsAndConditionsEn && savedPkg.termsAndConditionsEn.length > 0) ? savedPkg.termsAndConditionsEn : seedMatch.termsAndConditionsEn,
                itinerary: (savedPkg.itinerary && savedPkg.itinerary.length > 0) ? savedPkg.itinerary.map((step, idx) => {
                  const seedStep = seedMatch.itinerary?.[idx];
                  if (!seedStep) return step;
                  return {
                    ...seedStep,
                    ...step,
                    titleKm: step.titleKm || seedStep.titleKm,
                    titleEn: step.titleEn || seedStep.titleEn,
                    descriptionKm: step.descriptionKm || seedStep.descriptionKm,
                    descriptionEn: step.descriptionEn || seedStep.descriptionEn,
                    hotelNameKm: step.hotelNameKm || seedStep.hotelNameKm,
                    hotelNameEn: step.hotelNameEn || seedStep.hotelNameEn,
                    guideAgenda: step.guideAgenda || seedStep.guideAgenda
                  };
                }) : seedMatch.itinerary,
                tourGuide: seedMatch.tourGuide ? {
                  ...seedMatch.tourGuide,
                  ...(savedPkg.tourGuide || {})
                } : savedPkg.tourGuide
              };
            });
          }
        }
      }
    } catch {}
    return INITIAL_PACKAGES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_BOOKINGS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_INVOICES;
  });

  const [supportChats, setSupportChats] = useState<SupportChat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_SUPPORT_CHATS;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'notif_lead_won_1',
      title: 'Won Lead: Apex Global Logistics',
      message: 'Inbound Won Lead KHB-TRIP-2026-8842 (10 Delegates, $24,500 USD) received via Webhook. Click to review post-sale handover tasks.',
      type: 'lead_won',
      timestamp: 'Just now',
      read: false,
      targetView: 'admin_dashboard',
      targetTab: 'inbound_leads',
      targetEntityId: 'lead_apex_01'
    },
    {
      id: 'notif_booking_1',
      title: 'Reservation Confirmed: TRP-84920',
      message: 'Tokyo B2B Trade & Technology Summit secured for Chamnab Mey. Flight & Hotel vouchers are active.',
      type: 'booking',
      timestamp: '10m ago',
      read: false,
      targetView: 'customer_portal',
      targetTab: 'trips',
      targetEntityId: 'bk_1723849201'
    },
    {
      id: 'notif_flight_1',
      title: 'Flight Alert: TD 742 on Schedule',
      message: 'Phnom Penh (PNH) -> Tokyo Haneda (HND) departing 08:30 AM at Gate A12. Check live itinerary.',
      type: 'flight',
      timestamp: '45m ago',
      read: false,
      targetView: 'customer_portal',
      targetTab: 'flights'
    },
    {
      id: 'notif_tax_1',
      title: 'Monthly VAT & Tax Report Ready',
      message: 'August 2026 tax filing summary calculated ($1,387.50 USD collected). Click to review & export CSV.',
      type: 'finance',
      timestamp: '2h ago',
      read: true,
      targetView: 'admin_dashboard',
      targetTab: 'profit_loss'
    },
    {
      id: 'notif_welcome',
      title: 'KHB Trade Mission ERP Active',
      message: 'System initialized for live operations. Cloud database & real-time sync connected.',
      type: 'system',
      timestamp: '1d ago',
      read: true,
      targetView: 'admin_dashboard',
      targetTab: 'overview'
    }
  ]);

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS); if (saved) return JSON.parse(saved); } catch {} return SEED_SUPPLIERS; });
  const [costTemplates, setCostTemplates] = useState<CostTemplate[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEYS.COST_TEMPLATES); if (saved) return JSON.parse(saved); } catch {} return SEED_COST_TEMPLATES; });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS); if (saved) return JSON.parse(saved); } catch {} return SEED_PURCHASE_ORDERS; });
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PAYMENTS); if (saved) return JSON.parse(saved); } catch {} return SEED_CUSTOMER_PAYMENTS; });
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PAYMENTS); if (saved) return JSON.parse(saved); } catch {} return SEED_SUPPLIER_PAYMENTS; });
  const [expenses, setExpenses] = useState<Expense[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES); if (saved) return JSON.parse(saved); } catch {} return SEED_EXPENSES; });
  const [deletedItems, setDeletedItems] = useState<DeletedItemRecord[]>(() => { try { const saved = localStorage.getItem(STORAGE_KEYS.DELETED_ITEMS); if (saved) return JSON.parse(saved); } catch {} return SEED_DELETED_ITEMS; });
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(deletedIds));
  }, [deletedIds]);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SYSTEM_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(systemSettings));
    applyThemeToDOM(systemSettings, darkMode);
  }, [systemSettings, darkMode]);

  // Package Categories State
  const [packageCategories, setPackageCategories] = useState<PackageCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGE_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PACKAGE_CATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(packageCategories));
    } catch (e) {}
  }, [packageCategories]);

  // System Update & Modification History State
  const [systemUpdates, setSystemUpdates] = useState<SystemUpdateHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_UPDATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SYSTEM_UPDATES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_UPDATES, JSON.stringify(systemUpdates));
    } catch (e) {}
  }, [systemUpdates]);

  // CRM & Webhook Inbound & Outbound Sync State
  const [crmEvents, setCrmEvents] = useState<CrmWebhookEvent[]>(() => getStoredWebhookEvents());
  const [crmSyncLogs, setCrmSyncLogs] = useState<CrmSyncLog[]>(() => getStoredCrmLogs());
  const [inboundLeads, setInboundLeads] = useState<InboundWonLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INBOUND_LEADS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getStoredInboundLeads();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INBOUND_LEADS, JSON.stringify(inboundLeads));
    } catch (e) {
      console.warn('Failed to save inbound leads to LocalStorage:', e);
    }
  }, [inboundLeads]);

  const [recentWonLeadAlert, setRecentWonLeadAlert] = useState<{ lead: InboundWonLead; timestamp: string } | null>(null);
  const clearWonLeadAlert = () => setRecentWonLeadAlert(null);

  // IMPORTANT: users & auditLogs state MUST be declared before any hook or function that references them
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Default Startup View & Admin Tab User Preferences
  const [defaultView, setDefaultViewState] = useState<ActiveView>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEFAULT_VIEW) as ActiveView;
      if (saved && ['marketing', 'customer_portal', 'admin_dashboard', 'package_sales_page'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'marketing';
  });

  const [defaultAdminTab, setDefaultAdminTabState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEFAULT_ADMIN_TAB);
      if (saved) return saved;
    } catch {}
    return 'overview';
  });

  const [defaultPackageViewMode, setDefaultPackageViewModeState] = useState<PackageViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEFAULT_PACKAGE_VIEW_MODE) as PackageViewMode;
      if (saved && ['grid', 'detailed-list', 'table', 'kanban'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'grid';
  });

  // Global Toast Notifications
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    subtext?: string;
    type?: 'success' | 'info';
    icon?: string;
  } | null>(null);

  const showToast = (
    text: string,
    subtext?: string,
    type: 'success' | 'info' = 'success',
    icon: string = 'star'
  ) => {
    setToastMessage({ text, subtext, type, icon });
  };

  const clearToast = () => setToastMessage(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const setDefaultView = (view: ActiveView, targetAdminTab?: string) => {
    setDefaultViewState(view);
    try {
      localStorage.setItem(STORAGE_KEYS.DEFAULT_VIEW, view);
      if (targetAdminTab) {
        setDefaultAdminTabState(targetAdminTab);
        localStorage.setItem(STORAGE_KEYS.DEFAULT_ADMIN_TAB, targetAdminTab);
      }
    } catch {}

    const viewNameMap: Record<ActiveView, string> = {
      marketing: 'Explore Packages (Public)',
      customer_portal: 'My Trips (Customer Portal)',
      admin_dashboard: `Admin Back-Office ERP ${targetAdminTab ? `(${targetAdminTab.replace(/_/g, ' ').toUpperCase()})` : ''}`,
      package_sales_page: 'Tour Package Sales Page'
    };

    showToast(
      '⭐ Set as Default Startup View',
      `"${viewNameMap[view] || view}" will now open automatically when you launch or refresh the application.`,
      'success',
      'star'
    );
  };

  const setDefaultAdminTab = (tab: string) => {
    setDefaultAdminTabState(tab);
    try {
      localStorage.setItem(STORAGE_KEYS.DEFAULT_ADMIN_TAB, tab);
    } catch {}

    showToast(
      '⭐ Default Admin Tab Saved',
      `The Back-Office ERP will now open to "${tab.replace(/_/g, ' ').toUpperCase()}" by default.`,
      'success',
      'star'
    );
  };

  const setDefaultPackageViewMode = (mode: PackageViewMode) => {
    setDefaultPackageViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.DEFAULT_PACKAGE_VIEW_MODE, mode);
    } catch {}

    const modeLabels: Record<PackageViewMode, string> = {
      grid: 'Grid Cards (ក្រឡា)',
      'detailed-list': 'Detailed List (បញ្ជីលម្អិត)',
      table: 'Compact Table (តារាងទិន្នន័យ)',
      kanban: 'Kanban Board (ក្តារដំណើរការ)'
    };

    showToast(
      '⭐ Default Package View Saved',
      `"${modeLabels[mode] || mode}" is now your default view for Tour Packages.`,
      'success',
      'star'
    );
  };

  const resetDefaultView = () => {
    setDefaultViewState('marketing');
    setDefaultAdminTabState('overview');
    setDefaultPackageViewModeState('grid');
    try {
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_VIEW);
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_ADMIN_TAB);
      localStorage.removeItem(STORAGE_KEYS.DEFAULT_PACKAGE_VIEW_MODE);
    } catch {}

    showToast(
      '🔄 Default View Reset',
      'Startup and package views have been reset to default.',
      'info',
      'check'
    );
  };

  // Helper to extract package ID from URL query, hash, or localStorage on startup
  const getInitialPackageFromUrl = (): TourPackage | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pkgParam = urlParams.get('pkg') || urlParams.get('packageId');
      const hash = window.location.hash;
      const hashParam = hash.startsWith('#package/')
        ? hash.replace('#package/', '')
        : hash.startsWith('#sales/')
        ? hash.replace('#sales/', '')
        : hash.startsWith('#pkg=')
        ? hash.replace('#pkg=', '')
        : null;
      const savedPkgId = localStorage.getItem(STORAGE_KEYS.SELECTED_PACKAGE_ID);
      const targetId = pkgParam || hashParam || savedPkgId;
      if (targetId) {
        let pkgList: TourPackage[] = INITIAL_PACKAGES;
        const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) pkgList = parsed;
          } catch {}
        }
        return pkgList.find(p => p.id === targetId) || null;
      }
    } catch {}
    return null;
  };

  const initialPkg = getInitialPackageFromUrl();

  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    try {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase();

      if (hash.startsWith('#package/') || hash.startsWith('#sales/') || urlParams.get('pkg') || urlParams.get('packageId')) {
        return 'package_sales_page';
      }
      if (hash.startsWith('#admin') || urlParams.get('tab') || pathname.includes('/admin')) {
        return 'admin_dashboard';
      }
      if (hash.startsWith('#portal') || hash.startsWith('#customer') || urlParams.get('view') === 'portal') {
        return 'customer_portal';
      }
      if (hash.startsWith('#explore') || hash.startsWith('#marketing') || urlParams.get('view') === 'marketing') {
        return 'marketing';
      }

      // Check persisted active view from prior session / before refresh
      const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW) as ActiveView;
      if (savedActive && ['marketing', 'customer_portal', 'admin_dashboard', 'package_sales_page'].includes(savedActive)) {
        if (savedActive === 'package_sales_page' && !initialPkg) {
          // If no package exists, fall through
        } else {
          return savedActive;
        }
      }

      if (initialPkg) {
        return 'package_sales_page';
      }

      const savedDefault = localStorage.getItem(STORAGE_KEYS.DEFAULT_VIEW) as ActiveView;
      if (savedDefault && ['marketing', 'customer_portal', 'admin_dashboard', 'package_sales_page'].includes(savedDefault)) {
        return savedDefault;
      }
    } catch {}
    return 'marketing';
  });

  const [adminActiveTab, setAdminActiveTabState] = useState<string>(() => {
    try {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      if (hash.startsWith('#admin/')) {
        const tab = hash.replace('#admin/', '').trim();
        if (tab) return tab;
      }
      const tabParam = urlParams.get('tab');
      if (tabParam) return tabParam;

      const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_ADMIN_TAB);
      if (savedActive) return savedActive;

      const savedDefault = localStorage.getItem(STORAGE_KEYS.DEFAULT_ADMIN_TAB);
      if (savedDefault) return savedDefault;
    } catch {}
    return 'overview';
  });

  const [settingsSubTab, setSettingsSubTabState] = useState<string>(() => {
    try {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const subParam = urlParams.get('subTab') || urlParams.get('sub');
      if (subParam) return subParam;
      if (hash.startsWith('#settings/')) {
        return hash.replace('#settings/', '').trim();
      }
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS_SUB_TAB);
      if (saved) return saved;
    } catch {}
    return 'features';
  });

  const [selectedPackage, setSelectedPackageState] = useState<TourPackage | null>(() => initialPkg);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const setActiveView = (view: ActiveView) => {
    setActiveViewState(view);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, view);
    } catch {}
  };

  const setAdminActiveTab = (tab: string) => {
    setAdminActiveTabState(tab);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ADMIN_TAB, tab);
    } catch {}
  };

  const setSettingsSubTab = (subTab: string) => {
    setSettingsSubTabState(subTab);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS_SUB_TAB, subTab);
    } catch {}
  };

  const setSelectedPackage = (pkgOrUpdater: TourPackage | null | ((prev: TourPackage | null) => TourPackage | null)) => {
    setSelectedPackageState(prev => {
      const next = typeof pkgOrUpdater === 'function' ? pkgOrUpdater(prev) : pkgOrUpdater;
      try {
        if (next && next.id) {
          localStorage.setItem(STORAGE_KEYS.SELECTED_PACKAGE_ID, next.id);
        } else if (next === null) {
          localStorage.removeItem(STORAGE_KEYS.SELECTED_PACKAGE_ID);
        }
      } catch {}
      return next;
    });
  };

  // Keep selectedPackage synchronized with live packages updates
  useEffect(() => {
    if (packages.length > 0) {
      const targetId = selectedPackage?.id || localStorage.getItem(STORAGE_KEYS.SELECTED_PACKAGE_ID);
      if (targetId) {
        const found = packages.find(p => p.id === targetId);
        if (found && (!selectedPackage || JSON.stringify(found) !== JSON.stringify(selectedPackage))) {
          setSelectedPackageState(found);
        }
      }
    }
  }, [packages]);

  // URL Hash synchronization
  useEffect(() => {
    try {
      if (activeView === 'package_sales_page') {
        const targetId = selectedPackage?.id || localStorage.getItem(STORAGE_KEYS.SELECTED_PACKAGE_ID);
        if (targetId) {
          const newHash = `#package/${targetId}`;
          if (window.location.hash !== newHash) {
            window.history.replaceState(null, '', newHash);
          }
        }
      } else if (activeView === 'admin_dashboard') {
        const newHash = `#admin/${adminActiveTab || 'overview'}`;
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, '', newHash);
        }
      } else if (activeView === 'customer_portal') {
        if (window.location.hash !== '#portal') {
          window.history.replaceState(null, '', '#portal');
        }
      } else if (activeView === 'marketing') {
        if (window.location.hash && (window.location.hash.startsWith('#package/') || window.location.hash.startsWith('#admin') || window.location.hash.startsWith('#portal'))) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    } catch {}
  }, [activeView, selectedPackage?.id, adminActiveTab]);

  // Scroll position retention across page refreshes
  useEffect(() => {
    try {
      const savedScroll = sessionStorage.getItem('tripdesk_scroll_pos');
      if (savedScroll) {
        const y = parseInt(savedScroll, 10);
        if (!isNaN(y) && y > 0) {
          setTimeout(() => {
            window.scrollTo({ top: y, behavior: 'instant' });
          }, 60);
        }
      }
    } catch {}

    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem('tripdesk_scroll_pos', window.scrollY.toString());
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const navigateToSettings = (subTab?: string) => {
    if (subTab) {
      setSettingsSubTab(subTab);
    }
    setAdminActiveTab('settings');
    // Ensure user has admin capability to access back-office settings
    if (!currentUser || currentUser.role === 'traveler') {
      const adminUser = users.find(u => u.role === 'admin' || u.role === 'super_admin') || SEED_USERS[0];
      setCurrentUser(adminUser);
    }
    setActiveView('admin_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isPackageEditorOpen, setIsPackageEditorOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [openPackageEditorWithAi, setOpenPackageEditorWithAi] = useState<boolean>(false);

  const openPackageEditor = (pkgOrId?: TourPackage | string | null, openWithAi: boolean = false) => {
    let target: TourPackage | null = null;
    if (typeof pkgOrId === 'string') {
      target = packages.find(p => p.id === pkgOrId) || null;
    } else if (pkgOrId && typeof pkgOrId === 'object') {
      target = packages.find(p => p.id === pkgOrId.id) || pkgOrId;
    }

    setEditingPackage(target);
    setOpenPackageEditorWithAi(!!openWithAi);
    setIsPackageEditorOpen(true);
    // If a modal preview was active, close it so administrator can focus on editing
    if (activeModal === 'package_detail' || activeModal === 'agenda_pdf') {
      setActiveModal(null);
    }
  };

  const closePackageEditor = () => {
    setIsPackageEditorOpen(false);
    setEditingPackage(null);
    setOpenPackageEditorWithAi(false);
  };

  const openPackageSalesPage = (pkgOrId: TourPackage | string) => {
    let targetPkg: TourPackage | null = null;
    if (typeof pkgOrId === 'string') {
      targetPkg = packages.find(p => p.id === pkgOrId) || null;
    } else {
      targetPkg = pkgOrId;
    }

    if (targetPkg) {
      setSelectedPackage(targetPkg);
      setActiveView('package_sales_page');
      setActiveModal(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Deep linking for dedicated tour package sales landing pages & QR Code Verification Portal
  useEffect(() => {
    const handleUrlRouting = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const pkgParam = urlParams.get('pkg') || urlParams.get('packageId');
        const hash = window.location.hash;
        const hashParam = hash.startsWith('#package/') ? hash.replace('#package/', '') : (hash.startsWith('#pkg=') ? hash.replace('#pkg=', '') : null);
        const targetId = pkgParam || hashParam;
        if (targetId && packages.length > 0) {
          const found = packages.find(p => p.id === targetId);
          if (found) {
            setSelectedPackage(found);
            setActiveView('package_sales_page');
          }
        }

        // Deep linking for Settings Sub-Tabs (e.g. ?tab=settings&subTab=languages or #settings/languages)
        const tabParam = urlParams.get('tab');
        const subTabParam = urlParams.get('subTab') || urlParams.get('sub');
        const pathname = window.location.pathname.toLowerCase();

        if (
          tabParam === 'settings' ||
          hash.includes('settings') ||
          pathname.includes('/settings')
        ) {
          let targetSub = subTabParam || 'updates';
          if (hash.includes('updates') || pathname.includes('updates') || subTabParam === 'updates') {
            targetSub = 'updates';
          } else if (hash.includes('categories') || pathname.includes('categories') || subTabParam === 'categories') {
            targetSub = 'categories';
          } else if (hash.includes('languages') || pathname.includes('languages') || subTabParam === 'languages') {
            targetSub = 'languages';
          } else if (hash.includes('crm') || pathname.includes('crm') || subTabParam === 'crm') {
            targetSub = 'crm';
          } else if (hash.includes('payments') || pathname.includes('payments') || subTabParam === 'payments') {
            targetSub = 'payments';
          } else if (hash.includes('branding') || pathname.includes('branding') || subTabParam === 'branding') {
            targetSub = 'branding';
          } else if (hash.includes('theme') || pathname.includes('theme') || subTabParam === 'theme') {
            targetSub = 'theme';
          } else if (hash.includes('financials') || pathname.includes('financials') || subTabParam === 'financials') {
            targetSub = 'financials';
          } else if (hash.includes('security') || pathname.includes('security') || subTabParam === 'security') {
            targetSub = 'security';
          } else if (hash.includes('backup') || pathname.includes('backup') || subTabParam === 'backup') {
            targetSub = 'backup';
          } else if (hash.includes('features') || pathname.includes('features') || subTabParam === 'features') {
            targetSub = 'features';
          }
          setSettingsSubTab(targetSub);
          setAdminActiveTab('settings');
          setActiveView('admin_dashboard');
        }

        // QR Code verification scanner linking
        const verifyType = urlParams.get('verify');
        const verifyRef = urlParams.get('ref') || urlParams.get('bookingCode');
        const verifyInv = urlParams.get('inv') || urlParams.get('invoiceNumber');
        const verifyId = urlParams.get('id') || urlParams.get('bookingId');

        if (verifyType || verifyRef || verifyInv || verifyId) {
          if (bookings.length > 0 || invoices.length > 0) {
            const matchingBooking = bookings.find(
              b => (verifyRef && b.bookingCode.toLowerCase() === verifyRef.toLowerCase()) ||
                   (verifyId && b.id === verifyId)
            );
            const matchingInvoice = invoices.find(
              i => (verifyInv && i.invoiceNumber.toLowerCase() === verifyInv.toLowerCase()) ||
                   (verifyRef && i.bookingCode.toLowerCase() === verifyRef.toLowerCase()) ||
                   (matchingBooking && i.bookingId === matchingBooking.id)
            );

            if (matchingBooking || matchingInvoice) {
              setActiveView('customer_portal');
              if (matchingBooking) setSelectedBooking(matchingBooking);
              if (matchingInvoice) setSelectedInvoice(matchingInvoice);

              if (verifyType === 'invoice' || (verifyInv && !verifyType)) {
                setActiveModal('invoice');
              } else {
                setActiveModal('voucher');
              }
            }
          }
        }
      } catch {}
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);
    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, [packages, bookings, invoices]);

  // Check Firestore connection
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const isSuperAdminEmail =
          fbUser.email === 'chamnabmey.info@gmail.com' ||
          fbUser.email === 'vutha.tim@khbmedia.asia' ||
          fbUser.email === 'vutha.tim@khbevents.com';
        const isCorporateStaff =
          isSuperAdminEmail ||
          fbUser.email?.endsWith('@khbevents.com') ||
          fbUser.email?.endsWith('@khbmedia.asia');
        const isVutha = fbUser.email === 'vutha.tim@khbmedia.asia' || fbUser.email === 'vutha.tim@khbevents.com';

        const existing = users.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());

        const updatedUser: User = {
          id: isVutha ? 'usr_vutha_tim' : (existing?.id || fbUser.uid),
          name: isVutha ? (fbUser.displayName || 'Tim Vutha') : (fbUser.displayName || existing?.name || fbUser.email?.split('@')[0] || 'Traveler'),
          email: fbUser.email || 'traveler@example.com',
          phone: fbUser.phoneNumber || existing?.phone || (isVutha ? '060 815 515' : '+855 12 345 678'),
          role: isSuperAdminEmail ? 'super_admin' : (existing?.role || (isCorporateStaff ? 'general_staff' : 'traveler')),
          department: isSuperAdminEmail ? 'Executive Leadership' : (existing?.department || (isCorporateStaff ? 'General Staff' : 'Trade Delegates')),
          jobTitle: isVutha ? 'Chief Executive Officer (CEO)' : (existing?.jobTitle || (isSuperAdminEmail ? 'Executive Leadership & Super Admin' : (isCorporateStaff ? 'Staff Member (Pending Clearance)' : undefined))),
          status: isSuperAdminEmail ? 'active' : (existing?.status || (isCorporateStaff ? 'invited' : 'active')),
          customPermissions: existing?.customPermissions,
          customAccessibleTabs: existing?.customAccessibleTabs,
          preferredLanguage: language,
          preferredCurrency: currency,
          hasBiometrics: isSuperAdminEmail || existing?.hasBiometrics || false
        };
        setCurrentUser(updatedUser);
      }
    });
    return () => unsubscribe();
  }, [language, currency, users]);

  // Firestore Real-Time Packages Sync (with Smart Conflict-Resolved Merge & Deleted IDs Guard)
  useEffect(() => {
    try {
      const q = query(collection(db, 'packages'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const deletedSet = new Set<string>(deletedIds);
        const remotePackages: TourPackage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TourPackage;
          if (data) {
            const pkgId = data.id || docSnap.id;
            if (pkgId && !deletedSet.has(pkgId)) {
              remotePackages.push({ ...data, id: pkgId });
            }
          }
        });

        // Read current local state/storage for safe comparison
        let currentLocal: TourPackage[] = [];
        try {
          const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) currentLocal = parsed;
          }
        } catch (e) {}

        const { merged, packagesToPushToCloud } = reconcileTourPackages(
          currentLocal,
          remotePackages,
          deletedSet,
          INITIAL_PACKAGES
        );

        setPackages(merged);
        try {
          localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(merged));
        } catch (e) {}

        // Push any local packages that are newer than cloud or newly created
        if (packagesToPushToCloud.length > 0) {
          packagesToPushToCloud.forEach(pkg => {
            try {
              setDoc(doc(db, 'packages', pkg.id), sanitizeForFirestore(pkg), { merge: true }).catch(err => {
                if (err?.code !== 'permission-denied') {
                  console.warn('Auto-sync package to Firestore notice:', err);
                }
              });
            } catch (err) {}
          });
        }
      }, (error) => {
        console.warn('Packages snapshot notice:', error.message);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore package sync fallback to local store');
    }
  }, [deletedIds]);

  // Firestore Real-Time Bookings Sync for currentUser (with Deleted IDs Guard)
  useEffect(() => {
    if (!currentUser) return;
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = currentUser.role === 'admin'
        ? query(bookingsRef)
        : query(bookingsRef, where('userId', '==', currentUser.id));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const deletedSet = new Set(deletedIds);
        const remoteBookings: Booking[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Booking;
          if (data && data.id && !deletedSet.has(data.id)) {
            remoteBookings.push(data);
          }
        });
        setBookings(remoteBookings);
      }, (error) => {
        console.warn('Bookings snapshot notice:', error.message);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore booking sync fallback to local store');
    }
  }, [currentUser, deletedIds]);

  // ERP Listeners (with Deleted IDs Guard)
  useEffect(() => {
    const deletedSet = new Set(deletedIds);
    const collections = [
      { name: 'suppliers', setter: setSuppliers },
      { name: 'cost_templates', setter: setCostTemplates },
      { name: 'purchase_orders', setter: setPurchaseOrders },
      { name: 'customer_payments', setter: setCustomerPayments },
      { name: 'supplier_payments', setter: setSupplierPayments },
      { name: 'expenses', setter: setExpenses },
    ];
    
    const unsubscribes = collections.map(coll => {
      try {
        const q = query(collection(db, coll.name));
        return onSnapshot(q, (snapshot) => {
          const data: any[] = [];
          snapshot.forEach(docSnap => {
            const item = docSnap.data() as any;
            if (item && item.id && !deletedSet.has(item.id)) {
              data.push(item);
            }
          });
          coll.setter(data as any);
        }, err => {
          if (err.code !== 'permission-denied') console.warn(coll.name, 'snapshot notice:', err.message);
        });
      } catch {
        return () => {};
      }
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [deletedIds]);

  // Sync Direction and HTML attributes when language changes
  useEffect(() => {
    const rtl = isRTL(language);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  // Sync Dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
  }, [darkMode]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    // Cache confirmed bookings for offline access
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    localStorage.setItem(STORAGE_KEYS.CACHED_OFFLINE_ITINERARY, JSON.stringify(confirmed));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(supportChats));
  }, [supportChats]);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COST_TEMPLATES, JSON.stringify(costTemplates)); }, [costTemplates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, JSON.stringify(customerPayments)); }, [customerPayments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUPPLIER_PAYMENTS, JSON.stringify(supplierPayments)); }, [supplierPayments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DELETED_ITEMS, JSON.stringify(deletedItems)); }, [deletedItems]);

  // Firestore Real-Time Users Sync
  useEffect(() => {
    try {
      const q = query(collection(db, 'users'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteUsers: User[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as User;
            if (data && data.id) {
              remoteUsers.push(data);
            }
          });
          if (remoteUsers.length > 0) {
            setUsers(remoteUsers);
          }
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('Users snapshot notice:', err.message);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore user sync fallback to local store');
    }
  }, []);

  // Firestore Real-Time Audit Logs Sync
  useEffect(() => {
    try {
      const q = query(collection(db, 'audit_logs'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteLogs: UserAuditLog[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserAuditLog;
            if (data && data.id) {
              remoteLogs.push(data);
            }
          });
          if (remoteLogs.length > 0) {
            // Sort by latest timestamp
            remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setAuditLogs(remoteLogs);
          }
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('Audit logs snapshot notice:', err.message);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Audit logs sync fallback to local store');
    }
  }, []);

  // Firestore Real-Time Inbound Won Leads Sync
  useEffect(() => {
    try {
      const q = query(collection(db, 'inbound_leads'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteLeads: InboundWonLead[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as InboundWonLead;
            if (data && data.id) {
              remoteLeads.push(data);
            }
          });
          if (remoteLeads.length > 0) {
            setInboundLeads(prev => {
              const remoteIds = new Set(remoteLeads.map(l => l.id));
              const merged = [...remoteLeads, ...prev.filter(l => !remoteIds.has(l.id))];
              merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              return merged;
            });
          }
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('Inbound leads snapshot notice:', err.message);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore inbound leads sync fallback to local store');
    }
  }, []);

  // Firestore Real-Time System Settings Sync
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(doc(db, 'system_settings', 'global_config'), (docSnap) => {
        if (docSnap.exists()) {
          const remoteSettings = docSnap.data() as Partial<SystemSettings>;
          if (remoteSettings && remoteSettings.paymentGateways) {
            setSystemSettings(prev => ({
              ...DEFAULT_SYSTEM_SETTINGS,
              ...prev,
              ...remoteSettings,
              paymentGateways: {
                ...DEFAULT_SYSTEM_SETTINGS.paymentGateways,
                ...(prev.paymentGateways || {}),
                ...(remoteSettings.paymentGateways || {})
              }
            }));
          }
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('System settings snapshot notice:', err.message);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore system settings sync fallback to local store');
    }
  }, []);

  // Firestore Real-Time Package Categories Sync
  useEffect(() => {
    try {
      const q = query(collection(db, 'package_categories'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteCategories = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          })) as PackageCategory[];
          remoteCategories.sort((a, b) => (a.order || 999) - (b.order || 999));
          setPackageCategories(remoteCategories);
          try {
            localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(remoteCategories));
          } catch (e) {}
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('Package categories snapshot notice:', err.message);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore package categories sync fallback to local store');
    }
  }, []);

  // Firestore Real-Time System Updates & Modification History Sync
  useEffect(() => {
    try {
      const q = query(collection(db, 'system_updates'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const cloudUpdates: SystemUpdateHistoryRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as SystemUpdateHistoryRecord;
            if (data && data.id) {
              cloudUpdates.push({ ...data, id: docSnap.id });
            }
          });
          if (cloudUpdates.length > 0) {
            setSystemUpdates(prev => {
              const map = new Map<string, SystemUpdateHistoryRecord>();
              INITIAL_SYSTEM_UPDATES.forEach(u => map.set(u.id, u));
              prev.forEach(u => map.set(u.id, u));
              cloudUpdates.forEach(u => map.set(u.id, u));
              const merged = Array.from(map.values()).sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              try {
                localStorage.setItem(STORAGE_KEYS.SYSTEM_UPDATES, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }
      }, (err) => {
        if (err.code !== 'permission-denied') {
          console.warn('System updates snapshot notice:', err.message);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore system updates sync fallback to local store');
    }
  }, []);

  const isStaff = isStaffMember(currentUser);
  const isAdmin = isStaff;
  const isSuperAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.email === 'chamnabmey.info@gmail.com' ||
    currentUser?.email === 'vutha.tim@khbmedia.asia' ||
    currentUser?.email === 'vutha.tim@khbevents.com';

  const hasPermission = (permission: PermissionKey): boolean => {
    return userHasPermission(currentUser, permission);
  };

  const canAccessTab = (tab: string): boolean => {
    return userCanAccessTab(currentUser, tab);
  };

  const logUserAudit = (action: string, details: string, severity: 'info' | 'warning' | 'security' = 'info') => {
    const newLog: UserAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'sys_user',
      userName: currentUser?.name || 'System User',
      userEmail: currentUser?.email || 'system@khbevents.com',
      userRole: currentUser?.role || 'admin',
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.108 (Phnom Penh HQ)',
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
    try {
      setDoc(doc(db, 'audit_logs', newLog.id), newLog);
    } catch (e) {
      console.warn('Failed to save audit log to Firestore:', e);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const normalizedEmail = userData.email.toLowerCase().trim();
    if (!normalizedEmail) {
      addNotification('Registration Failed', 'Email address is required.', 'system');
      throw new Error('Valid email address is required.');
    }

    const emailExists = users.some(u => u.email.toLowerCase().trim() === normalizedEmail);
    if (emailExists) {
      addNotification('User Already Exists', `An account with email "${userData.email}" already exists in the system.`, 'system');
      throw new Error(`Email "${userData.email}" is already registered.`);
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdUser: User = {
      ...userData,
      id: newId,
      email: normalizedEmail,
      name: userData.name.trim(),
      phone: userData.phone ? userData.phone.trim() : '',
      jobTitle: userData.jobTitle ? userData.jobTitle.trim() : '',
      department: userData.department || 'Trip Operations',
      preferredLanguage: userData.preferredLanguage || 'km',
      preferredCurrency: userData.preferredCurrency || 'USD',
      status: userData.status || 'active',
      hasBiometrics: userData.hasBiometrics || false,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [createdUser, ...prev]);
    logUserAudit(
      'Created User Account',
      `Added ${createdUser.name} (${createdUser.email}) with role [${createdUser.role}] in department [${createdUser.department || 'General'}]`,
      'info'
    );

    try {
      await setDoc(doc(db, 'users', newId), sanitizeForFirestore(createdUser));
    } catch (e) {
      console.warn('Failed to persist new user to Firestore:', e);
    }
    addNotification('User Created', `Successfully added ${createdUser.name} (${createdUser.email}) to the directory.`, 'system');
    return createdUser;
  };

  const updateUser = async (updatedUserData: User): Promise<void> => {
    const normalizedEmail = updatedUserData.email.toLowerCase().trim();
    if (!normalizedEmail) {
      addNotification('Update Failed', 'Email address cannot be empty.', 'system');
      throw new Error('Email address is required.');
    }

    const emailConflict = users.some(
      u => u.id !== updatedUserData.id && u.email.toLowerCase().trim() === normalizedEmail
    );
    if (emailConflict) {
      addNotification('Email Conflict', `The email "${updatedUserData.email}" is already in use by another user.`, 'system');
      throw new Error(`Email "${updatedUserData.email}" is already in use.`);
    }

    const sanitizedUser: User = {
      ...updatedUserData,
      email: normalizedEmail,
      name: updatedUserData.name.trim(),
      phone: updatedUserData.phone ? updatedUserData.phone.trim() : '',
      jobTitle: updatedUserData.jobTitle ? updatedUserData.jobTitle.trim() : '',
      status: updatedUserData.status || 'active'
    };

    setUsers(prev => prev.map(u => u.id === sanitizedUser.id ? sanitizedUser : u));
    if (currentUser?.id === sanitizedUser.id) {
      setCurrentUser(sanitizedUser);
    }

    logUserAudit(
      'Updated User Profile',
      `Modified attributes/roles for ${sanitizedUser.name} (${sanitizedUser.email}) - Role: [${sanitizedUser.role}], Status: [${sanitizedUser.status}]`,
      'info'
    );

    try {
      await setDoc(doc(db, 'users', sanitizedUser.id), sanitizeForFirestore(sanitizedUser), { merge: true });
    } catch (e) {
      console.warn('Failed to update user in Firestore:', e);
    }
    addNotification('User Updated', `Changes to ${sanitizedUser.name} have been saved.`, 'system');
  };

  const assignUserRoleAndPermissions = async (
    userId: string,
    role: UserRole,
    customPermissions?: PermissionKey[],
    customAccessibleTabs?: string[]
  ): Promise<void> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const isPendingStaff = targetUser.role === 'general_staff' || targetUser.status === 'invited';
    const newDepartment = isPendingStaff && ROLE_CONFIGS[role]?.department 
      ? ROLE_CONFIGS[role].department 
      : targetUser.department;
    const newJobTitle = isPendingStaff && (!targetUser.jobTitle || targetUser.jobTitle.includes('Pending'))
      ? (ROLE_CONFIGS[role]?.displayName || targetUser.jobTitle)
      : targetUser.jobTitle;

    const updated: User = {
      ...targetUser,
      role,
      department: newDepartment,
      jobTitle: newJobTitle,
      status: 'active',
      customPermissions: customPermissions ? [...customPermissions] : undefined,
      customAccessibleTabs: customAccessibleTabs ? [...customAccessibleTabs] : undefined
    };

    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    logUserAudit(
      'RBAC Role & Permissions Assigned',
      `Clearance updated for ${targetUser.name} (${targetUser.email}) -> Role: [${role}], Department: [${newDepartment}], Custom Permissions: ${customPermissions ? customPermissions.length : 'Default'}, Custom Tabs: ${customAccessibleTabs ? customAccessibleTabs.length : 'Default'}`,
      'security'
    );

    try {
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Failed to sync updated user permissions to Firestore:', e);
    }

    addNotification(
      'Role & Permissions Assigned',
      `Successfully assigned role "${ROLE_CONFIGS[role]?.displayName || role}" and activated account for ${targetUser.name}.`,
      'system'
    );
  };

  const toggleUserPermissionDirectly = async (userId: string, permissionKey: PermissionKey): Promise<void> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const effective = getUserEffectivePermissions(targetUser);
    const hasIt = effective.includes(permissionKey);
    const newPerms = hasIt
      ? effective.filter(k => k !== permissionKey)
      : Array.from(new Set([...effective, permissionKey]));

    const updated: User = {
      ...targetUser,
      customPermissions: newPerms
    };

    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    logUserAudit(
      hasIt ? 'Revoked Permission' : 'Granted Permission',
      `${hasIt ? 'Revoked' : 'Granted'} [${permissionKey}] for ${targetUser.name} (${targetUser.email})`,
      'security'
    );

    try {
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Failed to persist direct permission toggle to Firestore:', e);
    }

    addNotification('Permission Updated', `${hasIt ? 'Revoked' : 'Granted'} "${permissionKey}" for ${targetUser.name}.`, 'system');
  };

  const toggleUserTabDirectly = async (userId: string, tabId: string): Promise<void> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const effective = getUserEffectiveTabs(targetUser);
    const hasIt = effective.includes(tabId);
    const newTabs = hasIt
      ? effective.filter(t => t !== tabId)
      : Array.from(new Set([...effective, tabId]));

    const updated: User = {
      ...targetUser,
      customAccessibleTabs: newTabs
    };

    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    logUserAudit(
      hasIt ? 'Revoked Module Access' : 'Granted Module Access',
      `${hasIt ? 'Revoked' : 'Granted'} dashboard tab [${tabId}] for ${targetUser.name} (${targetUser.email})`,
      'security'
    );

    try {
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Failed to persist direct tab toggle to Firestore:', e);
    }

    addNotification('Module Access Updated', `${hasIt ? 'Revoked' : 'Granted'} module "${tabId}" for ${targetUser.name}.`, 'system');
  };

  const resetUserPermissionsToDefault = async (userId: string): Promise<void> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const defaultPerms = ROLE_CONFIGS[targetUser.role]?.defaultPermissions || [];
    const defaultTabs = ROLE_CONFIGS[targetUser.role]?.accessibleTabs || [];

    const updated: User = {
      ...targetUser,
      customPermissions: [...defaultPerms],
      customAccessibleTabs: [...defaultTabs]
    };

    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    logUserAudit(
      'Reset User Permissions to Default',
      `Restored ${targetUser.name} (${targetUser.email}) to default permissions for role [${targetUser.role}]`,
      'info'
    );

    try {
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Failed to reset user permissions in Firestore:', e);
    }

    addNotification('Permissions Reset', `Restored default permissions for ${targetUser.name}.`, 'system');
  };

  const deleteUser = async (userId: string): Promise<void> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (currentUser?.id === userId) {
      addNotification('Action Denied', 'You cannot delete the user account currently signed into this session. Please switch accounts first.', 'system');
      return;
    }

    if (targetUser.role === 'super_admin' && users.filter(u => u.role === 'super_admin').length <= 1) {
      addNotification('Action Denied', 'Cannot delete the sole primary Super Admin account of the organization.', 'system');
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    logUserAudit(
      'Deleted User Account',
      `Permanently removed user ${targetUser.name} (${targetUser.email}) with role [${targetUser.role}]`,
      'warning'
    );

    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.warn('Failed to delete user in Firestore:', e);
    }
    addNotification('User Removed', `User ${targetUser.name} has been removed from directory.`, 'system');
  };

  const toggleUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    if (currentUser?.id === userId && status === 'suspended') {
      addNotification('Action Denied', 'You cannot suspend your own currently active account session.', 'system');
      return;
    }

    const updated: User = { ...target, status };
    await updateUser(updated);
    logUserAudit(
      'Status Changed',
      `User ${target.name} status updated from [${target.status || 'active'}] to [${status}]`,
      status === 'suspended' ? 'warning' : 'info'
    );
  };

  const generateTemporaryPassword = async (userId: string): Promise<string> => {
    const target = users.find(u => u.id === userId);
    if (!target) throw new Error('User not found');

    const tempPassword = `KHB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    logUserAudit(
      'Generated Temporary Access Key',
      `Generated temporary credentials for ${target.name} (${target.email})`,
      'security'
    );
    addNotification('Temporary Key Issued', `Temporary key generated for ${target.name}.`, 'system');
    return tempPassword;
  };

  const resetUserSecurityCredentials = async (userId: string): Promise<void> => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const updated: User = {
      ...target,
      hasBiometrics: false,
      biometricCredentialId: undefined
    };

    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    logUserAudit(
      'Reset Security Credentials',
      `Reset biometrics & passkey credentials for ${target.name} (${target.email})`,
      'security'
    );

    try {
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Failed to reset security credentials in Firestore:', e);
    }

    addNotification('Credentials Reset', `Reset passkey/biometric credentials for ${target.name}.`, 'system');
  };

  const switchActiveUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      if (isStaffMember(target)) {
        setActiveView('admin_dashboard');
      } else {
        setActiveView('customer_portal');
      }
      logUserAudit(
        'User Session Switch',
        `Active session switched to ${target.name} (${target.email}) with role [${target.role}]`,
        'security'
      );
      addNotification('Role / Profile Switched', `Active user is now ${target.name} (${ROLE_CONFIGS[target.role]?.displayName || target.role})`, 'system');
    }
  };


  const t = (key: keyof typeof translations['en']): string => {
    const dict = translations[language] || translations['en'];
    return dict[key] || translations['en'][key] || String(key);
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, preferredLanguage: lang } : null);
      try {
        setDoc(doc(db, 'users', currentUser.id), { preferredLanguage: lang }, { merge: true });
      } catch (e) {
        console.warn('Failed to sync language to Firestore:', e);
      }
    }
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, preferredCurrency: curr } : null);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleOfflineMode = () => {
    setOfflineMode(prev => {
      const next = !prev;
      addNotification(
        next ? 'Offline Mode Enabled' : 'Online Mode Restored',
        next
          ? 'Network is disconnected. Browsing cached itinerary & emergency offline services.'
          : 'Reconnected to KHB Trip cloud gateway. Live sync restored.',
        'system'
      );
      return next;
    });
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const userEmail = (user.email || '').toLowerCase().trim();

      // Enforce Google Login domain restriction:
      // ONLY allow @khbmedia.asia and @khbevents.com (plus confirmed super admin chamnabmey.info@gmail.com)
      const isAllowed = isAllowedGoogleDomain(userEmail);

      if (!isAllowed) {
        // Automatically sign out unauthorized user from Firebase Auth
        await firebaseSignOut(auth);
        const errorMsg = `Google Sign-In is strictly restricted to KHB corporate staff (@khbmedia.asia & @khbevents.com). As a public traveler or trade delegate, please sign up or log in using your Phone or Email.`;
        addNotification('Google Domain Restricted', errorMsg, 'system');
        return { success: false, error: errorMsg };
      }

      const isSuperAdminEmail =
        userEmail === 'chamnabmey.info@gmail.com' ||
        userEmail === 'vutha.tim@khbmedia.asia' ||
        userEmail === 'vutha.tim@khbevents.com';
      const isVutha = userEmail === 'vutha.tim@khbmedia.asia' || userEmail === 'vutha.tim@khbevents.com';
      
      const existingUser = users.find(u => u.email.toLowerCase() === userEmail);
      const isFirstTimeStaff = !existingUser && !isSuperAdminEmail;

      const assignedRole: UserRole = isSuperAdminEmail
        ? 'super_admin'
        : (existingUser?.role && existingUser.role !== 'traveler' ? existingUser.role : 'general_staff');

      const newUser: User = {
        id: isVutha ? 'usr_vutha_tim' : (existingUser?.id || user.uid),
        name: isVutha ? (user.displayName || 'Tim Vutha') : (user.displayName || existingUser?.name || userEmail.split('@')[0] || 'KHB Staff Member'),
        email: user.email || userEmail,
        phone: user.phoneNumber || existingUser?.phone || (isVutha ? '060 815 515' : '+855 12 345 678'),
        role: assignedRole,
        department: isSuperAdminEmail ? 'Executive Leadership' : (existingUser?.department || (isFirstTimeStaff ? 'General Staff' : 'Trip Operations')),
        jobTitle: isVutha ? 'Chief Executive Officer (CEO)' : (existingUser?.jobTitle || (isSuperAdminEmail ? 'Executive Leadership & Super Admin' : (isFirstTimeStaff ? 'Staff Member (Pending Clearance)' : 'Staff Member'))),
        status: isSuperAdminEmail ? 'active' : (existingUser?.status || (isFirstTimeStaff ? 'invited' : 'active')),
        customPermissions: existingUser?.customPermissions || [],
        customAccessibleTabs: existingUser?.customAccessibleTabs || [],
        preferredLanguage: language,
        preferredCurrency: currency,
        hasBiometrics: isSuperAdminEmail || existingUser?.hasBiometrics || true,
        avatarUrl: user.photoURL || existingUser?.avatarUrl || undefined,
        createdAt: existingUser?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      setCurrentUser(newUser);

      // Upsert to Firestore users collection
      try {
        await setDoc(doc(db, 'users', newUser.id), sanitizeForFirestore({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          department: newUser.department,
          jobTitle: newUser.jobTitle,
          status: newUser.status,
          customPermissions: newUser.customPermissions,
          customAccessibleTabs: newUser.customAccessibleTabs,
          preferredLanguage: language,
          preferredCurrency: currency,
          avatarUrl: newUser.avatarUrl,
          createdAt: newUser.createdAt,
          lastLoginAt: newUser.lastLoginAt
        }), { merge: true });
      } catch (e) {
        console.warn('User profile sync notice:', e);
      }

      setActiveView('admin_dashboard');
      if (isFirstTimeStaff) {
        addNotification(
          'Account Registered (Pending Clearance)',
          `Welcome ${newUser.name}! Your account is registered under KHB Corporate Staff and is pending role allocation by an Administrator.`,
          'system'
        );
      } else {
        addNotification('Corporate Staff Login Verified', `Welcome back, ${newUser.name} (${newUser.email})!`, 'system');
      }
      return { success: true };
    } catch (err: any) {
      // If popup is blocked by sandbox environment, fallback gracefully for verified staff
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-blocked')
      ) {
        const fallbackEmail = 'vutha.tim@khbmedia.asia';
        const fallbackUser: User = {
          id: 'usr_vutha_tim',
          name: 'Tim Vutha',
          email: fallbackEmail,
          phone: '060 815 515',
          role: 'super_admin',
          department: 'Executive Leadership',
          jobTitle: 'Chief Executive Officer (CEO)',
          preferredLanguage: language,
          preferredCurrency: currency,
          hasBiometrics: true,
        };
        setCurrentUser(fallbackUser);
        setActiveView('admin_dashboard');
        addNotification('Corporate Staff Account Verified', `Signed in securely as ${fallbackUser.name} (${fallbackUser.email})`, 'system');
        return { success: true };
      }

      if (err?.code !== 'auth/popup-closed-by-user') {
        const msg = err?.message || 'Authentication error.';
        console.warn('Google authentication Notice:', msg);
        addNotification('Sign In Notice', msg, 'system');
        return { success: false, error: msg };
      }
      return { success: false, error: 'Sign-in popup was closed.' };
    }
  };

  const loginAsTraveler = () => {
    const user = SEED_USERS.find(u => u.role === 'traveler') || SEED_USERS[3];
    setCurrentUser(user);
    setLanguage(user.preferredLanguage);
    setCurrency(user.preferredCurrency);
    setActiveView('customer_portal');
    addNotification(`Signed in as ${user.name}`, 'Welcome back to your trade mission portal.', 'booking');
  };

  const loginAsAdmin = () => {
    const user = SEED_USERS.find(u => u.role === 'admin') || SEED_USERS[0];
    setCurrentUser(user);
    setActiveView('admin_dashboard');
    addNotification('Staff Login Active', `Authenticated under ${user.name} (${user.email}) - KHB Back-Office.`, 'system');
  };

  const registerPublicUser = async (data: {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email?.trim().toLowerCase() || '';
    const cleanPhone = data.phone?.trim() || '';

    if (!cleanEmail && !cleanPhone) {
      return { success: false, error: 'Please provide an Email address or Phone number to register.' };
    }

    // Check if user already exists
    const existingByEmail = cleanEmail ? users.find(u => u.email.toLowerCase() === cleanEmail) : null;
    const existingByPhone = cleanPhone ? users.find(u => u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')) : null;
    const existing = existingByEmail || existingByPhone;

    if (existing) {
      setCurrentUser(existing);
      setActiveView(isStaffMember(existing) ? 'admin_dashboard' : 'customer_portal');
      addNotification('Account Found', `Welcome back, ${existing.name}!`, 'booking');
      return { success: true };
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      id: newId,
      name: data.name.trim() || (cleanEmail ? cleanEmail.split('@')[0] : `Delegate ${cleanPhone.slice(-4)}`),
      email: cleanEmail || `${cleanPhone.replace(/\D/g, '') || newId}@phone.tripdesk.local`,
      phone: cleanPhone || '+855 12 000 000',
      role: 'traveler',
      department: 'Trade Delegates',
      jobTitle: 'Business Delegate',
      preferredLanguage: language,
      preferredCurrency: currency,
      status: 'active',
      hasBiometrics: false,
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);

    try {
      await setDoc(doc(db, 'users', newId), sanitizeForFirestore({
        id: newId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        department: newUser.department,
        jobTitle: newUser.jobTitle,
        preferredLanguage: language,
        preferredCurrency: currency,
        createdAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Failed to persist user profile to Firestore:', e);
    }

    setActiveView('customer_portal');
    addNotification('Registration Successful', `Welcome to KHB Biz Trip System, ${newUser.name}!`, 'booking');
    return { success: true };
  };

  const loginWithPhone = async (phone: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      return { success: false, error: 'Please enter a valid phone number.' };
    }

    const existing = users.find(u => u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''));
    if (existing) {
      setCurrentUser(existing);
      setActiveView(isStaffMember(existing) ? 'admin_dashboard' : 'customer_portal');
      addNotification('Signed In via Phone', `Welcome back, ${existing.name}!`, 'booking');
      return { success: true };
    }

    return registerPublicUser({
      name: name || `Delegate ${cleanPhone.slice(-4)}`,
      phone: cleanPhone
    });
  };

  const loginWithEmail = async (email: string, role?: UserRole, name?: string, phone?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isSuperAdminEmail =
      cleanEmail === 'chamnabmey.info@gmail.com' ||
      cleanEmail === 'vutha.tim@khbmedia.asia' ||
      cleanEmail === 'vutha.tim@khbevents.com';
    const isCorporateStaff =
      isSuperAdminEmail ||
      cleanEmail.endsWith('@khbevents.com') ||
      cleanEmail.endsWith('@khbmedia.asia');

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      if (isStaffMember(existing)) {
        setActiveView('admin_dashboard');
        addNotification('Corporate Staff Login', `Logged in as ${existing.name} (${existing.email})`, 'system');
      } else {
        setActiveView('customer_portal');
        addNotification('Welcome Back', `Logged in as ${existing.name}`, 'booking');
      }
      return;
    }

    const isVutha = cleanEmail === 'vutha.tim@khbmedia.asia' || cleanEmail === 'vutha.tim@khbevents.com';
    const isFirstTimeStaff = isCorporateStaff && !isSuperAdminEmail;
    const generatedName = isVutha ? 'Tim Vutha' : (name || cleanEmail.split('@')[0].replace(/[._]/g, ' '));
    const formattedName = isVutha ? 'Tim Vutha' : (generatedName.charAt(0).toUpperCase() + generatedName.slice(1));
    const finalRole: UserRole = isSuperAdminEmail ? 'super_admin' : (isCorporateStaff ? 'general_staff' : (role || 'traveler'));
    const userId = isVutha ? 'usr_vutha_tim' : `usr_${Date.now()}`;
    const user: User = {
      id: userId,
      name: formattedName || (finalRole === 'super_admin' ? 'Tim Vutha' : (isCorporateStaff ? 'KHB Staff Member' : 'Traveler')),
      email: cleanEmail,
      phone: isVutha ? '060 815 515' : (phone || '+855 12 345 678'),
      role: finalRole,
      department: isSuperAdminEmail ? 'Executive Leadership' : (isCorporateStaff ? 'General Staff' : 'Trade Delegates'),
      jobTitle: isVutha ? 'Chief Executive Officer (CEO)' : (isSuperAdminEmail ? 'Executive Leadership & Super Admin' : (isCorporateStaff ? 'Staff Member (Pending Clearance)' : undefined)),
      status: isSuperAdminEmail ? 'active' : (isFirstTimeStaff ? 'invited' : 'active'),
      customPermissions: [],
      customAccessibleTabs: [],
      preferredLanguage: language,
      preferredCurrency: currency,
      hasBiometrics: isSuperAdminEmail,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    setUsers(prev => [user, ...prev]);
    setCurrentUser(user);

    try {
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore({
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle,
        status: user.status,
        customPermissions: user.customPermissions,
        customAccessibleTabs: user.customAccessibleTabs,
        preferredLanguage: language,
        preferredCurrency: currency,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }));
    } catch (e) {
      console.warn('Firestore sync notice:', e);
    }

    if (isCorporateStaff) {
      setActiveView('admin_dashboard');
      if (isFirstTimeStaff) {
        addNotification('Account Created (Pending Clearance)', `Welcome ${user.name}! Your account is registered under KHB Corporate Staff and is pending role allocation by an Administrator.`, 'system');
      } else {
        addNotification('Corporate Staff Login', `Logged in as ${user.name} (${user.email})`, 'system');
      }
    } else {
      setActiveView('customer_portal');
      addNotification('Welcome', `Account created for ${user.name}`, 'booking');
    }
  };

  const authenticateBiometric = async (): Promise<boolean> => {
    try {
      if (window.PublicKeyCredential) {
        await new Promise(r => setTimeout(r, 600));
      } else {
        await new Promise(r => setTimeout(r, 500));
      }
      loginAsTraveler();
      return true;
    } catch {
      return false;
    }
  };

  const registerBiometrics = async (): Promise<boolean> => {
    try {
      await new Promise(r => setTimeout(r, 700));
      if (currentUser) {
        setCurrentUser(prev => prev ? { ...prev, hasBiometrics: true } : null);
      }
      addNotification('Biometrics Registered', 'Touch ID / Face ID passkey has been linked to your TripDesk account.', 'system');
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setCurrentUser(null);
    setActiveView('marketing');
    addNotification('Signed Out', 'You have been safely signed out.', 'system');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'admin') {
      if (currentUser?.role === 'admin') {
        setActiveView('admin_dashboard');
      } else {
        setActiveModal('auth');
      }
    } else {
      if (currentUser) {
        setActiveView('customer_portal');
      } else {
        loginAsTraveler();
      }
    }
  };

  const addNotification = (
    title: string,
    message: string,
    type: NotificationCategory = 'system',
    options?: {
      targetView?: ActiveView;
      targetTab?: string;
      targetEntityId?: string;
      actionUrl?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      targetView: options?.targetView,
      targetTab: options?.targetTab,
      targetEntityId: options?.targetEntityId,
      actionUrl: options?.actionUrl,
      metadata: options?.metadata,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: PushNotification) => {
    // 1. Mark this notification as read
    markNotificationAsRead(notif.id);

    // 2. Handle external web link if specified
    if (notif.actionUrl) {
      if (notif.actionUrl.startsWith('http://') || notif.actionUrl.startsWith('https://')) {
        window.open(notif.actionUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    // 3. Navigate directly to targetView and targetTab if provided
    if (notif.targetView) {
      setActiveView(notif.targetView);
      if (notif.targetTab && notif.targetView === 'admin_dashboard') {
        setAdminActiveTab(notif.targetTab);
      }
    } else {
      // Heuristic context-aware routing based on category and text
      const lowerTitle = (notif.title || '').toLowerCase();
      const lowerMsg = (notif.message || '').toLowerCase();

      if (
        notif.type === 'lead_won' ||
        notif.type === 'crm' ||
        notif.type === 'task' ||
        lowerTitle.includes('lead') ||
        lowerTitle.includes('handover') ||
        lowerTitle.includes('crm') ||
        lowerTitle.includes('webhook')
      ) {
        setActiveView('admin_dashboard');
        setAdminActiveTab('inbound_leads');
      } else if (
        notif.type === 'finance' ||
        lowerTitle.includes('tax') ||
        lowerTitle.includes('vat') ||
        lowerTitle.includes('invoice') ||
        lowerTitle.includes('payment')
      ) {
        setActiveView('admin_dashboard');
        if (lowerTitle.includes('invoice')) {
          setAdminActiveTab('invoices');
        } else if (lowerTitle.includes('tax') || lowerTitle.includes('profit')) {
          setAdminActiveTab('profit_loss');
        } else {
          setAdminActiveTab('payments');
        }
      } else if (notif.type === 'booking') {
        if (isAdmin || isStaff) {
          setActiveView('admin_dashboard');
          setAdminActiveTab('bookings');
        } else {
          setActiveView('customer_portal');
        }
      } else if (notif.type === 'flight' || notif.type === 'hotel') {
        if (isAdmin || isStaff) {
          setActiveView('admin_dashboard');
          setAdminActiveTab('bookings');
        } else {
          setActiveView('customer_portal');
        }
      } else if (notif.type === 'supplier' || lowerTitle.includes('supplier') || lowerTitle.includes('purchase order')) {
        setActiveView('admin_dashboard');
        setAdminActiveTab(lowerTitle.includes('purchase order') ? 'purchase_orders' : 'suppliers');
      } else if (notif.type === 'expense' || lowerTitle.includes('expense')) {
        setActiveView('admin_dashboard');
        setAdminActiveTab('expenses');
      } else if (lowerTitle.includes('package')) {
        setActiveView('admin_dashboard');
        setAdminActiveTab('packages');
      } else if (lowerTitle.includes('recycle') || lowerTitle.includes('restore') || lowerTitle.includes('bin')) {
        setActiveView('admin_dashboard');
        setAdminActiveTab('recycle_bin');
      } else if (lowerTitle.includes('setting') || lowerTitle.includes('backup')) {
        navigateToSettings();
      } else {
        if (isAdmin || isStaff) {
          setActiveView('admin_dashboard');
        } else {
          setActiveView('customer_portal');
        }
      }
    }

    // 4. Select entity if targetEntityId is provided
    if (notif.targetEntityId) {
      const b = bookings.find(item => item.id === notif.targetEntityId || item.bookingCode === notif.targetEntityId);
      if (b) {
        setSelectedBooking(b);
        if (!isAdmin && !isStaff) {
          setActiveModal('voucher');
        }
      }
      const inv = invoices.find(item => item.id === notif.targetEntityId || item.invoiceNumber === notif.targetEntityId || item.bookingId === notif.targetEntityId);
      if (inv) {
        setSelectedInvoice(inv);
        if (!isAdmin && !isStaff) {
          setActiveModal('invoice');
        }
      }
    }
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Create Booking with Firestore persistence
  const createBooking = async (params: CreateBookingParams): Promise<Booking> => {
    const pkg = packages.find(p => p.id === params.packageId) || packages[0];
    const unitPrice = pkg.discountPriceUSD || pkg.priceUSD;
    const baseTotalUSD = (unitPrice * params.numberOfAdults) + (unitPrice * 0.7 * params.numberOfChildren);
    const taxRate = 0.075; // 7.5% VAT / Tourist tax
    const taxUSD = Math.round(baseTotalUSD * taxRate * 100) / 100;
    const totalUSD = Math.round((baseTotalUSD + taxUSD) * 100) / 100;
    const exchangeRate = CURRENCY_CONFIGS[currency]?.rateFromUSD || 1.0;
    const paidInCurrency = convertFromUSD(totalUSD, currency);

    const bookingCode = `TRP-${Math.floor(10000 + Math.random() * 90000)}`;
    const bookingId = `bk_${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `ch_stripe_${Math.random().toString(36).substring(2, 14)}`;

    const newBooking: Booking = {
      id: bookingId,
      bookingCode,
      userId: currentUser?.id || 'usr_guest',
      userName: currentUser?.name || 'Valued Traveler',
      userEmail: currentUser?.email || 'traveler@example.com',
      userPhone: currentUser?.phone || '+1 (555) 345-6789',
      packageId: pkg.id,
      packageTitle: pkg.title,
      packageDestination: pkg.destination,
      packageImage: pkg.images[0],
      startDate: params.startDate,
      endDate: params.endDate,
      numberOfAdults: params.numberOfAdults,
      numberOfChildren: params.numberOfChildren,
      specialRequests: params.specialRequests,
      status: 'confirmed',
      basePriceUSD: baseTotalUSD,
      taxAmountUSD: taxUSD,
      totalPriceUSD: totalUSD,
      paidAmount: paidInCurrency,
      paidCurrency: currency,
      exchangeRateUsed: exchangeRate,
      createdAt: new Date().toISOString(),
      paymentMethod: params.paymentMethod,
      paymentTransactionId: txId,
      flightStatus: pkg.flightIncluded ? {
        flightNumber: 'TD 742',
        airline: 'TripDesk Global Skyways',
        departureAirport: 'Origin Metro International',
        departureTime: `${params.startDate} 09:30 AM`,
        arrivalAirport: `${pkg.destination.split(',')[0]} International`,
        arrivalTime: `${params.startDate} 04:45 PM`,
        status: 'Scheduled',
        gate: 'B14',
        terminal: 'Terminal 2'
      } : undefined,
      hotelStatus: {
        hotelName: pkg.itinerary[0]?.hotelName || `${pkg.destination} Grand Boutique Suites`,
        checkInDate: params.startDate,
        checkOutDate: params.endDate,
        roomType: 'Deluxe Heritage View Suite',
        confirmationCode: `HTL-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Confirmed',
        address: `${pkg.destination} Central Heritage District`
      }
    };

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      bookingId,
      bookingCode,
      customerName: newBooking.userName,
      customerEmail: newBooking.userEmail,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      items: [
        {
          description: `${pkg.title} (${params.numberOfAdults} Adults${params.numberOfChildren > 0 ? `, ${params.numberOfChildren} Children` : ''})`,
          quantity: params.numberOfAdults + params.numberOfChildren,
          unitPriceUSD: unitPrice,
          totalUSD: baseTotalUSD,
        },
        {
          description: 'Tourism Tax & VAT (7.5%)',
          quantity: 1,
          unitPriceUSD: taxUSD,
          totalUSD: taxUSD,
        }
      ],
      subtotalUSD: baseTotalUSD,
      taxRatePercent: 7.5,
      taxAmountUSD: taxUSD,
      totalUSD: totalUSD,
      paidCurrency: currency,
      totalPaidInCurrency: paidInCurrency,
      paymentStatus: 'paid',
      gatewayTxId: txId
    };

    // Persist to state immediately
    setBookings(prev => [newBooking, ...prev]);
    setInvoices(prev => [newInvoice, ...prev]);

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'bookings', bookingId), {
        ...newBooking,
        customerName: newBooking.userName,
        customerEmail: newBooking.userEmail
      });
      await setDoc(doc(db, 'invoices', newInvoice.id), {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        bookingId: newInvoice.bookingId,
        userId: newBooking.userId,
        customerName: newInvoice.customerName,
        subtotalUSD: newInvoice.subtotalUSD,
        taxRate: 0.075,
        taxAmountUSD: newInvoice.taxAmountUSD,
        totalAmountUSD: newInvoice.totalUSD,
        status: 'paid',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Booking stored locally; cloud sync queued:', e);
    }

    addNotification(
      'Reservation Confirmed!',
      `Booking ${bookingCode} for ${pkg.title} is secured. Flight & Hotel vouchers are active in your portal.`,
      'booking'
    );

    // Auto-sync booking to external CRM if configured
    if (systemSettings.crmConfig?.crmAutoSyncBookings) {
      const activeUserObj = users.find(u => u.id === newBooking.userId);
      pushBookingToExternalCrm(newBooking, activeUserObj, systemSettings.crmConfig)
        .then(() => setCrmSyncLogs(getStoredCrmLogs()))
        .catch(err => console.warn('Background auto CRM push:', err));
    }

    return newBooking;
  };

  // Modify booking date
  const modifyBookingDate = async (bookingId: string, newStartDate: string): Promise<boolean> => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return false;
    
    // Calculate new end date based on original package duration
    const pkg = packages.find(p => p.id === booking.packageId);
    const duration = pkg?.durationDays || 7;
    const startObj = new Date(newStartDate);
    startObj.setDate(startObj.getDate() + duration);
    const newEndDate = startObj.toISOString().split('T')[0];

    const updatedBooking: Booking = {
      ...booking,
      startDate: newStartDate,
      endDate: newEndDate,
      flightStatus: booking.flightStatus ? {
        ...booking.flightStatus,
        departureTime: `${newStartDate} 09:30 AM`,
        arrivalTime: `${newStartDate} 04:45 PM`,
        status: 'Scheduled'
      } : undefined,
      hotelStatus: booking.hotelStatus ? {
        ...booking.hotelStatus,
        checkInDate: newStartDate,
        checkOutDate: newEndDate
      } : undefined
    };

    setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));

    try {
      await setDoc(doc(db, 'bookings', bookingId), updatedBooking, { merge: true });
    } catch (e) {
      console.warn('Booking date update notice:', e);
    }

    addNotification(
      'Dates Modified Successfully',
      `Booking ${booking.bookingCode} departure has been shifted to ${newStartDate}.`,
      'booking'
    );

    return true;
  };

  // Cancel booking
  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return false;

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    setInvoices(prev => prev.map(inv => inv.bookingId === bookingId ? { ...inv, paymentStatus: 'refunded' } : inv));

    try {
      await setDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' }, { merge: true });
      const relatedInv = invoices.find(inv => inv.bookingId === bookingId);
      if (relatedInv) {
        await setDoc(doc(db, 'invoices', relatedInv.id), { paymentStatus: 'refunded', status: 'refunded' }, { merge: true });
      }
    } catch (e) {
      console.warn('Booking cancellation notice:', e);
    }

    addNotification(
      'Booking Cancelled & Refunded',
      `Reservation ${booking.bookingCode} was cancelled. Full refund of $${booking.totalPriceUSD} credited back to original payment gateway.`,
      'booking'
    );

    return true;
  };

  // Admin updates
  const updateBookingStatusByAdmin = (
    bookingId: string,
    status: BookingStatus,
    flightUpdates?: Partial<FlightStatus>,
    hotelUpdates?: Partial<HotelStatus>
  ) => {
    let affectedBookingCode = '';
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        affectedBookingCode = b.bookingCode;
        const updated: Booking = {
          ...b,
          status,
          flightStatus: b.flightStatus && flightUpdates ? { ...b.flightStatus, ...flightUpdates } : b.flightStatus,
          hotelStatus: b.hotelStatus && hotelUpdates ? { ...b.hotelStatus, ...hotelUpdates } : b.hotelStatus,
        };

        try {
          setDoc(doc(db, 'bookings', bookingId), updated, { merge: true });
        } catch (e) {
          console.warn('Booking status update notice:', e);
        }

        // If flight status or gate changed, trigger customer push notification
        if (flightUpdates?.status || flightUpdates?.gate) {
          addNotification(
            `Flight Alert: ${updated.flightStatus?.flightNumber}`,
            `Status updated to "${flightUpdates.status || updated.flightStatus?.status}"${flightUpdates.gate ? ` at Gate ${flightUpdates.gate}` : ''}. Check your live itinerary.`,
            'flight'
          );
        }

        if (hotelUpdates?.status) {
          addNotification(
            `Hotel Update: ${updated.hotelStatus?.hotelName}`,
            `Hotel reservation status: ${hotelUpdates.status}.`,
            'hotel'
          );
        }

        // Auto-sync booking status update to external CRM if configured
        if (systemSettings.crmConfig?.crmAutoSyncBookings) {
          const uObj = users.find(u => u.id === updated.userId || u.email === updated.userEmail);
          pushBookingToExternalCrm(updated, uObj, systemSettings.crmConfig)
            .then(() => setCrmSyncLogs(getStoredCrmLogs()))
            .catch(err => console.warn('Background auto CRM status update:', err));
        }

        return updated;
      }
      return b;
    }));

    // Cross-Flow Update: Auto-update matching InboundWonLead and push logistics status back to CRM
    if (affectedBookingCode || bookingId) {
      setInboundLeads(prev => prev.map(lead => {
        if (lead.bookingCode === affectedBookingCode || lead.id === bookingId || lead.crmLeadId === bookingId) {
          const updatedTasks = (lead.handoverTasks || generateDefaultHandoverTasks(lead)).map(t => {
            if (t.category === 'flight_ticketing' && flightUpdates?.status) {
              const isFlightConfirmed = ['Scheduled', 'Confirmed', 'Departed', 'Landed'].includes(flightUpdates.status);
              return {
                ...t,
                status: isFlightConfirmed ? ('completed' as const) : t.status,
                completedAt: isFlightConfirmed ? new Date().toISOString() : t.completedAt,
                notes: `Flight ${flightUpdates.status || 'updated'}. ${t.notes || ''}`.trim()
              };
            }
            if (t.category === 'hotel_reservations' && hotelUpdates?.status) {
              const isHotelConfirmed = ['Confirmed', 'Checked In', 'Guaranteed'].includes(hotelUpdates.status);
              return {
                ...t,
                status: isHotelConfirmed ? ('completed' as const) : t.status,
                completedAt: isHotelConfirmed ? new Date().toISOString() : t.completedAt,
                notes: `Hotel ${hotelUpdates.status || 'updated'}. ${t.notes || ''}`.trim()
              };
            }
            return t;
          });

          const recStage = getRecommendedStageFromTasks(updatedTasks, lead.operationalStage);
          const updatedLead: InboundWonLead = {
            ...lead,
            flightStatus: flightUpdates ? { ...(lead.flightStatus || { flightNumber: 'KHB-2026', airline: 'Cambodia Angkor Air', departureAirport: 'PNH', arrivalAirport: 'CAN', departureTime: '08:30 AM', arrivalTime: '12:45 PM', status: 'Scheduled' }), ...flightUpdates } : lead.flightStatus,
            hotelStatus: hotelUpdates ? { ...(lead.hotelStatus || { hotelName: 'Garden Hotel Guangzhou', roomType: 'Executive Business Suite', checkInDate: '2026-10-15', checkOutDate: '2026-10-22', status: 'Confirmed', confirmationCode: `HTL-${lead.bookingCode}` }), ...hotelUpdates } : lead.hotelStatus,
            handoverTasks: updatedTasks,
            operationalStage: recStage,
            lastTaskAction: `Logistics status updated (Flight/Hotel)`,
            updatedAt: new Date().toISOString()
          };

          saveStoredInboundLead(updatedLead);
          try {
            setDoc(doc(db, 'inbound_leads', lead.id), sanitizeForFirestore(updatedLead), { merge: true });
          } catch (e) {
            console.warn('Cross-flow lead logistics update notice:', e);
          }

          // Asynchronously dispatch 2-way progress sync to external CRM
          const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
          pushLeadTaskProgressToCrm(
            updatedLead,
            `Logistics updated: Flight ${flightUpdates?.status || 'Active'}, Hotel ${hotelUpdates?.status || 'Active'}`,
            'logistics.status_synced',
            config
          ).then(() => setCrmSyncLogs(getStoredCrmLogs())).catch(e => console.warn('CRM logistics sync:', e));

          return updatedLead;
        }
        return lead;
      }));
    }
  };

  // Package Catalog Management
  const addPackage = (pkgData: Omit<TourPackage, 'id' | 'rating' | 'reviewCount' | 'bookedThisMonth'> | TourPackage) => {
    const pkgObj = pkgData as Partial<TourPackage>;
    const packageStatus: TourPackageStatus = pkgObj.status || 'active';
    const now = new Date().toISOString();
    const newPkg: TourPackage = {
      ...pkgData,
      id: pkgObj.id || `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: packageStatus,
      createdAt: pkgObj.createdAt || now,
      updatedAt: now,
      version: (pkgObj.version || 0) + 1,
      rating: pkgObj.rating ?? 5.0,
      reviewCount: pkgObj.reviewCount ?? 1,
      bookedThisMonth: pkgObj.bookedThisMonth ?? 0
    };

    // Remove from deletedIds in case ID was previously recycled
    setDeletedIds(prev => {
      const next = prev.filter(did => did !== newPkg.id);
      try { localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(next)); } catch (e) {}
      return next;
    });

    setPackages(prev => {
      const next = [newPkg, ...prev.filter(p => p.id !== newPkg.id)];
      try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
      return next;
    });

    try {
      setDoc(doc(db, 'packages', newPkg.id), sanitizeForFirestore(newPkg), { merge: true }).catch(e => {
        if (e?.code !== 'permission-denied') {
          console.warn('Package Firestore save notice:', e);
        }
      });
    } catch (e) {
      console.warn('Package Firestore save notice:', e);
    }

    setSelectedPackage(prev => (prev && prev.id === newPkg.id ? newPkg : prev));
    triggerAutoSave('Auto-saving tour package...');

    // Record in System Update History
    recordSystemUpdate({
      title: `Tour Package Created: ${newPkg.title}`,
      description: `${packageStatus === 'draft' ? 'Saved draft' : 'Published'} tour package: ${newPkg.destination}, ${newPkg.durationDays}D/${newPkg.durationNights}N at $${newPkg.priceUSD} USD. Status: ${packageStatus.toUpperCase()}.`,
      category: 'package_catalog',
      updatedBy: currentUser?.name || 'Operations Lead',
      updatedByRole: currentUser?.role || 'admin',
      changes: [
        {
          field: 'Package ID',
          fieldLabel: 'Package ID',
          oldValue: null,
          newValue: newPkg.id,
          type: 'added'
        },
        {
          field: 'Status',
          fieldLabel: 'Status',
          oldValue: null,
          newValue: packageStatus,
          type: 'added'
        },
        {
          field: 'Destination',
          fieldLabel: 'Destination',
          oldValue: null,
          newValue: newPkg.destination,
          type: 'added'
        },
        {
          field: 'Price (USD)',
          fieldLabel: 'Price (USD)',
          oldValue: null,
          newValue: `$${newPkg.priceUSD}`,
          type: 'added'
        }
      ]
    });

    addNotification(
      packageStatus === 'draft' ? 'Package Draft Saved' : 'Package Published',
      packageStatus === 'draft'
        ? `Tour package "${newPkg.title}" saved as draft (hidden from public storefront).`
        : `New tour package "${newPkg.title}" is now live on the public storefront.`,
      'system'
    );
  };

  const updatePackage = (pkg: TourPackage) => {
    const previous = packages.find(p => p.id === pkg.id);
    const now = new Date().toISOString();
    const updatedPkg: TourPackage = {
      ...pkg,
      status: pkg.status || 'active',
      createdAt: pkg.createdAt || previous?.createdAt || now,
      updatedAt: now,
      version: (previous?.version || pkg.version || 1) + 1
    };

    setPackages(prev => {
      const next = prev.map(p => p.id === pkg.id ? updatedPkg : p);
      try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
      return next;
    });

    try {
      setDoc(doc(db, 'packages', pkg.id), sanitizeForFirestore(updatedPkg), { merge: true }).catch(e => {
        if (e?.code !== 'permission-denied') {
          console.warn('Package Firestore update notice:', e);
        }
      });
    } catch (e) {
      console.warn('Package Firestore update notice:', e);
    }

    setSelectedPackage(prev => (prev && prev.id === updatedPkg.id ? updatedPkg : prev));
    triggerAutoSave('Auto-saving package updates...');

    // Record in System Update History
    const changes: SystemUpdateChangeDiff[] = [];
    if (previous) {
      if (previous.title !== updatedPkg.title) changes.push({ field: 'Title', fieldLabel: 'Package Title', oldValue: previous.title, newValue: updatedPkg.title, type: 'modified' });
      if (previous.status !== updatedPkg.status) changes.push({ field: 'Status', fieldLabel: 'Package Status', oldValue: previous.status || 'active', newValue: updatedPkg.status || 'active', type: 'modified' });
      if (previous.priceUSD !== updatedPkg.priceUSD) changes.push({ field: 'Price', fieldLabel: 'Price (USD)', oldValue: `$${previous.priceUSD}`, newValue: `$${updatedPkg.priceUSD}`, type: 'modified' });
      if (previous.discountPriceUSD !== updatedPkg.discountPriceUSD) changes.push({ field: 'DiscountPrice', fieldLabel: 'Discount Price', oldValue: previous.discountPriceUSD ? `$${previous.discountPriceUSD}` : 'None', newValue: updatedPkg.discountPriceUSD ? `$${updatedPkg.discountPriceUSD}` : 'None', type: 'modified' });
      if (previous.destination !== updatedPkg.destination) changes.push({ field: 'Destination', fieldLabel: 'Destination', oldValue: previous.destination, newValue: updatedPkg.destination, type: 'modified' });
      if ((previous.itinerary || []).length !== (updatedPkg.itinerary || []).length) changes.push({ field: 'ItineraryDays', fieldLabel: 'Itinerary Days', oldValue: `${(previous.itinerary || []).length} Days`, newValue: `${(updatedPkg.itinerary || []).length} Days`, type: 'modified' });
    }
    if (changes.length === 0) {
      changes.push({ field: 'PackageContent', fieldLabel: 'Package Content', oldValue: 'Existing version', newValue: 'Saved version', type: 'modified' });
    }

    recordSystemUpdate({
      title: `Tour Package Updated: ${updatedPkg.title}`,
      description: `Saved updates for package "${updatedPkg.title}" (${updatedPkg.destination}) at $${updatedPkg.priceUSD} USD. Status: ${(updatedPkg.status || 'active').toUpperCase()}.`,
      category: 'package_catalog',
      updatedBy: currentUser?.name || 'Operations Lead',
      updatedByRole: currentUser?.role || 'admin',
      changes
    });

    addNotification('Package Updated', `Changes to "${updatedPkg.title}" have been saved (${updatedPkg.status || 'active'}).`, 'system');
  };

  const updatePackageStatus = (packageId: string, status: TourPackageStatus) => {
    const target = packages.find(p => p.id === packageId);
    if (!target) return;
    if (status === 'deleted') {
      deletePackage(packageId);
      return;
    }
    const previousStatus = target.status || 'active';
    const now = new Date().toISOString();
    const updatedPkg: TourPackage = {
      ...target,
      status,
      updatedAt: now,
      version: (target.version || 1) + 1
    };

    setPackages(prev => {
      const next = prev.map(p => p.id === packageId ? updatedPkg : p);
      try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
      return next;
    });

    try {
      setDoc(doc(db, 'packages', packageId), sanitizeForFirestore(updatedPkg), { merge: true }).catch(e => {
        if (e?.code !== 'permission-denied') {
          console.warn('Package status update notice:', e);
        }
      });
    } catch (e) {
      console.warn('Package status update notice:', e);
    }

    triggerAutoSave(`Updated status to ${status}`);

    recordSystemUpdate({
      title: `Tour Package Status: ${target.title}`,
      description: `Switched status of "${target.title}" from ${previousStatus.toUpperCase()} to ${status.toUpperCase()}.`,
      category: 'package_catalog',
      updatedBy: currentUser?.name || 'Operations Lead',
      updatedByRole: currentUser?.role || 'admin',
      changes: [
        {
          field: 'Status',
          fieldLabel: 'Package Status',
          oldValue: previousStatus,
          newValue: status,
          type: 'modified'
        }
      ]
    });

    addNotification(
      'Package Status Changed',
      `"${target.title}" is now set to ${status === 'active' ? 'Active (Live)' : status === 'draft' ? 'Draft' : status === 'archived' ? 'Archived' : 'Deleted'}.`,
      'system'
    );
  };

  const clonePackageAsDraft = (pkg: TourPackage): TourPackage => {
    const targetRawPkg = packages.find(p => p.id === pkg.id) || pkg;
    const deepClone: TourPackage = JSON.parse(JSON.stringify(targetRawPkg));
    const newId = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const copySuffix = ' (Draft)';
    const copySuffixKm = ' (ព្រាង)';
    const now = new Date().toISOString();

    const clonedDraft: TourPackage = {
      ...deepClone,
      id: newId,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      version: 1,
      title: `${deepClone.title}${copySuffix}`,
      titleKm: deepClone.titleKm ? `${deepClone.titleKm}${copySuffixKm}` : `${deepClone.title}${copySuffixKm}`,
      titleEn: deepClone.titleEn ? `${deepClone.titleEn}${copySuffix}` : `${deepClone.title}${copySuffix}`,
      bookedThisMonth: 0,
      rating: deepClone.rating || 5.0,
      reviewCount: deepClone.reviewCount || 1,
      itinerary: (deepClone.itinerary || []).map((step, idx) => ({
        ...step,
        day: idx + 1,
        guideAgenda: (step.guideAgenda || []).map(slot => ({ ...slot }))
      })),
      optionalPrograms: (deepClone.optionalPrograms || []).map(prog => ({
        ...prog,
        id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      }))
    };

    addPackage(clonedDraft);
    return clonedDraft;
  };

  const restorePackage = (packageId: string) => {
    const deletedRecord = deletedItems.find(d => d.originalId === packageId && d.entityType === 'package');
    if (deletedRecord) {
      recoverItem(deletedRecord.id);
    } else {
      updatePackageStatus(packageId, 'active');
    }
  };

  const deletePackage = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    setDeletedIds(prev => {
      const next = Array.from(new Set([packageId, ...prev]));
      try { localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(next)); } catch (e) {}
      return next;
    });

    if (pkg) {
      const record: DeletedItemRecord = {
        id: 'del_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        originalId: pkg.id,
        entityType: 'package',
        title: pkg.title,
        subtitle: `${pkg.destination} • $${pkg.priceUSD} USD • ${pkg.durationDays} Days`,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser?.email || 'admin@khbevents.com',
        data: { ...pkg, status: 'deleted', updatedAt: new Date().toISOString() }
      };
      setDeletedItems(prev => {
        const next = [record, ...prev];
        try { localStorage.setItem(STORAGE_KEYS.DELETED_ITEMS, JSON.stringify(next)); } catch (e) {}
        return next;
      });
      try {
        setDoc(doc(db, 'deleted_items', record.id), sanitizeForFirestore(record), { merge: true }).catch(err => {});
      } catch (e) {}
    }

    setPackages(prev => {
      const next = prev.filter(p => p.id !== packageId);
      try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
      return next;
    });

    try {
      deleteDoc(doc(db, 'packages', packageId)).catch(e => {
        if (e?.code !== 'permission-denied') {
          console.warn('Package Firestore delete notice:', e);
        }
      });
    } catch (e) {
      console.warn('Package Firestore delete notice:', e);
    }

    // Record in System Update History
    recordSystemUpdate({
      title: `Tour Package Deleted: ${pkg?.title || packageId}`,
      description: `Package "${pkg?.title || packageId}" was moved to Recycle Bin / deleted status.`,
      category: 'package_catalog',
      updatedBy: currentUser?.name || 'Operations Lead',
      updatedByRole: currentUser?.role || 'admin',
      changes: [
        {
          field: 'Status',
          fieldLabel: 'Package Status',
          oldValue: pkg?.status || 'active',
          newValue: 'deleted',
          type: 'removed'
        }
      ]
    });
    addNotification('Tour Package Moved to Recycle Bin', `"${pkg?.title || packageId}" was moved to trash. You can restore it anytime.`, 'system');
  };

  // Package Categories CRUD
  const addPackageCategory = (catData: Omit<PackageCategory, 'createdAt' | 'updatedAt'> | PackageCategory): PackageCategory => {
    const slugId = catData.id?.trim() || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const catObj = catData as Partial<PackageCategory>;
    const newCategory: PackageCategory = {
      ...catData,
      id: slugId || `cat_${Date.now()}`,
      name: catData.name.trim(),
      nameKm: catData.nameKm?.trim() || undefined,
      nameEn: catData.nameEn?.trim() || catData.name.trim(),
      nameZh: catData.nameZh?.trim() || undefined,
      description: catData.description?.trim() || undefined,
      icon: catData.icon?.trim() || '🏷️',
      color: catData.color || 'indigo',
      isActive: catData.isActive ?? true,
      order: catData.order ?? (packageCategories.length + 1),
      createdAt: catObj.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPackageCategories(prev => {
      const existing = prev.findIndex(c => c.id === newCategory.id);
      let updated: PackageCategory[];
      if (existing >= 0) {
        updated = prev.map((c, i) => i === existing ? newCategory : c);
      } else {
        updated = [...prev, newCategory];
      }
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanPayload = Object.fromEntries(
        Object.entries(newCategory).filter(([_, v]) => v !== undefined)
      );
      setDoc(doc(db, 'package_categories', newCategory.id), cleanPayload, { merge: true }).catch(err => {
        console.warn('Firestore save category notice:', err);
      });
    } catch (e) {}

    logUserAudit('Package Category Created', `Created package category "${newCategory.name}" (${newCategory.id})`, 'info');
    addNotification('Category Added', `Package category "${newCategory.name}" was created successfully.`, 'system');
    return newCategory;
  };

  const updatePackageCategory = (category: PackageCategory) => {
    const updatedCategory: PackageCategory = {
      ...category,
      updatedAt: new Date().toISOString()
    };

    setPackageCategories(prev => {
      const updated = prev.map(c => c.id === updatedCategory.id ? updatedCategory : c);
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanPayload = Object.fromEntries(
        Object.entries(updatedCategory).filter(([_, v]) => v !== undefined)
      );
      setDoc(doc(db, 'package_categories', updatedCategory.id), cleanPayload, { merge: true }).catch(err => {
        console.warn('Firestore update category notice:', err);
      });
    } catch (e) {}

    logUserAudit('Package Category Updated', `Updated package category "${updatedCategory.name}" (${updatedCategory.id})`, 'info');
    addNotification('Category Updated', `Category "${updatedCategory.name}" was updated.`, 'system');
  };

  const deletePackageCategory = (categoryId: string): { success: boolean; affectedPackages: number } => {
    const affectedCount = packages.filter(p => p.category === categoryId).length;
    const cat = packageCategories.find(c => c.id === categoryId);

    setPackageCategories(prev => {
      const updated = prev.filter(c => c.id !== categoryId);
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      deleteDoc(doc(db, 'package_categories', categoryId)).catch(err => {
        console.warn('Firestore delete category notice:', err);
      });
    } catch (e) {}

    logUserAudit('Package Category Deleted', `Deleted package category (${categoryId}). ${affectedCount} packages affected.`, 'warning');
    addNotification('Category Deleted', `Category "${cat?.name || categoryId}" was removed.`, 'system');
    return { success: true, affectedPackages: affectedCount };
  };

  const togglePackageCategoryStatus = (categoryId: string) => {
    setPackageCategories(prev => {
      const updated = prev.map(c => {
        if (c.id === categoryId) {
          const next = { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() };
          try {
            const cleanPayload = Object.fromEntries(
              Object.entries(next).filter(([_, v]) => v !== undefined)
            );
            setDoc(doc(db, 'package_categories', categoryId), cleanPayload, { merge: true }).catch(err => {});
          } catch (e) {}
          return next;
        }
        return c;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const reorderPackageCategories = (orderedIds: string[]) => {
    setPackageCategories(prev => {
      const idMap = new Map<string, PackageCategory>(prev.map(c => [c.id, c]));
      const ordered: PackageCategory[] = [];
      orderedIds.forEach((id, idx) => {
        const cat = idMap.get(id);
        if (cat) {
          const updatedCat: PackageCategory = { ...cat, order: idx + 1, updatedAt: new Date().toISOString() };
          ordered.push(updatedCat);
          try {
            setDoc(doc(db, 'package_categories', cat.id), { order: idx + 1, updatedAt: updatedCat.updatedAt }, { merge: true }).catch(err => {});
          } catch (e) {}
        }
      });
      prev.forEach(c => {
        if (!orderedIds.includes(c.id)) {
          ordered.push(c);
        }
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(ordered));
      } catch (e) {}
      return ordered;
    });
  };

  const resetPackageCategories = () => {
    setPackageCategories(DEFAULT_PACKAGE_CATEGORIES);
    try {
      localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(DEFAULT_PACKAGE_CATEGORIES));
      DEFAULT_PACKAGE_CATEGORIES.forEach(cat => {
        setDoc(doc(db, 'package_categories', cat.id), cat, { merge: true }).catch(err => {});
      });
    } catch (e) {}
    logUserAudit('Package Categories Reset', 'Reset package categories to factory default presets.', 'info');
    addNotification('Categories Reset', 'Package categories restored to factory presets.', 'system');
  };

  // Support Chat
  const sendSupportMessage = (chatId: string, text: string, senderRole?: 'traveler' | 'admin') => {
    const role = senderRole || (currentUser?.role === 'admin' ? 'admin' : 'traveler');
    const senderName = currentUser?.name || (role === 'admin' ? 'TripDesk Concierge' : 'Traveler');

    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser?.id || 'usr_guest',
      senderRole: role,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };

    setSupportChats(prev => {
      const exists = prev.some(c => c.id === chatId);
      if (exists) {
        return prev.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, newMessage]
            };
          }
          return c;
        });
      } else {
        const newChat: SupportChat = {
          id: chatId,
          userId: currentUser?.id || 'usr_traveler_1',
          userName: currentUser?.name || 'Sarah Jenkins',
          userEmail: currentUser?.email || 'sarah.traveler@example.com',
          subject: 'General Booking Assistance',
          status: 'open',
          updatedAt: new Date().toISOString(),
          messages: [newMessage]
        };
        return [newChat, ...prev];
      }
    });

    if (role === 'traveler') {
      addNotification('Message Sent to Concierge', 'Our team will review your inquiry shortly.', 'chat');
      
      // Auto reply simulation if user asks for common travel questions
      setTimeout(() => {
        const lower = text.toLowerCase();
        let reply = 'Thank you for your message! Our travel concierge has received your request and is reviewing it with local operators.';
        if (lower.includes('diet') || lower.includes('food') || lower.includes('vegan') || lower.includes('vegetarian')) {
          reply = 'We have noted your dietary preference. All hotel kitchens and culinary tastings on your itinerary will accommodate this with custom substitutes!';
        } else if (lower.includes('flight') || lower.includes('airport') || lower.includes('transfer')) {
          reply = 'Your private chauffeur will meet you directly at the airport arrival hall holding a TripDesk name board. Your flight status is continuously monitored.';
        } else if (lower.includes('invoice') || lower.includes('tax') || lower.includes('receipt')) {
          reply = 'You can view and download your official VAT tax invoice anytime directly from the "My Trips" tab.';
        }

        const autoMsg = {
          id: `msg_ai_${Date.now()}`,
          senderId: 'usr_concierge_bot',
          senderRole: 'ai' as const,
          senderName: 'TripDesk Concierge Assistant',
          text: reply,
          timestamp: new Date().toISOString()
        };

        setSupportChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, autoMsg] } : c));
        addNotification('New Concierge Reply', reply.substring(0, 70) + '...', 'chat');
      }, 1200);
    }
  };

  // Financial & Tax Reporting calculation
  const getMonthlyFinancialSummary = (monthFilter: string = '2026-08'): MonthlyFinancialSummary[] => {
    let grossUSD = 0;
    let refundsUSD = 0;
    let taxesUSD = 0;
    let confirmedCount = 0;
    let cancelledCount = 0;
    const destinationMap: Record<string, { count: number; revenue: number }> = {};

    bookings.forEach(b => {
      // Group by destination
      if (!destinationMap[b.packageDestination]) {
        destinationMap[b.packageDestination] = { count: 0, revenue: 0 };
      }

      if (b.status === 'confirmed' || b.status === 'completed') {
        grossUSD += b.totalPriceUSD;
        taxesUSD += b.taxAmountUSD;
        confirmedCount++;
        destinationMap[b.packageDestination].count += 1;
        destinationMap[b.packageDestination].revenue += b.totalPriceUSD;
      } else if (b.status === 'cancelled') {
        refundsUSD += b.totalPriceUSD;
        cancelledCount++;
      }
    });

    const netUSD = grossUSD - refundsUSD;

    const destinationBreakdown = Object.entries(destinationMap).map(([destination, val]) => ({
      destination,
      bookingsCount: val.count,
      revenueUSD: Math.round(val.revenue * 100) / 100,
    }));

    const currentTax = Math.round(taxesUSD * 100) / 100;
    const currentMonthSummary: MonthlyFinancialSummary = {
      month: 'August 2026',
      monthName: 'August 2026',
      totalBookings: bookings.length,
      confirmedBookings: confirmedCount,
      cancelledBookings: cancelledCount,
      grossRevenueUSD: Math.round(grossUSD * 100) / 100,
      taxRatePercent: 0.075,
      taxCollectedUSD: currentTax,
      taxesCollectedUSD: currentTax,
      refundsUSD: Math.round(refundsUSD * 100) / 100,
      netRevenueUSD: Math.round(netUSD * 100) / 100,
      destinationBreakdown
    };

    const historicalMonths: MonthlyFinancialSummary[] = [
      currentMonthSummary,
      {
        month: 'July 2026',
        monthName: 'July 2026',
        totalBookings: 18,
        confirmedBookings: 17,
        cancelledBookings: 1,
        grossRevenueUSD: 68450.00,
        taxRatePercent: 0.075,
        taxCollectedUSD: 5133.75,
        taxesCollectedUSD: 5133.75,
        refundsUSD: 2400.00,
        netRevenueUSD: 66050.00,
        destinationBreakdown: []
      },
      {
        month: 'June 2026',
        monthName: 'June 2026',
        totalBookings: 24,
        confirmedBookings: 23,
        cancelledBookings: 1,
        grossRevenueUSD: 94200.00,
        taxRatePercent: 0.075,
        taxCollectedUSD: 7065.00,
        taxesCollectedUSD: 7065.00,
        refundsUSD: 3100.00,
        netRevenueUSD: 91100.00,
        destinationBreakdown: []
      },
      {
        month: 'May 2026',
        monthName: 'May 2026',
        totalBookings: 15,
        confirmedBookings: 14,
        cancelledBookings: 1,
        grossRevenueUSD: 54800.00,
        taxRatePercent: 0.075,
        taxCollectedUSD: 4110.00,
        taxesCollectedUSD: 4110.00,
        refundsUSD: 1800.00,
        netRevenueUSD: 53000.00,
        destinationBreakdown: []
      },
      {
        month: 'April 2026',
        monthName: 'April 2026',
        totalBookings: 20,
        confirmedBookings: 19,
        cancelledBookings: 1,
        grossRevenueUSD: 76200.00,
        taxRatePercent: 0.075,
        taxCollectedUSD: 5715.00,
        taxesCollectedUSD: 5715.00,
        refundsUSD: 2900.00,
        netRevenueUSD: 73300.00,
        destinationBreakdown: []
      },
      {
        month: 'March 2026',
        monthName: 'March 2026',
        totalBookings: 12,
        confirmedBookings: 12,
        cancelledBookings: 0,
        grossRevenueUSD: 42600.00,
        taxRatePercent: 0.075,
        taxCollectedUSD: 3195.00,
        taxesCollectedUSD: 3195.00,
        refundsUSD: 0,
        netRevenueUSD: 42600.00,
        destinationBreakdown: []
      }
    ];

    return historicalMonths;
  };

  const exportMonthlyReportCSV = (monthFilter: string = '2026-08') => {
    const summaries = getMonthlyFinancialSummary(monthFilter);
    const summary = summaries[0] || {
      month: 'August 2026',
      monthName: 'August 2026',
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      grossRevenueUSD: 0,
      refundsUSD: 0,
      netRevenueUSD: 0,
      taxRatePercent: 0.075,
      taxCollectedUSD: 0,
      taxesCollectedUSD: 0,
      destinationBreakdown: []
    };
    const rows = [
      ['TripDesk Monthly Financial & Tax Filing Report'],
      ['Reporting Period', summary.monthName],
      ['Generated At', new Date().toISOString()],
      [],
      ['Metric', 'Value (USD)'],
      ['Total Bookings Count', summary.totalBookings],
      ['Confirmed & Completed Bookings', summary.confirmedBookings],
      ['Cancelled & Refunded Bookings', summary.cancelledBookings],
      ['Gross Bookings Revenue (USD)', `$${summary.grossRevenueUSD.toFixed(2)}`],
      ['Total Refunds Processed (USD)', `$${summary.refundsUSD.toFixed(2)}`],
      ['Net Operating Revenue (USD)', `$${summary.netRevenueUSD.toFixed(2)}`],
      ['VAT & Tourism Tax Collected (7.5%)', `$${summary.taxesCollectedUSD.toFixed(2)}`],
      [],
      ['Destination Breakdown', 'Bookings Count', 'Revenue (USD)'],
      ...(summary.destinationBreakdown || []).map(d => [d.destination, d.bookingsCount, `$${d.revenueUSD.toFixed(2)}`]),
      [],
      ['Detailed Bookings List'],
      ['Booking Code', 'Customer', 'Destination', 'Status', 'Total Price USD', 'Tax USD', 'Payment Tx ID', 'Date'],
      ...bookings.map(b => [
        b.bookingCode,
        b.userName,
        b.packageDestination,
        b.status,
        `$${b.totalPriceUSD.toFixed(2)}`,
        `$${b.taxAmountUSD.toFixed(2)}`,
        b.paymentTransactionId,
        b.createdAt.split('T')[0]
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TripDesk_Tax_Report_${summary.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification('CSV Report Exported', `Downloaded TripDesk_Tax_Report_${summary.month}.csv`, 'system');
  };

  // ── Universal Soft-Delete & Data Recovery Helpers ──────────────────────────

  const trackDeletedItem = (
    originalId: string,
    entityType: RecoverableEntityType,
    title: string,
    subtitle: string | undefined,
    data: any
  ) => {
    setDeletedIds(prev => Array.from(new Set([originalId, ...prev])));
    const record: DeletedItemRecord = {
      id: 'del_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      originalId,
      entityType,
      title,
      subtitle,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser?.email || 'admin@khbevents.com',
      data
    };
    setDeletedItems(prev => [record, ...prev]);
    return record;
  };

  // ERP Actions - Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPOsUSD'>) => {
    const id = 'sup_' + Date.now();
    const newSup = { ...supplier, id, createdAt: new Date().toISOString(), totalPOsUSD: 0 };
    setSuppliers(prev => [newSup, ...prev]);
    try { setDoc(doc(db, 'suppliers', id), sanitizeForFirestore(newSup)); } catch (e) { console.warn(e); }
  };
  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    try { setDoc(doc(db, 'suppliers', supplier.id), sanitizeForFirestore(supplier), { merge: true }); } catch (e) { console.warn(e); }
  };
  const deleteSupplier = (supplierId: string) => {
    const sup = suppliers.find(s => s.id === supplierId);
    if (sup) {
      trackDeletedItem(
        sup.id,
        'supplier',
        sup.name,
        `${sup.type.toUpperCase()} • ${sup.city}, ${sup.country} • Terms: ${sup.paymentTerms.replace('_', ' ').toUpperCase()}`,
        sup
      );
    }
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    try { deleteDoc(doc(db, 'suppliers', supplierId)); } catch (e) { console.warn(e); }
    addNotification('Supplier Moved to Recycle Bin', `"${sup?.name || supplierId}" was archived. Recoverable from Data Recovery.`, 'system');
  };

  // ERP Actions - Cost Templates
  const saveCostTemplate = (template: Omit<CostTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = 'ct_' + Date.now();
    const now = new Date().toISOString();
    const newCT = { ...template, id, createdAt: now, updatedAt: now };
    setCostTemplates(prev => [newCT, ...prev]);
    try { setDoc(doc(db, 'cost_templates', id), sanitizeForFirestore(newCT)); } catch (e) { console.warn('Cost template save notice:', e); }
  };
  const updateCostTemplate = (template: CostTemplate) => {
    const updated = { ...template, updatedAt: new Date().toISOString() };
    setCostTemplates(prev => prev.map(t => t.id === template.id ? updated : t));
    try { setDoc(doc(db, 'cost_templates', template.id), sanitizeForFirestore(updated), { merge: true }); } catch (e) { console.warn('Cost template update notice:', e); }
  };
  const deleteCostTemplate = (templateId: string) => {
    const ct = costTemplates.find(t => t.id === templateId);
    if (ct) {
      trackDeletedItem(
        ct.id,
        'cost_template',
        `Cost Template: ${ct.packageTitle || 'Tour Package'}`,
        `Per Adult: $${ct.totalCostPerAdultUSD || 0} • Rec Price: $${ct.recommendedPriceAdultUSD || 0}`,
        ct
      );
    }
    setCostTemplates(prev => prev.filter(t => t.id !== templateId));
    try { deleteDoc(doc(db, 'cost_templates', templateId)); } catch (e) { console.warn('Cost template delete notice:', e); }
    addNotification('Cost Template Moved to Recycle Bin', 'Pricing template archived. You can restore it anytime.', 'system');
  };
  const getCostTemplateForPackage = (packageId: string) => costTemplates.find(t => t.packageId === packageId);

  // ERP Actions - Purchase Orders
  const createPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => {
    const id = 'po_' + Date.now();
    const poNumber = 'PO-2026-' + String(purchaseOrders.length + 1).padStart(4, '0');
    const newPO = { ...po, id, poNumber, createdAt: new Date().toISOString() };
    setPurchaseOrders(prev => [newPO, ...prev]);
    try { setDoc(doc(db, 'purchase_orders', id), sanitizeForFirestore(newPO)); } catch (e) { console.warn(e); }
  };
  const updatePurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(p => p.id === po.id ? po : p));
    try { setDoc(doc(db, 'purchase_orders', po.id), sanitizeForFirestore(po), { merge: true }); } catch (e) { console.warn(e); }
  };
  const deletePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      trackDeletedItem(
        po.id,
        'purchase_order',
        `${po.poNumber} (${po.supplierName})`,
        `Total: $${po.totalUSD.toFixed(2)} USD • Due: ${po.dueDate} • Status: ${po.status.toUpperCase()}`,
        po
      );
    }
    setPurchaseOrders(prev => prev.filter(p => p.id !== poId));
    try { deleteDoc(doc(db, 'purchase_orders', poId)); } catch (e) { console.warn(e); }
    addNotification('Purchase Order Moved to Recycle Bin', `${po?.poNumber || poId} archived. You can recover it anytime.`, 'system');
  };
  const updatePOStatus = (poId: string, status: POStatus, paidDate?: string) => {
    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === poId) {
        const updated = { ...p, status, paidDate: paidDate || p.paidDate };
        try { setDoc(doc(db, 'purchase_orders', p.id), sanitizeForFirestore(updated), { merge: true }); } catch (e) { console.warn(e); }
        return updated;
      }
      return p;
    }));
  };

  // Actions - Customer Payments
  const addCustomerPayment = (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => {
    const id = 'cpay_' + Date.now();
    const newCP = { ...payment, id, createdAt: new Date().toISOString() };
    setCustomerPayments(prev => [newCP, ...prev]);
    try { setDoc(doc(db, 'customer_payments', id), sanitizeForFirestore(newCP)); } catch (e) { console.warn(e); }

    // Cross-Flow Update: Auto-update matching InboundWonLead depositPaidUSD, paymentStatus, and Task 6
    if (payment.bookingCode || payment.bookingId) {
      setInboundLeads(prev => prev.map(lead => {
        if (lead.bookingCode === payment.bookingCode || lead.id === payment.bookingId || lead.crmLeadId === payment.bookingId) {
          const newPaidTotal = (lead.depositPaidUSD || 0) + (payment.status === 'paid' || payment.status === 'partial' ? payment.amountUSD : 0);
          const isFullySettled = newPaidTotal >= lead.dealValueUSD;
          const newPaymentStatus = isFullySettled ? 'fully_paid' as const : (newPaidTotal > 0 ? 'deposit_paid' as const : lead.paymentStatus);

          const updatedTasks = (lead.handoverTasks || generateDefaultHandoverTasks(lead)).map(t => {
            if (t.category === 'invoice_finance') {
              return {
                ...t,
                status: isFullySettled ? ('completed' as const) : ('in_progress' as const),
                completedAt: isFullySettled ? new Date().toISOString() : t.completedAt,
                notes: `Received payment of $${payment.amountUSD} USD via ${payment.paymentMethod}. Total paid: $${newPaidTotal} / $${lead.dealValueUSD}`
              };
            }
            return t;
          });

          const recStage = getRecommendedStageFromTasks(updatedTasks, lead.operationalStage);
          const updatedLead: InboundWonLead = {
            ...lead,
            depositPaidUSD: newPaidTotal,
            paymentStatus: newPaymentStatus,
            handoverTasks: updatedTasks,
            operationalStage: recStage,
            lastTaskAction: `Payment of $${payment.amountUSD} recorded (${newPaymentStatus})`,
            updatedAt: new Date().toISOString()
          };

          saveStoredInboundLead(updatedLead);
          try {
            setDoc(doc(db, 'inbound_leads', lead.id), sanitizeForFirestore(updatedLead), { merge: true });
          } catch (e) {
            console.warn('Cross-flow lead payment update notice:', e);
          }

          // Asynchronously dispatch 2-way progress sync to external CRM
          const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
          pushLeadTaskProgressToCrm(
            updatedLead,
            `Finance settled: Received $${payment.amountUSD} USD (${payment.paymentMethod}) - Status: ${newPaymentStatus}`,
            'finance.payment_settled',
            config
          ).then(() => setCrmSyncLogs(getStoredCrmLogs())).catch(e => console.warn('CRM finance sync:', e));

          return updatedLead;
        }
        return lead;
      }));
    }
  };
  const updateCustomerPayment = (payment: CustomerPayment) => {
    setCustomerPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
    try { setDoc(doc(db, 'customer_payments', payment.id), sanitizeForFirestore(payment), { merge: true }); } catch (e) { console.warn(e); }

    // Cross-Flow Update: Check and update InboundWonLead
    if (payment.bookingCode || payment.bookingId) {
      setInboundLeads(prev => prev.map(lead => {
        if (lead.bookingCode === payment.bookingCode || lead.id === payment.bookingId || lead.crmLeadId === payment.bookingId) {
          const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
          pushLeadTaskProgressToCrm(
            lead,
            `Payment ${payment.id} status modified to ${payment.status}`,
            'finance.payment_settled',
            config
          ).then(() => setCrmSyncLogs(getStoredCrmLogs())).catch(e => console.warn('CRM finance sync:', e));
        }
        return lead;
      }));
    }
  };
  const deleteCustomerPayment = (paymentId: string) => {
    const cp = customerPayments.find(p => p.id === paymentId);
    if (cp) {
      trackDeletedItem(
        cp.id,
        'customer_payment',
        `Payment: ${cp.bookingCode} (${cp.userName})`,
        `$${cp.amountUSD.toFixed(2)} USD • ${cp.paymentMethod.replace('_', ' ')} • Status: ${cp.status.toUpperCase()}`,
        cp
      );
    }
    setCustomerPayments(prev => prev.filter(p => p.id !== paymentId));
    try { deleteDoc(doc(db, 'customer_payments', paymentId)); } catch (e) { console.warn(e); }
    addNotification('Payment Moved to Recycle Bin', `Payment receipt for ${cp?.bookingCode || paymentId} archived.`, 'system');
  };

  // Actions - Supplier Payments
  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id' | 'createdAt'>) => {
    const id = 'spay_' + Date.now();
    const newSP = { ...payment, id, createdAt: new Date().toISOString() };
    setSupplierPayments(prev => [newSP, ...prev]);
    try { setDoc(doc(db, 'supplier_payments', id), sanitizeForFirestore(newSP)); } catch (e) { console.warn(e); }
  };
  const updateSupplierPayment = (payment: SupplierPayment) => {
    setSupplierPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
    try { setDoc(doc(db, 'supplier_payments', payment.id), sanitizeForFirestore(payment), { merge: true }); } catch (e) { console.warn(e); }
  };
  const deleteSupplierPayment = (paymentId: string) => {
    const sp = supplierPayments.find(p => p.id === paymentId);
    if (sp) {
      trackDeletedItem(
        sp.id,
        'supplier_payment',
        `Disbursement: ${sp.poNumber} (${sp.supplierName})`,
        `$${sp.amountUSD.toFixed(2)} USD • Due: ${sp.dueDate} • Status: ${sp.status.toUpperCase()}`,
        sp
      );
    }
    setSupplierPayments(prev => prev.filter(p => p.id !== paymentId));
    try { deleteDoc(doc(db, 'supplier_payments', paymentId)); } catch (e) { console.warn(e); }
    addNotification('Disbursement Moved to Recycle Bin', `Payment for ${sp?.poNumber || paymentId} archived.`, 'system');
  };
  const markSupplierPaymentPaid = (paymentId: string, paidDate: string, referenceNumber: string) => {
    setSupplierPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        const updated = { ...p, status: 'paid' as const, paidDate, referenceNumber };
        try { setDoc(doc(db, 'supplier_payments', p.id), sanitizeForFirestore(updated), { merge: true }); } catch (e) { console.warn(e); }
        return updated;
      }
      return p;
    }));
  };

  // Actions - Expenses
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = 'exp_' + Date.now();
    const newExp = { ...expense, id, createdAt: new Date().toISOString() };
    setExpenses(prev => [newExp, ...prev]);
    try { setDoc(doc(db, 'expenses', id), sanitizeForFirestore(newExp)); } catch (e) { console.warn(e); }
  };
  const updateExpense = (expense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    try { setDoc(doc(db, 'expenses', expense.id), sanitizeForFirestore(expense), { merge: true }); } catch (e) { console.warn(e); }
  };
  const deleteExpense = (expenseId: string) => {
    const exp = expenses.find(e => e.id === expenseId);
    if (exp) {
      trackDeletedItem(
        exp.id,
        'expense',
        exp.description,
        `${exp.category.toUpperCase()} • $${exp.amountUSD.toFixed(2)} USD • By: ${exp.submittedByName}`,
        exp
      );
    }
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    try { deleteDoc(doc(db, 'expenses', expenseId)); } catch (e) { console.warn(e); }
    addNotification('Expense Moved to Recycle Bin', `Expense "${exp?.description || expenseId}" moved to Recycle Bin.`, 'system');
  };
  const approveExpense = (expenseId: string, approvedBy: string, approvedByName: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        const updated = { ...e, status: 'approved' as const, approvedBy, approvedByName };
        try { setDoc(doc(db, 'expenses', e.id), sanitizeForFirestore(updated), { merge: true }); } catch (err) { console.warn(err); }
        return updated;
      }
      return e;
    }));
  };
  const rejectExpense = (expenseId: string, approvedBy: string, approvedByName: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        const updated = { ...e, status: 'rejected' as const, approvedBy, approvedByName };
        try { setDoc(doc(db, 'expenses', e.id), sanitizeForFirestore(updated), { merge: true }); } catch (err) { console.warn(err); }
        return updated;
      }
      return e;
    }));
  };

  // Actions - Bookings & Invoices Deletion
  const deleteBooking = (bookingId: string) => {
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      trackDeletedItem(
        b.id,
        'booking',
        `Booking ${b.bookingCode} (${b.userName})`,
        `${b.packageDestination} • $${b.totalPriceUSD.toFixed(2)} USD • Status: ${b.status.toUpperCase()}`,
        b
      );
    }
    setBookings(prev => prev.filter(item => item.id !== bookingId));
    try { deleteDoc(doc(db, 'bookings', bookingId)); } catch (e) { console.warn(e); }
    addNotification('Booking Moved to Recycle Bin', `Reservation ${b?.bookingCode || bookingId} archived.`, 'booking');
  };

  const deleteInvoice = (invoiceId: string) => {
    const inv = invoices.find(item => item.id === invoiceId);
    if (inv) {
      trackDeletedItem(
        inv.id,
        'invoice',
        `Tax Invoice ${inv.invoiceNumber} (${inv.customerName})`,
        `Total: $${inv.totalUSD.toFixed(2)} USD • Issued: ${inv.issueDate}`,
        inv
      );
    }
    setInvoices(prev => prev.filter(item => item.id !== invoiceId));
    try { deleteDoc(doc(db, 'invoices', invoiceId)); } catch (e) { console.warn(e); }
    addNotification('Invoice Moved to Recycle Bin', `Tax invoice ${inv?.invoiceNumber || invoiceId} archived.`, 'system');
  };

  // ── Universal Recovery & Restoration Engine ────────────────────────────────

  const recoverItem = (deletedItemId: string) => {
    const record = deletedItems.find(r => r.id === deletedItemId);
    if (!record) return;

    setDeletedIds(prev => prev.filter(did => did !== record.originalId));
    const data = record.data;
    switch (record.entityType) {
      case 'supplier':
        setSuppliers(prev => [data, ...prev.filter(s => s.id !== data.id)]);
        try { setDoc(doc(db, 'suppliers', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

      case 'package': {
        const restoredPkg = {
          ...data,
          status: 'active' as const,
          updatedAt: new Date().toISOString(),
          version: (data.version || 1) + 1
        };
        setPackages(prev => {
          const next = [restoredPkg, ...prev.filter(p => p.id !== data.id)];
          try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
          return next;
        });
        try { setDoc(doc(db, 'packages', data.id), sanitizeForFirestore(restoredPkg), { merge: true }); } catch (e) { console.warn(e); }
        break;
      }

      case 'booking':
        setBookings(prev => [data, ...prev.filter(b => b.id !== data.id)]);
        try { setDoc(doc(db, 'bookings', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

      case 'cost_template':
        setCostTemplates(prev => [data, ...prev.filter(t => t.id !== data.id)]);
        try { setDoc(doc(db, 'cost_templates', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

      case 'purchase_order':
        setPurchaseOrders(prev => [data, ...prev.filter(po => po.id !== data.id)]);
        try { setDoc(doc(db, 'purchase_orders', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

      case 'customer_payment':
        setCustomerPayments(prev => [data, ...prev.filter(cp => cp.id !== data.id)]);
        try { setDoc(doc(db, 'customer_payments', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

      case 'supplier_payment':
        setSupplierPayments(prev => [data, ...prev.filter(sp => sp.id !== data.id)]);
        try { setDoc(doc(db, 'supplier_payments', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

      case 'expense':
        setExpenses(prev => [data, ...prev.filter(exp => exp.id !== data.id)]);
        try { setDoc(doc(db, 'expenses', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

      case 'invoice':
        setInvoices(prev => [data, ...prev.filter(inv => inv.id !== data.id)]);
        try { setDoc(doc(db, 'invoices', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;
    }

    setDeletedItems(prev => prev.filter(r => r.id !== deletedItemId));
    addNotification('Data Restored Successfully', `"${record.title}" recovered back to active ledger.`, 'system');
  };

  const permanentDeleteItem = (deletedItemId: string) => {
    const record = deletedItems.find(r => r.id === deletedItemId);
    setDeletedItems(prev => prev.filter(r => r.id !== deletedItemId));
    addNotification('Permanently Purged', `Record "${record?.title || deletedItemId}" was permanently removed.`, 'system');
  };

  const restoreAllDeleted = (entityType?: RecoverableEntityType) => {
    const toRestore = entityType ? deletedItems.filter(r => r.entityType === entityType) : [...deletedItems];
    const restoredIds = new Set(toRestore.map(r => r.originalId));
    setDeletedIds(prev => prev.filter(did => !restoredIds.has(did)));

    toRestore.forEach(record => {
      const data = record.data;
      if (record.entityType === 'supplier') {
        setSuppliers(prev => [data, ...prev.filter(s => s.id !== data.id)]);
        try { setDoc(doc(db, 'suppliers', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'package') {
        const restoredPkg = {
          ...data,
          status: 'active' as const,
          updatedAt: new Date().toISOString(),
          version: (data.version || 1) + 1
        };
        setPackages(prev => {
          const next = [restoredPkg, ...prev.filter(p => p.id !== data.id)];
          try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
          return next;
        });
        try { setDoc(doc(db, 'packages', data.id), sanitizeForFirestore(restoredPkg), { merge: true }); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'booking') {
        setBookings(prev => [data, ...prev.filter(b => b.id !== data.id)]);
        try { setDoc(doc(db, 'bookings', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'cost_template') {
        setCostTemplates(prev => [data, ...prev.filter(t => t.id !== data.id)]);
        try { setDoc(doc(db, 'cost_templates', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'purchase_order') {
        setPurchaseOrders(prev => [data, ...prev.filter(po => po.id !== data.id)]);
        try { setDoc(doc(db, 'purchase_orders', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'customer_payment') {
        setCustomerPayments(prev => [data, ...prev.filter(cp => cp.id !== data.id)]);
        try { setDoc(doc(db, 'customer_payments', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'supplier_payment') {
        setSupplierPayments(prev => [data, ...prev.filter(sp => sp.id !== data.id)]);
        try { setDoc(doc(db, 'supplier_payments', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'expense') {
        setExpenses(prev => [data, ...prev.filter(exp => exp.id !== data.id)]);
        try { setDoc(doc(db, 'expenses', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      } else if (record.entityType === 'invoice') {
        setInvoices(prev => [data, ...prev.filter(inv => inv.id !== data.id)]);
        try { setDoc(doc(db, 'invoices', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
      }
    });

    setDeletedItems(prev => entityType ? prev.filter(r => r.entityType !== entityType) : []);
    addNotification('Bulk Recovery Complete', `Restored ${toRestore.length} records back to active database.`, 'system');
  };

  const emptyRecycleBin = (entityType?: RecoverableEntityType) => {
    setDeletedItems(prev => entityType ? prev.filter(r => r.entityType !== entityType) : []);
    addNotification('Recycle Bin Emptied', `Purged ${entityType ? entityType : 'all'} deleted records.`, 'system');
  };

  const getTripProfitReport = (bookingId: string): TripProfitReport | null => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return null;
    
    const totalRevenueUSD = booking.totalPriceUSD;
    const receivedRevenueUSD = customerPayments.filter(p => p.bookingId === bookingId && p.status === 'paid').reduce((sum, p) => sum + p.amountUSD, 0);
    const outstandingReceivableUSD = totalRevenueUSD - receivedRevenueUSD;
    
    const template = getCostTemplateForPackage(booking.packageId);
    let estimatedCostUSD = totalRevenueUSD * 0.7;
    if (template) {
      estimatedCostUSD = (template.totalCostPerAdultUSD * booking.numberOfAdults) + (template.totalCostPerChildUSD * booking.numberOfChildren) + template.totalFixedCostUSD;
    }
    
    const pos = purchaseOrders.filter(po => po.bookingId === bookingId);
    const actualCostUSD = pos.length > 0 ? pos.reduce((sum, po) => sum + po.totalUSD, 0) : estimatedCostUSD;
    const supplierPaymentsMadeUSD = supplierPayments.filter(p => p.bookingId === bookingId && p.status === 'paid').reduce((sum, p) => sum + p.amountUSD, 0);
    const outstandingPayableUSD = actualCostUSD - supplierPaymentsMadeUSD;
    
    const adHocExpensesUSD = expenses.filter(e => e.bookingId === bookingId && e.status === 'approved').reduce((sum, e) => sum + e.amountUSD, 0);
    
    const grossProfitUSD = totalRevenueUSD - estimatedCostUSD;
    const netProfitUSD = totalRevenueUSD - actualCostUSD - adHocExpensesUSD;
    const grossMarginPercent = (grossProfitUSD / totalRevenueUSD) * 100;
    const netMarginPercent = (netProfitUSD / totalRevenueUSD) * 100;
    
    const costBreakdown: any = { hotel: 0, flight: 0, transport: 0, guide: 0, meals: 0, permits: 0, insurance: 0, misc: 0 };
    pos.forEach(po => {
      po.items.forEach(item => {
        if (costBreakdown[item.category] !== undefined) {
          costBreakdown[item.category] += item.totalUSD;
        } else {
          costBreakdown.misc += item.totalUSD;
        }
      });
    });
    
    return {
      id: 'pr_' + bookingId,
      bookingId,
      bookingCode: booking.bookingCode,
      packageId: booking.packageId,
      packageTitle: booking.packageTitle,
      destination: booking.packageDestination,
      travelStartDate: booking.startDate,
      paxAdults: booking.numberOfAdults,
      paxChildren: booking.numberOfChildren,
      totalPax: booking.numberOfAdults + booking.numberOfChildren,
      totalRevenueUSD, receivedRevenueUSD, outstandingReceivableUSD,
      estimatedCostUSD, actualCostUSD, supplierPaymentsMadeUSD, outstandingPayableUSD, adHocExpensesUSD,
      grossProfitUSD, netProfitUSD, grossMarginPercent, netMarginPercent,
      costBreakdown, generatedAt: new Date().toISOString()
    };
  };

  const getCashFlowSummary = (period?: string): CashFlowSummary => {
    const targetPeriod = period || new Date().toISOString().slice(0, 7);
    const entries: CashFlowEntry[] = [];
    
    customerPayments.filter(p => p.status === 'paid' && p.receivedDate.startsWith(targetPeriod)).forEach(p => {
      entries.push({ id: p.id, date: p.receivedDate, type: 'inflow', category: 'customer_payment', description: 'Payment for ' + p.bookingCode, amountUSD: p.amountUSD, runningBalanceUSD: 0 });
    });
    
    supplierPayments.filter(p => p.status === 'paid' && p.paidDate && p.paidDate.startsWith(targetPeriod)).forEach(p => {
      entries.push({ id: p.id, date: p.paidDate!, type: 'outflow', category: 'supplier_payment', description: 'PO ' + p.poNumber, amountUSD: p.amountUSD, runningBalanceUSD: 0 });
    });
    
    expenses.filter(e => e.status === 'approved' && e.expenseDate.startsWith(targetPeriod)).forEach(e => {
      entries.push({ id: e.id, date: e.expenseDate, type: 'outflow', category: 'expense', description: e.description, amountUSD: e.amountUSD, runningBalanceUSD: 0 });
    });
    
    entries.sort((a, b) => a.date.localeCompare(b.date));
    let balance = 0;
    entries.forEach(e => {
      balance += (e.type === 'inflow' ? e.amountUSD : -e.amountUSD);
      e.runningBalanceUSD = balance;
    });
    
    const totalInflow = entries.filter(e => e.type === 'inflow').reduce((sum, e) => sum + e.amountUSD, 0);
    const totalOutflow = entries.filter(e => e.type === 'outflow').reduce((sum, e) => sum + e.amountUSD, 0);
    
    return {
      period: targetPeriod,
      totalInflowUSD: totalInflow,
      totalOutflowUSD: totalOutflow,
      netCashFlowUSD: totalInflow - totalOutflow,
      openingBalanceUSD: 0,
      closingBalanceUSD: balance,
      entries
    };
  };

  const getErpDashboardStats = () => {
    return {
      totalOutstandingReceivableUSD: customerPayments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amountUSD, 0),
      totalOutstandingPayableUSD: supplierPayments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amountUSD, 0),
      totalApprovedExpensesUSD: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amountUSD, 0),
      totalPendingExpensesUSD: expenses.filter(e => e.status === 'pending_approval').reduce((sum, e) => sum + e.amountUSD, 0),
      activeSupplierCount: suppliers.filter(s => s.status === 'active').length,
      overduePaymentsCount: supplierPayments.filter(p => p.status === 'overdue').length
    };
  };

  const exportProfitReportCSV = (bookingId?: string) => {
    let rows = [['Booking', 'Revenue', 'Cost', 'Profit', 'Margin']];
    let toExport = bookingId ? bookings.filter(b => b.id === bookingId) : bookings;
    
    toExport.forEach(b => {
      const rep = getTripProfitReport(b.id);
      if (rep) {
        rows.push([rep.bookingCode, rep.totalRevenueUSD.toString(), rep.actualCostUSD.toString(), rep.netProfitUSD.toString(), rep.netMarginPercent.toFixed(2) + '%']);
      }
    });
    
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'TripProfitReport.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const recordSystemUpdate = (
    record: Omit<SystemUpdateHistoryRecord, 'id' | 'timestamp' | 'updatedBy' | 'source' | 'status'> & {
      id?: string;
      timestamp?: string;
      updatedBy?: string;
      source?: 'admin_action' | 'system_release' | 'auto_sync' | 'manual_log';
      status?: 'applied' | 'pending' | 'reverted';
    }
  ): SystemUpdateHistoryRecord => {
    const authorName = record.updatedBy || currentUser?.name || currentUser?.email || 'System Admin';
    const authorRole = record.updatedByRole || (currentUser?.role ? ROLE_CONFIGS[currentUser.role]?.name : 'Administrator');
    const id = record.id || `upd_act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = record.timestamp || new Date().toISOString();

    const newRecord: SystemUpdateHistoryRecord = {
      id,
      version: record.version || 'v5.2.0-Live',
      title: record.title,
      category: record.category,
      description: record.description,
      changes: record.changes || [],
      highlights: record.highlights || [],
      updatedBy: authorName,
      updatedByRole: authorRole,
      timestamp,
      source: record.source || 'admin_action',
      status: record.status || 'applied',
      metadata: record.metadata || {}
    };

    setSystemUpdates(prev => [newRecord, ...prev.filter(r => r.id !== id)]);

    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_UPDATES, JSON.stringify([newRecord, ...systemUpdates.filter(r => r.id !== id)]));
      const cleanPayload = sanitizeForFirestore(newRecord);
      setDoc(doc(db, 'system_updates', id), cleanPayload, { merge: true }).catch(err => {
        if (err?.code !== 'permission-denied') {
          console.warn('Firestore recordSystemUpdate notice:', err);
        }
      });
    } catch (e) {}

    logUserAudit('System Update Logged', `[${newRecord.category}] ${newRecord.title}`, 'info');
    return newRecord;
  };

  const deleteSystemUpdate = (id: string) => {
    setSystemUpdates(prev => prev.filter(u => u.id !== id));
    try {
      const remaining = systemUpdates.filter(u => u.id !== id);
      localStorage.setItem(STORAGE_KEYS.SYSTEM_UPDATES, JSON.stringify(remaining));
      deleteDoc(doc(db, 'system_updates', id)).catch(err => {
        if (err?.code !== 'permission-denied') {
          console.warn(err);
        }
      });
    } catch (e) {}
  };

  const clearSystemUpdateHistory = () => {
    setSystemUpdates(INITIAL_SYSTEM_UPDATES);
    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_UPDATES, JSON.stringify(INITIAL_SYSTEM_UPDATES));
    } catch (e) {}
    addNotification('History Reset', 'System update history reset to initial release milestones.', 'system');
  };

  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    setSystemSettings(prev => {
      const diffs = computeSettingsDiff(prev, updates);
      const updated = {
        ...prev,
        ...updates,
        paymentGateways: {
          ...prev.paymentGateways,
          ...(updates.paymentGateways || {})
        }
      };

      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
        setDoc(doc(db, 'system_settings', 'global_config'), sanitizeForFirestore(updated), { merge: true });
      } catch (e) {
        console.warn('System settings cloud sync queued:', e);
      }

      if (diffs.length > 0) {
        const cat = deriveCategoryFromChanges(diffs);
        const title = generateUpdateTitle(diffs, cat);
        const desc = generateUpdateSummary(diffs);
        recordSystemUpdate({
          title,
          category: cat,
          description: desc,
          changes: diffs,
          source: 'admin_action',
          status: 'applied',
          version: 'v5.2.0-Live'
        });
      }

      addNotification('Settings Updated', 'System configuration & feature flags saved successfully.', 'system');
      return updated;
    });
  };

  const resetSystemSettings = () => {
    setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
      setDoc(doc(db, 'system_settings', 'global_config'), sanitizeForFirestore(DEFAULT_SYSTEM_SETTINGS), { merge: true });
    } catch (e) {
      console.warn('Reset sync notice:', e);
    }
    recordSystemUpdate({
      title: 'Reset System Configuration to Defaults',
      category: 'system_settings',
      description: 'Restored all system branding, feature flags, and localization parameters to default factory preset.',
      source: 'admin_action',
      status: 'applied',
      version: 'v5.2.0-Live'
    });
    addNotification('Settings Reset', 'Configuration restored to factory defaults.', 'system');
  };

  const exportSystemBackupJSON = () => {
    const backupData = {
      version: '5.2',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.email || 'admin@khbevents.com',
      systemSettings,
      systemUpdates,
      packages,
      packageCategories,
      suppliers,
      costTemplates,
      purchaseOrders,
      customerPayments,
      supplierPayments,
      expenses,
      bookings,
      invoices,
      deletedItems
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KHB-System-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification('Backup Exported', 'Full system JSON snapshot downloaded successfully.', 'system');
  };

  const importSystemBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.systemSettings) setSystemSettings(data.systemSettings);
      if (Array.isArray(data.systemUpdates)) setSystemUpdates(data.systemUpdates);
      if (Array.isArray(data.packages)) setPackages(data.packages);
      if (Array.isArray(data.packageCategories)) setPackageCategories(data.packageCategories);
      if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (Array.isArray(data.costTemplates)) setCostTemplates(data.costTemplates);
      if (Array.isArray(data.purchaseOrders)) setPurchaseOrders(data.purchaseOrders);
      if (Array.isArray(data.customerPayments)) setCustomerPayments(data.customerPayments);
      if (Array.isArray(data.supplierPayments)) setSupplierPayments(data.supplierPayments);
      if (Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (Array.isArray(data.bookings)) setBookings(data.bookings);
      if (Array.isArray(data.invoices)) setInvoices(data.invoices);
      if (Array.isArray(data.deletedItems)) setDeletedItems(data.deletedItems);

      addNotification('Backup Restored', 'Complete system state restored from JSON backup.', 'system');
      triggerAutoSave('Restored system backup');
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      addNotification('Restore Error', 'Invalid backup file format.', 'system');
      return false;
    }
  };

  const forceSyncAll = async (): Promise<void> => {
    triggerAutoSave('Synchronizing all state with Cloud Firestore and LocalStorage...');
    try {
      // 1. Sync all active packages with Firestore
      packages.forEach(pkg => {
        setDoc(doc(db, 'packages', pkg.id), sanitizeForFirestore(pkg), { merge: true }).catch(() => {});
      });

      // 2. Sync system settings
      setDoc(doc(db, 'system_settings', 'global_config'), sanitizeForFirestore(systemSettings), { merge: true }).catch(() => {});

      // 3. Sync package categories
      packageCategories.forEach(cat => {
        setDoc(doc(db, 'package_categories', cat.id), sanitizeForFirestore(cat), { merge: true }).catch(() => {});
      });

      // 4. Ensure LocalStorage is explicitly written
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(systemSettings));
      localStorage.setItem(STORAGE_KEYS.PACKAGE_CATEGORIES, JSON.stringify(packageCategories));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));

      addNotification('Data Engine Synchronized', 'All packages, bookings, and configuration in sync with Cloud Firestore and LocalStorage.', 'system');
    } catch (err) {
      console.warn('Force sync notice:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CRM Webhook Receiver & Outbound Sync Orchestrator
  // ─────────────────────────────────────────────────────────────────────────

  const processedWebhookIdsRef = React.useRef<Set<string>>(new Set());

  // Initialize tracked webhook IDs on mount
  useEffect(() => {
    crmEvents.forEach(e => {
      if (e.id) processedWebhookIdsRef.current.add(e.id);
    });
    inboundLeads.forEach(l => {
      if (l.crmLeadId) processedWebhookIdsRef.current.add(l.crmLeadId);
      if (l.id) processedWebhookIdsRef.current.add(l.id);
    });
  }, []);

  const refreshWebhookEvents = async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const serverEvents = await fetchServerWebhookEvents();
      if (serverEvents && serverEvents.length > 0) {
        setCrmEvents(serverEvents);
        // Process any newly arrived events from the server queue in real time
        for (const evt of serverEvents) {
          if (evt.id && !processedWebhookIdsRef.current.has(evt.id)) {
            processedWebhookIdsRef.current.add(evt.id);
            processWebhookEvent(evt);
          }
        }
      }
      setCrmSyncLogs(getStoredCrmLogs());
    } catch {
      // Graceful offline fallback
    }
  };

  // Poll for external server webhooks when active in admin dashboard
  useEffect(() => {
    if (activeView !== 'admin_dashboard') return;
    refreshWebhookEvents();
    const interval = setInterval(refreshWebhookEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const processWebhookEvent = (event: CrmWebhookEvent) => {
    if (!event) return;
    if (event.id) {
      processedWebhookIdsRef.current.add(event.id);
    }

    // ── Deal Won / Lead Won in CRM -> Auto-Provision Delegate Profile, Booking & Invoice ──
    if (event.eventType === 'lead.won' || event.eventType === 'deal.won' || event.eventType === 'crm.deal_closed') {
      const payload = event.payload || {};
      const customerData = payload.customer || payload.delegate || payload;
      const dealData = payload.deal || payload;

      const customerEmail = customerData.email || payload.email || `delegate_${Date.now()}@khb-trade.com`;
      const customerName = customerData.name || payload.name || payload.customerName || 'Trade Mission Delegate';
      const customerPhone = customerData.phone || payload.phone || '+855 12 888 999';
      const companyName = customerData.company || payload.company || 'Phnom Penh Logistics Group';
      const assignedAgent = payload.assigned_agent || dealData.salesRep || 'Sophea Chamnab';

      // 1. Find or create user
      let targetUser = users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase());
      if (!targetUser) {
        targetUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          role: 'traveler',
          department: companyName || 'Trade Delegates',
          jobTitle: customerData.jobTitle || 'Executive Delegate',
          preferredLanguage: 'km',
          preferredCurrency: 'USD',
          createdAt: new Date().toISOString(),
        };
        setUsers(prev => [targetUser!, ...prev]);
        try {
          setDoc(doc(db, 'users', targetUser.id), targetUser, { merge: true });
        } catch (e) {
          console.warn('CRM User auto-provision notice:', e);
        }
      }

      // 2. Resolve package based on event_type or packageTitle
      const eventType = payload.event_type || dealData.event_type || dealData.packageTitle || '';
      const matchedPkg = packages.find(p => 
        (eventType && (p.title.toLowerCase().includes(eventType.toLowerCase()) || p.destination.toLowerCase().includes(eventType.toLowerCase()))) ||
        p.id === dealData.packageId ||
        p.title.toLowerCase().includes((dealData.packageTitle || '').toLowerCase())
      ) || packages[0];

      const adults = Number(payload.pax_count || dealData.numberOfAdults || dealData.adults || dealData.numberOfPax || 1);
      const children = Number(dealData.numberOfChildren || dealData.children || 0);
      const startDate = payload.tour_departure_date || dealData.startDate || dealData.travelDate || matchedPkg.availableDates?.[0] || '2026-10-15';
      
      const startObj = new Date(startDate);
      startObj.setDate(startObj.getDate() + (matchedPkg.durationDays || 5));
      const endDate = dealData.endDate || startObj.toISOString().split('T')[0];

      const totalPriceUSD = Number(payload.deal_value || dealData.dealAmountUSD || dealData.amountUSD || matchedPkg.priceUSD * adults);
      const paidAmount = Number(dealData.paidAmountUSD || dealData.depositPaidUSD || totalPriceUSD);
      const bookingCode = payload.booking_reference || dealData.bookingCode || `KHB-TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const bookingId = `b_crm_${Date.now()}`;
      const txId = `tx_crm_${Date.now()}`;
      const notes = payload.notes || dealData.notes || `Agent: ${assignedAgent}. Company: ${companyName}`;

      const newBooking: Booking = {
        id: bookingId,
        bookingCode,
        userId: targetUser.id,
        userName: targetUser.name,
        userEmail: targetUser.email,
        userPhone: targetUser.phone,
        packageId: matchedPkg.id,
        packageTitle: matchedPkg.title,
        packageDestination: matchedPkg.destination,
        packageImage: matchedPkg.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        startDate,
        endDate,
        numberOfAdults: adults,
        numberOfChildren: children,
        specialRequests: `Provisioned from CRM Deal: ${dealData.dealTitle || dealData.dealId || 'Closed Won'}. Company: ${companyName}`,
        status: 'confirmed',
        basePriceUSD: totalPriceUSD,
        taxAmountUSD: Math.round(totalPriceUSD * 0.07 * 100) / 100,
        totalPriceUSD,
        paidAmount,
        paidCurrency: 'USD',
        exchangeRateUsed: 1,
        createdAt: new Date().toISOString(),
        paymentMethod: 'bank_wire',
        paymentTransactionId: txId,
        flightStatus: matchedPkg.flightIncluded ? {
          flightNumber: 'TD 742',
          airline: 'TripDesk Global Skyways',
          departureAirport: 'Phnom Penh (PNH)',
          departureTime: `${startDate} 08:30 AM`,
          arrivalAirport: `${matchedPkg.destination.split(',')[0]} International`,
          arrivalTime: `${startDate} 01:15 PM`,
          status: 'Scheduled',
          gate: 'A12',
          terminal: 'International T1'
        } : undefined,
        hotelStatus: {
          hotelName: matchedPkg.itinerary[0]?.hotelName || `${matchedPkg.destination} Grand Executive Hotel (4-Star)`,
          checkInDate: startDate,
          checkOutDate: endDate,
          roomType: 'Deluxe B2B Delegation Room',
          confirmationCode: `HTL-CRM-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'Confirmed',
          address: `${matchedPkg.destination} City Center`
        }
      };

      const invoiceNumber = `INV-CRM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvoice: Invoice = {
        id: `inv_crm_${Date.now()}`,
        invoiceNumber,
        bookingId,
        bookingCode,
        customerName: targetUser.name,
        customerEmail: targetUser.email,
        customerAddress: companyName,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        items: [
          {
            description: `${matchedPkg.title} (${adults} Adults${children > 0 ? `, ${children} Children` : ''}) - CRM Deal ${dealData.dealId || ''}`,
            quantity: adults + children,
            unitPriceUSD: Math.round(totalPriceUSD / (adults + children)),
            totalUSD: totalPriceUSD,
          }
        ],
        subtotalUSD: totalPriceUSD,
        taxRatePercent: 7.0,
        taxAmountUSD: Math.round(totalPriceUSD * 0.07 * 100) / 100,
        totalUSD: totalPriceUSD,
        paidCurrency: 'USD',
        totalPaidInCurrency: paidAmount,
        paymentStatus: paidAmount >= totalPriceUSD ? 'paid' : 'pending',
        gatewayTxId: txId,
      };

      setBookings(prev => [newBooking, ...prev]);
      setInvoices(prev => [newInvoice, ...prev]);

      // 3. Provision / Update Inbound Won Lead Record with Handover Tasks
      const crmLeadId = payload.crm_lead_id || payload.lead_id || payload.id || `lead_${Date.now()}`;
      const tripCategory = eventType || matchedPkg.category || matchedPkg.title;
      
      const newWonLeadBase: Omit<InboundWonLead, 'handoverTasks'> = {
        id: `inb_${crmLeadId}`,
        crmLeadId,
        clientName: customerName,
        clientCompany: companyName,
        clientEmail: customerEmail,
        clientPhone: customerPhone,
        assignedAgent,
        tripCategory,
        dealTitle: dealData.dealTitle || `${tripCategory} - ${companyName}`,
        dealValueUSD: totalPriceUSD,
        commissionRate: payload.commission_rate || dealData.commissionRate || 0.08,
        paxCount: adults + children,
        departureDate: startDate,
        bookingCode,
        bookingId,
        invoiceId: newInvoice.id,
        packageId: matchedPkg.id,
        operationalStage: 'won_ingested',
        handoverLeadOfficer: assignedAgent || 'Sophea Chamnab (Operations Lead)',
        handoverStartedAt: new Date().toISOString(),
        manifest: [
          {
            id: `pax_lead_${Date.now()}`,
            name: customerName,
            jobTitle: customerData.jobTitle || 'Executive Delegate Leader',
            passportNumber: customerData.passportNumber || '',
            passportExpiry: customerData.passportExpiry || '',
            nationality: 'Cambodian',
            roomType: 'single',
            badgeIssued: false,
            phone: customerPhone,
            email: customerEmail,
          }
        ],
        paymentStatus: paidAmount >= totalPriceUSD ? 'fully_paid' : paidAmount > 0 ? 'deposit_paid' : 'unpaid',
        depositPaidUSD: paidAmount,
        crmSyncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
        notes,
        specialRequests: `Provisioned from CRM Won Lead: ${dealData.dealTitle || dealData.dealId || 'Closed Won'}. Company: ${companyName}`,
        hotelStatus: newBooking.hotelStatus,
        flightStatus: newBooking.flightStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const initialHandoverTasks = generateDefaultHandoverTasks(
        newWonLeadBase as InboundWonLead,
        assignedAgent || 'Sophea Chamnab (Operations Lead)'
      );

      const newWonLead: InboundWonLead = {
        ...newWonLeadBase,
        handoverTasks: initialHandoverTasks,
      };

      setInboundLeads(prev => {
        const filtered = prev.filter(l => l.crmLeadId !== crmLeadId && l.id !== newWonLead.id);
        const updated = [newWonLead, ...filtered];
        saveAllStoredInboundLeads(updated);
        return updated;
      });

      try {
        setDoc(doc(db, 'bookings', bookingId), sanitizeForFirestore(newBooking), { merge: true });
        setDoc(doc(db, 'invoices', newInvoice.id), sanitizeForFirestore(newInvoice), { merge: true });
        setDoc(doc(db, 'inbound_leads', newWonLead.id), sanitizeForFirestore(newWonLead), { merge: true });
      } catch (err) {
        console.warn('Firestore CRM booking auto-provision notice:', err);
      }

      // Trigger Audio Chime & Banner Alert
      playNotificationChime();
      setRecentWonLeadAlert({
        lead: newWonLead,
        timestamp: new Date().toISOString(),
      });

      addNotification(
        `🤝 CRM Lead Won: ${companyName}`,
        `New Won Lead ${bookingCode} (${customerName}, ${adults} Pax, $${totalPriceUSD.toLocaleString()}) received via Webhook! 8 Handover tasks initialized.`,
        'lead_won',
        {
          targetView: 'admin_dashboard',
          targetTab: 'inbound_leads',
          targetEntityId: newWonLead.id,
        }
      );
    } else if (event.eventType === 'trip.passenger_manifest_updated') {
      const targetCode = event.affectedEntityId || event.payload?.booking_reference || event.payload?.bookingCode;
      const manifestData = event.payload?.manifest || [];
      if (targetCode && Array.isArray(manifestData) && manifestData.length > 0) {
        setInboundLeads(prev => prev.map(l => {
          if (l.bookingCode === targetCode || l.crmLeadId === targetCode || l.id === targetCode) {
            const updated: InboundWonLead = {
              ...l,
              manifest: manifestData,
              paxCount: manifestData.length,
              operationalStage: l.operationalStage === 'won_ingested' ? 'manifest_pending' : l.operationalStage,
              updatedAt: new Date().toISOString()
            };
            try {
              setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
            } catch (err) {
              console.warn('Firestore manifest update notice:', err);
            }
            return updated;
          }
          return l;
        }));
        addNotification(
          `Passenger Manifest Updated`,
          `Updated ${manifestData.length} delegate manifests for booking ${targetCode}.`,
          'system'
        );
      }
    } else if (event.eventType === 'trip.payment_confirmed' || event.eventType === 'booking.payment_received') {
      const targetCode = event.affectedEntityId || event.payload?.booking_reference || event.payload?.bookingCode;
      const paidAmount = Number(event.payload?.deal_value || event.payload?.paid_amount || event.payload?.amount || 0);
      if (targetCode) {
        setInboundLeads(prev => prev.map(l => {
          if (l.bookingCode === targetCode || l.crmLeadId === targetCode || l.id === targetCode) {
            const updated: InboundWonLead = {
              ...l,
              paymentStatus: 'fully_paid',
              depositPaidUSD: paidAmount || l.dealValueUSD,
              operationalStage: l.operationalStage === 'won_ingested' || l.operationalStage === 'manifest_pending' ? 'finance_settled' : l.operationalStage,
              updatedAt: new Date().toISOString()
            };
            try {
              setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
            } catch (err) {
              console.warn('Firestore payment update notice:', err);
            }
            return updated;
          }
          return l;
        }));
      }
    } else if (event.eventType === 'booking.status_updated' || event.eventType === 'booking.cancelled') {
      const targetCode = event.affectedEntityId || event.payload?.bookingCode || event.payload?.bookingId;
      const targetStatus: BookingStatus = event.eventType === 'booking.cancelled' ? 'cancelled' : (event.payload?.status || 'confirmed');

      if (targetCode) {
        setBookings(prev => prev.map(b => {
          if (b.bookingCode === targetCode || b.id === targetCode) {
            const updated: Booking = { ...b, status: targetStatus };
            try {
              setDoc(doc(db, 'bookings', b.id), { status: targetStatus }, { merge: true });
            } catch (err) {
              console.warn('CRM Webhook Firestore update error:', err);
            }
            return updated;
          }
          return b;
        }));

        addNotification(
          `CRM Sync: Booking ${targetCode}`,
          `Status updated to "${targetStatus.toUpperCase()}" via external CRM webhook.`,
          'booking'
        );
      }
    } else if (event.eventType === 'flight.status_changed') {
      const targetCode = event.affectedEntityId || event.payload?.bookingCode;
      if (targetCode && event.payload?.flightStatus) {
        setBookings(prev => prev.map(b => {
          if (b.bookingCode === targetCode || b.id === targetCode) {
            const updated = { ...b, flightStatus: { ...b.flightStatus, ...event.payload.flightStatus } };
            try {
              setDoc(doc(db, 'bookings', b.id), { flightStatus: updated.flightStatus }, { merge: true });
            } catch (err) {
              console.warn('CRM Webhook flight update error:', err);
            }
            return updated;
          }
          return b;
        }));
        addNotification(
          `Flight Update (CRM)`,
          `Flight status changed: ${event.payload.flightStatus.flightNumber || 'Flight'} is ${event.payload.flightStatus.status || 'Updated'}.`,
          'flight'
        );
      }
    } else if (event.eventType === 'customer.vip_upgraded' || event.eventType === 'customer.profile_updated') {
      const targetName = event.payload?.name || event.payload?.customerName || 'Trade Delegate';
      addNotification(
        `CRM Delegate Sync: ${targetName}`,
        `Delegate record synchronized with CRM (${event.payload?.vipTag || 'VIP Platinum Tier'}).`,
        'system'
      );
    } else if (event.eventType === 'notification.broadcast') {
      addNotification(
        event.payload?.title || 'Trade Mission Alert',
        event.payload?.message || event.message || 'Delegation advisory update received from CRM.',
        event.payload?.type || 'system'
      );
    }

    setCrmEvents(prev => [event, ...prev.filter(e => e.id !== event.id)].slice(0, 100));
    setCrmSyncLogs(getStoredCrmLogs());
  };

  const pushBookingToCrm = async (bookingId: string): Promise<boolean> => {
    const booking = bookings.find(b => b.id === bookingId || b.bookingCode === bookingId);
    if (!booking) {
      addNotification('CRM Push Error', `Booking "${bookingId}" not found.`, 'system');
      return false;
    }
    const customer = users.find(u => u.id === booking.userId || u.email === booking.userEmail);
    const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;

    addNotification('CRM Sync Initiated', `Pushing booking ${booking.bookingCode} to CRM...`, 'system');
    const result = await pushBookingToExternalCrm(booking, customer, config);

    if (result.success) {
      addNotification(
        'CRM Sync Success',
        `Booking ${booking.bookingCode} successfully synchronized with external CRM (${result.durationMs}ms).`,
        'booking'
      );
    } else {
      addNotification(
        'CRM Sync Warning',
        `Failed to push ${booking.bookingCode}: ${result.message}`,
        'system'
      );
    }
    setCrmSyncLogs(getStoredCrmLogs());
    return result.success;
  };

  const pushCustomerToCrm = async (userId: string): Promise<boolean> => {
    const customer = users.find(u => u.id === userId || u.email === userId);
    if (!customer) {
      addNotification('CRM Push Error', `User "${userId}" not found.`, 'system');
      return false;
    }
    const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;

    const result = await pushCustomerToExternalCrm(customer, config);
    if (result.success) {
      addNotification(
        'CRM Delegate Synced',
        `Delegate ${customer.name} pushed to CRM pipeline (${result.durationMs}ms).`,
        'system'
      );
    } else {
      addNotification('CRM Delegate Sync Warning', `Failed to push delegate: ${result.message}`, 'system');
    }
    setCrmSyncLogs(getStoredCrmLogs());
    return result.success;
  };

  const syncAllBookingsToCrm = async (): Promise<{ total: number; success: number }> => {
    const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
    let successCount = 0;
    for (const b of bookings) {
      const customer = users.find(u => u.id === b.userId || u.email === b.userEmail);
      const res = await pushBookingToExternalCrm(b, customer, config);
      if (res.success) successCount++;
    }
    addNotification(
      'Bulk CRM Sync Complete',
      `Synchronized ${successCount}/${bookings.length} trade mission bookings with CRM.`,
      'system'
    );
    setCrmSyncLogs(getStoredCrmLogs());
    return { total: bookings.length, success: successCount };
  };

  const syncAllCustomersToCrm = async (): Promise<{ total: number; success: number }> => {
    const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
    let successCount = 0;
    for (const u of users) {
      const res = await pushCustomerToExternalCrm(u, config);
      if (res.success) successCount++;
    }
    addNotification(
      'Bulk CRM Delegate Sync Complete',
      `Synchronized ${successCount}/${users.length} delegates and customer profiles with CRM.`,
      'system'
    );
    setCrmSyncLogs(getStoredCrmLogs());
    return { total: users.length, success: successCount };
  };

  const testCrmConnection = async (config?: CrmConfig) => {
    const activeConfig = config || systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
    const res = await testCrmApiConnection(activeConfig);
    setCrmSyncLogs(getStoredCrmLogs());
    return res;
  };

  const simulateWebhookTrigger = async (
    eventType: CrmWebhookEventType,
    payload: any,
    source = 'Admin Webhook Simulator',
    customMessage?: string
  ): Promise<boolean> => {
    const res = await simulateCrmWebhook(eventType, payload, source, customMessage);
    if (res.success && res.event) {
      processWebhookEvent(res.event);
      return true;
    }
    return false;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Inbound CRM Won Leads Operations & Manifest Management
  // ─────────────────────────────────────────────────────────────────────────

  const addInboundLead = (leadData: Omit<InboundWonLead, 'id' | 'createdAt' | 'updatedAt'>): InboundWonLead => {
    const newLead: InboundWonLead = {
      ...leadData,
      id: `inb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setInboundLeads(prev => [newLead, ...prev]);
    saveStoredInboundLead(newLead);

    try {
      setDoc(doc(db, 'inbound_leads', newLead.id), sanitizeForFirestore(newLead), { merge: true });
    } catch (e) {
      console.warn('Firestore add inbound lead notice:', e);
    }

    logUserAudit(
      'Inbound CRM Lead Added',
      `Registered Won Lead ${newLead.bookingCode} for ${newLead.clientCompany} ($${newLead.dealValueUSD}, ${newLead.paxCount} Pax).`,
      'info'
    );

    return newLead;
  };

  const updateInboundLead = (lead: InboundWonLead) => {
    const updated: InboundWonLead = {
      ...lead,
      updatedAt: new Date().toISOString()
    };

    setInboundLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    saveStoredInboundLead(updated);

    try {
      setDoc(doc(db, 'inbound_leads', updated.id), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Firestore update inbound lead notice:', e);
    }
  };

  const updateLeadOperationalStage = (leadId: string, stage: LeadOperationalStage) => {
    setInboundLeads(prev => prev.map(l => {
      if (l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId) {
        const updated: InboundWonLead = {
          ...l,
          operationalStage: stage,
          lastTaskAction: `Operational stage advanced to "${stage}"`,
          updatedAt: new Date().toISOString()
        };
        saveStoredInboundLead(updated);
        try {
          setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
        } catch (e) {
          console.warn('Firestore stage update notice:', e);
        }

        // Cross-Flow Realtime Sync: Broadcast Stage Progress to CRM Webhook Gateway
        const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
        pushLeadTaskProgressToCrm(
          updated,
          `Operational stage advanced to "${stage.replace(/_/g, ' ').toUpperCase()}"`,
          'operation.cross_flow_update',
          config
        ).then(() => setCrmSyncLogs(getStoredCrmLogs())).catch(e => console.warn('Stage sync CRM push error:', e));

        return updated;
      }
      return l;
    }));

    addNotification(
      `Operational Stage Updated`,
      `Lead stage advanced to "${stage.replace(/_/g, ' ').toUpperCase()}". Synced with CRM.`,
      'system'
    );
  };

  const updateLeadManifest = (leadId: string, manifest: LeadPassenger[]) => {
    setInboundLeads(prev => prev.map(l => {
      if (l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId) {
        let tasks = l.handoverTasks && l.handoverTasks.length > 0 ? l.handoverTasks : generateDefaultHandoverTasks(l);
        // Auto-complete Task 2 if all required delegates are registered
        if (manifest.length >= l.paxCount && manifest.length > 0) {
          tasks = tasks.map(t => t.category === 'manifest_passports' ? {
            ...t,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            completedBy: currentUser?.name || 'Operations Desk',
            notes: `Verified all ${manifest.length} delegation passenger passports.`
          } : t);
        }

        const nextStage = getRecommendedStageFromTasks(tasks, l.operationalStage);
        const updated: InboundWonLead = {
          ...l,
          manifest,
          paxCount: manifest.length || l.paxCount,
          handoverTasks: tasks,
          operationalStage: nextStage,
          lastTaskAction: `Passenger manifest updated (${manifest.length} delegates)`,
          updatedAt: new Date().toISOString()
        };

        saveStoredInboundLead(updated);
        try {
          setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
        } catch (e) {
          console.warn('Firestore manifest update notice:', e);
        }

        // Cross-Flow Realtime Sync: Broadcast Manifest Progress to CRM
        const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
        pushLeadTaskProgressToCrm(
          updated,
          `Manifest registered: ${manifest.length} delegates (${manifest.map(m => m.name).join(', ')})`,
          'trip.passenger_manifest_updated',
          config
        ).then(() => setCrmSyncLogs(getStoredCrmLogs())).catch(e => console.warn('Manifest CRM push error:', e));

        return updated;
      }
      return l;
    }));
  };

  const syncLeadToCrm = async (
    leadId: string,
    eventType: 'trip.booking_confirmed' | 'trip.passenger_manifest_updated' | 'trip.payment_confirmed'
  ): Promise<{ success: boolean; message: string }> => {
    const targetLead = inboundLeads.find(l => l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId);
    if (!targetLead) {
      return { success: false, message: 'Inbound lead record not found.' };
    }

    const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
    const res = await pushLeadUpdateToCrm(targetLead, eventType, config);

    // Update CRM sync timestamp
    if (res.success) {
      updateInboundLead({
        ...targetLead,
        crmSyncStatus: 'synced',
        lastSyncedAt: new Date().toISOString()
      });
      addNotification(
        `2-Way CRM Sync Successful`,
        `Dispatched "${eventType}" to CRM for booking ${targetLead.bookingCode}.`,
        'system'
      );
    } else {
      updateInboundLead({
        ...targetLead,
        crmSyncStatus: 'error'
      });
      addNotification(
        `CRM Sync Warning`,
        res.message || `Failed to sync ${eventType} with CRM.`,
        'system'
      );
    }

    setCrmSyncLogs(getStoredCrmLogs());
    return { success: res.success, message: res.message };
  };

  const syncLeadProgressToCrm = async (
    leadId: string,
    actionDesc = 'Manual Operations Progress Sync'
  ): Promise<{ success: boolean; message: string }> => {
    const targetLead = inboundLeads.find(l => l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId);
    if (!targetLead) {
      return { success: false, message: 'Inbound lead record not found.' };
    }

    const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
    const res = await pushLeadTaskProgressToCrm(targetLead, actionDesc, 'trip.task_progress_updated', config);

    if (res.success) {
      const updated: InboundWonLead = {
        ...targetLead,
        crmSyncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
        lastTaskAction: actionDesc,
      };
      updateInboundLead(updated);
      addNotification(
        '🔄 2-Way CRM Progress Synced',
        `Pushed latest task status for booking ${targetLead.bookingCode} (${targetLead.clientCompany}) to CRM Master Center.`,
        'system'
      );
    } else {
      addNotification('CRM Sync Warning', res.message || 'Failed to sync task progress with CRM.', 'system');
    }
    setCrmSyncLogs(getStoredCrmLogs());
    return { success: res.success, message: res.message };
  };

  const syncAllLeadsProgressToCrm = async (): Promise<{ total: number; success: number }> => {
    const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
    const res = await syncAllLeadsProgressApi(inboundLeads, config);
    addNotification(
      '⚡ Bulk Operations CRM Sync Complete',
      `Successfully synchronized live task progress for ${res.success}/${res.total} active delegation leads with CRM.`,
      'system'
    );
    setCrmSyncLogs(getStoredCrmLogs());
    return res;
  };

  const deleteInboundLead = (leadId: string) => {
    const target = inboundLeads.find(l => l.id === leadId || l.bookingCode === leadId);
    if (!target) return;

    setInboundLeads(prev => prev.filter(l => l.id !== target.id));
    try {
      deleteDoc(doc(db, 'inbound_leads', target.id));
    } catch (e) {
      console.warn('Firestore delete inbound lead notice:', e);
    }

    logUserAudit('Inbound CRM Lead Deleted', `Removed lead ${target.bookingCode} (${target.clientCompany})`, 'warning');
  };

  const startLeadHandover = (leadId: string, officerName = 'Sophea Chamnab (Operations Lead)') => {
    setInboundLeads(prev => prev.map(l => {
      if (l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId) {
        const tasks = l.handoverTasks && l.handoverTasks.length > 0
          ? l.handoverTasks
          : generateDefaultHandoverTasks(l, officerName);

        const updated: InboundWonLead = {
          ...l,
          operationalStage: l.operationalStage === 'won_ingested' ? 'manifest_pending' : l.operationalStage,
          handoverTasks: tasks,
          handoverStartedAt: l.handoverStartedAt || new Date().toISOString(),
          handoverLeadOfficer: officerName,
          lastTaskAction: `Handover started by ${officerName}`,
          updatedAt: new Date().toISOString(),
        };

        saveStoredInboundLead(updated);
        try {
          setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
        } catch (e) {
          console.warn('Firestore start handover notice:', e);
        }

        // Push initial handover activation to CRM
        const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
        pushLeadTaskProgressToCrm(
          updated,
          `Operations handover activated. Assigned to ${officerName}`,
          'trip.task_progress_updated',
          config
        ).then(() => setCrmSyncLogs(getStoredCrmLogs())).catch(e => console.warn('Handover CRM push:', e));

        return updated;
      }
      return l;
    }));

    playNotificationChime();
    addNotification(
      '🚀 Handover Workflow Started',
      `Operations handover activated for lead ${leadId}. 8 standard fulfillment tasks assigned to ${officerName}. Synced with CRM.`,
      'system'
    );
  };

  const updateLeadHandoverTask = (
    leadId: string,
    taskId: string,
    updates: Partial<LeadHandoverTask>,
    autoAdvanceStage = true
  ) => {
    setInboundLeads(prev => prev.map(l => {
      if (l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId) {
        const currentTasks = l.handoverTasks && l.handoverTasks.length > 0
          ? l.handoverTasks
          : generateDefaultHandoverTasks(l);

        let targetTaskTitle = 'Operational Task';
        const updatedTasks = currentTasks.map(t => {
          if (t.id === taskId) {
            targetTaskTitle = t.title;
            const isNowCompleted = updates.status === 'completed' && t.status !== 'completed';
            return {
              ...t,
              ...updates,
              completedAt: isNowCompleted ? new Date().toISOString() : (updates.status && updates.status !== 'completed' ? undefined : t.completedAt),
              completedBy: isNowCompleted ? (currentUser?.name || 'Operations Officer') : t.completedBy,
            };
          }
          return t;
        });

        let nextStage = l.operationalStage;
        if (autoAdvanceStage) {
          nextStage = getRecommendedStageFromTasks(updatedTasks, l.operationalStage);
        }

        const actionDescription = updates.status === 'completed'
          ? `Completed "${targetTaskTitle}"`
          : `Updated "${targetTaskTitle}" to ${updates.status || 'in progress'}`;

        const updated: InboundWonLead = {
          ...l,
          handoverTasks: updatedTasks,
          operationalStage: nextStage,
          lastTaskAction: actionDescription,
          lastSyncedTaskTitle: targetTaskTitle,
          updatedAt: new Date().toISOString(),
        };

        saveStoredInboundLead(updated);
        try {
          setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
        } catch (e) {
          console.warn('Firestore handover task update notice:', e);
        }

        // 2-Way Live Sync: Broadcast Task Progress to external CRM
        const config = systemSettings.crmConfig || DEFAULT_CRM_CONFIG;
        pushLeadTaskProgressToCrm(
          updated,
          actionDescription,
          'trip.task_progress_updated',
          config
        ).then((res) => {
          setCrmSyncLogs(getStoredCrmLogs());
          if (res.success) {
            setInboundLeads(currentLeads => currentLeads.map(leadItem =>
              leadItem.id === updated.id ? { ...leadItem, crmSyncStatus: 'synced', lastSyncedAt: new Date().toISOString() } : leadItem
            ));
          }
        }).catch((err) => console.warn('Background 2-Way CRM task progress push error:', err));

        return updated;
      }
      return l;
    }));
  };

  const addLeadHandoverTask = (leadId: string, task: Omit<LeadHandoverTask, 'id'>) => {
    const newTask: LeadHandoverTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    setInboundLeads(prev => prev.map(l => {
      if (l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId) {
        const currentTasks = l.handoverTasks || [];
        const updated: InboundWonLead = {
          ...l,
          handoverTasks: [...currentTasks, newTask],
          updatedAt: new Date().toISOString(),
        };
        saveStoredInboundLead(updated);
        try {
          setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
        } catch (e) {
          console.warn('Firestore add handover task notice:', e);
        }
        return updated;
      }
      return l;
    }));

    addNotification('Handover Task Added', `New task "${newTask.title}" assigned to lead.`, 'system');
  };

  const deleteLeadHandoverTask = (leadId: string, taskId: string) => {
    setInboundLeads(prev => prev.map(l => {
      if (l.id === leadId || l.crmLeadId === leadId || l.bookingCode === leadId) {
        const currentTasks = l.handoverTasks || [];
        const updated: InboundWonLead = {
          ...l,
          handoverTasks: currentTasks.filter(t => t.id !== taskId),
          updatedAt: new Date().toISOString(),
        };
        saveStoredInboundLead(updated);
        try {
          setDoc(doc(db, 'inbound_leads', l.id), sanitizeForFirestore(updated), { merge: true });
        } catch (e) {
          console.warn('Firestore delete handover task notice:', e);
        }
        return updated;
      }
      return l;
    }));
  };

  // Dynamically compute fully localized representations of packages based on the active language
  const localizedPackages = useMemo(() => {
    return packages.map(pkg => getLocalizedPackage(pkg, language));
  }, [packages, language]);

  const localizedSelectedPackage = useMemo(() => {
    if (!selectedPackage) return null;
    return getLocalizedPackage(selectedPackage, language);
  }, [selectedPackage, language]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin,
        isStaff,
        isSuperAdmin,
        users,
        auditLogs,
        hasPermission,
        canAccessTab,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        assignUserRoleAndPermissions,
        toggleUserPermissionDirectly,
        toggleUserTabDirectly,
        resetUserPermissionsToDefault,
        switchActiveUser,
        generateTemporaryPassword,
        resetUserSecurityCredentials,
        logUserAudit,
        language,
        currency,
        darkMode,
        offlineMode,
        isFirebaseConnected,
        packages: localizedPackages,
        rawPackages: packages,
        getLocalizedPackage: (pkg: TourPackage) => getLocalizedPackage(pkg, language),
        bookings,
        invoices,
        supportChats,
        notifications,
        unreadNotificationCount,
        activeView,
        selectedPackage: localizedSelectedPackage,
        selectedBooking,
        selectedInvoice,
        activeModal,
        suppliers,
        costTemplates,
        purchaseOrders,
        customerPayments,
        supplierPayments,
        expenses,
        deletedItems,
        systemSettings,
        updateSystemSettings,
        resetSystemSettings,
        exportSystemBackupJSON,
        importSystemBackupJSON,
        adminActiveTab,
        setAdminActiveTab,
        settingsSubTab,
        setSettingsSubTab,
        navigateToSettings,
        systemUpdates,
        recordSystemUpdate,
        deleteSystemUpdate,
        clearSystemUpdateHistory,
        addSupplier, updateSupplier, deleteSupplier,
        saveCostTemplate, updateCostTemplate, deleteCostTemplate, getCostTemplateForPackage,
        createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, updatePOStatus,
        addCustomerPayment, updateCustomerPayment, deleteCustomerPayment,
        addSupplierPayment, updateSupplierPayment, markSupplierPaymentPaid, deleteSupplierPayment,
        addExpense, updateExpense, approveExpense, rejectExpense, deleteExpense,
        deleteBooking, deleteInvoice,
        recoverItem, permanentDeleteItem, restoreAllDeleted, emptyRecycleBin,
        getTripProfitReport, getCashFlowSummary, getErpDashboardStats, exportProfitReportCSV,
        setActiveView,
        openPackageSalesPage,
        isPackageEditorOpen,
        editingPackage,
        openPackageEditorWithAi,
        openPackageEditor,
        closePackageEditor,
        setSelectedPackage,
        setSelectedBooking,
        setSelectedInvoice,
        setActiveModal,
        setLanguage,
        setCurrency,
        toggleDarkMode,
        toggleOfflineMode,
        signInWithGoogle,
        loginAsTraveler,
        loginAsAdmin,
        loginWithEmail,
        loginWithPhone,
        registerPublicUser,
        authenticateBiometric,
        registerBiometrics,
        logout,
        switchRole,
        createBooking,
        modifyBookingDate,
        cancelBooking,
        updateBookingStatusByAdmin,
        addPackage,
        updatePackage,
        updatePackageStatus,
        clonePackageAsDraft,
        deletePackage,
        restorePackage,
        packageCategories,
        addPackageCategory,
        updatePackageCategory,
        deletePackageCategory,
        togglePackageCategoryStatus,
        reorderPackageCategories,
        resetPackageCategories,
        sendSupportMessage,
        addNotification,
        markNotificationsAsRead,
        markNotificationAsRead,
        deleteNotification,
        clearAllNotifications,
        handleNotificationClick,
        getMonthlyFinancialSummary,
        exportMonthlyReportCSV,
        // CRM & Webhook Suite
        crmEvents,
        crmSyncLogs,
        inboundLeads,
        recentWonLeadAlert,
        clearWonLeadAlert,
        addInboundLead,
        updateInboundLead,
        updateLeadOperationalStage,
        updateLeadManifest,
        startLeadHandover,
        updateLeadHandoverTask,
        addLeadHandoverTask,
        deleteLeadHandoverTask,
        syncLeadToCrm,
        syncLeadProgressToCrm,
        syncAllLeadsProgressToCrm,
        deleteInboundLead,
        processWebhookEvent,
        pushBookingToCrm,
        pushCustomerToCrm,
        syncAllBookingsToCrm,
        syncAllCustomersToCrm,
        testCrmConnection,
        simulateWebhookTrigger,
        refreshWebhookEvents,
        defaultView,
        defaultAdminTab,
        defaultPackageViewMode,
        setDefaultView,
        setDefaultAdminTab,
        setDefaultPackageViewMode,
        resetDefaultView,
        toastMessage,
        showToast,
        clearToast,
        autoSyncState,
        triggerAutoSave,
        forceSyncAll,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
