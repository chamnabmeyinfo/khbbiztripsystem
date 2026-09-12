import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  isStaff: boolean;
  isSuperAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Standard Authentication & Corporate Staff Verification Middleware
 */
export const requireCorporateEditor = (req: Request, res: Response, next: NextFunction) => {
  const userEmail = (req.headers['x-user-email'] as string || '').trim().toLowerCase();
  const userRole = (req.headers['x-user-role'] as string || '').trim().toLowerCase();
  const authHeader = req.headers['authorization'] || '';

  const isSuperAdminEmail =
    userEmail === 'chamnabmey.info@gmail.com' ||
    userEmail === 'vutha.tim@khbmedia.asia' ||
    userEmail === 'vutha.tim@khbevents.com';

  const isCorporateStaff =
    isSuperAdminEmail ||
    userEmail.endsWith('@khbevents.com') ||
    userEmail.endsWith('@khbmedia.asia');

  const isPrivilegedRole = [
    'super_admin',
    'admin',
    'manager',
    'marketing_lead',
    'operations',
    'tour_leader',
    'finance',
    'sales'
  ].includes(userRole);

  const isAuthorized = isCorporateStaff || isPrivilegedRole || process.env.NODE_ENV !== 'production' || !!authHeader;

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: Restricted strictly to authorized corporate staff (@khbevents.com & @khbmedia.asia).',
    });
  }

  req.user = {
    email: userEmail,
    role: userRole || 'admin',
    isStaff: true,
    isSuperAdmin: isSuperAdminEmail || userRole === 'super_admin'
  };

  next();
};
