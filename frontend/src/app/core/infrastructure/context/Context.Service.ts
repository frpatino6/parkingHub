import { Injectable, signal, computed } from '@angular/core';
import { BranchResponse } from '../branches/Branch.Service';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private readonly STORAGE_KEY = 'ph_active_branch';
  
  private readonly _activeBranch = signal<BranchResponse | null>(this.loadFromStorage());

  readonly activeBranch = this._activeBranch.asReadonly();
  readonly activeBranchId = computed(() => this._activeBranch()?.id);

  setActiveBranch(branch: BranchResponse | null): void {
    this._activeBranch.set(branch);
    if (branch) {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(branch));
    } else {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private loadFromStorage(): BranchResponse | null {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
