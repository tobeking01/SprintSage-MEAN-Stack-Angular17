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
import { UserService } from 'src/app/services/user.service';
import { TeamService } from 'src/app/services/team.service';

// Model Imports
import { ProjectFull } from 'src/app/services/model/project.model';
import {
  Team,
  SingleTeamResponseData,
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { ResponseData, User } from 'src/app/services/model/user.model';

// Component Imports
import { AddProjectComponent } from './add-project/add-project.component';
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
        query(':enter', [
          style({ opacity: 0 }),
          stagger('50ms', [animate('300ms ease-in', style({ opacity: 1 }))]),
        ]),
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

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private router: Router
  ) {}
  // Add a private Subject to trigger unSubscription
  private ngUnsubscribe = new Subject<void>();
  ngOnInit(): void {
    this.loadUsers();
    this.loadTeams();
    this.loadProject();
  }
  ngOnDestroy(): void {
    // Emit an event to trigger unSubscription
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private loadUsers(): void {
    console.log('Fetching users... manageSide');
    this.userService.getAllUsers().subscribe(
      (response: ResponseData) => {
        this.users = response.data[0];
        console.log('Users fetched:', this.users);
      },
      (error: any) => {
        console.error('Error:', error);
      }
    );
  }

  private loadTeams(): void {
    console.log('Fetching teams... manageSide');
    this.teamService.getAllTeams().subscribe(
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
      .getAllProjects()
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
    const dialogRef = this.dialog.open(AddProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadProject();
      },
    });
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
