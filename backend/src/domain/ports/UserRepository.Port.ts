import { User } from '../entities/user.entity.js';
import { PaginatedResult } from './TicketRepository.Port.js';
export { PaginatedResult };

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenantId?: string): Promise<User[]>;
  findPaginatedByTenant(tenantId: string, page: number, limit: number): Promise<PaginatedResult<User>>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
}

