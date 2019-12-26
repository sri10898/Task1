import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { WS_MESSAGE_TYPES, SocketData } from './core/services/socket.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppService } from './core/services/app.service';
import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';
import { LoggerService } from './core/services/logger.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription, timer, pipe, interval } from 'rxjs';
import { Router } from '@angular/router';
import { SessionService } from './core/services/session.service';
import { TollScreenService } from './core/services/toll-screen.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private toasterService: ToasterService;
  socketSubscription: Subscription;
  errorSubscription: Subscription;
  loggedOut = null;
  smartCardInfo: any = {};
  socketRecievedInfo: any = {};
  title = 'TC-App';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private appService: AppService,
    private authService: AuthService,
    private socketService: SocketService,
    private logger: LoggerService,
    private dialogRef: MatDialog,
    private sessionService: SessionService,
    private tollscreenService: TollScreenService,
    toasterService: ToasterService,
    private location: Location
  ) {
    this.router.errorHandler = (error: any) => {
      this.router.navigate(['404']); // or redirect to default route
    };
    this.toasterService = toasterService;
  }
  public sessionConfig: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 3500,
      positionClass: 'toast-top-right',
      animation: 'fade',
      preventDuplicates: true
    });


  ngOnInit() {
    const source = interval(2000);
    this.errorSubscription = source.subscribe(val =>
      this.getSessionValidation()
    );

    this.sessionService.isValidSession()
      .subscribe((response) => {
        if (response.success) {
          this.socketService.initialize();
        }
      }, err => {
        console.log(err.message);
      });
    if (this.router.url === '/') {
      this.sessionService.isValidSession()
        .subscribe((response) => {
          if (response && response.success) {
            this.router.navigate(['toll-screen']);
          } else {
            this.router.navigate(['/login']);
            this.dialogRef.closeAll();
          }
        });

    }
    this.logger.setLogging(this.appService.getConfigParam('LOGS_ENABLED'));
    this.authService
      .authStatus$
      .subscribe(statusObj => {
        // console.log(statusObj);
        if (!statusObj.status) {
          this.loggedOut = statusObj.data;
        }
        const userObj = localStorage.getItem('lane.userInfo');
        if (userObj === null) {
          this.toasterService.clear();
        }

      });
  }

  getSessionValidation() {
    if (this.authService.getSessionId()) {
      this.sessionService.isValidSession().subscribe(res => {
        if (!res.success) {
          if (res.errorCode === 6) {
            console.log('session expired-', res.description);
            localStorage.clear();
            this.authService.logout();
            this.router.navigate(['/login']);
            this.dialogRef.closeAll();
            // this.toasterService.pop('error', '', 'Session Expired So You LoggedOut !!!');
          }



        }
      }, err => {
        localStorage.clear();
        this.authService.logout();
        this.router.navigate(['/login']);
        this.dialogRef.closeAll();
        this.toasterService.pop('error', '', 'Session Expired So You LoggedOut !!!');
      });
    }
  }



  ngOnDestroy() {
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    if (this.socketService) {
      this.socketService.disconnect();
    }
  }
}
