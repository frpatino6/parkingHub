import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/infrastructure/auth/Auth.Service';
import { UsersService } from '../../../core/infrastructure/users/Users.Service';
import { ToastService } from '../../../shared/services/toast.service';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Profile.Page.Component.html',
  styleUrl: './Profile.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  readonly auth = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  submitting = signal(false);
  error = signal<string | null>(null);

  form = { currentPassword: '', newPassword: '', confirmPassword: '' };

  onChangePassword(): void {
    this.error.set(null);
    if (!this.form.currentPassword || !this.form.newPassword) {
      this.error.set('Completa todos los campos.');
      return;
    }
    if (this.form.newPassword.length < 8) {
      this.error.set('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (this.form.newPassword !== this.form.confirmPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.submitting.set(true);
    this.usersService.changeOwnPassword(this.form.currentPassword, this.form.newPassword)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Contraseña actualizada correctamente.');
          this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
        },
        error: (err) => this.error.set(extractApiError(err, 'Error al cambiar la contraseña')),
      });
  }
}
