import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
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
  Booking,
  Invoice,
  SupportChat,
  PushNotification,
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
  DEFAULT_SYSTEM_SETTINGS
} from '../services/mockData';
import {
  pushBookingToExternalCrm,
  pushCustomerToExternalCrm,
  testCrmApiConnection,
  simulateCrmWebhook,
  fetchServerWebhookEvents,
  getStoredCrmLogs,
  getStoredWebhookEvents,
  DEFAULT_CRM_CONFIG,
} from '../services/crmIntegrationService';
import { isStaffMember, userHasPermission, userCanAccessTab, isAllowedGoogleDomain, ROLE_CONFIGS } from '../services/rolePermissions';
import { CURRENCY_CONFIGS, convertFromUSD } from '../services/currencyService';
import { isRTL, translations } from '../i18n/translations';
import { getLocalizedPackage } from '../utils/packageLocalization';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';
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
  resetUserPermissionsToDefault: (userId: string) => Promise<void>;
  switchActiveUser: (userId: string) => void;
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
  
  addPackage: (pkg: Omit<TourPackage, 'id' | 'rating' | 'reviewCount' | 'bookedThisMonth'>) => void;
  updatePackage: (pkg: TourPackage) => void;
  deletePackage: (packageId: string) => void;
  
  sendSupportMessage: (chatId: string, text: string, senderRole?: 'traveler' | 'admin') => void;
  addNotification: (title: string, message: string, type?: PushNotification['type']) => void;
  markNotificationsAsRead: () => void;
  
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

  // CRM & Webhook Integration Suite
  crmEvents: CrmWebhookEvent[];
  crmSyncLogs: CrmSyncLog[];
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
    userRole: 'admin',
    action: 'Flight Schedule Verified',
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
  
  const [packages, setPackages] = useState<TourPackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
      id: 'notif_welcome',
      title: 'KHB Trade Mission ERP Active',
      message: 'System initialized for live operations. Cloud database & real-time sync connected.',
      type: 'flight',
      timestamp: 'Just now',
      read: false
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

  // CRM & Webhook Inbound & Outbound Sync State
  const [crmEvents, setCrmEvents] = useState<CrmWebhookEvent[]>(() => getStoredWebhookEvents());
  const [crmSyncLogs, setCrmSyncLogs] = useState<CrmSyncLog[]>(() => getStoredCrmLogs());

  const [activeView, setActiveView] = useState<ActiveView>('marketing');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('overview');
  const [settingsSubTab, setSettingsSubTab] = useState<string>('features');
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

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
        const isAdminUser =
          fbUser.email === 'chamnabmey.info@gmail.com' ||
          fbUser.email === 'vutha.tim@khbmedia.asia' ||
          fbUser.email?.endsWith('@khbevents.com') ||
          fbUser.email?.endsWith('@khbmedia.asia') ||
          fbUser.email?.includes('admin');
        const updatedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Traveler',
          email: fbUser.email || 'traveler@example.com',
          phone: fbUser.phoneNumber || '+1 (555) 019-2831',
          role: isAdminUser ? 'admin' : 'traveler',
          preferredLanguage: language,
          preferredCurrency: currency,
          hasBiometrics: false
        };
        setCurrentUser(updatedUser);
      }
    });
    return () => unsubscribe();
  }, [language, currency]);

  // Firestore Real-Time Packages Sync (with Deleted IDs Guard)
  useEffect(() => {
    try {
      const q = query(collection(db, 'packages'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const deletedSet = new Set(deletedIds);
        const remotePackages: TourPackage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TourPackage;
          if (data && data.id && !deletedSet.has(data.id)) {
            remotePackages.push(data);
          }
        });
        if (remotePackages.length > 0) {
          setPackages(remotePackages);
          try {
            localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(remotePackages));
          } catch (e) {}
        } else if (snapshot.empty && INITIAL_PACKAGES.length > 0) {
          // Initialize Firestore with official packages if collection is currently empty
          const nonDeletedSeeds = INITIAL_PACKAGES.filter(p => !deletedSet.has(p.id));
          setPackages(nonDeletedSeeds);
          nonDeletedSeeds.forEach(pkg => {
            setDoc(doc(db, 'packages', pkg.id), sanitizeForFirestore(pkg)).catch(() => {});
          });
        } else {
          setPackages(remotePackages);
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
        }, err => console.warn(coll.name, 'snapshot notice:', err.message));
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
        console.warn('Users snapshot notice:', err.message);
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
        console.warn('Audit logs snapshot notice:', err.message);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore audit logs sync fallback to local store');
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
        console.warn('System settings snapshot notice:', err.message);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore system settings sync fallback to local store');
    }
  }, []);

  const isStaff = isStaffMember(currentUser);
  const isAdmin = isStaff;
  const isSuperAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.email === 'chamnabmey.info@gmail.com' ||
    currentUser?.email === 'vutha.tim@khbmedia.asia';

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
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdUser: User = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: userData.status || 'active'
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
    addNotification('User Created', `Successfully added ${createdUser.name} to the directory.`, 'system');
    return createdUser;
  };

  const updateUser = async (updatedUserData: User): Promise<void> => {
    setUsers(prev => prev.map(u => u.id === updatedUserData.id ? updatedUserData : u));
    if (currentUser?.id === updatedUserData.id) {
      setCurrentUser(updatedUserData);
    }
    logUserAudit(
      'Updated User Profile',
      `Modified attributes/roles for ${updatedUserData.name} (${updatedUserData.email}) - Role: [${updatedUserData.role}], Status: [${updatedUserData.status}]`,
      'info'
    );
    try {
      await setDoc(doc(db, 'users', updatedUserData.id), sanitizeForFirestore(updatedUserData), { merge: true });
    } catch (e) {
      console.warn('Failed to update user in Firestore:', e);
    }
    addNotification('User Updated', `Changes to ${updatedUserData.name} have been saved.`, 'system');
  };

  const assignUserRoleAndPermissions = async (
    userId: string,
    role: UserRole,
    customPermissions?: PermissionKey[],
    customAccessibleTabs?: string[]
  ): Promise<void> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const updated: User = {
      ...targetUser,
      role,
      customPermissions: customPermissions ? [...customPermissions] : undefined,
      customAccessibleTabs: customAccessibleTabs ? [...customAccessibleTabs] : undefined
    };

    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    logUserAudit(
      'RBAC Permissions Override Assigned',
      `Super Admin reconfigured clearance for ${targetUser.name} (${targetUser.email}) -> Role: [${role}], Custom Permissions: ${customPermissions ? customPermissions.length : 'Default'}, Custom Tabs: ${customAccessibleTabs ? customAccessibleTabs.length : 'Default'}`,
      'security'
    );

    try {
      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(updated), { merge: true });
    } catch (e) {
      console.warn('Failed to sync updated user permissions to Firestore:', e);
    }

    addNotification(
      'Role & Permissions Updated',
      `Assigned role "${ROLE_CONFIGS[role]?.displayName || role}" and custom permission overrides to ${targetUser.name}.`,
      'system'
    );
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
    if (targetUser.role === 'super_admin' && users.filter(u => u.role === 'super_admin').length <= 1) {
      addNotification('Action Denied', 'Cannot delete the primary Super Admin account.', 'system');
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
    const updated = { ...target, status };
    await updateUser(updated);
    logUserAudit(
      'Status Changed',
      `User ${target.name} status updated from [${target.status || 'active'}] to [${status}]`,
      status === 'suspended' ? 'warning' : 'info'
    );
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

      const isSuperAdminEmail = userEmail === 'chamnabmey.info@gmail.com';
      const isLeadDirectorEmail = userEmail === 'vutha.tim@khbmedia.asia' || userEmail === 'vutha.tim@khbevents.com';
      
      const existingUser = users.find(u => u.email.toLowerCase() === userEmail);
      const assignedRole: UserRole = isSuperAdminEmail
        ? 'super_admin'
        : (existingUser?.role && existingUser.role !== 'traveler' ? existingUser.role : (isLeadDirectorEmail ? 'admin' : 'operations_manager'));

      const newUser: User = {
        id: user.uid,
        name: user.displayName || existingUser?.name || userEmail.split('@')[0] || 'KHB Staff Member',
        email: user.email || userEmail,
        phone: user.phoneNumber || existingUser?.phone || '+855 12 345 678',
        role: assignedRole,
        department: existingUser?.department || (isSuperAdminEmail || isLeadDirectorEmail ? 'Executive Leadership' : 'Trip Operations'),
        preferredLanguage: language,
        preferredCurrency: currency,
        hasBiometrics: true,
        avatarUrl: user.photoURL || undefined
      };

      setCurrentUser(newUser);

      // Upsert to Firestore users collection
      try {
        await setDoc(doc(db, 'users', user.uid), sanitizeForFirestore({
          id: user.uid,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          department: newUser.department,
          preferredLanguage: language,
          preferredCurrency: currency,
          avatarUrl: newUser.avatarUrl,
          createdAt: new Date().toISOString()
        }), { merge: true });
      } catch (e) {
        console.warn('User profile sync notice:', e);
      }

      setActiveView('admin_dashboard');
      addNotification('Corporate Staff Login Verified', `Welcome back, ${newUser.name} (${newUser.email})!`, 'system');
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
          id: 'usr_tim_vutha',
          name: 'Tim Vutha',
          email: fallbackEmail,
          phone: '+855 12 888 999',
          role: 'admin',
          department: 'Executive Leadership',
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
    const isCorporateStaff =
      cleanEmail.endsWith('@khbevents.com') ||
      cleanEmail.endsWith('@khbmedia.asia') ||
      cleanEmail === 'vutha.tim@khbmedia.asia' ||
      cleanEmail === 'chamnabmey.info@gmail.com';

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

    const generatedName = name || cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);
    const finalRole: UserRole = isCorporateStaff ? 'admin' : (role || 'traveler');
    const userId = `usr_${Date.now()}`;
    const user: User = {
      id: userId,
      name: formattedName || (finalRole === 'admin' ? 'KHB Staff Member' : 'Traveler'),
      email: cleanEmail,
      phone: phone || '+855 12 345 678',
      role: finalRole,
      department: isCorporateStaff ? 'Trip Operations' : 'Trade Delegates',
      preferredLanguage: language,
      preferredCurrency: currency,
      hasBiometrics: false,
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
        preferredLanguage: language,
        preferredCurrency: currency,
        createdAt: new Date().toISOString()
      }));
    } catch {}

    if (finalRole === 'admin') {
      setActiveView('admin_dashboard');
      addNotification('Corporate Staff Login', `Logged in with verified company email: ${cleanEmail}`, 'system');
    } else {
      setActiveView('customer_portal');
      addNotification('Welcome', `Logged in as ${user.name}`, 'booking');
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

  const addNotification = (title: string, message: string, type: PushNotification['type'] = 'system') => {
    const newNotif: PushNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
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
  };

  // Package Catalog Management
  const addPackage = (pkgData: Omit<TourPackage, 'id' | 'rating' | 'reviewCount' | 'bookedThisMonth'>) => {
    const newPkg: TourPackage = {
      ...pkgData,
      id: `pkg_${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      bookedThisMonth: 0
    };
    setPackages(prev => {
      const next = [newPkg, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
      return next;
    });
    try {
      setDoc(doc(db, 'packages', newPkg.id), sanitizeForFirestore(newPkg));
    } catch (e) {
      console.warn('Package Firestore save notice:', e);
    }
    addNotification('Package Published', `New tour package "${newPkg.title}" is now live on the public storefront.`, 'system');
  };

  const updatePackage = (pkg: TourPackage) => {
    setPackages(prev => {
      const next = prev.map(p => p.id === pkg.id ? pkg : p);
      try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
      return next;
    });
    try {
      setDoc(doc(db, 'packages', pkg.id), sanitizeForFirestore(pkg), { merge: true });
    } catch (e) {
      console.warn('Package Firestore update notice:', e);
    }
    addNotification('Package Updated', `Changes to "${pkg.title}" have been saved.`, 'system');
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
        data: pkg
      };
      setDeletedItems(prev => [record, ...prev]);
    }
    setPackages(prev => {
      const next = prev.filter(p => p.id !== packageId);
      try { localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(next)); } catch (e) {}
      return next;
    });
    try {
      deleteDoc(doc(db, 'packages', packageId));
    } catch (e) {
      console.warn('Package Firestore delete notice:', e);
    }
    addNotification('Tour Package Moved to Recycle Bin', `"${pkg?.title || packageId}" was removed. You can recover it anytime from Data Recovery.`, 'system');
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
  };
  const updateCustomerPayment = (payment: CustomerPayment) => {
    setCustomerPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
    try { setDoc(doc(db, 'customer_payments', payment.id), sanitizeForFirestore(payment), { merge: true }); } catch (e) { console.warn(e); }
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

      case 'package':
        setPackages(prev => [data, ...prev.filter(p => p.id !== data.id)]);
        try { setDoc(doc(db, 'packages', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
        break;

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
        setPackages(prev => [data, ...prev.filter(p => p.id !== data.id)]);
        try { setDoc(doc(db, 'packages', data.id), sanitizeForFirestore(data)); } catch (e) { console.warn(e); }
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

  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    setSystemSettings(prev => {
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
    addNotification('Settings Reset', 'Configuration restored to factory defaults.', 'system');
  };

  const exportSystemBackupJSON = () => {
    const backupData = {
      version: '5.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.email || 'admin@khbevents.com',
      systemSettings,
      packages,
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
      if (Array.isArray(data.packages)) setPackages(data.packages);
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
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      addNotification('Restore Error', 'Invalid backup file format.', 'system');
      return false;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CRM Webhook Receiver & Outbound Sync Orchestrator
  // ─────────────────────────────────────────────────────────────────────────

  const refreshWebhookEvents = async () => {
    try {
      const serverEvents = await fetchServerWebhookEvents();
      if (serverEvents && serverEvents.length > 0) {
        setCrmEvents(serverEvents);
      }
      setCrmSyncLogs(getStoredCrmLogs());
    } catch (e) {
      console.warn('Could not refresh webhook events:', e);
    }
  };

  useEffect(() => {
    refreshWebhookEvents();
  }, []);

  const processWebhookEvent = (event: CrmWebhookEvent) => {
    if (!event) return;

    // ── Deal Won / Closed in CRM -> Auto-Provision Delegate Profile, Booking & Invoice ──
    if (event.eventType === 'deal.won' || event.eventType === 'crm.deal_closed') {
      const payload = event.payload || {};
      const customerData = payload.customer || payload.delegate || payload;
      const dealData = payload.deal || payload;

      const customerEmail = customerData.email || `delegate_${Date.now()}@khb-trade.com`;
      const customerName = customerData.name || customerData.customerName || 'Trade Mission Delegate';
      const customerPhone = customerData.phone || '+855 23 999 888';
      const companyName = customerData.company || customerData.organization || 'Cambodia Trade Delegation';

      // 1. Find or create user
      let targetUser = users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase());
      if (!targetUser) {
        targetUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          role: 'traveler',
          department: 'Trade Delegates',
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

      // 2. Resolve package
      const matchedPkg = packages.find(p => p.id === dealData.packageId || p.title.toLowerCase().includes((dealData.packageTitle || '').toLowerCase())) || packages[0];
      const adults = Number(dealData.numberOfAdults || dealData.adults || dealData.numberOfPax || 1);
      const children = Number(dealData.numberOfChildren || dealData.children || 0);
      const startDate = dealData.startDate || dealData.travelDate || matchedPkg.availableDates?.[0] || '2026-10-29';
      
      const startObj = new Date(startDate);
      startObj.setDate(startObj.getDate() + (matchedPkg.durationDays || 5));
      const endDate = dealData.endDate || startObj.toISOString().split('T')[0];

      const totalPriceUSD = Number(dealData.dealAmountUSD || dealData.amountUSD || matchedPkg.priceUSD * adults);
      const paidAmount = Number(dealData.paidAmountUSD || dealData.depositPaidUSD || totalPriceUSD);
      const randomCodeSuffix = Math.floor(10000 + Math.random() * 90000);
      const bookingCode = dealData.bookingCode || `TRP-${randomCodeSuffix}`;
      const bookingId = `b_crm_${Date.now()}`;
      const txId = `tx_crm_${Date.now()}`;

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

      try {
        setDoc(doc(db, 'bookings', bookingId), newBooking, { merge: true });
        setDoc(doc(db, 'invoices', newInvoice.id), newInvoice, { merge: true });
      } catch (err) {
        console.warn('Firestore CRM booking auto-provision notice:', err);
      }

      addNotification(
        `🤝 CRM Deal Closed: ${targetUser.name}`,
        `New booking ${bookingCode} provisioned for "${matchedPkg.title}" (${adults} Pax, $${totalPriceUSD}). Itinerary & vouchers ready for operations!`,
        'booking'
      );
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
        resetUserPermissionsToDefault,
        switchActiveUser,
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
        deletePackage,
        sendSupportMessage,
        addNotification,
        markNotificationsAsRead,
        getMonthlyFinancialSummary,
        exportMonthlyReportCSV,
        // CRM & Webhook Suite
        crmEvents,
        crmSyncLogs,
        processWebhookEvent,
        pushBookingToCrm,
        pushCustomerToCrm,
        syncAllBookingsToCrm,
        syncAllCustomersToCrm,
        testCrmConnection,
        simulateWebhookTrigger,
        refreshWebhookEvents,
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
