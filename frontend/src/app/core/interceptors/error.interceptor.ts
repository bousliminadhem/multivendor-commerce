import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ApiErrorResponse } from '../models/api-error-response';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const payload = (error.error || {}) as Partial<ApiErrorResponse>;
      const baseMessage = payload.message || deriveFallbackMessage(error.status);

      if (payload.errors && Object.keys(payload.errors).length) {
        const fieldMessages = Object.values(payload.errors).join(' · ');
        toast.error(`${baseMessage}: ${fieldMessages}`);
      } else {
        toast.error(baseMessage);
      }

      return throwError(() => error);
    })
  );
};

function deriveFallbackMessage(status: number): string {
  switch (status) {
    case 0:
      return 'Unable to reach server';
    case 400:
      return 'Validation failed';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Access denied';
    case 404:
      return 'Resource not found';
    default:
      return 'Unexpected error occurred';
  }
}
