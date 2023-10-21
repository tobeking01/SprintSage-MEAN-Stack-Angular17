import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  SingleProjectResponseData,
} from 'src/app/services/model/project.model';
import {
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { User, UserPopulated } from 'src/app/services/model/user.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberComponent } from 'src/app/shared/components/add-member/add-member.component';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
})
export class ProjectDetailsComponent implements OnInit {
  selectedProject?: ProjectPopulated;
  users: User[] = [];
  teamInfo: TeamPopulated[] = [];
  projectMembersSet = new Set<UserPopulated>();
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
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProjectDetails(projectId);
      this.loadAllTeamDetails(projectId);
    } else {
      console.error('Project ID not provided in route parameters.');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get teamMembersControls(): FormControl[] {
    console.log('Form State:', this.addMemberForm);
    const controls = this.addMemberForm?.get('teamMembers') as FormArray;
    return (controls?.controls as FormControl[]) || [];
  }

  toggleMembersVisibility(): void {
    this.membersVisible = !this.membersVisible;
  }

  addMembers(): void {
    const teamId = this.teamInfo[0]?.teamMembers[0]?.user?._id;
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
          if (this.selectedProject && this.selectedProject._id) {
            this.loadAllTeamDetails(this.selectedProject._id);
          } else {
            console.error(
              'selectedProject is not defined or missing _id property'
            );
          }
        }
      },
    });
  }

  removeMemberFromProject(memberId: string, index: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to remove this member from the project?'
    );

    if (!confirmed) {
      (this.addMemberForm.get('teamMembers') as FormArray).removeAt(index);
    }

    if (this.selectedProject && this.selectedProject._id) {
      this.projectService
        .removeMemberFromProject(this.selectedProject._id, memberId)
        .subscribe(
          () => {
            console.log('Member removed successfully');
            if (this.selectedProject && this.selectedProject._id) {
              this.loadAllTeamDetails(this.selectedProject._id);
            } else {
              console.error(
                'selectedProject is not defined or missing _id property'
              );
            }
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
          if (this.selectedProject && this.selectedProject._id) {
            this.loadAllTeamDetails(this.selectedProject._id);
          } else {
            console.error(
              'selectedProject is not defined or missing _id property'
            );
          }
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
  editProject(): void {
    // EditProjectComponent is not imported
    // You might want to import and utilize it.
    /*
    const dialogRef = this.dialog.open(EditProjectComponent, {
      data: this.selectedProject,
    });

    dialogRef.afterClosed().subscribe((updatedProject) => {
      if (updatedProject) {
        this.selectedProject = updatedProject;
      }
    });
    */
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

  handleError(error: HttpErrorResponse): void {
    const errorMsg = error.error?.message || 'An unexpected error occurred';
    this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
    console.error('Error:', errorMsg);
    this.errorMessage = errorMsg;
  }

  private initializeForm(): void {
    this.addMemberForm = this.fb.group({
      teamMembers: this.fb.array([], Validators.minLength(1)),
    });
  }

  // Good but modify to fit model
  private loadProjectDetails(projectId: string): void {
    this.projectService.getProjectById(projectId).subscribe(
      (response: SingleProjectResponseData) => {
        if (response.data) {
          this.selectedProject = response.data;
          this.cdr.detectChanges();
          console.log('Selected Project:', this.selectedProject);
          console.log('Project Data:', this.selectedProject);
        } else {
          console.warn('No project found for the given ID');
          // Handle this scenario, maybe redirect or show a message.
          this.errorMessage = 'No project found for the given ID';
        }
      },
      (error: HttpErrorResponse) => this.handleError(error)
    );
  }

  private loadAllTeamDetails(projectId: string): void {
    this.teamService
      .getTeamsByProjectId(projectId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response: MultipleTeamsResponseData) => {
          this.teamInfo = response.data;
          this.teamInfo.forEach((team) => {
            team.teamMembers.forEach((memberObj) => {
              const member = memberObj.user;
              this.roleNames[member._id] = member.roles[0].name;
              if (
                ![...this.projectMembersSet].some((m) => m._id === member._id)
              ) {
                this.projectMembersSet.add(member);
              }
            });
          });
        },
        (error: HttpErrorResponse) => this.handleError(error)
      );
  }
}
