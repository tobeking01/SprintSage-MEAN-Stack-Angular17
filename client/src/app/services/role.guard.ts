import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
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
