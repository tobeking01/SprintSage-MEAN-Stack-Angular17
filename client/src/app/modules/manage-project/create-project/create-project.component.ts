import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from 'src/app/services/team.service';

import { ResponseData, User } from 'src/app/services/model/user.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import {
  ProjectPopulated,
  MultipleProjectsResponseData,
  SingleProjectResponseData,
} from 'src/app/services/model/project.model';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit, OnDestroy {
  createProjectForm!: FormGroup;
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projects: ProjectPopulated[] = [];
  isLoading = false;
  errorMessage: string = '';
  loggedInUserId: string = '';

  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectPopulated
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadLoggedInUser();
    this.loadAllTeamDetails();
    this.loadAllProjectDetails();
  }

  initializeForm() {
    this.createProjectForm = this.fb.group(
      {
        projectName: ['', Validators.required],
        description: [''],
        startDate: [null, this.dateNotInThePast],
        endDate: [null],
        existingTeam: ['', Validators.required],
      },
      {
        validators: this.endDateAfterStartDate('startDate', 'endDate'),
      }
    );
  }

  get teamMembersFormArray(): FormArray {
    return this.createProjectForm.get('teamMembers') as FormArray;
  }
  get teamMembersControls(): FormControl[] {
    return this.teamMembersFormArray.controls as FormControl[];
  }
  addUser() {
    this.teamMembersFormArray.push(new FormControl('', Validators.required));
  }
  get isTeamMembersValid(): boolean {
    return this.teamMembersFormArray.controls.every((control) => control.valid);
  }

  removeUser(index: number) {
    this.teamMembersFormArray.removeAt(index);
  }

  loadLoggedInUser() {
    console.log('Fetching users...');
    this.userService
      .getLoggedInUserDetails()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: ResponseData) => {
          this.users = response.data;
          console.log('Users fetched:', this.users);
        },
        (error: any) => {
          console.error('Error:', error);
        }
      );
  }

  handleError(err: HttpErrorResponse, defaultMsg: string) {
    let errorMessage = defaultMsg;
    if (err instanceof HttpErrorResponse) {
      // Server or connection error happened
      errorMessage = `Error Code: ${err.status}, Message: ${err.message}`;
    } else {
      errorMessage = (err as any).message || defaultMsg;
    }
    console.error(errorMessage, err);
    this.errorMessage = errorMessage;
    this.isLoading = false;
  }

  private loadAllTeamDetails(): void {
    console.log('Fetching teams... studentDashboard');
    this.teamService
      .getTeamsByUserId()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleTeamsResponseData) => {
          this.teams = response.data;

          console.log('Teams fetched:', this.teams);
        },
        (error: HttpErrorResponse) => {
          this.handleError(error, 'Error fetching teams');
          this.teams = [];
        }
      );
  }

  private loadAllProjectDetails(): void {
    console.log('Fetching project... studentDashboard');
    this.projectService
      .getProjectsByUserId()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleProjectsResponseData) => {
          this.projects = response.data;

          console.log('projects fetched:', this.projects);
          this.isLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.handleError(error, 'Error fetching projects');
          this.projects = [];
        }
      );
  }

  createMember(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.createProjectForm.valid) {
      const { projectName, description, existingTeam, startDate, endDate } =
        this.createProjectForm.value;

      // Find the selected team
      const selectedTeam = this.teams.find((team) => team._id === existingTeam);

      let teamIds: string[] = [];
      if (selectedTeam && selectedTeam._id) {
        teamIds.push(selectedTeam._id);
      }

      // Extract user IDs from the selected team
      let userIds: string[] = [];
      if (selectedTeam && Array.isArray(selectedTeam.teamMembers)) {
        userIds = selectedTeam.teamMembers
          .map((member) => member._id)
          .filter((id): id is string => !!id); // This filters out undefined or falsy values.
      }

      const formData = {
        projectName,
        description,
        teams: teamIds,
        users: userIds,
        startDate,
        endDate,
      };

      if (this.data && this.data._id) {
        this.projectService
          .updateProjectById(this.data._id, formData)
          .subscribe(
            (response: SingleProjectResponseData) => {
              this.snackBar.open(
                `Project updated: ${response.data._id}`,
                'Close',
                {
                  duration: 3000,
                }
              );
              this.dialogRef.close(true); // Close the dialog with a success indicator
            },
            (error: HttpErrorResponse) =>
              this.handleError(error, 'Error fetching projects')
          );
      } else {
        this.projectService
          .createProject(formData)
          .pipe(takeUntil(this.onDestroy$))
          .subscribe(
            (response: SingleProjectResponseData) => {
              this.snackBar.open(response.message, 'Close', { duration: 3000 });
              this.dialogRef.close(true); // Close the dialog with a success indicator
            },
            (error: HttpErrorResponse) =>
              this.handleError(error, 'Error fetching projects')
          );
      }
    } else {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
      });
    }
  }

  dateNotInThePast(control: FormControl) {
    const selectedDate = control.value;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date part
    if (selectedDate && selectedDate < currentDate) {
      return { dateInThePast: true };
    }
    return null;
  }

  endDateAfterStartDate(
    startDateControlName: string,
    endDateControlName: string
  ) {
    return (formGroup: FormGroup) => {
      const startDateControl = formGroup.controls[startDateControlName];
      const endDateControl = formGroup.controls[endDateControlName];

      if (
        endDateControl.errors &&
        !endDateControl.errors['mustBeAfterStartDate']
      ) {
        // return if another validator has already found an error on the endDate
        return;
      }

      if (
        startDateControl.value &&
        endDateControl.value &&
        startDateControl.value > endDateControl.value
      ) {
        endDateControl.setErrors({ mustBeAfterStartDate: true });
      } else {
        endDateControl.setErrors(null);
      }
    };
  }

  ngOnDestroy(): void {
    // Cleaning up subscriptions.
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
