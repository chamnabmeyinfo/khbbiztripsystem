# 📱 App Views

← [[Home]]

## How Views Work
The app implements a flexible view-state router managed by `activeView` in [[AppContext]].

```typescript
type ActiveView = 'marketing' | 'customer_portal' | 'admin_dashboard' | 'package_sales_page';
```

---

## 1. Marketing View (`LandingPage`)
**Who:** Public consumers & prospective corporate delegates (no login required)  
**Components:**
- `HeroSection` — Dynamic full-screen hero slideshow auto-cycling through featured images of all active tour packages (`class="absolute inset-0 z-0"`), with smooth crossfade, zoom animations, interactive slide indicators, previous/next controls, quick package navigation pills, and multi-parameter search
- `TrendingDeals` — Curated trade missions & luxury tour package cards with dynamic pricing and departure indicators
- `InteractiveMap` — Interactive visual coordinate map with clickable mission destinations
- `Testimonials` — Authentic enterprise traveler and trade delegation feedback reviews
- `FAQ Accordion` — Automated tax invoicing, luggage policies, refund terms, and offline PWA questions

---

## 2. Package Sales Landing Page (`PackageSalesLandingPage`)
**Who:** B2B Trade Delegates, Canton Fair Participants, and Business Mission Attendees  
**Key Features:**
- **Image Feature Gallery**: Large high-res hero image carousel with verified delegate tags.
- **Delegate Registration Fee & Booking Card**: Directly positioned below image gallery with clear breakdown of flight, hotel, B2B pass, and VAT invoice inclusion.
- **Phase & Date Switcher**: Phase 1 / 2 / 3 selector with real-time seat availability indicators.
- **Dossier & Agenda Actions**: Direct button to download formatted mission PDF or view in-app preview modal (`AgendaPdfModal`).
- **Interactive Itinerary & Matchmaking Agenda**: Day-by-day business timeline with translators and VIP networking dinners.

---

## 3. Customer Portal (`CustomerDashboard`)
**Who:** Logged-in travelers & registered trade delegates  
**Features:**
- View personal bookings and mission registrations.
- Live booking status tracking (`pending`, `confirmed`, `completed`, `cancelled`).
- Instant voucher modal (`VoucherModal`) with QR code verification and guide contact.
- VAT invoice viewer and statutory tax invoice PDF download (`InvoiceModal`).
- Self-service travel departure date modification (`ModifyDatesModal`).
- Real-time offline cache access for flight gates, hotel vouchers, and emergency hotlines.

---

## 4. Admin Back-Office ERP (`AdminDashboard`)
**Who:** Authorized staff with RBAC clearances (`@khbmedia.asia`, `@khbevents.com`, or designated Admin accounts)  
**Modules & Sub-Sections (14 Dedicated ERP Tabs):**
1. **Overview (`OverviewSection`)**: Executive KPIs, total revenue, tax collected, active pax, and recent bookings table.
2. **Profit & Loss (`ProfitLossSection`)**: Gross margin %, net profit, per-package P&L breakdown, and expense deductions.
3. **Cash Flow (`CashFlowSection`)**: Real-time inflows vs outflows ledger, burn rate, and running liquidity balances.
4. **Invoices (`InvoicesSection`)**: Full statutory VAT invoices, settlement status, and tax reporting.
5. **Packages (`PackageManagementSection`)**: Tour package catalogue with 4 Interactive View Modes (Card Grid, Detailed List, Compact Table, Kanban Pipeline Board), package status lifecycle (`active`, `draft`, `archived`, `deleted`), Clone-as-Draft, and full multi-day itinerary designer.
6. **Bookings (`BookingsSection`)**: Global bookings table, status updates, traveler details, and flight/hotel assignments.
7. **Costing & Pricing (`CostingSection`)**: Unit economics engine, supplier rate cards, pax tier calculations, and margin safety margins.
8. **Suppliers (`SuppliersSection`)**: Directory of airlines, hotels, transport operators, interpreters, and contracts.
9. **Purchase Orders (`PurchaseOrdersSection`)**: Procurement PO lifecycle, supplier orders, and payment approvals.
10. **Payments (`PaymentsSection`)**: Multi-channel customer receipts reconciliation (ABA, ACLEDA, Cards) and supplier payouts.
11. **Expenses (`ExpensesSection`)**: Operational trip expenses, receipts, budget category tags, and reimbursement status.
12. **Recycle Bin (`RecycleBinSection`)**: 100% loss-free audit log and instant one-click data restoration.
13. **User Management & RBAC (`UserManagementSection`)**: Role assignment, departmental access clearance, and security status.
14. **AI Copilot (`AiCopilotSection`) & Settings (`SettingsSection`)**: System settings, payment gateways, tax rates, and AI business intelligence.

---

## Related Notes
- [[Components Map]]
- [[Modals]]
- [[Authentication]]
- [[AppContext]]

