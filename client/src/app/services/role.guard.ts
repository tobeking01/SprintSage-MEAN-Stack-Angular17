import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];

    console.log('User Roles:', this.authService.getUserRoles()); // Log user roles
    console.log('Expected Role:', expectedRole); // Log expected role
    console.log('Activating route:', route.url);
    if (
      !this.authService.isLoggedIn() ||
      !this.authService.getUserRoles().includes(expectedRole)
    ) {
      console.log('Navigating to Home Component'); // Log if navigating to HomeComponent
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}
