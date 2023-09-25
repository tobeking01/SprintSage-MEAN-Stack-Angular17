import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default.component';
import { DashboardComponent } from 'src/app/modules/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [DefaultComponent, DashboardComponent],
  imports: [CommonModule, RouterModule, FlexLayoutModule, SharedModule],
})
export class DefaultModule {}
