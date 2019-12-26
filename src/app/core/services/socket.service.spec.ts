import { SocketService } from './socket.service';
import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { RestService } from './rest.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Services } from '@angular/core/src/view';
import { StompRService, StompState } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { Subject } from 'rxjs/Subject';
import { LoggerService } from './logger.service';
import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';

export class stompMock {
  subscribe() {
    const messageObj = {
      body: 'hi'
    }
    return messageObj;
  }
  publish() {
    return;
  }
}
describe('SocketService', () => {
  let injector: TestBed;
  let service: SocketService;
  let httpMock: HttpTestingController;
  let appService: AppService;
  let stompService: StompRService;
  let authService: AuthService;
  let restService: RestService;
  let toasterService: ToasterService;
  let loggerService: LoggerService;
  let subject$: Subject<any> = new Subject();
  const page = {
    pageSize: 10
  }
  const message = {
    body: { "vehicleExitStatus": true },
    command: "MESSAGE",
    escapeHeaderValues: true,

    isBinaryBody: true,
    nack: function () {
    }
  }

  const WS_MESSAGE_TYPES: any = {
    DATA_ERROR: 'data-error',
    DATA_RECEIVED: 'data-received',
    SOCKET_CONNECTED: 'socket-connected'
  };
  const sessionId = "36d5121e-2bf5-46e1-bc45-63b54ab475d2";
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToasterModule.forRoot()],
      providers: [SocketService, AppService, AuthService, RestService, LoggerService, { provide: StompRService, useClass: stompMock }]
    });
    injector = getTestBed();
    service = injector.get(SocketService);
    restService = injector.get(RestService);
    appService = injector.get(AppService);
    stompService = injector.get(StompRService);
  });

  it('should be created', inject([SocketService], (service: SocketService) => {
    expect(service).toBeTruthy();
  }));
  it('should call initialize', () => {
    const customObj = {
      url: 'ws://192.168.1.110:8884/webSocketService/bhariSocketHandler',
      headers: {
        login: 'mylogin',
        passcode: 'mypasscode',
        'Auth-Token': 'token'
      },
      heartbeat_in: 5000,
      heartbeat_out: 5000,
      reconnect_delay: 5000,
      debug: true
    }
    stompService.config = customObj;
    const url = 'ws://192.168.1.110:8884/webSocketService/bhariSocketHandler';
    const debug = true;
    const urlSpy = spyOn(appService, 'getConfigParam').and.returnValue(url);
    const state = 2;
    service.initialize();
    expect(urlSpy).toHaveBeenCalled();
  });
  it('should call getIsSocketConnected', () => {
    service.getIsSocketConnected();
  });
  it('should call onConnected', () => {
    service.onConnected();
  });
  it('should call login', () => {
    service.login();
  });
  it('should call subscribeVehicleExit', () => {
    service.onConnected();
    // const vehicleExitStub: Observable<any> = {

    //   subscribe: function () {
    //     const messageObj = {
    //       body: 'vehicleExit'
    //     }
    //     return messageObj;
    //   }
    // }
    // service.vehicleExitSubscription = vehicleExitStub;
    // service.stompSubscriptions.push(of());
    // service.subscriptions.push(of({ body: "{'vehicleExitStatus':true}" }));
    // subject$.next({
    //   type: WS_MESSAGE_TYPES.DATA_ERROR,
    //   data: message.body
    // });
    // let spyStomp = spyOn(stompServi).and.returnValue(vehicleExitSub);
    // let spy = spyOn(vehicleExitSubscription,'subscribe')
    service.subscribeVehicleExit();
    //expect(spyStomp).toHaveBeenCalled();
  });

  it('should call subscribeViolation', () => {
    service.subject$.next({
      type: WS_MESSAGE_TYPES.DATA_ERROR,
      data: message.body
    });
    service.subscribeViolation();
  });

  it('should call getChannelId', () => {
    service.getChannelId();
  });

  it('should call getSubject', () => {
    service.getSubject();
  });

  it('should call disconnect', () => {
    stompService.disconnect();
  });
});
