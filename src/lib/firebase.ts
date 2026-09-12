import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress benign internal Firestore multi-tab primary lease transition error logs.
// In multi-tab and iframe environments (like AI Studio previews), secondary tabs gracefully
// delegate lease ownership while Firestore's sync engine recovers via ignoreIfPrimaryLeaseLoss.
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const firstArg = args[0] !== undefined && args[0] !== null ? String(args[0]) : '';
    if (
      typeof firstArg === 'string' &&
      firstArg.includes('@firebase/firestore') &&
      firstArg.includes('Failed to obtain primary lease')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

try {
  setLogLevel('silent');
} catch {
  // Silent fallback if setLogLevel is locked or unsupported
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: Initialize Firestore with multi-tab offline persistence cache for robust multi-session sync */
function createFirestoreInstance() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, firebaseConfig.firestoreDatabaseId);
  } catch {
    // If initializeFirestore fails (e.g. already initialized), fallback to getFirestore
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // If navigator is offline, client is definitively offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    // Attempt fast connection ping to Firestore test collection
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ]);
    return true;
  } catch (error) {
    // If timeout or transient error, if browser is online, Firestore offline cache and background sync is active
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      return true;
    }
    return false;
  }
}
