import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

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
    private router: Router
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
        alert('Login is Success!');
        this.loginForm.reset();
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
