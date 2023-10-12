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
  Team,
  SingleTeamResponseData,
  MultipleTeamsResponseData,
  TeamPopulated,
} from 'src/app/services/model/team.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ResponseData } from 'src/app/services/model/user.model';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss'],
})
export class CreateTeamComponent implements OnInit {
  createTeamMemberForm!: FormGroup;
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

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
    this.loadTeams();
  }
  logFormValue() {
    console.log(this.createTeamMemberForm.value);
  }

  // Initializes the form controls
  initializeForm() {
    this.createTeamMemberForm = this.fb.group({
      teamName: ['', Validators.required],
      teamMembers: this.fb.array([new FormControl(null, Validators.required)]),
    });

    // Log changes in the entire form value
    this.createTeamMemberForm.valueChanges.subscribe((value) => {
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
    return this.createTeamMemberForm.get('teamMembers') as FormArray;
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

  // API call to load all teams
  loadTeams(): void {
    this.teamService.getTeamsByUserId().subscribe(
      (response: MultipleTeamsResponseData) => {
        if (Array.isArray(response.data)) {
          this.teams = response.data;
        } else {
          this.teams = [response.data]; // Convert the single team into an array
        }
        console.log('Teams fetched:', this.teams);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching teams:', error);
        this.teams = [];
      }
    );
  }
  // API call to load all users
  loadUsers() {
    console.log('Fetching users...');
    this.userService.getLoggedInUserDetails().subscribe(
      (response: ResponseData) => {
        // Access the first element from the nested array.
        this.users = response.data[0];
        console.log('Users fetched:', this.users);
      },
      (error: HttpErrorResponse) => {
        console.error('Error:', error);
      }
    );
  }
  // Handles form submission
  onSubmit() {
    if (this.createTeamMemberForm.valid) {
      const teamData = {
        teamName: this.createTeamMemberForm.value.teamName,
        teamMembers: this.createTeamMemberForm.value.teamMembers,
      };
      console.log(this.createTeamMemberForm.value);

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
