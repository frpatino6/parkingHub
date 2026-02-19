import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
import { connectDatabase } from './infrastructure/database/connection.js';
import { createServer } from './infrastructure/http/server.js';
import { logger } from './infrastructure/config/logger.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  const app = createServer();
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => logger.info({ port }, 'Server listening'));
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Bootstrap failed');
  process.exit(1);
});
