import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TeamService } from 'src/app/services/team.service';
import { User } from 'src/app/services/model/user.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { CreateTeamComponent } from './create-team/create-team.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AddUserDialogComponent } from 'src/app/shared/components/add-user-dialog/add-user-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-team',
  templateUrl: './manage-team.component.html',
  styleUrls: ['./manage-team.component.scss'],
})
export class ManageTeamComponent implements OnInit, OnDestroy {
  teams: TeamPopulated[] = [];
  users: User[] = [];
  selectedTeam?: TeamPopulated | null = null;
  errorMessage: string = '';
  teamName = '';
  isLoading = false;

  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  displayedColumns: string[] = [
    'createdBy',
    'teamName',
    'members',
    'projects',
    'delete',
  ];
  dataSource = new MatTableDataSource<TeamPopulated>(this.teams);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private teamService: TeamService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAllTeamDetails(true);
    this.dataSource.filterPredicate = (data: TeamPopulated, filter: string) => {
      // customize filtering logic here, if needed
      return (
        data.teamName.toLowerCase().includes(filter) ||
        `${data.createdBy.firstName} ${data.createdBy.lastName}`
          .toLowerCase()
          .includes(filter)
      );
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onRowClicked(row: TeamPopulated) {
    this.router.navigate(['/team-details', row._id]);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  selectTeam(team: TeamPopulated): void {
    this.selectedTeam = team;
  }

  createTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamComponent);
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((val) => {
        if (val) {
          this.loadAllTeamDetails();
        }
      });
  }

  // Use a more centralized approach to handle loading state and error messages.
  private handleAsyncOperation<T>(
    observable: Observable<T>,
    successCallback: (result: T) => void
  ) {
    this.isLoading = true;
    observable.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: (result) => {
        this.isLoading = false;
        successCallback(result);
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err, 'Error occurred during operation');
        this.isLoading = false;
      },
    });
  }

  /**
   * Triggers the removal of a team member and refreshes the team details on success.
   */
  removeTeamMember(teamId: string, memberId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((result) => {
        if (result) {
          this.handleAsyncOperation(
            this.teamService.removeUserFromTeam(teamId, memberId),
            () => this.loadAllTeamDetails()
          );
        }
      });
  }
  openAddMemberDialog() {
    if (!this.selectedTeam?._id) {
      // Handle case where no team is selected or team ID is missing
      console.error('No team selected or missing team ID!');
      return;
    }

    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      data: { teamId: this.selectedTeam._id },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((updatedTeam: TeamPopulated) => {
        if (updatedTeam) {
          this.updateLocalTeamDetails(updatedTeam);
        }
      });
  }

  deleteTeam(event: MouseEvent, teamId: string): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this team?',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.handleAsyncOperation(
            this.teamService.deleteTeamById(teamId),
            () => {
              // Remove the team from the local array to update the UI instantly
              this.teams = this.teams.filter((team) => team._id !== teamId);
              this.dataSource.data = this.teams;
              // Optionally show a snackbar notification
              this.snackBar.open('Team deleted successfully', 'Close', {
                duration: 2000,
              });
            }
          );
        }
      });
  }

  private loadAllTeamDetails(selectFirstTeam: boolean = false): void {
    console.log('Fetching teams...');
    let previouslySelectedTeamId = selectFirstTeam
      ? null
      : this.selectedTeam?._id;
    this.isLoading = true;

    this.teamService
      .getTeamsByUserId()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleTeamsResponseData) => {
          this.teamData.next(response.data);
          this.teams = response.data;
          this.dataSource.data = this.teams;
          setTimeout(() => (this.dataSource.paginator = this.paginator));
          this.dataSource.paginator = this.paginator;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.length = this.teams.length;
          }

          console.log('Teams fetched:', this.teams);

          if (previouslySelectedTeamId) {
            const foundTeam = this.teams.find(
              (team) => team._id === previouslySelectedTeamId
            );
            this.selectedTeam = foundTeam ? foundTeam : this.teams[0];
          } else if (this.teams.length > 0) {
            this.selectedTeam = this.teams[0];
          } else {
            this.selectedTeam = undefined;
          }

          this.isLoading = false;
        },
        (error: HttpErrorResponse) => {
          this.handleError(error, 'Error fetching teams');
          this.teams = [];
          this.isLoading = false;
        }
      );
  }
  private teamData = new BehaviorSubject<TeamPopulated[]>([]);
  teams$ = this.teamData.asObservable();

  private updateLocalTeamDetails(updatedTeam: TeamPopulated) {
    const index = this.teams.findIndex((team) => team._id === updatedTeam._id);
    if (index > -1) {
      // Directly update the team in the teams array
      this.teams[index] = updatedTeam;
      this.teams = [...this.teams]; // Ensures teams array is a new reference

      if (this.selectedTeam?._id === updatedTeam._id) {
        // Create a deep copy of updatedTeam
        this.selectedTeam = {
          ...updatedTeam,
          teamMembers: updatedTeam.teamMembers.map((member) => ({ ...member })),
        };
      }
    } else {
      this.loadAllTeamDetails();
    }
  }

  private handleError(err: HttpErrorResponse, defaultMsg: string): void {
    let errorMessage = `Error Code: ${err.status}, Message: ${err.message}`;
    console.error(errorMessage, err);
    this.isLoading = false;
    // Display error message using Snackbar
    this.snackBar.open(defaultMsg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
