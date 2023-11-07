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
import { Subject, take, takeUntil } from 'rxjs';
import {
  MultipleTicketsResponseData,
  Ticket,
} from 'src/app/services/model/ticket.model';
import { TicketService } from 'src/app/services/ticket.service';
import { UserService } from 'src/app/services/user.service';

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
  tickets: Ticket[] = [];
  selectedProject: ProjectPopulated | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  currentUserId: string = '';
  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed
  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private teamService: TeamService,
    private ticketService: TicketService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Subscribe to the getUserId() Observable to get the user ID when it's available
    this.userService
      .getUserId()
      .pipe(
        take(1) // Take only the first value emitted and then complete
      )
      .subscribe({
        next: (userId: string) => {
          this.currentUserId = userId;
          this.loadAllTeamDetails();
          this.loadAllProjectDetails();
          this.loadAllTicketDetails();
        },
        error: (err) => {
          console.error('Error fetching user ID:', err);
          this.errorMessage = 'Error fetching user ID';
          this.isLoading = false;
        },
      });
  }
  getCurrentUserId(): string {
    return this.currentUserId;
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

  private loadAllTicketDetails(): void {
    console.log('Fetching tickets... studentDashboard');
    this.ticketService
      .getTicketsByUserId(this.currentUserId) // make sure to pass the actual current user's ID
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleTicketsResponseData) => {
          this.tickets = response.data.tickets;
          console.log('Tickets fetched:', this.tickets);
          this.isLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.handleError(error, 'Error fetching tickets');
          this.tickets = [];
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
