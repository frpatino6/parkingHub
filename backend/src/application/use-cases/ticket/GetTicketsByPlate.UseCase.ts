import { UseCase } from '../../interfaces/use-case.interface.js';
import { Ticket } from '../../../domain/entities/Ticket.Entity.js';
import { TicketRepository } from '../../../domain/ports/TicketRepository.Port.js';
import { TenantContext } from '../../../infrastructure/config/TenantContext.js';

export interface GetTicketsByPlateInput {
  plate: string;
}

export class GetTicketsByPlateUseCase implements UseCase<GetTicketsByPlateInput, Ticket[]> {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async execute(input: GetTicketsByPlateInput): Promise<Ticket[]> {
    const context = TenantContext.current();
    if (!context || !context.branchId) {
      throw new Error('Branch context is required to search tickets');
    }

    const plate = input.plate?.trim() || '';
    return this.ticketRepo.searchByPlate(context.branchId, plate);
  }
}
