import { UseCase } from '../../interfaces/use-case.interface.js';
import { CreateUserDto } from '../../dtos/create-user.dto.js';
import { UserRepository } from '../../../domain/ports/user.repository.port.js';
import { AuditLogRepository } from '../../../domain/ports/audit-log.repository.port.js';
import { HashingService } from '../../ports/hashing.service.port.js';
import { User } from '../../../domain/entities/user.entity.js';
import { AuditLog } from '../../../domain/entities/audit-log.entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';
import { ConflictError, ValidationError } from '../../../domain/errors/domain-errors.js';

export class CreateUserUseCase implements UseCase<CreateUserDto, User> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditLogRepo: AuditLogRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    if (dto.role === UserRole.OPERATOR && !dto.branchId) {
      throw new ValidationError('branchId is required for OPERATOR role');
    }

    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictError(`Email '${dto.email}' is already in use`);

    const passwordHash = await this.hashingService.hash(dto.password);

    const user = new User({
      tenantId: dto.tenantId,
      name: dto.name,
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      role: dto.role,
      branchId: dto.branchId,
      active: true,
    });

    const saved = await this.userRepo.create(user);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: saved.id!,
        action: AuditAction.USER_CREATED,
        entityType: 'User',
        entityId: saved.id!,
        metadata: { email: saved.email, role: saved.role },
      }),
    );

    return saved;
  }
}
