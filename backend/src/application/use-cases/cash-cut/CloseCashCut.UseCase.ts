import { UseCase } from '../../interfaces/use-case.interface.js';
import { CloseCashCutDto } from '../../dtos/close-cash-cut.dto.js';
import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { CashCut } from '../../../domain/entities/CashCut.Entity.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';
import { NotFoundError } from '../../../domain/errors/domain-errors.js';

export class CloseCashCutUseCase implements UseCase<CloseCashCutDto, CashCut> {
  constructor(
    private readonly cashCutRepo: CashCutRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: CloseCashCutDto): Promise<CashCut> {
    const cashCut = await this.cashCutRepo.findOpenByOperator(dto.branchId, dto.operatorId);
    if (!cashCut) {
      throw new NotFoundError('Open CashCut', `${dto.branchId}/${dto.operatorId}`);
    }

    const reportedCash = new Money(dto.reportedCash);
    cashCut.close(reportedCash);
    const saved = await this.cashCutRepo.update(cashCut);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: dto.operatorId,
        action: AuditAction.CASH_CUT_CLOSED,
        entityType: 'CashCut',
        entityId: saved.id!,
        metadata: {
          totalSalesCOP: saved.totalSales.amount,
          totalCashCOP: saved.totalCash.amount,
          totalElectronicCOP: saved.totalElectronic.amount,
          reportedCashCOP: reportedCash.amount,
          discrepancyCOP: saved.discrepancyCOP,
        },
      }),
    );

    return saved;
  }
}
