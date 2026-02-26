import 'dotenv/config';
import mongoose from 'mongoose';
import { PricingConfigModel } from '../infrastructure/database/models/pricing-config.model.js';

async function migrateDayMaxZeroToNull(): Promise<void> {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected.');

  const result = await PricingConfigModel.updateMany(
    { dayMaxRateCOP: 0 },
    { $unset: { dayMaxRateCOP: 1 } }
  );

  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
  console.log('Done.');
}

migrateDayMaxZeroToNull().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
