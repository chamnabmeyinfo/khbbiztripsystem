# 🏗️ Architecture Overview

← [[Home]]

## System Design

TripDesk is a **client-side React SPA** with **Firebase as its Backend-as-a-Service (BaaS)**. There is no traditional server — all business logic runs in the browser, secured by Firestore Security Rules.

```
┌─────────────────────────────────────────────────────┐
│                   Browser (React SPA)                │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │Marketing │  │Customer      │  │Admin          │  │
│  │LandingPg │  │Portal        │  │Dashboard      │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │             AppContext (Global State)           │  │
│  │  • Auth State   • Packages   • Bookings        │  │
│  │  • Invoices     • Chats      • Notifications   │  │
│  └────────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │ Firebase SDK & Google GenAI
        ┌───────────┼───────────────┬─────────────────┐
        ▼           ▼               ▼                 ▼
  ┌──────────┐ ┌──────────┐  ┌───────────┐     ┌─────────────┐
  │Firestore │ │Firebase  │  │Firebase   │     │Google Gemini│
  │Database  │ │Storage   │  │Auth       │     │AI API       │
  │ (Google) │ │ (Google) │  │ (Google)  │     │  (Google)   │
  └──────────┘ └──────────┘  └───────────┘     └─────────────┘

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
