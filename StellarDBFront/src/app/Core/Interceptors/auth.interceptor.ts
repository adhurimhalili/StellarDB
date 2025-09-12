import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../Services/Auth/auth.service';

export const AuthInterceptor: {
  intercept: HttpInterceptorFn
} = {
  intercept: (request, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next(request);
  }
};
