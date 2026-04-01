import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CategoryDto } from '../models/category-dto';
import { PageResponse } from '../models/page-response';
import { PageRequest, buildHttpParams } from '../utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/categories`;

  getAll(page?: PageRequest) {
    return this.http.get<PageResponse<CategoryDto>>(this.baseUrl, {
      params: buildHttpParams(page)
    });
  }

  getById(id: number) {
    return this.http.get<CategoryDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CategoryDto) {
    return this.http.post<CategoryDto>(this.baseUrl, dto);
  }

  update(id: number, dto: CategoryDto) {
    return this.http.put<CategoryDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
