import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../../core/store/cart.store';
import { AuthStore } from '../../../core/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  protected readonly authService = inject(AuthService);

  protected readonly cartCount = this.cartStore.count;
  protected readonly isAuthed = this.authStore.isAuthenticated;
  protected readonly isAdmin = computed(() => this.authStore.user()?.role?.toUpperCase() === 'ADMIN');
  protected readonly vendorName = computed(() => {
    const user = this.authStore.user();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.email || 'Vendor';
  });

  onLogout(): void {
    this.authService.logout();
  }
}
