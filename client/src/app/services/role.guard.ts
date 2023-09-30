import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole: string = route.data['expectedRole'];
    if (!expectedRole) {
      console.error('Expected role not defined for route:', route.url);
      this.router.navigate(['']);
      return false;
    }

    console.log('Is Logged In:', this.authService.isLoggedIn()); // Log login status
    console.log('User Roles:', this.authService.getUserRoles()); // Log user roles
    console.log('Expected Role:', expectedRole); // Log expected role
    console.log('Activating route:', route.url);

    if (
      !this.authService.isLoggedIn() ||
      !this.authService.getUserRoles().includes(expectedRole)
    ) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
