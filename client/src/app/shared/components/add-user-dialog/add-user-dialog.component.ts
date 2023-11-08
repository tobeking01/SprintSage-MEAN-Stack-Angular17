import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';
import {
  SingleTeamResponseData,
  Team,
} from 'src/app/services/model/team.model';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss'],
})
export class AddUserDialogComponent implements OnInit {
  users: User[] = [];
  selectedUsers: User[] = [];
  currentSelectedUserControl = new FormControl<User | null>(null);
  addUserForm = this.fb.group({
    userIds: [[], Validators.required],
  });
  selectedTeam?: Team;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { teamId: string; createdBy: string }
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

  private loadAllUsers(): void {
    this.userService.getUsersForTeam(this.data.teamId).subscribe(
      (users) => {
        console.log('Loaded users:', users);
        // Filter out the user who created the team from the list
        this.users = users.filter((user) => user._id !== this.data.createdBy);
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
    // Check if the control value is not null before assigning
    if (this.currentSelectedUserControl.value) {
      const selectedUser: User = this.currentSelectedUserControl.value;

      // Check if the user is already in the selectedUsers array
      if (!this.selectedUsers.some((u) => u._id === selectedUser._id)) {
        this.selectedUsers.push(selectedUser); // Add the user
        // Filter out the added user from the users array
        this.users = this.users.filter((u) => u._id !== selectedUser._id);
        // Reset the control to allow a new selection
        this.currentSelectedUserControl.reset();
      } else {
        // User already in the selectedUsers array, show an error
        this.snackBar.open('User already added or does not exist', 'Close', {
          duration: 3000,
        });
      }
    } else {
      // If currentSelectedUserControl.value is null, handle it appropriately
      // For example, show a message or do nothing
      this.snackBar.open('Please select a user to add', 'Close', {
        duration: 3000,
      });
    }
  }

  // Adds selected members to the team
  addMemberToTeam(): void {
    if (this.selectedUsers.length === 0) {
      this.snackBar.open('Please select at least one user', 'Close', {
        duration: 3000,
      });
      return;
    }
    this.dialogRef.close(this.selectedUsers);
  }
}
