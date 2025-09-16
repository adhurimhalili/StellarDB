import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../Services/Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // If user is already authenticated, redirect to home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/Home']);
      return false;
    }

    // Allow access to the route if user is not authenticated
    return true;
  }
}
