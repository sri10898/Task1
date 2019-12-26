/* tslint:disable:no-unused-variable */
/* tslint:disable:no-unused-variable */

import { TestBed, async, inject ,getTestBed} from '@angular/core/testing';
import { AppService } from './app.service';

describe('Service: App', () => {
  let injector: TestBed;
  let service: AppService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppService]
    });
    injector = getTestBed();
    service = injector.get(AppService);
  });

  it('should ...', inject([AppService], (service: AppService) => {
    expect(service).toBeTruthy();
  }));
  it('should call setConfig',()=>{
    const config={
      dev:{
        DEVICE_CHANGES: "http://192.168.1.110:9884",
        HOST_NAME: "http://192.168.1.110:8885",
        HOST_NAME_REPORTS: "http://192.168.1.110:9885",
        LOGS_ENABLED: true,
        SOCKET_LOGS: true,
        SOCKET_URL: "ws://192.168.1.110:8885/webSocketService/bhariSocketHandler",
        STATIC_APP_URL: "http://localhost:4200"
      },
      prod:{
        DEVICE_CHANGES: "http://192.168.1.110:9884",
        HOST_NAME: "http://192.168.1.110:8885",
        HOST_NAME_REPORTS: "http://192.168.1.110:9885",
        LOGS_ENABLED: true,
        SOCKET_LOGS: true,
        SOCKET_URL: "ws://192.168.1.110:8885/webSocketService/bhariSocketHandler",
        STATIC_APP_URL: "http://localhost:4200"
      },
      env:"dev"
    };
    service.setConfig(config);
  });
  
  it('should call getConfigParam',()=>{
    service.getConfigParam('HOST_NAME');
  });
  
});
