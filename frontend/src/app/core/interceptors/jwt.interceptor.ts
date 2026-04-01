import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token();
  if (!token) {
    return next(req);
  }

  const authHeader = `${authStore.tokenType() || 'Bearer'} ${token}`.trim();
  const authReq = req.clone({
    setHeaders: { Authorization: authHeader }
  });

  return next(authReq);
};
