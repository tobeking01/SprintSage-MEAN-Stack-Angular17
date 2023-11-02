import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';
import { SingleTeamResponseData } from 'src/app/services/model/team.model';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss'],
})
export class AddUserDialogComponent implements OnInit {
  users: User[] = [];
  selectedUsers: User[] = [];
  currentSelectedUserControl = new FormControl(null);
  addUserForm = this.fb.group({
    userIds: [[], Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { teamId: string }
  ) {}

  ngOnInit(): void {
    console.log('Initializing AddUserDialogComponent');
    this.loadAllUsers();
  }

  remove(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }
  // Load all users available for selection
  private loadAllUsers(): void {
    this.userService.getAllUsersForTeam().subscribe(
      (users) => {
        console.log('Loaded users:', users);
        this.users = users;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  // Removes a selected user from the current selection
  removeUserFromSelection(userToRemove: User): void {
    const control = this.addUserForm.get('userIds') as FormControl;
    if (!control) {
      return; // Exit if the control isn't found
    }

    const updatedUserIds =
      control.value?.filter((userId: string) => userId !== userToRemove._id) ||
      [];

    control.setValue(updatedUserIds);
    this.selectedUsers = this.selectedUsers.filter(
      (user) => user._id !== userToRemove._id
    );
  }

  // Getter for the userIds FormControl for cleaner code
  get userIdsControl(): FormControl {
    return this.addUserForm.get('userIds') as FormControl;
  }

  // Disable the Add button if no user is selected
  get isAddButtonDisabled(): boolean {
    return this.selectedUsers.length === 0;
  }
  addUserToSelection(): void {
    const selectedUserId = this.currentSelectedUserControl.value;
    if (!selectedUserId) return;

    const userToAdd = this.users.find((user) => user._id === selectedUserId);
    if (userToAdd && !this.selectedUsers.some((u) => u._id === userToAdd._id)) {
      this.selectedUsers.push(userToAdd);
      this.users = this.users.filter((u) => u._id !== selectedUserId); // Remove the added user from the dropdown
      this.currentSelectedUserControl.reset();
    }
  }

  // Adds selected members to the team
  addMemberToTeam(): void {
    console.log('Adding members to team:', this.selectedUsers);
    if (this.selectedUsers.length === 0) {
      this.snackBar.open('Please select at least one user', 'Close', {
        duration: 3000,
      });
      return;
    }

    const userIds = this.selectedUsers.map((u) => u._id);
    if (userIds.length === 0) {
      this.snackBar.open('Please select at least one user', 'Close', {
        duration: 3000,
      });
      return;
    }

    // Map user IDs to a series of observables handling user addition
    const addRequests: Observable<SingleTeamResponseData | null>[] =
      userIds.map(
        (userId: string) =>
          this.teamService
            .addUserToTeam(this.data.teamId, userId)
            .pipe(catchError(() => of(null))) // Catch errors per request
      );

    // Subscribe to all add user requests simultaneously
    forkJoin(addRequests).subscribe({
      next: (results: (SingleTeamResponseData | null)[]) => {
        // Find a non-null response to extract the updated team data.
        const successfulResult = results.find((result) => result !== null);
        if (successfulResult) {
          const updatedTeam = successfulResult.data;
          console.log(updatedTeam);
          this.dialogRef.close(updatedTeam);
        } else {
          // Handle case where no results were successful or no results
          this.dialogRef.close(); // Close dialog without data, or handle appropriately
        }

        // Display success message
        this.snackBar.open('Users added successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        // Log and display error message
        console.error('Error occurred during forkJoin subscription:', err);
        this.snackBar.open(
          'An error occurred while adding users. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
      },
    });
  }
}
