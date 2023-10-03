import { Component, OnInit, Optional, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Project, ProjectService } from '../../services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';
import { Team } from 'src/app/services/model/team.model';
import { FormArray, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  addTeamMemberForm!: FormGroup;
  isExistingTeamSelected = false;
  projects: Project[] = [];
  users: User[] = [];
  teams: Team[] = [];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    @Optional() private dialogRef: MatDialogRef<TeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
    this.loadUsers();
    this.loadTeams();
  }

  // team.component.ts
  initializeForm() {
    this.addTeamMemberForm = this.fb.group({
      teamName: ['', Validators.required],
      existingTeam: [''],
      newTeamName: [{ value: '', disabled: this.isExistingTeamSelected }],
      projects: [[]], // Optional and can be an array
      users: this.fb.array([]),
    });
  }

  onTeamSelectionChange(event: any) {
    this.isExistingTeamSelected = !!event.value;
    if (this.isExistingTeamSelected) {
      this.addTeamMemberForm.get('newTeamName')?.disable();
    } else {
      this.addTeamMemberForm.get('newTeamName')?.enable();
    }
  }

  getUsersControl(): FormControl[] {
    return (this.addTeamMemberForm.get('users') as FormArray)
      .controls as FormControl[];
  }

  addUser() {
    (this.addTeamMemberForm.get('users') as FormArray).push(
      this.fb.control('', Validators.required)
    );
  }

  removeUser(index: number) {
    (this.addTeamMemberForm.get('users') as FormArray).removeAt(index);
  }
  loadTeams() {
    this.teamService.getAllTeams().subscribe(
      (teams: Team[]) => {
        this.teams = teams; // this should always be an array
      },
      (error: HttpErrorResponse) => {
        console.error('Error:', error); // Handle the error properly
        this.teams = []; // assign an empty array in case of an error
      }
    );
  }

  loadProjects() {
    this.projectService.getAllProjects().subscribe((projects) => {
      console.log(projects); // Log the API response to verify
      this.projects = projects;
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (response: { users: User[] }) => {
        this.users = response.users;
      },
      (error: any) => {
        console.error('Error:', error);
      }
    );
  }
  onSubmit() {
    if (this.addTeamMemberForm.valid) {
      const { teamName, teamMembers } = this.addTeamMemberForm.value;
      this.teamService.createTeam({ teamName, teamMembers }).subscribe({
        next: (response: any) => {
          if (this.dialogRef) this.dialogRef.close(true); // check if dialogRef exists
        },
        error: (error: any) => {
          console.error(error);
        },
      });
    }
  }
}
