import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../Models/ApiResponse';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError(error => {
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message
        });
      } else {
        // Server-side error
        const apiError = error.error as ApiResponse<any>;
        if (apiError) {
          if (apiError.message) {
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: apiError.message
            });
          }
          if (apiError.errors?.length) {
            apiError.errors.forEach(err => {
              messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err
              });
            });
          }
        }
      }
      return throwError(() => error);
    })
  );
};
