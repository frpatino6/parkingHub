import { GetAuditLogsDto, PaginatedAuditLogs } from '../../dtos/get-audit-logs.dto.js';
import { AuditLogRepository } from '../../../domain/ports/AuditLogRepository.Port.js';
import { UserRepository } from '../../../domain/ports/UserRepository.Port.js';
import { ValidationError } from '../../../domain/errors/domain-errors.js';

export class GetAuditLogsUseCase {
  constructor(
    private readonly auditLogRepo: AuditLogRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(dto: GetAuditLogsDto): Promise<PaginatedAuditLogs> {
    const startDate = this.parseDateBoundary(dto.startDate, 'start');
    const endDate = this.parseDateBoundary(dto.endDate, 'end');
    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError('startDate cannot be greater than endDate');
    }

    const result = await this.auditLogRepo.findPaginated(dto.tenantId, dto.page, dto.limit, {
      actions: dto.actions,
      entityType: dto.entityType,
      userId: dto.userId,
      startDate,
      endDate,
    });

    const uniqueUserIds = [...new Set(result.items.map((log) => log.userId))];
    const userMap = new Map<string, string>();
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const user = await this.userRepo.findById(userId);
        if (user) userMap.set(userId, user.name);
      }),
    );

    return {
      items: result.items.map((log) => ({
        id: log.id!,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.userId,
        userName: userMap.get(log.userId),
        branchId: log.branchId,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      total: result.total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  private parseDateBoundary(value: string | undefined, boundary: 'start' | 'end'): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new ValidationError(`Invalid ${boundary === 'start' ? 'startDate' : 'endDate'} format`);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      if (boundary === 'start') parsed.setHours(0, 0, 0, 0);
      else parsed.setHours(23, 59, 59, 999);
    }

    return parsed;
  }
}
