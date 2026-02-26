import { GetDashboardStatsDto, DashboardStats, HourlyBucket } from '../../dtos/get-dashboard-stats.dto.js';
import { TicketModel } from '../../../infrastructure/database/models/ticket.model.js';
import { BranchRepository } from '../../../domain/ports/BranchRepository.Port.js';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum.js';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum.js';

export class GetDashboardStatsUseCase {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(dto: GetDashboardStatsDto): Promise<DashboardStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const baseMatch = { tenantId: dto.tenantId, branchId: dto.branchId };

    const [facetResult, activeCount, branch] = await Promise.all([
      TicketModel.aggregate([
        { $match: { ...baseMatch, checkIn: { $gte: todayStart, $lte: todayEnd } } },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  ticketsToday: { $sum: 1 },
                  revenueToday: {
                    $sum: { $cond: [{ $eq: ['$status', TicketStatus.PAID] }, '$amountCOP', 0] },
                  },
                  revenueByCash: {
                    $sum: {
                      $cond: [
                        { $eq: ['$paymentMethod', PaymentMethod.EFECTIVO] },
                        '$amountCOP',
                        0,
                      ],
                    },
                  },
                  revenueByElectronic: {
                    $sum: {
                      $cond: [
                        { $eq: ['$paymentMethod', PaymentMethod.DATAFONO] },
                        '$amountCOP',
                        0,
                      ],
                    },
                  },
                  avgDurationMinutes: {
                    $avg: {
                      $cond: [
                        { $and: [{ $ne: ['$checkOut', null] }, { $ne: ['$checkOut', undefined] }] },
                        {
                          $divide: [
                            { $subtract: ['$checkOut', '$checkIn'] },
                            60000,
                          ],
                        },
                        null,
                      ],
                    },
                  },
                },
              },
            ],
            hourly: [
              { $match: { status: TicketStatus.PAID } },
              {
                $group: {
                  _id: { $hour: '$checkIn' },
                  count: { $sum: 1 },
                  revenueCOP: { $sum: '$amountCOP' },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      TicketModel.countDocuments({ ...baseMatch, status: TicketStatus.OPEN }),
      this.branchRepo.findById(dto.branchId),
    ]);

    const totals = facetResult[0]?.totals[0] ?? {};
    const hourlyRaw: Array<{ _id: number; count: number; revenueCOP: number }> =
      facetResult[0]?.hourly ?? [];

    const hourlyDistribution: HourlyBucket[] = hourlyRaw.map((h) => ({
      hour: h._id,
      count: h.count,
      revenueCOP: h.revenueCOP ?? 0,
    }));

    const totalSpots = branch?.totalSpots;
    const occupancyPercentage =
      totalSpots && totalSpots > 0
        ? Math.round((activeCount / totalSpots) * 100)
        : undefined;

    return {
      ticketsToday: totals.ticketsToday ?? 0,
      revenueToday: totals.revenueToday ?? 0,
      activeTickets: activeCount,
      avgDurationMinutes: Math.round(totals.avgDurationMinutes ?? 0),
      revenueByCash: totals.revenueByCash ?? 0,
      revenueByElectronic: totals.revenueByElectronic ?? 0,
      hourlyDistribution,
      totalSpots,
      occupancyPercentage,
    };
  }
}
