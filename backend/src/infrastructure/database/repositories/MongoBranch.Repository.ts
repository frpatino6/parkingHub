import { BranchRepository } from '../../../domain/ports/BranchRepository.Port.js';
import { Branch } from '../../../domain/entities/Branch.Entity.js';
import { BranchModel, BranchDoc } from '../models/branch.model.js';
import { TenantContext } from '../../config/TenantContext.js';

export class MongoBranchRepository implements BranchRepository {
  async findById(id: string): Promise<Branch | null> {
    const doc = await BranchModel.findOne({ _id: id, tenantId: TenantContext.tenantId }).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findByTenantId(tenantId?: string): Promise<Branch[]> {
    const finalTenantId = tenantId ?? TenantContext.tenantId;
    const docs = await BranchModel.find({ tenantId: finalTenantId });
    return docs.map((d) => this.toDomain(d));
  }

  async create(branch: Branch): Promise<Branch> {
    const doc = await BranchModel.create({
      tenantId: branch.tenantId,
      name: branch.name,
      address: branch.address,
      active: branch.active,
    });
    return this.toDomain(doc);
  }

  async update(branch: Branch): Promise<Branch> {
    const doc = await BranchModel.findByIdAndUpdate(
      branch.id,
      { name: branch.name, address: branch.address, active: branch.active },
      { new: true },
    );
    if (!doc) throw new Error(`Branch ${branch.id} not found for update`);
    return this.toDomain(doc);
  }

  private toDomain(doc: BranchDoc): Branch {
    return new Branch({
      id: doc.id as string,
      tenantId: doc.tenantId,
      name: doc.name,
      address: doc.address,
      active: doc.active,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
