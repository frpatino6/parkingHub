import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService, BranchResponse } from '../../../core/infrastructure/branches/Branch.Service';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-branches-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Branches.Page.Component.html',
  styleUrl: './Branches.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchesPageComponent implements OnInit {
  private readonly branchService = inject(BranchService);

  branches = signal<BranchResponse[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  showModal = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);

  form = { name: '', address: '', totalSpots: undefined as number | undefined, active: true };

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loading.set(true);
    this.branchService.list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.branches.set(data),
        error: (err) => this.error.set(extractApiError(err, 'Error cargando sedes')),
      });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form = { name: '', address: '', totalSpots: undefined, active: true };
    this.showModal.set(true);
  }

  openEditModal(branch: BranchResponse): void {
    this.isEditing.set(true);
    this.editingId.set(branch.id);
    this.form = {
      name: branch.name,
      address: branch.address,
      totalSpots: branch.totalSpots,
      active: branch.active,
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.error.set(null);
  }

  save(): void {
    this.submitting.set(true);
    this.error.set(null);
    const request = this.isEditing()
      ? this.branchService.update(this.editingId()!, this.form)
      : this.branchService.create(this.form);

    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => { this.loadBranches(); this.closeModal(); },
      error: (err) => this.error.set(extractApiError(err, 'Error al guardar la sede')),
    });
  }

  toggleActive(branch: BranchResponse): void {
    this.branchService.update(branch.id, { active: !branch.active }).subscribe({
      next: () => this.loadBranches(),
      error: (err) => this.error.set(extractApiError(err, 'Error al cambiar estado')),
    });
  }
}
