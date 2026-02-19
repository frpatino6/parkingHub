export type CashCutStatus = 'OPEN' | 'CLOSED';

export interface CashCut {
  id: string;
  status: CashCutStatus;
  openedAt: string;
  closedAt?: string;
  totalSalesCOP: number;
  totalCashCOP: number;
  totalElectronicCOP: number;
  reportedCashCOP?: number;
  discrepancyCOP?: number;
}
