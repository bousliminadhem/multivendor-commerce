import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { VendorService } from '../../core/services/vendor.service';
import { PageRequest } from '../../core/utils/http-params.util';
import { ProductDto } from '../../core/models/product-dto';
import { OrderDto } from '../../core/models/order-dto';
import { combineLatest, map, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <div class="flex min-h-screen">
        <aside class="w-64 border-r border-slate-200 bg-white/80 backdrop-blur">
          <div class="p-6 font-semibold text-slate-900">Vendor Console</div>
          <nav class="px-4 space-y-2 text-sm text-slate-600">
            <div class="px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium">Dashboard</div>
            <div class="px-3 py-2 rounded-lg hover:bg-slate-100 transition">Products</div>
            <div class="px-3 py-2 rounded-lg hover:bg-slate-100 transition">Orders</div>
          </nav>
        </aside>

        <main class="flex-1 p-8 space-y-8">
          <header class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">Multi-vendor overview</p>
              <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
            </div>
            <div class="text-sm text-slate-500">Vendor ID: {{ vendorId() ?? '—' }}</div>
          </header>

          <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p class="text-sm text-slate-500">Total Orders</p>
              <p class="mt-2 text-3xl font-semibold text-slate-900">{{ totalOrders() }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p class="text-sm text-slate-500">Revenue</p>
              <p class="mt-2 text-3xl font-semibold text-slate-900">{{ totalRevenue() | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-slate-500">Products</p>
                <h2 class="text-xl font-semibold text-slate-900">Catalog</h2>
              </div>
              <div class="text-sm text-slate-500">Showing page {{ (page().page ?? 0) + 1 }}</div>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @if (products().length === 0) {
                <div class="col-span-full text-sm text-slate-500">No products for this vendor yet.</div>
              }
              @for (product of products(); track product.id ?? product.name) {
                <article class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-xs hover:shadow-sm transition">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h3 class="text-base font-semibold text-slate-900">{{ product.name }}</h3>
                      <p class="text-sm text-slate-500 line-clamp-2">{{ product.description || 'No description' }}</p>
                    </div>
                    <span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">{{ product.categoryName || 'Category' }}</span>
                  </div>
                  <div class="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span class="text-lg font-semibold text-slate-900">{{ product.price | currency:'USD':'symbol':'1.0-2' }}</span>
                    <span class="rounded-lg bg-white px-2 py-1 text-xs font-medium border border-slate-200">Stock: {{ product.stockQuantity }}</span>
                  </div>
                  <p class="mt-2 text-xs text-slate-500">Updated {{ product.updatedAt ? (product.updatedAt | date:'medium') : '—' }}</p>
                </article>
              }
            </div>
          </section>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorDashboardComponent {
  private readonly vendorService = inject(VendorService);

  // Paging state as a signal
  readonly page = signal<PageRequest>({ page: 0, size: 9 });

  readonly vendorId = this.vendorService.vendorId;

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
  private readonly ordersSignal = toSignal(
    toObservable(this.vendorService.vendorId).pipe(
      switchMap((vendorId) =>
        vendorId == null
          ? of<OrderDto[]>([])
          : this.vendorService
              .getVendorOrders(vendorId, { page: 0, size: 5 })
              .pipe(map((res) => res.content))
      ),
      startWith([] as OrderDto[])
    ),
    { initialValue: [] as OrderDto[] }
  );

  readonly products = computed(() => this.productsSignal());
  readonly totalOrders = computed(() => this.ordersSignal().length);
  readonly totalRevenue = computed(() =>
    this.ordersSignal().reduce((sum: number, order: OrderDto) => sum + (order.totalAmount ?? 0), 0)
  );
}
