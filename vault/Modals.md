# 🪟 Modals & Dialog System

← [[Home]]

All modals are globally managed in `App.tsx` and controlled via `activeModal` state in [[AppContext]].

To open a modal: `setActiveModal('modal_name')`  
To close a modal: `setActiveModal(null)`

---

## Global Modal Inventory

### 1. `AuthModal`
**Trigger:** Click login / sign-in button in Header, hero section, or checkout barrier  
**Purpose:** Multi-method login dialog: Google SSO, WebAuthn biometrics, corporate email, and 1-click role switcher  
**File:** `src/components/common/AuthModal.tsx`

---

### 2. `PackageDetailModal`
**Trigger:** Click any tour package card across marketing or customer portal  
**Purpose:** Full interactive dossier — daily itinerary timeline, inclusions/exclusions, tour director profile, optional B2B programs, and trigger to download statutory PDF or open preview  
**File:** `src/components/portal/PackageDetailModal.tsx`

---

### 3. `AgendaPdfModal`
**Trigger:** Click "Preview PDF" inside `PackageDetailModal` or marketing landing pages  
**Purpose:** High-fidelity in-browser rendering of the statutory tour agenda & trade mission dossier with direct download and print capabilities  
**Export Features:**
- **Exact HTML as PDF 1:1 Engine**: Direct button allowing users to download the entire HTML page as a PDF (`downloadAgendaHtmlToPdf`) with `scale: 2.2` high-DPI rasterization, guaranteeing that the downloaded PDF is an exact visual replica of the rendered HTML page.
- **Cross-Component Direct Download**: Integrated across `AgendaPdfModal`, `StandaloneAgendaView` (header action bar + standalone toolbar), `PackageDetailModal`, and `CustomerDashboard`.
- **Zero-Waste Full-Page Density Engine**: Intelligent multi-block packing combining itinerary, mission value, optional programs, and commercial terms into full, beautifully utilized A4 sheets, eliminating empty white gaps and saving paper.
- **Anti-Cut & Anti-Overflow CSS**: `@media print` rules enforcing `page-break-inside: avoid` / `break-inside: avoid` on all schedule cards, day boxes, timing rows, galleries, vouchers, tax invoices, and summary grids.
- **Multi-Format Export**: Generates Exact HTML as PDF A4, Rasterized Image PDF, standalone offline `.html`, and MS Word `.doc`.
**File:** `src/components/portal/AgendaPdfModal.tsx`, `src/components/portal/StandaloneAgendaView.tsx` & `src/services/agendaExportService.ts`

---

### 4. `PackageEditorModal`
**Trigger:** Click "New Package" or "Edit" inside Admin Package Management  
**Purpose:** Multi-tab tour creation studio: basic info, pricing & early-bird tiers, itinerary day builder, inclusions/exclusions, tour director assignments, and image galleries  
**File:** `src/components/admin/PackageEditorModal.tsx`

---

### 5. `CheckoutModal`
**Trigger:** Click "Book Now" / "Register Delegate" on any package  
**Purpose:** Multi-step booking checkout:
- Step 1: Traveler contact & passport details
- Step 2: Date selection & optional upgrades (B2B Matchmaking, Private Dinners)
- Step 3: Payment gateway selection (Credit/Debit Card, ABA PayWay, ACLEDA X-Pay, Wing Bank, Biometric Wallet)
- Step 4: Instant booking confirmation with confetti explosion and download links  
**File:** `src/components/portal/CheckoutModal.tsx`

---

### 6. `VoucherModal`
**Trigger:** Click "View Voucher" on any confirmed booking in Customer Portal or Admin  
**Purpose:** Digital travel pass with QR code verification, flight gate info, hotel address in local & English scripts, and 24/7 escort emergency hotline  
**File:** `src/components/portal/VoucherModal.tsx`

---

### 7. `InvoiceModal`
**Trigger:** Click "View Invoice" on a booking  
**Purpose:** Statutory VAT tax invoice with itemized pricing, tax calculation (7.5%), buyer VAT numbers, payment stamp, and PDF export  
**File:** `src/components/portal/InvoiceModal.tsx`

---

### 8. `ModifyDatesModal`
**Trigger:** Click "Modify Dates" on an active booking  
**Purpose:** Self-service date rescheduling picker checking available group departures  
**File:** `src/components/portal/ModifyDatesModal.tsx`

---

### 9. `ProfileSettingsModal`
**Trigger:** Click user avatar / profile in Header  
**Purpose:** Manage traveler profile, emergency contacts, corporate tax numbers, preferred language/currency, and register WebAuthn biometric passkeys  
**File:** `src/components/portal/ProfileSettingsModal.tsx`

---

### 10. `CurrencyConverterModal`
**Trigger:** Click currency calculator button in Header  
**Purpose:** Live foreign exchange converter supporting USD, KHR, EUR, GBP, JPY, CNY, THB, VND, SGD  
**File:** `src/components/common/CurrencyConverterModal.tsx`

---

## Related Notes
- [[Components Map]]
- [[App Views]]
- [[Authentication]]

