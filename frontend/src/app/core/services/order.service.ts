import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OrderDto } from '../models/order-dto';
import { PageResponse } from '../models/page-response';
import { PageRequest, buildHttpParams } from '../utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/orders`;

  place(order: OrderDto) {
    return this.http.post<OrderDto>(this.baseUrl, order);
  }

  getMyOrders(page?: PageRequest) {
    return this.http.get<PageResponse<OrderDto>>(`${this.baseUrl}/my-orders`, {
      params: buildHttpParams(page)
    });
  }

  getVendorOrders(page?: PageRequest) {
    let params = buildHttpParams(page);
    params = params.append('vendorOrders', 'true');
    return this.http.get<PageResponse<OrderDto>>(this.baseUrl, {
      params
    });
  }

  getById(id: number) {
    return this.http.get<OrderDto>(`${this.baseUrl}/${id}`);
  }

  getAll(page?: PageRequest) {
    return this.http.get<PageResponse<OrderDto>>(this.baseUrl, {
      params: buildHttpParams(page)
    });
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<OrderDto>(`${this.baseUrl}/${id}/status`, null, {
      params: buildHttpParams({ status })
    });
  }
}
