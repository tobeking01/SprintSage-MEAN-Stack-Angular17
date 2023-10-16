import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import {
  MultipleProjectsResponseData,
  ProjectPopulated,
} from 'src/app/services/model/project.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { User, UserPopulated } from 'src/app/services/model/user.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {
  selectedProject?: ProjectPopulated;
  users: User[] = [];
  teams: TeamPopulated[] = [];
  projectMembers: UserPopulated[] = [];
  roleNames: { [id: string]: string } = {};
  addMemberForm!: FormGroup;
  isLoading = false;
  membersVisible = false;
  errorMessage = '';

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => {
          const projectId = params.get('id');
          if (projectId) {
            this.fetchProjectDetails(projectId);
            console.log(projectId);
          } else {
            console.error('Project ID not provided in route parameters.');
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.loadAllTeamDetails();
    this.initializeForm();
  }

  private initializeForm(): void {
    this.addMemberForm = this.fb.group({
      teamMembers: this.fb.array([], Validators.minLength(1)),
    });
  }

  private fetchProjectDetails(projectId: string): void {
    this.projectService.getProjectById(projectId).subscribe(
      (response: MultipleProjectsResponseData) => {
        this.selectedProject = response.data[0];
        console.log('Project Data:', this.selectedProject);
      },
      (error: HttpErrorResponse) => {
        this.errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
        console.error('Error fetching project details:', error.error.message);
      }
    );
  }

  private loadAllTeamDetails(): void {
    this.route.paramMap
      .pipe(
        tap((params) => {
          const projectId = params.get('id');
          if (projectId) {
            this.teamService
              .getTeamsByProjectDetails(projectId)
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe(
                (response: MultipleTeamsResponseData) => {
                  this.teams = response.data;
                  this.teams.forEach((team) => {
                    team.teamMembers.forEach((member) => {
                      this.roleNames[member._id] = member.roles[0].name;
                      if (
                        !this.projectMembers.find((m) => m._id === member._id)
                      ) {
                        this.projectMembers.push(member); // populate the projectMembers array
                      }
                    });
                  });
                },
                (error: HttpErrorResponse) => {
                  this.errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
                  console.error('Error fetching teams:', error.error.message);
                  this.teams = [];
                }
              );
          } else {
            console.error('Project ID not provided in route parameters.');
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();
  }

  get teamMembersControls(): FormControl[] {
    return (this.addMemberForm.get('teamMembers') as FormArray)
      .controls as FormControl[];
  }

  // Add these methods to your ProjectDetailsComponent class.

  toggleMembersVisibility(): void {
    this.membersVisible = !this.membersVisible;
  }

  addMembers(): void {
    // Here you'd typically want to show a modal or a form to add members.
    // Fetch the list of users, let the user select one, and then add that user to the project.
    // After adding the user, you'd typically want to refresh the list of members for this project.
  }

  deleteProject(): void {
    // Show a confirmation dialog to the user.
    // If they confirm, send a request to your backend to delete the project.
    // Handle errors gracefully - e.g., show an error message if the deletion fails.
    // If the deletion is successful, you might want to navigate the user back to a list of all projects.
  }

  removeMemberFromProject(member: any): void {
    // Show a confirmation dialog to the user.
    // If they confirm, send a request to your backend to remove this member from the project.
    // After removing the user, you'd typically want to refresh the list of members for this project.
  }

  saveTeamsToProject(): void {
    // Validate the form.
    // If valid, extract the team members from the form.
    // Send a request to your backend to add these members to the project.
    // Handle the response - if successful, show a success message and possibly refresh the list of project members.
    // If unsuccessful, show an error message.
  }

  removeMembers(index: number): void {
    (this.addMemberForm.get('teamMembers') as FormArray).removeAt(index);
  }

  get MembersControls() {
    return (this.addMemberForm.get('teamMembers') as FormArray).controls;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
