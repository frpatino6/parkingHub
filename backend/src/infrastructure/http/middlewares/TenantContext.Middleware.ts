import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../../config/TenantContext.js';

/**
 * Middleware that initializes the TenantContext for the current request.
 * MUST be registered after the authMiddleware.
 */
export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  // auth is populated by authMiddleware from JWT token
  if (!req.auth) {
    next(); // Should not happen if routes are protected, but handled for safety
    return;
  }

  const context = {
    tenantId: req.auth.tenantId,
    branchId: req.auth.branchId, // Might be undefined for Super Admin actions
  };

  /**
   * Every operation (DB, Use Case, Service) called within this next()
   * will have access to TenantContext.current()
   */
  TenantContext.run(context, () => {
    next();
  });
}
