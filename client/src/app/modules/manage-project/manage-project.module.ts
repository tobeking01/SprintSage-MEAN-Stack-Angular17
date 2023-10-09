import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageProjectComponent } from './manage-project.component';
import { RouterModule, Routes } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { ModulesModule } from '../modules.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectDetailsModule } from './project-details/project-details.module';

// routes
const routes: Routes = [
  {
    path: '',
    component: ManageProjectComponent,
    children: [
      {
        path: 'add-project',
        loadChildren: () =>
          import('./create-project/create-project.module').then(
            (m) => m.AddProjectModule
          ),
      },
      {
        path: 'project-details',
        loadChildren: () =>
          import('./project-details/project-details.module').then(
            (m) => m.ProjectDetailsModule
          ),
      },
    ],
  },
];

@NgModule({
  declarations: [ManageProjectComponent],
  exports: [
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule,
    MatListModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule,
    MatListModule,
    ModulesModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    ProjectDetailsModule,
  ],
})
export class ManageProjectModule {}
