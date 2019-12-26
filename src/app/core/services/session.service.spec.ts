/* tslint:disable:no-unused-variable */
import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { RestService } from './rest.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Services } from '@angular/core/src/view';

describe('SessionService', () => {
  let injector: TestBed;
  let service: SessionService;
  let httpMock: HttpTestingController;
  let appService: AppService;
  let authService: AuthService;
  let restService: RestService;
  let toasterService: ToasterService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToasterModule.forRoot()],
      providers: [SessionService, AppService, AuthService, RestService]
    });
    injector = getTestBed();
    service = injector.get(SessionService);
    restService = injector.get(RestService);
  });
  it('should be created', inject([SessionService], (service: SessionService) => {
    expect(service).toBeTruthy();
  }));
  it('it should call isValidSession', () => {
    service.isValidSession();
  });

  it('it should call loginAdmin', () => {
    const payload = {
      username: "TCUSER1",
      plainTextPassword: "tcuser1"
    }
    service.loginAdmin(payload);
  });
  it('it should call logout', () => {
    service.logout();
  });


});
