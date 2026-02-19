export interface CreateBranchDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  name: string;
  address: string;
}
