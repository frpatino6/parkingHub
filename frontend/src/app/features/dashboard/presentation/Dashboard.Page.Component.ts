import { Component, OnInit, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, startWith, switchMap } from 'rxjs';
import { DashboardService, DashboardStats } from '../../../core/infrastructure/dashboard/Dashboard.Service';
import { ContextService } from '../../../core/infrastructure/context/Context.Service';
import { extractApiError } from '../../../shared/utils/api-error.util';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Dashboard.Page.Component.html',
  styleUrl: './Dashboard.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly context = inject(ContextService);
  private readonly destroyRef = inject(DestroyRef);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const branchId = this.context.activeBranchId();
    if (!branchId) return;

    interval(60_000).pipe(
      startWith(0),
      switchMap((): ReturnType<DashboardService['getStats']> => this.dashboardService.getStats(branchId)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(extractApiError(err, 'Error cargando el dashboard'));
        this.loading.set(false);
      },
    });
  }

  get maxHourlyRevenue(): number {
    const dist = this.stats()?.hourlyDistribution ?? [];
    return Math.max(...dist.map((h) => h.revenueCOP), 1);
  }
}
