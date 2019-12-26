import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { AppService } from './services/app.service';
import { RestService } from './services/rest.service';
import { SessionService } from './services/session.service';
import { SocketService } from './services/socket.service';
import { TollScreenService } from './services/toll-screen.service';
import { LoggerService } from './services/logger.service';
const services = [AppService, RestService, AuthService, SessionService, SocketService, TollScreenService, LoggerService];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [],
  providers: [
    ...services,
    AuthGuard
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
