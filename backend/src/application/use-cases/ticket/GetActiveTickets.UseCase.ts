import { UseCase } from '../../interfaces/use-case.interface.js';
import { Ticket } from '../../../domain/entities/Ticket.Entity.js';
import { TicketRepository } from '../../../domain/ports/TicketRepository.Port.js';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum.js';
import { TenantContext } from '../../../infrastructure/config/TenantContext.js';

export class GetActiveTicketsUseCase implements UseCase<void, Ticket[]> {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async execute(): Promise<Ticket[]> {
    const context = TenantContext.current();
    if (!context || !context.branchId) {
      throw new Error('Branch context is required to fetch active tickets');
    }

    return this.ticketRepo.findByBranchAndStatus(context.branchId, TicketStatus.OPEN);
  }
}
