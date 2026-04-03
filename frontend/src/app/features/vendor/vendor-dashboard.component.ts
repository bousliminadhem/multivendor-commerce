import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { VendorService } from '../../core/services/vendor.service';
import { PageRequest } from '../../core/utils/http-params.util';
import { ProductDto } from '../../core/models/product-dto';
import { OrderDto } from '../../core/models/order-dto';
import { combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorDashboardComponent {
  private readonly vendorService = inject(VendorService);
  private readonly authStore = inject(AuthStore);

  // Paging state as a signal
  readonly page = signal<PageRequest>({ page: 0, size: 9 });

  readonly vendorId = this.vendorService.vendorId;

  protected readonly isAdmin = computed(() => this.authStore.isAdmin());

  // Products signal derived from vendorId + page without manual subscriptions
  private readonly productsSignal = toSignal(
    combineLatest([
      toObservable(this.vendorService.vendorId),
      toObservable(this.page)
    ]).pipe(
      switchMap(([vendorId, page]) =>
        vendorId == null
          ? of<ProductDto[]>([])
          : this.vendorService
              .getVendorProducts(vendorId, page)
              .pipe(map((res) => res.content))
      ),
      startWith([] as ProductDto[])
    ),
    { initialValue: [] as ProductDto[] }
  );

  // Orders for stats
  // Vendor orders API is not implemented on the backend yet,
  // so we keep stats as zeroed placeholders to avoid 500s.
  private readonly ordersSignal = signal<OrderDto[]>([]);

  readonly products = computed(() => this.productsSignal());
  readonly totalOrders = computed(() => this.ordersSignal().length);
  readonly totalRevenue = computed(() =>
    this.ordersSignal().reduce((sum: number, order: OrderDto) => sum + (order.totalAmount ?? 0), 0)
  );

  constructor() {
    // Initialize vendor context from the authenticated user.
    const userId = this.authStore.user()?.id ?? null;
    this.vendorService.setVendor(userId);
  }
}
