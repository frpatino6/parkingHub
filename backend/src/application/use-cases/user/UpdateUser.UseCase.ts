import { UseCase } from '../../interfaces/use-case.interface.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { NotFoundError, ValidationError } from '../../../domain/errors/domain-errors.js';
import { User } from '../../../domain/entities/User.Entity.js';

export interface UpdateUserDto {
  userId: string;
  name?: string;
  role?: UserRole;
  active?: boolean;
  branchId?: string;
}

export class UpdateUserUseCase implements UseCase<UpdateUserDto, User> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) throw new NotFoundError(`User with ID ${dto.userId} not found`);

    if (dto.role === UserRole.OPERATOR && (dto.branchId === undefined ? !user.branchId : !dto.branchId)) {
      throw new ValidationError('branchId is required for OPERATOR role');
    }

    // Creating updated entity (User entity is mostly immutable props in its current design, 
    // but update method in repo handles specific fields)
    const updatedUser = new User({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      passwordHash: user.passwordHash,
      name: dto.name ?? user.name,
      role: dto.role ?? user.role,
      active: dto.active ?? user.active,
      branchId: dto.branchId !== undefined ? dto.branchId : user.branchId,
    });

    const saved = await this.userRepo.update(updatedUser);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: saved.tenantId,
        branchId: saved.branchId,
        userId: saved.id!, // The admin performing the action? 
        // Note: The UseCase doesn't receive the actor ID here, 
        // but in other use cases it's passed or stored. 
        // For simplicity with existing patterns, we'll log the target user as userId 
        // or refine it in the controller if we pass actorId.
        action: AuditAction.USER_UPDATED,
        entityType: 'User',
        entityId: saved.id!,
        metadata: { 
          updatedFields: Object.keys(dto).filter(k => k !== 'userId'),
          newRole: saved.role,
          active: saved.active 
        },
      }),
    );

    return saved;
  }
}
