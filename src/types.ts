export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'operations_manager'
  | 'procurement_officer'
  | 'finance_officer'
  | 'support_agent'
  | 'general_staff'
  | 'traveler';

export type UserStatus = 'active' | 'suspended' | 'invited' | 'inactive';

export type Department =
  | 'Executive Leadership'
  | 'Trip Operations'
  | 'Procurement & Sourcing'
  | 'Finance & Accounting'
  | 'Customer Experience'
  | 'Trade Delegates'
  | 'General Staff';

export type PermissionKey =
  | 'users_view'
  | 'users_manage'
  | 'packages_view'
  | 'packages_manage'
  | 'bookings_view'
  | 'bookings_manage'
  | 'costing_view'
  | 'costing_manage'
  | 'suppliers_view'
  | 'suppliers_manage'
  | 'purchase_orders_view'
  | 'purchase_orders_manage'
  | 'finances_view'
  | 'finances_manage'
  | 'expenses_approve'
  | 'support_manage'
  | 'system_settings_manage'
  | 'ai_copilot_access'
  | 'audit_logs_view'
  | 'crm_leads_view'
  | 'crm_leads_manage';

export type LanguageCode = 'en' | 'km' | 'ar' | 'he' | 'es' | 'ja' | 'zh' | 'vi' | 'th' | 'fr' | 'ko' | 'de';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'ILS';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: UserStatus;
  department?: Department;
  jobTitle?: string;
  customPermissions?: PermissionKey[];
  customAccessibleTabs?: string[];
  preferredLanguage: LanguageCode;
  preferredCurrency: CurrencyCode;
  hasBiometrics?: boolean;
  biometricCredentialId?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface UserAuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  severity: 'info' | 'warning' | 'security';
}

export interface GuideScheduleSlot {
  time: string; // e.g. "08:30 AM"
  activity: string;
  activityKm?: string;
  activityEn?: string;
  location?: string;
  locationKm?: string;
  locationEn?: string;
  type?: 'gathering' | 'exhibition' | 'b2b_meeting' | 'networking_lunch' | 'site_visit' | 'free_time' | 'briefing';
  notes?: string;
  notesKm?: string;
  notesEn?: string;
}

export interface TourGuide {
  name: string;
  nameKm?: string;
  nameEn?: string;
  title: string;
  titleKm?: string;
  titleEn?: string;
  phone: string;
  telegram?: string;
  languages: string[];
  photoUrl?: string;
  badgeNumber?: string;
  emergencyContact?: string;
  bio?: string;
  bioKm?: string;
  bioEn?: string;
  briefingMeetingPoint?: string;
  briefingMeetingPointKm?: string;
  briefingMeetingPointEn?: string;
  briefingTime?: string;
  briefingTimeKm?: string;
  briefingTimeEn?: string;
}

export interface OptionalTourProgram {
  id: string;
  title: string;
  titleKm?: string;
  titleEn?: string;
  description: string;
  descriptionKm?: string;
  descriptionEn?: string;
  additionalCostUSD: number;
  durationHours: number;
  recommendedAudience?: string;
  recommendedAudienceKm?: string;
  recommendedAudienceEn?: string;
  highlights: string[];
  highlightsKm?: string[];
  highlightsEn?: string[];
  includesGuide: boolean;
  includedMeals?: string[];
  includedMealsKm?: string[];
  includedMealsEn?: string[];
  meetingPoint?: string;
  meetingPointKm?: string;
  meetingPointEn?: string;
}

export interface ItineraryStep {
  day: number;
  title: string;
  titleKm?: string;
  titleEn?: string;
  description: string;
  descriptionKm?: string;
  descriptionEn?: string;
  mealsIncluded?: string[];
  mealsIncludedKm?: string[];
  mealsIncludedEn?: string[];
  activityType?: string;
  hotelName?: string;
  hotelNameKm?: string;
  hotelNameEn?: string;
  guideAgenda?: GuideScheduleSlot[];
  dayHighlights?: string[];
  dayHighlightsKm?: string[];
  dayHighlightsEn?: string[];
  assemblyTime?: string;
  assemblyPoint?: string;
  assemblyPointKm?: string;
  assemblyPointEn?: string;
}

export interface EmergencyContact {
  country: string;
  police: string;
  ambulance: string;
  touristHelpline: string;
  embassySupport: string;
}

