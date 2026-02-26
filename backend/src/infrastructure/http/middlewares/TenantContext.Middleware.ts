import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../../config/TenantContext.js';

/**
 * Middleware that initializes the TenantContext for the current request.
 * MUST be registered after the authMiddleware.
 */
export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  // auth is populated by authMiddleware from JWT token
  if (!req.auth) {
    next();
    return;
  }

  const headerBranchId = req.headers['x-branch-id'] as string | undefined;
  
  // Logic to determine active branchId:
  // 1. If user has a fixed branchIds array with 1 item, that's it (legacy/fixed).
  // 2. If user is global (empty branchIds) or multi-branch:
  //    a. Use header if provided and valid.
  //    b. Otherwise keep undefined (Report/Global mode).
  
  let activeBranchId: string | undefined = undefined;

  if (req.auth.branchIds && req.auth.branchIds.length === 1) {
    activeBranchId = req.auth.branchIds[0];
  } else if (headerBranchId) {
    // If user has access to ALL (empty array) or the specific branch is in their list
    const hasAccess = req.auth.branchIds.length === 0 || req.auth.branchIds.includes(headerBranchId);
    if (hasAccess) {
      activeBranchId = headerBranchId;
    }
  }

  // If user is OPERATOR but no active branch is determined, they can't do most things
  // EXCEPT listing branches to select one
  const isBranchList = req.method === 'GET' && (req.originalUrl.startsWith('/api/branches') || req.path === '/branches');
  
  console.log(`[TenantContext] Path: ${req.path}, Role: ${req.auth.role}, IsBranchList: ${isBranchList}, TokenBranchIds: ${JSON.stringify(req.auth.branchIds)}`);

  if (!activeBranchId && req.auth.role === 'OPERATOR' && !isBranchList) {
    console.log('[TenantContext] Blocking OPERATOR request: No active branch determined');
    res.status(400).json({ 
      error: 'No active branch determined. Please select a branch.',
      code: 'NO_ACTIVE_BRANCH'
    });
    return;
  }

  const context = {
    tenantId: req.auth.tenantId,
    branchId: activeBranchId,
  };

  // Attach to request for easier access in controllers
  (req as any).branchId = activeBranchId;
  if (req.auth) {
    (req.auth as any).activeBranchId = activeBranchId;
  }

  /**
   * Every operation (DB, Use Case, Service) called within this next()
   * will have access to TenantContext.current()
   */
  TenantContext.run(context, () => {
    next();
  });
}
