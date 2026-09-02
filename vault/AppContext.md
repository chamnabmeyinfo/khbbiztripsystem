# ⚙️ AppContext — Central State & Firestore Synchronization

← [[Home]] | File: `src/context/AppContext.tsx`

## Overview
The `AppContext` is the single source of truth for the entire application, handling:
1. **Two-Way Database Sync**: Real-time Firebase Firestore synchronization + resilient `localStorage` offline caching.
2. **Payload Sanitization**: Automatic stripping of `undefined` fields to guarantee zero Firestore runtime write crashes.
3. **Role-Based Access Control (RBAC)**: Active user clearance, departmental filtering, and role switching.
4. **Global View & Modal Navigation**: Seamless active view routing and modal dialog controls.

---

## State Slices

| State Property | TypeScript Type | Description & Fallback Strategy |
|---|---|---|
| `currentUser` | `User \| null` | Authenticated user profile with role & clearances |
| `users` | `User[]` | System users list (Admin RBAC management) |
| `packages` | `TourPackage[]` | Active tour package & trade mission catalogue |
| `bookings` | `Booking[]` | Active & historical traveler bookings |
| `invoices` | `Invoice[]` | Itemized VAT invoices with statutory breakdown |
| `suppliers` | `Supplier[]` | Vendor directory (airlines, hotels, coaches, caterers) |
| `purchaseOrders` | `PurchaseOrder[]` | Procurement PO tracking & supplier payouts |
| `expenses` | `Expense[]` | Operational mission expenditure claims |
| `deletedItems` | `DeletedItemRecord[]` | 100% loss-free Recycle Bin audit log |
| `systemSettings` | `SystemSettings` | Payment gateways, VAT rates, branding info |
| `activeView` | `ActiveView` | `'marketing' \| 'package_sales_page' \| 'customer_portal' \| 'admin_dashboard'` |
| `activeModal` | `string \| null` | Active modal dialog (`'auth'`, `'checkout'`, `'agenda_pdf'`, etc.) |
| `selectedPackage`| `TourPackage \| null` | Focused tour package for modal or sales landing |
| `selectedBooking`| `Booking \| null` | Focused booking for voucher or invoice inspection |
| `language` | `LanguageCode` | Active UI language (`'en'`, `'km'`, `'ar'`, `'he'`, `'es'`, `'ja'`) |
| `currency` | `CurrencyCode` | Active display currency (`'USD'`, `'KHR'`, `'EUR'`, etc.) |
| `darkMode` | `boolean` | Dark / Light theme toggle |
| `offlineMode` | `boolean` | Simulated or physical PWA offline mode flag |
| `defaultView` | `ActiveView` | User-configured default startup view (`'marketing'`, `'customer_portal'`, `'admin_dashboard'`) stored in `localStorage` |
| `defaultAdminTab` | `string` | User-configured default landing tab in Admin ERP (`'overview'`, `'packages'`, `'bookings'`, etc.) stored in `localStorage` |
| `defaultPackageViewMode` | `PackageViewMode` | User-configured default view mode for Tour Packages (`'grid'`, `'detailed-list'`, `'table'`, `'kanban'`) stored in `localStorage` |
| `autoSyncState` | `AutoSyncState` | Real-time visual status indicator state (`'saving' \| 'synced' \| 'offline' \| 'error'`, timestamps, pending counts) |
| `toastMessage` | `string \| null` | Global toast notification text for user actions |

---

## Core Operations & Actions

## 1. View & Navigation Management & State Retention
The application guarantees **100% Session State Retention Across Page Refreshes**:
- **Active View Persistence**: Navigating to `'package_sales_page'`, `'admin_dashboard'`, `'customer_portal'`, or `'marketing'` saves to `STORAGE_KEYS.ACTIVE_VIEW` and updates the URL hash (`#package/<id>`, `#admin/<tab>`, `#portal`, `#explore`).
- **Selected Package Persistence**: Selecting or viewing any package persists `STORAGE_KEYS.SELECTED_PACKAGE_ID`. When the user refreshes, the app boots up and immediately restores the exact package on the sales landing page.
- **Admin Tab & Settings Sub-Tab Persistence**: Switching tabs inside Admin Back-Office or Settings persists `STORAGE_KEYS.ACTIVE_ADMIN_TAB` and `STORAGE_KEYS.SETTINGS_SUB_TAB`, restoring the exact module on page reload.
- **Scroll Position Retention**: `sessionStorage` tracks window scroll coordinates before reload and restores viewport position smoothly after component mount.

