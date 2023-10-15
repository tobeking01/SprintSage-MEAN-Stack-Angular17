import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import {
  MultipleProjectsResponseData,
  ProjectPopulated,
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
  addMemberForm!: FormGroup;
  isExistingTeamSelected = false;
  selectedProject?: ProjectPopulated;
  @Output() close = new EventEmitter<void>();
  users: User[] = [];
  teams: TeamPopulated[] = [];
  loggedInUserId: string = '';
  teamMembersDetails: { [key: string]: string } = {};
  loggedInUser: User | null = null;
  projectMembers: User[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  private ngUnsubscribe = new Subject<void>();
  membersVisible = false;
  roleNames: { [id: string]: string } = {};
  private onDestroy$ = new Subject<void>(); // For handling unSubscription when the component is destroyed
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private userService: UserService,
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.combineObservables();
    this.loadLoggedInUser();
    this.loadAllTeamDetails();
    this.initializeForm();
    this.fetchRoleNames();
  }

  initializeForm() {
    this.addMemberForm = this.fb.group({
      teamMembers: this.fb.array([], Validators.minLength(1)),
    });
  }

  toggleMembersVisibility(): void {
    // If members are not loaded yet, load them
    if (!this.membersVisible && this.projectMembers.length === 0) {
      this.viewMembers();
    }
    this.membersVisible = !this.membersVisible;
  }

  removeMemberFromProject(member: User): void {
    // Logic to remove the member from the project
    // For example, you can splice them from the projectMembers array
    const index = this.projectMembers.indexOf(member);
    if (index > -1) {
      this.projectMembers.splice(index, 1);
    }

    // Additionally, you'll want to update the backend to reflect this change
    // (e.g., by calling a service method to update the project's members in the database).
  }

  fetchRoleNames(): void {
    this.userService.getRoleMappings().subscribe(
      (mappings) => {
        console.log('Fetched role mappings:', mappings);
        this.roleNames = mappings;
      },
      (error) => {
        console.error('Error fetching role mappings:', error);
        this.error = 'Error fetching role mappings.';
      }
    );
  }

  getRoleName(roleId: string[]): string {
    if (roleId && roleId.length > 0) {
      return this.roleNames[roleId[0]] || 'Unknown Role';
    }
    return 'No Role Assigned';
  }

  private combineObservables(): void {
    forkJoin([this.loadLoggedInUser(), this.loadAllTeamDetails()])
      .pipe(
        tap(() => {
          const projectId = this.route.snapshot.paramMap.get('projectId');
          if (projectId) {
            this.fetchProjectDetails();
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();
  }

  private fetchProjectDetails(): void {
    this.projectService.getProjectsByUserId().subscribe(
      (response: MultipleProjectsResponseData) => {
        // If the response data is an array, take the first element
        this.selectedProject = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching project details:', error.error.message);
        // Optionally show a user-friendly message or redirect the user.
      }
    );
  }

  saveTeamsToProject(): void {
    if (this.addMemberForm.invalid) {
      // TODO: Show a user-friendly notification about the invalid form
      return;
    }

    if (!this.selectedProject?._id) {
      // TODO: Show a user-friendly notification that no project is selected
      return;
    }

    const selectedTeamIds = this.addMemberForm.value.teamMembers;

    if (!Array.isArray(selectedTeamIds) || selectedTeamIds.length === 0) {
      // TODO: Show a user-friendly notification that no teams are selected
      return;
    }

    this.projectService
      .addTeamsToProject(this.selectedProject._id, selectedTeamIds)
      .subscribe(
        () => {
          // TODO: Show a user-friendly notification about the successful addition of teams
        },
        (error) => {
          console.error('Error adding teams:', error);
          // TODO: Show a user-friendly notification about the error
        }
      );
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
        },
        (error: any) => {
          console.error('Error:', error);
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
    console.log('Fetching teams...');
    this.teamService
      .getTeamsByUserId()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (response: MultipleTeamsResponseData) => {
          this.teams = response.data;

          console.log('Teams fetched:', this.teams);
        },
        (error: HttpErrorResponse) => {
          this.handleError(error, 'Error fetching teams');
          this.teams = [];
        }
      );
  }

  viewMembers(): void {
    console.log('Selected Project:', this.selectedProject);

    if (
      !this.selectedProject?.teams ||
      this.selectedProject?.teams.length === 0
    ) {
      console.error(
        'No teams associated with the selected project or project is not loaded yet!'
      );
      return;
    }

    const projectTeamId = this.selectedProject.teams[0]._id; // Taking the first team's ID

    const projectTeam = this.teams.find((team) => team._id === projectTeamId);
    console.log('Project members:', this.projectMembers);

    if (projectTeam) {
      this.projectMembers = projectTeam.teamMembers;
    } else {
      console.error('Team not found in the teams array:', projectTeamId);
    }
  }
  get teamMembersFormArray(): FormArray {
    return this.addMemberForm.get('teamMembers') as FormArray;
  }

  get teamMembersControls(): FormControl[] {
    return this.teamMembersFormArray.controls as FormControl[];
  }

  addMembers() {
    this.teamMembersFormArray.push(new FormControl('', Validators.required));
  }

  removeMembers(index: number) {
    this.teamMembersFormArray.removeAt(index);
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
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
