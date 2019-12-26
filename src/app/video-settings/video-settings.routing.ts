import { RouterModule, Routes } from '@angular/router';
import { VideoSettingsComponent } from './video-settings.component';
import { ViewSettingsComponent } from './view-settings/view-settings.component';
import { UpdateSettingsComponent } from './update-settings/update-settings.component';
import { AuthGuard } from '../core/guards/auth.guard';
const routes: Routes = [
  { path: '', component: VideoSettingsComponent, children: [

  { path: 'view-settings', component: ViewSettingsComponent, canActivate: [AuthGuard]},
  { path: 'update-settings', component: UpdateSettingsComponent, canActivate: [AuthGuard] }
]}
];
export const VideoSettingsRoutes = RouterModule.forChild(routes);
