import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';
import { CashCut } from '../../../domain/entities/CashCut.Entity.js';
import { CashCutStatus } from '../../../domain/enums/cash-cut-status.enum.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';
import { CashCutModel, CashCutDoc } from '../models/cash-cut.model.js';
import { TenantContext } from '../../config/TenantContext.js';

export class MongoCashCutRepository implements CashCutRepository {
  async findById(id: string): Promise<CashCut | null> {
    const doc = await CashCutModel.findOne({ _id: id, tenantId: TenantContext.tenantId }).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findOpenByOperator(branchId: string, operatorId: string): Promise<CashCut | null> {
    const doc = await CashCutModel.findOne({
      tenantId: TenantContext.tenantId,
      branchId,
      operatorId,
      status: CashCutStatus.OPEN,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByBranch(branchId: string, status?: CashCutStatus): Promise<CashCut[]> {
    const filter: Record<string, unknown> = {
      tenantId: TenantContext.tenantId,
      branchId,
    };
    if (status) filter['status'] = status;
    const docs = await CashCutModel.find(filter).sort({ openedAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async create(cashCut: CashCut): Promise<CashCut> {
    const doc = await CashCutModel.create({
      tenantId: cashCut.tenantId,
      branchId: cashCut.branchId,
      operatorId: cashCut.operatorId,
      status: cashCut.status,
      openedAt: cashCut.openedAt,
      totalSalesCOP: cashCut.totalSales.amount,
      totalCashCOP: cashCut.totalCash.amount,
      totalElectronicCOP: cashCut.totalElectronic.amount,
      totalManualCreditsCOP: cashCut.totalManualCredits.amount,
      totalManualDebitsCOP: cashCut.totalManualDebits.amount,
    });
    return this.toDomain(doc);
  }

  async update(cashCut: CashCut): Promise<CashCut> {
    const doc = await CashCutModel.findByIdAndUpdate(
      cashCut.id,
      {
        status: cashCut.status,
        closedAt: cashCut.closedAt,
        totalSalesCOP: cashCut.totalSales.amount,
        totalCashCOP: cashCut.totalCash.amount,
        totalElectronicCOP: cashCut.totalElectronic.amount,
        totalManualCreditsCOP: cashCut.totalManualCredits.amount,
        totalManualDebitsCOP: cashCut.totalManualDebits.amount,
        reportedCashCOP: cashCut.reportedCash?.amount,
        discrepancyCOP: cashCut.discrepancyCOP,
      },
      { new: true },
    );
    if (!doc) throw new Error(`CashCut ${cashCut.id} not found for update`);
    return this.toDomain(doc);
  }

  private toDomain(doc: CashCutDoc): CashCut {
    return new CashCut({
      id: doc.id as string,
      tenantId: doc.tenantId,
      branchId: doc.branchId,
      operatorId: doc.operatorId,
      status: doc.status,
      openedAt: doc.openedAt,
      closedAt: doc.closedAt,
      totalSales: new Money(doc.totalSalesCOP),
      totalCash: new Money(doc.totalCashCOP ?? 0), 
      totalElectronic: new Money(doc.totalElectronicCOP ?? 0),
      totalManualCredits: new Money(doc.totalManualCreditsCOP ?? 0),
      totalManualDebits: new Money(doc.totalManualDebitsCOP ?? 0),
      reportedCash: doc.reportedCashCOP !== undefined ? new Money(doc.reportedCashCOP) : undefined,
      discrepancyCOP: doc.discrepancyCOP,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
