import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailsComponent } from './project-details.component';
import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ':projectId',
    component: ProjectDetailsComponent,
  },
];

@NgModule({
  declarations: [ProjectDetailsComponent],
  imports: [CommonModule],
})
export class ProjectDetailsModule {}
