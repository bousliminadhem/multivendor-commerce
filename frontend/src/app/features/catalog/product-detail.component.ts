import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, catchError, startWith, tap, map, finalize } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { ProductDto } from '../../core/models/product-dto';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
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
  readonly quantity = signal(1);
  readonly skeletons = Array.from({ length: 5 }, (_, index) => index);

  // Convenience getter for template control flow
  readonly isLoading = () => this.loading();
  readonly isVendor = () => this.authService.getCurrentUser()?.role === 'VENDOR';

  readonly discountedPrice = computed(() => {
    const product = this.product();
    if (!product?.discountPercentage) return product?.price ?? 0;
    return product.price * (1 - product.discountPercentage / 100);
  });

  readonly totalPrice = computed(() => {
    return this.discountedPrice() * this.quantity();
  });

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
            this.error.set('Unable to load product. Please try again.');
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

  onQuantityChange(delta: number): void {
    const newQty = this.quantity() + delta;
    const stock = this.product()?.stockQuantity ?? 0;
    if (newQty >= 1 && newQty <= stock) {
      this.quantity.set(newQty);
    }
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
    this.quantity.set(1);
    this.shippingAddress.set('');
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
    const qty = this.quantity();
    if ((product.stockQuantity ?? 0) < qty) {
      this.checkoutError.set(`Only ${product.stockQuantity} item(s) available.`);
      this.toast.error('Insufficient stock.');
      return;
    }

    const payload: OrderDto = {
      shippingAddress: address,
      items: [
        {
          productId: product.id,
          quantity: qty,
          unitPrice: this.discountedPrice(),
          productName: product.name
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
          this.toast.success('Order placed successfully!');
          setTimeout(() => {
            this.onCloseCheckout();
            this.router.navigate(['/my-orders']);
          }, 2000);
        },
        error: (err) => {
          const status = err?.status ?? 500;
          if (status === 400) {
            const errorMsg = err?.error?.message || 'Invalid order data. Please check your input.';
            this.checkoutError.set(errorMsg);
            this.toast.error(errorMsg);
          } else if (status === 409) {
            const errorMsg = 'This order was already processed. Please refresh the page.';
            this.checkoutError.set(errorMsg);
            this.toast.error('Duplicate order detected.');
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