export interface TourPackage {
  id: string;
  title: string;
  titleKm?: string;
  titleEn?: string;
  description: string;
  descriptionKm?: string;
  descriptionEn?: string;
  destination: string;
  destinationKm?: string;
  destinationEn?: string;
  country: string;
  countryKm?: string;
  countryEn?: string;
  category?: string;
  categoryKm?: string;
  categoryEn?: string;
  coordinates: {
    lat: number;
    lng: number;
    mapX: number; // 0-100% on schematic map
    mapY: number; // 0-100% on schematic map
  };
  images: string[];
  priceUSD: number; // Base currency
  discountPriceUSD?: number;
  durationDays: number;
  durationNights: number;
  itinerary: ItineraryStep[];
  highlights: string[];
  highlightsKm?: string[];
  highlightsEn?: string[];
  whoShouldJoin?: string[];
  whoShouldJoinKm?: string[];
  whoShouldJoinEn?: string[];
  whyShouldJoin?: string[];
  whyShouldJoinKm?: string[];
  whyShouldJoinEn?: string[];
  inclusions: string[];
  inclusionsKm?: string[];
  inclusionsEn?: string[];
  exclusions: string[];
  exclusionsKm?: string[];
  exclusionsEn?: string[];
  termsAndConditions?: string[];
  termsAndConditionsKm?: string[];
  termsAndConditionsEn?: string[];
  availableDates: string[]; // ISO date strings (e.g. '2026-09-10')
  tags: ('trending' | 'popular' | 'luxury' | 'adventure' | 'cultural' | 'eco')[];
  rating: number;
  reviewCount: number;
  bookedThisMonth: number;
  emergencyContact: EmergencyContact;
  flightIncluded: boolean;
  hotelStars: number;
  tourGuide?: TourGuide;
  optionalPrograms?: OptionalTourProgram[];
  isCantonFair?: boolean;
  cantonFairPhase?: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'All Phases' | 'Multi-Phase';
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface FlightStatus {
  flightNumber: string;
  airline: string;
  departureTime: string;
  departureAirport: string;
  arrivalTime: string;
  arrivalAirport: string;
  status: 'Scheduled' | 'On Time' | 'Delayed' | 'Gate Changed' | 'Boarding' | 'Departed';
  gate?: string;
  terminal?: string;
}

export interface HotelStatus {
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  confirmationCode: string;
  status: 'Confirmed' | 'Room Ready' | 'Checked In' | 'Completed';
  address: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. TRP-84920
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  packageId: string;
  packageTitle: string;
  packageDestination: string;
  packageImage: string;
  startDate: string;
  endDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  specialRequests?: string;
  status: BookingStatus;
  basePriceUSD: number;
  taxAmountUSD: number;
  totalPriceUSD: number;
  paidAmount: number;
  paidCurrency: CurrencyCode;
  exchangeRateUsed: number;
  createdAt: string;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'biometric_wallet' | 'aba_payway' | 'acleda_xpay' | 'wing_bank' | 'bank_wire';
  paymentTransactionId: string;
  flightStatus?: FlightStatus;
  hotelStatus?: HotelStatus;
  selectedOptionalProgramIds?: string[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: CurrencyCode;
  amountUSD: number;
  paymentMethod: string;
  status: 'paid' | 'failed' | 'refunded';
  gatewayTransactionId: string;
  cardLast4?: string;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceUSD: number;
  totalUSD: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0042
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotalUSD: number;
  taxRatePercent: number; // e.g. 7.5% VAT/Tourism tax
  taxAmountUSD: number;
  totalUSD: number;
  paidCurrency: CurrencyCode;
  totalPaidInCurrency: number;
  paymentStatus: 'paid' | 'refunded' | 'pending';
  gatewayTxId: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userCountry: string;
  packageId: string;
  packageTitle: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBooking: boolean;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: UserRole | 'system' | 'ai';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  messages: SupportMessage[];
  updatedAt: string;
}

export type NotificationCategory =
  | 'flight'
  | 'hotel'
  | 'booking'
  | 'system'
  | 'chat'
  | 'lead_won'
  | 'crm'
  | 'finance'
  | 'supplier'
  | 'expense'
  | 'task';

export interface PushNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationCategory;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  targetView?: 'marketing' | 'customer_portal' | 'admin_dashboard' | 'package_sales_page';
  targetTab?: string;
  targetEntityId?: string;
  metadata?: Record<string, any>;
}

export interface MonthlyFinancialSummary {
  month: string; // e.g. 'August 2026' or '2026-08'
  monthName: string; // e.g. 'August 2026'
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  grossRevenueUSD: number;
  taxRatePercent: number; // 0.075 (7.5%)
  taxCollectedUSD: number;
  taxesCollectedUSD: number;
  refundsUSD: number;
  netRevenueUSD: number;
  destinationBreakdown?: {
    destination: string;
    bookingsCount: number;
    revenueUSD: number;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ERP: A-to-Z Trip Business Management
// ─────────────────────────────────────────────────────────────────────────────

// ─── Supplier Management ─────────────────────────────────────────────────────

export type SupplierType = 'hotel' | 'airline' | 'transport' | 'guide' | 'restaurant' | 'activity' | 'insurance';
export type SupplierStatus = 'active' | 'inactive' | 'blacklisted';
export type PaymentTerms = 'prepaid' | 'net_15' | 'net_30' | 'net_45' | 'net_60';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  country: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  paymentTerms: PaymentTerms;
  defaultCurrency: CurrencyCode;
  rating: number; // 1–5
  status: SupplierStatus;
  totalPOsUSD: number; // lifetime spend
  notes?: string;
  createdAt: string;
}

// ─── Trip Costing ─────────────────────────────────────────────────────────────

export type CostCategory = 'hotel' | 'flight' | 'transport' | 'guide' | 'meals' | 'entrance_fee' | 'permit' | 'insurance' | 'misc';
export type CostType = 'per_adult' | 'per_child' | 'fixed';

export interface CostItem {
  id: string;
  supplierId?: string;
  supplierName?: string;
  category: CostCategory;
  description: string;
  costType: CostType;
  unitCostUSD: number;
  quantity: number; // nights for hotel, seat count for flights, etc.
  totalUSD: number; // unitCostUSD × quantity
}

export interface CostTemplate {
  id: string;
  packageId: string;
  packageTitle: string;
  minGroupSize: number;
  adultMarginPercent: number;
  childDiscountPercent: number; // child price = adult price × (1 - childDiscountPercent/100)
  items: CostItem[];
  // Computed totals
  totalCostPerAdultUSD: number;
  totalCostPerChildUSD: number;
  totalFixedCostUSD: number;
  fixedCostPerPaxUSD: number; // totalFixedCostUSD / minGroupSize
  recommendedPriceAdultUSD: number;
  recommendedPriceChildUSD: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export type POStatus = 'draft' | 'sent' | 'confirmed' | 'amended' | 'cancelled' | 'paid';

export interface POLineItem {
  id?: string;
  description: string;
  category: CostCategory;
  quantity: number;
  unitCostUSD: number;
  totalUSD: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-2026-0001
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  bookingId?: string;
  bookingCode?: string;
  packageTitle?: string;
  items: POLineItem[];
  subtotalUSD: number;
  taxPercent: number;
  taxUSD: number;
  totalUSD: number;
  currency: CurrencyCode;
  totalInCurrency: number;
  status: POStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type CustomerPaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';
export type SupplierPaymentStatus = 'scheduled' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type CustomerPaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'apple_pay' | 'google_pay' | 'biometric_wallet' | 'aba_payway' | 'acleda_xpay' | 'wing_bank' | 'bank_wire';

export interface CustomerPayment {
  id: string;
  bookingId: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountUSD: number;
  amountInCurrency: number;
  currency: CurrencyCode;
  exchangeRate: number;
  installmentNumber: number;
  totalInstallments: number;
  status: CustomerPaymentStatus;
  paymentMethod: CustomerPaymentMethod;
  transactionId: string;
  receivedDate: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  bookingId?: string;
  bookingCode?: string;
  amountUSD: number;
  amountInCurrency: number;
  currency: CurrencyCode;
  status: SupplierPaymentStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'bank_transfer' | 'card' | 'cash' | 'crypto';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type ExpenseCategory = 'accommodation' | 'transport' | 'meals' | 'guide' | 'entrance_fee' | 'permit' | 'insurance' | 'marketing' | 'staff' | 'misc';
export type ExpenseStatus = 'pending_approval' | 'approved' | 'rejected' | 'reimbursed';

export interface Expense {
  id: string;
  bookingId?: string;
  bookingCode?: string;
  packageId?: string;
  packageTitle?: string;
  category: ExpenseCategory;
  description: string;
  amountUSD: number;
  receiptUrl?: string;
  submittedBy: string;
  submittedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  status: ExpenseStatus;
  expenseDate: string;
  createdAt: string;
}

// ─── Profit & Loss ────────────────────────────────────────────────────────────

export interface CostBreakdown {
  hotel: number;
  flight: number;
  transport: number;
  guide: number;
  meals: number;
  permits: number;
  insurance: number;
  misc: number;
}

export interface TripProfitReport {
  id: string;
  bookingId: string;
  bookingCode: string;
  packageId: string;
  packageTitle: string;
  destination: string;
  travelStartDate: string;
  paxAdults: number;
  paxChildren: number;
  totalPax: number;
  // Revenue
  totalRevenueUSD: number;
  receivedRevenueUSD: number;
  outstandingReceivableUSD: number;
  // Costs
  estimatedCostUSD: number;
  actualCostUSD: number;
  supplierPaymentsMadeUSD: number;
  outstandingPayableUSD: number;
  adHocExpensesUSD: number;
  // P&L
  grossProfitUSD: number;
  netProfitUSD: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  costBreakdown: CostBreakdown;
  generatedAt: string;
}

// ─── Cash Flow ────────────────────────────────────────────────────────────────

export type CashFlowType = 'inflow' | 'outflow';
export type CashFlowCategory = 'customer_payment' | 'supplier_payment' | 'expense' | 'refund' | 'deposit' | 'other';

export interface CashFlowEntry {
  id: string;
  date: string;
  type: CashFlowType;
  category: CashFlowCategory;
  description: string;
  amountUSD: number;
  referenceId?: string;
  referenceCode?: string;
  runningBalanceUSD: number;
}

export interface CashFlowSummary {
  period: string; // e.g. '2026-08'
  totalInflowUSD: number;
  totalOutflowUSD: number;
  netCashFlowUSD: number;
  openingBalanceUSD: number;
  closingBalanceUSD: number;
  entries: CashFlowEntry[];
}

// ─── Recycle Bin & Data Recovery ──────────────────────────────────────────────

export type RecoverableEntityType =
  | 'supplier'
  | 'package'
  | 'booking'
  | 'cost_template'
  | 'purchase_order'
  | 'customer_payment'
  | 'supplier_payment'
  | 'expense'
  | 'invoice';

export interface DeletedItemRecord {
  id: string; // e.g. 'del_1723871234567'
  originalId: string;
  entityType: RecoverableEntityType;
  title: string; // User-facing name, e.g. "Tokyo Ryokan Group"
  subtitle?: string; // Secondary info, e.g. "Hotel • Tokyo, Japan" or "$4,500.00 USD"
  deletedAt: string; // ISO date string
  deletedBy?: string; // e.g. "admin@khbevents.com"
  data: any; // Complete snapshot of the original object for 100% loss-free restoration
}

// ─── System Settings & Feature Controls ───────────────────────────────────────

export interface SystemSettings {
  // Feature Toggles
  enableAiCopilot: boolean;
  enableCustomerBooking: boolean;
  enableEarlyBirdDiscount: boolean;
  enableTaxInvoicing: boolean;
  enableSupportChat: boolean;
  enableDataRecovery: boolean;
  enableOfflineCache: boolean;
  enablePushNotifications: boolean;

