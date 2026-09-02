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
**Trigger:** Click any tour package card across marketing, customer portal, or admin packages  
**Purpose:** Full interactive dossier — daily itinerary timeline, inclusions/exclusions, tour director profile, optional B2B programs, and trigger to download statutory PDF or open preview.  
**Direct Edit Quick Action:** Features a prominent direct `✏️ Edit Package` button in both the Sticky Header and Bottom Action Bar. When clicked by administrators or operators, it immediately opens the full-featured `PackageEditorModal` for instant editing without navigating through multiple menus.  
**File:** `src/components/portal/PackageDetailModal.tsx`

---

### 3. `AgendaPdfModal`
**Trigger:** Click "Preview PDF" inside `PackageDetailModal` or marketing landing pages  
**Purpose:** High-fidelity in-browser rendering of the statutory tour agenda & trade mission dossier with direct download, print, and **Direct Quick Edit** (`✏️ Edit Package` button in toolbar to immediately customize schedule and dossier details in the Package Editor).  
**Export Features:**
- **Pre-Flight Dynamic Layout Analyzer & Auto-Fit Engine**: Automatically scans the rendered DOM of every A4 page prior to PDF compilation. If any page exceeds the safe A4 height threshold (1080px), it dynamically applies micro-scaling and spacing compensation to guarantee that zero lines, cards, or paragraphs are ever cut or sliced at page breaks.
- **Exact HTML as PDF 1:1 Engine**: Direct button allowing users to download the entire HTML page as a PDF (`downloadAgendaHtmlToPdf`) with `scale: 2.2` high-DPI rasterization, guaranteeing that the downloaded PDF is an exact visual replica of the rendered HTML page.
- **Dedicated Page Margins & Anti-Text-Splitting**: Dedicated isolated pages for Cover Profile (Header + Gallery + Title + Badges + Tour Director), Itinerary (2 days/page), Delegation Value Dossier (Mission Description & Scope + Highlights + Who/Why Should Join), VIP Optional Programs, and Compliance & Authorizations, with 32px/36px container margins, `@page { margin: 12mm 14mm 14mm 14mm }` print rules, `orphans: 3; widows: 3;`, and `break-inside: avoid !important;` on all paragraphs, schedule slots, day boxes, benefit cards, and signature blocks.
- **Cross-Component Direct Download**: Integrated across `AgendaPdfModal`, `StandaloneAgendaView` (header action bar + standalone toolbar), `PackageDetailModal`, and `CustomerDashboard`.
- **Multi-Format Export**: Generates Exact HTML as PDF A4, Rasterized Image PDF, standalone offline `.html`, and MS Word `.doc`.
**File:** `src/components/portal/AgendaPdfModal.tsx`, `src/components/portal/StandaloneAgendaView.tsx` & `src/services/agendaExportService.ts`

---

### 4. `PackageEditorModal`
**Trigger:** Click "New Package" or "Edit" inside Admin Package Management, or click `✏️ Edit Package` inside `PackageDetailModal`, `PackageSalesLandingPage`, or `AgendaPdfModal` via `openPackageEditor` in [[AppContext]].  
**Layout & Navigation Options:** Multi-tier Responsive Workspace with dual-mode navigation at both top-level and inner sub-section level:
- **Top-Level Navigation**: 1-click switcher between **Aside Menu Style** (dedicated left sidebar with search, badges, and copilot actions) and **Tab Style** (horizontal scrolling tab bar).
- **Inner Sub-Section Navigator & Controller**: Allows users to control and navigate elements inside each active studio section-by-section:
  - **Sub-Tabs Style vs Sub-Aside Menu Style**: Instant toggle between a horizontal scrolling pill tab bar and an inner left aside menu column with live search filtering and element completion dot indicators.
  - **Show All Mode vs Focus Mode**: Toggle between seeing all studio elements seamlessly stacked with smooth scrolling/pulse highlighting, or isolating and focusing strictly on a single element at a time (e.g. Core & Pricing, Multilingual Titles, Image Gallery, Emergency Hotlines).
- **Studio Header Banner**: Integrated in both styles featuring Studio step indicators ("Studio X of 7"), previous/next quick navigation, and instant 1-click layout toggle pill.  
- **AI Smart Auto-Input Drawer & Text Importer**:
  - **English-First Semantic Comprehension**: Ingests unstructured English text (flyers, trade mission briefs, PDF copies) or Khmer text and extracts 15+ structured form entities.
  - **Language Focus Mode**: Toggle between `🇺🇸 English (Main)` and `🇰🇭 Khmer` with automatic bilingual twinning.
  - **Matched Fields Visualizer**: Visual indicator chips displaying all form fields populated by AI alongside individual confidence scores.
  - **Quick Sample Presets**: Pre-configured real-world trade mission study briefs (Canton Fair 138th, Bangkok Retail & Bakery Summit, Tokyo AI & Robotics, Vietnam Specialty Coffee).
**Purpose:** Multi-section tour creation studio: basic info, pricing & early-bird tiers, itinerary day builder, inclusions/exclusions, tour director assignments, image galleries, and **Video Gallery & File Uploads** (supports uploading MP4/WebM/MOV from local device with automated canvas thumbnail snapshots & duration calculations, or embedding YouTube/Vimeo/CDN video URLs with default auto-play controls). All sub-sections are housed in modern, accessible card-based containers (`rounded-2xl`, `bg-slate-50/60`, `border-slate-200/80`) equipped with inline AI translation tools (`FieldAiTranslator`).  
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

### 11. `SocialShareModal`
**Trigger:** Click "🚀 Boost & Share Link" / Share icon on any Tour Package card, Package Detail, Sales Landing Page, or Admin Package Management  
**Purpose:** Dedicated Social Media Boosting & Sharing Suite for each individual tour package:
- Provides direct permanent post permalinks (`#package/:id` & `?pkg=:id`) loading dedicated sales pages with auto-play videos
- Pre-written dual-language (Khmer & English) social media post captions with 1-click copy
- 1-Click direct sharing to Facebook, Telegram, WhatsApp, LinkedIn, and Twitter/X
- UTM Ad Boost campaign link builder for paid social campaigns
- High-res QR code generator & PNG download for print posters and roll-ups  
**File:** `src/components/common/SocialShareModal.tsx`

---

## Related Notes
- [[Components Map]]
- [[App Views]]
- [[Authentication]]

