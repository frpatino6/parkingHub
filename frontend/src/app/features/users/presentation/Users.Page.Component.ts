import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, UserResponse } from '../../../core/infrastructure/users/Users.Service';
import { BranchService, BranchResponse } from '../../../core/infrastructure/branches/Branch.Service';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';
import { finalize } from 'rxjs';

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'OPERATOR', label: 'Operario' },
  { value: 'PARKING_ADMIN', label: 'Admin Parqueadero' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './Users.Page.Component.html',
  styleUrl: './Users.Page.Component.scss'
})
export class UsersPageComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly branchService = inject(BranchService);

  users = signal<UserResponse[]>([]);
  branches = signal<BranchResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal / Form state
  showModal = signal(false);
  isEditing = signal(false);
  selectedUser = signal<UserResponse | null>(null);

  readonly roleOptions = ROLE_OPTIONS;
  
  readonly branchOptions = computed<SelectOption[]>(() => {
    const options: SelectOption[] = [
      { value: '', label: 'Acceso Global (Todas las sedes)' }
    ];
    return [
      ...options,
      ...this.branches().map(b => ({ value: b.id, label: b.name }))
    ];
  });

  form = {
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
    branchId: '',
    active: true
  };

  ngOnInit(): void {
    this.loadUsers();
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (data) => this.branches.set(data),
      error: (err) => console.error('Error loading branches:', err)
    });
  }

  loadUsers() {
    this.loading.set(true);
    this.usersService.getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.users.set(data),
        error: (err) => this.error.set(extractApiError(err, 'Error cargando usuarios'))
      });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.selectedUser.set(null);
    this.form = { name: '', email: '', password: '', role: 'OPERATOR', branchId: '', active: true };
    this.showModal.set(true);
  }

  openEditModal(user: UserResponse) {
    this.isEditing.set(true);
    this.selectedUser.set(user);
    this.form = {
      name: user.name,
      email: user.email,
      password: '', // Hidden for editing unless reset
      role: user.role,
      branchId: user.branchId || '',
      active: user.active
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  save() {
    if (this.isEditing()) {
      this.usersService.update(this.selectedUser()!.id, this.form)
        .subscribe(() => {
          this.loadUsers();
          this.closeModal();
        });
    } else {
      this.usersService.create(this.form)
        .subscribe(() => {
          this.loadUsers();
          this.closeModal();
        });
    }
  }

  toggleActive(user: UserResponse) {
    this.usersService.update(user.id, { ...user, active: !user.active })
      .subscribe(() => this.loadUsers());
  }

  getBranchName(branchId?: string): string {
    if (!branchId) return 'Acceso Global';
    const branch = this.branches().find(b => b.id === branchId);
    return branch ? branch.name : branchId; // Fallback to ID if not found
  }
}
