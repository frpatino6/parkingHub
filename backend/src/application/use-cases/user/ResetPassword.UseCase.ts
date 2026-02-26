import { UseCase } from '../../interfaces/use-case.interface.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { HashingService } from '../../ports/hashing.service.port.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { NotFoundError } from '../../../domain/errors/domain-errors.js';
import { User } from '../../../domain/entities/user.entity.js';

export interface ResetPasswordDto {
  userId: string;
  newPassword: string;
}

export class ResetPasswordUseCase implements UseCase<ResetPasswordDto, User> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditLogRepo: AuditLogRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<User> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) throw new NotFoundError('User', dto.userId);

    const passwordHash = await this.hashingService.hash(dto.newPassword);

    const updatedUser = new User({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      passwordHash,
      name: user.name,
      role: user.role,
      active: user.active,
      branchIds: user.branchIds,
    });

    const saved = await this.userRepo.update(updatedUser);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: saved.tenantId,
        branchIds: saved.branchIds,
        userId: saved.id!,
        action: AuditAction.USER_PASSWORD_RESET,
        entityType: 'User',
        entityId: saved.id!,
      }),
    );

    return saved;
  }
}


