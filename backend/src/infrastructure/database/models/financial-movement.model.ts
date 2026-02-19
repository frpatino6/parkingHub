import { Schema, model, HydratedDocument } from 'mongoose';
import { FinancialMovementType, FinancialMovementCategory } from '../../../domain/entities/FinancialMovement.Entity.js';

interface IFinancialMovementDoc {
  tenantId: string;
  branchId: string;
  cashCutId: string;
  operatorId: string;
  type: FinancialMovementType;
  category: FinancialMovementCategory;
  description: string;
  amountCOP: number;
  createdAt: Date;
  updatedAt: Date;
}

const financialMovementSchema = new Schema<IFinancialMovementDoc>(
  {
    tenantId: { type: String, required: true },
    branchId: { type: String, required: true },
    cashCutId: { type: String, required: true },
    operatorId: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(FinancialMovementType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(FinancialMovementCategory),
      required: true,
    },
    description: { type: String, required: true },
    amountCOP: { type: Number, required: true },
  },
  { timestamps: true },
);

// ESR: find movements for a specific cash cut
financialMovementSchema.index({ cashCutId: 1, createdAt: 1 });
financialMovementSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });

export type FinancialMovementDoc = HydratedDocument<IFinancialMovementDoc>;
export const FinancialMovementModel = model<IFinancialMovementDoc>('FinancialMovement', financialMovementSchema);
