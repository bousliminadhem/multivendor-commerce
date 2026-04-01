import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserDto } from '../models/user-dto';
import { PageResponse } from '../models/page-response';
import { PageRequest, buildHttpParams } from '../utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  getAll(page?: PageRequest) {
    return this.http.get<PageResponse<UserDto>>(this.baseUrl, {
      params: buildHttpParams(page)
    });
  }

  getById(id: number) {
    return this.http.get<UserDto>(`${this.baseUrl}/${id}`);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
