// team-details.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TeamService } from 'src/app/services/team.service';
import { Team, TeamPopulated } from 'src/app/services/model/team.model';

import { HttpErrorResponse } from '@angular/common/http';
import { User, UserPopulated } from 'src/app/services/model/user.model';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddUserDialogComponent } from 'src/app/shared/components/add-user-dialog/add-user-dialog.component';

interface Member {
  user: UserPopulated;
}

interface Project {
  project: {
    _id: string;
  };
  addedDate: Date;
}

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
export class TeamDetailsComponent implements OnInit, OnDestroy {
  teamId?: string;
  teamDetails?: TeamPopulated;
  teamForm: FormGroup;
  selectedTeam?: TeamPopulated | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.teamForm = this.fb.group({
      teamName: ['', Validators.required],
      teamMembers: this.fb.array([]),
      projects: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('teamId');
      console.log('param teamId in nG:', id);
      if (id) {
        this.teamId = id;
        this.loadTeamDetails(id);
      } else {
        // Handle the case where id is null, maybe navigate back or show an error message
        this.snackBar.open('Invalid team ID', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/manage-teams']); // or your fallback path
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTeamDetails(teamId: string): void {
    this.isLoading = true;
    this.teamService
      .getTeamDetailsById(teamId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Team details loaded:', response.data); // Log the loaded team details

          this.selectedTeam = response.data;
          if (!this.selectedTeam) {
            console.error('Selected team is undefined after assignment.');
          }

          this.initializeForm(this.selectedTeam);
          this.isLoading = false;

          // Trigger change detection manually for the whole component
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => {
          console.error('Error loading team details:', err); // Log the error
          this.snackBar.open('Failed to load team details', 'Dismiss', {
            duration: 3000,
          });
          this.isLoading = false;
          this.changeDetectorRef.detectChanges(); // Update the view in case of error as well
        },
      });
  }
  // Add a new method to get the member's full name
  getMemberFullName(member: AbstractControl): string {
    const user = member.get('user')?.value;
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  }

  public removeMember(index: number): void {
    const teamMembersArray = this.teamForm.get('teamMembers') as FormArray;
    teamMembersArray.removeAt(index);
    teamMembersArray.markAsTouched();
    teamMembersArray.updateValueAndValidity();
  }

  private initializeForm(team: TeamPopulated): void {
    this.teamForm.patchValue({
      teamName: team.teamName,
    });

    // Clear the form arrays before initializing
    this.clearFormArray(this.teamMembers);
    this.clearFormArray(this.projects);

    // Initialize team members
    team.teamMembers.forEach((member) => {
      if (member.user) {
        this.addTeamMember({
          user: member.user, // Assuming member.user is UserPopulated and contains _id
        });
      } else {
        console.error('User details are missing for member:', member);
      }
    });
    team.projects.forEach((project) => this.addProject(project));
  }

  public addNewMembersToTeam(members: User[]): void {
    if (!this.teamId) {
      this.snackBar.open('No team ID provided', 'Dismiss', { duration: 3000 });
      return;
    }

    // Construct payload with only the member IDs
    const payload = {
      teamMembers: members.map((member) => member._id),
    };

    this.isLoading = true; // Show loading indicator

    // Call the service method to add members to the team
    this.teamService.addUsersToTeam(this.teamId, payload).subscribe({
      next: () => {
        this.snackBar.open('Members added successfully', 'Dismiss', {
          duration: 3000,
        });
        if (this.teamId) {
          // Check that teamId is not undefined
          this.loadTeamDetails(this.teamId); // Refresh the team details
        }
        this.isLoading = false; // Hide loading indicator
      },
      error: (err) => {
        this.handleError(err);
        this.isLoading = false; // Hide loading indicator
      },
    });
  }

  addMembers(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      data: {
        teamId: this.teamId,
        createdBy: this.selectedTeam?.createdBy._id,
      },
    });

    dialogRef.afterClosed().subscribe((selectedUsers: User[]) => {
      if (selectedUsers && selectedUsers.length > 0) {
        this.addNewMembersToTeam(selectedUsers);
      }
    });
  }

  private addTeamMember(member: Member): void {
    // Log the member data for debugging purposes
    console.log('Member data:', member);

    // Use optional chaining to safely access nested properties
    const _id = member.user._id; // Get the user ID from the member object
    const firstName = member?.user?.firstName;
    const lastName = member?.user?.lastName;

    // Validate the required data
    if (!_id || !firstName || !lastName) {
      console.error(
        'Invalid member data: Missing _id, firstName, or lastName',
        member
      );
      // Handle the error as appropriate, such as displaying a user-friendly message
      return;
    }

    // Since all the required fields are present, create the form control for the member
    const memberControl = this.fb.group({
      _id: [_id, Validators.required], // Assign the user ID string here
      user: this.fb.group({
        firstName: [firstName, Validators.required], // Assuming firstName is required
        lastName: [lastName, Validators.required], // Assuming lastName is required
        // Include any other user properties with appropriate validators
      }),
    });

    // Add the new member control to the form array
    this.teamMembers.push(memberControl);
  }

  private addProject(project: Project): void {
    this.projects.push(
      this.fb.group({
        project: [project.project._id, Validators.required],
        addedDate: [project.addedDate, Validators.required],
      })
    );
  }

  private clearFormArray(formArray: FormArray): void {
    while (formArray.length) {
      formArray.removeAt(0);
    }
  }

  get teamMembers(): FormArray {
    return this.teamForm.get('teamMembers') as FormArray;
  }

  get projects(): FormArray {
    return this.teamForm.get('projects') as FormArray;
  }

  public saveTeam(): void {
    if (this.teamId !== undefined && this.teamForm.valid) {
      const formValue = this.teamForm.value;

      // Construct payload with only the necessary fields for the backend
      const payload = {
        teamName: formValue.teamName,
        // Map the team members to only include their _id as the backend expects
        teamMembers: formValue.teamMembers.map((member: Team) => member._id),
      };

      // Use the constructed payload to make the API call
      this.teamService
        .updateTeamById(this.teamId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Team updated successfully', 'Dismiss', {
              duration: 3000,
            });
            this.router.navigate(['/manage-team']);
          },
          error: (err) => {
            this.handleError(err);
            this.snackBar.open('Failed to update team', 'Dismiss', {
              duration: 3000,
            });
          },
        });
    } else {
      // Handle the undefined teamId or invalid form case here
      this.snackBar.open(
        'Team ID is undefined or the form is invalid',
        'Dismiss',
        { duration: 3000 }
      );
    }
  }

  public handleError(error: HttpErrorResponse): void {
    console.error('HTTP error occurred:', error);
    const errorMsg = error.error?.message || 'An unexpected error occurred';
    this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
    console.error('Error:', errorMsg);
  }
}
