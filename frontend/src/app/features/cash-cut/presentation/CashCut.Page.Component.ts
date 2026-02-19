import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { CashCutBloc } from '../application/CashCut.Bloc';

@Component({
  selector: 'app-cash-cut-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  providers: [CashCutBloc],
  templateUrl: './CashCut.Page.Component.html',
  styleUrl: './CashCut.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCutPageComponent implements OnInit {
  readonly bloc = inject(CashCutBloc);
  private readonly fb = inject(FormBuilder);

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

  formatDate(iso?: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
