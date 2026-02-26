import { TicketRepository, PaginatedResult } from '../../../domain/ports/TicketRepository.Port.js';
import { Ticket } from '../../../domain/entities/Ticket.Entity.js';

export interface GetTicketsPaginatedInput {
  branchId: string;
  page: number;
  limit: number;
}

export class GetTicketsPaginatedUseCase {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async execute(input: GetTicketsPaginatedInput): Promise<PaginatedResult<Ticket>> {
    return this.ticketRepo.findPaginatedByBranch(input.branchId, input.page, input.limit);
  }
}
