import { Tenant } from '../entities/Tenant.Entity.js';

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByNit(nit: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  create(tenant: Tenant): Promise<Tenant>;
  update(tenant: Tenant): Promise<Tenant>;
}
