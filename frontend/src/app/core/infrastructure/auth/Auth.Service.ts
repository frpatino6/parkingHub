import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';
import { setStoredToken, setStoredUser, clearStoredToken, getStoredUser, StoredUser } from '../http/AuthInterceptor';
import { ContextService } from '../context/Context.Service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  branchIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly context = inject(ContextService);

  private readonly _user = signal<User | null>(getStoredUser() as unknown as User);
  readonly user = this._user.asReadonly();

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        setStoredToken(res.accessToken);
        setStoredUser(res.user);
        this._user.set(res.user);
        // Clear active branch so user must select sede (or auto-select if only one)
        this.context.setActiveBranch(null);
      }),
    );
  }

  logout(): void {
    clearStoredToken();
    this.context.setActiveBranch(null);
    this._user.set(null);
  }

  hasRole(role: string): boolean {
    return this._user()?.role === role;
  }
}
