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
import { UserService } from 'src/app/services/user.service';
import { TeamService } from 'src/app/services/team.service';

// Model Imports
import { ProjectFull } from 'src/app/services/model/project.model';
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
  isLoading = false;
  error: string | null = null;
  teamMembersDetails: { [key: string]: string } = {};
  MyDataSource: MatTableDataSource<ProjectFull> =
    new MatTableDataSource<ProjectFull>();
  teamDetails: { [key: string]: Team } = {};
  users: User[] = [];
  teams: TeamPopulated[] = [];
  showProjectDetails: boolean = false;
  selectedProject: ProjectFull | null = null;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private router: Router
  ) {}
  // Private Subject to trigger unSubscription
  private ngUnsubscribe = new Subject<void>();
  ngOnInit(): void {
    this.loadUsers();
    this.loadTeams();
    this.loadProject();
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

  private loadUsers(): void {
    console.log('Fetching users... manageSide');
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

  private loadTeams(): void {
    console.log('Fetching teams... manageSide');
    this.teamService.getTeamsByUserId().subscribe(
      (response: MultipleTeamsResponseData) => {
        if (Array.isArray(response.data)) {
          this.teams = response.data;
        } else {
          this.teams = [response.data];
        }
        console.log('Teams fetched:', this.teams);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching teams:', error);
        this.teams = [];
      }
    );
  }

  private loadProject(): void {
    console.log('Fetching project... manageSide');
    this.isLoading = true;
    this.projectService
      .getProjectsByUserId()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          if (Array.isArray(response.data)) {
            this.MyDataSource.data = response.data;
          } else {
            this.MyDataSource.data = [response.data];
          }
          this.isLoading = false;
        },
        (error) => {
          this.error = 'Error loading projects.';
          console.error('Error occurred:', error);
          this.isLoading = false;
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
        if (val) this.loadProject();
      },
    });
  }

  openProjectDetails(project: ProjectFull): void {
    this.router.navigate([`/project-details/${project._id}`]);
  }

  closeProjectDetails(): void {
    this.showProjectDetails = false;
    this.selectedProject = null;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.MyDataSource.filter = filterValue.trim().toLowerCase();
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
