import { Component, Inject } from '@angular/core';
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
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.teamId = data.teamId;
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsersForTeam().subscribe((users) => {
      this.users = users;
    });
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
  }

  addUser(): void {
    console.log('Adding user with ID:', this.currentSelectedUserId); // <-- Add this
    const userToAdd = this.users.find(
      (user) => user._id === this.currentSelectedUserId
    );
    if (userToAdd) {
      this.selectedUsers.push(userToAdd);
      console.log('User added:', userToAdd); // <-- Add this
      this.currentSelectedUserId = undefined;
    }
  }
}
