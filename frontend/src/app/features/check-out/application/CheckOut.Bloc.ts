import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketRepositoryPort } from '../../../core/domain/ports/TicketRepository.Port';
import { CashCutRepositoryPort } from '../../../core/domain/ports/CashCutRepository.Port';
import { TicketInfo } from '../../../core/domain/entities/TicketInfo.model';
import { PaymentMethod } from '../../../core/domain/enums/PaymentMethod.enum';

export type CheckOutStatus = 'idle' | 'searching' | 'preview' | 'submitting' | 'success' | 'error';

export interface CheckOutState {
  status: CheckOutStatus;
  ticket: TicketInfo | null;
  error: string | null;
  isShiftOpen: boolean;
}

const initialState: CheckOutState = {
  status: 'idle',
  ticket: null,
  error: null,
  isShiftOpen: true,
};

@Injectable()
export class CheckOutBloc {
  private readonly ticketRepo = inject(TicketRepositoryPort);
  private readonly cashCutRepo = inject(CashCutRepositoryPort);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<CheckOutState>(initialState);

  constructor() {
    this.checkShiftStatus();
  }

  readonly state = this._state.asReadonly();
  readonly status = computed(() => this._state().status);
  readonly ticket = computed(() => this._state().ticket);
  readonly error = computed(() => this._state().error);

  readonly isSearching = computed(() => this._state().status === 'searching');
  readonly isSubmitting = computed(() => this._state().status === 'submitting');
  readonly isPreview = computed(() => this._state().status === 'preview');
  readonly isSuccess = computed(() => this._state().status === 'success');
  readonly isShiftOpen = computed(() => this._state().isShiftOpen);

  checkShiftStatus(): void {
    this.cashCutRepo.getCurrent().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this._state.update(s => ({ ...s, isShiftOpen: true })),
      error: () => this._state.update(s => ({ ...s, isShiftOpen: false }))
    });
  }

  searchTicket(qrCode: string): void {
    const trimmed = qrCode.trim();
    if (!trimmed) {
      this._state.update((s) => ({ ...s, status: 'error', error: 'El código QR es obligatorio' }));
      return;
    }

    this._state.update((s) => ({ ...s, status: 'searching', ticket: null, error: null }));

    this.ticketRepo
      .findByQr(trimmed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticket) => {
          this._state.update((s) => ({ ...s, status: 'preview', ticket, error: null }));
        },
        error: (err) => {
          const message = err?.error?.message ?? err?.message ?? 'Ticket no encontrado';
          this._state.update((s) => ({ ...s, status: 'error', ticket: null, error: String(message) }));
        },
      });
  }

  confirmCheckOut(paymentMethod: PaymentMethod): void {
    const ticket = this.ticket();
    if (!ticket) return;

    this._state.update((s) => ({ ...s, status: 'submitting', error: null }));

    this.ticketRepo
      .checkOut(ticket.qrCode, paymentMethod)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedTicket) => {
          this._state.update((s) => ({ ...s, status: 'success', ticket: updatedTicket, error: null }));
        },
        error: (err) => {
          const message = err?.error?.message ?? err?.message ?? 'Error al procesar el pago';
          this._state.update((s) => ({ ...s, status: 'error', error: String(message) }));
        },
      });
  }

  reset(): void {
    this._state.set(initialState);
  }
}
