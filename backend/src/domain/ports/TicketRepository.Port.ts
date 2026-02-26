import { Ticket } from '../entities/ticket.entity.js';
import { TicketStatus } from '../enums/ticket-status.enum.js';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByQrCode(qrCode: string): Promise<Ticket | null>;
  findActiveByPlate(branchId: string, plate: string): Promise<Ticket | null>;
  findByBranchAndStatus(branchId: string, status: TicketStatus): Promise<Ticket[]>;
  searchByPlate(branchId: string, plate: string): Promise<Ticket[]>;
  findPaginatedByBranch(branchId: string, page: number, limit: number): Promise<PaginatedResult<Ticket>>;
  findByBranchAndDateRange(branchId: string, from: Date, to: Date): Promise<Ticket[]>;
  create(ticket: Ticket): Promise<Ticket>;
  update(ticket: Ticket): Promise<Ticket>;
}

