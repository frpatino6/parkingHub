import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/infrastructure/auth/Auth.Service';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { FinancialReportComponent } from './reports/FinancialReport.Component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ReportsService } from '../../../core/infrastructure/reports/Reports.Service';

interface Ticket {
  id: string;
  plate: string;
  vehicleType: string;
  status: 'OPEN' | 'PAID' | 'CANCELLED';
  checkIn: string;
  checkOut?: string;
  amountCOP?: number;
  durationMinutes: number;
  qrCode: string;
}

interface PaginatedTickets {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FinancialReportComponent, PaginationComponent],
  templateUrl: './History.Page.Component.html',
  styleUrl: './History.Page.Component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPageComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  readonly reportsService = inject(ReportsService);

  tickets = signal<Ticket[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'tickets' | 'financial'>('tickets');
  exportModalOpen = signal(false);

  // Search
  searchPlate = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.error.set(null);

    const plate = this.searchPlate().trim();
    if (plate) {
      // Search by plate (no pagination)
      const url = `${environment.apiUrl}/tickets?plate=${plate}`;
      this.http.get<Ticket[]>(url)
        .subscribe({
          next: (data) => {
            this.tickets.set(data);
            this.totalItems.set(data.length);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(extractApiError(err, 'No se pudo cargar el historial.'));
            this.loading.set(false);
          }
        });
    } else {
      // Paginated history
      const url = `${environment.apiUrl}/tickets/history?page=${this.currentPage()}&limit=${this.pageSize()}`;
      this.http.get<PaginatedTickets>(url)
        .subscribe({
          next: (data) => {
            this.tickets.set(data.items);
            this.totalItems.set(data.total);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(extractApiError(err, 'No se pudo cargar el historial.'));
            this.loading.set(false);
          }
        });
    }
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadHistory();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadHistory();
  }

  onExport(): void {
    this.reportsService.exportTickets().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  onReprintEntry(ticket: Ticket) {
    // For now, simple window print or alert. 
    // In a real app, this would generate a PDF or send to thermal printer.
    // We will simulate it by opening a new window with ticket details
    const content = `
      <html>
        <head><title>Ticket Entrada</title></head>
        <body style="font-family: monospace; text-align: center;">
          <h2>PARKING HUB</h2>
          <p>Entrada de Vehículo</p>
          <p>----------------</p>
          <p>Placa: <strong>${ticket.plate}</strong></p>
          <p>Tipo: ${ticket.vehicleType}</p>
          <p>Hora: ${new Date(ticket.checkIn).toLocaleString()}</p>
          <p>----------------</p>
          <h3>QR Code</h3>
          <p>${ticket.qrCode}</p>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.write(content);
      win.document.close();
    }
  }

  onReprintReceipt(ticket: Ticket) {
    const content = `
      <html>
        <head><title>Recibo de Pago</title></head>
        <body style="font-family: monospace; text-align: center;">
          <h2>PARKING HUB</h2>
          <p>Recibo de Pago</p>
          <p>----------------</p>
          <p>Placa: <strong>${ticket.plate}</strong></p>
          <p>Duración: ${ticket.durationMinutes} min</p>
          <p>Total: $${ticket.amountCOP?.toLocaleString()}</p>
          <p>Salida: ${ticket.checkOut ? new Date(ticket.checkOut).toLocaleString() : 'N/A'}</p>
          <p>----------------</p>
          <p>¡Gracias por su visita!</p>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (win) {
      win.document.write(content);
      win.document.close();
    }
  }
}
