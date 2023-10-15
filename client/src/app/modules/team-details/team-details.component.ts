import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ResponseData, User } from 'src/app/services/model/user.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
export class TeamDetailsComponent implements OnInit {
  users: User[] = [];
  teams: TeamPopulated[] = [];
  selectedTeam?: TeamPopulated;
  errorMessage: string = '';
  teamName?: string = '';
  isLoading: boolean = false;
  loggedInUserId: string = '';
  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed

  constructor(
    private teamService: TeamService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadLoggedInUser();
    this.loadAllTeamDetails();
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
          this.isLoading = false; // <-- Add this line
        },
        (error: any) => {
          console.error('Error:', error);
          this.isLoading = false; // <-- Add this line
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
    console.log('Fetching teams... ');
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

  selectTeam(team: TeamPopulated) {
    this.selectedTeam = team;
  }
}
