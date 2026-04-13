import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { ToastService } from '../services/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Generate UUID v4 for idempotency keys
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const toastService = inject(ToastService);
  
  const rawToken = authStore.token()?.trim();
  
  let authReq = req;
  
  // Add Authorization header if token exists
  if (rawToken) {
    const hasScheme = /^[A-Za-z]+\s+.+$/.test(rawToken);
    const tokenType = authStore.tokenType()?.trim() || 'Bearer';
    const authHeader = hasScheme ? rawToken : `${tokenType} ${rawToken}`;

    authReq = req.clone({
      setHeaders: { Authorization: authHeader }
    });
  }

  // Add X-Idempotency-Key header for POST/PUT/DELETE requests
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    authReq = authReq.clone({
      setHeaders: { 'X-Idempotency-Key': generateUUID() }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 409 Conflict with elegant toast notification
      if (error.status === 409) {
        toastService.info('This action has already been processed. Please refresh to see updates.');
      }
      
      return throwError(() => error);
    })
  );
};
