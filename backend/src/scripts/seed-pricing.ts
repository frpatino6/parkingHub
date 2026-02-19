import 'dotenv/config';
import dns from 'node:dns';
// dns.setServers(['1.1.1.1', '8.8.8.8']);

import mongoose from 'mongoose';
import { BranchModel } from '../infrastructure/database/models/branch.model.js';
import { PricingConfigModel } from '../infrastructure/database/models/pricing-config.model.js';
import { VehicleType } from '../domain/enums/vehicle-type.enum.js';
import { PricingMode } from '../domain/enums/pricing-mode.enum.js';
import { config } from '../infrastructure/config/env.js';

async function seedPricing(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI);
  console.log('Connected to MongoDB');

  const branches = await BranchModel.find({});
  console.log(`Found ${branches.length} branches in database.`);
  if (branches.length === 0) {
    console.log('No branches found. Please run npm run seed first.');
    await mongoose.disconnect();
    process.exit(0);
  }

  for (const branch of branches) {
    console.log(`Seeding prices for branch: ${branch.name} (${branch._id})`);

    const defaultPrices = [
      {
        tenantId: branch.tenantId,
        branchId: branch._id.toString(),
        vehicleType: VehicleType.CAR,
        mode: PricingMode.MINUTE,
        ratePerUnitCOP: 100, // $100 per minute
        gracePeriodMinutes: 5,
        active: true,
      },
      {
        tenantId: branch.tenantId,
        branchId: branch._id.toString(),
        vehicleType: VehicleType.MOTORCYCLE,
        mode: PricingMode.MINUTE,
        ratePerUnitCOP: 50, // $50 per minute
        gracePeriodMinutes: 5,
        active: true,
      },
      {
        tenantId: branch.tenantId,
        branchId: branch._id.toString(),
        vehicleType: VehicleType.BICYCLE,
        mode: PricingMode.MINUTE,
        ratePerUnitCOP: 10, // $10 per minute
        gracePeriodMinutes: 10,
        active: true,
      },
    ];

    for (const price of defaultPrices) {
      await PricingConfigModel.findOneAndUpdate(
        { branchId: price.branchId, vehicleType: price.vehicleType },
        price,
        { upsert: true, new: true }
      );
      console.log(`  - Price for ${price.vehicleType} set to $${price.ratePerUnitCOP}/min`);
    }
  }

  console.log('Pricing seeding completed.');
  await mongoose.disconnect();
  process.exit(0);
}

seedPricing().catch((err) => {
  console.error(err);
  process.exit(1);
});
