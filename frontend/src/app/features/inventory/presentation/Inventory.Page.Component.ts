import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/infrastructure/auth/Auth.Service';
import { FormsModule } from '@angular/forms';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { DialogService } from '../../../shared/services/dialog.service';

interface Ticket {
  id: string;
  plate: string;
  qrCode: string;
  vehicleType: string;
  checkIn: string;
  durationMinutes: number;
}

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Inventory.Page.Component.html',
  styleUrl: './Inventory.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPageComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  private router = inject(Router);
  private readonly dialogService = inject(DialogService);
  
  tickets = signal<Ticket[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filters
  filterPlate = signal('');
  filterType = signal('');

  filteredTickets = computed(() => {
    const tickets = this.tickets();
    const plate = this.filterPlate().toLowerCase();
    const type = this.filterType();

    return tickets.filter(t => {
      const matchPlate = t.plate.toLowerCase().includes(plate);
      const matchType = type ? t.vehicleType === type : true;
      return matchPlate && matchType;
    });
  });

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<Ticket[]>(`${environment.apiUrl}/tickets/active`)
      .subscribe({
        next: (data) => {
          this.tickets.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractApiError(err, 'No se pudo cargar el inventario.'));
          this.loading.set(false);
        }
      });
  }

  onCheckOut(ticket: Ticket) {
    this.router.navigate(['/check-out'], { queryParams: { qr: ticket.qrCode } });
  }

  onCancelTicket(ticket: Ticket) {
    this.dialogService.confirm({
      title: 'Cancelar Ticket',
      message: `¿Seguro deseas cancelar el ticket de la placa ${ticket.plate}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Cancelar Ticket',
      danger: true,
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.http.post(`${environment.apiUrl}/tickets/${ticket.id}/cancel`, { reason: 'Cancelado por operador' })
        .subscribe({
          next: () => this.loadTickets(),
          error: (err) => this.error.set(extractApiError(err, 'No se pudo cancelar el ticket.')),
        });
    });
  }
}
