import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { LoginComponent } from "./login.component";
import { Component, OnInit } from "@angular/core";
import { ToasterModule, ToasterService, ToasterConfig } from "angular2-toaster";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from "@angular/forms";
import { Router } from "@angular/router";
import { TollScreenService } from './../core/services/toll-screen.service';
import { SessionService } from "../core/services/session.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NO_ERRORS_SCHEMA } from "@angular/compiler/src/core";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule, By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import { Observable } from "rxjs";
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import { AuthService } from "./../core/services/auth.service";
import { AppService } from "./../core/services/app.service";
import { RestService } from "./../core/services/rest.service";
import { LoggerService } from "./../core/services/logger.service";
import { SocketService } from "./../core/services/socket.service";
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { StompRService, StompState } from '@stomp/ng2-stompjs';

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let username = "username";
  let plainTextPassword = "password";
  let authService: AuthService;
  let appService: AppService;
  let restService: RestService;
  let sessionService: SessionService;
  let toasterService: ToasterService;
  let socketService: SocketService;
  let loggerService: LoggerService;
  let loginForm: FormGroup;
  let stompService: StompRService;
  let tollScreenService: TollScreenService;
  const loginUserInfo = {
    login: "TCUSER1",
    name: "TCUSER ONE",
    sessionId: "36d5121e-2bf5-46e1-bc45-63b54ab475d2",
    success: true,
    userId: "4c3cecc9-f5be-4a4e-a680-4d9089b9e3df",
    userType: "TICKET_COLLECTOR"
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ToasterModule.forRoot()
      ],
      providers: [AuthService, RestService, SessionService, TollScreenService, SocketService, StompRService, AppService, LoggerService]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    appService = TestBed.get(AppService);
    restService = TestBed.get(RestService);
    loggerService = TestBed.get(LoggerService);
    sessionService = TestBed.get(SessionService);
    socketService = TestBed.get(SocketService);
    toasterService = TestBed.get(ToasterService);
    tollScreenService = TestBed.get(TollScreenService);
    fixture.detectChanges();
  }));


  beforeEach(function () {
    jasmine.clock().uninstall();
    jasmine.clock().install();
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  it("should create login component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize authService", () => {
    expect(authService).toBeTruthy();
  });
  it("should initialize restService", () => {
    expect(restService).toBeTruthy();
  });
  it("should initialize sessionService", () => {
    expect(sessionService).toBeTruthy();
  });
  it("should initialize TollScreenService", () => {
    expect(tollScreenService).toBeTruthy();
  });
  it('should initialize socketService', () => {
    expect(socketService).toBeTruthy();
  });
  it('should initialize AppService', () => {
    expect(appService).toBeTruthy();
  });
  it('should initialize LoggerService', () => {
    expect(loggerService).toBeTruthy();
  });
  it('should initialize ToasterService', () => {
    expect(toasterService).toBeTruthy();
  });
  it('should call getPlazaInfo to get plaza address', () => {
    const plazaInfo = {
      success: true,
      info: {
        address: 'Madugulapally Toll Plaza Hyderabad 500029',
      }
    };
    let spy = spyOn(tollScreenService, 'getPlazaInfo').and.returnValue(Observable.from([plazaInfo]));
    component.getPlazaInfo();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(component.address).toEqual(plazaInfo.info.address);

  });


  it('should call getPlazaLogo to get plaza logo', () => {
    const imageInfo = {
      success: true,
      imageData: {
        fileName: "plazaLogo.jpeg",
        fileType: "image/jpeg",
        fileBytes: "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"
      }
    }
    const plazaId = 'ff638d70-fe33-11e8-8eb2-f2801f1b9fd1';
    //component.imgFileName='plazaLogo.jpeg';
    let spy = spyOn(tollScreenService, 'getPlazaLogo').and.returnValue(Observable.from([imageInfo]))
    component.getExistingLogo(plazaId);
    fixture.detectChanges();
    expect(component.logoResponse).toBe(imageInfo);
    expect(component.existingLogo).toEqual('data:image/jpeg;base64,' + imageInfo.imageData.fileBytes);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('form should have 2 controls', () => {
    component.buildForm();
    expect(component.loginForm.contains('username')).toBeTruthy();
    expect(component.loginForm.contains('plainTextPassword')).toBeTruthy();
  });

  it('form should have username as required and valid password entered', () => {
    component.loginForm.controls.username.setValue("");
    component.loginForm.controls.plainTextPassword.setValue("tcuser1");
    expect(component.loginForm.controls.username.valid).toBeFalsy();
    expect(component.loginForm.controls.plainTextPassword.valid).toBeTruthy();
  });
  it('form should have password as required and valid username entered', () => {
    component.loginForm.controls.plainTextPassword.setValue("");
    component.loginForm.controls.username.setValue("TCUSER1");
    expect(component.loginForm.controls.username.valid).toBeTruthy();
    expect(component.loginForm.controls.plainTextPassword.valid).toBeFalsy();
  });

  it("form should be invalid if credentials are not filled", () => {
    component.onSubmit();
    component.loginForm.controls.username.setValue("");
    component.loginForm.controls.plainTextPassword.setValue("");
    expect(component.loginForm.valid).toBeFalsy();
  });
  it("form should be valid if credentials are filled", () => {
    component.onSubmit();
    component.loginForm.controls.username.setValue("TCUSER1");
    component.loginForm.controls.plainTextPassword.setValue("tcuser1");
    expect(component.loginForm.valid).toBeTruthy();
  });


  it("form should have username with no special characters in it", () => {
    component.onSubmit();
    component.loginForm.controls.username.setValue("bbc@#$");
    expect(component.loginForm.controls.username.valid).toBeFalsy();
  });
  it("form should have username with length not less than 3", () => {
    component.onSubmit();
    component.loginForm.controls.username.setValue("b2");
    expect(component.loginForm.controls.username.value.length).toBeLessThan(3);
  });
  it("form should have username with length not more than 20", () => {
    component.onSubmit();
    component.loginForm.controls.username.setValue("abcdefghifjdbcbdhdhdhd");
    expect(component.loginForm.controls.username.value.length).toBeGreaterThan(3);
  });

  it("form should have username with length not less than 3 and more than 20 characters and valid data entered", () => {
    component.onSubmit();
    component.loginForm.controls.username.setValue("PLAZAUSER");
    expect(component.loginForm.controls.username.valid).toBeTruthy();
  });
  it("form should have username with length not less than 3 and more than 20 characters and invalid data entered", () => {
    component.onSubmit();
    component.loginForm.controls.username.setValue("PLAZAUSER!@#$%");
    expect(component.loginForm.controls.username.valid).toBeFalsy();
  });



  it("form should have password with length not less than 3", () => {
    component.onSubmit();
    component.loginForm.controls.plainTextPassword.setValue("b2");
    expect(component.loginForm.controls.plainTextPassword.value.length).toBeLessThan(3);
  });
  it("form should have password with length not more than 20", () => {
    component.onSubmit();
    component.loginForm.controls.plainTextPassword.setValue("abcdefghifjdbcbdhdhdhd");
    expect(component.loginForm.controls.plainTextPassword.value.length).toBeGreaterThan(20);
  });
  it("form should have password with length not less than 3 and more than 20 characters and valid data entered", () => {
    component.onSubmit();
    component.loginForm.controls.plainTextPassword.setValue("PLAZAUSER");
    expect(component.loginForm.controls.plainTextPassword.valid).toBeTruthy();
  });
  it("form should have password with length not less than 3 and more than 20 characters and invalid data entered", () => {
    component.onSubmit();
    component.loginForm.controls.plainTextPassword.setValue("PLAZAUSER!@#$%");
    expect(component.loginForm.controls.plainTextPassword.valid).toBeFalsy();
  });


  it('Onsubmit should login', () => {
    let payload = {
      username: component.loginForm.controls.username.setValue("TCUSER1"),
      plainTextPassword: 'tcuser1'
    }
    component.loginUserInfo = {
      login: "TCUSER1",
      name: "TCUSER ONE",
      sessionId: "36d5121e-2bf5-46e1-bc45-63b54ab475d2",
      success: true,
      userId: "4c3cecc9-f5be-4a4e-a680-4d9089b9e3df",
      userType: "TICKET_COLLECTOR"
    }
    let spy = spyOn(sessionService, 'loginAdmin').and.returnValue(Observable.from([loginUserInfo]));
    component.onSubmit();
    expect(component.loginUserInfo).toBe(loginUserInfo);
    expect(component.loginForm.controls.username.value).toBe(loginUserInfo.login);
    expect(spy).toHaveBeenCalled();

  });

  it('Onsubmit should login success false', () => {
    let payload = {
      username: component.loginForm.controls.username.setValue("TCUSER2"),
      plainTextPassword: 'tcuser2'
    }
    component.loginUserInfo = {
      description: "Sorry , Lane application is not allowed for multiple users to login ,other user is already logged in is : TCUSER1",
      email: null,
      errorCode: 80,
      generalRoles: null,
      login: null,
      name: null,
      passwordChangeRequired: false,
      serverTime: null,
      sessionId: null,
      success: false,
      timezoneCode: null,
      userId: null,
      userType: null
    }
    let spy = spyOn(sessionService, 'loginAdmin').and.returnValue(Observable.from([loginUserInfo]));
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
    jasmine.clock().tick(1500);

  });


  it('should omit special characters in username field of loginform', () => {
    const evt = {
      charCode: 98,
      code: "KeyB",
      key: "b",
      keyCode: 98,
      which: 98
    }
    const result = component.omit_special_char(evt);
    fixture.detectChanges();
    expect(result).toBeTruthy();

  });
  it('should be invalid if special characters are entered in the username field of loginform', () => {
    const evt = {
      charCode: 36,
      code: "Digit4",
      key: "$",
      which: 36,
      keyCode: 36
    }
    const result = component.omit_special_char(evt);
    fixture.detectChanges();
    expect(result).toBeFalsy();

  });
});

