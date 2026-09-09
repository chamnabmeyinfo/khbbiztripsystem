# 💼 KHB Biz Trip System — Executive Overview & Core System Features

> **Target Audience:** Company Owner, Board of Directors, Executive Leadership, & Department Heads  
> **System Name:** KHB Biz Trip System (TripDesk)  
> **Primary Purpose:** All-in-One Enterprise Operating Platform for B2B Trade Missions, Corporate Delegations, and Business Travel Operations  
> **Repository:** `https://github.com/chamnabmeyinfo/khbbiztripsystem.git`  
> **Last Updated:** September 2026

---

## 🧭 Executive Summary: Is the Biz Trip System Complicated?

### The Direct Answer
**To the Client & Staff (User Experience):** **NO — It is simple, fast, and frictionless.**  
**Under the Hood (System Architecture):** **YES — It is a highly sophisticated, enterprise-grade operating system.**

```
   ┌────────────────────────────────────────────────────────┐
   │         WHAT THE CLIENT & OWNER EXPERIENCE             │
   │  • 1-Click Booking & Itinerary Viewing                 │
   │  • Clean Khmer & English Dual-Language Interface       │
   │  • Instant Official Tax Invoices & PDF Agendas         │
   │  • Local Bank Payments (ABA, ACLEDA, Cards)            │
   └───────────────────────────┬────────────────────────────┘
                               │
                SIMPLICITY ON THE OUTSIDE
              SOPHISTICATION ON THE INSIDE
                               │
   ┌───────────────────────────▼────────────────────────────┐
   │             WHAT THE SYSTEM HANDLES FOR YOU            │
   │  • Real-Time Unit Costing & Profit-Margin Protection   │
   │  • Inbound CRM Won-Lead Handover & Manifest Automation │
   │  • Multi-Vendor Procurement & PO Payment Schedules     │
   │  • Multi-Currency Real-Time Conversions (USD/KHR/etc.) │
   │  • Dual-Layer Cloud (Firestore) + Offline Data Safety  │
   │  • 8-Tier Departmental Role-Based Access Control       │
   └────────────────────────────────────────────────────────┘
```

### Why This Balance is a Major Competitive Advantage
In traditional business travel agencies or media trade operations, managing a trade delegation (like the Canton Fair or Vietnam B2B Mission) requires **5 to 6 disconnected tools**:
1. Excel spreadsheets for budgeting, profit calculation, and supplier rate cards.
2. Word or Canva documents for itineraries and delegate briefing dossiers.
3. Accounting software for issuing VAT tax invoices and tracking payments.
4. Telegram or WhatsApp groups for task handover and passenger passports.
5. Email chains with hotels, airlines, and local coach operators.

**The KHB Biz Trip System eliminates that fragmentation completely.** It takes the complex, error-prone manual calculations and multi-party coordination, and encapsulates them into a **single, automated, high-reliability dashboard**.

---

## 🏛️ The 10 Main Core Features & What They Do

| # | Core Module | Primary Purpose | Who Uses It | Key Business Value |
|---|---|---|---|---|
| **1** | **Trade Mission & Package Studio** | Full lifecycle creation and management of multi-day business itineraries | Operations & Product Managers | Instant publishing of trade packages with interactive timelines and bilingual descriptions |
| **2** | **Live In-Place WYSIWYG Page Customizer** | 1-Click visual editing of packages directly on the sales page | Marketing & Event Directors | Edit titles, schedules, inclusions, and checklists live without requiring a software developer |
| **3** | **Financial Costing & Profit-Margin Engine** | Dynamic unit economics, cost-per-pax modeling, and margin safety | Finance Officers & Executives | Prevents underpricing, locks in profit margins, and calculates adult vs. child pricing |
| **4** | **Real-Time P&L and Cash Flow Radar** | Real-time tracking of trip revenue, gross margins, and cash liquidity | Company Owner & CFO | Instant executive visibility into net profit, expense burn rate, and running bank balances |
| **5** | **Procurement & Supplier PO Hub** | Vendor directory (airlines, hotels, coaches, guides) and PO lifecycle | Procurement & Logistics | Standardized purchase orders, payment milestone tracking, and supplier rate management |
| **6** | **CRM Inbound Won-Lead Handover Pipeline** | Automated transition from closed sales lead to confirmed operational trip | Sales, CRM, & Operations Desk | Auto-generates passenger manifests, passport registries, and 10-step operational checklists |
| **7** | **Customer Self-Service & Delegate Portal** | Dedicated digital portal for registered business travelers | B2B Delegates & Corporate Clients | Real-time booking status, digital QR vouchers, flight/hotel tracking, and date changes |
| **8** | **Statutory Tax Invoicing & Instant PDF Dossier** | Automated 7.5% VAT invoice generation and branded PDF agenda export | Accounting & Corporate Delegates | Official tax compliance, instant print-ready mission dossiers, and offline itinerary access |
| **9** | **Multi-Currency & Bilingual Localization** | Seamless dual-language (Khmer/English) and multi-currency conversions | All Users & International Partners | Real-time USD/KHR/EUR/GBP/JPY pricing with zero language leakage across views |
| **10** | **Enterprise RBAC & Zero-Loss Data Safety** | 8 departmental security clearance tiers and 100% loss-free Recycle Bin | Super Admin & Executive Leadership | Corporate domain restrictions, biometric login, audit logs, and instant 1-click restore |

