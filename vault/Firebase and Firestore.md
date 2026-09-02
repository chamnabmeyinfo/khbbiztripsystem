# 🔥 Firebase & Firestore

← [[Home]]

## Initialization

File: `src/lib/firebase.ts`

- Config loaded from `firebase-applet-config.json`
- Uses a **custom Firestore database ID** (not `(default)`)
- Exports: `db`, `auth`, `googleAuthProvider`
- **Firestore Offline Persistence**: Configured with `initializeFirestore` using `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`. This enables IndexedDB-backed cross-session caching and seamless synchronization across multiple browser tabs, ensuring data survives browser restarts, offline states, and eliminates data resets caused by ephemeral storage.

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

## Related Notes
- [[Security Rules]]
- [[Data Models]]
- [[AppContext]]
