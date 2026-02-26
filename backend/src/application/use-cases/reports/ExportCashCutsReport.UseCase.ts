import { ExportReportDto, ExportReportResult } from '../../dtos/export-report.dto.js';
import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';

export class ExportCashCutsReportUseCase {
  constructor(private readonly cashCutRepo: CashCutRepository) {}

  async execute(dto: ExportReportDto): Promise<ExportReportResult> {
    const cuts = await this.cashCutRepo.findByBranchAndDateRange(dto.branchId, dto.from, dto.to);

    const rows = [
      ['ID', 'Operador', 'Estado', 'Apertura', 'Cierre', 'Total Ventas COP', 'Efectivo COP', 'Datáfono COP', 'Efectivo Reportado COP', 'Discrepancia COP'],
      ...cuts.map((c) => [
        c.id ?? '',
        c.operatorId,
        c.status,
        c.openedAt.toISOString(),
        c.closedAt?.toISOString() ?? '',
        String(c.totalSales.amount),
        String(c.totalCash.amount),
        String(c.totalElectronic.amount),
        String(c.reportedCash?.amount ?? ''),
        String(c.discrepancyCOP ?? ''),
      ]),
    ];

    const csv = rows.map((r) => r.map(escapeCell).join(',')).join('\n');
    const date = dto.from.toISOString().slice(0, 10);

    return {
      buffer: Buffer.from(csv, 'utf-8'),
      contentType: 'text/csv; charset=utf-8',
      filename: `cash_cuts_${date}.csv`,
    };
  }
}

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
