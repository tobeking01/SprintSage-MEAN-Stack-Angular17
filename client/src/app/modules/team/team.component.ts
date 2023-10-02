import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Project, ProjectService } from '../../services/project.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/services/model/user.model';
@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  addTeamMemberForm!: FormGroup;
  projects: Project[] = []; // Assuming Project is your project model
  users: User[] = []; // Assuming User is your user model

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService, // Import team service to handle team-related logic
    private dialogRef: MatDialogRef<TeamComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
    this.loadUsers(); // Adjusted method name to loadUsers
  }
  openDialog() {
    const dialogRef = this.dialog.open(TeamComponent);
  }
  initializeForm() {
    this.addTeamMemberForm = this.fb.group({
      project: ['', [Validators.required]],
      user: ['', [Validators.required]],
    });
  }

  loadProjects() {
    this.projectService
      .getAllProjects()
      .subscribe((projects) => (this.projects = projects));
  }

  loadUsers() {
    this.userService
      .getAllUsers()
      .subscribe((users: User[]) => (this.users = users));
  }

  onSubmit() {
    if (this.addTeamMemberForm.valid) {
      const { project, user } = this.addTeamMemberForm.value;
      this.teamService.addTeamMember(project, user).subscribe({
        next: (response: any) => {
          // handle successful addition of team member here
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          // handle error here
        },
      });
    }
  }
}