```typescript
setActiveView(view: ActiveView); // Persists to localStorage & syncs URL hash
setSelectedPackage(pkg: TourPackage | null); // Persists ID to localStorage & syncs URL hash
setAdminActiveTab(tab: string); // Persists to localStorage & syncs URL hash
setSettingsSubTab(subTab: string); // Persists to localStorage
setDefaultView(view: ActiveView): void; // Persists default landing view to localStorage & shows toast
setDefaultAdminTab(tab: string): void; // Persists default admin tab to localStorage & shows toast
setDefaultPackageViewMode(mode: PackageViewMode): void; // Persists default package view layout to localStorage & shows toast
resetDefaultView(): void; // Clears saved defaults back to initial system standard
triggerAutoSave(message?: string): void; // Triggers instant visual saving status feedback
forceSyncAll(): Promise<void>; // Manually synchronizes all local data to Cloud Firestore
showToast(message: string): void;
clearToast(): void;
```

### 2. Authentication & RBAC
```typescript
signInWithGoogle(): Promise<{ success: boolean; error?: string }>; // Restricted to @khbmedia.asia & @khbevents.com
registerPublicUser(data: { name: string; email?: string; phone?: string; password?: string }); // Public traveler sign up
loginWithPhone(phone: string, name?: string); // Public phone sign in
loginWithEmail(email: string, role?: UserRole, name?: string, phone?: string);
loginAsTraveler();
loginAsAdmin();
authenticateBiometric();
registerBiometrics();
assignUserRoleAndPermissions(userId: string, role: UserRole, customPermissions?: PermissionKey[], customAccessibleTabs?: string[]): Promise<void>;
resetUserPermissionsToDefault(userId: string): Promise<void>;
logout();
switchRole(role);
canAccessTab(tabId: string): boolean;
```

### 3. ERP & Back-Office CRUD
```typescript
// Packages & Missions
addPackage(pkg);
updatePackage(pkg);
updatePackageStatus(packageId: string, status: TourPackageStatus);
clonePackageAsDraft(pkg: TourPackage): TourPackage;
deletePackage(id);
restorePackage(packageId: string);
refreshTourPackagesFromDatabase(): Promise<TourPackage[]>; // Fetches authoritative package collection from Cloud Firestore, reconciles local state, and returns active packages

// Package Reconciliation & Zero-Data-Loss Architecture
// - packageReconciler (reconcileTourPackages): Safe dual-layer conflict resolution comparing createdAt, updatedAt, and version counters
// - Firestore snapshot synchronization: Reconciles local and remote packages. When remote snapshot has documents, Firestore is authoritative and missing seed packages are recognized as deleted (preventing zombie resurrection).
// - Deleted item tracking (deletedIds & deleted_items sync): Real-time onSnapshot listener on 'deleted_items' collection propagates deletions across all clients, updating Recycle Bin and preventing stale seed resurrection.
// - Seed Translation Hydration: Automatically enriches cached localStorage packages with updated English translations from INITIAL_PACKAGES on startup
// - Free-Tier Quota Guard: All listeners are quota-aware — on 'resource-exhausted' errors they self-unsubscribe, mark a 30-min sessionStorage cooldown (tripdesk_fs_quota_cooldown_v1 via src/utils/firestoreQuota.ts), flip autoSyncState to 'offline', and serve the local cache. Listeners read deletedIds through a deletedIdsRef mirror so they subscribe once (no churn-driven re-reads).

// Package Categories
addPackageCategory(cat);
updatePackageCategory(cat);
deletePackageCategory(id);

// Bookings & Travellers
createBooking(params);
modifyBookingDate(id, newDate);
cancelBooking(id);
updateBookingStatusByAdmin(id, status, flight, hotel);

// Procurement & Finances
addSupplier(supplier);
deleteSupplier(id);
addPurchaseOrder(po);
addExpense(exp);
restoreDeletedItem(deletedId); // 100% loss-free restoration
updateSystemSettings(settings);
```

### 4. Financial & Reporting Calculations
```typescript
getMonthlyFinancialSummary(monthFilter?);
exportMonthlyReportCSV(monthFilter?);
```

---

## Related Notes
- [[Data Models]]
- [[Firebase and Firestore]]
- [[Components Map]]

3. `onSnapshot(/packages)` — live package catalog
4. `onSnapshot(/bookings)` — filtered by userId or all (admin)
5. `onSnapshot(/invoices)` — filtered by userId or all (admin)
6. `onSnapshot(/support_messages)` — filtered by userId or all (admin)

## Related Notes
- [[Firebase and Firestore]]
- [[Authentication]]
- [[Data Models]]
