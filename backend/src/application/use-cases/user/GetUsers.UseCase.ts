import { UseCase } from '../../interfaces/use-case.interface.js';
import { User } from '../../../domain/entities/User.Entity.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { TenantContext } from '../../../infrastructure/config/TenantContext.js';

export class GetUsersUseCase implements UseCase<void, User[]> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(): Promise<User[]> {
    const tenantId = TenantContext.tenantId;
    return this.userRepo.findByTenantId(tenantId);
  }
}
