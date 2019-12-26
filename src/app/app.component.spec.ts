import { AppComponent } from './app.component';
import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { WS_MESSAGE_TYPES, SocketData } from './core/services/socket.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppService } from './core/services/app.service';
import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';
import { LoggerService } from './core/services/logger.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { SessionService } from './core/services/session.service';
import { RestService } from "./core/services/rest.service";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ToasterModule, ToasterService, ToasterConfig } from "angular2-toaster";
import { BrowserModule, By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { BsDatepickerModule, DatepickerModule } from 'ngx-bootstrap/datepicker';
import { Observable, of } from 'rxjs';
import { throwError } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { StompRService, StompState } from '@stomp/ng2-stompjs';
import { timer, pipe, interval } from 'rxjs';
import { Subject } from 'rxjs/Subject';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;
  let authService: AuthService;
  let toasterService: ToasterService;
  let restService: RestService;
  let appService: AppService;
  let socketService: SocketService;
  let logger: LoggerService;
  let stompService: StompRService;
  let sessionService: SessionService;
  let dialog: MatDialog;
  let http: HttpClient;
  let authStatus$: Subject<any> = new Subject();
  let socketSubscription: Subscription;
  let errorSubscription: Subscription;
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ToasterModule.forRoot(),
        BsDatepickerModule.forRoot(),
        DatepickerModule.forRoot(),
        MatDialogModule,
        HttpClientModule
      ],
      providers: [
        AuthService, RestService, AppService, SocketService, LoggerService, SessionService, StompRService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    authService = TestBed.get(AuthService);
    restService = TestBed.get(RestService);
    toasterService = TestBed.get(ToasterService);
    appService = TestBed.get(AppService);
    socketService = TestBed.get(SocketService);
    logger = TestBed.get(LoggerService);
    sessionService = TestBed.get(SessionService);
    dialog = TestBed.get(MatDialog);
    http = TestBed.get(HttpClient);
    fixture.detectChanges()
  });

  it('should create viewusers', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it("should initialize authService", () => {
    expect(authService).toBeTruthy();
  });
  it("should initialize restService", () => {
    expect(restService).toBeTruthy();
  });
  it("should initialize appService", () => {
    expect(appService).toBeTruthy();
  });

  it("should initialize router", () => {
    expect(router).toBeTruthy();
  });
  it("should initialize socketService", () => {
    expect(socketService).toBeTruthy();
  });

  it("should initialize logger", () => {
    expect(logger).toBeTruthy();
  });

  xit('should call ngonInit', () => {
    const responseObj = {
      description: "SUCCESS",
      errorCode: 0,
      success: true
    };
    const spyOnSession = spyOn(sessionService, 'isValidSession').and.returnValue(Observable.from([responseObj]));
    fixture.detectChanges()
    component.ngOnInit();
    const source = interval(2000);
    component.errorSubscription = source.subscribe(val =>
      component.getSessionValidation()
    );
    expect(spyOnSession).toHaveBeenCalled();
  });

  xit('should call ngonInit isvalid session with error', () => {
    const spyOnSession = spyOn(sessionService, 'isValidSession').and.returnValue(throwError({ responseCode: 500 }));
    fixture.detectChanges()
    component.ngOnInit();
    expect(spyOnSession).toHaveBeenCalled();
  });

  xit('should call getSessionValidation', () => {
    const sessionId = 'c692c53d-acd0-4686-be77-40c3f6faddc3';
    const responseObj = {
      description: "Session Expired So You LoggedOut ",
      errorCode: 6,
      success: false
    };

    const spySession = spyOn(sessionService, 'isValidSession').and.returnValue(Observable.from([responseObj]));
    component.getSessionValidation();
    fixture.detectChanges();

    expect(spySession).toHaveBeenCalled();
  });

  xit('should call ngonInit isvalid session with error', () => {
    const sessionId = 'c692c53d-acd0-4686-be77-40c3f6faddc3';
    const spyAuth = spyOn(authService, 'getSessionId').and.returnValue(sessionId);
    const spyOnSession = spyOn(sessionService, 'isValidSession').and.returnValue(throwError({ responseCode: 500 }));
    fixture.detectChanges()
    component.getSessionValidation();
    expect(spyOnSession).toHaveBeenCalled();
    expect(spyAuth).toHaveBeenCalled();
  });

  it('should call ngOnDestroy', () => {
    component.ngOnDestroy();
  });


});
