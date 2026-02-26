import { ExportReportDto, ExportReportResult } from '../../dtos/export-report.dto.js';
import { TicketRepository } from '../../../domain/ports/TicketRepository.Port.js';

export class ExportTicketsReportUseCase {
  constructor(private readonly ticketRepo: TicketRepository) {}

  async execute(dto: ExportReportDto): Promise<ExportReportResult> {
    const tickets = await this.ticketRepo.findByBranchAndDateRange(dto.branchId, dto.from, dto.to);

    const rows = [
      ['ID', 'Placa', 'Tipo Vehículo', 'Estado', 'Entrada', 'Salida', 'Duración (min)', 'Monto COP', 'Método Pago'],
      ...tickets.map((t) => [
        t.id ?? '',
        t.plate,
        t.vehicleType,
        t.status,
        t.checkIn.toISOString(),
        t.checkOut?.toISOString() ?? '',
        String(t.getDurationMinutes()),
        String(t.amount?.amount ?? ''),
        t.paymentMethod ?? '',
      ]),
    ];

    const csv = rows.map((r) => r.map(escapeCell).join(',')).join('\n');
    const date = dto.from.toISOString().slice(0, 10);

    return {
      buffer: Buffer.from(csv, 'utf-8'),
      contentType: 'text/csv; charset=utf-8',
      filename: `tickets_${date}.csv`,
    };
  }
}

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
