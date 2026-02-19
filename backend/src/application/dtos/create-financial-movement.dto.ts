export interface CreateFinancialMovementDto {
  tenantId: string;
  branchId: string;
  operatorId: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'SUPPLIES' | 'SERVICES' | 'FUEL' | 'EXTRA_INCOME' | 'OTHER';
  description: string;
  amount: number;
}
