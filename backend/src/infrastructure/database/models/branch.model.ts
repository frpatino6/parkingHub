import { Schema, model, HydratedDocument } from 'mongoose';

interface IBranchDoc {
  tenantId: string;
  name: string;
  address: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranchDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export type BranchDoc = HydratedDocument<IBranchDoc>;
export const BranchModel = model<IBranchDoc>('Branch', branchSchema);
