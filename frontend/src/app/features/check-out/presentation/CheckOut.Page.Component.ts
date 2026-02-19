import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CheckOutBloc } from '../application/CheckOut.Bloc';
import { PaymentMethod } from '../../../core/domain/enums/PaymentMethod.enum';

@Component({
  selector: 'app-check-out-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink],
  providers: [CheckOutBloc],
  templateUrl: './CheckOut.Page.Component.html',
  styleUrl: './CheckOut.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckOutPageComponent implements OnInit {
  readonly bloc = inject(CheckOutBloc);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly PaymentMethod = PaymentMethod;

  ngOnInit(): void {
    const qr = this.route.snapshot.queryParamMap.get('qr');
    if (qr?.trim()) {
      this.bloc.searchTicket(qr.trim());
    }
  }
  readonly paymentOptions = [
    { value: PaymentMethod.EFECTIVO, label: 'Efectivo', icon: 'payments' },
    { value: PaymentMethod.DATAFONO, label: 'Datafono', icon: 'credit_card' },
  ];

  readonly searchForm = this.fb.nonNullable.group({
    qrCode: ['', [Validators.required]],
  });

  onSearch(): void {
    if (this.searchForm.invalid) return;
    this.bloc.searchTicket(this.searchForm.getRawValue().qrCode);
  }

  onConfirmPayment(method: PaymentMethod): void {
    this.bloc.confirmCheckOut(method);
  }

  onReset(): void {
    this.bloc.reset();
    this.searchForm.reset();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
