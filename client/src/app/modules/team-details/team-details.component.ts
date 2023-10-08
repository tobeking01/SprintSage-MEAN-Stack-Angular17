import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { ResponseData, User } from 'src/app/services/model/user.model';
import {
  Team,
  SingleTeamResponseData,
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
export class TeamDetailsComponent implements OnInit {
  teamName: string = ''; // Placeholder until you fetch the actual data
  currentProjects: string = ''; // Placeholder array, replace with actual data fetching
  users: User[] = [];
  teams: TeamPopulated[] = [];
  loggedInUserId!: string;
  errorMessage: string = '';

  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue._id
    ) {
      this.loggedInUserId = this.authService.currentUserValue._id; // Get the logged-in user's ID
      this.loadTeamsBasedOnLoggedInUser();
    } else {
      this.loggedInUserId = ''; // Or handle this scenario differently if needed
    }
    this.loadUsers();
  }

  loadTeamsBasedOnLoggedInUser(): void {
    this.teamService.getTeamsByUserId(this.loggedInUserId).subscribe(
      (response: MultipleTeamsResponseData) => {
        this.teams = response.data;
        if (this.teams.length) {
          this.teamName = this.teams[0].teamName;

          // Extract all project names from the first team
          const projectNames =
            this.teams[0].projects?.map((proj) => proj.projectName) || [];

          this.currentProjects = projectNames.join(', ');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching teams based on logged-in user:', error);
        this.teams = [];
        this.errorMessage = 'Failed to load team data. Please try again later.';
      }
    );
  }

  loadUsers() {
    console.log('Fetching users...');
    this.userService.getAllUsers().subscribe(
      (response: ResponseData) => {
        this.users = response.data[0];
        console.log('Users fetched:', this.users);
      },
      (error: HttpErrorResponse) => {
        console.error('Error:', error);
      }
    );
  }
}
