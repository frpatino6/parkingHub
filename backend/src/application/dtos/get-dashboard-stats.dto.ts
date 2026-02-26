export interface GetDashboardStatsDto {
  branchId: string;
  tenantId: string;
}

export interface HourlyBucket {
  hour: number;
  count: number;
  revenueCOP: number;
}

export interface DashboardStats {
  ticketsToday: number;
  revenueToday: number;
  activeTickets: number;
  avgDurationMinutes: number;
  revenueByCash: number;
  revenueByElectronic: number;
  hourlyDistribution: HourlyBucket[];
  totalSpots?: number;
  occupancyPercentage?: number;
}
