import type { Request, Response, NextFunction } from 'express';
import { canAccessModule, isAdminRole } from '../auth/roles.js';

export function requireModule(module: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!canAccessModule(req.user?.role, module)) {
      res.status(403).json({ error: 'You do not have permission to access this resource' });
      return;
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdminRole(req.user?.role)) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
