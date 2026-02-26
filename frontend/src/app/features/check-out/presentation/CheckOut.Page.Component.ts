import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CheckOutBloc } from '../application/CheckOut.Bloc';
import { PaymentMethod } from '../../../core/domain/enums/PaymentMethod.enum';
import { QrScannerComponent } from '../../../shared/components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-check-out-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink, QrScannerComponent],
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
  readonly scannerOpen = signal(false);

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

  onQrScanned(code: string): void {
    this.scannerOpen.set(false);
    this.searchForm.patchValue({ qrCode: code });
    this.bloc.searchTicket(code);
  }

  onReset(): void {
    this.bloc.reset();
    this.searchForm.reset();
    this.scannerOpen.set(false);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
