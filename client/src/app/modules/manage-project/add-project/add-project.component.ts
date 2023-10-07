import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from 'src/app/services/team.service';

import { ResponseData, User } from 'src/app/services/model/user.model';
import {
  Team,
  SingleTeamResponseData,
  MultipleTeamsResponseData,
} from 'src/app/services/model/team.model';
import {
  MultipleProjectsResponseData,
  Project,
  SingleProjectResponseData,
} from 'src/app/services/model/project.model';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent implements OnInit, OnDestroy {
  projectForm!: FormGroup;
  users: User[] = [];
  teams: Team[] = [];
  projects: Project[] = [];

  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Project
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
    this.userService.getAllUsers().subscribe(
      (response: ResponseData) => {
        this.users = response.data.users;
        console.log('Users fetched:', this.users);
      },
      (error: any) => {
        console.error('Error:', error);
      }
    );
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe(
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

  loadProjects() {
    this.projectService.getAllProjects().subscribe(
      (response: SingleProjectResponseData | MultipleProjectsResponseData) => {
        if ('data' in response && Array.isArray(response.data)) {
          // Handle the response as MultipleProjectsResponseData
          const projectsArray: Project[] = response.data;
        } else if ('data' in response && !Array.isArray(response.data)) {
          // Handle the response as SingleProjectResponseData
          const singleProject: Project = response.data;
        } else {
          // Handle unexpected response format
          console.error('Unexpected response format:', response);
        }
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
