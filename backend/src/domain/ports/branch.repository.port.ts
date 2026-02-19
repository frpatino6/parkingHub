import { Branch } from '../entities/branch.entity.js';

export interface BranchRepository {
  findById(id: string): Promise<Branch | null>;
  findByTenantId(tenantId: string): Promise<Branch[]>;
  create(branch: Branch): Promise<Branch>;
  update(branch: Branch): Promise<Branch>;
}
