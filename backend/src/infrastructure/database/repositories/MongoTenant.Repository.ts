import { TenantRepository } from '../../../domain/ports/tenant.repository.port.js';
import { Tenant } from '../../../domain/entities/Tenant.Entity.js';
import { TenantModel, TenantDoc } from '../models/tenant.model.js';

export class MongoTenantRepository implements TenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const doc = await TenantModel.findById(id).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findByNit(nit: string): Promise<Tenant | null> {
    const doc = await TenantModel.findOne({ nit });
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const docs = await TenantModel.find();
    return docs.map((d) => this.toDomain(d));
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const doc = await TenantModel.create({
      name: tenant.name,
      nit: tenant.nit,
      active: tenant.active,
    });
    return this.toDomain(doc);
  }

  async update(tenant: Tenant): Promise<Tenant> {
    const doc = await TenantModel.findByIdAndUpdate(
      tenant.id,
      { name: tenant.name, active: tenant.active },
      { new: true },
    );
    if (!doc) throw new Error(`Tenant ${tenant.id} not found for update`);
    return this.toDomain(doc);
  }

  private toDomain(doc: TenantDoc): Tenant {
    return new Tenant({
      id: doc.id as string,
      name: doc.name,
      nit: doc.nit,
      active: doc.active,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
