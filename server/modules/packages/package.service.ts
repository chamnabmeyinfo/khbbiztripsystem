import { packageRepository } from './package.repository';
import {
  TourPackage,
  TourPackageStatus,
  PackageCategory,
  CreatePackageDto,
  UpdatePackageDto,
  PackageQueryFilter
} from './package.types';

export class PackageService {
  /**
   * Fetch all tour packages matching criteria
   */
  async getPackages(filter?: PackageQueryFilter): Promise<TourPackage[]> {
    return packageRepository.findAll(filter);
  }

  /**
   * Fetch a single package by ID
   */
  async getPackageById(id: string): Promise<TourPackage | null> {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid package ID is required');
    }
    return packageRepository.findById(id);
  }

  /**
   * Validate and create a new Tour Package
   */
  async createPackage(dto: CreatePackageDto, _authorEmail?: string): Promise<TourPackage> {
    if (!dto.title || !dto.title.trim()) {
      throw new Error('Package title is required');
    }
    if (!dto.destination || !dto.destination.trim()) {
      throw new Error('Package destination is required');
    }
    if (typeof dto.priceUSD !== 'number' || dto.priceUSD < 0) {
      throw new Error('Price USD must be a valid positive number');
    }

    if (dto.discountPriceUSD !== undefined && dto.discountPriceUSD !== null) {
      if (dto.discountPriceUSD >= dto.priceUSD) {
        throw new Error('Discount price must be less than the regular price');
      }
    }

    const now = new Date().toISOString();
    const id = dto.id || `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const status: TourPackageStatus = dto.status || 'active';

    const newPackage: TourPackage = {
      ...dto,
      id,
      status,
      title: dto.title.trim(),
      titleEn: dto.titleEn?.trim() || dto.title.trim(),
      titleKm: dto.titleKm?.trim() || '',
      destination: dto.destination.trim(),
      destinationEn: dto.destinationEn?.trim() || dto.destination.trim(),
      destinationKm: dto.destinationKm?.trim() || '',
      country: dto.country?.trim() || '',
      countryEn: dto.countryEn?.trim() || dto.country?.trim() || '',
      countryKm: dto.countryKm?.trim() || '',
      category: dto.category || 'trade_mission',
      durationDays: dto.durationDays || 1,
      durationNights: dto.durationNights ?? Math.max(0, (dto.durationDays || 1) - 1),
      images: Array.isArray(dto.images) && dto.images.length > 0 ? dto.images : [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
      ],
      highlights: dto.highlights || [],
      inclusions: dto.inclusions || [],
      exclusions: dto.exclusions || [],
      termsAndConditions: dto.termsAndConditions || [],
      itinerary: dto.itinerary || [],
      availableDates: dto.availableDates || [],
      tags: dto.tags || [],
      rating: dto.rating ?? 5.0,
      reviewCount: dto.reviewCount ?? 1,
      bookedThisMonth: dto.bookedThisMonth ?? 0,
      createdAt: now,
      updatedAt: now,
      version: 1
    };

    return packageRepository.create(newPackage);
  }

  /**
   * Update an existing Tour Package
   */
  async updatePackage(id: string, dto: UpdatePackageDto, _authorEmail?: string): Promise<TourPackage> {
    const existing = await packageRepository.findById(id);
    if (!existing) {
      throw new Error(`Package with ID '${id}' not found`);
    }

    if (dto.title !== undefined && !dto.title.trim()) {
      throw new Error('Package title cannot be empty');
    }
    if (dto.priceUSD !== undefined && (typeof dto.priceUSD !== 'number' || dto.priceUSD < 0)) {
      throw new Error('Price USD must be a valid positive number');
    }

    const effectivePrice = dto.priceUSD ?? existing.priceUSD;
    const effectiveDiscount = dto.discountPriceUSD ?? existing.discountPriceUSD;
    if (effectiveDiscount !== undefined && effectiveDiscount !== null && effectiveDiscount >= effectivePrice) {
      throw new Error('Discount price must be less than the regular price');
    }

    const updated = await packageRepository.update(id, dto);
    if (!updated) {
      throw new Error(`Failed to update package '${id}'`);
    }
    return updated;
  }

  /**
   * Delete or archive a tour package
   */
  async deletePackage(id: string, softDelete = true): Promise<{ success: boolean; id: string }> {
    const existing = await packageRepository.findById(id);
    if (!existing) {
      throw new Error(`Package with ID '${id}' not found`);
    }

    if (softDelete) {
      await packageRepository.update(id, { status: 'deleted' });
    } else {
      await packageRepository.delete(id);
    }

    return { success: true, id };
  }

  /**
   * Categories
   */
  async getCategories(): Promise<PackageCategory[]> {
    return packageRepository.findAllCategories();
  }

  async createCategory(cat: PackageCategory): Promise<PackageCategory> {
    if (!cat.name || !cat.name.trim()) {
      throw new Error('Category name is required');
    }
    const id = cat.id || `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    return packageRepository.createCategory({
      ...cat,
      id,
      createdAt: now,
      updatedAt: now
    });
  }

  async updateCategory(id: string, cat: Partial<PackageCategory>): Promise<PackageCategory> {
    const existing = await packageRepository.findCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID '${id}' not found`);
    }
    const updated = await packageRepository.updateCategory(id, cat);
    if (!updated) {
      throw new Error(`Failed to update category '${id}'`);
    }
    return updated;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; affectedPackages: number }> {
    const existing = await packageRepository.findCategoryById(id);
    if (!existing) {
      throw new Error(`Category with ID '${id}' not found`);
    }

    // Check affected packages
    const allPackages = await packageRepository.findAll();
    const affected = allPackages.filter(p => p.category === id);

    await packageRepository.deleteCategory(id);
    return { success: true, affectedPackages: affected.length };
  }
}

export const packageService = new PackageService();
