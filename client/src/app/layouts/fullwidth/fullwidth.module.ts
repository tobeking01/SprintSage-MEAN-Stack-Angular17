import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullwidthComponent } from './fullwidth.component';
import { HomeComponent } from '../../modules/home/home.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [FullwidthComponent, HomeComponent],
  imports: [CommonModule, RouterModule, FlexLayoutModule, SharedModule],
})
export class FullwidthModule {}
