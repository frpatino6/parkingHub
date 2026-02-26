import { Component, inject, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PricingService, PricingConfigResponse } from '../../../core/infrastructure/pricing/Pricing.Service';
import { AuthService } from '../../../core/infrastructure/auth/Auth.Service';
import { ContextService } from '../../../core/infrastructure/context/Context.Service';
import { finalize } from 'rxjs';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { PriceSimulatorComponent } from './price-simulator/PriceSimulator.Component';

@Component({
  selector: 'app-pricing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, PriceSimulatorComponent],
  templateUrl: './Pricing.Page.Component.html',
  styleUrl: './Pricing.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingPageComponent implements OnInit {
  private readonly pricingService = inject(PricingService);
  private readonly authService = inject(AuthService);
  private readonly context = inject(ContextService);
  private readonly fb = inject(FormBuilder);

  readonly configs = signal<PricingConfigResponse[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingConfig = signal<PricingConfigResponse | null>(null);
  readonly isSubmitting = signal(false);

  editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      mode: ['', Validators.required],
      ratePerUnit: [0, [Validators.required, Validators.min(0)]],
      gracePeriodMinutes: [0, [Validators.required, Validators.min(0)]],
      hasDayMaxRate: [false],
      dayMaxRate: [0, [Validators.min(1)]],
      blockSizeMinutes: [0, [Validators.min(1)]],
      active: [true]
    });
    this.syncDayMaxRateControl(false);
  }

  ngOnInit(): void {
    this.loadPricingConfigs();
  }

  loadPricingConfigs(): void {
    const branchId = this.context.activeBranchId();
    if (!branchId) return;

    this.isLoading.set(true);
    this.pricingService.getByBranch(branchId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.configs.set(data),
        error: (err) => this.error.set(extractApiError(err, 'Error al cargar las tarifas'))
      });
  }

  onEdit(config: PricingConfigResponse): void {
    const hasDayMaxRate = config.dayMaxRate !== undefined && config.dayMaxRate > 0;
    this.editingConfig.set(config);
    this.editForm.patchValue({
      mode: config.mode,
      ratePerUnit: config.ratePerUnit,
      gracePeriodMinutes: config.gracePeriodMinutes,
      hasDayMaxRate,
      dayMaxRate: hasDayMaxRate ? config.dayMaxRate : 0,
      blockSizeMinutes: config.blockSizeMinutes ?? 15,
      active: config.active
    });
    this.syncDayMaxRateControl(hasDayMaxRate);
  }

  onCancelEdit(): void {
    this.editingConfig.set(null);
  }

  onSave(): void {
    const config = this.editingConfig();
    if (!config || this.editForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.editForm.getRawValue();
    const request = {
      mode: formValue.mode,
      ratePerUnit: formValue.ratePerUnit,
      gracePeriodMinutes: formValue.gracePeriodMinutes,
      dayMaxRate: formValue.hasDayMaxRate ? formValue.dayMaxRate : undefined,
      blockSizeMinutes: formValue.blockSizeMinutes,
      active: formValue.active,
    };

    this.pricingService.update(config.id, request)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (updated) => {
          this.configs.update(list => list.map(c => c.id === updated.id ? updated : c));
          this.editingConfig.set(null);
        },
        error: (err) => this.error.set(extractApiError(err, 'Error al actualizar la tarifa'))
      });
  }

  onToggleDayMaxRate(): void {
    const hasDayMaxRate = Boolean(this.editForm.get('hasDayMaxRate')?.value);
    this.syncDayMaxRateControl(hasDayMaxRate);
  }

  private syncDayMaxRateControl(hasDayMaxRate: boolean): void {
    const dayMaxRateControl = this.editForm.get('dayMaxRate');
    if (!dayMaxRateControl) return;

    if (hasDayMaxRate) {
      dayMaxRateControl.enable({ emitEvent: false });
      dayMaxRateControl.setValidators([Validators.required, Validators.min(1)]);
      if (!dayMaxRateControl.value || dayMaxRateControl.value <= 0) {
        dayMaxRateControl.setValue(1, { emitEvent: false });
      }
    } else {
      dayMaxRateControl.setValue(0, { emitEvent: false });
      dayMaxRateControl.clearValidators();
      dayMaxRateControl.disable({ emitEvent: false });
    }

    dayMaxRateControl.updateValueAndValidity({ emitEvent: false });
  }

  getVehicleIcon(type: string): string {
    switch (type) {
      case 'CAR': return 'directions_car';
      case 'MOTORCYCLE': return 'motorcycle';
      case 'BICYCLE': return 'pedal_bike';
      default: return 'help_outline';
    }
  }

  getVehicleLabel(type: string): string {
    switch (type) {
      case 'CAR': return 'Carros';
      case 'MOTORCYCLE': return 'Motos';
      case 'BICYCLE': return 'Bicicletas';
      default: return type;
    }
  }

  getModeLabel(mode: string): string {
    switch (mode) {
      case 'MINUTE': return 'Por Minuto';
      case 'FRACTION': return 'Por Fracción';
      case 'BLOCK': return 'Por Bloque';
      default: return mode;
    }
  }
}
