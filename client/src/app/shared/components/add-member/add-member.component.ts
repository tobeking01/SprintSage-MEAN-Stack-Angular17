import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Team } from 'src/app/services/model/team.model';
import { User } from 'src/app/services/model/user.model';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss'],
})
export class AddMemberComponent {
  users: User[] = [];
  teams: Team[] = [];
  selectedUsers: User[] = [];
  currentSelectedUserId?: string; // <- added this
  teamId?: string;

  constructor(
    private userService: UserService,
    private teamService: TeamService,
    public dialogRef: MatDialogRef<AddMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef // <-- Inject this
  ) {
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

  addMemberToTeam(): void {
    if (!this.teamId || this.selectedUsers.length === 0) return;

    // Loop through the selected users and add them
    for (let user of this.selectedUsers) {
      this.teamService
        .addUserToTeam(this.teamId, user._id)
        .subscribe((response) => {
          console.log('Member added successfully:', response);
        });
    }

    this.dialogRef.close(true);
  }

  removeUserFromSelection(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    }
    this.cdr.markForCheck(); // add this line
  }
  // This method is triggered when a user is selected from the dropdown
  selectUser(): void {
    const userToAdd = this.users.find(
      (user) => user._id === this.currentSelectedUserId
    );
    if (userToAdd && !this.selectedUsers.includes(userToAdd)) {
      this.selectedUsers.push(userToAdd);
      this.currentSelectedUserId = undefined; // Reset the dropdown
      this.cdr.markForCheck();
      console.log('Selected Users Count:', this.selectedUsers.length);
    }
  }
  // Use this method when you want to add more users to the selectedUsers array
  addMoreUsers(): void {
    const userToAdd = this.users.find(
      (user) => user._id === this.currentSelectedUserId
    );
    if (userToAdd && !this.selectedUsers.includes(userToAdd)) {
      // Ensure the user isn't already selected
      this.selectedUsers.push(userToAdd);
      this.currentSelectedUserId = undefined; // Reset the select dropdown
      this.cdr.markForCheck();
      console.log('Selected Users Count:', this.selectedUsers.length);
    }
  }
}
