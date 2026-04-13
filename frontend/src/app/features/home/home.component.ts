import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AuthStore } from '../../core/store/auth.store';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly productService = inject(ProductService);
  protected readonly isAuthed = this.authStore.isAuthenticated;
  protected readonly Math = Math;
  protected readonly welcomeName = computed(() => {
    const user = this.authStore.user();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.email || 'Vendor';
  });

  // Promotional products signal
  readonly allProducts = signal<any[]>([
    { id: 1, name: 'Premium Wireless Headphones', price: 199.99, salePrice: 99.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', rating: 4.8, reviews: 342 },
    { id: 2, name: 'Vintage Leather Backpack', price: 149.99, salePrice: 89.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', rating: 4.6, reviews: 215 },
    { id: 3, name: 'Smart Watch Series X', price: 299.99, salePrice: 179.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop', rating: 4.7, reviews: 528 },
    { id: 4, name: '4K Webcam Pro', price: 129.99, salePrice: 69.99, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop', rating: 4.5, reviews: 189 },
    { id: 5, name: 'Mechanical Keyboard RGB', price: 159.99, salePrice: 99.99, image: 'https://images.unsplash.com/photo-1587829191301-dc798b83add3?w=500&h=500&fit=crop', rating: 4.9, reviews: 634 },
    { id: 6, name: 'USB-C Hub 7-in-1', price: 79.99, salePrice: 39.99, image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop', rating: 4.4, reviews: 147 }
  ]);

  readonly productsOnSale = computed(() => 
    this.allProducts().filter(p => p.salePrice && p.salePrice < p.price)
  );

  readonly discountPercentage = computed(() => (product: any) => {
    if (!product.salePrice) return 0;
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  });
}
