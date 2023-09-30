import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, User } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // <-- import MatSnackBar
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: [''],
      password: [''],
    });
  }

  login(): void {
    this.authService.loginService(this.loginForm.value).subscribe({
      next: (response: any) => {
        const user = response.data;

        if (!user) {
          this.handleLoginError('User object is not available');
          return;
        }

        this.authService.setCurrentUser(user); // Here user should be response.data
        const roles = this.authService.getUserRoles(); // Now get the user roles from AuthService

        // Calculate the navigation route based on the user roles
        let navigateTo = this.calculateNavigationRoute(roles);
        this.router.navigate(navigateTo); // Navigate to the calculated route

        this.snackBar.open('Login is Successful!', 'Close', {
          duration: 2000,
        });

        this.loginForm.reset();
      },
      error: (err) => {
        this.handleLoginError('Login Failed! Please try again.');
        console.error(err);
      },
    });
  }

  // A helper method to handle login errors and redirecting to login route
  private handleLoginError(errorMessage: string): void {
    console.error(errorMessage);
    this.snackBar.open(errorMessage, 'Close', {
      duration: 2000,
    });
    this.router.navigate(['login']); // Navigate to login if there is an error
  }

  // A helper method to calculate the navigation route based on user roles
  private calculateNavigationRoute(roles: string[]): string[] {
    console.log('Calculating navigation route for roles:', roles);
    // Default route in case no roles are assigned or user object is not available
    let navigateTo: string[] = ['not-found'];

    if (roles.includes('Admin')) {
      navigateTo = ['dashboard', 'admin-dashboard'];
    } else if (roles.includes('Moderator')) {
      navigateTo = ['dashboard', 'moderator-dashboard'];
    } else if (roles.length > 0) {
      // Default dashboard for logged-in users with roles other than Admin or Moderator
      navigateTo = ['dashboard', 'dashboard'];
    }
    return navigateTo;
  }
}
