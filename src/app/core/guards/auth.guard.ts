import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { AuthService } from './../services/auth.service';
import { SessionService } from './../services/session.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Injectable()
export class AuthGuard implements CanActivate {
  isAuthorized: Boolean = false;
  constructor(
    private dialogRef: MatDialog,
    private appService: AppService,
    private authService: AuthService,
    private sessionService: SessionService,
    public router: Router,
    public toasterService: ToasterService
  ) {
    this.toasterService = toasterService;
  }
  public config: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 3500,
      positionClass: 'toast-bottom-right',
      animation: 'fade',
      preventDuplicates: true
    });
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const isAuthorized = this.authService.getIsAuthorized();
    if (isAuthorized) {

      return this.sessionService.isValidSession().toPromise().then((response) => {
        if (!response.success) {
          localStorage.removeItem('hb.sessionId');
          localStorage.removeItem('lane.userInfo');
          this.toasterService.pop('error', '', response.description);
          this.router.navigate(['/login']);
          return Promise.resolve(false);
        }
        return true;
      }).catch(err => {
        this.toasterService.pop('error', '', err.description);
        this.toasterService.pop('error', '', err.message);
        localStorage.removeItem('hb.sessionId');
        localStorage.removeItem('lane.userInfo');
        this.router.navigate(['/login']);
        return Promise.resolve(false);
      });
    } else {

      this.toasterService.pop('success', '', 'Login Successful');
      this.router.navigate(['/login']);
      return Promise.reject(false);
    }

    this.dialogRef.closeAll();
  }
}
