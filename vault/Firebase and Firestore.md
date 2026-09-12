# 🔥 Firebase & Firestore

← [[Home]]

## Initialization

File: `src/lib/firebase.ts`

- Config loaded from `firebase-applet-config.json`
- Uses a **custom Firestore database ID** (not `(default)`)
- Exports: `db`, `auth`, `googleAuthProvider`
- **Firestore Offline Persistence**: Configured with `initializeFirestore` using `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`. This enables IndexedDB-backed cross-session caching and seamless synchronization across multiple browser tabs, ensuring data survives browser restarts, offline states, and eliminates data resets caused by ephemeral storage.
- **Multi-Tab Lease Protection**: In multi-tab and iframe environments (e.g. preview runners), secondary tabs gracefully delegate lease ownership while Firestore's sync engine recovers via `ignoreIfPrimaryLeaseLoss`. To prevent internal transient arbitration notices (`Failed to obtain primary lease for action 'Apply remote event'`) from triggering false error alerts, `setLogLevel('silent')` and targeted console filter guards in `src/lib/firebase.ts` and `index.html` ensure clean logging without impacting real operational warnings.

## ☁️ Cloud Infrastructure & Hosting Providers

| Component | Hosted Provider | Specific Resource / Identifier | Role & Purpose |
|---|---|---|---|
| **Database** | **Google Cloud Platform (Firebase)** | `ai-studio-tripdesktourpack-0b114919-d90c-4bf8-ac6a-2403837e13b5` in project `gen-lang-client-0746227717` | Cloud Firestore Enterprise multi-region NoSQL database for real-time data sync |
| **File & Media Storage** | **Google Cloud Platform (Firebase)** | `gen-lang-client-0746227717.firebasestorage.app` | Cloud Storage bucket for receipts, vouchers, passport scans, and attachments |
| **Authentication** | **Google Firebase Auth** | `gen-lang-client-0746227717.firebaseapp.com` | User identity, Google OAuth, session tokens, and WebAuthn biometrics |
| **AI Services** | **Google Cloud (Gemini AI)** | Google Gemini Pro & Flash via `@google/genai` | AI Chat Concierge, AI Copilot, and automated mission itinerary translation |
| **Frontend Web Hosting** | **Vercel** | Edge Network CDN via `vercel.json` | Global static asset caching, SPA routing rewrites, and fast browser delivery |

## 🖼️ How Images and File Uploads are Stored

The application employs an optimized, offline-resilient storage architecture for uploaded photos, logos, and receipts:
1. **Client-Side Compression (`src/services/imageUploadService.ts`)**:
   - Whenever an image is uploaded (tour package photos, tour guide photo, company logo, coordinator avatar, or coordinator signature), it is automatically compressed and scaled down client-side via HTML5 canvas to high-efficiency JPEG format (max width/height 1000–1200px, quality 78%, size target strictly <= 65 KB).
