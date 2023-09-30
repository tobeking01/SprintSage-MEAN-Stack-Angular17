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
        role: ['Student', Validators.required], // Set default to Student and make it required
      },
      {
        validator: confirmPasswordValidator('password', 'confirmPassword'),
      }
    );
  }

  register() {
    console.log('Data being sent:', this.registerForm);
    if (this.registerForm.invalid) {
      return; // Do not proceed if form is invalid.
    }

    const formValue = this.registerForm.value;
    console.log(formValue);

    this.AuthService.registerService(formValue).subscribe({
      next: (res) => {
        this.snackBar.open('User Created! You can now log in.', 'Close', {
          duration: 3000, // Duration to show the Snackbar
        });
        this.registerForm.reset();
        this.router.navigate(['login']);
      },
      error: (err) => {
        // More specific error messages
        let errorMessage = 'Registration Failed! Please try again.';
        if (err.status === 0) {
          errorMessage = 'Server is not available! Please try again later.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
