import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User, ResponseData } from 'src/app/services/model/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import { map } from 'rxjs/operators';

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
    @Inject(MAT_DIALOG_DATA) public data: User,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() {
    this.updateForm = this.fb.group({
      firstName: [this.data.firstName, Validators.required],
      lastName: [this.data.lastName, Validators.required],
      userName: [this.data.userName, Validators.required],
      email: [this.data.email, [Validators.required, Validators.email]],
    });

    if (this.data.roles.includes('Student')) {
      this.updateForm.addControl(
        'schoolYear',
        this.fb.control(this.data.schoolYear)
      );
      this.updateForm.addControl(
        'expectedGraduation',
        this.fb.control(this.data.expectedGraduation, Validators.required)
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
    if (this.updateForm.valid) {
      this.userService
        .updateStudentProfile(this.data._id!, this.updateForm.value)
        .subscribe(
          (response: ResponseData) => {
            if (response.success && response.data.length > 0) {
              this.dialogRef.close(response.data[0]);
            } else {
              this.snackBar.open(
                response.message || 'Error updating profile.',
                'Close',
                {
                  duration: 5000,
                }
              );
            }
          },
          (error) => {
            const errorMessage =
              error.error?.message || 'Error updating profile.';
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
            });
          }
        );
    } else {
      this.snackBar.open('Please fill in the required fields.', 'Close', {
        duration: 5000,
      });
    }
  }
}
