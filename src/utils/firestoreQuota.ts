/**
 * Firestore Free-Tier Quota Guard
 *
 * Detects Firestore `resource-exhausted` (daily read quota) errors and maintains a
 * session-scoped cooldown so real-time listeners pause instead of entering the SDK's
 * endless retry loop, which burns more quota and spams the console.
 *
 * While cooling down, the app continues serving data from the persistent
 * localStorage / IndexedDB offline cache (zero data loss).
 */

const QUOTA_COOLDOWN_KEY = 'tripdesk_fs_quota_cooldown_v1';

/** How long to pause cloud reads after a quota error before retrying (30 minutes). */
const QUOTA_COOLDOWN_MS = 30 * 60 * 1000;

/** Detects Firestore quota-exhaustion errors (free-tier daily read/write limits). */
export function isFirestoreQuotaError(err: any): boolean {
  if (!err) return false;
  if (err.code === 'resource-exhausted') return true;
  const message = typeof err === 'string' ? err : err?.message || '';
  return message.includes('Quota') || message.includes('quota limit');
}

function readCooldownUntil(): number {
  try {
    const saved = sessionStorage.getItem(QUOTA_COOLDOWN_KEY);
    if (saved) return parseInt(saved, 10) || 0;
  } catch {}
  return 0;
}

/** Marks the quota as exceeded and starts the cooldown window (persists across SPA remounts). */
export function markFirestoreQuotaExceeded(): void {
  try {
    sessionStorage.setItem(QUOTA_COOLDOWN_KEY, String(Date.now() + QUOTA_COOLDOWN_MS));
  } catch {}
}

/** True while cloud reads should be paused because the daily quota was recently exhausted. */
export function isFirestoreQuotaCoolingDown(): boolean {
  return Date.now() < readCooldownUntil();
}

/** Remaining cooldown milliseconds (0 when quota reads are safe to resume). */
export function getFirestoreQuotaCooldownRemainingMs(): number {
  return Math.max(0, readCooldownUntil() - Date.now());
}

/** Clears an active cooldown (e.g. after a confirmed successful connection). */
export function clearFirestoreQuotaCooldown(): void {
  try {
    sessionStorage.removeItem(QUOTA_COOLDOWN_KEY);
  } catch {}
}
