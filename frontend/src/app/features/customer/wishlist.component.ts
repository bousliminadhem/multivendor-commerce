import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProductDto } from '../../core/models/product-dto';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistComponent {
  private readonly wishlistService = inject(WishlistService);

  protected readonly items = this.wishlistService.items;

  protected isWishlisted(productId?: number): boolean {
    return this.wishlistService.isWishlisted(productId);
  }

  protected onToggleWishlist(product: ProductDto, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggle(product);
  }
}
