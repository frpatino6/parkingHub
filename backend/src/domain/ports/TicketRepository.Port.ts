import { Ticket } from '../entities/Ticket.Entity.js';
import { TicketStatus } from '../enums/ticket-status.enum.js';

export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByQrCode(qrCode: string): Promise<Ticket | null>;
  findActiveByPlate(branchId: string, plate: string): Promise<Ticket | null>;
  findByBranchAndStatus(branchId: string, status: TicketStatus): Promise<Ticket[]>;
  searchByPlate(branchId: string, plate: string): Promise<Ticket[]>;
  create(ticket: Ticket): Promise<Ticket>;
  update(ticket: Ticket): Promise<Ticket>;
}
