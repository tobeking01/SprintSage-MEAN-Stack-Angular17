import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { FullWidthComponent } from './layouts/fullWidth/fullwidth.component';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { TicketDetailsComponent } from './modules/ticket-details/ticket-details.component';
import { CreateTeamComponent } from './modules/team-details/create-team/create-team.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { ForgetPasswordComponent } from './modules/forget-password/forget-password.component';
import { ProfessorDashboardComponent } from './modules/professor-dashboard/professor-dashboard.component';
import { RoleAndUserIdGuard } from './services/role.guard';
import { AdminDashboardComponent } from './modules/admin-dashboard/admin-dashboard.component';
import { ResetComponent } from './modules/reset/reset.component';
import { NotFoundComponent } from './modules/not-found/not-found.component';
import { ManageTeamComponent } from './modules/team-details/manage-team.component';
import { StudentDashboardComponent } from './modules/student-dashboard/student-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      {
        path: 'student-dashboard/:id',
        component: StudentDashboardComponent,
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Student', 'Professor', 'Admin'] },
      },
      {
        path: 'manage-project',
        loadChildren: () =>
          import('./modules/manage-project/manage-project.module').then(
            (m) => m.ManageProjectModule
          ),
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Student', 'Professor', 'Admin'] },
      },
      {
        path: 'project-details/:id',
        loadChildren: () =>
          import(
            './modules/manage-project/project-details/project-details.module'
          ).then((m) => m.ProjectDetailsModule),
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Student', 'Professor', 'Admin'] },
      },
      {
        path: 'ticket-details/:id',
        component: TicketDetailsComponent,
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Student', 'Professor', 'Admin'] },
      },
      {
        path: 'create-team',
        component: CreateTeamComponent,
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Student', 'Professor', 'Admin'] },
      },
      {
        path: 'manage-teams',
        component: ManageTeamComponent,
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Student', 'Professor', 'Admin'] },
      },
      {
        path: 'profile/:id',
        component: ProfileComponent,
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Student', 'Professor', 'Admin'] },
      },
      {
        path: 'professor-dashboard/:id',
        component: ProfessorDashboardComponent,
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Professor', 'Admin'] },
      },
      {
        path: 'admin-dashboard/:id',
        component: AdminDashboardComponent,
        canActivate: [RoleAndUserIdGuard],
        data: { expectedRole: ['Admin'] },
      },
    ],
  },
  {
    path: '',
    component: FullWidthComponent,
    children: [
      {
        path: 'home',
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
      { path: '404', component: NotFoundComponent },
      { path: '**', redirectTo: '/404' }, // Wildcard route for a 404 page
    ],
  },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { enableTracing: true })], // for debugging
  imports: [RouterModule.forRoot(routes)],

  exports: [RouterModule],
})
export class AppRoutingModule {}
