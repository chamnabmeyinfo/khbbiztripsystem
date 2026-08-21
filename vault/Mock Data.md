# 🧪 Mock Data

← [[Home]] | File: `src/services/mockData.ts` (40KB)

## Purpose
Provides seed data for:
1. **Demo mode** — Pre-populated data for showcasing the app
2. **Offline fallback** — When Firebase is unreachable
3. **Development** — Test without live database

## Exported Seed Sets

| Export | Description |
|---|---|
| `SEED_USERS` | Sample user profiles (travellers and admin) |
| `INITIAL_PACKAGES` | Tour package catalog (multiple destinations) |
| `SEED_BOOKINGS` | Sample bookings with various statuses |
| `SEED_INVOICES` | Sample VAT invoices |
| `SEED_SUPPORT_CHATS` | Sample AI concierge chat histories |

## Auto-Seeding Behavior
When Firestore `/packages` collection is **empty**, AppContext **automatically seeds** all `INITIAL_PACKAGES` into Firestore.

## Default Demo User
`SEED_USERS[0]` = **Sarah Jenkins** (traveller) is loaded as the default user if no localStorage data exists.

## Related Notes
- [[Data Models]]
- [[Firebase and Firestore]]
- [[AppContext]]
