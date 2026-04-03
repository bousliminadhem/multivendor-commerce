import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, catchError, startWith, tap, map } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { ProductDto } from '../../core/models/product-dto';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { OrderDto } from '../../core/models/order-dto';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedImage = signal<string | null>(null);
  readonly zoomedImage = signal<string | null>(null);
  readonly checkoutOpen = signal(false);
  readonly shippingAddress = signal('');
  readonly checkoutError = signal<string | null>(null);
  readonly placingOrder = signal(false);
  readonly orderSuccess = signal<OrderDto | null>(null);
  readonly skeletons = Array.from({ length: 5 }, (_, index) => index);

  // Convenience getter for template control flow
  readonly isLoading = () => this.loading();
  readonly isVendor = () => this.authService.getCurrentUser()?.role === 'VENDOR';

  private readonly productSignal = toSignal(
    this.route.paramMap.pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      map((params) => {
        const idParam = params.get('id');
        const id = idParam != null ? Number(idParam) : NaN;
        if (Number.isNaN(id)) {
          this.error.set('Invalid product id.');
        }
        return id;
      }),
      switchMap((id): Observable<ProductDto | null> => {
        if (Number.isNaN(id)) {
          return of<ProductDto | null>(null);
        }
        return this.productService.getById(id).pipe(
          map((product) => product as ProductDto | null),
          catchError(() => {
            this.error.set('Unable to load product.');
            return of<ProductDto | null>(null);
          })
        );
      }),
      tap(() => this.loading.set(false)),
      startWith(null as ProductDto | null)
    )
  );

  readonly product = this.productSignal;

  readonly productImages = computed(() => {
    const product = this.product();
    if (!product) {
      return [] as string[];
    }

    const images = (product.imageUrls ?? []).filter((url): url is string => !!url);
    if (images.length > 0) {
      return images;
    }

    return product.imageUrl ? [product.imageUrl] : [];
  });

  constructor() {
    effect(() => {
      const images = this.productImages();
      const current = this.selectedImage();

      if (images.length === 0) {
        if (current != null) {
          this.selectedImage.set(null);
        }
        return;
      }

      if (current == null || !images.includes(current)) {
        this.selectedImage.set(images[0]);
      }
    });
  }

  onBack(): void {
    this.location.back();
  }

  onBuyNow(): void {
    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please sign in to place an order.');
      this.router.navigate(['/login']);
      return;
    }

    this.checkoutError.set(null);
    this.checkoutOpen.set(true);
  }

  onCloseCheckout(): void {
    this.checkoutOpen.set(false);
    this.checkoutError.set(null);
    this.orderSuccess.set(null);
  }

  onShippingAddressInput(event: Event): void {
    this.shippingAddress.set((event.target as HTMLTextAreaElement).value);
  }

  onConfirmCheckout(): void {
    const product = this.product();
    const address = this.shippingAddress().trim();

    if (!product?.id) {
      this.checkoutError.set('Unable to place order for this product.');
      return;
    }

    if (address.length < 8) {
      this.checkoutError.set('Please provide a valid shipping address.');
      return;
    }

    // Validate stock before submission
    if ((product.stockQuantity ?? 0) < 1) {
      this.checkoutError.set('This product is currently out of stock.');
      this.toast.error('Out of stock: unable to complete order.');
      return;
    }

    const payload: OrderDto = {
      shippingAddress: address,
      items: [
        {
          productId: product.id,
          quantity: 1
        }
      ]
    };

    this.placingOrder.set(true);
    this.checkoutError.set(null);

    this.orderService
      .place(payload)
      .pipe(finalize(() => this.placingOrder.set(false)))
      .subscribe({
        next: (orderResponse) => {
          this.orderSuccess.set(orderResponse);
          this.toast.success('Order placed successfully.');
          setTimeout(() => {
            this.shippingAddress.set('');
            this.checkoutOpen.set(false);
            this.orderSuccess.set(null);
            this.router.navigate(['/customer/orders']);
          }, 2000);
        },
        error: (err) => {
          const status = err?.status ?? 500;
          if (status === 400) {
            const errorMsg = err?.error?.message || 'Invalid order data. Please check your input.';
            this.checkoutError.set(errorMsg);
            this.toast.error(errorMsg);
          } else {
            const fallbackMsg = 'Unable to place order right now. Please try again.';
            this.checkoutError.set(fallbackMsg);
            this.toast.error(fallbackMsg);
          }
        }
      });
  }

  onSelectImage(imageUrl: string): void {
    this.selectedImage.set(imageUrl);
  }

  onOpenZoom(imageUrl: string): void {
    this.zoomedImage.set(imageUrl);
  }

  onCloseZoom(): void {
    this.zoomedImage.set(null);
  }
}
