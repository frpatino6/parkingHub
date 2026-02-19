import 'dotenv/config';
import mongoose from 'mongoose';
import { UserModel } from '../infrastructure/database/models/user.model.js';
import { config } from '../infrastructure/config/env.js';
import { UserRole } from '../domain/enums/user-role.enum.js';

async function fixRoles() {
  await mongoose.connect(config.MONGODB_URI);
  console.log('Connected to DB');

  // Fix "OPERADOR" -> "OPERATOR"
  const operatorResult = await UserModel.updateMany(
    { role: 'OPERADOR' },
    { $set: { role: UserRole.OPERATOR } }
  );
  console.log(`Updated ${operatorResult.modifiedCount} users from 'OPERADOR' to '${UserRole.OPERATOR}'`);

  // Fix "ADMINISTRADOR" -> "PARKING_ADMIN" (just in case)
  const adminResult = await UserModel.updateMany(
    { role: 'ADMINISTRADOR' },
    { $set: { role: UserRole.PARKING_ADMIN } }
  );
  console.log(`Updated ${adminResult.modifiedCount} users from 'ADMINISTRADOR' to '${UserRole.PARKING_ADMIN}'`);

  await mongoose.disconnect();
}

fixRoles().catch(console.error);