---

## 🔍 Detailed Breakdown of Core Features

### 1. 🌏 Trade Mission & Tour Package Management Hub
* **What it is:** The central catalog and design engine for all business trips, Canton Fair trade delegations, and overseas missions.
* **What it does:**
  * **4 Dynamic Display Modes:** Switch seamlessly between **Card Grid**, **Detailed List**, **Compact Table**, and **Kanban Pipeline Board**.
  * **Day-by-Day Itinerary Builder:** Schedules hour-by-hour meetings, exhibition visits, B2B networking dinners, and assembly points.
  * **Rich Media Integration:** High-resolution photo galleries, video showcases (YouTube/MP4), and verified delegate reviews.
  * **Phase & Departure Selectors:** Manages multi-phase events (e.g. Canton Fair Phase 1, Phase 2, Phase 3) with seat limits and date tracking.

### 2. ⚡ Live In-Place WYSIWYG Inline Editing Suite
* **What it is:** A real-time website editor that lets non-technical managers edit mission details directly on the live sales page.
* **What it does:**
  * **1-Click Live Edit Mode:** Toggle edit mode directly from the top navigation bar.
  * **Direct On-Screen Editing:** Click on any title, destination, description, hotel name, or schedule slot to edit in place.
  * **Dynamic Bullet Lists:** Add, reorder, or delete Sourcing Objectives, Target Delegate Profiles, Inclusions, and Terms & Conditions with real-time saving.
  * **Real-time Dual-Language Sync:** Automatically syncs edits to Khmer and English fields and commits to Google Cloud Firestore immediately.

### 3. 📊 Financial Costing & Profit-Margin Protection (ERP)
* **What it is:** A financial safeguarding engine that guarantees every package sold generates a healthy profit.
* **What it does:**
  * **Unit Economics Calculator:** Breaks down variable costs (hotels per night, flights per seat, meals, visas) and fixed costs (tour leader, private coach, venue rental).
  * **Fixed Cost Per Pax Allocation:** Dynamically divides fixed costs across minimum group size (e.g. 15 pax vs 25 pax).
  * **Target Margin Enforcer:** Recommends adult and child selling prices based on the company's required gross margin percentage (e.g. 25% or 30%).

### 4. 📈 Real-Time Profit & Loss (P&L) and Cash Flow Ledger
* **What it is:** The executive financial cockpit for the Company Owner and Management.
* **What it does:**
  * **Per-Trip P&L Statements:** Shows Gross Revenue, Invoiced Receivables, Actual Supplier Costs, Operational Expenses, and Net Profit for every single trip.
  * **Cash Flow Forecast:** Tracks all incoming customer installments vs. outgoing supplier payables, preventing cash crunches before large overseas trips.
  * **Statutory Compliance:** Automatically calculates and breaks down the statutory 7.5% VAT / Tourism tax collected.

### 5. 🤝 Procurement & Supplier Purchase Order (PO) Hub
* **What it is:** A vendor management and procurement control system.
* **What it does:**
  * **Central Supplier Directory:** Stores contracts, contacts, bank details, ratings, and payment terms for airlines, hotels, transport operators, and interpreters.
  * **PO Lifecycle Management:** Issues formal Purchase Orders (e.g., `PO-2026-0042`) with status tracking (`Draft` → `Sent` → `Confirmed` → `Paid`).
  * **Supplier Payments Reconciliation:** Tracks due dates, deposits, and final balances owed to vendors to preserve credit terms and avoid double payments.

