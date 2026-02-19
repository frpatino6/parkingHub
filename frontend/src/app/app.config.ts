import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { API_BASE_URL } from './core/infrastructure/tokens/api.config';
import { TicketRepositoryPort } from './core/domain/ports/TicketRepository.Port';
import { HttpTicketRepository } from './core/infrastructure/http/HttpTicket.Repository';
import { authInterceptor } from './core/infrastructure/http/AuthInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiUrl },
    { provide: TicketRepositoryPort, useClass: HttpTicketRepository },
  ],
};
