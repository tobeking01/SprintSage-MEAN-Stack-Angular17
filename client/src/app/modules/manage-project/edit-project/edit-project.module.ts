import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EditProjectComponent } from './edit-project.component';

const routes: Routes = [
  {
    path: '',
    component: EditProjectComponent,
  },
];

@NgModule({
  declarations: [EditProjectComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class EditProjectModule {}
