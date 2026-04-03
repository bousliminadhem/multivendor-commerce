import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductDto } from '../../core/models/product-dto';
import { CategoryDto } from '../../core/models/category-dto';
import { CategoryStore } from '../../core/store/category.store';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgIf, CurrencyPipe, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryStore = inject(CategoryStore);
  private readonly wishlistService = inject(WishlistService);

  protected readonly products = signal<ProductDto[]>([]);
  protected readonly categories = this.categoryStore.categories;
  protected readonly loading = signal<boolean>(true);
  protected readonly searchTerm = signal('');
  protected readonly selectedCategoryId = signal<number | null>(null);
  protected readonly skeletons = Array.from({ length: 6 }, (_, idx) => idx);

  protected readonly filteredProducts = computed(() => {
    const normalizedSearch = this.searchTerm().trim().toLowerCase();
    const categoryId = this.selectedCategoryId();

    return this.products().filter((product) => {
      const matchesSearch = !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch);
      const matchesCategory = categoryId == null || product.categoryId === categoryId;
      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit(): void {
    this.loadProducts();
    this.categoryStore.loadCategories();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onCategoryChange(event: Event): void {
    const rawValue = (event.target as HTMLSelectElement).value;
    this.selectedCategoryId.set(rawValue === 'all' ? null : Number(rawValue));
  }

  isWishlisted(productId?: number): boolean {
    return this.wishlistService.isWishlisted(productId);
  }

  onToggleWishlist(product: ProductDto, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggle(product);
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService
      .getAll({ page: 0, size: 24 })
      .subscribe({
        next: (page) => this.products.set(page.content),
        error: () => this.products.set([]),
        complete: () => this.loading.set(false)
      });
  }
}
