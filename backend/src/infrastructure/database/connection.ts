import mongoose from 'mongoose';
import { logger } from '../config/logger.js';

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
