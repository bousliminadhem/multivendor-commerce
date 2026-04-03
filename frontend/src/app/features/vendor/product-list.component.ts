import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VendorService } from '../../core/services/vendor.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductDto } from '../../core/models/product-dto';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  private readonly vendorService = inject(VendorService);
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly products = signal<ProductDto[]>([]);

  readonly hasVendor = computed(() => this.vendorService.vendorId() != null);

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    const vendorId = this.vendorService.vendorId();
    if (vendorId == null) {
      this.error.set('Vendor ID is not set. Please log in as a vendor.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.vendorService
      .getVendorProducts(vendorId, { page: 0, size: 50 })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (page) => {
          this.products.set(page.content ?? []);
        },
        error: () => {
          this.error.set('Unable to load products right now.');
        }
      });
  }

  onDelete(product: ProductDto): void {
    if (!product.id) {
      return;
    }
    const confirmed = window.confirm(`Delete product \"${product.name}\"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    this.productService
      .delete(product.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Product deleted.');
          this.loadProducts();
        },
        error: () => {
          this.toast.error('Unable to delete product.');
        }
      });
  }
}
