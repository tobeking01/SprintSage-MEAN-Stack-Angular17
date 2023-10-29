import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TeamService } from 'src/app/services/team.service';
import { User } from 'src/app/services/model/user.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { CreateTeamComponent } from './create-team/create-team.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
export class TeamDetailsComponent implements OnInit {
  teams: TeamPopulated[] = [];
  users: User[] = [];

  selectedTeam?: TeamPopulated;
  errorMessage = '';
  teamName = '';
  isLoading = false;

  constructor(private teamService: TeamService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadAllTeamDetails();
  }

  selectTeam(team: TeamPopulated): void {
    this.selectedTeam = team;
  }

  createTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadAllTeamDetails();
      },
    });
  }
  private loadAllTeamDetails(): void {
    console.log('Fetching teams...');
    this.teamService
      .getTeamsByUserId()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleTeamsResponseData) => {
          this.teams = response.data;
          console.log('Teams fetched:', this.teams);

          // Set the first team as the selected team by default
          if (this.teams.length > 0) {
            this.selectedTeam = this.teams[0];
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

  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  private handleError(err: HttpErrorResponse, defaultMsg: string): void {
    let errorMessage = defaultMsg;
    if (err instanceof HttpErrorResponse) {
      // Server or connection error happened
      errorMessage = `Error Code: ${err.status}, Message: ${err.message}`;
    } else {
      errorMessage = (err as any).message || defaultMsg;
    }
    console.error(errorMessage, err);
    this.errorMessage = errorMessage;
  }
}
