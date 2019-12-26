import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { switchMap, catchError } from 'rxjs/operators';
import 'rxjs/add/observable/of';
import { of } from 'rxjs/observable/of';
import { AuthService } from './auth.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
@Injectable()
export class RestService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private toasterService: ToasterService
  ) {
    this.toasterService = toasterService;
  }
  public config: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 3500,
      positionClass: 'toast-bottom-right',
      animation: 'fade',
      preventDuplicates: true
    });
  get(url): Observable<any> {
    let headers = new HttpHeaders();
    headers = this.appendAuthorizationHeader(headers);
    return this.httpClient.get(url, { headers: headers })
      .pipe(
        switchMap(res => this.checkAndHandleError(res)),
        catchError(err => this.handleError(err))
      );
  }
  post(url: string, body: any | null, options: any = {}) {
    let headers: HttpHeaders = options.headers || new HttpHeaders();
    headers = this.appendAuthorizationHeader(headers);
    return this.httpClient.post(url, body, { headers: headers })
      .pipe(
        switchMap(res => this.checkAndHandleError(res)),
        catchError(err => this.handleError(err))
      );
  }

  put(url: string, body: any | null, options: any = {}) {
    let headers: HttpHeaders = options.headers || new HttpHeaders();
    headers = this.appendAuthorizationHeader(headers);
    return this.httpClient.put(url, body, { headers: headers })
      .pipe(
        switchMap(res => this.checkAndHandleError(res)),
        catchError(err => this.handleError(err))
      );
  }

  delete(url: string, options: any = {}) {
    let headers: HttpHeaders = options.headers || new HttpHeaders();
    headers = this.appendAuthorizationHeader(headers);
    return this.httpClient.delete(url, { headers: headers })
      .pipe(
        switchMap(res => this.checkAndHandleError(res)),
        catchError(err => this.handleError(err))
      );
  }

  appendAuthorizationHeader(headers: HttpHeaders): HttpHeaders {
    const sId = localStorage.getItem('sessionId');
    if (sId) {
      headers = headers.set('Authorization', sId);
    }
    return headers;
  }

  checkAndHandleError(res): Observable<any> {
    if (res.success === false) {
      this.toasterService.pop('error', '', res.description);
      this.authService.updateAuthStatus({
        status: false,
        data: res
      });
      return of(res);
    }
    return of(res);
  }
  handleError(err): Observable<any> {
    this.toasterService.pop('error', '', err.message);
    return Observable.of(err);
  }
}
