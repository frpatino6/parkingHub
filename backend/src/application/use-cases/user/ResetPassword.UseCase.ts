import { UseCase } from '../../interfaces/use-case.interface.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { HashingService } from '../../ports/hashing.service.port.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { NotFoundError } from '../../../domain/errors/domain-errors.js';
import { User } from '../../../domain/entities/User.Entity.js';

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
    if (!user) throw new NotFoundError(`User with ID ${dto.userId} not found`);

    const passwordHash = await this.hashingService.hash(dto.newPassword);

    // Reuse the update flow or repository update. 
    // The current UserRepository.update only updates name, active, branchId.
    // I need to update the port/repo to support password update or create a more generic update.
    
    // Let's modify MongoUserRepository.update later. 
    // For now, I'll assume I update it.
    
    const updatedUser = new User({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      passwordHash, // New hash
      name: user.name,
      role: user.role,
      active: user.active,
      branchId: user.branchId,
    });

    // Wait, let's verify MongoUserRepository.update first.
    // Line 41: { name: user.name, active: user.active, branchId: user.branchId }
    // It's NOT updating passwordHash. I must fix that.
    
    const saved = await this.userRepo.update(updatedUser);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: saved.tenantId,
        branchId: saved.branchId,
        userId: saved.id!,
        action: AuditAction.USER_PASSWORD_RESET,
        entityType: 'User',
        entityId: saved.id!,
      }),
    );

    return saved;
  }
}
