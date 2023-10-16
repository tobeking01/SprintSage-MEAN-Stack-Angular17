import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {
  constructor(private authService: AuthService, private router: Router) {}

  goToLoginPage(): void {
    // Log the user out
    this.authService.logout();

    // Navigate to the login page
    this.router.navigate(['/login']);
  }
}
