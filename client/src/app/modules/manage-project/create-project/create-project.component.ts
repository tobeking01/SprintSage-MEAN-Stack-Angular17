import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { Subject } from 'rxjs';
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
  projectForm!: FormGroup;
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projects: ProjectPopulated[] = [];

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
    this.loadUsers();
    this.loadTeams();
    this.loadProjects();
  }

  initializeForm() {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      description: [''],
      startDate: [null],
      endDate: [null],
      existingTeam: ['', Validators.required],
    });
  }

  get teamMembersFormArray(): FormArray {
    return this.projectForm.get('teamMembers') as FormArray;
  }
  get teamMembersControls(): FormControl[] {
    return this.teamMembersFormArray.controls as FormControl[];
  }
  addUser() {
    this.teamMembersFormArray.push(new FormControl('', Validators.required));
  }

  removeUser(index: number) {
    this.teamMembersFormArray.removeAt(index);
  }
  loadUsers() {
    console.log('Fetching users...');
    this.userService.getLoggedInUserDetails().subscribe(
      (response: ResponseData) => {
        this.users = response.data;
        console.log('Users fetched:', this.users);
      },
      (error: any) => {
        console.error('Error:', error);
      }
    );
  }

  loadTeams(): void {
    this.teamService.getTeamsByUserId().subscribe(
      (response: MultipleTeamsResponseData) => {
        if (Array.isArray(response.data)) {
          this.teams = response.data;
        } else {
          this.teams = [response.data]; // Convert the single team into an array
        }
        console.log('Teams fetched:', this.teams);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching teams:', error);
        this.teams = [];
      }
    );
  }

  private loadProjects(): void {
    console.log('Fetching project... studentDashboard');
    this.projectService.getProjectsByUserId().subscribe(
      (response: MultipleProjectsResponseData) => {
        if (Array.isArray(response.data)) {
          this.projects = response.data;
        } else {
          this.projects = [response.data];
        }

        console.log('projects fetched:', this.projects);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching projects:', error);
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
    if (this.projectForm.valid) {
      const { projectName, description, existingTeam, startDate, endDate } =
        this.projectForm.value;

      // Find the selected team
      const selectedTeam = this.teams.find((team) => team._id === existingTeam);

      let teamIds: string[] = [];
      if (selectedTeam && selectedTeam._id) {
        teamIds.push(selectedTeam._id);
      }

      const formData = {
        projectName,
        description,
        teams: teamIds, // Send array of string IDs
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
              this.handleError('Error updating project:', error)
          );
      } else {
        this.projectService.createProject(formData).subscribe(
          (response: SingleProjectResponseData) => {
            this.snackBar.open(response.message, 'Close', { duration: 3000 });
            this.dialogRef.close(true); // Close the dialog with a success indicator
          },
          (error: HttpErrorResponse) =>
            this.handleError('Error creating project:', error)
        );
      }
    } else {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 3000,
      });
    }
  }

  private handleError(prefix: string, error: HttpErrorResponse) {
    this.snackBar.open(`${prefix} ${error.message}`, 'Close');
  }

  ngOnDestroy(): void {
    // Cleaning up subscriptions.
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
