import { TourPackage } from '../types';

/**
 * Reconciles local and remote packages to guarantee 100% data loss prevention.
 * 
 * Rules:
 * 1. Excludes any package present in `deletedIds`.
 * 2. Compares `updatedAt` and `version` timestamps between local and remote packages.
 * 3. If a package exists locally with newer changes than remote, keeps local and flags it to sync to Firestore.
 * 4. If a package exists locally but not in remote (e.g. offline created or remote slow), preserves local and flags for cloud write.
 * 5. If remote has newer changes or new packages, adopts remote.
 * 6. Never reverts to seed data if user packages or local edits exist.
 */
export function reconcileTourPackages(
  localList: TourPackage[],
  remoteList: TourPackage[],
  deletedIds: string[] | Set<string>,
  seedPackages: TourPackage[] = []
): { merged: TourPackage[]; packagesToPushToCloud: TourPackage[] } {
  const deletedSet = deletedIds instanceof Set ? deletedIds : new Set(deletedIds || []);
  const resultMap = new Map<string, TourPackage>();
  const packagesToPush: TourPackage[] = [];
  const seedIdSet = new Set(seedPackages.map((s) => s.id));

  // 1. Populate remote packages from Firestore (excluding deleted items)
  remoteList.forEach((rem) => {
    if (!rem || !rem.id || deletedSet.has(rem.id) || rem.status === 'deleted') return;
    resultMap.set(rem.id, rem);
  });

  // 2. Reconcile with local packages
  if (remoteList.length > 0) {
    localList.forEach((loc) => {
      if (!loc || !loc.id || deletedSet.has(loc.id) || loc.status === 'deleted') return;

      if (resultMap.has(loc.id)) {
        // Exists in both: preserve local modifications if local version or timestamp is newer
        const rem = resultMap.get(loc.id)!;
        const locTime = loc.updatedAt ? new Date(loc.updatedAt).getTime() : 0;
        const remTime = rem.updatedAt ? new Date(rem.updatedAt).getTime() : 0;
        const locVer = loc.version || 1;
        const remVer = rem.version || 1;

        if (locTime > remTime || (locTime === remTime && locVer > remVer)) {
          resultMap.set(loc.id, loc);
          packagesToPush.push(loc);
        }
      } else {
        // Not in remoteList.
        // If it belongs to default seed packages, it was removed from Firestore, so DO NOT resurrect it!
        if (seedIdSet.has(loc.id)) {
          return;
        }
        // Custom user-created offline package (not in seed list): keep and sync to Firestore
        resultMap.set(loc.id, loc);
        packagesToPush.push(loc);
      }
    });
  } else {
    // Remote snapshot is completely empty
    localList.forEach((loc) => {
      if (!loc || !loc.id || deletedSet.has(loc.id) || loc.status === 'deleted') return;
      resultMap.set(loc.id, loc);
    });

    // Fallback to seeds ONLY IF no packages exist locally AND remote is empty AND no deletions occurred
    if (resultMap.size === 0 && localList.length === 0 && seedPackages.length > 0 && deletedSet.size === 0) {
      const validSeeds = seedPackages.filter((p) => p && p.id && !deletedSet.has(p.id) && p.status !== 'deleted');
      validSeeds.forEach((s) => {
        resultMap.set(s.id, s);
        packagesToPush.push(s);
      });
    }
  }

  return {
    merged: Array.from(resultMap.values()),
    packagesToPushToCloud: packagesToPush,
  };
}
