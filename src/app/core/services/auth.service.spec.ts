/* tslint:disable:no-unused-variable */



import { TestBed, async, inject, getTestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AppService } from './app.service';
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

describe('Service: Auth', () => {
  let injector: TestBed;
  let service: AuthService;
  let authService: AppService;
  let router: Router;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule,
        HttpClientTestingModule,
        RouterTestingModule],
      providers: [AuthService, AppService]
    });
    injector = getTestBed();
    service = injector.get(AuthService);
  });

  it('should ...', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should call getIsAuthorized', () => {
    service.getIsAuthorized();
  });

  it('should call setSessionId', () => {
    const sessionId = "2fbd1467-7389-4cd7-bbca-c67afbf0f58c";
    service.setSessionId(sessionId);
  });

  it('should call getSessionId', () => {
    service.getSessionId();
  });
  it('should call logout', () => {
    service.logout();
  });

  it('should call setExemptSnap', () => {
    const data = {
      abc: 'abc'
    }
    service.setExemptSnap(data);
  });

  it('should call getExemptSnap', () => {
    service.getExemptSnap();
  });

  it('should call setUserData', () => {
    const data = {
      abc: 'abc'
    }
    service.setUserData(data);
  });

  it('should call updateStatus', () => {
    const status = {
      status: false,
      data: {
        abc: 'abc'
      }
    }
    service.updateAuthStatus(status);
  });

});







