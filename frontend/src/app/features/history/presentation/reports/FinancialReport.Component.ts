import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementsService, MovementResponse } from '../../../../core/infrastructure/movements/Movements.Service';
import { finalize } from 'rxjs';
import { extractApiError } from '../../../../shared/utils/api-error.util';

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './FinancialReport.Component.html',
  styleUrl: './FinancialReport.Component.scss',
})
export class FinancialReportComponent implements OnInit {
  private readonly movementsService = inject(MovementsService);

  readonly movements = signal<MovementResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Filters
  startDate = signal(new Date().toISOString().split('T')[0]);
  endDate = signal(new Date().toISOString().split('T')[0]);

  // Totals
  readonly totalIncome = computed(() => 
    this.movements()
      .filter(m => m.type === 'INCOME')
      .reduce((sum, m) => sum + m.amountCOP, 0)
  );

  readonly totalExpense = computed(() => 
    this.movements()
      .filter(m => m.type === 'EXPENSE')
      .reduce((sum, m) => sum + m.amountCOP, 0)
  );

  readonly balance = computed(() => this.totalIncome() - this.totalExpense());

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.error.set(null);

    this.movementsService.getReport(this.startDate(), this.endDate())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.movements.set(data),
        error: (err) => this.error.set(extractApiError(err, 'Error al cargar reporte financiero'))
      });
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      SUPPLIES: 'Insumos',
      SERVICES: 'Servicios',
      FUEL: 'Combustible',
      EXTRA_INCOME: 'Ingreso Extra',
      OTHER: 'Otro'
    };
    return labels[category] || category;
  }
}
