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
} from 'src/app/services/model/team.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ResponseData } from 'src/app/services/model/user.model';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.component.html',
  styleUrls: ['./create-team.component.scss'],
})
export class CreateTeamComponent implements OnInit {
  addTeamMemberForm!: FormGroup;
  isExistingTeamSelected = false;
  users: User[] = [];
  teams: Team[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private teamService: TeamService,
    @Optional() private dialogRef: MatDialogRef<CreateTeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Team
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
    this.loadTeams();
  }

  initializeForm() {
    this.addTeamMemberForm = this.fb.group({
      teamName: ['', Validators.required],
      teamMembers: this.fb.array([], Validators.minLength(1)),
    });
    console.log(this.addTeamMemberForm);
  }

  get teamMembersFormArray(): FormArray {
    return this.addTeamMemberForm.get('teamMembers') as FormArray;
  }

  get teamMembersControls(): FormControl[] {
    return this.teamMembersFormArray.controls as FormControl[];
  }

  addUser() {
    this.teamMembersFormArray.push(new FormControl('', Validators.required));
  }

  removeUser(index: number) {
    this.teamMembersFormArray.removeAt(index);
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe(
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

  loadUsers() {
    console.log('Fetching users...');
    this.userService.getAllUsers().subscribe(
      (response: ResponseData) => {
        this.users = response.data.users;
        console.log('Users fetched:', this.users);
      },
      (error: HttpErrorResponse) => {
        console.error('Error:', error);
      }
    );
  }

  onSubmit() {
    if (this.addTeamMemberForm.valid) {
      const teamData = {
        teamName: this.addTeamMemberForm.value.teamName,
        teamMembers: [].concat(...this.addTeamMemberForm.value.teamMembers), // Flatten the array
      };

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
