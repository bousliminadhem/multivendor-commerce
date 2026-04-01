import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProductDto } from '../models/product-dto';
import { PageResponse } from '../models/page-response';
import { PageRequest, buildHttpParams } from '../utils/http-params.util';

export interface ProductQuery extends PageRequest {
  categoryId?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/products`;

  getAll(query?: ProductQuery) {
    return this.http.get<PageResponse<ProductDto>>(this.baseUrl, {
      params: buildHttpParams(query)
    });
  }

  getById(id: number) {
    return this.http.get<ProductDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: ProductDto) {
    return this.http.post<ProductDto>(this.baseUrl, dto);
  }

  update(id: number, dto: ProductDto) {
    return this.http.put<ProductDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
