import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset/reset.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ManageProjectComponent } from './manage-project/manage-project.component';
import { ManageTicketComponent } from './manage-ticket/manage-ticket.component';
import { TeamComponent } from './team/team.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ForgetPasswordComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ResetComponent,
    ManageProjectComponent,
    ManageTicketComponent,
    TeamComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RouterModule,
  ],
  exports: [
    DashboardComponent,
    ForgetPasswordComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ResetComponent,
    ManageProjectComponent,
    ManageTicketComponent,
    TeamComponent,
    ProfileComponent,
  ],
})
export class ModulesModule {}
