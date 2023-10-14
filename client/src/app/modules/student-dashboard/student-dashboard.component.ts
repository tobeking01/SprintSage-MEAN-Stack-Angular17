import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectPopulated } from 'src/app/services/model/project.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { User } from 'src/app/services/model/user.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { MultipleProjectsResponseData } from 'src/app/services/model/project.model';
import { CreateProjectComponent } from '../manage-project/create-project/create-project.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamComponent } from '../team-details/create-team/create-team.component';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {
  teamMembersDetails: { [key: string]: string } = {};
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projects: ProjectPopulated[] = [];
  selectedProject: ProjectPopulated | null = null;
  isLoading = false;
  errorMessage: string = '';

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    // this.loadUsers();
    this.loadTeamDetails();
    this.loadProjectDetails();
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

  // loadUsers() {
  //   console.log('Fetching users...');
  //   this.userService.getLoggedInUserDetails().subscribe(
  //     (response: ResponseData) => {
  //       console.log('Response received:', response); // <-- Log the entire response for debugging

  //       if (Array.isArray(response.data)) {
  //         this.users = response.data;
  //       } else {
  //         console.error('Unexpected data structure:', response.data);
  //         this.users = [response.data]; // Convert the single user object into an array
  //       }

  //       console.log('Users fetched:', this.users);
  //     },
  //     (error: HttpErrorResponse) => {
  //       console.error('Error:', error);
  //     }
  //   );
  // }

  private loadTeamDetails(): void {
    console.log('Fetching teams... studentDashboard');
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
        this.handleError(error, 'Error fetching teams');
        this.teams = [];
      }
    );
  }
  private loadProjectDetails(): void {
    console.log('Fetching project... studentDashboard');
    this.projectService.getProjectsByUserId().subscribe(
      (response: MultipleProjectsResponseData) => {
        if (Array.isArray(response.data)) {
          this.projects = response.data;
        } else {
          this.projects = [response.data];
        }

        console.log('projects fetched:', this.projects);
        this.isLoading = false;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching projects:', error);
        this.projects = [];
      }
    );
  }

  getMemberTooltip(member: User): string {
    return `${member.firstName} ${member.lastName} - ${member.userName}`;
  }
  openAddEditProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadProjectDetails();
      },
    });
  }

  openAddEditTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadTeamDetails();
      },
    });
  }
}
