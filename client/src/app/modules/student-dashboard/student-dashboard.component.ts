import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  MultipleProjectsFullResponseData,
  ProjectFull,
} from 'src/app/services/model/project.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { ResponseData, User } from 'src/app/services/model/user.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { SingleProjectFullResponseData } from 'src/app/services/model/project.model';
import { CreateProjectComponent } from '../manage-project/create-project/create-project.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {
  teamMembersDetails: { [key: string]: string } = {};
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projects: ProjectFull[] = [];

  selectedProject: ProjectFull | null = null;
  isLoading = false;
  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTeams();
    this.loadProject();
  }

  private loadUsers(): void {
    console.log('Fetching users... studentSide');
    this.userService.getLoggedInUserDetails().subscribe(
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
    console.log('Fetching teams... ');
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
    console.log('Fetching project...');
    this.isLoading = true;

    this.projectService.getProjectsByUserId().subscribe(
      (
        response:
          | SingleProjectFullResponseData
          | MultipleProjectsFullResponseData
      ) => {
        if (response.hasOwnProperty('data') && Array.isArray(response.data)) {
          // Assign the array directly for multiple projects
          this.projects = response.data;
        } else if (
          response.hasOwnProperty('data') &&
          !Array.isArray(response.data)
        ) {
          // Wrap single project inside an array
          this.projects = [response.data];
        }

        console.log('projects fetched:', this.projects);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching projects:', error);
        this.projects = [];
      }
    );
  }
  openAddEditProjectDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.loadProject();
      },
    });
  }
}
