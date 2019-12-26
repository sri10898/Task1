import { NgModule } from '@angular/core';
import { TableModule } from 'ngx-easy-table';
import { BsDatepickerModule, DatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from './../shared/shared.module';
import { VideoSettingsComponent } from './video-settings.component';
import { VideoSettingsRoutes } from './video-settings.routing';
import { ViewSettingsComponent } from './view-settings/view-settings.component';
import { UpdateSettingsComponent } from './update-settings/update-settings.component';

import { DataTableModule } from 'angular-6-datatable';

@NgModule({
  imports: [
    SharedModule,
    VideoSettingsRoutes,
    TableModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    DataTableModule
  ],
  declarations: [
    VideoSettingsComponent,
    ViewSettingsComponent,
    UpdateSettingsComponent
  ]
})
export class VideoSettingsModule { }
