import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function createServer(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
