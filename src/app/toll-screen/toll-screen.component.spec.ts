import { TollScreenComponent } from './toll-screen.component';
import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { WS_MESSAGE_TYPES, SocketData } from './../core/services/socket.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppService } from './../core/services/app.service';
import { AuthService } from './../core/services/auth.service';
import { SocketService } from './../core/services/socket.service';
import { LoggerService } from './../core/services/logger.service';
import { Message, StompSubscription } from '@stomp/stompjs';
import { TollScreenService } from './../core/services/toll-screen.service';
import { DOCUMENT } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { SessionService } from './../core/services/session.service';
import { RestService } from "./../core/services/rest.service";
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
import { Subject } from 'rxjs/Subject';



describe('TollScreenComponent', () => {
  let component: TollScreenComponent;
  let fixture: ComponentFixture<TollScreenComponent>;
  let router: Router;
  let authService: AuthService;
  let toasterService: ToasterService;
  let restService: RestService;
  let appService: AppService;
  let socketService: SocketService;
  let logger: LoggerService;
  let stompService: StompRService;
  let sessionService: SessionService;
  let tollScreenService : TollScreenService;
  let dialog: MatDialog;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TollScreenComponent ],
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
        AuthService, RestService, AppService, SocketService, LoggerService, SessionService, StompRService,TollScreenService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TollScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
