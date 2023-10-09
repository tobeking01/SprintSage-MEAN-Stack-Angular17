import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {
  ProjectFull,
  SingleProjectFullResponseData,
} from 'src/app/services/model/project.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { ResponseData, User } from 'src/app/services/model/user.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {
  // @Input() selectedProject: ProjectFull | null = null;
  selectedProject?: ProjectFull;
  @Output() close = new EventEmitter<void>();
  users: User[] = [];
  teams: TeamPopulated[] = [];
  loggedInUserId: string = '';
  teamMembersDetails: { [key: string]: string } = {};
  loggedInUser: User | null = null;

  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTeams();
    this.loadProject();
    this.loadLoggedInUser();
const projectId = this.route.snapshot.paramMap.get('projectId');
    if (projectId) {
      this.fetchProjectDetails(projectId);
    }
  }

  private loadLoggedInUser(): void {
    this.loggedInUser = this.authService.currentUserValue;
    if (this.loggedInUser?._id) {
      this.loggedInUserId = this.loggedInUser._id;
    }

    // Optionally: If you want the full details of the logged-in user, you can use the UserService
    // to fetch it by the ID.
    // this.loadUserDetailsById(this.loggedInUserId);
  }
  private fetchProjectDetails(id: string): void {
    // Call your service to fetch project details using the ID
    this.projectService
      .getProjectById(id)
      .subscribe((response: SingleProjectFullResponseData) => {
        this.selectedProject = response.data; // assuming the backend returns data in the 'data' property
      });
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
  loadProject() {}

  getMemberDetail(memberId: string | undefined): string {
    if (!memberId) {
      return 'Loading...';
    }
    return this.teamMembersDetails[memberId] ?? 'Loading...';
  }
  getMemberTooltip(member: User): string {
    return `${member.firstName} ${member.lastName} - ${member.userName}`;
  }

  viewMembers(): void {
    // Logic to fetch and display members
    // If the team members are already in 'teams' array, just display them.
    // Otherwise, you can call some service to fetch them.
  }
  getCurrentUser(): User | null {
    return this.authService.currentUserValue;
  }

  addMembers(): void {
    // Logic to add members
    // Open a dialog where you can select members and then update the project.
  }

  deleteProject(): void {
    const confirmDeletion = window.confirm(
      'Are you sure you want to delete this project?'
    );
    if (confirmDeletion) {
      this.projectService
        .deleteProjectById(this.selectedProject?._id as string)
        .subscribe(
          () => {
            // Handle successful deletion, e.g., close the component or notify the user
          },
          (error) => {
            console.error('Failed to delete the project:', error);
            // Optionally show an error message to the user
          }
        );
    }
  }
}
