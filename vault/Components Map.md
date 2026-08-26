# 🧩 Components Map

← [[Home]]

## Common Components (`src/components/common/`)

| Component | File | Purpose |
|---|---|---|
| `Header` | `Header.tsx` | Sticky top navigation bar, language/currency selectors with click-outside dismiss & mutual toggle, notifications bell, user profile identity widget on right side with live status dot & department badge, auth button |
| `Footer` | `Footer.tsx` | Enterprise site footer with corporate links and accreditation |
| `AuthModal` | `AuthModal.tsx` | Multi-method login/signup dialog (Google, Biometrics, Corporate Email, Demo Fast-Switch) |
| `CurrencyConverterModal` | `CurrencyConverterModal.tsx` | Real-time interactive multi-currency FX calculator |
| `AiFloatingCopilot` | `AiFloatingCopilot.tsx` | Ambient AI assistant for instant booking and itinerary advice |
| `ViewContextMenu` | `ViewContextMenu.tsx` | Context menu triggered by right-clicking navigation tabs or views to set/reset default landing screens |
| `GlobalToast` | `GlobalToast.tsx` | Non-blocking toast notification banner for user action feedback across views |

---

## Marketing Components (`src/components/marketing/`)

| Component | File | Purpose |
|---|---|---|
| `LandingPage` | `LandingPage.tsx` | Global consumer tour portal home layout with search filtering & FAQ |
| `PackageSalesLandingPage` | `PackageSalesLandingPage.tsx` | Dedicated B2B Trade Mission & Canton Fair landing page with hero gallery, registration fee card, phase selector, and delegate booking |
| `HeroSection` | `HeroSection.tsx` | High-conversion hero banner with multi-filter search widget |
| `TrendingDeals` | `TrendingDeals.tsx` | Featured mission packages grid with price tags & departure indicators |
| `InteractiveMap` | `InteractiveMap.tsx` | Dynamic SVG world destination radar with active route markers |
| `Testimonials` | `Testimonials.tsx` | Verified corporate and VIP delegate feedback testimonials |

---

## Customer Portal (`src/components/portal/`)

| Component | File | Purpose |
|---|---|---|
| `CustomerDashboard` | `CustomerDashboard.tsx` | Traveler portal displaying active bookings, live itinerary status, flight gates, and quick actions |
| `CheckoutModal` | `CheckoutModal.tsx` | Multi-step booking checkout with delegate details, optional upgrades, payment gateways (Cards, ABA PayWay, ACLEDA, Wing, Biometrics), and celebratory confetti |
| `PackageDetailModal` | `PackageDetailModal.tsx` | Full tour dossier, day-by-day agenda, inclusions/exclusions, guide profile, optional B2B programs, and PDF download |
| `AgendaPdfModal` | `AgendaPdfModal.tsx` | In-app high-fidelity PDF agenda & mission dossier visual previewer |
| `StandaloneAgendaView` | `StandaloneAgendaView.tsx` | Dedicated full-page print/export agenda view |
| `VoucherModal` | `VoucherModal.tsx` | Digital booking confirmation voucher with QR code, hotel address, and escort details |
| `InvoiceModal` | `InvoiceModal.tsx` | Formal VAT tax invoice with itemized pricing, tax breakdown, and PDF export |
| `ModifyDatesModal` | `ModifyDatesModal.tsx` | Self-service travel departure date rescheduling modal |
| `ProfileSettingsModal` | `ProfileSettingsModal.tsx` | Traveler profile settings, emergency contacts, language, currency, and WebAuthn biometrics |
| `SupportChatWidget` | `SupportChatWidget.tsx` | AI-powered 24/7 travel concierge & live human support chat widget |

---

## Admin ERP Components (`src/components/admin/`)

