export interface ExportReportDto {
  branchId: string;
  tenantId: string;
  from: Date;
  to: Date;
  format: 'csv';
}

export interface ExportReportResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}
