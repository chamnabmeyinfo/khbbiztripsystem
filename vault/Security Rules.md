# 🔐 Security Rules & Database Access Control

← [[Home]] | File: `firestore.rules`

## Default Policy
**Deny all** — Every Firestore path explicitly denies access unless guarded by verified authentication and role validations.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // default deny
    }
  }
}
```

---

## Administrative & Role Helper Functions

| Function | Implementation / Logic |
|---|---|
| `isSignedIn()` | `request.auth != null` |
| `isOwner(userId)` | `isSignedIn() && request.auth.uid == userId` |
| `isAdmin()` | `request.auth.token.email in ['chamnabmey.info@gmail.com', 'vutha.tim@khbmedia.asia'] || exists(/databases/$(database)/documents/admins/$(request.auth.uid))` |
| `isStaff()` | `isAdmin() || (isSignedIn() && request.auth.token.email.matches('.*@(khbmedia\\.asia|khbevents\\.com)'))` |
| `isValidId(id)` | `id is string && id.size() > 0 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_-]+$')` |
| `isValidUser(data)` | `data.id is string && data.email is string && data.name is string && data.role in ['super_admin', 'admin', 'operations_manager', 'procurement_officer', 'finance_officer', 'support_agent', 'traveler']` |
| `isValidBooking(data)` | Required fields + valid status (`pending`, `confirmed`, `completed`, `cancelled`) |
| `isValidInvoice(data)` | Required tax and financial fields + valid status |

---

## Firestore Collection Access Matrix

| Collection | Public Read | Public Write | Traveler / Owner | Staff / Manager | Admin / Super Admin |
|---|---|---|---|---|---|
| `/packages/{id}` | ✅ Allowed | ❌ Denied | ❌ Denied | ✅ Manage | ✅ Full CRUD |
| `/users/{id}` | ❌ Denied | ❌ Denied | ✅ Read/Write Own | ✅ Read Staff | ✅ Full CRUD |
| `/bookings/{id}` | ❌ Denied | ❌ Denied | ✅ Create / Read Own | ✅ Manage | ✅ Full CRUD |
| `/invoices/{id}` | ❌ Denied | ❌ Denied | ✅ Read Own | ✅ Manage | ✅ Full CRUD |
| `/suppliers/{id}` | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Read / POs | ✅ Full CRUD |
| `/purchase_orders/{id}` | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Create / Edit | ✅ Full CRUD |
| `/expenses/{id}` | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Create / Submit| ✅ Full CRUD |
| `/system_settings/{id}` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Read Only | ✅ Full CRUD |
| `/deleted_items/{id}` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Full (Recycle Bin) |
| `/admins/{id}` | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Super Admin |

---

## Related Notes
- [[Firebase and Firestore]]
- [[Authentication]]
- [[Data Models]]

