import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/infrastructure/auth/Auth.Service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './MainLayout.Component.html',
  styleUrl: './MainLayout.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly sidebarOpen = signal(false);

  readonly navItems = computed(() => {
    const userRole = this.user()?.role;
    const allItems = [
      { label: 'Ingresos', route: '/check-in', icon: 'login', roles: ['OPERATOR'] },
      { label: 'Salidas', route: '/check-out', icon: 'logout', roles: ['OPERATOR'] },
      { label: 'Inventario', route: '/inventory', icon: 'directions_car', roles: ['OPERATOR', 'PARKING_ADMIN'] },
      { label: 'Historial', route: '/history', icon: 'history', roles: ['OPERATOR', 'PARKING_ADMIN', 'SUPER_ADMIN'] },
      { label: 'Usuarios', route: '/users', icon: 'people', roles: ['PARKING_ADMIN', 'SUPER_ADMIN'] },
      { label: 'Tarifas', route: '/pricing', icon: 'payments', roles: ['PARKING_ADMIN', 'SUPER_ADMIN'] },
      { label: 'Cierre de Caja', route: '/cash-cut', icon: 'account_balance_wallet', roles: ['OPERATOR', 'PARKING_ADMIN', 'SUPER_ADMIN'] },
    ];
    return allItems.filter(item => !item.roles || (userRole && item.roles.includes(userRole)));
  });

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