| Component | File | Purpose |
|---|---|---|
| `AdminDashboard` | `AdminDashboard.tsx` | Enterprise back-office workspace with sticky sidebar navigation, RBAC clearance filtering, and KPI summaries |
| `UserManagementSection` | `UserManagementSection.tsx` | Staff & traveler RBAC administration, role assignment, permissions, department filters |
| `PackageManagementSection` | `PackageManagementSection.tsx` | Tour package catalogue CRUD with 4 View Modes (Card Grid, Detailed List, Compact Table, Kanban Board), status lifecycle (Active, Draft, Archived, Recycle Bin), and Clone-as-Draft |
| `PackageEditorModal` | `PackageEditorModal.tsx` | Detailed modal editor for creating/updating multi-day tour packages, mission agendas, bilingual English/Khmer arrays, and draft saving |
| `BilingualListEditor` | `BilingualListEditor.tsx` | Reusable bilingual list editor component with tabs for Khmer/English, presets insertion, drag reordering, and item validation |
| `CostingSection` | `CostingSection.tsx` | Unit economics, supplier cost estimation, margin targets, and per-pax pricing calculations |
| `SuppliersSection` | `SuppliersSection.tsx` | Vendor database (airlines, hotels, coach operators, caterers, translators) and rate cards |
| `PurchaseOrdersSection` | `PurchaseOrdersSection.tsx` | Procurement PO generation, vendor order tracking, and approval workflows |
| `PaymentsSection` | `PaymentsSection.tsx` | Customer payment reconciliation (ABA, ACLEDA, Cards) and supplier disbursements |
| `ExpensesSection` | `ExpensesSection.tsx` | Operational trip expense claims, receipt attachments, and cost center categorizations |
| `ProfitLossSection` | `ProfitLossSection.tsx` | Real-time gross & net profit analysis, margin graphs, and package-by-package P&L breakdown |
| `CashFlowSection` | `CashFlowSection.tsx` | Cash inflows vs outflows ledger, monthly burn rate, and liquidity summaries |
| `RecycleBinSection` | `RecycleBinSection.tsx` | 100% loss-free audit log & trash recovery for deleted bookings, packages, POs, and expenses |
| `AiCopilotSection` | `AiCopilotSection.tsx` | AI operations advisor for revenue optimization, itinerary planning, and supplier analytics |
| `SettingsSection` | `SettingsSection.tsx` | System configurations, payment gateway toggles, VAT rates, branding, and security policies |

---

## Component Hierarchy

```
App.tsx
├── AppProvider (Context & Firestore Synchronizer)
└── MainLayout
    ├── Header (Sticky Top-0)
    ├── main (Dynamic View Switching via activeView)
    │   ├── LandingPage (activeView === 'marketing')
    │   │   ├── HeroSection
    │   │   ├── TrendingDeals
    │   │   ├── InteractiveMap
    │   │   └── Testimonials
    │   ├── PackageSalesLandingPage (activeView === 'package_sales_page')
    │   │   ├── Image Gallery + Delegate Registration Fee Card
    │   │   ├── Phase Switcher & Highlights
    │   │   └── Inclusions & Booking Trigger
    │   ├── CustomerDashboard (activeView === 'customer_portal')
    │   └── AdminDashboard (activeView === 'admin_dashboard')
    │       ├── Sticky Sidebar Aside (RBAC Filtered)
    │       └── 13 Sub-Section Modules (Overview, P&L, Users, Costing, etc.)
    ├── [Global Modals]
    │   ├── AuthModal
    │   ├── CurrencyConverterModal
    │   ├── PackageDetailModal
    │   ├── PackageEditorModal
    │   ├── AgendaPdfModal
    │   ├── CheckoutModal
    │   ├── VoucherModal
    │   ├── InvoiceModal
    │   ├── ModifyDatesModal
    │   └── ProfileSettingsModal
    ├── AiFloatingCopilot / SupportChatWidget
    └── Footer
```

## Related Notes
- [[App Views]]
- [[Modals]]
- [[Data Models]]
- [[Authentication]]

