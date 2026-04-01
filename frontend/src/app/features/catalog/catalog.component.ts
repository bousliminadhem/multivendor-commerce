import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, NgIf } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { ProductDto } from '../../core/models/product-dto';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgIf, CurrencyPipe],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-2">
        <p class="text-sm font-semibold uppercase tracking-wide text-primary-500">Catalog</p>
        <h1 class="text-3xl font-semibold text-slate-900">Curated products</h1>
        <p class="text-slate-600">Minimalist browsing with live data from the Spring backend.</p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @if (loading()) {
          @for (s of skeletons; track s) {
            <div class="card p-5">
              <div class="skeleton mb-4 h-40"></div>
              <div class="skeleton mb-2 h-4 w-3/4"></div>
              <div class="skeleton h-4 w-1/2"></div>
            </div>
          }
        } @else {
          @for (product of products(); track product.id) {
            <article class="card flex flex-col p-5">
              <div class="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-50">
                <img
                  *ngIf="product.imageUrl"
                  [src]="product.imageUrl"
                  [alt]="product.name"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="mt-4 flex flex-1 flex-col gap-2">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-slate-900">{{ product.name }}</h3>
                  <span class="text-base font-semibold text-slate-900">
                    {{ product.price | currency:'USD':'symbol' }}
                  </span>
                </div>
                <p class="line-clamp-2 text-sm text-slate-600">{{ product.description }}</p>
                <div class="mt-auto flex items-center justify-between text-sm text-slate-500">
                  <span>{{ product.categoryName || 'Category' }}</span>
                  <span>{{ product.stockQuantity }} in stock</span>
                </div>
              </div>
            </article>
          }
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);

  protected readonly products = signal<ProductDto[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly skeletons = Array.from({ length: 6 }, (_, idx) => idx);

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService
      .getAll({ page: 0, size: 9 })
      .subscribe({
        next: (page) => this.products.set(page.content),
        error: () => this.products.set([]),
        complete: () => this.loading.set(false)
      });
  }
}
