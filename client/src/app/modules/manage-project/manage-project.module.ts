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

const routes: Routes = [
  {
    path: '',
    component: ManageProjectComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./list-project/list-project.module').then(
            (m) => m.ListProjectModule
          ),
      },
      {
        path: 'add-project',
        loadChildren: () =>
          import('./add-project/add-project.module').then(
            (m) => m.AddProjectModule
          ),
      },
      {
        path: 'edit-project/:id',
        loadChildren: () =>
          import('./edit-project/edit-project.module').then(
            (m) => m.EditProjectModule
          ),
      },
    ],
  },
];

@NgModule({
  declarations: [ManageProjectComponent],
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
    ReactiveFormsModule,
  ],
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
  ],
})
export class ManageProjectModule {}
