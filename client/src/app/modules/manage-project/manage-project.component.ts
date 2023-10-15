// Angular Imports
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { Event as RouterEvent } from '@angular/router';

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
import { ResponseData, User } from 'src/app/services/model/user.model';

// Component Imports
import { CreateProjectComponent } from './create-project/create-project.component';
import { CreateTeamComponent } from '../team-details/create-team/create-team.component';
// HttpErrorResponse for handling HTTP errors
import { HttpErrorResponse } from '@angular/common/http';
// Add Subject for unsubscribing from observables
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  projectDataSource: MatTableDataSource<ProjectPopulated> =
    new MatTableDataSource<ProjectPopulated>();

  teamDetails: { [key: string]: Team } = {};
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projects: ProjectPopulated[] = [];
  showProjectDetails: boolean = false;
  selectedProject: ProjectPopulated | null = null;
  errorMessage: string = '';
  loggedInUserId: string = '';

  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  constructor(
    private projectService: ProjectService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private router: Router
  ) {}
  // Private Subject to trigger unSubscription
  private ngUnsubscribe = new Subject<void>();
  ngOnInit(): void {
    this.loadAllTeamDetails();
    this.loadAllProjectDetails();
    this.listenToRouterEvents();
  }
  ngOnDestroy(): void {
    // Emit an event to trigger unSubscription
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Test events
  listenToRouterEvents(): void {
    this.router.events
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((event: RouterEvent) => {
        if (event instanceof NavigationStart) {
          console.log('NavigationStart:', event);
        } else if (event instanceof NavigationEnd) {
          console.log('NavigationEnd:', event);
        } else if (event instanceof NavigationCancel) {
          console.log('NavigationCancel:', event);
        } else if (event instanceof NavigationError) {
          console.log('NavigationError:', event);
        } else if (event instanceof NavigationSkipped) {
          console.log('NavigationSkipped:', event);
        }
      });
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
          this.isLoading = false; // <-- Add this line
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

          // Populate the MyDataSource with the projects
          this.projectDataSource.data = this.projects;

          this.isLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.handleError(error, 'Error fetching projects');
          this.projects = [];
          this.projectDataSource.data = []; // <-- Add this line
        }
      );
  }

  openTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamComponent);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  getMemberDetail(memberId: string | undefined): string {
    if (!memberId) {
      return 'Loading...';
    }
    return this.teamMembersDetails[memberId] ?? 'Loading...';
  }

  openAddEditProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadAllProjectDetails();
      },
    });
  }

  openProjectDetails(project: ProjectPopulated): void {
    console.log(`Navigating to project details with ID: ${project._id}`);
    this.router.navigate([`/project-details/${project._id}`]);
  }

  closeProjectDetails(): void {
    this.showProjectDetails = false;
    this.selectedProject = null;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.projectDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyDateFilter(): void {
    // Logic to filter projects between startDate and endDate
  }

  applyTeamFilter(event: any): void {
    // Logic to filter projects by selected team
  }

  getMemberTooltip(member: User): string {
    return `${member.firstName} ${member.lastName} - ${member.userName}`;
  }
}
