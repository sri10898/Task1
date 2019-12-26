import { RestService } from './rest.service';
import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Services } from '@angular/core/src/view';
import { Observable } from 'rxjs/Observable';

describe('RestService', () => {
  let injector: TestBed;
  let service: RestService;
  let httpMock: HttpTestingController;
  let appService: AppService;
  let authService: AuthService;
  let restService: RestService;
  let toasterService: ToasterService;
  const page = {
    pageSize: 10
  }
  const sessionId = "36d5121e-2bf5-46e1-bc45-63b54ab475d2";
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToasterModule.forRoot()],
      providers: [RestService, AppService, AuthService, RestService]
    });
    injector = getTestBed();
    service = injector.get(RestService);
    restService = injector.get(RestService);
    toasterService = injector.get(ToasterService);
  });

  it('should be created', inject([RestService], (service: RestService) => {
    expect(service).toBeTruthy();
  }));
  it('should call get', () => {
    service.get('http://192.168.1.110:8885/lanes');
  });
  it('should call post', () => {
    service.post('http://192.168.1.110:8885/lanes', {});
  });

  it('should call put', () => {
    service.put('http://192.168.1.110/plaza/users/view-users', {});
  });

  it('should call delete', () => {
    service.delete('http://192.168.1.110/plaza/users/edit-users', {});
  });
  xit('should call handleError', () => {
    const err = {
      message: 'Error occured, Please try again'
    }
    service.handleError(err);
  });
  xit('should call handleError', () => {
    const err = {
      error: {
        error: 'Error occured, Please try again'
      }
    }
    service.handleError(err);
  });
  it('should call checkAndHandleError', () => {
    const responseObj = {
      message: 'Checking error',
      success: true,
      errorCode: 500
    }
    service.checkAndHandleError(responseObj);
  });
  it('should call checkAndHandleError', () => {
    const responseObj = {
      message: 'Checking error',
      success: false,
      errorCode: 33
    }
    service.checkAndHandleError(responseObj);
  });







});
