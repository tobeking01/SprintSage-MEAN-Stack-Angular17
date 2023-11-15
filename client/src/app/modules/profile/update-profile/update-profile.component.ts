import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss'],
})
export class UpdateProfileComponent implements OnInit {
  updateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<UpdateProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User, // Adjust type to your User type
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setConditionalValidators();
  }

  private initializeForm() {
    this.updateForm = this.fb.group({
      firstName: [this.data.firstName, Validators.required],
      lastName: [this.data.lastName, Validators.required],
      userName: [this.data.userName, Validators.required],
      email: [this.data.email, [Validators.required, Validators.email]],
    });

    // Add fields based on user roles
    if (this.data.roles && this.data.roles.includes('Student')) {
      this.updateForm.addControl(
        'schoolYear',
        this.fb.control(this.data.schoolYear, Validators.required)
      );
      this.updateForm.addControl(
        'expectedGraduation',
        this.fb.control(this.data.expectedGraduation, Validators.required)
      );
    } else if (this.data.roles && this.data.roles.includes('Professor')) {
      this.updateForm.addControl(
        'professorTitle',
        this.fb.control(this.data.professorTitle, Validators.required)
      );
      this.updateForm.addControl(
        'professorDepartment',
        this.fb.control(this.data.professorDepartment, Validators.required)
      );
    }
  }

  private setConditionalValidators() {
    // Here you can set additional validators if needed
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get formInvalid(): boolean {
    return (
      this.updateForm.invalid &&
      (this.updateForm.dirty || this.updateForm.touched)
    );
  }

  onUpdate(): void {
    if (this.updateForm.valid) {
      // Assuming you have separate update functions for student and professor.
      const updateObservable =
        this.data.roles && this.data.roles.includes('Student')
          ? this.userService.updateStudentProfile(
              this.data._id,
              this.updateForm.value
            )
          : this.userService.updateProfessorProfile(
              this.data._id,
              this.updateForm.value
            );

      updateObservable.subscribe(
        (response: any) => {
          if (response.success && response.data) {
            // Pass the updated data back to the ProfileComponent
            this.dialogRef.close(this.updateForm.value);
          } else {
            this.snackBar.open(
              response.message || 'Error updating profile.',
              'Close',
              { duration: 5000 }
            );
          }
        },
        (error) => {
          const errorMessage =
            error.error?.message || 'Error updating profile.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      );
    } else {
      this.snackBar.open('Please fill in the required fields.', 'Close', {
        duration: 5000,
      });
    }
  }
}
