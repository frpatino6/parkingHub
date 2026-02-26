import { ChangeOwnPasswordDto } from '../../dtos/change-own-password.dto.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { HashingService } from '../../ports/hashing.service.port.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { NotFoundError, ValidationError } from '../../../domain/errors/domain-errors.js';
import { User } from '../../../domain/entities/user.entity.js';

export class ChangeOwnPasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditLogRepo: AuditLogRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(dto: ChangeOwnPasswordDto): Promise<User> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) throw new NotFoundError('User', dto.userId);

    const valid = await this.hashingService.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new ValidationError('Current password is incorrect');

    const newHash = await this.hashingService.hash(dto.newPassword);
    const updated = user.withPasswordHash(newHash);
    const saved = await this.userRepo.update(updated);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchIds: saved.branchIds,
        userId: saved.id!,
        action: AuditAction.USER_PASSWORD_CHANGED,
        entityType: 'User',
        entityId: saved.id!,
      }),
    );

    return saved;
  }
}
