// Angular core and Material imports
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, forkJoin, of } from 'rxjs';

// Import services and models
import { User } from 'src/app/services/model/user.model';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';

// Interface for handling errors when adding users
interface AddUserResponseError {
  success: boolean;
  user: User;
}

// Component decorator with its selector, HTML and SCSS files
@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent {
  users: User[] = []; // Stores list of users
  selectedUsers: User[] = []; // Stores users selected for adding to team
  currentSelectedUserId?: string; // Current selected user ID for adding to the team
  teamId?: string; // Team ID for which members are being added
  form: FormGroup; // Reactive form for selecting a user
  isLoading: boolean = false; // Loader state

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private teamService: TeamService,
    public dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // Data injected into the dialog (expected to contain `teamId`)
    private cdr: ChangeDetectorRef // Change detector for manually triggering view updates
  ) {
    this.form = this.fb.group({
      currentSelectedUserId: [''],
    });
    this.teamId = data.teamId;
    console.log('Team ID:', this.teamId);

    this.loadAllUsers(); // Load users when component is initialized
  }

  // Loads all users eligible for adding to the team
  loadAllUsers(): void {
    this.userService.getAllUsersForTeam().subscribe((users) => {
      this.users = users;
    });
  }

  // Determines if the 'Add' button should be disabled based on certain conditions
  get isAddButtonDisabled(): boolean {
    return this.selectedUsers.length === 0 || !this.teamId;
  }

  // Accessor for the form control to select users
  get currentSelectedUserControl(): FormControl {
    return this.form.get('currentSelectedUserId') as FormControl;
  }

  // Method to add selected members to the team
  addMemberToTeam(): void {
    if (!this.teamId || this.selectedUsers.length === 0) {
      return;
    }

    this.isLoading = true;

    // Creating a list of requests to add each user
    const addRequests = this.selectedUsers.map((user) =>
      this.teamService.addUserToTeam(this.teamId!, user._id).pipe(
        catchError((error) => {
          console.error(
            `Error adding ${user.firstName} ${user.lastName}:`,
            error
          );
          // Showing an error snack bar for each failed addition
          this.snackBar.open(
            `Failed to add ${user.firstName} ${user.lastName}. Please try again.`,
            'Close',
            { duration: 3000 }
          );
          return of({ success: false, user });
        })
      )
    );

    // Using forkJoin to execute all add user requests and handling the responses collectively
    forkJoin(addRequests).subscribe((results) => {
      this.isLoading = false;

      // Filtering out failed additions
      const failedAdds = results.filter(this.isAddUserResponseError);

      if (failedAdds.length > 0) {
        // Showing a snack bar message for all failed additions
        const failedNames = failedAdds
          .map((u) => `${u.user.firstName} ${u.user.lastName}`)
          .join(', ');
        this.snackBar.open(
          `Could not add the following members: ${failedNames}`,
          'Close',
          { duration: 5000 }
        );
      }

      // Handling responses based on whether all, some, or none were successful
      if (failedAdds.length !== this.selectedUsers.length) {
        this.snackBar.open(
          'Members added successfully, with some exceptions.',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      } else {
        this.snackBar.open(
          'Failed to add any members. Please try again.',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  // Utility function to check if an add user response is an error
  isAddUserResponseError(response: any): response is AddUserResponseError {
    return response && !response.success && response.user !== undefined;
  }

  // Method to add a user to the selection
  addUserToSelection(): void {
    const selectedUserId = this.currentSelectedUserControl.value;
    const userToAdd = this.users.find((user) => user._id === selectedUserId);

    if (userToAdd && !this.selectedUsers.includes(userToAdd)) {
      this.selectedUsers.push(userToAdd);
      this.currentSelectedUserControl.reset();
      this.cdr.markForCheck(); // Ensuring the view reflects the updated selected users
      // Showing a confirmation snack bar
      this.snackBar.open(
        `${userToAdd.firstName} ${userToAdd.lastName} added to selection`,
        'Close',
        { duration: 2000 }
      );
    }
  }

  // Method to remove a user from the selection
  removeUserFromSelection(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
      this.cdr.markForCheck(); // Update view after removal
      // Showing a snack bar for successful removal
      this.snackBar.open(
        `${user.firstName} ${user.lastName} removed from selection`,
        'Close',
        { duration: 2000 }
      );
    }
  }
}
