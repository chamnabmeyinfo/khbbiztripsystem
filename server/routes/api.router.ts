import { Router } from 'express';
import { packageRouter } from '../modules/packages/package.routes';

const apiRouter = Router();

/**
 * Health Check
 */
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    architecture: 'modular-standard-backend',
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Feature 1: Tour Packages & Itinerary Engine
 */
apiRouter.use('/packages', packageRouter);

export default apiRouter;
export { apiRouter };
