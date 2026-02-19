import { Schema, model, HydratedDocument } from 'mongoose';

interface ITenantDoc {
  name: string;
  nit: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenantDoc>(
  {
    name: { type: String, required: true, trim: true },
    nit: { type: String, required: true, unique: true, trim: true },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export type TenantDoc = HydratedDocument<ITenantDoc>;
export const TenantModel = model<ITenantDoc>('Tenant', tenantSchema);