2. **Direct Firestore & LocalStorage Persistence**:
   - The compressed image is encoded as a self-contained Base64 Data URL (`data:image/jpeg;base64,...`) and written **directly into the Firestore document fields**:
     - `/packages/{packageId}`: `images[]` array and `tourGuide.photoUrl`
     - `/settings/global`: `companyLogoUrl`, `companyBannerUrl`, `leadCoordinatorAvatar`, `leadCoordinatorSignatureUrl`
     - `/users/{userId}`: `avatarUrl`
     - `/expenses/{expenseId}`: `receiptUrl`
   - **Why this architecture?**: By embedding compact Base64 images directly inside documents (within Firestore's 1 MB per document limit), images load with zero latency, zero CORS restrictions, work seamlessly in offline PWA mode, and synchronize simultaneously to both LocalStorage and Cloud Firestore without needing separate Storage bucket network round-trips.
3. **Cloud Storage Bucket (`gen-lang-client-0746227717.firebasestorage.app`)**:
   - Provisioned for large binary file assets, documents, and external media.

## Collections

### /users/{userId}
**Purpose:** User profiles and preferences  
**Read:** Owner or Admin  
**Write:** Owner (own profile), Admin (any)

Fields: `id`, `name`, `email`, `phone`, `role`, `preferredLanguage`, `preferredCurrency`, `hasBiometrics`, `biometricCredentialId`, `avatarUrl`

---

### /packages/{packageId}
**Purpose:** Tour package catalog  
**Read:** Public (no auth required)  
**Write:** Admin only

Fields: `id`, `title`, `destination`, `country`, `priceUSD`, `discountPriceUSD`, `durationDays`, `durationNights`, `itinerary[]`, `highlights[]`, `inclusions[]`, `exclusions[]`, `availableDates[]`, `tags[]`, `rating`, `reviewCount`, `flightIncluded`, `hotelStars`, `emergencyContact`, `coordinates`

---

### /bookings/{bookingId}
**Purpose:** Trip reservations  
**Read:** Owner or Admin  
**Write:** Auth user (create own), Owner/Admin (update)

Fields: `id`, `bookingCode`, `userId`, `packageId`, `status`, `startDate`, `endDate`, `numberOfAdults`, `numberOfChildren`, `basePriceUSD`, `taxAmountUSD`, `totalPriceUSD`, `paidAmount`, `paidCurrency`, `exchangeRateUsed`, `paymentMethod`, `paymentTransactionId`, `flightStatus`, `hotelStatus`, `specialRequests`

---

### /invoices/{invoiceId}
**Purpose:** VAT/Tax receipts  
**Read:** Owner or Admin  
**Write:** Auth user (create own), Admin (update)

Fields: `id`, `invoiceNumber`, `bookingId`, `userId`, `items[]`, `subtotalUSD`, `taxRatePercent`, `taxAmountUSD`, `totalUSD`, `paidCurrency`, `totalPaidInCurrency`, `paymentStatus`, `gatewayTxId`

---

### /support_messages/{messageId}
**Purpose:** AI concierge chat history  
**Read:** Owner or Admin  
**Write:** Auth user (create own), Admin (update/delete)

Fields: `id`, `userId`, `sender` (user/agent/system/ai), `text`, `timestamp`

---

### /admins/{adminId}
**Purpose:** Admin role registry  
**Read:** Any signed-in user  
**Write:** Admin only

## Real-Time Sync (onSnapshot)
AppContext sets up live listeners for:
- `/packages` — synced for all users (with authoritative cloud reconciliation)
- `/deleted_items` — synced for all users to track Recycle Bin items and deleted IDs globally
- `/bookings` — filtered by userId (or all for admin)
- `/invoices` — filtered by userId (or all for admin)
- `/support_messages` — filtered by userId (or all for admin)
- ERP collections (`/suppliers`, `/cost_templates`, `/purchase_orders`, `/customer_payments`, `/supplier_payments`, `/expenses`)

## Free-Tier Quota Guard (Quota-Aware Listeners)
All real-time listeners are **quota-aware** to survive the Firestore free-tier daily read limits (50K reads/day):
- **Quota Detection** (`src/utils/firestoreQuota.ts`): `isFirestoreQuotaError()` detects `resource-exhausted` errors and "Quota" messages; `markFirestoreQuotaExceeded()` starts a **30-minute cooldown** persisted in `sessionStorage` (`tripdesk_fs_quota_cooldown_v1`); `isFirestoreQuotaCoolingDown()` gates listener subscription.
- **Graceful Pause on Quota Exhaustion**: When a snapshot errors with quota exhaustion, the listener **unsubscribes itself** (stops the SDK retry loop), marks the cooldown, flips `autoSyncState` to `offline` ("Daily cloud quota reached — saved locally"), and logs a single concise warning. Data continues to be served from localStorage / IndexedDB offline cache — zero data loss.
- **No Listener Churn**: `packages`, `bookings`, and ERP collection listeners read `deletedIds` through a **ref mirror** (`deletedIdsRef`) instead of closing over the state, so listeners subscribe **once** and are never torn down/re-subscribed on deletion updates (which previously re-read every document in every collection — the primary quota burner).
- **Manual Sync Gating**: `refreshTourPackagesFromDatabase()` (Sync DB button) returns the locally cached catalog instead of performing a full `getDocs` read while the quota cooldown is active.
- Cooldown auto-expires (~30 min) and listeners resume on the next subscription opportunity (page reload / remount).

## Error Handling
`handleFirestoreError()` logs operation type, path, and full auth context on any Firestore error.

## 🔍 How to Check Database & Storage on Google (Step-by-Step)

### Option 1: Via Firebase Console (Recommended — Visual & Fast)
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Sign in with the authorized Google Account (`chamnabmey.info@gmail.com`).
3. Click on the project **`gen-lang-client-0746227717`**.
4. **To Check Database (Firestore)**:
   - In the left sidebar, click **Build** → **Firestore Database**.
   - **CRITICAL STEP**: The project uses a custom named database ID instead of the default. At the top left of the Firestore viewer, open the Database dropdown and switch from `(default)` to:  
     `ai-studio-tripdesktourpack-0b114919-d90c-4bf8-ac6a-2403837e13b5`
   - You can now inspect all collections: `packages`, `bookings`, `invoices`, `suppliers`, `purchase_orders`, `expenses`, `deleted_items`, and `users`.
5. **To Check Storage (Cloud Storage)**:
   - In the left sidebar, click **Build** → **Storage**.
   - Click the **Files** tab to view files in bucket `gen-lang-client-0746227717.firebasestorage.app`.
   - You can browse uploaded receipts, passport scans, vouchers, and media assets.

### Option 2: Via Google Cloud Platform (GCP) Console
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select project **`gen-lang-client-0746227717`** in the top project picker.
3. **To Check Database**:
   - Go to **Firestore** → **Databases** (or search `Firestore` in the top bar).
   - Select database `ai-studio-tripdesktourpack-0b114919-d90c-4bf8-ac6a-2403837e13b5` to view live documents and performance metrics.
4. **To Check Storage**:
   - Go to **Cloud Storage** → **Buckets** (or search `Cloud Storage` in the top bar).
   - Click bucket `gen-lang-client-0746227717.firebasestorage.app` to inspect stored objects and access permissions.

## Related Notes
- [[Security Rules]]
- [[Data Models]]
- [[AppContext]]
- [[Architecture Overview]]
