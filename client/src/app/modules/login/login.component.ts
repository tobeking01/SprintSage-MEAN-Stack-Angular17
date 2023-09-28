import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
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
      email: [''],
      password: [''],
    });
  }

  login(): void {
    this.authService.loginService(this.loginForm.value).subscribe({
      next: (res) => {
        // After successful login
        const token = res.data?.token;
        const user = res.data;

        if (token) {
          // set the token to cookie and maybe in local storage
          this.cookieService.set('access_token', token);
        }
        if (user) {
          console.log('User Object:', user);
          this.authService.setCurrentUser(user); // Set the current user in AuthService

          const roles = this.authService.getUserRoles(); // get the user roles from AuthService
          console.log('User Roles: ', roles); // Log the roles

          // Default route in case no roles are assigned or user object is not available
          let navigateTo = ['not-found'];

          if (roles.includes('Admin')) {
            navigateTo = ['dashboard', 'admin-dashboard'];
          } else if (roles.includes('Moderator')) {
            navigateTo = ['dashboard', 'moderator-dashboard'];
          } else if (roles.length > 0) {
            navigateTo = ['dashboard', 'dashboard']; // Default dashboard for logged-in users with roles other than Admin or Moderator
          }
          console.log('Navigating To: ', navigateTo);

          this.router.navigate(navigateTo); // Navigate to the calculated route
        } else {
          console.error('User object is not available');
          this.router.navigate(['login']); // Navigate to login if user object is not available
        }

        this.snackBar.open('Login is Successful!', 'Close', {
          duration: 2000,
        });

        this.loginForm.reset();
      },
      error: (err) => {
        this.snackBar.open('Login Failed! Please try again.', 'Close', {
          duration: 2000,
        });
        console.error(err);
      },
    });
  }
}
