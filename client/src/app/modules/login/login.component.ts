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
        const token = res.data.token; // Check if the token is received in the response
        const user = res.data;
        if (user) {
          this.authService.setCurrentUser(user); // set the current user in the AuthService
        }

        // console.log('Login Response:', res); // test
        if (token) {
          // set the token to cookie and decode it
          this.cookieService.set('access_token', token);
        }
        this.snackBar.open('Login is Successful!', 'Close', {
          // <-- use MatSnackBar here
          duration: 2000,
        });
        this.loginForm.reset();
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        this.snackBar.open('Login Failed! Please try again.', 'Close', {
          // <-- and here
          duration: 2000,
        });
        console.log(err);
      },
    });
  }
}
