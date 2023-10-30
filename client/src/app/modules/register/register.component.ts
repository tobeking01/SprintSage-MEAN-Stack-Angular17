import { Component, OnInit, inject } from '@angular/core';
import { confirmPasswordValidator } from '../../../app/validators/confirm-password-validator';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ResponseData } from 'src/app/services/model/auth.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder, // FormBuilder injection
    private authService: AuthService, // AuthService injection
    private router: Router, // Router injection
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        role: ['Student', Validators.required],
        schoolYear: [''],
        expectedGraduation: [''],
        professorTitle: [''],
        professorDepartment: [''],
      },
      {
        validator: confirmPasswordValidator('password', 'confirmPassword'),
      }
    );

    this.registerForm.get('role')?.valueChanges.subscribe((role) => {
      if (role === 'Student') {
        this.addStudentControls();
        this.removeProfessorControls();
      } else if (role === 'Professor') {
        this.addProfessorControls();
        this.removeStudentControls();
      }

      console.log(
        'Form controls after role change:',
        this.registerForm.controls
      );
    });
  }

  register() {
    console.log(
      'Attempting registration with form data:',
      this.registerForm.value
    );
    this.isLoading = true;
    if (this.registerForm.invalid) {
      console.error('Form is invalid:', this.registerForm.errors);
      return;
    }

    const formValue = this.registerForm.value;
    let registerService: Observable<ResponseData>;

    if (formValue.role === 'Student') {
      console.log('Registering as Student');
      registerService = this.authService.registerStudentService(formValue);
    } else if (formValue.role === 'Professor') {
      console.log('Registering as Professor');
      registerService = this.authService.registerProfessorService(formValue);
    } else {
      console.error('Unexpected role value:', formValue.role);
      return;
    }

    registerService.subscribe({
      next: (res) => {
        this.isLoading = false;
        this.snackBar.open('User Created! You can now log in.', 'Close', {
          duration: 3000, // Duration to show the Snackbar
        });
        this.registerForm.reset();
        this.router.navigate(['login']);
      },
      error: (err) => {
        let errorMessage = 'Registration Failed! Please try again.';
        if (err.status === 0) {
          errorMessage = 'Server is not available! Please try again later.';
        } else if (err.status === 400) {
          errorMessage = 'Invalid data provided!';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      },
    });
  }
  private addStudentControls(): void {
    this.registerForm.get('schoolYear')?.setValidators(Validators.required);
    this.registerForm.get('schoolYear')?.updateValueAndValidity();

    this.registerForm
      .get('expectedGraduation')
      ?.setValidators(Validators.required);
    this.registerForm.get('expectedGraduation')?.updateValueAndValidity();
  }

  private removeStudentControls(): void {
    this.registerForm.get('schoolYear')?.clearValidators();
    this.registerForm.get('schoolYear')?.updateValueAndValidity();

    this.registerForm.get('expectedGraduation')?.clearValidators();
    this.registerForm.get('expectedGraduation')?.updateValueAndValidity();
  }

  private addProfessorControls(): void {
    this.registerForm.get('professorTitle')?.setValidators(Validators.required);
    this.registerForm.get('professorTitle')?.updateValueAndValidity();

    this.registerForm
      .get('professorDepartment')
      ?.setValidators(Validators.required);
    this.registerForm.get('professorDepartment')?.updateValueAndValidity();
  }

  private removeProfessorControls(): void {
    this.registerForm.get('professorTitle')?.clearValidators();
    this.registerForm.get('professorTitle')?.updateValueAndValidity();

    this.registerForm.get('professorDepartment')?.clearValidators();
    this.registerForm.get('professorDepartment')?.updateValueAndValidity();
  }
}
