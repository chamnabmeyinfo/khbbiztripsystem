# 🌏 KHB Biz Trip System — Vault Home

> **App Name:** KHB Biz Trip System / TripDesk  
> **Repo:** `https://github.com/chamnabmeyinfo/khbbiztripsystem.git`  
> **Stack:** React 19 + TypeScript + Vite + TailwindCSS v4 + Firebase Firestore + Gemini AI + jsPDF  
> **Dev Server:** `http://localhost:3000`

---

## 🗺️ Map of Contents

### 🏗️ Architecture & Overview
- [[Architecture Overview]] — High-level system design & data flow
- [[Tech Stack]] — All libraries, build pipelines, and packages

### 🗄️ Backend & Database
- [[Firebase and Firestore]] — Collections, schemas, real-time listeners, and two-way sync
- [[Security Rules]] — Role-based access control and firestore.rules

### 📦 Data Models & Seeds
- [[Data Models]] — TypeScript interfaces (ERP, CRM, Tour Missions, Accounting)
- [[Mock Data]] — Enterprise seed data for offline & resilient demo modes

### 🧩 Frontend Components
- [[Components Map]] — Component tree, hierarchy, and modular file map
- [[App Views]] — 4 views: Marketing, Package Sales Landing, Customer Portal, Admin ERP
- [[Modals]] — All 10 global modal dialogs and PDF viewers

### ⚙️ Services & State Engine
- [[AppContext]] — Centralized state management, Firestore CRUD, and RBAC
- [[Currency Service]] — Multi-currency conversion (USD, KHR, EUR, GBP, JPY, CNY, THB, VND, SGD)
- [[i18n and Translations]] — Multi-language (Khmer `km`, English `en`, Chinese, etc.) and RTL support

### 🔐 Authentication & RBAC
- [[Authentication]] — Multi-role access control, corporate domains, and WebAuthn biometrics

### 🤖 AI Features & PDF Engines
- [[Gemini AI Concierge]] — AI Chat Concierge, AI Copilot, and dynamic mission planning
- PDF Dossier & Agenda Generation (`pdfAgendaService.ts`, `jspdf`)

### 📁 Project Structure
- [[File Structure]] — Complete workspace directory tree

---

## ⚡ Quick Reference

| Item | Value |
|---|---|
| Super Admin Email | `chamnabmey.info@gmail.com` |
| Lead Admin & Director | `vutha.tim@khbmedia.asia` |
| Corporate Domains | `@khbmedia.asia`, `@khbevents.com` |
| Dev Port | `3000` (strictly container routed) |
| Base Currency | USD (with real-time KHR, EUR, GBP, JPY, CNY, THB, VND, SGD conversion) |
| Statutory VAT Rate | 7.5% |
| Supported Languages | English (`en`), Khmer (`km`), Arabic (`ar`), Hebrew (`he`), Spanish (`es`), Japanese (`ja`) |
| Active Views | `marketing`, `package_sales_page`, `customer_portal`, `admin_dashboard` |

---

## 🔗 Key Files

| File | Path |
|---|---|
| Entry Point | `src/main.tsx` |
| Root App | `src/App.tsx` |
| Global State & Firestore Sync | `src/context/AppContext.tsx` |
| Firebase Init | `src/lib/firebase.ts` |
| Types & Models | `src/types.ts` |
| Seed & Demo Data | `src/services/mockData.ts` |
| Currency Engine | `src/services/currencyService.ts` |
| RBAC & Clearances | `src/services/rolePermissions.ts` |
| PDF Export Service | `src/services/pdfAgendaService.ts` |
| Translations & RTL | `src/i18n/translations.ts` |
| DB Rules | `firestore.rules` |
| DB Schema Blueprint | `firebase-blueprint.json` |

