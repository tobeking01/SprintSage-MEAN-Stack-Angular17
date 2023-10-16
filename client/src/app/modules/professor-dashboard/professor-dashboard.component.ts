import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  MultipleProjectsResponseData,
  ProjectPopulated,
} from 'src/app/services/model/project.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { ResponseData, User } from 'src/app/services/model/user.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { CreateProjectComponent } from '../manage-project/create-project/create-project.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamComponent } from '../team-details/create-team/create-team.component';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-professor-dashboard',
  templateUrl: './professor-dashboard.component.html',
  styleUrls: ['./professor-dashboard.component.scss'],
})
export class ProfessorDashboardComponent implements OnInit {
  teamMembersDetails: { [key: string]: string } = {};
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projects: ProjectPopulated[] = [];
  selectedProject: ProjectPopulated | null = null;
  isLoading = false;
  errorMessage: string = '';
  loggedInUserId: string = '';

  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUser();
    this.loadAllTeamDetails();
    this.loadAllProjectDetails();
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
    console.log('Fetching teams... professorDashboard');
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

  //
  private loadAllProjectDetails(): void {
    console.log('Fetching project... professorDashboard');
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

  getMemberTooltip(member: User): string {
    return `${member.firstName} ${member.lastName} - ${member.userName}`;
  }
  openAddEditProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadAllProjectDetails();
      },
    });
  }

  openAddEditTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadAllTeamDetails();
      },
    });
  }

  ngOnDestroy(): void {
    // Cleaning up subscriptions.
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
