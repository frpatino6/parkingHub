import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { CashCutBloc } from '../application/CashCut.Bloc';
import { MovementsService, MovementResponse } from '../../../core/infrastructure/movements/Movements.Service';
import { MovementModalComponent } from './modals/MovementModal.Component';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-cash-cut-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, MovementModalComponent],
  providers: [CashCutBloc],
  templateUrl: './CashCut.Page.Component.html',
  styleUrl: './CashCut.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCutPageComponent implements OnInit {
  readonly bloc = inject(CashCutBloc);
  private readonly fb = inject(FormBuilder);
  private readonly movementsService = inject(MovementsService);

  showMovementModal = signal(false);
  
  readonly movements = toSignal(
    toObservable(this.bloc.cashCut).pipe(
      switchMap(cc => cc?.id ? this.movementsService.getMovements(cc.id) : of([]))
    ),
    { initialValue: [] as MovementResponse[] }
  );

  readonly closeForm = this.fb.nonNullable.group({
    reportedCash: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.bloc.loadCurrent();
  }

  onOpenTurn(): void {
    this.bloc.openTurn();
  }

  onCloseTurn(): void {
    if (this.closeForm.invalid) return;
    const { reportedCash } = this.closeForm.getRawValue();
    this.bloc.closeTurn(reportedCash);
  }

  onReset(): void {
    this.bloc.reset();
    this.closeForm.reset({ reportedCash: 0 });
  }

  onMovementSaved(): void {
    this.bloc.loadCurrent();
  }

  formatDate(iso?: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
