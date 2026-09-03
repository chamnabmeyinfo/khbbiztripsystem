/**
 * Safe LocalStorage Utility & Quota Guard
 *
 * Prevents QuotaExceededError crashes by:
 * 1. Wrapping all localStorage write operations with defensive try/catch.
 * 2. Performing emergency quota relief (clearing disposable caches, old drafts, trimming bloated logs/trash).
 * 3. Sanitizing heavy deleted items (stripping base64 images and large blobs) before storing locally.
 * 4. Running an initial storage check on boot to rescue users who are already in quota exhaustion.
 */

import { DeletedItemRecord } from '../types';

/** Detects browser LocalStorage / SessionStorage quota exhaustion errors. */
export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'object') {
    const error = err as { name?: string; code?: number; number?: number; message?: string };
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014 ||
      error.number === -2147024882
    ) {
      return true;
    }
    const msg = error.message || '';
    return msg.includes('quota') || msg.includes('Quota') || msg.includes('exceeded the quota');
  }
  if (typeof err === 'string') {
    return err.includes('quota') || err.includes('Quota');
  }
  return false;
}

/** Sanitizes an arbitrary object by stripping huge base64 strings and limiting nested arrays. */
function sanitizeDataPayload(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    // Keep max 20 array entries and sanitize each
    return data.slice(0, 20).map(sanitizeDataPayload);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') {
      // If it's a huge base64 image or giant string (> 2KB), strip or truncate
      if (val.startsWith('data:image/') || val.length > 2048) {
        sanitized[key] = val.startsWith('data:image/')
          ? '[IMAGE_DATA_OMITTED_FOR_LOCAL_QUOTA]'
          : val.slice(0, 1024) + '... [TRUNCATED]';
      } else {
        sanitized[key] = val;
      }
    } else if (key === 'images' && Array.isArray(val)) {
      // Keep only up to 2 image URLs and strip base64
      sanitized[key] = val.slice(0, 2).map(img => {
        if (typeof img === 'string' && (img.startsWith('data:image/') || img.length > 2048)) {
          return '[IMAGE_DATA_OMITTED]';
        }
        return img;
      });
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeDataPayload(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Sanitizes deleted items array for LocalStorage:
 * - Caps count to maxItems (default 25)
 * - Strips huge base64 strings / images from snapshot data
 * - Full data remains intact in Firestore 'deleted_items' collection
 */
export function sanitizeDeletedItemsForStorage(
  items: DeletedItemRecord[],
  maxItems = 25
): DeletedItemRecord[] {
  if (!Array.isArray(items)) return [];

  return items.slice(0, maxItems).map(item => ({
    id: item.id,
    originalId: item.originalId,
    entityType: item.entityType,
    title: item.title,
    subtitle: item.subtitle,
    deletedAt: item.deletedAt,
    deletedBy: item.deletedBy,
    data: sanitizeDataPayload(item.data)
  }));
}

/**
 * Emergency quota relief: cleans up disposable keys and trims bloated arrays.
 * Returns true if cleanup was executed.
 */
export function cleanStorageForQuotaRelief(): boolean {
  try {
    let freedSomething = false;

    // 1. Remove disposable draft keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes('_draft') ||
          key.includes('draft_') ||
          key.startsWith('khb_checkout_draft') ||
          key === 'tripdesk_offline_prod')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
        freedSomething = true;
      } catch {}
    });

    // 2. Prune tripdesk_deleted_items_prod to top 5 items
    try {
      const rawDel = localStorage.getItem('tripdesk_deleted_items_prod');
      if (rawDel) {
        const parsed = JSON.parse(rawDel);
        if (Array.isArray(parsed) && parsed.length > 5) {
          const trimmed = sanitizeDeletedItemsForStorage(parsed, 5);
          localStorage.setItem('tripdesk_deleted_items_prod', JSON.stringify(trimmed));
          freedSomething = true;
        }
      }
    } catch {}

    // 3. Prune audit logs to top 20 items
    try {
      const rawLogs = localStorage.getItem('tripdesk_audit_logs_prod');
      if (rawLogs) {
        const parsed = JSON.parse(rawLogs);
        if (Array.isArray(parsed) && parsed.length > 20) {
          localStorage.setItem('tripdesk_audit_logs_prod', JSON.stringify(parsed.slice(0, 20)));
          freedSomething = true;
        }
      }
    } catch {}

    // 4. Prune system updates to top 15 items
    try {
      const rawUpdates = localStorage.getItem('tripdesk_system_updates_prod');
      if (rawUpdates) {
        const parsed = JSON.parse(rawUpdates);
        if (Array.isArray(parsed) && parsed.length > 15) {
          localStorage.setItem('tripdesk_system_updates_prod', JSON.stringify(parsed.slice(0, 15)));
          freedSomething = true;
        }
      }
    } catch {}

    return freedSomething;
  } catch (err) {
    console.warn('[SafeStorage] Quota relief error:', err);
    return false;
  }
}

/**
 * Safely writes a key-value pair to localStorage.
 * Automatically runs quota relief and retries if QuotaExceededError is caught.
 * Never throws an unhandled exception.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      console.warn(`[SafeStorage] Quota exceeded for "${key}". Triggering emergency cleanup...`);
      cleanStorageForQuotaRelief();

      // Retry setting item
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        // If it's deleted_items, try saving with minimal slice
        if (key === 'tripdesk_deleted_items_prod') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              const minimal = sanitizeDeletedItemsForStorage(parsed, 5);
              localStorage.setItem(key, JSON.stringify(minimal));
              return true;
            }
          } catch {}
        }
        console.warn(`[SafeStorage] Failed to save "${key}" even after quota relief. Skipping to prevent app crash.`);
        return false;
      }
    } else {
      console.warn(`[SafeStorage] Could not write "${key}" to localStorage:`, err);
      return false;
    }
  }
}

/**
 * Safely retrieves an item from localStorage without throwing.
 */
export function safeGetItem(key: string, fallback: string | null = null): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Could not read "${key}" from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely removes an item from localStorage without throwing.
 */
export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Could not remove "${key}" from localStorage:`, err);
  }
}

/**
 * Boot-time sanitizer:
 * Runs once when the application loads. If tripdesk_deleted_items_prod or other keys are
 * already bloated and causing quota exhaustion, it immediately cleans them up before any
 * React state synchronization runs.
 */
export function initStorageSanitizer(): void {
  try {
    const rawDel = localStorage.getItem('tripdesk_deleted_items_prod');
    if (rawDel) {
      // If string is larger than 100KB or contains data:image, immediately sanitize
      if (rawDel.length > 100000 || rawDel.includes('data:image/')) {
        console.info('[SafeStorage] Bloated deleted items detected on boot. Sanitizing local storage...');
        try {
          const parsed = JSON.parse(rawDel);
          if (Array.isArray(parsed)) {
            const sanitized = sanitizeDeletedItemsForStorage(parsed, 20);
            safeSetItem('tripdesk_deleted_items_prod', JSON.stringify(sanitized));
          }
        } catch {
          // If corrupted, remove the item
          safeRemoveItem('tripdesk_deleted_items_prod');
        }
      }
    }
  } catch (err) {
    console.warn('[SafeStorage] Boot-time storage check error:', err);
  }
}