  // Payment Gateways
  paymentGateways: {
    cards: boolean;
    abaPayWay: boolean;
    acledaXPay: boolean;
    wingBank: boolean;
    applePay: boolean;
    googlePay: boolean;
    biometricWallet: boolean;
  };

  // Financial & Costing Defaults
  taxRatePercent: number;
  defaultAdultMarginPercent: number;
  defaultChildDiscountPercent: number;
  defaultMinGroupSize: number;
  autoPurgeTrashDays: number; // 0 = never

  // Official Trade Mission & Coordinator Profile
  companyName: string;
  companyTagline?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  companyBannerUrl?: string;
  tradeMissionTheme?: string;
  tradeMissionAccreditation?: string;
  
  // Government Statutory & Compliance
  companyRegistrationNumber?: string;
  tourismLicenseNumber?: string;
  taxVatNumber: string;

  // Lead Trade Mission Coordinator
  leadCoordinatorName: string;
  leadCoordinatorTitle?: string;
  leadCoordinatorBio?: string;
  leadCoordinatorAvatar?: string;
  leadCoordinatorPhone: string;
  leadCoordinatorTelegram: string;
  leadCoordinatorEmail: string;
  leadCoordinatorWeChat?: string;
  leadCoordinatorSignatureUrl?: string;

