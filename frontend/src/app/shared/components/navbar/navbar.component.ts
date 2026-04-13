import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartStore } from '../../../core/store/cart.store';
import { AuthStore } from '../../../core/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryStore } from '../../../core/store/category.store';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CategoryDto } from '../../../core/models/category-dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly categoryStore = inject(CategoryStore);
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  protected readonly cartCount = this.cartStore.count;
  protected readonly isAuthed = this.authStore.isAuthenticated;
  protected readonly user = this.authStore.user;
  protected readonly categories = this.categoryStore.categories;
  protected readonly wishlistCount = computed(() => this.wishlistService.count());
  
  readonly isAdmin = computed(() => this.authStore.user()?.role?.toUpperCase() === 'ADMIN');
  readonly isVendor = computed(() => this.authStore.user()?.role?.toUpperCase() === 'VENDOR');
  readonly isCustomer = computed(() => this.authStore.user()?.role?.toUpperCase() === 'CUSTOMER');
  
  readonly mobileMenuOpen = signal(false);
  readonly megaMenuOpen = signal(false);
  readonly activeCategory = signal<number | null>(null);
  readonly searchOpen = signal(false);
  readonly searchTerm = signal('');
  readonly currentLocale = signal('en_US');

  readonly vendorDisplay = computed(() => {
    const user = this.authStore.user();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.email || 'Account';
  });

  readonly localeDisplay = computed(() => {
    const locale = this.currentLocale();
    const [lang, country] = locale.split('_');
    const langName = new Intl.DisplayNames([locale], { type: 'language' }).of(lang);
    return `${langName} (${country})`;
  });

  ngOnInit(): void {
    this.categoryStore.loadCategories();
    
    // Close menus when navigating
    effect(() => {
      this.mobileMenuOpen.set(false);
      this.megaMenuOpen.set(false);
    });
  }

  onToggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
    this.megaMenuOpen.set(false);
  }

  onToggleMegaMenu(): void {
    this.megaMenuOpen.update(v => !v);
  }

  onCategoryHover(categoryId: number | null): void {
    this.activeCategory.set(categoryId);
  }

  onToggleSearch(): void {
    this.searchOpen.update(v => !v);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const term = this.searchTerm().trim();
    if (term) {
      this.router.navigate(['/catalog'], { queryParams: { search: term } });
      this.searchOpen.set(false);
      this.searchTerm.set('');
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onNavigateTo(path: string): void {
    this.router.navigate([path]);
    this.mobileMenuOpen.set(false);
    this.megaMenuOpen.set(false);
  }

  onNavigateToCategoryProducts(categoryId: number, categoryName?: string): void {
    this.router.navigate(['/catalog'], { 
      queryParams: { 
        categoryId: categoryId,
        ...(categoryName && { category: categoryName })
      } 
    });
    this.mobileMenuOpen.set(false);
    this.megaMenuOpen.set(false);
    this.activeCategory.set(null);
  }

  onCopyMapAddress(): void {
    const address = '123 Market Street, Commerce City, CC 12345';
    navigator.clipboard.writeText(address).then(() => {
      console.log('Address copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy address:', err);
    });
  }

  onLocaleChange(locale: string): void {
    this.currentLocale.set(locale);
  }

  onLocaleSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.onLocaleChange(value);
  }
}
