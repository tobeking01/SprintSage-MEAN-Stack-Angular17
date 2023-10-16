import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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
  selectedUser?: string;
  teamId?: string;

  constructor(
    private userService: UserService,
    private teamService: TeamService,
    public dialogRef: MatDialogRef<AddMemberComponent>
  ) {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsersForTeam().subscribe((users) => {
      this.users = users;
    });
  }

  addMemberToTeam(teamId?: string): void {
    console.log(teamId);
    console.log(this.selectedUser);
    if (!teamId || !this.selectedUser) return;

    this.teamService
      .addUserToTeam(teamId, this.selectedUser)
      .subscribe((response) => {
        console.log('Member added successfully:', response);
        this.dialogRef.close(true);
      });
  }
}
