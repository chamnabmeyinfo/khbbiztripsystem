import { apiClient } from './client';
import { TourPackage, PackageCategory, TourPackageStatus } from '../types';

export interface GetPackagesParams {
  category?: string;
  status?: TourPackageStatus | 'all';
  search?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const packagesApi = {
  /**
   * Fetch all tour packages from the backend REST API
   */
  async getPackages(params?: GetPackagesParams): Promise<TourPackage[]> {
    return apiClient.get<TourPackage[]>('/packages', { params: params as any });
  },

  /**
   * Fetch a single tour package by ID
   */
  async getPackageById(id: string): Promise<TourPackage> {
    return apiClient.get<TourPackage>(`/packages/${encodeURIComponent(id)}`);
  },

  /**
   * Create a new tour package via backend REST API
   */
  async createPackage(pkg: Partial<TourPackage>): Promise<TourPackage> {
    return apiClient.post<TourPackage>('/packages', pkg);
  },

  /**
   * Update an existing tour package via backend REST API
   */
  async updatePackage(id: string, updates: Partial<TourPackage>): Promise<TourPackage> {
    return apiClient.put<TourPackage>(`/packages/${encodeURIComponent(id)}`, updates);
  },

  /**
   * Delete a tour package via backend REST API
   */
  async deletePackage(id: string, permanent = false): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(`/packages/${encodeURIComponent(id)}`, {
      params: { permanent }
    });
  },

  /**
   * Fetch all tour package categories
   */
  async getCategories(): Promise<PackageCategory[]> {
    return apiClient.get<PackageCategory[]>('/packages/categories');
  },

  /**
   * Create a new package category
   */
  async createCategory(category: PackageCategory): Promise<PackageCategory> {
    return apiClient.post<PackageCategory>('/packages/categories', category);
  },

  /**
   * Update a package category
   */
  async updateCategory(id: string, updates: Partial<PackageCategory>): Promise<PackageCategory> {
    return apiClient.put<PackageCategory>(`/packages/categories/${encodeURIComponent(id)}`, updates);
  },

  /**
   * Delete a package category
   */
  async deleteCategory(id: string): Promise<{ success: boolean; affectedPackages: number }> {
    return apiClient.delete<{ success: boolean; affectedPackages: number }>(`/packages/categories/${encodeURIComponent(id)}`);
  }
};
