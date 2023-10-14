import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { AuthService } from 'src/app/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadTeamDetails();
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

  loadTeamDetails(): void {
    console.log('Fetching teams... team details');
    this.teamService.getTeamsByUserId().subscribe(
      (response: MultipleTeamsResponseData) => {
        if (Array.isArray(response.data)) {
          this.teams = response.data;
        } else {
          this.teams = [response.data];
        }
        console.log('Teams fetched:', this.teams);

        // Set the first team as the selected team if it exists
        if (this.teams.length > 0) {
          this.selectedTeam = this.teams[0];
        }

        this.isLoading = false; // Ensure loading stops after fetching
      },
      (error: HttpErrorResponse) => {
        this.handleError(error, 'Error fetching teams'); // Use handleError function
      }
    );
  }

  selectTeam(team: TeamPopulated) {
    this.selectedTeam = team;
  }
}
