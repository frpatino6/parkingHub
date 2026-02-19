import { UseCase } from '../../interfaces/use-case.interface.js';
import { OpenCashCutDto } from '../../dtos/open-cash-cut.dto.js';
import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { CashCut } from '../../../domain/entities/CashCut.Entity.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { ConflictError } from '../../../domain/errors/domain-errors.js';

export class OpenCashCutUseCase implements UseCase<OpenCashCutDto, CashCut> {
  constructor(
    private readonly cashCutRepo: CashCutRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: OpenCashCutDto): Promise<CashCut> {
    const existing = await this.cashCutRepo.findOpenByOperator(dto.branchId, dto.operatorId);
    if (existing) {
      throw new ConflictError('Operator already has an open cash cut for this branch');
    }

    const cashCut = CashCut.open({
      tenantId: dto.tenantId,
      branchId: dto.branchId,
      operatorId: dto.operatorId,
    });

    const saved = await this.cashCutRepo.create(cashCut);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: dto.operatorId,
        action: AuditAction.CASH_CUT_OPENED,
        entityType: 'CashCut',
        entityId: saved.id!,
      }),
    );

    return saved;
  }
}
