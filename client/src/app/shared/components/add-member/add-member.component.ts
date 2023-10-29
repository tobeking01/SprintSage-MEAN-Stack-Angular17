import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/services/model/user.model';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, forkJoin, of } from 'rxjs';

interface AddUserResponseError {
  success: boolean;
  user: User;
}

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss'],
})
export class AddMemberComponent {
  users: User[] = [];
  selectedUsers: User[] = [];
  currentSelectedUserId?: string;
  teamId?: string;
  form: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private teamService: TeamService,
    public dialogRef: MatDialogRef<AddMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      currentSelectedUserId: [''],
    });
    this.teamId = data.teamId;
    console.log('Team ID:', this.teamId);

    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsersForTeam().subscribe((users) => {
      this.users = users;
    });
  }
  get isAddButtonDisabled(): boolean {
    const disabled = this.selectedUsers.length === 0 || !this.teamId;
    console.log('Is Button Disabled:', disabled);
    return disabled;
  }
  get currentSelectedUserControl(): FormControl {
    return this.form.get('currentSelectedUserId') as FormControl;
  }

  addMemberToTeam(): void {
    if (!this.teamId || this.selectedUsers.length === 0) {
      return;
    }

    this.isLoading = true;

    const addRequests = this.selectedUsers.map((user) =>
      this.teamService.addUserToTeam(this.teamId!, user._id).pipe(
        catchError((error) => {
          console.error(
            `Error adding ${user.firstName} ${user.lastName}:`,
            error
          );
          this.snackBar.open(
            `Failed to add ${user.firstName} ${user.lastName}. Please try again.`,
            'Close',
            { duration: 3000 }
          );
          return of({ success: false, user });
        })
      )
    );

    forkJoin(addRequests).subscribe((results) => {
      this.isLoading = false;

      const failedAdds = results.filter(this.isAddUserResponseError);
      if (failedAdds.length > 0) {
        const failedNames = failedAdds
          .map((u) => `${u.user.firstName} ${u.user.lastName}`)
          .join(', ');
        this.snackBar.open(
          `Could not add the following members: ${failedNames}`,
          'Close',
          { duration: 5000 }
        );
      }

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

  isAddUserResponseError(response: any): response is AddUserResponseError {
    return response && !response.success && response.user !== undefined;
  }

  addUserToSelection(): void {
    const selectedUserId = this.currentSelectedUserControl.value;
    const userToAdd = this.users.find((user) => user._id === selectedUserId);

    if (userToAdd && !this.selectedUsers.includes(userToAdd)) {
      this.selectedUsers.push(userToAdd);
      this.currentSelectedUserControl.reset(); // Reset after adding
      this.cdr.markForCheck(); // Update the view
      this.snackBar.open(
        `${userToAdd.firstName} ${userToAdd.lastName} added to selection`,
        'Close',
        { duration: 2000 }
      );
    }
  }
  // Remove user
  removeUserFromSelection(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
      this.cdr.markForCheck();
      this.snackBar.open(
        `${user.firstName} ${user.lastName} removed from selection`,
        'Close',
        { duration: 2000 }
      );
    }
  }
}
