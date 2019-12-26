import { VideoSettingsComponent } from './video-settings.component';
import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
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

describe('VideoSettingsComponent', () => {
  let component: VideoSettingsComponent;
  let fixture: ComponentFixture<VideoSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoSettingsComponent ],
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
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
