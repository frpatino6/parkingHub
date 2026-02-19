import { FinancialMovementRepository } from '../../../domain/ports/FinancialMovementRepository.Port.js';
import { FinancialMovement } from '../../../domain/entities/FinancialMovement.Entity.js';

export interface GetMovementsReportDto {
  branchId: string;
  startDate: Date;
  endDate: Date;
}

export class GetMovementsReportUseCase {
  constructor(private readonly movementRepository: FinancialMovementRepository) {}

  async execute(dto: GetMovementsReportDto): Promise<FinancialMovement[]> {
    return this.movementRepository.findByRange(dto.branchId, dto.startDate, dto.endDate);
  }
}
