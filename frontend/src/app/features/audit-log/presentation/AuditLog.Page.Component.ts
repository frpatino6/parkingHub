import { Component, OnInit, inject, signal, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLogEntry } from '../../../core/infrastructure/audit-log/AuditLog.Service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { finalize } from 'rxjs';
import {
  AUDIT_ACTION_OPTIONS,
  getAuditActionLabel,
} from '../domain/audit-action-labels';

@Component({
  selector: 'app-audit-log-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './AuditLog.Page.Component.html',
  styleUrl: './AuditLog.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogPageComponent implements OnInit {
  private readonly auditLogService = inject(AuditLogService);
  private readonly today = new Date().toISOString().slice(0, 10);

  readonly actionOptions = AUDIT_ACTION_OPTIONS;
  readonly actionLabel = getAuditActionLabel;

  logs = signal<AuditLogEntry[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  pageSize = signal(50);
  totalItems = signal(0);
  filterActions = signal<string[]>([]);
  startDate = signal(this.today);
  endDate = signal(this.today);
  actionDropdownOpen = signal(false);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.auditLogService
      .list(this.currentPage(), this.pageSize(), {
        actions: this.filterActions().length ? this.filterActions() : undefined,
        startDate: this.startDate() || undefined,
        endDate: this.endDate() || undefined,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.logs.set(data.items);
          this.totalItems.set(data.total);
        },
        error: (err) => this.error.set(extractApiError(err, 'Error cargando auditoría')),
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadLogs();
  }

  onFilter(): void {
    this.actionDropdownOpen.set(false);
    this.currentPage.set(1);
    this.loadLogs();
  }

  toggleAction(value: string): void {
    const current = this.filterActions();
    const next = current.includes(value)
      ? current.filter((a) => a !== value)
      : [...current, value];
    this.filterActions.set(next);
  }

  isActionSelected(value: string): boolean {
    return this.filterActions().includes(value);
  }

  toggleActionDropdown(): void {
    this.actionDropdownOpen.update((v) => !v);
  }

  closeActionDropdown(): void {
    this.actionDropdownOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeActionDropdown();
  }

  badgeClass(action: string): string {
    if (action.startsWith('TICKET_')) return 'badge-primary';
    if (action.startsWith('CASH_CUT_')) return 'badge-accent';
    if (action.startsWith('USER_')) return 'badge-warning';
    if (action.startsWith('BRANCH_')) return 'badge-info';
    return 'badge-neutral';
  }
}
