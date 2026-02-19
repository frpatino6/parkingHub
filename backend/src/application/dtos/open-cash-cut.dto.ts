export interface OpenCashCutDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  branchId: string;
  operatorId: string;
}
