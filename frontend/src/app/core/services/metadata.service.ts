import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BannerMetadataDto } from '../models/banner-metadata-dto';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/metadata`;

  getActiveBanners() {
    return this.http.get<BannerMetadataDto[]>(`${this.baseUrl}/banners/active`);
  }

  getAllBanners() {
    return this.http.get<BannerMetadataDto[]>(`${this.baseUrl}/banners`);
  }

  getBannerById(id: number) {
    return this.http.get<BannerMetadataDto>(`${this.baseUrl}/banners/${id}`);
  }

  createBanner(banner: BannerMetadataDto) {
    return this.http.post<BannerMetadataDto>(`${this.baseUrl}/banners`, banner);
  }

  updateBanner(id: number, banner: BannerMetadataDto) {
    return this.http.put<BannerMetadataDto>(`${this.baseUrl}/banners/${id}`, banner);
  }

  deleteBanner(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/banners/${id}`);
  }

  getFooterContent() {
    return this.http.get<any>(`${this.baseUrl}/footer`);
  }
}
