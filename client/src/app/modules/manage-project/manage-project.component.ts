// Angular Imports
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { ProjectPopulated } from 'src/app/services/model/project.model';
import {
  Team,
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { User, UserPopulated } from 'src/app/services/model/user.model';

// Component Imports
import { CreateProjectComponent } from './create-project/create-project.component';
import { CreateTeamComponent } from '../manage-team/create-team/create-team.component';
// HttpErrorResponse for handling HTTP errors
import { HttpErrorResponse } from '@angular/common/http';
// Add Subject for unsubscribing from observables
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  filteredTeams: TeamWithProjects[] = [];
  currentProjectFilter: string = '';
  currentTeamFilter: string = '';
  private onDestroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private teamService: TeamService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  @ViewChild('projectNameInput') projectNameInputElement?: ElementRef;

  ngOnInit(): void {
    this.loadTeamAndUsers();
    this.loadTeamProjectDetails();
  }

  private loadTeamAndUsers(): void {
    this.teamService
      .getAllTeamsWithProjects()
      .pipe(
        takeUntil(this.onDestroy$),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching team and project information:', error);
          this.errorMessage = 'Failed to load team and project information.';
          return throwError(error); // This will terminate the observable stream
        })
      )
      .subscribe({
        next: (response) => {
          this.teamInfo = response.data;
          if (this.teamInfo.length > 0 && this.teamInfo[0].createdBy) {
            const createdBy = this.teamInfo[0].createdBy._id;
            if (createdBy) {
              this.userService
                .getUsersForTeam(createdBy)
                .pipe(takeUntil(this.onDestroy$))
                .subscribe({
                  next: (fetchedUsers) => {
                    this.users = fetchedUsers;
                  },
                  error: (error) => {
                    console.error('Error fetching users for team:', error);
                    // Handle error (e.g., show user feedback or log to monitoring service)
                  },
                });
            } else {
              console.error('No valid creator ID found for the team.');
              // Handle the case where createdBy is null or undefined (e.g., show a message to the user)
            }
          } else {
            console.error(
              'Team information is empty or missing createdBy field.'
            );
            // Handle the case where teamInfo is empty or missing necessary data (e.g., show a message to the user)
          }
        },
        error: (error) => {
          console.error('An error occurred:', error);
          // Handle the error (e.g., show user feedback or log to monitoring service)
        },
      });
  }

  ngOnDestroy(): void {
    // Emit an event to trigger unSubscription
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getMemberTooltip(user: UserPopulated): string {
    return user
      ? `User ID: ${user._id}, Name: ${user.firstName} ${user.lastName}`
      : 'User ID: Loading...';
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

  getMemberDetails(member: { user: UserPopulated; addedDate: Date }): string {
    return member && member.user
      ? `${member.user.firstName} ${member.user.lastName}`
      : 'Loading...';
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
  deleteProject(projectId: string, teamId: string, event: MouseEvent): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.performProjectDeletion(projectId, teamId);
      }
    });
  }

  private performProjectDeletion(projectId: string, teamId: string): void {
    this.projectService
      .deleteProjectById(projectId)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Project deleted successfully!', 'Close', {
            duration: 3000,
          });
          this.loadTeamProjectDetails();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'Error deleting project');
        },
      });
  }

  applyFilter(event: Event): void {
    this.currentProjectFilter = (event.target as HTMLInputElement).value
      .toLowerCase()
      .trim();
    this.applyCombinedFilters();
  }

  applyTeamFilter(event: any): void {
    this.currentTeamFilter = event.value;

    if (!this.currentTeamFilter) {
      this.currentProjectFilter = '';
      if (this.projectNameInputElement) {
        this.projectNameInputElement.nativeElement.value = '';
      }
    }

    this.applyCombinedFilters();
  }

  applyCombinedFilters(): void {
    // Start filter with all teams
    let filteredTeams = [...this.teamInfo];

    // Filter by team if a team filter is set
    if (this.currentTeamFilter) {
      filteredTeams = filteredTeams.filter(
        (team) => team._id === this.currentTeamFilter
      );
    }

    // filter by project name within those teams
    if (this.currentProjectFilter) {
      filteredTeams = filteredTeams
        .map((team) => ({
          ...team,
          projects: team.projects.filter((p) =>
            p.project.projectName
              .toLowerCase()
              .includes(this.currentProjectFilter)
          ),
        }))
        .filter((team) => team.projects.length > 0); // Keep teams with matching projects
    }

    this.filteredTeams = filteredTeams;
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
    // Displaying a simple message
    this.snackBar.open('An error occurred. Please try again.', 'Close', {
      duration: 3000,
    });
  }

  private loadTeamProjectDetails(): void {
    console.log('Fetching teams with their projects...');

    this.teamService
      .getAllTeamsWithProjects()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleTeamsResponseData) => {
          this.teamInfo = response.data;
          this.filteredTeams = [...this.teamInfo];
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
