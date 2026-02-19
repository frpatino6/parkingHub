import { UseCase } from '../../interfaces/use-case.interface.js';
import { CheckOutDto } from '../../dtos/check-out.dto.js';
import { TicketRepository } from '../../../domain/ports/TicketRepository.Port.js';
import { PricingConfigRepository } from '../../../domain/ports/PricingConfigRepository.Port.js';
import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { PricingEngineService } from '../../services/pricing-engine.service.js';
import { Ticket } from '../../../domain/entities/Ticket.Entity.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/domain-errors.js';

export class CheckOutUseCase implements UseCase<CheckOutDto, Ticket> {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly pricingConfigRepo: PricingConfigRepository,
    private readonly cashCutRepo: CashCutRepository,
    private readonly auditLogRepo: AuditLogRepository,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  async execute(dto: CheckOutDto): Promise<Ticket> {
    const ticket = await this.ticketRepo.findByQrCode(dto.qrCode);
    if (!ticket) throw new NotFoundError('Ticket', dto.qrCode);

    if (ticket.tenantId !== dto.tenantId || ticket.branchId !== dto.branchId) {
      throw new ForbiddenError('Ticket does not belong to this branch');
    }

    const config = await this.pricingConfigRepo.findActive(ticket.branchId, ticket.vehicleType);
    if (!config) {
      throw new NotFoundError('PricingConfig', `${ticket.branchId}/${ticket.vehicleType}`);
    }

    const durationMinutes = ticket.getDurationMinutes();
    const amount = this.pricingEngine.calculate(config, durationMinutes);

    ticket.checkout(amount, dto.paymentMethod);
    const saved = await this.ticketRepo.update(ticket);

    // Accumulate sale into the operator's open cash cut (best-effort)
    const cashCut = await this.cashCutRepo.findOpenByOperator(dto.branchId, dto.operatorId);
    if (cashCut) {
      cashCut.addSale(amount);
      await this.cashCutRepo.update(cashCut);
    }

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: dto.operatorId,
        action: AuditAction.TICKET_CHECKED_OUT,
        entityType: 'Ticket',
        entityId: saved.id!,
        metadata: {
          durationMinutes,
          amountCOP: amount.amount,
          paymentMethod: dto.paymentMethod,
        },
      }),
    );

    return saved;
  }
}
