import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { RestService } from './rest.service';
import { AuthGuard } from './../guards/auth.guard';

@Injectable()
export class SessionService {
  constructor(
    private appService: AppService,
    private authService: AuthService,
    private restService: RestService
  ) {  }

  isValidSession(): Observable<any> {
    const sessionId = this.authService.getSessionId();
    console.log('111111111111111111111111111111111111111111 '  + sessionId);
    return this.restService
      .post(this.appService.getConfigParam('HOST_NAME') + '/session/heart-beat', {
        sessionId });
  }

  loginAdmin(payload: any): Observable<any> {
    return this.restService.
    post(this.appService.getConfigParam('HOST_NAME') + '/session/login', payload);
  }
  logout(): Observable<any> {
    return this.restService
      .post(this.appService.getConfigParam('HOST_NAME') + '/session/logout', {
        sessionId: this.authService.getSessionId()
      });
  }

}

