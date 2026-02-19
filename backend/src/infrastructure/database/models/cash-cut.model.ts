import { Schema, model, HydratedDocument } from 'mongoose';
import { CashCutStatus } from '../../../domain/enums/cash-cut-status.enum.js';

interface ICashCutDoc {
  tenantId: string;
  branchId: string;
  operatorId: string;
  status: CashCutStatus;
  openedAt: Date;
  closedAt?: Date;
  /** Running total of PAID ticket amounts (integer COP) */
  totalSalesCOP: number;
  /** Cash reported by operator at close (integer COP) */
  reportedCashCOP?: number;
  /** Signed: reportedCash - totalSales; positive = surplus, negative = deficit */
  discrepancyCOP?: number;
  createdAt: Date;
  updatedAt: Date;
}

const cashCutSchema = new Schema<ICashCutDoc>(
  {
    tenantId: { type: String, required: true },
    branchId: { type: String, required: true },
    operatorId: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(CashCutStatus),
      required: true,
      default: CashCutStatus.OPEN,
    },
    openedAt: { type: Date, required: true },
    closedAt: { type: Date },
    totalSalesCOP: { type: Number, required: true, default: 0 },
    reportedCashCOP: { type: Number },
    discrepancyCOP: { type: Number },
  },
  { timestamps: true },
);

// ESR: find OPEN cut for a specific operator at a branch
cashCutSchema.index({ branchId: 1, operatorId: 1, status: 1 });

export type CashCutDoc = HydratedDocument<ICashCutDoc>;
export const CashCutModel = model<ICashCutDoc>('CashCut', cashCutSchema);
