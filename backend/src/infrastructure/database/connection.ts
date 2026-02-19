import dns from 'node:dns';
import mongoose from 'mongoose';
import { logger } from '../config/logger.js';

/** Workaround for Node.js Windows bug: SRV lookup fails with ECONNREFUSED.
 *  Forces use of public DNS servers for mongodb+srv resolution. */
dns.setServers(['1.1.1.1', '8.8.8.8']);

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/parkinghub';
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.fatal({ err }, 'MongoDB connection failed');
    throw err;
  }
}
