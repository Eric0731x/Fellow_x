import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, PaginatedResult<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<PaginatedResult<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && 'items' in data && 'total' in data) {
          return data as PaginatedResult<T>;
        }
        return data;
      }),
    );
  }
}
