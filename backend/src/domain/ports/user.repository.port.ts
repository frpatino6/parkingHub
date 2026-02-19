import { User } from '../entities/user.entity.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenantId: string): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
