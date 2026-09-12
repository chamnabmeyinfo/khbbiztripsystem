import { TourPackage, TourPackageStatus, PackageCategory } from '../../../src/types';

export type { TourPackage, TourPackageStatus, PackageCategory };

export interface PackageQueryFilter {
  category?: string;
  status?: TourPackageStatus | 'all';
  search?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export type CreatePackageDto = Omit<TourPackage, 'id' | 'rating' | 'reviewCount' | 'bookedThisMonth'> & {
  id?: string;
  rating?: number;
  reviewCount?: number;
  bookedThisMonth?: number;
};

export type UpdatePackageDto = Partial<TourPackage>;

export interface PackageCategoryDto {
  id: string;
  name: string;
  nameKm?: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  color?: string;
  badgeBg?: string;
  order?: number;
  status?: 'active' | 'inactive';
}
