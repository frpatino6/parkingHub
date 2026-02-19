import 'dotenv/config';
import mongoose from 'mongoose';
import { BranchModel } from '../infrastructure/database/models/branch.model.js';
import { PricingConfigModel } from '../infrastructure/database/models/pricing-config.model.js';
import { VehicleType } from '../domain/enums/vehicle-type.enum.js';
import { PricingMode } from '../domain/enums/pricing-mode.enum.js';

async function fix() {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected.');

  const branches = await BranchModel.find({});
  if (branches.length === 0) {
    console.log('No branches found!');
    process.exit(1);
  }

  for (const branch of branches) {
    console.log(`Setting rates for branch: ${branch.name}`);
    
    const rates = [
      { vehicleType: VehicleType.CAR, rate: 100 },
      { vehicleType: VehicleType.MOTORCYCLE, rate: 50 },
      { vehicleType: VehicleType.BICYCLE, rate: 10 }
    ];

    for (const r of rates) {
      await PricingConfigModel.findOneAndUpdate(
        { branchId: branch._id.toString(), vehicleType: r.vehicleType },
        {
          tenantId: branch.tenantId,
          branchId: branch._id.toString(),
          vehicleType: r.vehicleType,
          mode: PricingMode.MINUTE,
          ratePerUnitCOP: r.rate,
          gracePeriodMinutes: 5,
          active: true
        },
        { upsert: true }
      );
      console.log(`  - ${r.vehicleType}: $${r.rate}/min`);
    }
  }

  console.log('FIX COMPLETED');
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