  // Headquarters & Emergency Helpline
  companyAddress: string;
  companyCityCountry?: string;
  companyPostalCode?: string;
  companyPhone?: string;
  companyEmail?: string;
  emergencyHotline?: string;
  delegationSupportDesk?: string;

  // Corporate Settlement Banking Rails
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankSwiftBic?: string;
  bankBranch?: string;

  // Social & Delegation Broadcasts
  telegramChannel?: string;
  facebookUrl?: string;
  linkedinUrl?: string;

  // UI Theme, Palette & Typography Scaling
  themePreset?: 'navy' | 'emerald' | 'crimson' | 'indigo' | 'amber' | 'cyan' | 'slate' | 'custom';
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontSizeScale?: 'compact' | 'normal' | 'comfortable' | 'large' | 'extra-large';
  fontFamilyLatin?: 'plus-jakarta' | 'inter' | 'outfit' | 'poppins' | 'playfair' | 'merriweather' | 'dm-sans' | 'jetbrains-mono' | 'system';
  fontFamilyKhmer?: 'kantumruy-pro' | 'hanuman' | 'battambang' | 'koulen' | 'siemreap';
  fontFamilyHeading?: 'inherit' | 'playfair' | 'cinzel' | 'outfit' | 'plus-jakarta' | 'poppins' | 'jetbrains-mono';
  headingFontWeight?: 'normal' | 'semibold' | 'bold' | 'black';
  fontLineHeight?: 'snug' | 'normal' | 'relaxed' | 'loose';
  fontLetterSpacing?: 'tight' | 'normal' | 'wide' | 'widest';
  fontSmoothing?: 'antialiased' | 'subpixel';
  fontBoldBoost?: boolean;
  
