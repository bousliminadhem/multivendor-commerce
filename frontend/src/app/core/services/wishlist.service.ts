import { Injectable, computed, effect, signal } from '@angular/core';
import { ProductDto } from '../models/product-dto';

const STORAGE_KEY = 'ecommerce_wishlist_products';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly itemsSignal = signal<ProductDto[]>(this.loadItems());

  readonly items = computed(() => this.itemsSignal());
  readonly count = computed(() => this.itemsSignal().length);

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.itemsSignal()));
    });
  }

  isWishlisted(productId?: number): boolean {
    if (productId == null) {
      return false;
    }
    return this.itemsSignal().some((item) => item.id === productId);
  }

  toggle(product: ProductDto): void {
    if (product.id == null) {
      return;
    }

    if (this.isWishlisted(product.id)) {
      this.itemsSignal.update((items) => items.filter((item) => item.id !== product.id));
      return;
    }

    this.itemsSignal.update((items) => [product, ...items]);
  }

  remove(productId: number): void {
    this.itemsSignal.update((items) => items.filter((item) => item.id !== productId));
  }

  private loadItems(): ProductDto[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as ProductDto[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
