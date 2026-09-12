import { TourPackage, PackageCategory, PackageQueryFilter } from './package.types';
import { INITIAL_PACKAGES, DEFAULT_PACKAGE_CATEGORIES } from '../../../src/services/mockData';

/**
 * Package Repository
 * Encapsulates data persistence and retrieval for Tour Packages and Categories.
 */
class PackageRepository {
  private packages: Map<string, TourPackage> = new Map();
  private categories: Map<string, PackageCategory> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    if (this.isInitialized) return;

    // Load initial seed packages
    for (const pkg of INITIAL_PACKAGES) {
      this.packages.set(pkg.id, { ...pkg });
    }

    // Load initial seed categories
    for (const cat of DEFAULT_PACKAGE_CATEGORIES) {
      this.categories.set(cat.id, { ...cat });
    }

    this.isInitialized = true;
  }

  async findAll(filter?: PackageQueryFilter): Promise<TourPackage[]> {
    let result = Array.from(this.packages.values());

    if (!filter) {
      return result;
    }

    // Status filter
    if (filter.status && filter.status !== 'all') {
      result = result.filter(p => (p.status || 'active') === filter.status);
    }

    // Category filter
    if (filter.category && filter.category !== 'all') {
      result = result.filter(p => p.category === filter.category);
    }

    // Country filter
    if (filter.country) {
      const q = filter.country.toLowerCase();
      result = result.filter(p => p.country?.toLowerCase().includes(q));
    }

    // Keyword search filter
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        p =>
          p.title?.toLowerCase().includes(q) ||
          p.titleEn?.toLowerCase().includes(q) ||
          p.titleKm?.toLowerCase().includes(q) ||
          p.destination?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Price range filters
    if (typeof filter.minPrice === 'number') {
      result = result.filter(p => (p.discountPriceUSD || p.priceUSD) >= (filter.minPrice || 0));
    }
    if (typeof filter.maxPrice === 'number') {
      result = result.filter(p => (p.discountPriceUSD || p.priceUSD) <= (filter.maxPrice || Infinity));
    }

    return result;
  }

  async findById(id: string): Promise<TourPackage | null> {
    return this.packages.get(id) || null;
  }

  async create(pkg: TourPackage): Promise<TourPackage> {
    this.packages.set(pkg.id, { ...pkg });
    return { ...pkg };
  }

  async update(id: string, updates: Partial<TourPackage>): Promise<TourPackage | null> {
    const existing = this.packages.get(id);
    if (!existing) return null;

    const updated: TourPackage = {
      ...existing,
      ...updates,
      id, // Immutable ID
      updatedAt: new Date().toISOString(),
      version: (existing.version || 1) + 1
    };

    this.packages.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.packages.delete(id);
  }

  async findAllCategories(): Promise<PackageCategory[]> {
    return Array.from(this.categories.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async findCategoryById(id: string): Promise<PackageCategory | null> {
    return this.categories.get(id) || null;
  }

  async createCategory(category: PackageCategory): Promise<PackageCategory> {
    this.categories.set(category.id, { ...category });
    return { ...category };
  }

  async updateCategory(id: string, updates: Partial<PackageCategory>): Promise<PackageCategory | null> {
    const existing = this.categories.get(id);
    if (!existing) return null;

    const updated: PackageCategory = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };

    this.categories.set(id, updated);
    return { ...updated };
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }
}

export const packageRepository = new PackageRepository();
