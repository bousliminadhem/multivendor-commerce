import { Injectable, computed, effect, signal } from '@angular/core';
import { AuthResponse } from '../models/auth-response';
import { UserDto } from '../models/user-dto';

interface AuthState {
  token: string | null;
  tokenType: string;
  user: UserDto | null;
}

const STORAGE_KEY = 'ecommerce_auth';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly state = signal<AuthState>(this.loadState());

  readonly token = computed(() => this.state().token);
  readonly tokenType = computed(() => this.state().tokenType || 'Bearer');
  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => !!this.state().token);

  constructor() {
    effect(() => {
      const current = this.state();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    });
  }

  setAuth(auth: AuthResponse): void {
    const user: UserDto = {
      id: auth.userId,
      email: auth.email,
      firstName: '',
      lastName: '',
      role: auth.role
    };

    this.state.set({
      token: auth.token,
      tokenType: auth.tokenType || 'Bearer',
      user
    });
  }

  clear(): void {
    this.state.set({ token: null, tokenType: 'Bearer', user: null });
    localStorage.removeItem(STORAGE_KEY);
  }

  private loadState(): AuthState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { token: null, tokenType: 'Bearer', user: null };
      }
      const parsed = JSON.parse(raw) as AuthState;
      return {
        token: parsed.token ?? null,
        tokenType: parsed.tokenType ?? 'Bearer',
        user: parsed.user ?? null
      };
    } catch {
      return { token: null, tokenType: 'Bearer', user: null };
    }
  }
}
