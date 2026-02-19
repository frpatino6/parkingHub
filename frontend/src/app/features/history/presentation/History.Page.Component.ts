import { Component, OnInit, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/infrastructure/auth/Auth.Service';

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

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './History.Page.Component.html',
  styleUrl: './History.Page.Component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HistoryPageComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  
  tickets = signal<Ticket[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Search
  searchPlate = signal('');

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.error.set(null);
    
    const plate = this.searchPlate().trim();
    // Verify backend route: /tickets?plate=... maps to getHistory in controller
    // My previous backend edit added router.get('/', controller.getHistory) in ticket.routes.ts
    // The base route in app.ts is probably /api/tickets. 
    // So GET /api/tickets?plate=... is correct.
    
    const url = `${environment.apiUrl}/tickets${plate ? `?plate=${plate}` : ''}`;

    this.http.get<Ticket[]>(url)
      .subscribe({
        next: (data) => {
          this.tickets.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se pudo cargar el historial.');
          this.loading.set(false);
        }
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
