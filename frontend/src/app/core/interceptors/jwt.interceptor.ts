import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const rawToken = authStore.token()?.trim();
  if (!rawToken) {
    return next(req);
  }

  // Some backends return token with scheme included (e.g. "Bearer <jwt>").
  // Normalize to avoid accidentally sending "Bearer Bearer <jwt>".
  const hasScheme = /^[A-Za-z]+\s+.+$/.test(rawToken);
  const tokenType = authStore.tokenType()?.trim() || 'Bearer';
  const authHeader = hasScheme ? rawToken : `${tokenType} ${rawToken}`;

  const authReq = req.clone({
    setHeaders: { Authorization: authHeader }
  });

  return next(authReq);
};
