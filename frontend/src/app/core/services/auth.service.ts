import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegisterRequest } from '../models/register-request';
import { LoginRequest } from '../models/login-request';
import { AuthResponse } from '../models/auth-response';
import { AuthStore } from '../store/auth.store';
import { UserDto } from '../models/user-dto';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  readonly isAuthenticated = this.authStore.isAuthenticated;

  private getLandingRouteByRole(role: string | null | undefined): string {
    const normalizedRole = role?.toUpperCase().replace('ROLE_', '') ?? '';

    if (normalizedRole === 'ADMIN') {
      return '/admin/dashboard';
    }
    if (normalizedRole === 'VENDOR') {
      return '/vendor/dashboard';
    }
    if (normalizedRole === 'CUSTOMER') {
      return '/catalog';
    }

    return '/';
  }

  isLoggedIn(): boolean {
    return this.authStore.isAuthenticated();
  }

  getUserRole(): string | null {
    return this.authStore.user()?.role ?? null;
  }

  getCurrentUser(): UserDto | null {
    return this.authStore.user();
  }

  register(payload: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((res) => {
        this.authStore.setAuth(res);
        this.router.navigate([this.getLandingRouteByRole(res.role)]);
      }));
  }

  login(payload: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((res) => {
        this.authStore.setAuth(res);
        this.router.navigate([this.getLandingRouteByRole(res.role)]);
      }));
  }

  logout() {
    this.authStore.clear();
    this.router.navigate(['/']);
  }
}
