import { Component, OnInit, inject } from '@angular/core';
import { confirmPasswordValidator } from '../../../app/validators/confirm-password-validator';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder, // FormBuilder injection
    private AuthService: AuthService, // AuthService injection
    private router: Router, // Router injection
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: [
          '',
          Validators.compose([Validators.required, Validators.email]),
        ],
        userName: ['', Validators.required],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: confirmPasswordValidator('password', 'confirmPassword'),
      }
    );
  }

  register() {
    this.AuthService.registerService(this.registerForm.value).subscribe({
      next: (res) => {
        alert('User Created!');
        this.registerForm.reset();
        this.router.navigate(['login']);
      },
      error: (err) => {
        this.snackBar.open('Registration Failed! Please try again.', 'Close', {
          duration: 3000, // Duration to show the Snackbar
        });
      },
    });
  }
}
