import { Injectable } from '@angular/core';

@Injectable()
export class AppService {
  private config: any = {};
  private userInfo: any = {};
  private statesList: any[] = [];

  setConfig(config) {
    this.config = config[config.env];
    console.log(this.config);
  }
  getConfigParam(param) {
    console.log(param);
    return this.config[param];
  }
}

