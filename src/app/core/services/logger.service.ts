import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

  public logsEnabled = false;

  setLogging(val: boolean) {
    this.logsEnabled = val;
  }

  log(...args) {
    if (this.logsEnabled) {
      // console.log.apply(console, args);
    }
  }
}
