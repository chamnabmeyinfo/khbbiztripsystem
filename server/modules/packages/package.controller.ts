import { Request, Response, NextFunction } from 'express';
import { packageService } from './package.service';
import { PackageQueryFilter } from './package.types';

export class PackageController {
  /**
   * GET /api/packages
   */
  async getPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: PackageQueryFilter = {
        category: req.query.category as string,
        status: req.query.status as any,
        search: req.query.search as string,
        country: req.query.country as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };

      const packages = await packageService.getPackages(filter);
      return res.status(200).json({
        success: true,
        data: packages,
        total: packages.length,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/packages/:id
   */
  async getPackageById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pkg = await packageService.getPackageById(id);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          error: `Package with ID '${id}' not found.`
        });
      }
      return res.status(200).json({
        success: true,
        data: pkg
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/packages
   */
  async createPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const newPackage = await packageService.createPackage(req.body, req.user?.email);
      return res.status(201).json({
        success: true,
        data: newPackage,
        message: `Package "${newPackage.title}" created successfully.`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/packages/:id
   */
  async updatePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await packageService.updatePackage(id, req.body, req.user?.email);
      return res.status(200).json({
        success: true,
        data: updated,
        message: `Package "${updated.title}" updated successfully.`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/packages/:id
   */
  async deletePackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const softDelete = req.query.permanent !== 'true';
      const result = await packageService.deletePackage(id, softDelete);
      return res.status(200).json({
        success: true,
        data: result,
        message: `Package with ID '${id}' successfully ${softDelete ? 'moved to trash' : 'permanently deleted'}.`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/packages/categories
   */
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await packageService.getCategories();
      return res.status(200).json({
        success: true,
        data: categories,
        total: categories.length
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/packages/categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await packageService.createCategory(req.body);
      return res.status(201).json({
        success: true,
        data: category,
        message: `Category "${category.name}" created.`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/packages/categories/:id
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await packageService.updateCategory(id, req.body);
      return res.status(200).json({
        success: true,
        data: updated,
        message: `Category "${updated.name}" updated.`
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/packages/categories/:id
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await packageService.deleteCategory(id);
      return res.status(200).json({
        success: true,
        data: result,
        message: `Category deleted (${result.affectedPackages} packages affected).`
      });
    } catch (err) {
      next(err);
    }
  }
}

export const packageController = new PackageController();
