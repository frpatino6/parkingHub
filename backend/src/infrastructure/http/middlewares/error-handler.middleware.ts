import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger.js';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  DomainError,
} from '../../../domain/errors/domain-errors.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // next is required by Express 4-param signature even if unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (res.headersSent) return;

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof ConflictError) {
    res.status(409).json({ error: err.message });
    return;
  }
  if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message });
    return;
  }
  if (err instanceof ForbiddenError) {
    res.status(403).json({ error: err.message });
    return;
  }
  if (err instanceof DomainError) {
    res.status(400).json({ error: err.message });
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