  // Advanced Typography & Layout Detail Adjustments
  textAlign?: 'left' | 'center' | 'justify';
  paragraphSpacing?: 'compact' | 'normal' | 'relaxed' | 'loose';
  contentPadding?: 'compact' | 'normal' | 'spacious' | 'generous';
  borderRadiusPreset?: 'none' | 'subtle' | 'rounded' | 'pill';
  headingTransform?: 'none' | 'uppercase' | 'capitalize';
  headingLetterSpacing?: 'tight' | 'normal' | 'wide' | 'widest';
  highContrastText?: boolean;
  cardBorderWidth?: 'none' | 'thin' | 'medium';
  textShadowPreset?: 'none' | 'subtle' | 'crisp';
  customPalette?: {
    themeName?: string;
    primary: string;
    primaryHover?: string;
    secondary: string;
    accent: string;
    accentGlow?: string;
    bgDark?: string;
    bgLight?: string;
    cardDark?: string;
    cardLight?: string;
    textContrast?: string;
    rationale?: string;
    detectedFrom?: string;
  };

  // Security
  restrictAdminDomain: boolean;
  allowedAdminDomain: string;
  enableBiometricAuth: boolean;

  // Language & Internationalization Controls
  defaultLanguage?: LanguageCode;
  enabledLanguages?: LanguageCode[];
  autoDetectBrowserLanguage?: boolean;
  enableAiAutoTranslation?: boolean;
  showLanguageSwitcher?: boolean;

