import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/services/user.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  private readonly userService = inject(UserService);
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalUsers = signal(0);
  readonly totalVendors = signal(0);
  readonly totalProducts = signal(0);

  constructor() {
    this.loadStats();
  }

  onRefreshStats(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      usersPage: this.userService.getAll({ page: 0, size: 5000 }),
      productsPage: this.productService.getAll({ page: 0, size: 1 })
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ usersPage, productsPage }) => {
          const users = usersPage.content ?? [];
          this.totalUsers.set(usersPage.totalElements ?? users.length);
          this.totalVendors.set(
            users.filter((user) => (user.role ?? '').toUpperCase().replace('ROLE_', '') === 'VENDOR').length
          );
          this.totalProducts.set(productsPage.totalElements ?? 0);
        },
        error: () => {
          this.error.set('Unable to load admin overview right now.');
        }
      });
  }
}
