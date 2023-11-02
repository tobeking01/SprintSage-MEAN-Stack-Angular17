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
import { User } from 'src/app/services/model/user.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { CreateProjectComponent } from '../manage-project/create-project/create-project.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamComponent } from '../manage-team/create-team/create-team.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {
  teamMembersDetails: { [key: string]: string } = {};
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projects: ProjectPopulated[] = [];
  selectedProject: ProjectPopulated | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadAllTeamDetails();
    this.loadAllProjectDetails();
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
          this.isLoading = false;
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
