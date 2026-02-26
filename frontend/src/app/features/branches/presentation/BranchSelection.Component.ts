import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchService, BranchResponse } from '../../../core/infrastructure/branches/Branch.Service';
import { ContextService } from '../../../core/infrastructure/context/Context.Service';
import { AuthService } from '../../../core/infrastructure/auth/Auth.Service';

@Component({
  selector: 'app-branch-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './BranchSelection.Component.html',
  styleUrl: './BranchSelection.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchSelectionComponent implements OnInit {
  private readonly branchService = inject(BranchService);
  private readonly contextService = inject(ContextService);
  private readonly authService = inject(AuthService);

  loading = signal(true);
  allowedBranches = signal<BranchResponse[]>([]);

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    const user = this.authService.user();
    if (!user) return;

    const userBranchIds = (user as { branchIds?: string[] }).branchIds ?? [];

    this.branchService.list().subscribe({
      next: (branches: BranchResponse[]) => {
        if (userBranchIds.length > 0) {
          const filtered = branches.filter((b) => userBranchIds.includes(b.id));
          this.allowedBranches.set(filtered.length > 0 ? filtered : branches);
        } else {
          this.allowedBranches.set(branches);
        }

        if (this.allowedBranches().length === 1) {
          this.selectBranch(this.allowedBranches()[0]);
        }

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectBranch(branch: BranchResponse): void {
    this.contextService.setActiveBranch(branch);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
