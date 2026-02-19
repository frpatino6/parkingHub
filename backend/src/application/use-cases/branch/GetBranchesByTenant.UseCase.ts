import { BranchRepository } from '../../../domain/ports/BranchRepository.Port.js';
import { Branch } from '../../../domain/entities/Branch.Entity.js';

export class GetBranchesByTenantUseCase {
  constructor(private readonly branchRepository: BranchRepository) {}

  async execute(tenantId: string): Promise<Branch[]> {
    return this.branchRepository.findByTenantId(tenantId);
  }
}