  // CRM & Webhook Integration
  crmConfig?: CrmConfig;
}

export type ActiveView = 'marketing' | 'customer_portal' | 'admin_dashboard' | 'package_sales_page';

// ─────────────────────────────────────────────────────────────────────────────
// CRM & Webhook Integration Suite
// ─────────────────────────────────────────────────────────────────────────────

export interface CrmConfig {
  crmEndpointUrl: string; // e.g. "https://api.crm.example.com/v1"
  crmApiToken: string; // Bearer token or API key
  crmAuthType: 'bearer' | 'api_key' | 'custom_header';
  crmHeaderKey?: string; // e.g. "X-CRM-Token" or "Authorization"
  crmWebhookSecret: string; // Secret for validating inbound webhooks
  crmAutoSyncBookings: boolean; // Auto push booking creations/updates to CRM
  crmAutoSyncCustomers: boolean; // Auto push customer registrations/updates to CRM
  crmOrganizationId?: string;
  lastSyncAt?: string;
  syncStatus?: 'connected' | 'error' | 'idle';
}

export type CrmWebhookEventType =
  | 'lead.won'
  | 'deal.won'
  | 'crm.deal_closed'
  | 'trip.booking_confirmed'
  | 'trip.passenger_manifest_updated'
  | 'trip.payment_confirmed'
  | 'trip.task_progress_updated'
  | 'lead.progress_sync'
  | 'operation.cross_flow_update'
  | 'manifest.delegate_added'
  | 'finance.payment_settled'
  | 'logistics.status_synced'
  | 'lead.created'
  | 'booking.status_updated'
  | 'booking.payment_received'
  | 'booking.cancelled'
  | 'customer.vip_upgraded'
  | 'customer.profile_updated'
  | 'flight.status_changed'
  | 'notification.broadcast'
  | 'custom.event';

export interface CrmWebhookEvent {
  id: string;
  eventType: CrmWebhookEventType;
  timestamp: string;
  source: string;
  payload: any;
  status: 'processed' | 'ignored' | 'failed';
  message: string;
  affectedEntityId?: string;
}

export interface CrmSyncLog {
  id: string;
  timestamp: string;
  direction: 'outbound' | 'inbound';
  entityType: 'booking' | 'customer' | 'payment' | 'test' | 'webhook';
  entityId?: string;
  endpoint: string;
  status: 'success' | 'failed';
  statusCode: number;
  requestPayload?: any;
  responsePayload?: any;
  durationMs: number;
  errorMessage?: string;
}

export type LeadOperationalStage =
  | 'won_ingested'
  | 'manifest_pending'
  | 'logistics_confirmed'
  | 'finance_settled'
  | 'vouchers_dispatched'
  | 'trip_completed';

export type HandoverTaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type HandoverTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HandoverTaskCategory =
  | 'lead_intake'
  | 'manifest_passports'
  | 'visa_permits'
  | 'flights_logistics'
  | 'hotel_rooming'
  | 'finance_invoice'
  | 'briefing_materials'
  | 'crm_feedback';

export interface LeadHandoverTask {
  id: string;
  title: string;
  titleKm?: string;
  description?: string;
  category: HandoverTaskCategory;
  assignedTo?: string; // e.g. "Operations Desk", "Sophea Chamnab", "Visa Desk"
  assignedRole?: string;
  status: HandoverTaskStatus;
  priority: HandoverTaskPriority;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  isAutomatic?: boolean;
}

export interface LeadPassenger {
  id: string;
  name: string;
  jobTitle?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  dietaryRequirement?: string;
  roomType?: 'single' | 'twin_share' | 'deluxe_suite';
  badgeIssued?: boolean;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface InboundWonLead {
  id: string;
  crmLeadId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  assignedAgent: string;
  tripCategory: string; // e.g. "China Business Trip", "Vietnam Business Trip", "Canton Fair Phase 1"
  dealTitle?: string;
  dealValueUSD: number;
  commissionRate?: number;
  paxCount: number;
  departureDate: string;
  bookingCode: string;
  bookingId?: string;
  invoiceId?: string;
  packageId?: string;
  operationalStage: LeadOperationalStage;
  manifest: LeadPassenger[];
  handoverTasks?: LeadHandoverTask[];
  handoverStartedAt?: string;
  handoverCompletedAt?: string;
  handoverLeadOfficer?: string;
  paymentStatus: 'unpaid' | 'deposit_paid' | 'fully_paid';
  depositPaidUSD: number;
  crmSyncStatus: 'synced' | 'pending_sync' | 'error';
  lastSyncedAt?: string;
  notes?: string;
  specialRequests?: string;
  hotelStatus?: HotelStatus;
  flightStatus?: FlightStatus;
  lastTaskAction?: string;
  lastSyncedTaskTitle?: string;
  createdAt: string;
  updatedAt: string;
}

