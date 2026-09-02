# 📦 Data Models & TypeScript Interfaces

← [[Home]] | File: `src/types.ts`

## Core Types & Enums

```typescript
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'operations_manager'
  | 'procurement_officer'
  | 'finance_officer'
  | 'support_agent'
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

export type LanguageCode = 'en' | 'ar' | 'he' | 'es' | 'ja' | 'km';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'ILS';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type TourPackageStatus = 'active' | 'draft' | 'archived' | 'deleted';
export type PackageViewMode = 'grid' | 'detailed-list' | 'table' | 'kanban';
```

---

## User & RBAC Model

```typescript
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
  preferredLanguage: LanguageCode;
  preferredCurrency: CurrencyCode;
  hasBiometrics?: boolean;
  biometricCredentialId?: string;
  avatarUrl?: string;
}
```

---

## Tour Package & Trade Mission

```typescript
export interface TourPackage {
  id: string;
  status?: TourPackageStatus; // 'active' | 'draft' | 'archived' | 'deleted' (defaults to 'active')
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
  coordinates: { lat: number; lng: number; mapX: number; mapY: number };
  images: string[];
  priceUSD: number;
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
  availableDates: string[];
  tags: ('trending' | 'popular' | 'luxury' | 'adventure' | 'cultural' | 'eco')[];
  rating: number;
  reviewCount: number;
  bookedThisMonth: number;
  emergencyContact: EmergencyContact;
  flightIncluded: boolean;
  hotelStars: number;
  // B2B & Mission Extensions
  tourGuide?: TourGuide;
  optionalPrograms?: OptionalTourProgram[];
  isCantonFair?: boolean;
  cantonFairPhase?: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'All Phases' | 'Multi-Phase';
  featuredVideoUrl?: string;
  videos?: TourVideo[];
  // Persistence & Data Integrity Metadata
  createdAt?: string; // ISO 8601 creation timestamp
  updatedAt?: string; // ISO 8601 last update timestamp
  version?: number; // Monotonically increasing version counter for smart conflict resolution
}

export interface TourVideo {
  id: string;
  title: string;
  titleKm?: string;
  titleEn?: string;
  url: string; // YouTube, Vimeo, direct MP4/WebM URL
  thumbnailUrl?: string;
  duration?: string; // e.g. "03:45"
  isFeatured?: boolean;
}
```

---

## Suppliers, Costing & Procurement (ERP)

```typescript
export interface Supplier {
  id: string;
  name: string;
  category: 'airline' | 'hotel' | 'coach_transport' | 'interpreter_guide' | 'catering' | 'visa_service' | 'venue_expo' | 'insurance';
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  currency: string;
  bankDetails?: { bankName: string; accountNumber: string; swiftCode: string };
  rating: number;
  contractStatus: 'active' | 'pending_renewal' | 'inactive';
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-2026-0891
  supplierId: string;
  supplierName: string;
  packageId?: string;
  bookingId?: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: { description: string; quantity: number; unitPriceUSD: number; totalUSD: number }[];
  subtotalUSD: number;
  taxUSD: number;
  totalAmountUSD: number;
  status: 'draft' | 'submitted' | 'approved' | 'partially_paid' | 'paid' | 'cancelled';
  paidAmountUSD: number;
}
```

---

## Financial Accounting & Data Recovery

```typescript
export interface Expense {
  id: string;
  expenseNumber: string; // e.g. EXP-2026-0312
  date: string;
  category: 'logistics' | 'meals_entertainment' | 'marketing' | 'emergency' | 'office' | 'permits_visas' | 'other';
  description: string;
  amountUSD: number;
  paidByUserId?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receiptUrl?: string;
}

export interface DeletedItemRecord {
  id: string;
  originalId: string;
  entityType: 'supplier' | 'package' | 'booking' | 'cost_template' | 'purchase_order' | 'customer_payment' | 'supplier_payment' | 'expense' | 'invoice';
  title: string;
  subtitle?: string;
  deletedAt: string;
  deletedBy?: string;
  data: any; // Full snapshot for 100% loss-free restoration
}

export interface SystemSettings {
  taxRatePercent: number; // 7.5%
  enableAiCopilot: boolean;
  enableCustomerBooking: boolean;
  paymentGateways: {
    cards: boolean;
    abaPayWay: boolean;
    acledaXPay: boolean;
    wingBank: boolean;
    applePay: boolean;
    googlePay: boolean;
    biometricWallet: boolean;
  };
  companyName: string;
  leadCoordinatorName: string;
  leadCoordinatorPhone: string;
  leadCoordinatorTelegram: string;

  // Language & Internationalization Controls
  defaultLanguage?: LanguageCode;
  enabledLanguages?: LanguageCode[];
  autoDetectBrowserLanguage?: boolean;
  enableAiAutoTranslation?: boolean;
  showLanguageSwitcher?: boolean;

  // Multi-AI Translation Provider & Engine Suite
  aiTranslationConfig?: AiTranslationProviderConfig;
  crmConfig?: CrmConfig;
}

export type AiTranslationProvider =
  | 'gemini'
  | 'openai'
  | 'deepseek'
  | 'anthropic'
  | 'groq'
  | 'custom_openai'
  | 'offline_heuristic';

export interface AiTranslationProviderConfig {
  provider: AiTranslationProvider;
  modelName?: string;
  apiKey?: string;
  customBaseUrl?: string;
  temperature?: number;
  fallbackToGemini?: boolean;
}
```

