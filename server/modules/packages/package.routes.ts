import { Router } from 'express';
import { packageController } from './package.controller';
import { requireCorporateEditor } from '../../middleware/auth.middleware';

const router = Router();

// Category routes (Must precede /:id to prevent route parameter collision)
router.get('/categories', (req, res, next) => packageController.getCategories(req, res, next));
router.post('/categories', requireCorporateEditor, (req, res, next) => packageController.createCategory(req, res, next));
router.put('/categories/:id', requireCorporateEditor, (req, res, next) => packageController.updateCategory(req, res, next));
router.delete('/categories/:id', requireCorporateEditor, (req, res, next) => packageController.deleteCategory(req, res, next));

// Package CRUD routes
router.get('/', (req, res, next) => packageController.getPackages(req, res, next));
router.get('/:id', (req, res, next) => packageController.getPackageById(req, res, next));
router.post('/', requireCorporateEditor, (req, res, next) => packageController.createPackage(req, res, next));
router.put('/:id', requireCorporateEditor, (req, res, next) => packageController.updatePackage(req, res, next));
router.delete('/:id', requireCorporateEditor, (req, res, next) => packageController.deletePackage(req, res, next));

export default router;
export { router as packageRouter };
