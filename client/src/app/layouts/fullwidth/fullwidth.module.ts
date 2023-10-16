import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullWidthComponent } from './fullWidth.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../../shared/shared.module';
import { ModulesModule } from 'src/app/modules/modules.module';

@NgModule({
  declarations: [FullWidthComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    SharedModule,
    ModulesModule,
  ],
})
export class FullWidthModule {}
