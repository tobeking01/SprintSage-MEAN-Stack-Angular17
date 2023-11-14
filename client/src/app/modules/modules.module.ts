import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { HomeComponent } from './home/home.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset/reset.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ManageTicketComponent } from './manage-ticket/manage-ticket.component';
import { CreateTeamComponent } from './manage-team/create-team/create-team.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfessorDashboardComponent } from './professor-dashboard/professor-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ManageTeamComponent } from './manage-team/manage-team.component';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { UpdateProfileComponent } from './profile/update-profile/update-profile.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TeamDetailsComponent } from './manage-team/team-details/team-details.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CreateTicketComponent } from './manage-ticket/create-ticket/create-ticket.component';
import { TicketDetailsComponent } from './manage-ticket/ticket-details/ticket-details.component';

@NgModule({
  declarations: [
    StudentDashboardComponent,
    ForgetPasswordComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ResetComponent,
    ManageTicketComponent,
    CreateTeamComponent,
    ProfileComponent,
    ProfessorDashboardComponent,
    AdminDashboardComponent,
    NotFoundComponent,
    ManageTeamComponent,
    UpdateProfileComponent,
    TeamDetailsComponent,
    CreateTicketComponent,
    TicketDetailsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    RouterModule,
    MatMenuModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatTooltipModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatPaginatorModule,
    MatProgressBarModule,
  ],
  exports: [
    StudentDashboardComponent,
    ForgetPasswordComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ResetComponent,
    ManageTicketComponent,
    CreateTeamComponent,
    ProfileComponent,
    ProfessorDashboardComponent,
    NotFoundComponent,
    AdminDashboardComponent,
    ManageTeamComponent,
    TicketDetailsComponent,
  ],
})
export class ModulesModule {}
