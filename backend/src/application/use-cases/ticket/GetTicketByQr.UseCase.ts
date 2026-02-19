import { UseCase } from '../../interfaces/use-case.interface.js';
import { TicketRepository } from '../../../domain/ports/TicketRepository.Port.js';
import { PricingConfigRepository } from '../../../domain/ports/PricingConfigRepository.Port.js';
import { PricingEngineService } from '../../services/pricing-engine.service.js';
import { Ticket } from '../../../domain/entities/Ticket.Entity.js';
import { NotFoundError, ForbiddenError, DomainError } from '../../../domain/errors/domain-errors.js';

export interface GetTicketByQrDto {
  tenantId: string;
  branchId: string;
  qrCode: string;
}

export interface TicketInfoResponse {
  id: string;
  plate: string;
  vehicleType: string;
  status: string;
  checkIn: Date;
  durationMinutes: number;
  currentAmountCOP: number;
  qrCode: string;
}

export class GetTicketByQrUseCase implements UseCase<GetTicketByQrDto, TicketInfoResponse> {
  constructor(
    private readonly ticketRepo: TicketRepository,
    private readonly pricingConfigRepo: PricingConfigRepository,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  async execute(dto: GetTicketByQrDto): Promise<TicketInfoResponse> {
    let ticket = await this.ticketRepo.findByQrCode(dto.qrCode);

    // Fallback: search by plate if not found by QR (useful for manual entry)
    if (!ticket) {
      ticket = await this.ticketRepo.findActiveByPlate(dto.branchId, dto.qrCode);
    }

    if (!ticket) {
      throw new NotFoundError('Ticket', dto.qrCode);
    }

    if (ticket.tenantId !== dto.tenantId || ticket.branchId !== dto.branchId) {
      throw new ForbiddenError('Ticket does not belong to this branch');
    }

    const config = await this.pricingConfigRepo.findActive(ticket.branchId, ticket.vehicleType);
    if (!config) {
      throw new DomainError(
        `No hay una tarifa de precios configurada para '${ticket.vehicleType}' en esta sede. Contacte con el administrador del sistema.`
      );
    }

    const durationMinutes = ticket.getDurationMinutes();
    const amount = this.pricingEngine.calculate(config, durationMinutes);

    return {
      id: ticket.id!,
      plate: ticket.plate,
      vehicleType: ticket.vehicleType,
      status: ticket.status,
      checkIn: ticket.checkIn,
      durationMinutes,
      currentAmountCOP: amount.amount,
      qrCode: ticket.qrCode,
    };
  }
}
