export interface CreateBranchDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  /** userId of the admin performing the action — from JWT */
  createdBy: string;
  name: string;
  address: string;
}
