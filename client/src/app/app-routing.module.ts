import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DefaultComponent } from './layouts/default/default.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { FullwidthComponent } from './layouts/fullwidth/fullwidth.component';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { ManageProjectComponent } from './modules/manage-project/manage-project.component';
import { ManageTicketComponent } from './modules/manage-ticket/manage-ticket.component';
import { TeamComponent } from './modules/team/team.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { Routes } from '@angular/router';
import { ForgetPasswordComponent } from './modules/forget-password/forget-password.component';
import { ModeratorDashboardComponent } from './modules/moderator-dashboard/moderator-dashboard.component';
import { RoleGuard } from './services/role.guard';
import { AdminDashboardComponent } from './modules/admin-dashboard/admin-dashboard.component';
import { ResetComponent } from './modules/reset/reset.component';
import { NotFoundComponent } from './modules/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DefaultComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'manage-project',
        loadChildren: () =>
          import('./modules/manage-project/manage-project.module').then(
            (m) => m.ManageProjectModule
          ),
        // component: ManageProjectComponent,
      },
      {
        path: 'manage-ticket',
        component: ManageTicketComponent,
      },
      {
        path: 'team',
        component: TeamComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'moderator-dashboard',
        component: ModeratorDashboardComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'Moderator' },
      },
      {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: 'Admin' },
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
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // redirect to `first-component`
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  imports: [RouterModule.forRoot(routes)],

  exports: [RouterModule],
})
export class AppRoutingModule {}
