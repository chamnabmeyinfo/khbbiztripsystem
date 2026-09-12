import { Request, Response, NextFunction } from 'express';

/**
 * Standard CORS Middleware with Enterprise Header Controls
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Powered-By', 'KHB Biz Trip Modular Backend Engine');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-khb-event, x-khb-signature, x-khb-timestamp, x-crm-token, x-crm-signature, x-crm-source, x-user-email, x-user-role, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
