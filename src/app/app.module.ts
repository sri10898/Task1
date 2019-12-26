import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { StompRService } from '@stomp/ng2-stompjs';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { NgbModal, NgbModule, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from './core/core.module';
import { AppService } from './core/services/app.service';
import { RestService } from './core/services/rest.service';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { MatDialogModule } from '@angular/material/dialog';
// import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AppRoutes } from './app.routing';
import { environment } from '../environments/environment.prod';
import { LoginComponent } from './login/login.component';
// import { LogoutComponent } from './logout/logout.component';
import { MatRadioModule} from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { trigger, state, style, animate, transition} from '@angular/animations';
import { WebcamModule} from 'ngx-webcam';
import { HttpClientModule } from '@angular/common/http';
import { Component, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {
  MatInputModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule,
} from '@angular/material';
// import { TollDemoComponent } from './toll-demo/toll-demo.component';
import { TollScreenComponent } from './toll-screen/toll-screen.component';
import { TollExemptsComponent} from './toll-screen/toll-screen.component';
import { BarcodeScannerComponent} from './toll-screen/toll-screen.component';
import { LogoutComponent} from './toll-screen/toll-screen.component';
import { FleetTxnComponent} from './toll-screen/toll-screen.component';
import { TowedTxnComponent} from './toll-screen/toll-screen.component';
import { SCInfoComponent} from './toll-screen/toll-screen.component';
import { ShiftEndsAlertComponent} from './toll-screen/toll-screen.component';
import { FreeTxnsComponent} from './toll-screen/toll-screen.component';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ToasterModule, ToasterService, ToasterConfig} from 'angular2-toaster';
export function loadConfig(appService: AppService, restService: RestService) {
  return () => restService
    .get(environment.configUrl)
    .toPromise()
    .then(config => appService.setConfig(config));
}
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    SnotifyModule,
    NgbModule,
    Ng4LoadingSpinnerModule.forRoot(),
    ToasterModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSelectModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    WebcamModule,
    HttpClientModule,
    AppRoutes
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    LogoutComponent,
    TollExemptsComponent,
    TollScreenComponent,
    LogoutComponent,
    ShiftEndsAlertComponent,
    FleetTxnComponent,
    TowedTxnComponent,
    FreeTxnsComponent,
    PageNotFoundComponent,
    BarcodeScannerComponent,
    SCInfoComponent  ],
  entryComponents: [
    TollExemptsComponent,
    LogoutComponent,
    ShiftEndsAlertComponent,
    FleetTxnComponent,
    TowedTxnComponent,
    FreeTxnsComponent,
    BarcodeScannerComponent,
    SCInfoComponent
   ],
  providers: [ToasterService,
    NgbActiveModal,
    StompRService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      multi: true,
      deps: [ AppService, RestService ]
    },
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults},
    SnotifyService,
    NgbModal  ],
  bootstrap: [AppComponent]
})
export class AppModule { }