### 6. 🔄 CRM Inbound Won-Lead Handover & Manifest Pipeline
* **What it is:** An automated bridge connecting marketing and sales leads directly into operational execution.
* **What it does:**
  * **Automated Lead Ingestion:** When the sales team closes a deal in the CRM, the lead is automatically ingested into TripDesk via secure webhooks.
  * **Passenger Manifest Hub:** Collects and organizes delegate passport numbers, expiry dates, dietary restrictions, room choices (single vs. twin), and badge print status.
  * **10-Step Operational Checklist:** Generates assigned tasks for the operations team (visa processing, flight ticketing, hotel vouchers, briefing packages) with automated progress tracking from "Won" to "Trip Completed".

### 7. 📱 Customer Self-Service & Traveler Portal
* **What it is:** A dedicated, password-protected web portal for registered travelers and corporate delegates.
* **What it does:**
  * **Booking Overview:** Travelers can review all their confirmed business trips and payment receipts.
  * **Digital QR Travel Voucher:** One-click digital voucher with QR verification for rapid airport check-ins and hotel reception verification.
  * **Live Flight & Hotel Gate Tracking:** Displays flight departure times, airline terminal/gate changes, and hotel check-in status.
  * **Self-Service Adjustments:** Allows delegates to request departure date modifications or upgrade optional programs online.

### 8. 📄 Automated Tax Invoicing & High-Res PDF Agenda Dossier
* **What it is:** A built-in document printing and PDF rendering engine.
* **What it does:**
  * **Statutory Tax Invoices:** Generates formal, audit-ready VAT tax invoices (`INV-2026-xxxx`) complete with KHB corporate headers, tax numbers, and payment breakdown.
  * **Branded Mission Dossiers:** Generates a multi-page, formatted PDF agenda with day-by-day itineraries, flight schedules, emergency contact cards, and coordinator bios.
  * **Zero External Dependencies:** Renders instantly in the user's browser using client-side PDF generation (`jsPDF`), working even when offline.

### 9. 💱 Multi-Currency & Full Khmer/English Bilingual Localization
* **What it is:** A global commerce engine tailored specifically for Cambodian and regional international operations.
* **What it does:**
  * **Live Currency Conversion:** Supports transactions in USD, Cambodian Riel (KHR), Euro (EUR), British Pound (GBP), Japanese Yen (JPY), Thai Baht (THB), and Chinese Yuan (CNY).
  * **Strict Bilingual Separation:** Ensures 100% clean English and Khmer text without untranslated strings leaking into the other language.
  * **Multiple Payment Rails:** Supports local and global payment gateways: ABA PayWay, ACLEDA X-Pay, Wing Bank, Credit Cards, Apple Pay, Google Pay, and Biometric Wallets.

### 10. 🛡️ Enterprise Security, RBAC & 100% Zero-Loss Data Recovery
* **What it is:** Corporate-grade security and disaster recovery architecture.
* **What it does:**
  * **8 Departmental Roles (RBAC):** Restricts views so that sales, operations, support, and finance only see the data permitted by their clearance level.
  * **Domain Lockdown:** Restricts administrative access strictly to verified corporate emails (`@khbmedia.asia`, `@khbevents.com`).
  * **WebAuthn Biometric Login:** Enables Touch ID / Face ID hardware authentication for administrative accounts.
  * **100% Loss-Free Recycle Bin:** Every deleted booking, supplier, package, or invoice is preserved with a full snapshot. Any record can be restored with a single click.

---

## 💼 Business Impact & ROI for the Company Owner

| Challenge Before KHB Biz Trip System | How the System Solves It | Quantifiable Business Impact |
|---|---|---|
| **Human Errors in Pricing** | Automated costing template with built-in profit margin and fixed-cost formulas. | **0% risk of selling under cost**; 100% margin protection on every delegate. |
| **Scattered Documents & Lost Passports** | Centralized passenger manifest linked directly to inbound CRM won leads. | **Cuts manifest prep time by 75%**; eliminates misplaced passport and visa details. |
| **Slow Customer Communication** | Self-service traveler portal, QR vouchers, and 1-click PDF mission dossiers. | Instant client gratification; eliminates manual formatting of Word dossiers. |
| **Supplier Overpayments & Missed Balances** | Integrated Purchase Order and Supplier Payment schedule. | Total visibility over accounts payable; prevents missed deadlines or double-billing. |
| **Offline Vulnerability During Overseas Travel** | Resilient offline-first LocalStorage caching with Google Cloud Firestore sync. | Coordinators can access manifests and itineraries in China/abroad even with spotty Wi-Fi. |

---

## 🎯 Summary Recommendation for Leadership

The **KHB Biz Trip System** transforms business travel management from a chaotic, manual paperwork process into a **modern, scalable, and automated digital asset**. 

It gives the Company Owner **complete financial transparency and risk control**, while giving corporate delegates a **first-class, professional digital experience** worthy of the KHB brand.
