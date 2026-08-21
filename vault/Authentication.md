# 🔐 Authentication & Role-Based Access Control (RBAC)

← [[Home]]

## Authentication Methods

### 1. Google OAuth (Firebase Auth) - Corporate Staff Only
- **Domain Restriction**: Google SSO is strictly restricted to authorized company staff with email domains `@khbmedia.asia` and `@khbevents.com` (and confirmed platform super admin `chamnabmey.info@gmail.com`).
- Unauthorized Google accounts are automatically rejected and signed out immediately from Firebase Auth with an informative alert banner guiding them to public delegate registration.
- Automatically assigns `admin` / `super_admin` / staff privilege based on email credentials.
- Syncs user profiles directly into Firestore `/users/{uid}` and `localStorage`.

### 2. Public Delegate & Traveler Sign-Up & Login (Phone / Email)
- **Public User Scope**: Public delegates and trade mission participants register and sign in using either:
  - **Mobile Phone Number**: International phone numbers (+855 Cambodia, +86 China, +84 Vietnam, +66 Thailand, +65 Singapore, +1 USA, etc.) with 6-digit OTP verification.
  - **Email Address**: Direct registration with full name, delegate email, phone number, and password.
- Assigned the `traveler` role by default with access to the Customer Trade Mission Portal, itinerary management, e-vouchers, and booking modifications.

### 3. Corporate Staff Authentication
- Staff members log in with their corporate domain accounts ending in `@khbmedia.asia` or `@khbevents.com` via Google SSO or Email.
- Automatically grants access to the Enterprise Back-Office ERP based on their assigned department & clearance tier.

### 4. Biometric Passkey Login (WebAuthn)
- `authenticateBiometric()` uses native browser WebAuthn API (`navigator.credentials.get`).
- Enables secure 1-touch passkey sign-in across mobile and desktop.

### 5. Unauthenticated Default State & Guest Access
- Public visitors and newly deployed instances (e.g. Vercel) start as unauthenticated guests (`currentUser = null`).
- The Admin Back-Office ERP and staff tools are strictly locked behind authenticated role verification.
- Only verified corporate staff (`@khbmedia.asia`, `@khbevents.com`, or Super Admin `chamnabmey.info@gmail.com`) can access administrative views.

---

## Organizational Roles & Clearance Hierarchy

| Role Code | Title | Department | Permissions |
|---|---|---|---|
| `super_admin` | Super Admin & Founder | Executive Leadership | Full unconditional access to all collections, financial P&L, system settings, RBAC overrides |
| `admin` | General Administrator | Executive Leadership | Full operations, catalogue management, costing, supplier contracts, accounting reports |
| `operations_manager`| Operations Manager | Trip Operations | Package itinerary creation, bookings management, supplier coordination, traveler allocations |
| `procurement_officer`| Procurement Officer | Procurement & Sourcing| Supplier database, rate cards, Purchase Orders (PO), vendor status tracking |
| `finance_officer` | Finance & Accounting | Finance & Accounting | Invoices, customer payments, supplier disbursements, operational expense claims, P&L analysis |
| `support_agent` | Concierge & Support Escort | Customer Experience | Traveler support chat, notifications, itinerary assistance |
| `traveler` | Business Delegate / Traveler | Trade Delegates | Personal bookings, digital vouchers, VAT invoices, self-service rescheduling |

---

## Admin & Staff Detection Logic
1. **Super Admin**: Email is `chamnabmey.info@gmail.com` OR UID in Firestore `/admins` collection.
2. **Authorized Admin**: Email is `vutha.tim@khbmedia.asia`.
3. **Staff Clearance**: Email ends with `@khbmedia.asia` or `@khbevents.com`, or role is one of `['super_admin', 'admin', 'operations_manager', 'procurement_officer', 'finance_officer', 'support_agent']`.

---

## Related Notes
- [[Security Rules]]
- [[AppContext]]
- [[Data Models]]

