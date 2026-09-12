# 🏗️ Architecture Overview

← [[Home]]

## System Design

TripDesk features a **decoupled modern architecture** combining a **Modular Node/Express Backend (`/server`)** with a **React 19 SPA (`/src`)**, supported by Google Cloud Firestore and Multi-Provider AI services.

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND CLIENT (src/ - Presentation)               │
│  • React 19 UI Views & Components (Marketing, Sales, Portal, Admin)     │
│  • Feature Hooks (e.g. usePackages) & Context Layer (AppContext)        │
│  • Standard API Client Layer (src/api/client.ts, packagesApi.ts)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Standard REST HTTP (/api/*)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    MODULAR BACKEND (server/ - Service Layer)           │
│  • Routes (/server/routes/api.router.ts)                              │
│  • Controllers with DTO Validation (/server/modules/*/controller.ts)   │
│  • Domain Business Services (/server/modules/*/service.ts)             │
│  • Repositories & Data Access (/server/modules/*/repository.ts)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Dual-Layer Persistence & AI
        ┌───────────────────────────┼────────────────────────────┐
        ▼                           ▼                            ▼
  ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
  │Cloud Firestore│           │Firebase Auth │            │Google Gemini │
  │Enterprise DB │            │& WebAuthn    │            │& Multi-LLM   │
  └──────────────┘            └──────────────┘            └──────────────┘
```

## 🌐 Hosting & Cloud Infrastructure Split

| Layer | Hosting Provider | Details |
|---|---|---|
| **Database** | **Google Cloud Platform** | Google Cloud Firestore Enterprise multi-region NoSQL database (`ai-studio-tripdesktourpack-...` in project `gen-lang-client-0746227717`) |
| **Media & File Storage** | **Google Cloud Platform** | Google Firebase Cloud Storage (`gen-lang-client-0746227717.firebasestorage.app`) for vouchers, receipts, and images |
| **Identity & Authentication** | **Google Cloud Platform** | Google Firebase Auth (`gen-lang-client-0746227717.firebaseapp.com`) |
| **Frontend Web Hosting & CDN** | **Vercel** | Vite SPA deployed on Vercel's global edge network via `vercel.json` |
| **AI Intelligence** | **Google Cloud Platform** | Gemini 2.5 Flash / Pro via `@google/genai` |

## 3 Views / Routes

| View | Component | Who Sees It |
|---|---|---|
| marketing | LandingPage | Everyone (default) |
| customer_portal | CustomerDashboard | Logged-in travellers |
| dmin_dashboard | AdminDashboard | Admin users only |

Navigation is controlled by ctiveView state in [[AppContext]] — **no URL router** is used.

## Data Flow

```
User Action
    │
    ▼
AppContext Action (e.g. createBooking)
    │
    ├─► Firestore write (if online)
    │       └─► onSnapshot fires → updates state
    │
    └─► localStorage cache (offline fallback)
```

## Offline Strategy
- Data is cached to localStorage under keys prefixed with 	ripdesk_
- If Firebase is unreachable, the app falls back to **mock seed data**
- 	estFirestoreConnection() runs on startup to detect connectivity

## Related Notes
- [[Firebase and Firestore]]
- [[AppContext]]
- [[Tech Stack]]
