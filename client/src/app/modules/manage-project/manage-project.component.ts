// Angular Imports
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
// Service Imports
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';

// Model Imports
import {
  MultipleProjectsResponseData,
  ProjectPopulated,
} from 'src/app/services/model/project.model';
import {
  Team,
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { User, UserPopulated } from 'src/app/services/model/user.model';

// Component Imports
import { CreateProjectComponent } from './create-project/create-project.component';
import { CreateTeamComponent } from '../team-details/create-team/create-team.component';
// HttpErrorResponse for handling HTTP errors
import { HttpErrorResponse } from '@angular/common/http';
// Add Subject for unsubscribing from observables
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';

interface TeamWithProjects extends TeamPopulated {
  projects: {
    project: ProjectPopulated;
    addedDate: Date;
  }[];
}
@Component({
  selector: 'app-manage-project',
  templateUrl: './manage-project.component.html',
  styleUrls: ['./manage-project.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(
          ':enter',
          [
            style({ opacity: 0 }),
            stagger('50ms', [animate('300ms ease-in', style({ opacity: 1 }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class ManageProjectComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  teamMembersDetails: { [key: string]: string } = {};

  users: User[] = [];
  teamInfo: TeamPopulated[] = [];
  projects: ProjectPopulated[] = [];
  showProjectDetails: boolean = false;
  selectedProject: ProjectPopulated | null = null;
  errorMessage: string = '';
  teamProjects: TeamWithProjects[] = [];

  private onDestroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsersForTeam().subscribe((fetchedUsers) => {
      this.users = fetchedUsers;
    });
    this.loadTeamProjectDetails();
  }
  ngOnDestroy(): void {
    // Emit an event to trigger unSubscription
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getMemberTooltip(user: User | UserPopulated): string {
    // Improved type safety.
    return `User ID: ${user?._id}`;
  }

  isUserPopulated(user: any): user is UserPopulated {
    return user && typeof user === 'object' && 'firstName' in user;
  }

  openTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamComponent);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  getMemberDetails(memberContainer: {
    user: UserPopulated;
    addedDate: Date;
  }): string {
    const memberId = memberContainer.user._id;

    if (!memberId) {
      return 'Loading...';
    }
    return this.teamMembersDetails[memberId] ?? 'Loading...';
  }

  openAddEditProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadTeamProjectDetails();
      },
    });
  }

  openProjectDetails(project: ProjectPopulated): void {
    console.log(`Navigating to project details with ID: ${project._id}`);
    this.router.navigate([`/project-details/${project._id}`], {
      state: { returnUrl: this.router.url },
    });
  }

  closeProjectDetails(): void {
    this.showProjectDetails = false;
    this.selectedProject = null;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      this.projects = this.projects.filter((project) =>
        project.projectName
          .toLowerCase()
          .includes(filterValue.trim().toLowerCase())
      );
    } else {
      this.loadTeamProjectDetails();
    }
  }

  applyDateFilter(): void {
    // TODO: Implement the logic to filter projects between startDate and endDate
  }

  applyTeamFilter(event: any): void {
    // TODO: Implement the logic to filter projects by selected team
  }

  handleError(err: HttpErrorResponse, defaultMsg: string) {
    let errorMessage = defaultMsg;
    if (err.status) {
      errorMessage = `Error Code: ${err.status}, Message: ${err.message}`;
    } else {
      errorMessage = err.message || defaultMsg;
    }
    console.error(errorMessage, err);
    this.errorMessage = errorMessage;
    this.isLoading = false;
  }
  private loadTeamProjectDetails(): void {
    console.log('Fetching teams with their projects...');

    this.teamService
      .getAllTeamsWithProjectsForUser()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleTeamsResponseData) => {
          this.teamInfo = response.data;
          console.log('Teams with projects fetched:', this.teamInfo);
        },
        (error: HttpErrorResponse) => {
          this.handleError(error, 'Error fetching teams with projects');
          this.teamInfo = [];
        },
        () => {
          this.isLoading = false;
        }
      );
  }
}
