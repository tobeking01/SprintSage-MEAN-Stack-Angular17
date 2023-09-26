import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  AuthService = inject(AuthService);
  router: any;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
    });
  }

  login() {
    // Calling the loginService method from the AuthService
    // with the values from the loginForm as its argument
    this.AuthService.loginService(this.loginForm.value).subscribe({
      // The next function handles successful responses from the service
      next: (res) => {
        alert('Login is Success!');
        this.loginForm.reset();
        this.router.navigate(['dashboard']);
      },
      // The error function handles errors that might occur during the service call
      error: (err) => {
        console.log(err);
      },
    });
  }
}
