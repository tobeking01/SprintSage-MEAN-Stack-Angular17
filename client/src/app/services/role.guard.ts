import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleAndUserIdGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = Array.isArray(route.data['expectedRole'])
      ? route.data['expectedRole']
      : [];

    if (!expectedRoles.length) {
      console.error('Expected role not defined for route:', route.url);
      this.router.navigate(['not-found']);
      return false;
    }

    // Log information for debugging
    console.log('Is Logged In:', this.authService.isLoggedIn());
    console.log('User Roles:', this.authService.getUserRoles());
    console.log('Expected Roles:', expectedRoles);
    console.log('Activating route:', route.url);

    // Check if user is logged in and if any of the user roles is among the expected roles.
    if (
      !this.authService.isLoggedIn() ||
      !expectedRoles.some((role) =>
        this.authService.getUserRoles().includes(role)
      )
    ) {
      this.router.navigate(['unauthorized']);
      return false;
    }
    return true;
  }
}
