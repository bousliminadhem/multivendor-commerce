import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageRequest, buildHttpParams } from '../utils/http-params.util';
import { PageResponse } from '../models/page-response';
import { ProductDto } from '../models/product-dto';
import { OrderDto } from '../models/order-dto';

export interface VendorProductQuery extends PageRequest {
  search?: string;
  categoryId?: number;
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/vendors`;

  // Track the currently selected vendor for dashboards so views react via signals.
  private readonly vendorIdSignal = signal<number | null>(null);
  readonly vendorId = computed(() => this.vendorIdSignal());

  setVendor(vendorId: number | null) {
    this.vendorIdSignal.set(vendorId);
  }

  getVendorProducts(vendorId: number | null = this.vendorId(), query?: VendorProductQuery) {
    if (vendorId == null) {
      throw new Error('Vendor ID is required to load vendor products');
    }
    // Backend should expose /api/vendors/{vendorId}/products with pageable + filters.
    return this.http.get<PageResponse<ProductDto>>(
      `${this.baseUrl}/${vendorId}/products`,
      { params: buildHttpParams(query) }
    );
  }

  getVendorOrders(vendorId: number | null = this.vendorId(), page?: PageRequest) {
    if (vendorId == null) {
      throw new Error('Vendor ID is required to load vendor orders');
    }
    // Backend should expose /api/vendors/{vendorId}/orders returning Page<OrderDto>.
    return this.http.get<PageResponse<OrderDto>>(
      `${this.baseUrl}/${vendorId}/orders`,
      { params: buildHttpParams(page) }
    );
  }
}
