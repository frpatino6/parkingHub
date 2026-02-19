import { UseCase } from '../../interfaces/use-case.interface.js';
import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';
import { CashCut } from '../../../domain/entities/CashCut.Entity.js';
import { NotFoundError } from '../../../domain/errors/domain-errors.js';

export interface GetCurrentCashCutDto {
  tenantId: string;
  branchId: string;
  operatorId: string;
}

export class GetCurrentCashCutUseCase implements UseCase<GetCurrentCashCutDto, CashCut> {
  constructor(private readonly cashCutRepo: CashCutRepository) {}

  async execute(dto: GetCurrentCashCutDto): Promise<CashCut> {
    const cashCut = await this.cashCutRepo.findOpenByOperator(dto.branchId, dto.operatorId);
    if (!cashCut) {
      throw new NotFoundError('CashCut', `Open for operator ${dto.operatorId}`);
    }
    return cashCut;
  }
}
