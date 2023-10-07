import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { NavigationExtras, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../services/model/user.model';
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
        const navigateTo = this.calculateNavigationRoute(user.roles);
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
    this.snackBar.open(errorMessage, 'Close', {
      duration: 2000,
    });
  }

  private calculateNavigationRoute(roles: string[]): string[] {
    const validRoles = ['Admin', 'Professor', 'Student'];
    const hasValidRole = roles.some((role) => validRoles.includes(role));
    if (!hasValidRole) {
      const navigationExtras: NavigationExtras = {
        queryParams: { message: 'Invalid Role' },
      };
      this.router.navigate(['error'], navigationExtras);
      return [];
    }

    if (roles.includes('Admin'))
      return ['student-dashboard', 'admin-dashboard'];
    if (roles.includes('Professor'))
      return ['student-dashboard', 'professor-dashboard'];
    if (roles.includes('Student')) return ['student-dashboard'];

    const navigationExtras: NavigationExtras = {
      queryParams: { message: 'Invalid Role' },
    };
    this.router.navigate(['error'], navigationExtras);
    return [];
  }
}
