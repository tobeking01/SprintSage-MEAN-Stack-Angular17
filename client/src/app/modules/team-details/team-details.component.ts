import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';
import { TeamPopulated } from 'src/app/services/model/team.model';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectFull } from 'src/app/services/model/project.model';
import { ProjectService } from '../../services/project.service';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
export class TeamDetailsComponent implements OnInit {
  users: User[] = [];
  teams: TeamPopulated[] = [];
  errorMessage: string = '';
  selectedProject?: ProjectFull;
  currentProjects?: string = '';
  teamName?: string = '';
  isLoading: boolean = false;
  userTeams: TeamPopulated[] = [];
  selectedTeamId?: string;
  teamProjects: ProjectFull[] = [];

  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadProjectsBasedOnTeamUserLoggedIn();
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

  loadTeamMembersByTeamId(teamId: string): void {
    this.teamService.getTeamById(teamId).subscribe({
      next: (response) => {
        const teamData = response.data;
        this.users = teamData.teamMembers || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError(err, 'Failed to load team members.');
      },
    });
  }

  loadProjectsBasedOnTeamUserLoggedIn(): void {
    const currentUserId: string | null = this.authService.getCurrentUserId();

    if (!currentUserId) {
      this.handleError(
        new HttpErrorResponse({ error: 'User is not logged in.' }),
        'User is not logged in.'
      );
      return;
    }
    if (this.userTeams.length > 0) {
      this.loadTeamMembersByTeamId(this.userTeams[0]._id);
    }
    // Start by getting teams of the logged-in user
    this.teamService
      .getTeamsByUserId(currentUserId)
      .pipe(
        switchMap((teamResponse) => {
          const teams = teamResponse?.data || [];
          if (teams.length === 0) {
            throw new HttpErrorResponse({
              error: 'User is not part of any team.',
            });
          }

          // Set userTeams to all the teams of the user
          this.userTeams = teams;

          // By default, get projects for the first team
          const userTeamId = teams[0]._id;
          return this.teamService.getProjectsByTeamId(userTeamId);
        })
      )
      .subscribe({
        next: (projectResponse) => {
          const projects = projectResponse?.data || [];
          if (projects.length > 0) {
            this.currentProjects = projects
              .map((p) => p?.projectName)
              .join(', ');
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError(err, 'Failed to load data for the logged-in user.');
        },
      });
  }
  onTeamNameClick(teamId: string): void {
    // Set the selected team ID and reset teamProjects
    this.selectedTeamId = teamId;
    this.teamProjects = [];

    // Load team members when a team name is clicked
    this.loadTeamMembersByTeamId(teamId);

    // Load the projects associated with this team
    this.teamService.getProjectsByTeamId(teamId).subscribe({
      next: (projectResponse) => {
        this.teamProjects = projectResponse?.data || [];
      },
      error: (err) => {
        this.handleError(err, 'Failed to load projects for the selected team.');
      },
    });
  }

  onProjectClick(projectId: string): void {
    // Logic for when a project is clicked can go here
    // For instance, navigating to a project details page or displaying more details in a modal
  }
}
