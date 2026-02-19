import { UseCase } from '../../interfaces/use-case.interface.js';
import { CreateBranchDto } from '../../dtos/create-branch.dto.js';
import { BranchRepository } from '../../../domain/ports/BranchRepository.Port.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { Branch } from '../../../domain/entities/Branch.Entity.js';
import { AuditLog } from '../../../domain/entities/AuditLog.Entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';

export class CreateBranchUseCase implements UseCase<CreateBranchDto, Branch> {
  constructor(
    private readonly branchRepo: BranchRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: CreateBranchDto): Promise<Branch> {
    const branch = new Branch({
      tenantId: dto.tenantId,
      name: dto.name,
      address: dto.address,
      active: true,
    });

    const saved = await this.branchRepo.create(branch);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: saved.id,
        userId: dto.createdBy,
        action: AuditAction.BRANCH_CREATED,
        entityType: 'Branch',
        entityId: saved.id!,
        metadata: { name: saved.name, address: saved.address },
      }),
    );

    return saved;
  }
}
