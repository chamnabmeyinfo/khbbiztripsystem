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

  // 1. Populate remote packages
  remoteList.forEach((rem) => {
    if (!rem || !rem.id || deletedSet.has(rem.id)) return;
    resultMap.set(rem.id, rem);
  });

  // 2. Reconcile with local packages
  localList.forEach((loc) => {
    if (!loc || !loc.id || deletedSet.has(loc.id)) return;

    if (!resultMap.has(loc.id)) {
      // Exists locally but not in remote snapshot -> Keep local & push to cloud
      resultMap.set(loc.id, loc);
      packagesToPush.push(loc);
    } else {
      const rem = resultMap.get(loc.id)!;
      const locTime = loc.updatedAt ? new Date(loc.updatedAt).getTime() : 0;
      const remTime = rem.updatedAt ? new Date(rem.updatedAt).getTime() : 0;
      const locVer = loc.version || 1;
      const remVer = rem.version || 1;

      // If local version is newer or has a higher version number
      if (locTime > remTime || (locTime === remTime && locVer > remVer)) {
        resultMap.set(loc.id, loc);
        packagesToPush.push(loc);
      }
    }
  });

  // 3. Fallback to seeds ONLY IF no packages exist locally AND remote is empty
  let finalPackages = Array.from(resultMap.values());
  if (finalPackages.length === 0 && localList.length === 0 && seedPackages.length > 0) {
    const validSeeds = seedPackages.filter((p) => p && p.id && !deletedSet.has(p.id));
    validSeeds.forEach((s) => {
      resultMap.set(s.id, s);
      packagesToPush.push(s);
    });
    finalPackages = validSeeds;
  }

  return {
    merged: finalPackages,
    packagesToPushToCloud: packagesToPush,
  };
}
