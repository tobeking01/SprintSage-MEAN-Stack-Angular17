import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { FullwidthComponent } from './layouts/fullwidth/fullwidth.component';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { TicketDetailsComponent } from './modules/ticket-details/ticket-details.component';
import { CreateTeamComponent } from './modules/team-details/create-team/create-team.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { ForgetPasswordComponent } from './modules/forget-password/forget-password.component';
import { ProfessorDashboardComponent } from './modules/professor-dashboard/professor-dashboard.component';
import { RoleGuard } from './services/role.guard';
import { AdminDashboardComponent } from './modules/admin-dashboard/admin-dashboard.component';
import { ResetComponent } from './modules/reset/reset.component';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { TeamDetailsComponent } from './modules/team-details/team-details.component';
import { StudentDashboardComponent } from './modules/student-dashboard/student-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      {
        path: 'student-dashboard', // This empty path represents the default child route
        component: StudentDashboardComponent,
      },
      {
        path: 'manage-project',
        loadChildren: () =>
          import('./modules/manage-project/manage-project.module').then(
            (m) => m.ManageProjectModule
          ),
      },
      {
        path: 'project-details/:projectId',
        loadChildren: () =>
          import(
            './modules/manage-project/project-details/project-details.module'
          ).then((m) => m.ProjectDetailsModule),
      },
      {
        path: 'ticket-details',
        component: TicketDetailsComponent,
      },
      {
        path: 'create-team',
        component: CreateTeamComponent,
      },
      {
        path: 'team-details',
        component: TeamDetailsComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'professor-dashboard',
        component: ProfessorDashboardComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['Professor', 'Admin'] },
      },
      {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['Admin'] },
      },
    ],
  },
  {
    path: '',
    component: FullwidthComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'forget-password',
        component: ForgetPasswordComponent,
      },
      {
        path: 'reset',
        component: ResetComponent,
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })], // for debugging
  // imports: [RouterModule.forRoot(routes)],

  exports: [RouterModule],
})
export class AppRoutingModule {}
