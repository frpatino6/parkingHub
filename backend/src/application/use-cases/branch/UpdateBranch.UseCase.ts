import { UpdateBranchDto } from '../../dtos/update-branch.dto.js';
import { BranchRepository } from '../../../domain/ports/BranchRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { NotFoundError } from '../../../domain/errors/domain-errors.js';
import { Branch } from '../../../domain/entities/branch.entity.js';

export class UpdateBranchUseCase {
  constructor(
    private readonly branchRepo: BranchRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.branchRepo.findById(dto.branchId);
    if (!branch) throw new NotFoundError('Branch', dto.branchId);

    const updated = branch.update({
      name: dto.name,
      address: dto.address,
      active: dto.active,
      totalSpots: dto.totalSpots,
    });

    const saved = await this.branchRepo.update(updated);

    const action = dto.active === false
      ? AuditAction.BRANCH_DEACTIVATED
      : AuditAction.BRANCH_UPDATED;

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: saved.id,
        userId: dto.updatedBy,
        action,
        entityType: 'Branch',
        entityId: saved.id!,
        metadata: { name: saved.name, address: saved.address, active: saved.active },
      }),
    );

    return saved;
  }
}
