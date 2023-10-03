import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router'; // Imported Router
import { ProjectService } from 'src/app/services/project.service';
import { AddProjectComponent } from './add-project/add-project.component';
import { Project } from 'src/app/services/model/project.model';
import { Team } from 'src/app/services/model/team.model';
import { User } from 'src/app/services/model/user.model';
import { UserService } from 'src/app/services/user.service'; // Import UserService
import { TeamComponent } from '../team/team.component';

@Component({
  selector: 'app-manage-project',
  templateUrl: './manage-project.component.html',
  styleUrls: ['./manage-project.component.scss'],
})
export class ManageProjectComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  teamMembersDetails: any = {};
  MyDataSource: MatTableDataSource<Project> = new MatTableDataSource<Project>();

  constructor(
    private service: ProjectService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router // Injected Router
  ) {}

  ngOnInit(): void {
    this.getProjectList();
  }
  getProjectList() {
    this.isLoading = true;
    this.service.getAllProjects().subscribe(
      (response: any) => {
        this.MyDataSource.data = Array.isArray(response.data)
          ? (response.data as Project[])
          : ((response.data?.projects || []) as Project[]);

        // After fetching projects, load team members' details
        this.MyDataSource.data.forEach((project) => {
          project.teams?.forEach((team) => this.loadTeamMembersDetails(team));
        });

        console.log(this.MyDataSource.data);
        this.isLoading = false;
      },
      (error: any) => {
        this.error = 'An error occurred while fetching projects.';
        this.isLoading = false;
      }
    );
  }
  // In your component class
  openTeamDialog() {
    const dialogRef = this.dialog.open(TeamComponent);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
  loadTeamMembersDetails(team: Team) {
    team.teamMembers.forEach((memberId) => {
      this.userService.getUserById(memberId).subscribe(
        (user: User) => {
          this.teamMembersDetails[memberId] = user;
        },
        (error: any) => {
          if (error.status === 404) {
            console.error('User not found', error);
            this.teamMembersDetails[memberId] = { name: 'User not found' };
            this.error = `User with ID ${memberId} not found`;
          } else {
            console.error('Error fetching user details', error);
            this.error = 'Error fetching user details';
          }
        }
      );
    });
  }

  openAddEditProjectDialog() {
    const dialogRef = this.dialog.open(AddProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) this.getProjectList();
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.MyDataSource.filter = filterValue.trim().toLowerCase();
  }
  navigateToProjectDetail(projectId: string) {
    // Navigate to ProjectDetailComponent when a project is clicked
    this.router.navigate(['/project-details', projectId]);
  }
}
