import { HttpParams } from '@angular/common/http';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface PageRequest extends QueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export function buildHttpParams(base?: QueryParams): HttpParams {
  let params = new HttpParams();
  if (!base) {
    return params;
  }

  Object.entries(base).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    params = params.set(key, String(value));
  });

  return params;
}
