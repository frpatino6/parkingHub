export interface CloseCashCutDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  branchId: string;
  operatorId: string;
  /** Cash amount reported by the operator at close time (integer COP) */
  reportedCash: number;
}
