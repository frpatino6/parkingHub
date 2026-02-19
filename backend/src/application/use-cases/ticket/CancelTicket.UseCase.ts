import { UseCase } from '../../interfaces/use-case.interface.js';
import { CancelTicketDto } from '../../dtos/cancel-ticket.dto.js';
import { TicketRepository } from '../../../domain/ports/TicketRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { Ticket } from '../../../domain/entities/Ticket.Entity.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/domain-errors.js';

export class CancelTicketUseCase implements UseCase<CancelTicketDto, Ticket> {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: CancelTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepo.findById(dto.ticketId);
    if (!ticket) throw new NotFoundError('Ticket', dto.ticketId);

    if (ticket.tenantId !== dto.tenantId || ticket.branchId !== dto.branchId) {
      throw new ForbiddenError('Ticket does not belong to this branch');
    }

    ticket.cancel();
    const saved = await this.ticketRepo.update(ticket);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: dto.operatorId,
        action: AuditAction.TICKET_CANCELLED,
        entityType: 'Ticket',
        entityId: saved.id!,
        metadata: { reason: dto.reason },
      }),
    );

    return saved;
  }
}
