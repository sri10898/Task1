import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import {LoginComponent} from './login/login.component';
import { TollScreenComponent } from './toll-screen/toll-screen.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  { path: 'toll-screen', component: TollScreenComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent},
  { path: '**', component: PageNotFoundComponent }
];
export const AppRoutes = RouterModule.forRoot(routes);
