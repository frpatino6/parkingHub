import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

export function createServer(apiRouter: Router): express.Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);
  app.use(errorHandler);

  return app;
}
