import { UseCase } from '../../interfaces/use-case.interface.js';
import { CreateFinancialMovementDto } from '../../dtos/create-financial-movement.dto.js';
import { FinancialMovementRepository } from '../../../domain/ports/FinancialMovementRepository.Port.js';
import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { FinancialMovement, FinancialMovementType, FinancialMovementCategory } from '../../../domain/entities/FinancialMovement.Entity.js';
import { CashCut } from '../../../domain/entities/CashCut.Entity.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';
import { NotFoundError, ValidationError } from '../../../domain/errors/domain-errors.js';

export class CreateFinancialMovementUseCase implements UseCase<CreateFinancialMovementDto, FinancialMovement> {
  constructor(
    private readonly movementRepo: FinancialMovementRepository,
    private readonly cashCutRepo: CashCutRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: CreateFinancialMovementDto): Promise<FinancialMovement> {
    const cashCut = await this.cashCutRepo.findOpenByOperator(dto.branchId, dto.operatorId);
    if (!cashCut) {
      throw new ValidationError('No hay un turno (CashCut) abierto para registrar el movimiento');
    }

    const amount = new Money(dto.amount);
    
    // Create movement entity
    const movement = new FinancialMovement({
      tenantId: dto.tenantId,
      branchId: dto.branchId,
      cashCutId: cashCut.id!,
      operatorId: dto.operatorId,
      type: dto.type as FinancialMovementType,
      category: dto.category as FinancialMovementCategory,
      description: dto.description,
      amount,
    });

    // Update CashCut totals
    cashCut.addMovement(amount, dto.type);

    // Persist
    const savedMovement = await this.movementRepo.create(movement);
    await this.cashCutRepo.update(cashCut);

    // Audit log
    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: dto.operatorId,
        action: AuditAction.FINANCIAL_MOVEMENT_CREATED,
        entityType: 'FinancialMovement',
        entityId: savedMovement.id!,
        metadata: {
          type: dto.type,
          category: dto.category,
          amountCOP: dto.amount,
          cashCutId: cashCut.id,
        },
      }),
    );

    return savedMovement;
  }
}
