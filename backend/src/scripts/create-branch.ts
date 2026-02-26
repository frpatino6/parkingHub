/**
 * Creates a new branch for the first tenant in the DB.
 * Run: npx tsx src/scripts/create-branch.ts [name] [address]
 */
import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import mongoose from 'mongoose';
import { TenantModel } from '../infrastructure/database/models/tenant.model.js';
import { BranchModel } from '../infrastructure/database/models/branch.model.js';
import { config } from '../infrastructure/config/env.js';

const name = process.argv[2] ?? 'Sede Norte';
const address = process.argv[3] ?? 'Carrera 10 #20-30';

async function main() {
  await mongoose.connect(config.MONGODB_URI);

  const tenant = await TenantModel.findOne({}).lean();
  if (!tenant) {
    console.error('No tenant found. Run seed first.');
    process.exit(1);
  }

  const branch = await BranchModel.create({
    tenantId: tenant._id.toString(),
    name,
    address,
    active: true,
  });

  console.log('Branch created:', { id: branch._id.toString(), name: branch.name, address: branch.address, tenantId: branch.tenantId });
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
