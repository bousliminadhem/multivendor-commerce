import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VendorAnalyticsDto } from '../models/vendor-analytics-dto';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/analytics`;

  getVendorAnalytics(vendorId: number) {
    return this.http.get<VendorAnalyticsDto>(`${this.baseUrl}/vendor/${vendorId}`);
  }

  getDashboardMetrics() {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getSalesReport(startDate: string, endDate: string) {
    return this.http.get<any>(`${this.baseUrl}/sales`, {
      params: { startDate, endDate }
    });
  }
}
