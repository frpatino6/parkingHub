import { randomUUID } from 'crypto';
import { UseCase } from '../../interfaces/use-case.interface.js';
import { CheckInDto, CheckInResult } from '../../dtos/check-in.dto.js';
import { TicketRepository } from '../../../domain/ports/ticket.repository.port.js';
import { AuditLogRepository } from '../../../domain/ports/audit-log.repository.port.js';
import { QrCodeService } from '../../ports/qr-code.service.port.js';
import { Ticket } from '../../../domain/entities/ticket.entity.js';
import { AuditLog } from '../../../domain/entities/audit-log.entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';

export class CheckInUseCase implements UseCase<CheckInDto, CheckInResult> {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly auditLogRepo: AuditLogRepository,
    private readonly qrCodeService: QrCodeService,
  ) {}

  async execute(dto: CheckInDto): Promise<CheckInResult> {
    const qrCode = randomUUID();

    const ticket = Ticket.createNew({
      tenantId: dto.tenantId,
      branchId: dto.branchId,
      operatorId: dto.operatorId,
      vehicleType: dto.vehicleType,
      plate: dto.plate.toUpperCase().trim(),
      qrCode,
    });

    const saved = await this.ticketRepo.create(ticket);

    const qrImageDataUrl = await this.qrCodeService.generateImage(qrCode);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: dto.operatorId,
        action: AuditAction.TICKET_CREATED,
        entityType: 'Ticket',
        entityId: saved.id!,
        metadata: { plate: saved.plate, vehicleType: saved.vehicleType },
      }),
    );

    return {
      ticketId: saved.id!,
      qrCode: saved.qrCode,
      qrImageDataUrl,
      plate: saved.plate,
      vehicleType: saved.vehicleType,
      checkIn: saved.checkIn,
    };
  }
}
