import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { AppService } from './app.service';
@Injectable()
export class AuthService {
  private lsKey = 'lane.sessionId';
  private commonData;
  private sessionId = null;
  userLoggedInfo: any;
  userLoggedData: any;
  userLog: any;
  authStatus$: Subject<any> = new Subject();
  SmartCardInfo: any = {};
  exemptSnapObj: any = {};
  constructor(
    private http: HttpClient,
    private appService: AppService,
  ) {
    const sId = localStorage[this.lsKey];
    this.setSessionId(sId);
  }


  getIsAuthorized() {
    return !!this.sessionId;
  }

  setSessionId(sId) {
    this.sessionId = sId;
  }

  getSessionId() {
    return this.sessionId;
  }

  logout() {
    localStorage.removeItem(this.lsKey);
    this.setSessionId(null);
    localStorage.removeItem('lane.userInfo');
    localStorage.clear();
  }


  updateAuthStatus(status) {
    this.authStatus$.next(status);
  }
  setUserData(data) {
    this.userLog = data;
  }


  setExemptSnap(data) {
    console.log(data);
    this.exemptSnapObj = data;
  }
  getExemptSnap() {
    const temp = this.exemptSnapObj;
    console.log(temp);
    return temp;
  }
}
