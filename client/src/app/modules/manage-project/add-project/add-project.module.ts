import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddProjectComponent } from './add-project.component';

const routes: Routes = [
  {
    path: '',
    component: AddProjectComponent,
  },
];

@NgModule({
  declarations: [AddProjectComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AddProjectModule {}
