import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { TenantContext } from '../../../infrastructure/config/TenantContext.js';

export interface GetUsersPaginatedInput {
  page: number;
  limit: number;
}

export class GetUsersPaginatedUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: GetUsersPaginatedInput) {
    const tenantId = TenantContext.tenantId;
    return this.userRepo.findPaginatedByTenant(tenantId, input.page, input.limit);
  }
}
