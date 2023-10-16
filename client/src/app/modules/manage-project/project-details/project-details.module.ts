import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailsComponent } from './project-details.component';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { ModulesModule } from '../../modules.module';
const routes: Routes = [
  {
    path: '',
    component: ProjectDetailsComponent,
  },
];

@NgModule({
  declarations: [ProjectDetailsComponent],
  exports: [ProjectDetailsComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ModulesModule,
  ],
})
export class ProjectDetailsModule {}
