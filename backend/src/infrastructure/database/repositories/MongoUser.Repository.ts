import { UserRepository } from '../../../domain/ports/user.repository.port.js';
import { User } from '../../../domain/entities/user.entity.js';
import { UserModel, UserDoc } from '../models/user.model.js';

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    return doc ? this.toDomain(doc) : null;
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    const docs = await UserModel.find({ tenantId });
    return docs.map((d) => this.toDomain(d));
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      tenantId: user.tenantId,
      branchId: user.branchId,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      active: user.active,
    });
    return this.toDomain(doc);
  }

  async update(user: User): Promise<User> {
    const doc = await UserModel.findByIdAndUpdate(
      user.id,
      { name: user.name, active: user.active, branchId: user.branchId },
      { new: true },
    );
    if (!doc) throw new Error(`User ${user.id} not found for update`);
    return this.toDomain(doc);
  }

  private toDomain(doc: UserDoc): User {
    return new User({
      id: doc.id as string,
      tenantId: doc.tenantId,
      branchId: doc.branchId,
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      active: doc.active,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
