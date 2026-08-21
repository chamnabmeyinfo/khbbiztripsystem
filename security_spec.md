# Security Specification & Test Matrix for TripDesk Firestore

## 1. Data Invariants
1. **User Profiles (`/users/{userId}`)**: A user profile document can only be read or written by the authenticated user whose `uid` matches `{userId}`, or by a verified administrator (`chamnabmey.info@gmail.com`). Role escalation is prohibited.
2. **Tour Packages (`/packages/{packageId}`)**: Publicly readable by all users (guests and travelers). Writable/creatable/updatable only by authenticated administrators.
3. **Bookings (`/bookings/{bookingId}`)**: A booking document's `userId` must strictly equal `request.auth.uid` on creation. Can be read or modified by the booking owner or an administrator.
4. **Invoices (`/invoices/{invoiceId}`)**: Can be read by the user who matches `userId` or by an administrator. Invoices cannot be modified or deleted by non-admin users once created.
5. **Support Messages (`/support_messages/{messageId}`)**: Travelers can write messages tagged with their own `userId`. Messages can be read by the owning user or by support/admin agents.

## 2. The "Dirty Dozen" Threat Payloads
1. **Payload 1 (Ghost Fields)**: Attempting to create a user document with unknown fields (e.g. `isAdmin: true`).
2. **Payload 2 (Identity Spoofing)**: Submitting a booking with `userId: "victim123"` when authenticated as `"attacker456"`.
3. **Payload 3 (Unauthenticated Write to Catalog)**: Guest or unauthenticated client trying to update package prices.
4. **Payload 4 (Privilege Escalation on User Update)**: Standard customer trying to change their own role to `'admin'`.
5. **Payload 5 (Unchecked String Bombing)**: Writing a package or message with a 500KB text payload into description.
6. **Payload 6 (ID Poisoning)**: Requesting documents with invalid IDs containing non-alphanumeric punctuation.
7. **Payload 7 (Cross-User Data Scraping)**: Running an unfiltered list query on `/bookings` or `/invoices` without being an admin or matching `userId`.
8. **Payload 8 (Orphaned Invoice Modification)**: Non-admin trying to update amounts or tax values on an existing invoice.
9. **Payload 9 (Blanket Read Bypass)**: Reading private traveler contact details or email profiles without authentication.
10. **Payload 10 (Spoofed Email Admin Claim)**: Attempting admin operations with unverified email credentials.
11. **Payload 11 (Terminal State Corruption)**: Overwriting a cancelled or completed booking status without authorization.
12. **Payload 12 (Foreign Message Injection)**: Posting support messages into another traveler's chat thread.
