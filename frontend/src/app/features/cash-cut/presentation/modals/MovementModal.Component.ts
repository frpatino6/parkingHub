import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementsService, CreateMovementRequest } from '../../../../core/infrastructure/movements/Movements.Service';
import { extractApiError } from '../../../../shared/utils/api-error.util';
import { CustomSelectComponent, SelectOption } from '../../../../shared/components/custom-select/custom-select.component';
import { finalize } from 'rxjs';

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'EXPENSE', label: 'Egreso (Gasto)' },
  { value: 'INCOME', label: 'Ingreso Extra' },
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'SUPPLIES', label: 'Insumos (Papel, Aseo)' },
  { value: 'SERVICES', label: 'Servicios Públicos' },
  { value: 'FUEL', label: 'Gasolina / Vales' },
  { value: 'EXTRA_INCOME', label: 'Ingreso Adicional' },
  { value: 'OTHER', label: 'Otros' },
];

@Component({
  selector: 'app-movement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './MovementModal.Component.html',
  styleUrls: ['./MovementModal.Component.scss']
})
export class MovementModalComponent {
  private readonly movementsService = inject(MovementsService);

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly typeOptions = TYPE_OPTIONS;
  readonly categoryOptions = CATEGORY_OPTIONS;

  loading = signal(false);
  error = signal<string | null>(null);

  form: CreateMovementRequest = {
    type: 'EXPENSE',
    category: 'SUPPLIES',
    description: '',
    amount: 0
  };

  save(): void {
    if (this.form.amount <= 0 || !this.form.description) return;

    this.loading.set(true);
    this.error.set(null);

    this.movementsService.registerMovement(this.form)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.saved.emit();
          this.closed.emit();
        },
        error: (err: any) => this.error.set(extractApiError(err, 'Error al registrar movimiento'))
      });
  }

  close(): void {
    this.closed.emit();
  }
}
