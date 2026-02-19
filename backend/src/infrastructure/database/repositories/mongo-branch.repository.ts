import { BranchRepository } from '../../../domain/ports/branch.repository.port.js';
import { Branch } from '../../../domain/entities/branch.entity.js';
import { BranchModel, BranchDoc } from '../models/branch.model.js';

export class MongoBranchRepository implements BranchRepository {
  async findById(id: string): Promise<Branch | null> {
    const doc = await BranchModel.findById(id).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findByTenantId(tenantId: string): Promise<Branch[]> {
    const docs = await BranchModel.find({ tenantId });
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
