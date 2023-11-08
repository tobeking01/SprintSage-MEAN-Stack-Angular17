import { Component, OnInit, Optional, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';
import {
  SingleTeamResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss'],
})
export class CreateTeamComponent implements OnInit {
  createTeamForm!: FormGroup;
  isExistingTeamSelected = false;
  users: User[] = [];
  teams: TeamPopulated[] = [];
  selectedTeamId: string | null = null;
  selectedUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private teamService: TeamService,
    @Optional() private dialogRef: MatDialogRef<CreateTeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TeamPopulated
  ) {}

  private loadAllUsersForTeamCreation(createdBy: string): void {
    this.userService.getUsersForTeam(createdBy).subscribe(
      (users: User[]) => {
        this.users = users;
        console.log('All users fetched for team creation:', this.users);
      },
      (error: any) => {
        console.error('Error fetching users for team creation:', error);
      }
    );
  }

  ngOnInit(): void {
    this.initializeForm();

    // Fetch the current user's ID
    this.userService.getUserId().subscribe({
      next: (userId) => {
        // Once we have the user ID, load all users for team creation
        this.loadAllUsersForTeamCreation(userId);
      },
      error: (error) => {
        console.error('Error fetching the current user ID:', error);
        // Handle the error case here, such as showing a notification to the user
      },
    });
  }

  logFormValue() {
    console.log(this.createTeamForm.value);
  }

  // Initializes the form controls
  initializeForm() {
    this.createTeamForm = this.fb.group({
      teamName: ['', Validators.required],
      teamMembers: this.fb.array([new FormControl(null, Validators.required)]),
    });

    // Log changes in the entire form value
    this.createTeamForm.valueChanges.subscribe((value) => {
      console.log('Form Value:', value);
    });

    // Log changes in the teamMembers form array value
    this.teamMembersFormArray.valueChanges.subscribe((value) => {
      console.log('Team Members Array Value:', value);
    });
  }
  isAtLeastOneMemberSelected(): boolean {
    return this.teamMembersFormArray.value.some(
      (member: { [key: string]: any } | null | undefined) =>
        member !== null && member !== undefined
    );
  }

  // Adds a user to a selected team
  onAddMember() {
    if (this.selectedTeamId && this.selectedUserId) {
      this.onAddUserToTeam(this.selectedTeamId, this.selectedUserId);
    }
  }
  // Removes a user from a selected team
  onRemoveMember() {
    if (this.selectedTeamId && this.selectedUserId) {
      this.onRemoveUserFromTeam(this.selectedTeamId, this.selectedUserId);
    }
  }
  // API call to add a user to a team
  onAddUserToTeam(teamId: string, userId: string) {
    this.teamService.addUserToTeam(teamId, userId).subscribe((response) => {
      if (response.success) {
        console.log(response.message);
      } else {
        console.error('Error adding user to team:', response.message);
      }
    });
  }
  // API call to remove a user from a team

  onRemoveUserFromTeam(teamId: string, userId: string) {
    this.teamService
      .removeUserFromTeam(teamId, userId)
      .subscribe((response) => {
        if (response.success) {
          console.log(response.message);
        } else {
          console.error('Error removing user from team:', response.message);
        }
      });
  }

  // Returns the form array for team members
  get teamMembersFormArray(): FormArray {
    return this.createTeamForm.get('teamMembers') as FormArray;
  }

  // Returns the form controls for team members
  get teamMembersControls(): FormControl[] {
    return this.teamMembersFormArray.controls as FormControl[];
  }

  // Adds a new user control to the form array
  addUser() {
    this.teamMembersFormArray.push(this.fb.control(null, Validators.required));
  }

  // Removes a user control from the form array by index
  removeUser(index: number) {
    this.teamMembersFormArray.removeAt(index);
  }

  // Handles form submission
  onSubmit() {
    if (this.createTeamForm.valid) {
      const teamData = {
        teamName: this.createTeamForm.value.teamName,
        teamMembers: this.createTeamForm.value.teamMembers,
      };
      console.log(this.createTeamForm.value);

      this.teamService.createTeam(teamData).subscribe(
        (response: SingleTeamResponseData) => {
          console.log('Newly created team:', response.data);
          if (this.dialogRef) this.dialogRef.close(true);
        },
        (error: any) => {
          console.error(error);
        }
      );
    }
  }
}
