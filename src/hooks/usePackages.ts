import { useState, useEffect, useCallback } from 'react';
import { TourPackage, PackageCategory } from '../types';
import { packagesApi, GetPackagesParams } from '../api/packagesApi';

export interface UsePackagesResult {
  packages: TourPackage[];
  categories: PackageCategory[];
  isLoading: boolean;
  error: string | null;
  refreshPackages: () => Promise<void>;
  getPackageById: (id: string) => TourPackage | undefined;
  createPackage: (pkg: Partial<TourPackage>) => Promise<TourPackage>;
  updatePackage: (id: string, updates: Partial<TourPackage>) => Promise<TourPackage>;
  deletePackage: (id: string, permanent?: boolean) => Promise<boolean>;
}

export function usePackages(initialParams?: GetPackagesParams): UsePackagesResult {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [categories, setCategories] = useState<PackageCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pkgs, cats] = await Promise.all([
        packagesApi.getPackages(initialParams),
        packagesApi.getCategories()
      ]);
      setPackages(pkgs);
      setCategories(cats);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch packages');
    } finally {
      setIsLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getPackageById = useCallback((id: string) => {
    return packages.find(p => p.id === id);
  }, [packages]);

  const createPackage = useCallback(async (pkgData: Partial<TourPackage>): Promise<TourPackage> => {
    const created = await packagesApi.createPackage(pkgData);
    setPackages(prev => [created, ...prev.filter(p => p.id !== created.id)]);
    return created;
  }, []);

  const updatePackage = useCallback(async (id: string, updates: Partial<TourPackage>): Promise<TourPackage> => {
    const updated = await packagesApi.updatePackage(id, updates);
    setPackages(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deletePackage = useCallback(async (id: string, permanent = false): Promise<boolean> => {
    await packagesApi.deletePackage(id, permanent);
    setPackages(prev => (permanent ? prev.filter(p => p.id !== id) : prev.map(p => p.id === id ? { ...p, status: 'deleted' } : p)));
    return true;
  }, []);

  return {
    packages,
    categories,
    isLoading,
    error,
    refreshPackages: fetchAll,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage
  };
}
