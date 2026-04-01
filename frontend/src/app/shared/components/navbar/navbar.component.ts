import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../../core/store/cart.store';
import { AuthStore } from '../../../core/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-40 bg-white/90 ring-1 ring-slate-200/60">
      <div class="container-xl flex h-16 items-center justify-between gap-6">
        <a class="flex items-center gap-2 text-lg font-semibold tracking-tight" routerLink="/">
          <span class="h-3 w-3 rounded-full bg-slate-900"></span>
          <span class="text-slate-900">Aurora Market</span>
        </a>
        <nav class="flex items-center gap-4 text-sm font-medium text-slate-600">
          <a class="hover:text-slate-900 transition" routerLink="/catalog">Catalog</a>
          <a class="hover:text-slate-900 transition" routerLink="/my-orders" aria-disabled="true">Orders</a>
        </nav>
        <div class="flex items-center gap-3">
          <button
            class="relative rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.01]"
            type="button"
          >
            Cart
            <span
              class="absolute -right-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-500 px-1 text-[11px] font-semibold text-white"
            >
              {{ cartCount() }}
            </span>
          </button>
          @if (isAuthed()) {
            <div class="hidden text-sm font-semibold text-slate-700 sm:block">
              {{ vendorName() }}
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              (click)="onLogout()"
            >
              Logout
            </button>
          } @else {
            <a
              class="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              routerLink="/login"
            >
              Login
            </a>
            <a
              class="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              routerLink="/register"
            >
              Register
            </a>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);

  protected readonly cartCount = this.cartStore.count;
  protected readonly isAuthed = this.authStore.isAuthenticated;
  protected readonly vendorName = computed(() => {
    const user = this.authStore.user();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.email || 'Vendor';
  });

  onLogout(): void {
    this.authService.logout();
  }
}
