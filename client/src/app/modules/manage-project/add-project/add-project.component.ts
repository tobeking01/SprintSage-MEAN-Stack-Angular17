import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from 'src/app/services/team.service';

import { User } from 'src/app/services/model/user.model';
import { Team } from 'src/app/services/model/team.model';

// Interfaces for the expected HTTP responses
interface TeamResponse {
  data: Team[];
}

interface UserResponse {
  data: { users: User[] };
}

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent implements OnInit, OnDestroy {
  projectForm!: FormGroup;
  users: User[] = [];
  teams: Team[] = [];
  isExistingTeamSelected = false;
  private onDestroy$ = new Subject<void>(); // For handling unsubscription when the component is destroyed

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Replace 'any' with appropriate type or interface
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
    this.loadTeams();
  }

  initializeForm() {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      existingTeam: [''],
      newTeamName: [''],
      teamMembers: this.fb.array([this.createMember()]),
    });

    this.applyConditionalValidators();
  }

  // Method to apply conditional validators to avoid redundancy
  private applyConditionalValidators() {
    this.projectForm
      .get('existingTeam')!
      .valueChanges.pipe(takeUntil(this.onDestroy$))
      .subscribe((value) => {
        this.toggleValidators('newTeamName', 'existingTeam');
      });

    this.projectForm
      .get('newTeamName')!
      .valueChanges.pipe(takeUntil(this.onDestroy$))
      .subscribe((value) => {
        this.toggleValidators('existingTeam', 'newTeamName');
      });
  }

  // Helper method to toggle validators on form controls
  private toggleValidators(controlToClear: string, controlToSet: string) {
    this.projectForm.get(controlToClear)!.clearValidators();
    this.projectForm.get(controlToClear)!.updateValueAndValidity();
    this.projectForm.get(controlToSet)!.setValidators([Validators.required]);
    this.projectForm.get(controlToSet)!.updateValueAndValidity();
  }

  get teamMembers(): FormArray {
    return this.projectForm.get('teamMembers') as FormArray;
  }

  loadTeams() {
    this.teamService.getAllTeams().subscribe(
      (response: any) => {
        console.log('Received Teams:', response);
        if (response && response.data && Array.isArray(response.data)) {
          this.teams = response.data.map((team: Team) => team.teamName);
        } else {
          console.error('Invalid team data received:', response);
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error Loading Teams:', error);
      }
    );
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (response: { users: User[] }) => (this.users = response.users),
      (error) => console.error('Error loading users:', error)
    );
  }

  createMember(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
    });
  }

  addTeamMember() {
    this.teamMembers.push(this.createMember());
  }

  removeMember(index: number) {
    this.teamMembers.removeAt(index);
  }

  onTeamSelectionChange() {
    // Using Nullish Coalescing Operator to ensure boolean assignment.
    this.isExistingTeamSelected = !!this.projectForm.get('existingTeam')?.value;
    if (this.isExistingTeamSelected) {
      this.projectForm.get('newTeamName')?.reset();
    }
  }

  onNewTeamNameEntered() {
    if (this.projectForm.get('newTeamName')?.value) {
      this.projectForm.get('existingTeam')?.reset();
    }
  }

  onSubmit() {
    // Handle form submission logic here.
  }

  // Handle other component logic and methods here.

  ngOnDestroy(): void {
    // Cleaning up subscriptions.
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
