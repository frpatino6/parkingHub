import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketRepositoryPort } from '../../../core/domain/ports/TicketRepository.Port';
import { CashCutRepositoryPort } from '../../../core/domain/ports/CashCutRepository.Port';
import { CheckInResult } from '../../../core/domain/entities/CheckInResult.model';
import { VehicleType } from '../../../core/domain/enums/VehicleType.enum';

export type CheckInStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface CheckInState {
  status: CheckInStatus;
  result: CheckInResult | null;
  error: string | null;
  isShiftOpen: boolean;
}

const initialState: CheckInState = {
  status: 'idle',
  result: null,
  error: null,
  isShiftOpen: true, // Optimistically true until check fails
};

@Injectable()
export class CheckInBloc {
  private readonly ticketRepo = inject(TicketRepositoryPort);
  private readonly cashCutRepo = inject(CashCutRepositoryPort);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<CheckInState>(initialState);

  constructor() {
    this.checkShiftStatus();
  }

  readonly state = this._state.asReadonly();
  readonly status = computed(() => this._state().status);
  readonly result = computed(() => this._state().result);
  readonly error = computed(() => this._state().error);
  readonly isSubmitting = computed(() => this._state().status === 'submitting');
  readonly isSuccess = computed(() => this._state().status === 'success');
  readonly isShiftOpen = computed(() => this._state().isShiftOpen);

  checkShiftStatus(): void {
    this.cashCutRepo.getCurrent().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this._state.update(s => ({ ...s, isShiftOpen: true })),
      error: () => this._state.update(s => ({ ...s, isShiftOpen: false }))
    });
  }

  submitCheckIn(plate: string, vehicleType: VehicleType): void {
    const trimmed = plate.trim().toUpperCase();
    if (!trimmed) {
      this._state.update((s) => ({ ...s, status: 'error', error: 'La placa es obligatoria' }));
      return;
    }

    this._state.update((s) => ({ ...s, status: 'submitting', result: null, error: null }));

    this.ticketRepo
      .checkIn({ plate: trimmed, vehicleType })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this._state.update((s) => ({ ...s, status: 'success', result, error: null }));
        },
        error: (err) => {
          const message =
            err?.error?.message ?? err?.error?.error ?? err?.message ?? 'Error al registrar ingreso';
          this._state.update((s) => ({ ...s, status: 'error', result: null, error: String(message) }));
        },
      });
  }

  reset(): void {
    this._state.set(initialState);
  }
}
