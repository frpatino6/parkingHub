import { Schema, model, HydratedDocument } from 'mongoose';
import { UserRole } from '../../../domain/enums/user-role.enum.js';

interface IUserDoc {
  tenantId: string;
  branchId?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export type UserDoc = HydratedDocument<IUserDoc>;
export const UserModel = model<IUserDoc>('User', userSchema);
