import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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
import { CreateTeamComponent } from '../../team-details/create-team/create-team.component';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberComponent } from 'src/app/shared/components/add-member/add-member.component';
import { UserService } from 'src/app/services/user.service';

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
  returnUrl: string | null =
    this.router.getCurrentNavigation()?.extras.state?.['returnUrl'];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
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
                  this.teams.forEach((team) => {
                    team.teamMembers.forEach((memberObj) => {
                      const member = memberObj.user; // adjust to get the user object from teamMembers
                      this.roleNames[member._id] = member.roles[0].name;
                      if (
                        !this.projectMembers.find((m) => m._id === member._id)
                      ) {
                        this.projectMembers.push(member);
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

  toggleMembersVisibility(): void {
    this.membersVisible = !this.membersVisible;
  }

  addMembers(): void {
    const teamId = this.selectedProject?.teams[0]?.team?._id;
    if (!teamId) {
      console.error('No team associated with the selected project.');
      return;
    }

    const dialogRef = this.dialog.open(AddMemberComponent, {
      data: { teamId },
    });

    dialogRef.afterClosed().subscribe({
      next: (isMemberAdded) => {
        if (isMemberAdded) {
          this.loadAllTeamDetails();
        }
      },
    });
  }

  removeMemberFromProject(memberId: string): void {
    const confirmed = window.confirm(
      'Are you sure you want to remove this member from the project?'
    );

    if (!confirmed) {
      return;
    }

    if (this.selectedProject && this.selectedProject._id) {
      this.projectService
        .removeMemberFromProject(this.selectedProject._id, memberId)
        .subscribe(
          () => {
            console.log('Member removed successfully');
            this.loadAllTeamDetails(); // Refresh the list of members.
          },
          (error: HttpErrorResponse) => {
            console.error('Error removing member:', error.error.message);
          }
        );
    }
  }

  saveTeamsToProject(): void {
    if (!this.addMemberForm.valid) {
      this.snackBar.open('Please add valid team members', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (!this.selectedProject || !this.selectedProject._id) {
      console.error('No project selected to add members.');
      return;
    }

    const teamMembersToAdd = this.addMemberForm!.get('teamMembers')!.value;

    this.projectService
      .addTeamsToProject(this.selectedProject._id, teamMembersToAdd)
      .subscribe(
        () => {
          console.log('Members added successfully');
          this.snackBar.open('Members added successfully', 'Close', {
            duration: 3000,
          });
          // Refresh the list of members after adding new members
          this.loadAllTeamDetails();
        },
        (error: HttpErrorResponse) => {
          const errorMsg =
            error.error?.message || 'An unexpected error occurred';
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
          });
          console.error('Error adding members:', errorMsg);
        }
      );
  }

  deleteProject(): void {
    this.isLoading = true;
    // Check if the project is selected.
    if (!this.selectedProject || !this.selectedProject._id) {
      console.error('No project selected to delete.');
      return;
    }

    // Show a confirmation dialog to the user.
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmed) {
      return;
    }

    this.projectService.deleteProjectById(this.selectedProject._id).subscribe(
      () => {
        console.log('Project deleted successfully');
        this.snackBar.open('Project deleted successfully', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
        this.router.navigate([this.returnUrl || 'manage-project']);
      },
      (error: HttpErrorResponse) => {
        const errorMsg = error.error?.message || 'An unexpected error occurred';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 5000,
        });
        this.isLoading = false;
        console.error('Error deleting project:', errorMsg);
      }
    );
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
