/**
 * Seed script: creates initial Tenant, Branch, and Admin user.
 * Run: npm run seed
 */
import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { TenantModel } from '../infrastructure/database/models/tenant.model.js';
import { BranchModel } from '../infrastructure/database/models/branch.model.js';
import { UserModel } from '../infrastructure/database/models/user.model.js';
import { PricingConfigModel } from '../infrastructure/database/models/pricing-config.model.js';
import { UserRole } from '../domain/enums/user-role.enum.js';
import { VehicleType } from '../domain/enums/vehicle-type.enum.js';
import { PricingMode } from '../domain/enums/pricing-mode.enum.js';
import { config } from '../infrastructure/config/env.js';

const ADMIN_EMAIL = 'admin@parkinghub.local';
const ADMIN_PASSWORD = 'Admin123!';

async function seed(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI);

  const exists = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (exists && !process.argv.includes('--force')) {
    console.log('Admin user already exists. Run with --force to recreate.');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }
  if (exists) {
    console.log('Force mode: cleaning existing seed data...');
    const oldTenant = await TenantModel.findOne({ nit: '900123456-1' });
    if (oldTenant) {
      await PricingConfigModel.deleteMany({ tenantId: oldTenant._id.toString() });
      await BranchModel.deleteMany({ tenantId: oldTenant._id.toString() });
      await oldTenant.deleteOne();
    }
    await UserModel.deleteOne({ email: ADMIN_EMAIL });
  }

  const tenant = await TenantModel.create(
    { name: 'ParkingHub Demo', nit: '900123456-1', active: true },
  );
  console.log('Tenant created:', tenant.name);

  const branch = await BranchModel.create(
    { tenantId: tenant._id.toString(), name: 'Sede Principal', address: 'Calle 1 #2-3', active: true },
  );
  console.log('Branch created:', branch.name);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await UserModel.create({
    tenantId: tenant._id.toString(),
    branchId: branch._id.toString(),
    name: 'Administrador',
    email: ADMIN_EMAIL,
    passwordHash,
    role: UserRole.PARKING_ADMIN,
    active: true,
  });
  console.log('Admin user created');

  const pricingConfigs = [
    { vehicleType: VehicleType.CAR, ratePerUnitCOP: 100, gracePeriodMinutes: 5, dayMaxRateCOP: 15000 },
    { vehicleType: VehicleType.MOTORCYCLE, ratePerUnitCOP: 50, gracePeriodMinutes: 5, dayMaxRateCOP: 8000 },
    { vehicleType: VehicleType.BICYCLE, ratePerUnitCOP: 30, gracePeriodMinutes: 10, dayMaxRateCOP: 5000 },
  ];

  for (const pc of pricingConfigs) {
    await PricingConfigModel.create({
      tenantId: tenant._id.toString(),
      branchId: branch._id.toString(),
      vehicleType: pc.vehicleType,
      mode: PricingMode.MINUTE,
      ratePerUnitCOP: pc.ratePerUnitCOP,
      gracePeriodMinutes: pc.gracePeriodMinutes,
      dayMaxRateCOP: pc.dayMaxRateCOP,
      active: true,
    });
    console.log(`PricingConfig created: ${pc.vehicleType} → $${pc.ratePerUnitCOP}/min`);
  }

  console.log('\nLogin credentials:');
  console.log('  Email:', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
