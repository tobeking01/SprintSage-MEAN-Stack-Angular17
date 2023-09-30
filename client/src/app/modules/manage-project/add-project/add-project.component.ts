import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent implements OnInit {
  projectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  initializeForm() {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log('addProjectComponent Initialized');
    this.initializeForm();
    if (this.data) {
      // If editing an existing student, patch the form values
      this.projectForm.patchValue(this.data);
    }
  }

  onSubmit() {
    if (this.projectForm.valid) {
      if (this.data) {
        this.projectService
          .updateProjectById(this.data._id, this.projectForm.value) // Change id to _id or whatever the actual property is
          .subscribe({
            next: (val: any) => {
              this.snackBar.open('Project details updated!', 'Close', {
                duration: 3000,
              });
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
              this.snackBar.open('Error while updating the project!', 'Close', {
                duration: 3000,
              });
            },
          });
      } else {
        this.projectService.createProject(this.projectForm.value).subscribe({
          next: (val: any) => {
            this.snackBar.open('Project added successfully!', 'Close', {
              duration: 3000,
            });
            this.dialogRef.close(true);
          },
          error: (err: HttpErrorResponse) => {
            console.error(err);
            let errorMessage = 'An unknown error occurred!';
            if (err.error instanceof ErrorEvent) {
              // A client-side or network error occurred. Handle it accordingly.
              errorMessage = `An error occurred: ${err.error.message}`;
            } else {
              // The backend returned an unsuccessful response code.
              // The response body may contain clues as to what went wrong,
              errorMessage = `Backend returned code ${err.status}, body was: ${err.error}`;
            }
            this.snackBar.open(errorMessage, 'Close', {
              duration: 3000,
            });
          },
        });
      }
    }
  }
}
