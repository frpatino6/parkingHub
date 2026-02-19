import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CashCutRepositoryPort } from '../../../core/domain/ports/CashCutRepository.Port';
import { CashCut } from '../../../core/domain/entities/CashCut.model';

export type CashCutStatus = 'loading' | 'idle' | 'no-active' | 'submitting' | 'success' | 'error';

export interface CashCutState {
  status: CashCutStatus;
  cashCut: CashCut | null;
  error: string | null;
}

const initialState: CashCutState = {
  status: 'loading',
  cashCut: null,
  error: null,
};

@Injectable()
export class CashCutBloc {
  private readonly cashCutRepo = inject(CashCutRepositoryPort);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<CashCutState>(initialState);

  readonly state = this._state.asReadonly();
  readonly status = computed(() => this._state().status);
  readonly cashCut = computed(() => this._state().cashCut);
  readonly error = computed(() => this._state().error);

  readonly isLoading = computed(() => this._state().status === 'loading');
  readonly isNoActive = computed(() => this._state().status === 'no-active');
  readonly isSubmitting = computed(() => this._state().status === 'submitting');
  readonly isSuccess = computed(() => this._state().status === 'success');

  loadCurrent(): void {
    this._state.set({ status: 'loading', cashCut: null, error: null });

    this.cashCutRepo
      .getCurrent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cashCut) => {
          this._state.set({ status: 'idle', cashCut, error: null });
        },
        error: (err) => {
          if (err.status === 404) {
            this._state.set({ status: 'no-active', cashCut: null, error: null });
          } else {
            const message = err?.error?.message ?? err?.message ?? 'Error al cargar corte de caja';
            this._state.set({ status: 'error', cashCut: null, error: String(message) });
          }
        },
      });
  }

  openTurn(): void {
    this._state.update((s) => ({ ...s, status: 'submitting', error: null }));

    this.cashCutRepo
      .open()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cashCut) => {
          this._state.set({ status: 'idle', cashCut, error: null });
        },
        error: (err) => {
          const message = err?.error?.message ?? err?.message ?? 'Error al abrir turno';
          this._state.update((s) => ({ ...s, status: 'error', error: String(message) }));
        },
      });
  }

  closeTurn(reportedCash: number): void {
    this._state.update((s) => ({ ...s, status: 'submitting', error: null }));

    this.cashCutRepo
      .close(reportedCash)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cashCut) => {
          this._state.set({ status: 'success', cashCut, error: null });
        },
        error: (err) => {
          const message = err?.error?.message ?? err?.message ?? 'Error al cerrar turno';
          this._state.update((s) => ({ ...s, status: 'error', error: String(message) }));
        },
      });
  }

  reset(): void {
    this._state.set(initialState);
    this.loadCurrent();
  }
}
