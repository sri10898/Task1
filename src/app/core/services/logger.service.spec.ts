/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, getTestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('Service: Logger', () => {
  let injector: TestBed;
  let service: LoggerService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService]
    });
    injector = getTestBed();
    service = injector.get(LoggerService);
  });

  it('should ...', inject([LoggerService], (service: LoggerService) => {
    expect(service).toBeTruthy();
  }));

  it('should call setLogging', () => {
    service.setLogging(true);
    expect(service.logsEnabled).toBeTruthy();
  });

  it('should call log', () => {
    service.logsEnabled = true;
    service.log('hello');
  });
});