---

## Related Notes
- [[AppContext]]
- [[Components Map]]
- [[Security Rules]]

interface FlightStatus {
  flightNumber: string
  airline: string
  departureTime / arrivalTime: string
  departureAirport / arrivalAirport: string
  status: 'Scheduled'|'On Time'|'Delayed'|'Gate Changed'|'Boarding'|'Departed'
  gate?: string
  terminal?: string
}
```

## HotelStatus
```typescript
interface HotelStatus {
  hotelName: string
  checkInDate / checkOutDate: string
  roomType: string
  confirmationCode: string
  status: 'Confirmed'|'Room Ready'|'Checked In'|'Completed'
  address: string
}
```

## SupportChat / SupportMessage
```typescript
interface SupportMessage {
  id: string
  senderId: string
  senderRole: UserRole | 'system' | 'ai'
  senderName: string
  text: string
  timestamp: string
}

interface SupportChat {
  id: string
  userId: string
  subject: string
  status: 'open'|'in_progress'|'resolved'
  messages: SupportMessage[]
  updatedAt: string
}
```

## PushNotification
```typescript
interface PushNotification {
  id: string
  userId?: string
  title: string
  message: string
  type: 'flight'|'hotel'|'booking'|'system'|'chat'
  timestamp: string
  read: boolean
  actionUrl?: string
}
```

## MonthlyFinancialSummary
```typescript
interface MonthlyFinancialSummary {
  month: string
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  grossRevenueUSD: number
  taxRatePercent: number      // 0.075
  taxCollectedUSD: number
  refundsUSD: number
  netRevenueUSD: number
  destinationBreakdown?: { destination, bookingsCount, revenueUSD }[]
}
```

## Real-Time Auto-Save & Cloud Synchronization State
```typescript
export type AutoSyncStatus = 'saving' | 'synced' | 'offline' | 'error';

export interface AutoSyncState {
  status: AutoSyncStatus;
  lastSavedAt: string | null;
  pendingOperations: number;
  message?: string;
}
```

## SystemSettings & Feature Flags
```typescript
export interface SystemSettings {
  enableExploreCuratedTours?: boolean; // Controls front-end Home Page "Explore Curated Tours" section visibility
  enableAiCopilot: boolean;
  enableCustomerBooking: boolean;
  enableEarlyBirdDiscount: boolean;
  enableTaxInvoicing: boolean;
  enableSupportChat: boolean;
  enableDataRecovery: boolean;
  enableOfflineCache: boolean;
  enablePushNotifications: boolean;
  paymentGateways: {
    cards: boolean;
    abaPayWay: boolean;
    acledaXPay: boolean;
    wingBank: boolean;
    applePay: boolean;
    googlePay: boolean;
    biometricWallet: boolean;
  };
  taxRatePercent: number;
  companyName: string;
  taxVatNumber: string;
  leadCoordinatorName: string;
  companyAddress: string;
  // ... Theme presets, typography, and CRM configs
}
```

## Package Localization Engine & Strict Bilingual Resolution
All packages support deep bilingual structures (`*Km` and `*En` paired fields). The helper `getLocalizedPackage(pkg, language)` guarantees:
- Complete transformation of root package strings (`title`, `destination`, `description`, `highlights`, `whoShouldJoin`, `whyShouldJoin`, `inclusions`, `exclusions`, `termsAndConditions`).
- Day-by-day `itinerary` translations (`title`, `description`, `hotelName`, `mealsIncluded`, `assemblyPoint`, and `guideAgenda`).
- Optional add-on program localization (`title`, `description`, `recommendedAudience`, `meetingPoint`).
- Dedicated Tour Guide profiles (`name`, `title`, `bio`, `briefingMeetingPoint`, `briefingTime`).
- Zero-leak regex filtering (`/[\u1780-\u17FF]/`) and fallback domain dictionaries preventing untranslated Khmer text from appearing in English (`EN`) mode.

## Related Notes
- [[Firebase and Firestore]]
- [[Mock Data]]

