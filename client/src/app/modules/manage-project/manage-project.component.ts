import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProjectService } from 'src/app/services/project.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AddProjectComponent } from './add-project/add-project.component';

export interface Project {
  _id?: string;
  projectName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

@Component({
  selector: 'app-manage-project',
  templateUrl: './manage-project.component.html',
  styleUrls: ['./manage-project.component.scss'],
})
export class ManageProjectComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  MyDataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projectList!: Project[];
  displayedColumns: string[] = [
    'projectName',
    'description',
    'startDate',
    'endDate',
    'action',
  ];

  constructor(private service: ProjectService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getProjectList();
  }

  getProjectList() {
    this.service.getAllProjects().subscribe(
      (response: any) => {
        this.MyDataSource.data = response.data; // <-- Set the fetched projects as the data of MyDataSource.
        console.log('DataSource:', this.MyDataSource);
        this.MyDataSource.paginator = this.paginator;
        this.MyDataSource.sort = this.sort;
        this.isLoading = false;
      },
      (error: any) => {
        console.error(
          'Error:',
          error.error || error.message || 'An unknown error occurred'
        );
        this.error =
          error.error || 'An error occurred while fetching projects.';
        this.isLoading = false;
      }
    );
  }

  openEditProjectDialog(data: any) {
    const dialogRef = this.dialog.open(AddProjectComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getProjectList(); // Refresh the student list after editing
        }
      },
    });
  }

  openAddEditProjectDialog() {
    const dialogRef = this.dialog.open(AddProjectComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getProjectList(); // Refresh the student list after adding or updating
        }
      },
    });
  }

  deleteProject(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.deleteProjectById(id).subscribe(
          () => {
            this.getProjectList();
          },
          (error) => {
            console.error('Error deleting project:', error);
            // Optionally, display an error message to the user.
          }
        );
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.MyDataSource.filter = filterValue.trim().toLowerCase();
    if (this.MyDataSource.paginator) {
      this.MyDataSource.paginator.firstPage();
    }
  }
}
