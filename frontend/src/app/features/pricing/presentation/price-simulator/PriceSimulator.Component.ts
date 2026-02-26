import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PricingService, SimulatePriceResult } from '../../../../core/infrastructure/pricing/Pricing.Service';
import { ContextService } from '../../../../core/infrastructure/context/Context.Service';
import { extractApiError } from '../../../../shared/utils/api-error.util';
import { finalize } from 'rxjs';

const VEHICLE_TYPES = [
  { value: 'CAR', label: 'Automóvil' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'BICYCLE', label: 'Bicicleta' },
];

@Component({
  selector: 'app-price-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './PriceSimulator.Component.html',
  styleUrl: './PriceSimulator.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceSimulatorComponent {
  private readonly pricingService = inject(PricingService);
  private readonly context = inject(ContextService);

  readonly vehicleTypes = VEHICLE_TYPES;

  vehicleType = 'CAR';
  hours = 1;
  minutes = 0;

  result = signal<SimulatePriceResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  simulate(): void {
    const branchId = this.context.activeBranchId();
    if (!branchId) { this.error.set('Selecciona una sede primero.'); return; }

    const durationMinutes = (this.hours || 0) * 60 + (this.minutes || 0);
    if (durationMinutes <= 0) { this.error.set('Ingresa una duración válida.'); return; }

    this.error.set(null);
    this.loading.set(true);
    this.pricingService.simulate({ branchId, vehicleType: this.vehicleType, durationMinutes })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.result.set(data),
        error: (err) => this.error.set(extractApiError(err, 'Error al simular precio')),
      });
  }

  reset(): void {
    this.result.set(null);
    this.error.set(null);
  }
}
