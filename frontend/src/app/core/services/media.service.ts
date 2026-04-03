import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MediaUploadResponse {
  url: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly uploadUrl = `${environment.apiBaseUrl}/media/upload`;

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<MediaUploadResponse>(this.uploadUrl, formData).pipe(
      map((response) => response.url)
    );
  }
}
