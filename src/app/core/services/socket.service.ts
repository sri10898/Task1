import { Injectable } from '@angular/core';
import { StompRService, StompState } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { Subject } from 'rxjs/Subject';

import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';
import { Observable } from 'rxjs/Observable';

export const WS_MESSAGE_TYPES: any = {
  DATA_ERROR: 'data-error',
  DATA_RECEIVED: 'data-received',
  SOCKET_CONNECTED: 'socket-connected'
};

export class SocketData {
  type: string;
  data: any;
}

@Injectable()
export class SocketService {
  stompSubscriptions = [];
  subscriptions = [];
  headers = {
    login: 'mylogin',
    passcode: 'mypasscode',
    'Auth-Token': 'token'
  };
  channelId = (new Date()).valueOf() + '';
  subject$: Subject<any> = new Subject();
  isConnected = false;
  smartCardInfo: any = {};
  vehicleExitSubscription: Observable<any>;
  constructor(
    private stompService: StompRService,
    private appService: AppService,
    private authService: AuthService,
    private logger: LoggerService
  ) { }

  initialize() {
    console.log('soket');
    this.stompService.config = {
      url: this.appService.getConfigParam('SOCKET_URL'),
      headers: this.headers,
      heartbeat_in: 5000,
      heartbeat_out: 5000,
      reconnect_delay: 5000,
      debug: this.appService.getConfigParam('SOCKET_LOGS')
    };
    this.subscriptions.push(
      this.stompService
        .state
        .subscribe((state: number) => {
          console.log(state, StompState.CONNECTED);
          console.log(`Stomp connection status: ${state} at ${Date.now()}`);
          if (state === StompState.CONNECTED) {
            this.onConnected();
          }
        })
    );
    this.stompService.initAndConnect();
  }

  getIsSocketConnected() {
    return this.isConnected;
  }

  onConnected(frame?: any) {
    this.logger.log('CONNECTED > Logging in and subscribing');
    this.login();
    // this.subscribeSmartCard();
    this.subscribeVehicleExit();
    this.subscribeViolation();
    this.isConnected = true;
    this.subject$.next({
      type: WS_MESSAGE_TYPES.SOCKET_CONNECTED,
      data: null
    });
  }

  login() {
    const data = JSON.stringify({ 'sessionId': this.authService.getSessionId(), 'channelId': this.channelId });
    console.log(data);
    const ur = '/app/webSocketService/bhariSocketHandler';
    console.log(ur);
    this.stompService.publish('/app/webSocketService/bhariSocketHandler', data, this.headers);

  }
  // subscribe() {
  //  subscribeErrors() {
  //     const errorSubscription = this.stompService.subscribe('/user/queue/errors');
  //     this.stompSubscriptions.push(errorSubscription);
  //     this.subscriptions.push(
  //       errorSubscription
  //         .subscribe((message: Message) => {
  //           let error = message.body;
  //           if (typeof message.body !== 'string') {
  //             error = JSON.parse(message.body);
  //           }
  //           this.logger.error('ERROR ON WS ' + message.body);
  //           this.subject$.next({
  //             type: WS_MESSAGE_TYPES.DATA_ERROR,
  //             data: error
  //           });
  //         })
  //     );
  //    }
  // subscribeSmartCard() {
  //   const smartCardSubscription = this.stompService.subscribe('/user/queue/lane/smartCardInfo');
  //   this.stompSubscriptions.push(smartCardSubscription);
  //   this.subscriptions.push(
  //     smartCardSubscription
  //       .subscribe((message: Message) => {
  //         console.log(message);
  //         if (typeof message.body !== 'string') {
  //           // this.logger.error('ERROR ON WS ' + message.body);
  //           this.subject$.next({
  //             type: WS_MESSAGE_TYPES.DATA_ERROR,
  //             data: message.body
  //           });
  //         } else {
  //           // this.logger.log('DATA RECEIVED ON WS channel possibleSearches ' + message.body);
  //           this.subject$.next({
  //             type: WS_MESSAGE_TYPES.DATA_RECEIVED,
  //             data: message.body
  //           });
  //         }
  //       })
  //   );
  // }

  subscribeVehicleExit() {
    this.vehicleExitSubscription = this.stompService.subscribe('/user/queue/lane/vehicleExit');
    this.stompSubscriptions.push(this.vehicleExitSubscription);
    this.subscriptions.push(
      this.vehicleExitSubscription
        .subscribe((message: Message) => {
          console.log('not string kkk');
          if (typeof message.body !== 'string') {
            console.log('not string');
            // this.logger.error('ERROR ON WS ' + message.body);
            this.subject$.next({
              type: WS_MESSAGE_TYPES.DATA_ERROR,
              data: message.body
            });
          } else {
            console.log('string');
            // this.logger.log('DATA RECEIVED ON WS channel possibleSearches ' + message.body);
            this.subject$.next({
              type: WS_MESSAGE_TYPES.DATA_RECEIVED,
              data: message.body
            });
          }
        })
    );
  }

  subscribeViolation() {
    const violationSubscription = this.stompService.subscribe('/user/queue/lane/violations');
    this.stompSubscriptions.push(violationSubscription);
    this.subscriptions.push(
      violationSubscription
        .subscribe((message: Message) => {
          if (typeof message.body !== 'string') {
            // this.logger.error('ERROR ON WS ' + message.body);
            this.subject$.next({
              type: WS_MESSAGE_TYPES.DATA_ERROR,
              data: message.body
            });
          } else {
            // this.logger.log('DATA RECEIVED ON WS channel possibleSearches ' + message.body);
            this.subject$.next({
              type: WS_MESSAGE_TYPES.DATA_RECEIVED,
              data: message.body
            });
          }
        })
    );
  }



  getChannelId() {
    return this.channelId;
  }

  getSubject() {
    return this.subject$;
  }

  disconnect() {
    this.subscriptions = [];
    this.isConnected = false;
    this.stompService.disconnect();
  }
}


