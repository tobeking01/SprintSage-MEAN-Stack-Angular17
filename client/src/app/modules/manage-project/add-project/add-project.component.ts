import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/services/model/user.model';
import { TeamService } from 'src/app/services/team.service'; // Import TeamService if you have one
import { Team } from 'src/app/services/model/team.model';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent implements OnInit {
  projectForm!: FormGroup;
  users: User[] = [];
  teams: string[] = [];
  isExistingTeamSelected = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUsers();
    this.loadTeams();
    // log the form's validity status
    this.projectForm.valueChanges.subscribe((value) =>
      console.log('Form Value:', value)
    );

    this.projectForm.statusChanges.subscribe((status) => {
      console.log('Form Status: ', status);
      console.log('Form Errors: ', this.projectForm.errors);
      if (status === 'INVALID') {
        console.log(
          'Invalid Controls: ',
          this.findInvalidControlsRecursive(this.projectForm)
        );
      }
    });
  }

  initializeForm() {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required]],
      existingTeam: [''], // New field for existing team
      newTeamName: [''], // New field for a new team
      teamMembers: this.fb.array([this.createMember()]),
    });
  }

  get teamMembers(): FormArray {
    return this.projectForm.get('teamMembers') as FormArray;
  }
  loadTeams() {
    this.teamService.getAllTeams().subscribe(
      (response: any) => {
        console.log('Raw Response: ', response); // To check the raw response
        if (response.data && Array.isArray(response.data)) {
          this.teams = response.data.map((team: Team) => team.teamName);
          console.log('Mapped Teams: ', this.teams); // To check the mapped teams
        } else {
          console.error(
            'Data is not an array or is undefined: ',
            response.data
          );
        }
      },
      (error) => console.error('Error loading teams', error)
    );
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((response: any) => {
      this.users = response.data.users;
    });
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
    const selectedTeam = this.projectForm.get('existingTeam')?.value;
    this.isExistingTeamSelected = !!selectedTeam;
    if (this.isExistingTeamSelected) {
      this.projectForm.get('newTeamName')?.reset();
    }
  }

  onNewTeamNameEntered() {
    const newTeamName = this.projectForm.get('newTeamName')?.value;
    if (newTeamName) {
      this.projectForm.get('existingTeam')?.reset();
    }
  }
  onSubmit() {
    if (this.projectForm.valid) {
      const { existingTeam, newTeamName, teamMembers, ...rest } =
        this.projectForm.value;
      let teamId; // to hold the id of the team, whether existing or new

      // if existingTeam is selected, assign its id to teamId
      if (existingTeam) {
        teamId = existingTeam._id;
        this.createProject({ ...rest, teams: [teamId] });
      }

      // If newTeamName is entered, create a new team first
      if (newTeamName) {
        // Assume that teamMembers is an array of user ids.
        const members = teamMembers.map((member: Team) => member.teamName); // or whatever the id field is called in your form control
        const payload = { teamName: newTeamName, teamMembers: members };
        this.teamService.createTeam(payload).subscribe((newTeam) => {
          teamId = newTeam._id;
          this.createProject({ ...rest, teams: [teamId] });
        });
      }
    }
  }

  updateProject(projectId: string, projectData: any) {
    this.projectService.updateProjectById(projectId, projectData).subscribe({
      next: () => this.handleSuccess('Project details updated!'),
      error: (err: any) =>
        this.handleError(err, 'Error while updating the project!'),
    });
  }

  createProject(projectData: any) {
    this.projectService.createProject(projectData).subscribe({
      next: () => this.handleSuccess('Project added successfully!'),
      error: (err: any) => this.handleError(err, 'An unknown error occurred!'),
    });
  }

  handleSuccess(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.dialogRef.close(true);
  }

  handleError(err: HttpErrorResponse, defaultMessage: string) {
    console.error(err);
    let errorMessage = defaultMessage;
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else if (err.status && err.error) {
      errorMessage = `Backend returned code ${err.status}, body was: ${err.error}`;
    }
    this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
  }

  findInvalidControlsRecursive(
    formToInvestigate: FormGroup | FormArray
  ): string[] {
    let invalidControls: string[] = [];
    let recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (control instanceof FormControl) {
          if (control.invalid) invalidControls.push(field);
        } else if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }
}
