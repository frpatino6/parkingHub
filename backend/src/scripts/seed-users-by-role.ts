/**
 * Seed script: creates one user per role (SUPER_ADMIN, PARKING_ADMIN, OPERATOR)
 * only if no user with that role exists.
 * Run: npx tsx src/scripts/seed-users-by-role.ts
 */
import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { TenantModel } from '../infrastructure/database/models/tenant.model.js';
import { BranchModel } from '../infrastructure/database/models/branch.model.js';
import { UserModel } from '../infrastructure/database/models/user.model.js';
import { UserRole } from '../domain/enums/user-role.enum.js';
import { config } from '../infrastructure/config/env.js';

const DEFAULT_PASSWORD = 'Password123!';

const ROLE_CONFIG: Record<
  UserRole,
  { email: string; name: string }
> = {
  [UserRole.SUPER_ADMIN]: { email: 'superadmin@parkinghub.local', name: 'Super Administrador' },
  [UserRole.PARKING_ADMIN]: { email: 'parkingadmin@parkinghub.local', name: 'Administrador' },
  [UserRole.OPERATOR]: { email: 'operador@parkinghub.local', name: 'Operador' },
};

interface CreatedUser {
  email: string;
  name: string;
  role: string;
  status: 'created';
}

async function seedUsersByRole(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI);

  const created: CreatedUser[] = [];
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Get or create tenant and branch
  let tenant = await TenantModel.findOne({});
  if (!tenant) {
    tenant = await TenantModel.create({ name: 'ParkingHub Demo', nit: '900123456-1', active: true });
    console.log('Tenant created:', tenant.name);
  }

  let branch = await BranchModel.findOne({ tenantId: tenant._id.toString() });
  if (!branch) {
    branch = await BranchModel.create({
      tenantId: tenant._id.toString(),
      name: 'Sede Principal',
      address: 'Calle 1 #2-3',
      active: true,
    });
    console.log('Branch created:', branch.name);
  }

  const tenantId = tenant._id.toString();
  const branchId = branch._id.toString();

  for (const role of Object.values(UserRole)) {
    const existing = await UserModel.findOne({ role });
    if (existing) {
      console.log(`Role ${role}: user already exists (${existing.email}), skipping`);
      continue;
    }

    const { email, name } = ROLE_CONFIG[role];

    // OPERATOR requires branchId
    const userData: Record<string, unknown> = {
      tenantId,
      name,
      email,
      passwordHash,
      role,
      active: true,
    };
    if (role === UserRole.OPERATOR) {
      userData.branchId = branchId;
    } else {
      userData.branchId = branchId; // PARKING_ADMIN and SUPER_ADMIN can have it too
    }

    await UserModel.create(userData);
    created.push({ email, name, role, status: 'created' });
    console.log(`Created user: ${email} (${role})`);
  }

  await mongoose.disconnect();

  // Print table
  if (created.length > 0) {
    console.log('\n--- Usuarios creados ---');
    console.table(created);
    console.log('Contraseña por defecto:', DEFAULT_PASSWORD);
  } else {
    console.log('\nNo se crearon usuarios nuevos; ya existía al menos uno por cada rol.');
  }

  process.exit(0);
}

seedUsersByRole().catch((err) => {
  console.error(err);
  process.exit(1);
});
