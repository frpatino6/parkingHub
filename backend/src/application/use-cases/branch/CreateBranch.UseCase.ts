import { UseCase } from '../../interfaces/use-case.interface.js';
import { CreateBranchDto } from '../../dtos/create-branch.dto.js';
import { BranchRepository } from '../../../domain/ports/branch.repository.port.js';
import { AuditLogRepository } from '../../../domain/ports/audit-log.repository.port.js';
import { Branch } from '../../../domain/entities/branch.entity.js';
import { AuditLog } from '../../../domain/entities/audit-log.entity.js';
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
