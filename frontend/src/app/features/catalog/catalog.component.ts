import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, AfterViewInit, computed, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ProductDto } from '../../core/models/product-dto';
import { CategoryDto } from '../../core/models/category-dto';
import { CategoryStore } from '../../core/store/category.store';
import { WishlistService } from '../../core/services/wishlist.service';

interface PriceRange {
  min: number;
  max: number;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly categoryStore = inject(CategoryStore);
  private readonly wishlistService = inject(WishlistService);
  private readonly activatedRoute = inject(ActivatedRoute);

  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef<HTMLDivElement>;
  private intersectionObserver?: IntersectionObserver;

  // Expose Math for template
  protected readonly Math = Math;

  // Products state
  protected readonly products = signal<ProductDto[]>([]);
  protected readonly categories = this.categoryStore.categories;
  protected readonly loading = signal<boolean>(true);

  // Infinite scroll signals
  protected readonly displayedProductCount = signal(12);
  protected readonly hasMoreProducts = computed(() => this.displayedProductCount() < this.filteredProducts().length);

  // Filter signals
  protected readonly searchTerm = signal('');
  protected readonly priceRange = signal<PriceRange>({ min: 0, max: 10000 });
  protected readonly selectedCategoryIds = signal<Set<number>>(new Set());
  protected readonly minVendorRating = signal<number>(0);
  protected readonly sidebarOpen = signal(false);

  // Computed price range options
  protected readonly maxPrice = computed(() => {
    const prices = this.products().map(p => p.price || 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 100) * 100 : 10000;
  });

  // Computed properties for UI
  protected readonly flatCategories = computed(() => this.flattenCategories(this.categories()));

  protected readonly filteredProducts = computed(() => {
    const normalizedSearch = this.searchTerm().trim().toLowerCase();
    const { min, max } = this.priceRange();
    const categoryIds = this.selectedCategoryIds();
    const rating = this.minVendorRating();

    return this.products().filter((product) => {
      // Search filter
      const matchesSearch = !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch);

      // Price filter (use sale price if available, otherwise price)
      const productPrice = product.salePrice ?? product.price;
      const matchesPrice = productPrice >= min && productPrice <= max;

      // Category filter
      const matchesCategory = categoryIds.size === 0 || categoryIds.has(product.categoryId);

      // Vendor rating filter
      const matchesRating = !rating || (product.rating ?? 0) >= rating;

      return matchesSearch && matchesPrice && matchesCategory && matchesRating;
    });
  });

  // Displayed products with infinite scroll
  protected readonly displayedProducts = computed(() => {
    return this.filteredProducts().slice(0, this.displayedProductCount());
  });

  protected readonly resultCount = computed(() => this.filteredProducts().length);

  protected readonly skeletons = Array.from({ length: 12 }, (_, idx) => idx);

  ngOnInit(): void {
    this.loadProducts();
    this.categoryStore.loadCategories();

    // Read query parameters for category filter
    this.activatedRoute.queryParams.subscribe(params => {
      // Handle category ID from query params
      if (params['categoryId']) {
        const categoryId = parseInt(params['categoryId'], 10);
        if (!isNaN(categoryId)) {
          this.selectedCategoryIds.set(new Set([categoryId]));
        }
      }

      // Handle search term from query params
      if (params['search']) {
        this.searchTerm.set(params['search']);
      }

      // Reset displayed count when filters change
      this.displayedProductCount.set(12);
    });
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  // Setup Intersection Observer for infinite scroll
  private setupInfiniteScroll(): void {
    if (!this.scrollSentinel) {
      return;
    }

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && this.hasMoreProducts()) {
          this.loadMoreProducts();
        }
      }
    }, options);

    this.intersectionObserver.observe(this.scrollSentinel.nativeElement);
  }

  private loadMoreProducts(): void {
    const currentCount = this.displayedProductCount();
    const filteredCount = this.filteredProducts().length;
    const newCount = Math.min(currentCount + 12, filteredCount);
    this.displayedProductCount.set(newCount);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  // Search input handler
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  // Price range handlers
  onMinPriceChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.priceRange.update(range => ({
      ...range,
      min: Math.min(value, range.max)
    }));
  }

  onMaxPriceChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.priceRange.update(range => ({
      ...range,
      max: Math.max(value, range.min)
    }));
  }

  // Category selection handlers
  onCategoryToggle(categoryId: number): void {
    this.selectedCategoryIds.update(ids => {
      const newIds = new Set(ids);
      if (newIds.has(categoryId)) {
        newIds.delete(categoryId);
      } else {
        newIds.add(categoryId);
      }
      return newIds;
    });
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds().has(categoryId);
  }

  onClearFilters(): void {
    this.searchTerm.set('');
    this.priceRange.set({ min: 0, max: 10000 });
    this.selectedCategoryIds.set(new Set());
    this.minVendorRating.set(0);
  }

  // Vendor rating handler
  onRatingChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.minVendorRating.set(value);
  }

  // Wishlist handlers
  isWishlisted(productId?: number): boolean {
    return this.wishlistService.isWishlisted(productId);
  }

  onToggleWishlist(product: ProductDto, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggle(product);
  }

  // Sidebar toggle
  onToggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  // Helper method to flatten nested categories
  private flattenCategories(categories: CategoryDto[]): CategoryDto[] {
    const flat: CategoryDto[] = [];
    const traverse = (cats: CategoryDto[]) => {
      for (const cat of cats) {
        flat.push(cat);
        if (cat.subCategories?.length) {
          traverse(cat.subCategories);
        }
      }
    };
    traverse(categories);
    return flat;
  }

  // Get category by ID with parent info
  protected getCategoryPath(categoryId: number): string {
    const category = this.flatCategories().find(c => c.id === categoryId);
    return category?.name || 'Category';
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService
      .getAll({ page: 0, size: 50 })
      .subscribe({
        next: (page) => this.products.set(page.content),
        error: () => this.products.set([]),
        complete: () => this.loading.set(false)
      });
  }
}
