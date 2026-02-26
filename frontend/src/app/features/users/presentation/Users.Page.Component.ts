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
    return this.branches().map(b => ({ value: b.id, label: b.name }));
  });

  form = {
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
    branchIds: [] as string[],
    active: true
  };

  ngOnInit(): void {
    this.loadUsers();
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.list().subscribe({
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
    this.form = { name: '', email: '', password: '', role: 'OPERATOR', branchIds: [], active: true };
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
      branchIds: user.branchIds || [],
      active: user.active
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  save() {
    this.loading.set(true);
    this.error.set(null);

    const request = this.isEditing() 
      ? this.usersService.update(this.selectedUser()!.id, this.form)
      : this.usersService.create(this.form);

    request.pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => {
          this.error.set(extractApiError(err, 'Error al guardar el usuario'));
          console.error('Save error:', err);
        }
      });
  }

  toggleActive(user: UserResponse) {
    this.usersService.update(user.id, { 
      name: user.name,
      role: user.role,
      active: !user.active,
      branchIds: user.branchIds
    }).subscribe({
      next: () => this.loadUsers(),
      error: (err) => this.error.set(extractApiError(err, 'Error al cambiar estado'))
    });
  }

  getBranchNames(branchIds?: string[]): string {
    if (!branchIds || branchIds.length === 0) return 'Acceso Total';
    return this.branches()
      .filter(b => branchIds.includes(b.id))
      .map(b => b.name)
      .join(', ');
  }
}
