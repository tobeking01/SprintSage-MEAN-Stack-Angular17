import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

export interface Project {
  _id?: string;
  projectName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

@Component({
  selector: 'app-list-project',
  templateUrl: './list-project.component.html',
  styleUrls: ['./list-project.component.scss'],
})
export class ListProjectComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  showAddProject = false;
  MyDataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  projectList!: Project[];
  displayedColumns: string[] = [
    'projectName',
    'description',
    'startDate',
    'endDate',
    'action',
  ];

  constructor(
    private router: Router,
    private service: ProjectService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.isLoading = true;
    this.service.getAllProjects().subscribe(
      (response: any) => {
        // Assuming the service returns an array of Projects
        console.log('API Response:', response);
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

  editProject(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate([`/edit-project/${id}`]);
      }
    });
  }

  deleteProject(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.deleteProjectById(id).subscribe(
          () => {
            this.getProjects();
          },
          (error) => {
            console.error('Error deleting project:', error);
            // Optionally, display an error message to the user.
          }
        );
      }
    });
  }

  filterProject(searchstring: string) {
    this.MyDataSource.filter = searchstring.trim().toLowerCase();
  }

  goToAddProject() {
    this.router.navigate(['/dashboard/manage-project/add-project']);
  }
}
