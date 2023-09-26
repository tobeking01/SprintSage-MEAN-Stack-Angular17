import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSidenavModule } from '@angular/material/sidenav';

import { DefaultComponent } from './default.component';
import { SharedModule } from '../../shared/shared.module';
import { ModulesModule } from 'src/app/modules/modules.module';
@NgModule({
  declarations: [DefaultComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    SharedModule,
    MatSidenavModule,
    ModulesModule,
  ],
})
export class DefaultModule {}
