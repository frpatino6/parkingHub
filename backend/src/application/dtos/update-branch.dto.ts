export interface UpdateBranchDto {
  branchId: string;
  /** userId of the admin performing the action — from JWT */
  updatedBy: string;
  tenantId: string;
  name?: string;
  address?: string;
  active?: boolean;
  totalSpots?: number;
}
