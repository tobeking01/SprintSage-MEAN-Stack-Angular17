import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { NavigationExtras, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.handleLoginError('Please fill out all fields.');
      return;
    }

    this.authService.loginService(this.loginForm.value).subscribe({
      next: (response: any) => {
        const user = response.data;

        if (!user || !user.roles || user.roles.length === 0) {
          this.handleLoginError('Invalid user or missing roles');
          return;
        }

        this.authService.setCurrentUser(user);
        const navigateTo = this.calculateNavigationRoute(user.roles, user.id);
        this.router.navigate(navigateTo);

        this.snackBar.open('Login is Successful!', 'Close', {
          duration: 2000,
        });

        this.loginForm.reset();
      },
      error: (err) => {
        this.handleLoginError('Login Failed! Please try again.');
      },
    });
  }

  private handleLoginError(errorMessage: string): void {
    this.snackBar.open(errorMessage, 'Close', { duration: 2000 });
  }

  private calculateNavigationRoute(roles: string[], userId: string): string[] {
    if (!userId) {
      this.navigateToError('User ID not found.');
      return [];
    }

    const roleRoutes: { [role: string]: string } = {
      Admin: `admin-dashboard/${userId}`,
      Professor: `professor-dashboard/${userId}`,
      Student: `student-dashboard/${userId}`,
    };

    for (const role of roles) {
      if (roleRoutes[role]) {
        return [roleRoutes[role]];
      }
    }

    this.navigateToError('Invalid Role');
    return [];
  }

  private navigateToError(message: string): void {
    const navigationExtras: NavigationExtras = {
      queryParams: { message: message },
    };
    this.router.navigate(['error'], navigationExtras);
  }
}
