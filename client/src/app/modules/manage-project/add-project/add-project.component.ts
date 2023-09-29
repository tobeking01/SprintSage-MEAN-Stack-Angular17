import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('addProjectComponent Initialized');

    this.initializeForm();
  }

  initializeForm() {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.projectService.createProject(this.projectForm.value).subscribe(
        () => {
          this.snackBar.open('Project successfully created!', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/manage-project']);
        },
        (error) => {
          console.error('Error creating project:', error);
          this.snackBar.open('Error creating project!', 'Close', {
            duration: 3000,
          });
        }
      );
    }
  }

  // Method to handle cancel action
  onCancel() {
    this.router.navigate(['/manage-project']); // Redirect to the project list
  }
}
