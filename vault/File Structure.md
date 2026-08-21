# 📁 File Structure

← [[Home]]

```
khbbiztripsystem/
├── .env.example                  # Environment variable declaration template
├── .gitignore                    # Git ignore rules
├── bun.lock                      # Bun lockfile reference
├── firebase-applet-config.json   # Firebase project configuration & IDs
├── firebase-blueprint.json       # Firestore database schema & collections
├── firestore.rules               # Firestore RBAC security rules
├── index.html                    # Single Page App HTML container
├── metadata.json                 # Google AI Studio applet metadata & capabilities
├── package.json                  # Dependencies, scripts & build targets
├── tsconfig.json                 # TypeScript strict compiler config
├── vercel.json                   # Vercel deployment routing configuration
├── vite.config.ts                # Vite config with React & Tailwind plugins
├── server.ts                     # Full-stack Express server + SSR fallback
│
├── vault/                        # 📓 Obsidian Architecture & Knowledge Vault
│   ├── Home.md                   # Vault root & navigation index
│   ├── Architecture Overview.md  # High-level data flow & state synchronization
│   ├── Tech Stack.md             # Packages, tools & dev commands
│   ├── Components Map.md         # Component breakdown & file mappings
│   ├── App Views.md              # 4 app views documentation
│   ├── Modals.md                 # 10 global modals catalog
│   ├── AppContext.md             # Global React state slice breakdown
│   ├── Data Models.md            # TypeScript data models & schema types
│   ├── Mock Data.md              # Resilient seed data
│   ├── Authentication.md         # Multi-role RBAC & biometrics
│   ├── Security Rules.md         # firestore.rules security specifications
│   ├── Firebase and Firestore.md # Database listeners & collections
│   ├── Currency Service.md       # Multi-currency FX calculations
│   ├── i18n and Translations.md  # 6-language translations & RTL support
│   ├── Gemini AI Concierge.md    # AI Copilot & concierge integrations
│   └── File Structure.md         # This directory layout
│
└── src/
    ├── main.tsx                  # React 19 bootstrap entry
    ├── App.tsx                   # Main root view & modal router
    ├── index.css                 # Tailwind CSS v4 design system
    ├── types.ts                  # Universal TypeScript interfaces & ERP models
    │
    ├── context/
    │   └── AppContext.tsx        # Central state, Firestore two-way sync & RBAC
    │
    ├── lib/
    │   └── firebase.ts           # Firebase SDK initialization & sanitizers
    │
    ├── services/
    │   ├── mockData.ts           # Seed datasets (tours, users, bookings, ERP)
    │   ├── rolePermissions.ts    # Role configs, clearances & badge styling
    │   ├── currencyService.ts    # FX rates (USD, KHR, EUR, GBP, JPY, CNY, etc.)
    │   ├── pdfAgendaService.ts   # jsPDF mission dossier & agenda generator
    │   ├── pdfFonts.ts           # Embedded Unicode font loaders for PDF
    │   ├── pdfTranslations.ts    # Multilingual PDF headers & tables
    │   ├── agendaExportService.ts# High-res image & PDF export helpers
    │   └── geminiService.ts      # Gemini AI client integration
    │
    ├── i18n/
    │   └── translations.ts       # UI dictionary in English, Khmer, etc.
    │
    └── components/
        ├── common/
        │   ├── Header.tsx        # Sticky top navigation bar
        │   ├── Footer.tsx        # Enterprise footer
        │   ├── AuthModal.tsx     # Authentication & role switcher modal
        │   ├── CurrencyConverterModal.tsx
        │   └── AiFloatingCopilot.tsx
        │
        ├── marketing/
        │   ├── LandingPage.tsx   # Consumer portal landing
        │   ├── PackageSalesLandingPage.tsx # B2B Trade Mission sales page
        │   ├── HeroSection.tsx
        │   ├── TrendingDeals.tsx
        │   ├── InteractiveMap.tsx
        │   └── Testimonials.tsx
        │
        ├── portal/               # Traveler & Delegate portal
        │   ├── CustomerDashboard.tsx
        │   ├── CheckoutModal.tsx
        │   ├── PackageDetailModal.tsx
        │   ├── AgendaPdfModal.tsx
        │   ├── StandaloneAgendaView.tsx
        │   ├── VoucherModal.tsx
        │   ├── InvoiceModal.tsx
        │   ├── ModifyDatesModal.tsx
        │   ├── ProfileSettingsModal.tsx
        │   └── SupportChatWidget.tsx
        │
        └── admin/                # Enterprise Back-Office ERP
            ├── AdminDashboard.tsx
            ├── UserManagementSection.tsx
            ├── PackageManagementSection.tsx
            ├── PackageEditorModal.tsx
            ├── CostingSection.tsx
            ├── SuppliersSection.tsx
            ├── PurchaseOrdersSection.tsx
            ├── PaymentsSection.tsx
            ├── ExpensesSection.tsx
            ├── ProfitLossSection.tsx
            ├── CashFlowSection.tsx
            ├── RecycleBinSection.tsx
            ├── AiCopilotSection.tsx
            └── SettingsSection.tsx
```

## Related Notes
- [[Architecture Overview]]
- [[Components Map]]
- [[Home]]

