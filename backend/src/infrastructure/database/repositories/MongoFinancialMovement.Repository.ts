import { FinancialMovementRepository } from '../../../domain/ports/FinancialMovementRepository.Port.js';
import { FinancialMovement } from '../../../domain/entities/FinancialMovement.Entity.js';
import { FinancialMovementModel, FinancialMovementDoc } from '../models/financial-movement.model.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';
import { TenantContext } from '../../config/TenantContext.js';

export class MongoFinancialMovementRepository implements FinancialMovementRepository {
  async findById(id: string): Promise<FinancialMovement | null> {
    const doc = await FinancialMovementModel.findOne({ _id: id, tenantId: TenantContext.tenantId }).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findByCashCut(cashCutId: string): Promise<FinancialMovement[]> {
    const docs = await FinancialMovementModel.find({
      tenantId: TenantContext.tenantId,
      cashCutId,
    }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findByRange(branchId: string, start: Date, end: Date): Promise<FinancialMovement[]> {
    const docs = await FinancialMovementModel.find({
      tenantId: TenantContext.tenantId,
      branchId,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async create(movement: FinancialMovement): Promise<FinancialMovement> {
    const doc = await FinancialMovementModel.create({
      tenantId: movement.tenantId,
      branchId: movement.branchId,
      cashCutId: movement.cashCutId,
      operatorId: movement.operatorId,
      type: movement.type,
      category: movement.category,
      description: movement.description,
      amountCOP: movement.amount.amount,
    });
    return this.toDomain(doc);
  }

  private toDomain(doc: FinancialMovementDoc): FinancialMovement {
    return new FinancialMovement({
      id: doc.id as string,
      tenantId: doc.tenantId,
      branchId: doc.branchId,
      cashCutId: doc.cashCutId,
      operatorId: doc.operatorId,
      type: doc.type,
      category: doc.category,
      description: doc.description,
      amount: new Money(doc.amountCOP),
      createdAt: doc.createdAt,
    });
  }
}
