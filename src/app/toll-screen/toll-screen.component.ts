import { HttpResponse, HttpEventType } from '@angular/common/http';
// import {LaneLogoService} from './../core/services/lane-logo.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../core/services/auth.service';
import { WS_MESSAGE_TYPES, SocketData } from './../core/services/socket.service';
import { FormArray, FormGroup, FormBuilder, FormControl, Validators, FormsModule, ReactiveFormsModule, RequiredValidator, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Message, StompSubscription } from '@stomp/stompjs';
import { TollScreenService } from './../core/services/toll-screen.service';
import { Subscription } from 'rxjs/Subscription';
import { DOCUMENT } from '@angular/common';
import { SocketService } from './../core/services/socket.service';
import { AppService } from '../core/services/app.service';
import { SessionService } from '../core/services/session.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/filter';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { timer, pipe, interval } from 'rxjs';
import { MIN_LENGTH_VALIDATOR } from '@angular/forms/src/directives/validators';

@Component({
  selector: 'app-toll-screen',
  templateUrl: './toll-screen.component.html',
  styleUrls: ['./toll-screen.component.scss'],
  providers: [ToasterService]
})
export class TollScreenComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private tollscreenService: TollScreenService,
    private fb: FormBuilder,
    @Inject(DOCUMENT) document,
    private socketService: SocketService,
    private appService: AppService,
    private sessionService: SessionService,
    public dialog: MatDialog,
    private modalService: NgbModal,
    public sanitizer: DomSanitizer,
    toasterService: ToasterService) {
    this.isKeyBrdShrtcts = this.appService.getConfigParam('KEYBOARD_SHORTCUTS'); this.toasterService = toasterService;
  }
  get vehicleTypes() {
    return this.laneForm.get('vehicleTypes') as FormArray;
  }
  get journeyTypesBtns() {
    return this.laneForm.get('journeyTypesBtns') as FormArray;
  }
  get paymentTypesBtns() {
    return this.laneForm.get('paymentTypesBtns') as FormArray;
  }
  private toasterService: ToasterService;
  private socketSubscription: Subscription;
  laneForm: FormGroup;
  vehicleInfo: any = [];
  // CAHT_TXN
  vehiclesOnCashList: any;
  vehiclesWithFreeTxn: any;
  // EXEMPT
  vechiclesWithExempt: any;
  // PAYTM
  vehiclesWithPaytm: any;
  // CARD
  vehiclesWithCards: any;
  // LIST USED IN HTML
  vehiclesList: any;
  paymentTypes: any = [];
  vehicleTypeCopy: any = '';
  defaultSelectedPayment: any;
  cashFare: any = '0.00';
  journeyType: any = 'SJ';
  createLaneTxnObj: any = {};
  laneTransactionInfo: any = {};
  currentShiftInfo: any = {};
  currentTime: any;
  currentDate: any;
  shiftStartTime: any = '';
  shiftEndTime: any = '';
  timeBeforeExpireSession: any;
  allLaneTxnsInfo: any;
  allLaneTxnsInfoArr: any = [];
  perPageLaneTxnObj: any = {};
  fleetTxnInitiateResp: any;
  fleetStatus: any = 'Convoy';
  TowedStatus: any = 'Towed';
  fleetTxnId: any;
  isValidateTJKey: Boolean = false;
  laneFormResponse: any = {};
  socketRecievedInfo: any = {};
  imageFile: any;
  isExempt: Boolean = false;
  base64: string;
  imageFileAfterConversion: any;
  imageName: any;
  paymentTypeId: any;
  vehicleTypeId: any;
  noVehicleSelect: Boolean = true;
  exemptSuccessMsg: Boolean = false;
  listLaneTxnsError = '';
  noInputEntered: Boolean;
  laneShiftInfo: any = {};
  fleetVehicleCount = 0;
  exemptSubTypesInfo: any = {};
  exemptSubTypesArr: any = [];
  exemptSubTypesExists: Boolean = false;
  exemptSubTypesSelected: Boolean = false;
  exemptSubTypeSelected = '';
  isSCIssued: Boolean = false;
  ufdTriggerResponse: any = {};
  SCReadResponse: any = {};
  paymentTypesArr: any = [];
  group: any = [];
  noPattern = '^[0-9]{4}$';
  newFareTypes: any = [];
  gateImgSrc: any = 'assets/images/toll-closed.svg';
  signalImgSrc: any = 'assets/images/redLight.png';
  disableFinishTxnBtn: Boolean = false;
  isJourneyTypeSelected: Boolean = false;
  activeSubmitBtn: Boolean = false;
  activeSCSubmitBtn: Boolean = false;
  newVehicleType: any;
  newFareType: any = '';
  newPaymentMethod: any = '';
  newVehicleFare = 0.00;
  isVehicleNoEntered: Boolean = false;
  liveCamUrl = '';
  camUrl: SafeResourceUrl;
  exemptTypeText = '';
  exemptOthersArr: any = [];
  exemptEmergencyArr: any = [];
  exemptEmgyObj: any = {};
  exemptId = '';
  isExemptEmgy: Boolean = false;
  hideOpClass: Boolean = false;
  exemptObj: any = {};
  exemptOthersArrEmgy: any = [];
  exemptTypeSelected: Boolean = false;
  exemptEmgypaymentTypesArr: any = [];
  exemptEmgypaymentTypeId: any;
  vehicleEntityId = '';
  isFreeTxnsOn: Boolean = false;
  isFleetOn: Boolean;
  freeVehicleTypeValue = '';
  plazaName: string;
  address: string;
  logoResponse: any;
  existingLogo: any;
  refreshButton: Boolean = false;
  towedTxnArray: any = [];
  towedVehCount: any;
  towedVehicleEntityId = '';
  finishTowed: Boolean = false;
  isTowedTxn: Boolean = false;
  finishTowedErr: Boolean = false;
  isSCBtnClicked: Boolean = false;
  towedResponse: any;
  prevKey: any = '';
  resetOHLSResp: any = {};
  regexpNSC = /^[0-9A-Za-z]$/;
  barcodeData: any = '';
  lastKeyTime: any = -1;
  isBarcodeBtnClick: Boolean = false;
  isBarcodeBtnClicked: Boolean = true;
  isViolationActive: Boolean = false;
  isTrctComSelected: Boolean = false;
  activeSCInfo: any = {};
  barcodeResp: any = {};
  brPlaceholderText = 'input';
  timerDeviceStatus: any;
  deviceStatusResponse: any;
  showDialog: Boolean = false;
  isKeyBrdShrtcts: Boolean;
  isActiveVehicleExit: Boolean = true;
  @ViewChild('paymentMethod') paymentMethod: ElementRef;
  @ViewChild('fleetVehicleNo') fleetVehicleNo: ElementRef;
  @ViewChild('vehicleNumber') vehicleNumber: ElementRef;
  @ViewChild('barcode') barcode: ElementRef;
  @ViewChild('barcodeDevice') barcodeDevice: ElementRef;
  @ViewChild('SCDevice') SCDevice: ElementRef;
  @ViewChild('smartcard') smartcard: ElementRef;
  errorSubscription: Subscription;
  public config: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 3500,
      positionClass: 'toast-bottom-right',
      animation: 'fade',
      preventDuplicates: true
    });
  barcodeOutput: any = '';
  barcodeEvent: Boolean = false;
  barcodeVehicleNumber: any = '';
  barcodeSCSerialNumber: any = '';
  barcodeDescription: any = '';
  ngOnInit() {
    this.getPlazaInfo();
    this.getLiveCamUrl();
    this.getFareInfo();
    this.getThePaymentTypes();
    this.getCurrentShiftInfo();
    this.showTime();
    this.getAllLaneTxnsInfo();
    this.socketSubscription = this.socketService.getSubject()
      .subscribe((event: SocketData) => {
        if (event.type === WS_MESSAGE_TYPES.DATA_ERROR) {
          this.toasterService.pop('error', '', event.data);
        } else if (event.type === WS_MESSAGE_TYPES.DATA_RECEIVED) {
          this.socketRecievedInfo = JSON.parse(event.data);
          if (this.socketRecievedInfo.vehicleExitStatus === true) {
            // this.tollscreenService.setSocketVExitInfo(this.socketRecievedInfo);
            this.gateImgSrc = 'assets/images/toll-closed.svg';
            this.signalImgSrc = 'assets/images/redLight.png';
            this.disableFinishTxnBtn = false;
            this.isSCIssued = false;
            this.isActiveVehicleExit = true;
          } else if (this.socketRecievedInfo.txnId) {
            this.gateImgSrc = 'assets/images/toll-closed.svg';
            this.signalImgSrc = 'assets/images/redLight.png';
            this.isViolationActive = true;
            this.getAllLaneTxnsInfo();
            // this.resetLaneForm();
            this.isActiveVehicleExit = true;
            this.disableFinishTxnBtn = false;
          } else {
            // console.log(event.data);
            this.isSCIssued = false;
            // this.smartCardNotIssued();
            this.isActiveVehicleExit = false;
          }
        } else {
          return;
        }
      });
    this.timerDeviceStatus = timer(7000);
    this.timerDeviceStatus.subscribe((t) => this.onTimeOut());
  }
  onTimeOut() {
    this.sessionService.isValidSession().subscribe((response) => {
      if (response.success) {
        this.tollscreenService.getSystemAvailableDevices().subscribe((res) => {
          if (res.success) {
            this.deviceStatusResponse = res.devices.filter(function (event) {
              return event.deviceType !== 'OHLS' && event.deviceType !== 'UFD';
            });
          }
        });
      }
    });
  }
  getPlazaInfo() {
    this.tollscreenService.getPlazaInfo().subscribe((response) => {
      if (response.success) {
        this.plazaName = response.info.tollName;
        this.address = response.info.address;
        this.getExistingLogo(response.info.id);
      }
    });
  }
  getExistingLogo(plazaId) {
    this.tollscreenService.getPlazaLogo(plazaId)
      .subscribe((res) => {
        if (res.success) {
          this.logoResponse = res;
          const existingLogo = this.logoResponse.imageData.fileBytes;
          this.existingLogo = 'data:image/jpeg;base64,' + existingLogo;
        }
      });
  }
  getLiveCamUrl() {
    this.tollscreenService.getLaneCameraInfo().subscribe((response) => {
      if (response.success) {
        if (response.deviceInfo.liveStreamUrl) {
          this.liveCamUrl = response.deviceInfo.liveStreamUrl;
          this.camUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.liveCamUrl);
        } else {
          this.toasterService.pop('warning', '', 'No camera data available');
        }

      }
    });
  }
  getFareInfo() {
    this.tollscreenService.getVehicleFare().subscribe((response) => {
      if (response.success) {
        this.vehicleInfo = response.vehicleFareInfoList;
        this.vehiclesOnCashList = this.vehicleInfo.filter(function (event) {
          return event.paymentType === 'CASH';
        });
        this.vehiclesWithFreeTxn = this.vehicleInfo.filter(function (event) {
          return event.paymentType === 'FREE';
        });
        this.vehiclesWithPaytm = this.vehicleInfo.filter(function (event) {
          return event.paymentType === 'PAYTM';
        });
        this.vehiclesWithCards = this.vehicleInfo.filter(function (event) {
          return event.paymentType === 'CARD';
        });
        this.vechiclesWithExempt = this.vehicleInfo.filter(function (event) {
          return event.paymentType === 'EXEMPT';
        });
        this.getVehiclesFareInfo();
      }
    });
  }
  getVehiclesFareInfo() {
    this.tollscreenService.getDistinctVehicleTypes().subscribe((response) => {
      if (response.success) {
        this.vehiclesList = response;
        this.vehiclesList = this.vehiclesList.vehicleTypes;
        this.vehiclesList.forEach(element => {
          element.selectedVehicle = 'NONE';
        });
        if (this.vehiclesList === null) {
          return false;
        } else {
          this.buildForm();
          this.createVehicleTypeArr();
        }
      }
    });
  }
  buildForm() {
    this.laneForm = this.fb.group({
      vehicleNumber: ['', [Validators.required, Validators.minLength(2)]],
      vehicleTypes: this.fb.array([]),
      exemptType: [''],
      exemptSubType: [''],
      journeyTypesBtns: this.fb.array([]),
      paymentTypesBtns: this.fb.array([]),
      description: ['', [Validators.maxLength(250)]],
      SCVehicleNumber: ['']
    });
    this.laneForm.controls['vehicleNumber'].valueChanges.subscribe(value => {
      const vehicles = this.laneForm.get('vehicleTypes') as FormArray;
      if (this.laneForm.controls.vehicleNumber.value !== '' && this.laneForm.controls.vehicleNumber.valid) {
        this.isVehicleNoEntered = true;
        this.activeSCSubmitBtn = true;
        // const vehicles = this.laneForm.get('vehicleTypes') as FormArray;
        vehicles.controls.forEach((element: any) => {
          element.enable();
        });
      } else {
        this.laneForm.setControl('journeyTypesBtns', this.fb.array([]));
        this.laneForm.setControl('paymentTypesBtns', this.fb.array([]));
        this.activeSCSubmitBtn = false;
        this.isVehicleNoEntered = false;
        this.newFareTypes = [];
        this.paymentTypes = [];
        this.vehicleTypeCopy = '';
        this.newVehicleFare = 0.00;
        this.newPaymentMethod = '';
        this.newFareType = '';
        vehicles.controls.forEach((element: any) => {
          element.touched = false;
        });
        this.isSCBtnClicked = false;
        this.isBarcodeBtnClick = false;
      }
    });
  }
  createVehicleTypeArr() {
    for (let i = 0; i < this.vehiclesList.length; i++) {
      const control = <FormArray>this.laneForm.controls['vehicleTypes'];
      // push the value from stepTextArea to array
      control.push(new FormControl(this.vehiclesList[i].vehicleType));
    }
    const vehicles = this.laneForm.get('vehicleTypes') as FormArray;
    vehicles.controls.forEach((element: any) => {
      element.disable();
    });
  }
  getThePaymentTypes() {
    this.tollscreenService.getThePaymentTypes().subscribe((response) => {
      if (response.success) {
        this.paymentTypesArr = response.txnTypes;
      }
    });
  }
  getCurrentShiftInfo() {
    this.tollscreenService.getCurrentShiftInfo().subscribe((response) => {
      if (response.success) {
        this.currentShiftInfo = response;
        this.currentShiftInfo = this.currentShiftInfo.userDetails;
        if (this.currentShiftInfo) {
          this.shiftStartTime = new Date(this.currentShiftInfo.shiftStartTime).toString().split(' ').slice(4, 5).join(' ');
          this.shiftEndTime = new Date(this.currentShiftInfo.shiftEndTime).toString().split(' ').slice(4, 5).join(' ');
          this.setToHappen(this.currentShiftInfo.shiftEndTime);
        }
      }
    });
  }
  setToHappen(endTime) {
    const now = new Date().getTime();
    const timeDiff = endTime - now;
    // 5mins in milliseconds is 300000;
    this.timeBeforeExpireSession = timeDiff - 300000;
    // setTimeout(() => this.openShiftEndsDialog(), this.timeBeforeExpireSession);
    // shift comes to an end
    setTimeout(() => this.toasterService.pop('warning', '', 'Shift will end in 5 mins.'), this.timeBeforeExpireSession);
    setTimeout(() => this.timeShiftEnds(), timeDiff);
  }
  timeShiftEnds() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  showTime() {
    const date = new Date();
    this.currentDate = date.toDateString();
    let h, m, s, ms;
    h = date.getHours(); // 0 - 23
    m = date.getMinutes(); // 0 - 59
    s = date.getSeconds(); // 0 - 59
    ms = date.getMilliseconds(); // 0 - 59
    if (h === 0) {
      h = 12;
    }
    h = (h < 10) ? '0' + h : h;
    m = (m < 10) ? '0' + m : m;
    s = (s < 10) ? '0' + s : s;
    // const time = h + ':' + m + ':' + s + ' ' + session;
    const time = h + ':' + m + ':' + s + ':' + ms;
    this.currentTime = time;
    setTimeout(() => this.showTime(), 1000);
  }
  getAllLaneTxnsInfo() {
    const filter: any = {};
    this.perPageLaneTxnObj = {
      page: {
        pageNumber: 0,
        pageSize: 1
      },
      sessionId: this.authService.getSessionId(),
      filter: {
        laneName: null,
        shiftName: null,
        fareType: null,
        createdBy: null
      }
    };
    this.tollscreenService.getAllLaneTxns(this.perPageLaneTxnObj).subscribe((response) => {
      this.allLaneTxnsInfo = response;
      if (this.allLaneTxnsInfo.success) {
        this.listLaneTxnsError = '';
        this.allLaneTxnsInfoArr = this.allLaneTxnsInfo.txnInfo.content;
        this.allLaneTxnsInfoArr.forEach((laneTxn, index) => {
          const dateobj = new Date(laneTxn.creationDate);
          const properdate = this.pad(dateobj.getDate()) + '/' + this.pad(dateobj.getMonth() + 1) + '/' + dateobj.getFullYear();
          const properTime = this.pad(dateobj.getHours()) + ':' + this.pad(dateobj.getMinutes()) + ':' + this.pad(dateobj.getSeconds()) + ':' + this.pad(dateobj.getMilliseconds());
          laneTxn.creationDate = properdate + ' ' + properTime;
          if (laneTxn.originalFareType === 'VIOLATION') {
            laneTxn.vehicleNumber = 'N/A';
          }
          if (laneTxn.vehicleNumber === null || laneTxn.vehicleNumber === 'null') {
            laneTxn.vehicleNumber = 'N/A';
          }
        });
      } else {
        this.listLaneTxnsError = this.allLaneTxnsInfo.description;
      }
    }, err => {
      this.listLaneTxnsError = 'Error in fetching Lane Transactions';
    });
  }
  pad(n) { return n < 10 ? '0' + n : n; }
  onSmartcardBtnClick() {
    this.toasterService.pop('warning', '', 'Please swipe the SMARTCARD to proceed');
    if (this.isSCBtnClicked === false) {
      this.SCDevice.nativeElement.value = '';
      this.isSCBtnClicked = true;
      this.processSmartCard();
      this.isBarcodeBtnClicked = false;
      this.isBarcodeBtnClick = false;
    }
  }
  toggleExemptEmergencyBtn() {
    this.tollscreenService.getVehicleFare().subscribe((response) => {
      // console.log(response);
      if (response.success) {
        this.vehicleInfo = response.vehicleFareInfoList;
        this.vechiclesWithExempt = this.vehicleInfo.filter(function (event) {
          return event.paymentType === 'EXEMPT';
        });
        this.vechiclesWithExempt.forEach((item, index) => {
          if (item.vehicleType === 'Car') {
            this.vehicleEntityId = item.id;
          }
        });
        this.getTheExemptPaymentTypes();
      }
    });
  }
  getTheExemptPaymentTypes() {
    this.tollscreenService.getThePaymentTypes().subscribe((response) => {
      if (response.success) {
        this.exemptEmgypaymentTypesArr = response.txnTypes;
        this.exemptEmgypaymentTypesArr.forEach((item, index) => {
          if (item.paymentMethod === 'EXEMPT') {
            this.exemptEmgypaymentTypeId = item.id;
          }
        });
        this.exemptOtherList();
      }
    });
  }
  exemptOtherList() {
    this.tollscreenService.getExemptOthersList().subscribe((response) => {
      if (response.success) {
        this.exemptOthersArrEmgy = response.subTypeInfo;
        this.exemptOthersArrEmgy.forEach((item, index) => {
          if (item.key === 'Others') {
            this.exemptId = item.exemptOtherEntityId;
          }
        });
        this.createExemptEmgy();
      }
    });
  }
  createExemptEmgy() {
    this.exemptEmgyObj = {
      sessionId: this.authService.getSessionId(),
      vehicleTypeId: this.vehicleEntityId,
      vehicleNumber: null,
      paymentTypeId: this.exemptEmgypaymentTypeId,
      exempt: 'exempt',
      exemptType: 'Other',
      exemptOtherEntityId: this.exemptId,
      imageData: new Blob(),
      description: 'Exempt Emergency'
    };
    // console.log(this.exemptEmgyObj);
    this.tollscreenService.createLaneTxn(this.exemptEmgyObj, this.isTowedTxn)
      .toPromise().then((response: HttpResponse<any>) => {
        // console.log(response);
        const resSTR = JSON.stringify(response);
        const resultt = JSON.parse(resSTR);
        // console.log(resultt);
        if (resultt.body.success === true) {
          this.disableFinishTxnBtn = true;
          this.isActiveVehicleExit = false;
          this.resetLaneForm();
          this.isViolationActive = false;
          this.laneTransactionInfo = resultt.body.txnDetails;
          // console.log(this.laneTransactionInfo);
          this.toasterService.pop('success', '', resultt.body.description);
          this.laneFormResponse = { success: true, message: 'Exempt Emergency Lane transaction successful!' };
          this.gateImgSrc = 'assets/images/toll-open.svg';
          this.signalImgSrc = 'assets/images/greenLight.png';
          this.getAllLaneTxnsInfo();
          setTimeout(() => {
            this.laneFormResponse = { success: false, message: '' };
          }, 1000);
          setTimeout(() => {
            this.noVehicleSelect = true;
          }, 2000);
        } else {
          this.laneFormResponse = { success: false, message: this.laneTransactionInfo.description };
          setTimeout(() => {
            this.laneFormResponse = { success: false, message: '' };
          }, 1000);
          // this.toasterService.pop('error','',resultt.body.description);
          this.isViolationActive = false;
          this.disableFinishTxnBtn = false;
          this.isActiveVehicleExit = false;
        }
      }, err => {
        this.laneFormResponse = { success: false, message: err.message };
        setTimeout(() => {
          this.laneFormResponse = { success: false, message: '' };
        }, 500);
        // this.toasterService.pop('error','',err.message);
        this.resetLaneForm();
        this.isViolationActive = false;
        this.disableFinishTxnBtn = false;
        this.isActiveVehicleExit = false;
      });
  }
  onSCSubmit() {
    if (this.laneForm.controls.vehicleNumber.value !== '' && this.activeSubmitBtn === false) {
      this.getCardInfoByVehicleNo(this.laneForm.controls.vehicleNumber.value.toUpperCase().trim());
    } else {
      this.toasterService.pop('warning', '', 'Please swipe the SMARTCARD to proceed');
      this.processSmartCard();
    }
  }
  resetOHLSFunc() {
    this.tollscreenService.resetOHLS()
      .subscribe((response) => {
        this.resetOHLSResp = response;
        if (response.success) {
          this.toasterService.pop('success', '', response.description);
        }
      });
  }
  getCardInfoByVehicleNo(vehicleNumber) {
    this.tollscreenService.getCardInfoByVehicleNo(vehicleNumber)
      .subscribe((response) => {
        this.activeSCInfo = response;
        if (response.success) {
          this.SCReadResponse = response.smartCardDetailInfo;
          this.openSCInfoDialog(this.SCReadResponse);
        } else {
          setTimeout(() => this.toasterService.pop('warning', '', 'Please swipe the SMARTCARD to proceed'), 2000);
          this.processSmartCard();
        }
      });
  }
  processSmartCard() {
    const SCReadObj: any = {};
    if (this.laneForm.controls['vehicleNumber'].value !== '') {
      SCReadObj.vehicleNumber = this.laneForm.controls['vehicleNumber'].value.toUpperCase().trim();
    } else {
      this.toasterService.pop('error', '', 'Vehicle Number field cannot be left blank');
      return;
    }
    if (this.SCDevice.nativeElement.value !== '') {
      SCReadObj.cardSrNumber = this.SCDevice.nativeElement.value.trim();
    } else {
      SCReadObj.cardSrNumber = null;
    }
    SCReadObj.sessionId = this.authService.getSessionId();
    this.tollscreenService.readSmartCard(SCReadObj).subscribe((response) => {
      if (response.success) {
        this.SCReadResponse = response.smartCardDetailInfo;
        this.openSCInfoDialog(this.SCReadResponse);
      } else {
        if (response.errorCode !== 98) {
          // this.toasterService.pop('error', '', response.description);
          this.isSCBtnClicked = false;
          this.barcodeDevice.nativeElement.value = '';
        }
      }
    });
  }
  refreshFun() {
    this.refreshButton = true;
    this.getLiveCamUrl();
  }
  lettersOnly(evt) {

    evt = (evt) ? evt : window.event;
    const charCode = (evt.which) ? evt.which : evt.keyCode;
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode === 8) {
      return true;
    }
    return false;
  }
  lettersAndNumbersOnly(evt) {
    console.log('key events', evt, evt.which, evt.keyCode, evt.key, evt.keyIdentifier);
    evt = (evt) ? evt : window.event;
    const charCode = (evt.which) ? evt.which : evt.keyCode;
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || (charCode > 47 && charCode < 58) || charCode === 51) {
      return true;
    }
    return false;
  }
  onlyNumber(evt) {
    evt = (evt) ? evt : window.event;
    const charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  vehicleTypechange(event, vehicle) {
    this.laneForm.setControl('journeyTypesBtns', this.fb.array([]));
    this.laneForm.setControl('paymentTypesBtns', this.fb.array([]));
  }
  selectedPaymentType(paymentMethod) {
    this.newPaymentMethod = paymentMethod;
    const paymentTypesBtns = this.laneForm.get('paymentTypesBtns') as FormArray;
    paymentTypesBtns.controls.forEach((element: any) => {
      if (element.value === paymentMethod) {
        element.touched = true;
        element.clickedBtn = 'YES';
      } else {
        element.clickedBtn = 'NO';
        element.touched = false;
      }
    });
    this.sendUFDUpdates(this.vehicleTypeCopy, 'VEHICLE_PAYMENT_METHOD_AND_FARE_TYPE', this.newFareType, paymentMethod);
    this.vehicleInfo.forEach((vehicle, index) => {
      if (vehicle.fareType === this.newFareType && vehicle.paymentType === paymentMethod && vehicle.vehicleType === this.vehicleTypeCopy) {
        this.newVehicleFare = vehicle.fare;
      }
    });
  }
  // on click of vehicle type event
  getTheFareOfVehicle(vehicleType) {
    const vehicles = this.laneForm.get('vehicleTypes') as FormArray;
    vehicles.controls.forEach((element: any) => {
      if (element.value === vehicleType) {
        element.touched = true;
        element.clickedBtn = 'YES';
      } else {
        element.clickedBtn = 'NO';
        element.touched = false;
      }
    });
    this.laneForm.setControl('journeyTypesBtns', this.fb.array([]));
    this.laneForm.setControl('paymentTypesBtns', this.fb.array([]));
    this.newFareType = '';
    this.newPaymentMethod = '';
    if (vehicleType === 'TractorCommercial') {
      this.isTrctComSelected = true;
    } else {
      this.isTrctComSelected = false;
    }
    this.vehicleTypeCopy = vehicleType;
    this.isExempt = false;
    this.hideOpClass = false;
    this.paymentTypes = [];
    this.newVehicleFare = 0.00;
    this.sendUFDUpdates(this.vehicleTypeCopy, 'ONLY_VEHICLE_TYPE', null, null);
    // console.log(vehicleType);
    this.newVehicleType = vehicleType;
    this.getDistinctFareTypes(vehicleType);
  }
  getDistinctFareTypes(vehicleType) {
    this.tollscreenService.getDistinctFareTypes(vehicleType)
      .subscribe((response) => {
        if (response.success) {
          this.newFareTypes = response.fareTypes;
          this.newFareTypes = this.newFareTypes.filter(function (event) {
            return event !== 'DailyPassReturn';
          });
          if (this.newFareTypes.length === 1 && this.newFareTypes[0] === 'FreeJourney') {
            this.getPaymentType(vehicleType, this.newFareTypes[0]);
          }
          this.createJourneyTypeArr();
          const journeyTypesBtns = this.laneForm.get('journeyTypesBtns') as FormArray;
          journeyTypesBtns.controls.forEach((element: any) => {
            element.touched = false;
          });
        }
      });
  }
  createJourneyTypeArr() {
    for (let i = 0; i < this.newFareTypes.length; i++) {
      const control = <FormArray>this.laneForm.controls['journeyTypesBtns'];
      // push the value from stepTextArea to array
      control.push(new FormControl(this.newFareTypes[i]));
    }
  }
  getPaymentType(vehicleType, fareType) {
    this.tollscreenService.getDistinctPaymentTypes(vehicleType, fareType)
      .subscribe((response) => {
        if (response.success) {
          this.paymentTypes = response.paymentTypes;
          this.hideOpClass = false;
          if (fareType === 'EXEMPT') {
            this.newPaymentMethod = 'EXEMPT';
            this.isExempt = true;
            this.newFareType = 'EXEMPT';
            this.newVehicleFare = 0;
            this.hideOpClass = false;
            this.laneForm.controls.exemptSubType.setValue('');
            this.laneForm.controls.exemptType.setValue('');
            this.laneForm.controls['exemptType'].setValidators(Validators.required);
            this.laneForm.controls['exemptType'].updateValueAndValidity();
            this.disableFinishTxnBtn = false;
          } else {
            this.laneForm.controls['exemptType'].clearValidators();
            this.laneForm.controls['exemptType'].updateValueAndValidity();
            this.isExempt = false;
            if (this.paymentTypes.length === 1 && this.paymentTypes[0] === 'FREE') {
              this.paymentTypesArr.forEach((item, index) => {
                if (item.paymentMethod === 'FREE') {
                  this.paymentTypeId = item.id;
                }
              });
            }
            if (this.isActiveVehicleExit === true) {
              this.disableFinishTxnBtn = false;
            } else {
              this.disableFinishTxnBtn = true;
            }
          }
          this.createPaymentTypeArr();
          const paymentTypesBtns = this.laneForm.get('paymentTypesBtns') as FormArray;
          paymentTypesBtns.controls.forEach((element: any) => {
            element.touched = false;
          });
        }
      });
  }
  createPaymentTypeArr() {
    for (let i = 0; i < this.paymentTypes.length; i++) {
      const control = <FormArray>this.laneForm.controls['paymentTypesBtns'];
      // push the value from stepTextArea to array
      control.push(new FormControl(this.paymentTypes[i]));
    }
  }
  selectedFareType(fareType) {
    this.newVehicleFare = 0.00;
    this.newFareType = fareType;
    const journeyTypesBtns = this.laneForm.get('journeyTypesBtns') as FormArray;
    journeyTypesBtns.controls.forEach((element: any) => {
      if (element.value === fareType) {
        element.touched = true;
        element.clickedBtn = 'YES';
      } else {
        element.touched = false;
        element.clickedBtn = 'NO';
      }
    });
    this.sendUFDUpdates(this.vehicleTypeCopy, 'VEHICLE_AND_FARE_TYPE', fareType.value, null); this.laneForm.setControl('paymentTypesBtns', this.fb.array([]));
    this.newPaymentMethod = '';
    this.getPaymentType(this.newVehicleType, fareType);
  }
  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'sm' });
  }
  openLogoutDialog(): void {
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(LogoutComponent, {
        width: '300px',
        disableClose: true
      });
    } else {
      return;
    }
  }
  openFreeDialog(optionValue?) {
    this.paymentTypesArr.forEach((item, index) => {
      if (item.paymentMethod === 'FREE') {
        this.paymentTypeId = item.id;
      }
    });
    if (optionValue !== undefined) {
      this.freeVehicleTypeValue = optionValue;
    } else {
      this.freeVehicleTypeValue = '';
    }
    this.isFreeTxnsOn = true;
    if (this.isTowedTxn === true) {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    } else {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    }
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(FreeTxnsComponent, {
        disableClose: true,
        width: '500px',
        position: {
          top: '227px',
          left: '540px'
        },
        data: {
          freeVehicleTypeValue: this.freeVehicleTypeValue,
          vehicleNumber: this.laneForm.controls.vehicleNumber.value,
          paymentTypeId: this.paymentTypeId,
          vehiclesWithFreeTxnArr: this.vehiclesWithFreeTxn,
          isActiveVehicleExit: this.isActiveVehicleExit,
          isTowed: this.isTowedTxn
        }
      });
      const sub = dialogRef.componentInstance.onAdd.subscribe((data) => {
        if (data.success) {
          if (this.isTowedTxn) {
            this.disableFinishTxnBtn = false;
            this.collectTowedTxn(data.txnDetails.transactionId);
            this.toasterService.pop('success', '', data.description);
          } else {
            this.gateImgSrc = 'assets/images/toll-open.svg';
            this.signalImgSrc = 'assets/images/greenLight.png';
            this.getAllLaneTxnsInfo();
            this.toasterService.pop('success', '', data.description);
            this.isActiveVehicleExit = false;
            this.disableFinishTxnBtn = true;
          }
        }
        this.resetLaneForm();
        this.isViolationActive = false;
      });
      dialogRef.afterClosed().subscribe(response => {
        this.isFreeTxnsOn = false;
      });
    } else {
      return;
    }
  }
  getDateFormat() {
    const date: any = new Date();
    const aaaa: any = date.getFullYear();
    let gg: any = date.getDate();
    let mm: any = (date.getMonth() + 1);
    if (gg < 10) {
      gg = '0' + gg;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    const cur_day = aaaa + '-' + mm + '-' + gg;
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return cur_day + ' ' + hours + ':' + minutes + ':' + seconds;
  }
  replaceAt(string, index, replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
  }
  numberOfVehicles(fleetVehicleNo) {
    this.noInputEntered = false;
    this.fleetVehicleCount = fleetVehicleNo;
  }
  toggleFleetBtn() {
    if (this.isActiveVehicleExit === true) {
      this.isActiveVehicleExit = true;
    } else {
      this.isActiveVehicleExit = false;
    }
    this.laneForm.controls.vehicleNumber.setValue('');
    this.laneForm.disable();

    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(FleetTxnComponent, {
        width: '390px',
        disableClose: true,
        data: {
          isActiveVehicleExit: this.isActiveVehicleExit
        },
        position: {
          top: '235px',
          left: '650px'
        }
      });

      const subInitiate = dialogRef.componentInstance.onFleetInitaite.subscribe((data) => {
        if (data.success) {
          this.getAllLaneTxnsInfo();
          this.gateImgSrc = 'assets/images/toll-open.svg';
          this.signalImgSrc = 'assets/images/greenLight.png';
          this.isActiveVehicleExit = false;
          this.disableFinishTxnBtn = true;
        } else {
          this.toasterService.pop('error', '', data.description);
        }
        this.resetLaneForm();
        this.isViolationActive = false;
      });
      const sub = dialogRef.componentInstance.onFleetTypeAdd.subscribe((data) => {
        if (data.success) {
          this.laneForm.enable();
          this.gateImgSrc = 'assets/images/toll-closed.svg';
          this.signalImgSrc = 'assets/images/redLight.png';
          this.getAllLaneTxnsInfo();
          this.disableFinishTxnBtn = false;
          this.isActiveVehicleExit = true;
          this.toasterService.pop('success', '', data.description);
          // } else {
          //     this.toasterService.pop('error','',data.description);
        }
        this.resetLaneForm();
        this.isViolationActive = false;
      });
      dialogRef.afterClosed().subscribe(response => {
        this.laneForm.enable();
      });
    } else {
      return;
    }
  }
  toggleTowedBtn() {
    if (this.isExempt === true) {
      this.disableFinishTxnBtn = false;
    } else {
      this.disableFinishTxnBtn = true;
    }
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(TowedTxnComponent, {
        width: '385px',
        disableClose: true,
        position: {
          top: '235px',
          left: '650px'
        }
      });
      const sub = dialogRef.componentInstance.onTowedTypeAdd.subscribe((data) => {
        if (data.success) {
          this.isTowedTxn = true;
          this.TowedStatus = 'Towed Started';
          this.towedVehCount = data.info.towedInitVehicleCount;
          this.towedVehicleEntityId = data.info.towedVehicleEntityId;
          // } else {
          //   this.toasterService.pop('error','',data.description);
        }
        this.isViolationActive = false;
        this.resetLaneForm();
      });
    } else {
      return;
    }
  }
  getExemptSubTypes() {
    this.tollscreenService.getExemptSubTypes().subscribe((response) => {
      if (response.success) {
        this.exemptSubTypesInfo = response;
        this.exemptSubTypesArr = this.exemptSubTypesInfo.subTypeInfo;
      }
    });
  }
  onExemptSubTypeChange() {
    this.exemptSubTypesSelected = true;
  }
  onExemptTypeChange(exemptType: string) {
    this.exemptOthersArr = [];
    this.exemptEmergencyArr = [];
    // console.log(exemptType);
    this.laneForm.controls['exemptSubType'].setValue('');
    if (exemptType !== 'exemptArmy') {
      this.exemptTypeSelected = false;
      this.hideOpClass = true;
      this.exemptTypeText = exemptType;
      this.laneForm.controls['exemptSubType'].setValidators(Validators.required);
      this.laneForm.controls['exemptSubType'].updateValueAndValidity();
      if (exemptType === 'Emergency') {
        this.exemptOthersArr = [];
        this.tollscreenService.getExemptEmergencyList()
          .subscribe((response) => {
            if (response.success) {
              this.exemptEmergencyArr = response.exemptEmergencies;
            }
          });
      } else {
        this.exemptEmergencyArr = [];
        this.tollscreenService.getExemptOthersList()
          .subscribe((response) => {
            if (response.success) {
              this.exemptOthersArr = response.subTypeInfo;
            }
          });
      }
    } else {
      this.laneForm.controls['exemptSubType'].clearValidators();
      this.laneForm.controls['exemptSubType'].updateValueAndValidity();
      this.exemptSubTypesSelected = false;
      this.exemptTypeSelected = true;
      this.exemptTypeText = '';
      this.hideOpClass = false;
    }
  }
  sendUFDUpdates(vehicleType?, ufdTriggerTypes?, fareType?, paymentType?) {
    const ufdTriggerObj = {
      sessionId: this.authService.getSessionId(),
      vehicleType: vehicleType,
      ufdTriggerTypes: ufdTriggerTypes,
      fareType: fareType,
      paymentTypeEnum: paymentType
    };
    this.tollscreenService.sendTriggerUFDUpdates(ufdTriggerObj).subscribe((response) => {
      if (response.success) {
        this.ufdTriggerResponse = response;
      }
    });
  }
  getVehicleName(event) {
    const vehicleType = event.srcElement.innerHTML;
    this.sendUFDUpdates(vehicleType, 'ONLY_VEHICLE_TYPE', null, null);
    // console.log(vehicleType);
    this.laneFormResponse.message = '';
    this.noVehicleSelect = false;
    this.laneForm.enable();
    this.vehicleNumber.nativeElement.focus();
    this.vehicleTypeCopy = vehicleType;
    // when by default payment method is cash is selected
    if (this.journeyType === 'SJ') {
      if (this.newPaymentMethod === 'CASH') {
        this.vehiclesOnCashList.forEach((vehicle, index) => {
          if (vehicle.vehicleType === vehicleType) {
            this.cashFare = vehicle.fare;
          }
        });
      } else if (this.newPaymentMethod === 'EXEMPT') {
        this.vechiclesWithExempt.forEach((vehicle, index) => {
          if (vehicle.vehicleType === vehicleType) {
            this.cashFare = vehicle.fare;
          }
        });
      } else if (this.newPaymentMethod === 'CARD') {
        this.vehiclesWithCards.forEach((vehicle, index) => {
          if (vehicle.vehicleType === vehicleType) {
            this.cashFare = vehicle.fare;
            // console.log(this.cashFare);
          }
        });
      } else if (this.newPaymentMethod === 'PAYTM') {
        this.vehiclesWithPaytm.forEach((vehicle, index) => {
          if (vehicle.vehicleType === vehicleType) {
            this.cashFare = vehicle.fare;
            // console.log(this.cashFare);
          }
        });
      } else {
        // console.log('smart card');
      }
    }
  }
  checkForVehicleFare(vehicleTypeArr) {
    vehicleTypeArr.forEach(vehicle => {
      if (vehicle.vehicleType === this.vehicleTypeCopy) {
        this.cashFare = vehicle.fare;
      }
    });
  }
  submitTxnDetails(e) {
    // console.log(this.newPaymentMethod);
    e.preventDefault();
    if (this.laneForm.invalid) {
      if (this.laneForm.controls.vehicleNumber.value === '') {
        // this.disableFinishTxnBtn=true;
        this.toasterService.pop('error', '', 'Please enter the Vehicle Number');
      }
      return;
      // console.log('is form invalid ');
    }
    if (this.vehicleTypeCopy === '') {
      this.toasterService.pop('error', '', 'Please enter the Vehicle Type');
      // this.disableFinishTxnBtn=true;
      return;
    } else if (this.newFareType === '') {
      // this.disableFinishTxnBtn=true;
      this.toasterService.pop('error', '', 'Please enter the Journey Type');
      return;
    } else if (this.newPaymentMethod === '') {
      // this.disableFinishTxnBtn=true;
      this.toasterService.pop('error', '', 'Please enter the Payment Type');
      return;
    } else {
      // this.disableFinishTxnBtn=false;
      if (this.newFareType === 'EXEMPT') {
        this.vechiclesWithExempt.forEach(vehicle => {
          this.newPaymentMethod = 'EXEMPT';
          if (vehicle.vehicleType === this.vehicleTypeCopy && vehicle.paymentType === this.newPaymentMethod) {
            this.vehicleTypeId = vehicle.id;
            // console.log(this.vehicleTypeId);
          }
        });
        this.paymentTypesArr.forEach((item, index) => {
          if (item.paymentMethod === 'EXEMPT') {
            this.paymentTypeId = item.id;
          }
        });
        this.exemptObj = {
          sessionId: this.authService.getSessionId(),
          vehicleTypeId: this.vehicleTypeId,
          vehicleNumber: this.laneForm.controls.vehicleNumber.value.toUpperCase().trim(),
          amountBalance: 0,
          amountTaken: 0,
          paymentTypeId: this.paymentTypeId,
          exempt: 'exempt',
          exemptType: this.laneForm.controls.exemptType.value,
          description: this.laneForm.controls.description.value
        };
        if (this.isTowedTxn === true) {
          this.exemptObj.towedVehicle = true;
        }
        if (this.exemptEmergencyArr.length > 0) {
          this.exemptObj.exemptEmergencyEntityId = this.laneForm.controls.exemptSubType.value;
        } else if (this.exemptOthersArr.length > 0) {
          this.exemptObj.exemptOtherEntityId = this.laneForm.controls.exemptSubType.value;
        } else {
          this.exemptObj.exemptArmy = 'Army';
        }
        this.authService.setExemptSnap(this.exemptObj);
        if (this.exemptSubTypesSelected === true || this.exemptTypeSelected === true) {
          this.openTollExemptDialog();
          return true;
        }
      }
      if (this.newFareType !== 'EXEMPT') {
        if (this.newPaymentMethod !== 'FREE') {
          this.paymentTypesArr.forEach((item, index) => {
            if (item.paymentMethod === this.newPaymentMethod) {
              this.paymentTypeId = item.id;
            }
          });
        }
        if (this.newPaymentMethod === 'CASH') {
          this.vehiclesOnCashList.forEach(vehicle => {

            if (vehicle.vehicleType === this.vehicleTypeCopy && vehicle.paymentType === this.newPaymentMethod && vehicle.fareType === this.newFareType) {
              this.vehicleTypeId = vehicle.id;
            }
          });
        } else if (this.newPaymentMethod === 'PAYTM') {
          this.vehiclesWithPaytm.forEach(vehicle => {

            if (vehicle.vehicleType === this.vehicleTypeCopy && vehicle.paymentType === this.newPaymentMethod && vehicle.fareType === this.newFareType) {
              this.vehicleTypeId = vehicle.id;
            }
          });
        } else if (this.newPaymentMethod === 'CARD') {
          this.vehiclesWithCards.forEach(vehicle => {

            if (vehicle.vehicleType === this.vehicleTypeCopy && vehicle.paymentType === this.newPaymentMethod && vehicle.fareType === this.newFareType) {
              this.vehicleTypeId = vehicle.id;
            }
          });
        } else {

        }
        const objToClone = {
          sessionId: this.authService.getSessionId(),
          vehicleTypeId: this.vehicleTypeId,
          vehicleNumber: this.laneForm.controls.vehicleNumber.value.toUpperCase().trim(),
          amountBalance: 0,
          amountTaken: 0,
          paymentTypeId: this.paymentTypeId,
          imageData: new Blob(),
          description: this.laneForm.controls.description.value
        };
        // console.log(objToClone);
        Object.assign(this.createLaneTxnObj, objToClone);
        this.tollscreenService.createLaneTxn(this.createLaneTxnObj, this.isTowedTxn)
          .toPromise().then((response: HttpResponse<any>) => {
            // this.laneTransactionInfo = response;
            // console.log(response);
            const resSTR = JSON.stringify(response);
            const resultt = JSON.parse(resSTR);
            // console.log(resultt);
            if (resultt.body.success === true) {
              this.isViolationActive = false;
              this.laneTransactionInfo = resultt.body.txnDetails;
              // console.log(this.laneTransactionInfo);
              this.toasterService.pop('success', '', resultt.body.description);
              this.laneFormResponse = { success: true, message: 'Lane transaction successful!' };
              this.getAllLaneTxnsInfo();
              if (this.isTowedTxn) {
                this.disableFinishTxnBtn = false;
                // console.log("this is towed Transaction");
                this.collectTowedTxn(this.laneTransactionInfo.transactionId);
              } else {
                this.gateImgSrc = 'assets/images/toll-open.svg';
                this.signalImgSrc = 'assets/images/greenLight.png';
                this.isActiveVehicleExit = false;
                this.disableFinishTxnBtn = true;
              }
              setTimeout(() => {
                this.laneFormResponse = { success: false, message: '' };
              }, 1000);
              setTimeout(() => {
                this.noVehicleSelect = true;
              }, 2000);
              return;
            } else {
              this.laneFormResponse = { success: false, message: this.laneTransactionInfo.description };
              setTimeout(() => {
                this.laneFormResponse = { success: false, message: '' };
              }, 1000);
              this.toasterService.pop('error', '', resultt.body.description);
              this.isViolationActive = false;
              this.disableFinishTxnBtn = false;
              this.isActiveVehicleExit = false;
            }
          }, err => {
            this.laneFormResponse = { success: false, message: err.message };
            // console.log('error in making a lane transaction');
            setTimeout(() => {
              this.laneFormResponse = { success: false, message: '' };
            }, 500);
            // this.toasterService.pop('error','',err.message);
            this.isViolationActive = false;
            this.disableFinishTxnBtn = false;
            this.isActiveVehicleExit = false;
          });
        this.resetLaneForm();
      } else {
        const payload = {
          sessionId: this.authService.getSessionId(),
          smartCardMasterId: this.socketRecievedInfo.scMasterId
        };
        this.tollscreenService.createSCTxn(payload, this.isTowedTxn).subscribe((response) => {
          this.laneTransactionInfo = response;
          if (this.laneTransactionInfo.success) {
            this.laneFormResponse = { success: true, message: 'Smart Card Transaction successful' };
            setTimeout(() => {
              this.noVehicleSelect = true;
            }, 2000);
            this.getAllLaneTxnsInfo();
            this.disableFinishTxnBtn = true;
            this.isActiveVehicleExit = false;
            this.resetLaneForm();
            this.isSCIssued = false;
            this.gateImgSrc = 'assets/images/toll-open.svg';
            this.signalImgSrc = 'assets/images/greenLight.png';
            setTimeout(() => {
              this.laneFormResponse = { success: false, message: '' };
            }, 3000);
          } else {
            this.laneFormResponse = { success: false, message: this.laneTransactionInfo.description };
            setTimeout(() => {
              this.laneFormResponse = { success: false, message: '' };
            }, 3000);
          }
          this.isViolationActive = false;
        }, err => {
          this.laneFormResponse = { success: false, message: err.message };
          // console.log('error in making a smart card transaction');
          setTimeout(() => {
            this.laneFormResponse = { success: false, message: '' };
          }, 3000);
          this.isViolationActive = false;
        });
      }
    }
  }
  collectTowedTxn(id) {
    // this.isActiveVehicleExit=false;
    this.towedTxnArray.push(id);
    if (this.towedTxnArray.length === 1) {
      this.finishTowed = true;
    }
    if (this.towedTxnArray.length === this.towedVehCount) {

      this.laneForm.disable();
      this.isActiveVehicleExit = true;
      this.disableFinishTxnBtn = true;
      this.toasterService.pop('success', '', 'Towed Transactions are completed click towed finish button');

    }
  }
  finishTowedTxnFun() {
    if (this.towedTxnArray.length === 0) {
      return;
    }
    // console.log("this is finish towed txn function");
    const towedTxnObj = {
      sessionId: this.authService.getSessionId(),
      towedVehicleEntityId: this.towedVehicleEntityId,
      listOfTxns: this.towedTxnArray
    };
    this.tollscreenService.finishTowedTxn(towedTxnObj).subscribe((response) => {
      if (response.success) {
        this.isTowedTxn = false;
        this.finishTowedErr = false;
        this.finishTowed = false;
        this.gateImgSrc = 'assets/images/toll-open.svg';
        this.signalImgSrc = 'assets/images/greenLight.png';
        this.toasterService.pop('success', '', 'TowedTxn Finished');
        this.towedTxnArray = [];
        this.laneForm.enable();
        this.disableFinishTxnBtn = true;
      } else {
        this.towedResponse = response;
        this.towedResponse.message = response.description;

      }
      //  }, err=>{
      //       this.toasterService.pop('error','',err.description);
    });
    this.isActiveVehicleExit = false;
    this.resetLaneForm();
  }
  openTollExemptDialog(): void {
    if (this.isTowedTxn === true) {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    } else {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    }
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(TollExemptsComponent, {
        width: '650px',
        disableClose: true,
        data: {
          isActiveVehicleExit: this.isActiveVehicleExit,
          isTowed: this.isTowedTxn
        }
      });
      const sub = dialogRef.componentInstance.onExempt.subscribe((data) => {
        if (data.success) {
          if (this.isTowedTxn) {
            this.disableFinishTxnBtn = false;
            this.collectTowedTxn(data.txnDetails.transactionId);
            this.laneFormResponse = { success: true, message: 'Exempt transaction successful!' };
          } else {
            this.laneFormResponse = { success: true, message: 'Exempt transaction successful!' };
            this.disableFinishTxnBtn = true;
            this.isActiveVehicleExit = false;
            this.getAllLaneTxnsInfo();
            this.gateImgSrc = 'assets/images/toll-open.svg';
            this.signalImgSrc = 'assets/images/greenLight.png';
          }
          setTimeout(() => {
            this.laneFormResponse = { success: false, message: '' };
          }, 3000);
          this.toasterService.pop('success', '', data.description);
        } else {
          // this.toasterService.pop('error','',data.description);
          this.disableFinishTxnBtn = false;
        }
        this.resetLaneForm();
        this.isViolationActive = false;
      });
    } else {
      return;
    }
  }
  openShiftEndsDialog(): void {
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(ShiftEndsAlertComponent, {
        width: '300px',
        disableClose: true
      });
    } else {
      return;
    }
  }
  resetLaneForm() {
    const vehicles = this.laneForm.get('vehicleTypes') as FormArray;
    vehicles.controls.forEach((element: any) => {
      element.touched = false;
    });
    const journeyTypesBtns = this.laneForm.get('journeyTypesBtns') as FormArray;
    journeyTypesBtns.controls.forEach((element: any) => {
      element.touched = false;
    });
    const paymentTypesBtns = this.laneForm.get('paymentTypesBtns') as FormArray;
    paymentTypesBtns.controls.forEach((element: any) => {
      element.touched = false;
    });
    this.vehicleNumber.nativeElement.focus();
    this.vehicleTypeCopy = '';
    this.newVehicleFare = 0.00;
    this.isVehicleNoEntered = false;
    this.newFareTypes = [];
    this.paymentTypes = [];
    this.cashFare = '00.00';
    this.isExempt = false;
    this.hideOpClass = false;
    this.exemptSubTypesExists = false;
    this.newPaymentMethod = '';
    this.newFareType = '';
    this.buildForm();
    this.createVehicleTypeArr();
    this.barcodeDevice.nativeElement.value = '';
    this.SCDevice.nativeElement.value = '';
    this.activeSCSubmitBtn = false;
  }
  toUppercase(value) {
    console.log(value.toUpperCase());
  }
  omit_special_char(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k === 32 || (k >= 48 && k <= 57));
  }
  selectedJourneyType($event) {
    const jType = $event.target.value;
    this.journeyType = $event.target.value;
    if (jType === 'SJ') {
      this.isValidateTJKey = false;
      this.vehiclesOnCashList.forEach(vehicle => {
        if (vehicle.vehicleType === this.vehicleTypeCopy) {
          this.cashFare = vehicle.fare;
        }
      });
      this.vehiclesList = this.vehiclesOnCashList;
    }
  }
  openSCInfoDialog(SCInfo) {
    if (this.isTowedTxn === true) {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    } else {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    }
    //  console.log(this.isTowedTxn);
    //  console.log(this.isActiveVehicleExit);
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(SCInfoComponent, {
        disableClose: true,
        width: '400px',
        position: {
          top: '233px',
          left: '590px'
        },
        data: {
          SCInfoResp: SCInfo,
          vehicleNumber: this.laneForm.controls.vehicleNumber.value.toUpperCase().trim(),
          isActiveVehicleExit: this.isActiveVehicleExit,
          isTowed: this.isTowedTxn
        }
      });
      const sub = dialogRef.componentInstance.onSCInfoResp.subscribe((data) => {
        if (data.description === 'close') {
          this.SCDevice.nativeElement.value = '';
          return;
        }
        if (data.success) {
          if (this.isTowedTxn) {
            this.disableFinishTxnBtn = false;
            this.collectTowedTxn(data.txnDetails.transactionId);
            this.toasterService.pop('success', '', data.description);
          } else {
            this.getAllLaneTxnsInfo();
            this.gateImgSrc = 'assets/images/toll-open.svg';
            this.signalImgSrc = 'assets/images/greenLight.png';
            this.toasterService.pop('success', '', data.description);
            this.isActiveVehicleExit = false;
            this.disableFinishTxnBtn = true;
          }
          this.isSCBtnClicked = false;
          this.showDialog = false;
          this.resetLaneForm();
          // }else{
          //   this.toasterService.pop('error','',data.description);
        }
        this.isViolationActive = false;
        this.SCDevice.nativeElement.value = '';
      });
    } else {
      return;
    }
  }
  openBarcodeScannerDialog(barcodeResponse, barcode, vehicleNumber) {
    if (this.isTowedTxn === true) {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    } else {
      if (this.isActiveVehicleExit === true) {
        this.isActiveVehicleExit = true;
      } else {
        this.isActiveVehicleExit = false;
      }
    }
    // console.log(this.isTowedTxn);
    // console.log(this.isActiveVehicleExit);
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(BarcodeScannerComponent, {
        disableClose: true,
        width: '400px',
        height: '280px',
        position: {
          top: '233px',
          left: '590px'
        },
        data: {
          barcodeResp: barcodeResponse,
          barcode: barcode.toUpperCase().trim(),
          vehicleNumber: vehicleNumber.toUpperCase().trim(),
          isActiveVehicleExit: this.isActiveVehicleExit,
          isTowed: this.isTowedTxn
        }
      });
      const sub = dialogRef.componentInstance.onBarcodeResp.subscribe((data) => {
        if (data.description === 'close') {
          this.barcodeDevice.nativeElement.value = '';
          this.activeSubmitBtn = false;
          return;
        }
        if (data.success) {
          if (this.isTowedTxn) {
            this.disableFinishTxnBtn = false;
            this.collectTowedTxn(data.txnDetails.laneTxnDetailEntityId);
            this.toasterService.pop('success', '', data.description);
          } else {
            this.getAllLaneTxnsInfo();
            this.gateImgSrc = 'assets/images/toll-open.svg';
            this.signalImgSrc = 'assets/images/greenLight.png';
            this.toasterService.pop('success', '', data.description);
            this.isActiveVehicleExit = false;
            this.disableFinishTxnBtn = true;
          }
          this.isBarcodeBtnClick = false;
          this.showDialog = false;
          this.resetLaneForm();
          // }else{
          //   this.toasterService.pop('error','',data.description);
        }
        this.isViolationActive = false;
        this.activeSubmitBtn = false;
        this.barcodeDevice.nativeElement.value = '';
      });
    } else {
      return;
    }
  }
  @HostListener('window:keyup', ['$event'])
  handleKeyupEvent(e: KeyboardEvent) {
    if (e.keyCode === 9) {
      // console.log(e);
      const vehicles = this.laneForm.get('vehicleTypes') as FormArray;
      const journeyTypesBtns = this.laneForm.get('journeyTypesBtns') as FormArray;
      const paymentTypesBtns = this.laneForm.get('paymentTypesBtns') as FormArray;
      vehicles.controls.forEach((element: any) => {
        if (element.clickedBtn !== 'YES') {
          element.touched = false;
        }
      });
      journeyTypesBtns.controls.forEach((element: any) => {
        if (element.clickedBtn !== 'YES') {
          element.touched = false;
        }
      });
      paymentTypesBtns.controls.forEach((element: any) => {
        if (element.clickedBtn !== 'YES') {
          element.touched = false;
        }
      });
    }
    if (this.isKeyBrdShrtcts) {
      console.log(e.keyCode);
      console.log('key pressed', e.key);
      if (this.prevKey === 'NumLock') {
        if (e.keyCode === 106) {
          this.openFreeDialog('MotorCycle'); // free
        }
      }
      if (this.prevKey === 'Alt') {
        if (e.keyCode === 40) {
          this.openFreeDialog('MotorCycle'); // free
        }
      }
      if (e.keyCode === 117) {
        this.openFreeDialog('AgricultureTractorWithOutTrailor');
      } else if (e.keyCode === 36) {
        this.openFreeDialog('Auto'); // free
      } else if (e.keyCode === 34) {
        this.openFreeDialog('AgricultureTractorWithTrailor');
      }
      if (e.keyCode === 119) {
        this.toggleFleetBtn(); // convoy
      }
      if (e.keyCode === 219) {
        this.toggleExemptEmergencyBtn(); // Exemptemergency
      }
      if (e.keyCode === 118) {
        if (!this.isTowedTxn) {
          this.toggleTowedBtn(); // Towed
        } else {
          this.finishTowedTxnFun();
        }
      }
      if (e.keyCode === 35) {
        this.openLogoutDialog(); // Logout
      }
      if (e.keyCode === 220) {
        this.dialog.closeAll();
      }
      if (e.keyCode === 19) {
        this.resetOHLSFunc();
      }
      if (e.keyCode === 18) {
        console.log('ghdgfgfgf');
        this.router.navigateByUrl('', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/toll-screen']));
      }
      if (this.laneForm.controls.vehicleNumber.value !== '') {
        if (e.keyCode === 112) {
          this.getTheFareOfVehicle('Car');
        } else if (e.keyCode === 113) {
          this.getTheFareOfVehicle('LCV');
        } else if (e.keyCode === 114) {
          this.getTheFareOfVehicle('Truck2Axle');
        } else if (e.keyCode === 115) {
          this.getTheFareOfVehicle('Bus2Axle');
        } else if (e.keyCode === 116) {
          this.getTheFareOfVehicle('MAVBus');
        } else if (e.keyCode === 189) {
          this.getTheFareOfVehicle('MAVTruck');
        } else if (e.keyCode === 187) {
          this.selectedFareType('CARD');
        } else if (e.keyCode === 188) {
          this.selectedFareType('CASH');
        } else if (e.keyCode === 33) {
          this.getTheFareOfVehicle('Bus3Axle');
        } else if (e.keyCode === 221) {
          this.getTheFareOfVehicle('Truck3Axle');
        } else if (e.keyCode === 45) {
          this.getTheFareOfVehicle('OSV');
        } else if (e.keyCode === 190) {
          this.getTheFareOfVehicle('TractorCommercial');
        } else if (e.keyCode === 145) {
          this.selectedFareType('LTO');
        } else if (e.keyCode === 222) {
          this.selectedFareType('EXEMPT');
        } else if (e.keyCode === 186) {
          if (this.isExempt === true) {
            this.newPaymentMethod = 'EXEMPT';
            this.newFareType = 'EXEMPT';
            this.laneForm.controls.exemptType.setValue('exemptArmy');
            this.exemptTypeSelected = true;
          }
        } else if (e.keyCode === 120) {
          this.selectedFareType('SignleJourney');
        } else if (e.keyCode === 121) {
          this.selectedFareType('DailyPassUnlimited');
        } else if (e.keyCode === 191) {
          this.onBarcodeSubmit();
        } else if (e.keyCode === 187) {
          this.selectedPaymentType('CASH');
          this.newPaymentMethod = 'CASH';
        } else if (e.keyCode === 188) {
          this.selectedPaymentType('CARD');
          this.newPaymentMethod = 'CARD';
        } else if (e.keyCode === 123) {
          this.onSCSubmit();
        }
      }
      this.prevKey = e.key;
      console.log(this.prevKey);
    }
  }
  getBarcodeDetails(barcode, vehicleNumber) {
    this.tollscreenService.verifyAndHandleBarCode(barcode).subscribe((response) => {
      if (response.success) {
        this.barcodeResp = response.txnDetails;
        this.barcodeResp.txnValidity = new Date(this.barcodeResp.txnValidity).toString().split(' ').slice(0, 5).join(' ');
        console.log(this.barcodeResp.txnValidity);
        this.openBarcodeScannerDialog(this.barcodeResp, barcode, vehicleNumber);
      }
      this.barcodeDevice.nativeElement.value = '';
    });
  }
  @HostListener('document:keydown', ['$event'])
  handleKeydownEvent(event: KeyboardEvent) {
    // this.barcodeData = event.key;
    if (event.which === 32) {
      if (this.laneForm.controls.description.value === '') {
        return false;
      }

    }
    if (event.which === 16) {
      if (this.barcodeEvent === false) {
        this.barcodeVehicleNumber = this.laneForm.controls.vehicleNumber.value;
        this.barcodeDescription = this.laneForm.controls.description.value;
        this.barcodeSCSerialNumber = this.SCDevice.nativeElement.value;
      }
      console.log(this.barcodeDescription);
      this.barcodeEvent = true;
      // this.barcodeDevice.nativeElement.focus();
    } else if (event.which === 13 && this.isFreeTxnsOn === false) {
      if (this.barcodeEvent === true) {
        this.barcodeEvent = false;
        if (this.barcodeOutput.length === 24) {
          this.laneForm.controls['vehicleNumber'].setValue(this.barcodeVehicleNumber);
          this.laneForm.controls['description'].setValue(this.barcodeDescription);
          this.SCDevice.nativeElement.value = this.barcodeSCSerialNumber;
          this.barcodeDevice.nativeElement.focus();
          this.barcodeOutput = this.barcodeOutput.replace('#', '');
          this.barcodeDevice.nativeElement.value = this.barcodeOutput;
          if (this.laneForm.controls.vehicleNumber.value === '') {
            this.toasterService.pop('error', '', 'First you need enter the Vehicle Number to proceed with Barcode Transaction');
          } else {
            this.getBarcodeDetails(this.barcodeOutput, this.laneForm.controls.vehicleNumber.value);
            this.showDialog = false;
          }
        } else if (this.barcodeOutput === '') {
          this.toasterService.pop('error', '', 'First enter proper barcode uinique');
        } else if (this.laneForm.controls.vehicleNumber.value === '') {
          this.toasterService.pop('error', '', 'First enter vehicle number');
        }
        this.barcodeOutput = '';
        event.preventDefault();
      } else {
        if (this.isKeyBrdShrtcts) {
          if (this.dialog.openDialogs.length === 0) {
            this.submitTxnDetails(event);
          }
        }
      }
    } else if (this.barcodeEvent === true) {
      this.barcodeOutput = this.barcodeOutput + event.key;
    } else {

    }
    // console.log(this.barcodeDevice.nativeElement.value.length);
    if (this.barcodeDevice.nativeElement.value.length > 0 && (this.barcodeDevice.nativeElement.value.length === 22 || this.barcodeDevice.nativeElement.value.length === 23)) {
      this.activeSubmitBtn = true;
    } else {
      this.activeSubmitBtn = false;
    }

    if (event.keyCode === 8) {
      if (this.laneForm.controls['vehicleNumber'].value === '') {
        this.activeSCSubmitBtn = false;
        this.activeSubmitBtn = false;
        this.barcodeDevice.nativeElement.value = '';
      }
      console.log(this.barcodeDevice.nativeElement.value.length);
      if (this.barcodeDevice.nativeElement.value.length > 0 && (this.barcodeDevice.nativeElement.value.length === 24 || this.barcodeDevice.nativeElement.value.length === 25)) {
        this.activeSubmitBtn = true;
      } else {
        this.activeSubmitBtn = false;
      }
      if (this.SCDevice.nativeElement.value.length > 0) {
        this.activeSCSubmitBtn = true;
      } else {
        this.activeSCSubmitBtn = false;
      }
    }
    if (this.regexpNSC.test(event.key)) {
      // Typed slower => Not a barcode
      if (this.lastKeyTime !== -1 && (Date.now() - this.lastKeyTime) > 50) {
        this.barcodeData = event.key;
        if (this.laneForm.controls['vehicleNumber'].value !== '') {
          if (this.laneForm.controls['vehicleNumber'].value.length > 0) {
            if ((Date.now() - this.lastKeyTime) > 30) {
              this.showDialog = true;
            } else {
              this.showDialog = false;
            }
          } else {
            this.toasterService.pop('error', '', 'length not enough to proceed');
            this.showDialog = false;
          }
        }
      } else if (this.lastKeyTime === -1) {
        this.lastKeyTime = Date.now();
        return;
      } else {
      }
      this.lastKeyTime = Date.now();
      this.barcodeData = this.barcodeData.concat(event.key);
    }
  }
  activateBarcodeBtn() {
    this.isBarcodeBtnClick = true;
    this.isSCBtnClicked = false;
    this.barcodeDevice.nativeElement.value = '';
    this.toasterService.pop('warning', '', 'Enter the BARCODE UNIQUE Code Manually in the input field!');
    this.brPlaceholderText = 'barcode number';
  }
  onBarcodeSubmit() {
    if (this.laneForm.controls.vehicleNumber.value !== '' && this.barcodeDevice.nativeElement.value.length === 23) {
      this.getBarcodeDetails(this.barcodeDevice.nativeElement.value, this.laneForm.controls.vehicleNumber.value);
    } else if (this.laneForm.controls.vehicleNumber.value === '') {
      this.toasterService.pop('error', '', 'Enter Vehicle Number first');
    } else {
      this.toasterService.pop('error', '', 'The code should be 23 characters long.');
    }
  }
}




@Component({
  selector: 'app-toll-exempt',
  providers: [ToasterService],
  styleUrls: ['./toll-screen.component.scss'],
  template: `<i class="fa fa-close crossIcon" (click)="dialogRef.close()"></i>
  <div class="text-center">
    <h2 class="exemptTitle">Place the ID Card on to the camera to capture the snapshot for EXEMPT.</h2>
    <div class="snapWrapper">
      <webcam class="exemptCam" [height]="200" [width]="300" [trigger]="triggerObservable" (imageCapture)="handleImage($event)" *ngIf="showWebcam" [allowCameraSwitch]="allowCameraSwitch" [videoOptions]="videoOptions" [imageQuality]="1" (cameraSwitched)='cameraWasSwitched($event)' (initError)="handleInitError($event)"> </webcam>
      <img class="exemptSnap" [src]="webcamImage.imageAsDataUrl" *ngIf="webcamImage"/>
    </div>
    <div>
      <button (click)='triggerSnapshot()' [disabled]="camErrors===true" class="customBtns btnStyle">Take photo</button>
      <button mat-raised-button (click)="finishExemptTxn()" [disabled]="!isExActiveVehicleExit" class="customBtns btnStyle"  >Finish Exempt Transaction</button>
      <button mat-raised-button (click)="dialogRef.close()" class="customBtns btnStyle">Cancel</button>    <toaster-container [toasterconfig]="config"></toaster-container>
    </div>`
})
export class TollExemptsComponent implements OnInit {
  isExActiveVehicleExit: Boolean;
  socketRecievedExInfo: any = {};
  private socketSubscription: Subscription;
  logoResponse: any;
  base64Img: string;
  imageName: any;
  imageFileAfterConversion: any;
  imageFile: any;
  laneTransactionInfo: any;
  laneFormResponse: any;
  exemptSnapObj: any = {};
  isSnapClicked: Boolean = false;
  camErrors: Boolean = false;
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  private toasterService: ToasterService;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  onExempt = new EventEmitter();
  constructor(public dialog: MatDialog,
    private socketService: SocketService,
    public dialogRef: MatDialogRef<TollExemptsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private tollscreenService: TollScreenService,
    toasterService: ToasterService
  ) {
    this.toasterService = toasterService;
    this.exemptSnapObj = this.authService.getExemptSnap();
    console.log(this.exemptSnapObj);
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

  firstComponentFunction() {
    this.tollscreenService.onFirstComponentButtonClick();
  }
  extriggerSnapshot() {
    return true;
  }

  dataURItoBlob(dataURI) {
    const byteString = atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    return blob;
  }

  ngOnInit() {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
    this.isExActiveVehicleExit = this.data.isActiveVehicleExit;
    this.socketSubscription = this.socketService.getSubject()
      .subscribe((event: SocketData) => {
        if (event.type === WS_MESSAGE_TYPES.DATA_ERROR) {
          // this.toasterService.pop('error','',event.data);
        } else if (event.type === WS_MESSAGE_TYPES.DATA_RECEIVED) {
          this.socketRecievedExInfo = JSON.parse(event.data);
          // console.log(this.socketRecievedExInfo);
          if (this.socketRecievedExInfo.vehicleExitStatus === true || this.socketRecievedExInfo.txnId) {
            this.isExActiveVehicleExit = true;
          } else {
            this.isExActiveVehicleExit = false;
          }
        }
      });
  }
  public triggerSnapshot(): void {
    this.isSnapClicked = true;
    this.trigger.next();
  }
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }
  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
    if (this.errors.length !== 0) {
      this.camErrors = true;
    } else {
      this.camErrors = false;
    }
  }
  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  finishExemptTxn() {
    this.isSnapClicked = false;
    if (this.webcamImage === null) {
      const emptyBlob = new Blob();
      this.exemptSnapObj.imageData = emptyBlob;
    } else {
      // Base64 url of image
      this.base64Img = this.webcamImage.imageAsBase64;
      // Naming the image
      const date = new Date().valueOf();
      let text = '';
      const possibleText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 5; i++) {
        text += possibleText.charAt(Math.floor(Math.random() * possibleText.length));
      }
      // Replace extension according to your media type
      this.imageName = date + '.' + text + '.jpeg';
      // call method that creates a blob from dataUri
      const imageBlob = this.dataURItoBlob(this.base64Img);
      this.imageFileAfterConversion = new File([imageBlob], this.imageName, { type: 'image/jpeg' });
      this.imageFile = this.imageFileAfterConversion;
      // console.log(this.exemptSnapObj);
      this.exemptSnapObj.imageData = this.imageFile;
    }
    // console.log(this.exemptSnapObj);
    this.tollscreenService.createLaneTxn(this.exemptSnapObj, this.data.isTowed)
      .subscribe((event) => {
        if (event.type === HttpEventType.Response) {
          this.logoResponse = event.body;
          if (this.logoResponse.success) {
            this.laneTransactionInfo = this.logoResponse.txnDetails;
            this.isExActiveVehicleExit = false;
            this.onExempt.emit(this.logoResponse);
          } else {
            this.laneFormResponse = { success: false, message: this.logoResponse.description };
            setTimeout(() => {
              this.laneFormResponse = { success: false, message: '' };
            }, 3000);
            this.onExempt.emit(this.logoResponse.description);
            // this.toasterService.pop('error','',this.logoResponse.description);
          }
          this.dialogRef.close();
        }
      }, err => {
        this.laneFormResponse = { success: false, message: err.message };
        setTimeout(() => {
          this.laneFormResponse = { success: false, message: '' };
        }, 3000);
        this.dialogRef.close();
        // this.toasterService.pop('error','',err.message);
      });
  }
}
@Component({
  selector: 'app-logout',
  styleUrls: ['./toll-screen.component.scss'],
  template: `
  <div class="text-center logoutDialog">
  <h1><i _ngcontent-c1="" aria-hidden="true" class="fa fa-exclamation-circle customAlertIcon"></i> Logout!</h1>
  <h5>Are you sure??</h5>
  <button mat-raised-button (click)="logout()" class="customBtns btnStyle">OK</button>
  <button mat-raised-button (click)="dialogRef.close()" class="customBtns btnStyle">Cancel</button></div>`
})
export class LogoutComponent {
  constructor(
    public dialogRef: MatDialogRef<LogoutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sessionService: SessionService,
    private router: Router,
    private socketService: SocketService,
    private authService: AuthService) { }
  logout() {
    // this.modalService.dismissAll();
    this.sessionService.logout()
      .subscribe((response) => {
        this.router.navigate(['/login']);
        if (response.success) {
          this.socketService.disconnect();
          this.authService.logout();
          this.dialogRef.close();
        }
      });
  }
}
@Component({
  selector: 'app-shift-ends-alert',
  styleUrls: ['./toll-screen.component.scss'],
  template: `
  <div class="text-center shiftEndAlertDialog">
  <h1><i _ngcontent-c1="" aria-hidden="true" class="fa fa-exclamation-circle customAlertIcon"></i> ALERT!</h1>
  <h4>Shift will end in 5 mins.</h4>
  <button mat-raised-button (click)="dialogRef.close()" class="customBtns btnStyle">OK</button></div>`
})
export class ShiftEndsAlertComponent {
  constructor(
    public dialogRef: MatDialogRef<ShiftEndsAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
}
@Component({
  selector: 'app-fleet-txn',
  providers: [ToasterService],
  styleUrls: ['./toll-screen.component.scss'],
  template: `<i class="fa fa-close crossIcon" (click)="fleetClose()"></i>
  <div><h3 class="text-center formHeading marginTop15">CONVOY</h3>
  <form [formGroup]="fleetForm" (submit)="submitFleet()" *ngIf="fleetForm && fleetForm.controls" class="fleetForm">
  <div class="form-group row align-items-center">
    <div class="col-sm-12">
      <select class="form-control" formControlName="fleetTypes" (change)="onFleetTypeChange($event.target.value)" [class.inputError]="fleetForm.controls.fleetTypes.errors" #fleettypes>
      <option value="">Select Fleet type</option>
      <option *ngFor="let fleetType of fleetTypeList"  [value]="fleetType.fleetTypeEntityId">{{fleetType.fleetType}}</option>
      </select>
      <p class="error" *ngIf="fleetForm.controls.fleetTypes.dirty && fleetForm.controls.fleetTypes.errors">Please select Fleet type.</p>
    </div>
  </div>
  <div class="form-group row align-items-center" *ngIf="isFleetOn===true">
    <div class="col-sm-12">
      <input type="number" min="0" class="form-control" formControlName="numberOfVehicles" [class.inputError]="fleetForm.controls.numberOfVehicles.errors" placeholder="Number of Vehicles" />
      <p class="error" *ngIf="fleetForm.controls.numberOfVehicles.dirty && fleetForm.controls.numberOfVehicles.errors">Please select Number of Vehicles.</p>
    </div>
  </div>
  <div class="form-group row">
    <label class="col-sm-4 m-0"></label>
    <div class="col-sm-8">
      <p class="success" [class.error]="!fleetResponse.success">{{fleetResponse.message}}</p>
      <button type="submit" class="commonBtns marginTop15">Submit</button>
    </div>
  </div>
</form>
<toaster-container [toasterconfig]="fleetConfig"></toaster-container>
</div>`
})
export class FleetTxnComponent implements OnInit {
  isCnyActiveVehicleExit: Boolean;
  socketRecievedCnyInfo: any = {};
  private toasterService: ToasterService;
  fleetTypeList: any = [];
  fleetTxnId: any = '';
  isFleetOn: Boolean = false;
  fleetTxnInitiateResp: any = {};
  fleetForm: FormGroup;
  fleetResponse: any = {};
  enableBtn: Boolean = false;
  fleetTypeSelected: Boolean = false;
  fleetTxnFinishResp: any = {};
  private socketSubscription: Subscription;
  onFleetTypeAdd = new EventEmitter();
  onFleetInitaite = new EventEmitter();
  @ViewChild('fleettypes') fleettypes: ElementRef;
  constructor(
    private socketService: SocketService,
    public dialogRef: MatDialogRef<FleetTxnComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private tollscreenService: TollScreenService,
    private authService: AuthService,
    public dialog: MatDialog,
    toasterService: ToasterService) {
    this.toasterService = toasterService;
  }
  public fleetConfig: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 3500,
      positionClass: 'toast-top-right',
      animation: 'fade',
      preventDuplicates: true
    });
  ngOnInit() {
    this.fleetResponse.message = '';
    this.getFleetTypeList();
    this.buildFleetForm();
  }
  buildFleetForm() {
    this.fleetForm = this.fb.group({
      fleetTypes: [''],
      numberOfVehicles: ['']
    });
    this.fleetForm.controls['fleetTypes'].setValidators(Validators.required);
    this.fleetForm.controls['fleetTypes'].updateValueAndValidity();
  }
  onFleetTypeChange(fleetEntityId) {
    // this.fleetTypeSelected=true;
    this.fleetForm.controls['fleetTypes'].disable();
    if (this.fleetForm.controls['fleetTypes'].value === '') {
      this.isFleetOn = false;
    } else {
      const fleetInitiateObj = {
        sessionId: this.authService.getSessionId(),
        fleetTypeEntityId: fleetEntityId
      };
      this.tollscreenService.initiateFleetTxn(fleetInitiateObj).subscribe((response) => {
        if (response.success) {
          this.isFleetOn = true;
          this.fleetForm.controls['numberOfVehicles'].setValidators(Validators.required);
          this.fleetForm.controls['numberOfVehicles'].updateValueAndValidity();
          this.fleetTxnInitiateResp = response.txnDetails;
          this.fleetTxnId = this.fleetTxnInitiateResp.transactionId;
          this.onFleetInitaite.emit(response);
          this.fleetForm.controls['numberOfVehicles'].valueChanges.subscribe(value => {
          });
        } else {
          this.isFleetOn = false;
          this.fleetResponse = response;
          this.fleetResponse.message = response.description;
          // this.toasterService.pop('error','',response.description);

          setTimeout(() => {
            this.dialogRef.close();
          }, 2000);
        }
      }, err => {
        this.isFleetOn = false;
        this.fleetResponse.message = err.message;
        // this.toasterService.pop('error','',err.message);
        setTimeout(() => {
          this.dialogRef.close();
        }, 500);
      });
    }
  }
  getFleetTypeList() {
    this.tollscreenService.getFleetList().subscribe((res) => {
      if (res.success) {
        this.fleetTypeList = res.fleetTypes;
      }
    });
  }

  fleetClose() {
    const fleetObj = {
      sessionId: this.authService.getSessionId(),
      fleetTxnId: this.fleetTxnId,
      fleetVehicleCount: 0
    };
    this.closeFleetSubmit(fleetObj);
  }
  closeFleetSubmit(fleetObj) {
    this.tollscreenService.finishFleetTxn(fleetObj).subscribe((response) => {
      if (response.success) {
        this.isCnyActiveVehicleExit = false;
        this.fleetTxnFinishResp = response;
        this.onFleetTypeAdd.emit(this.fleetTxnFinishResp);
        this.dialogRef.close();
      } else {
        this.fleetResponse = response;
        this.fleetResponse.message = response.description;
        // this.toasterService.pop('error','',response.description);
        setTimeout(() => {
          this.dialogRef.close();
        }, 500);
      }
    }, err => {
      // this.toasterService.pop('error','',err.message);
      setTimeout(() => {
        this.dialogRef.close();
      }, 500);
    });
  }
  submitFleet() {
    this.fleetResponse = {};
    if (this.fleetForm.invalid) {
      return;
    }
    const fleetObj = {
      sessionId: this.authService.getSessionId(),
      fleetTxnId: this.fleetTxnId,
      fleetVehicleCount: parseInt(this.fleetForm.controls.numberOfVehicles.value, 10)
    };
    this.closeFleetSubmit(fleetObj);
  }
}
@Component({
  selector: 'app-towed-txn',
  providers: [ToasterService],
  styleUrls: ['./toll-screen.component.scss'],
  template: `<i class="fa fa-close crossIcon" (click)="dialogRef.close()"></i>
  <div><h3 class="text-center formHeading">TOWED FORM</h3>
  <form [formGroup]="TowedForm" class="towedForm" (submit)="submitTowed()" *ngIf="TowedForm && TowedForm.controls">

  <div class="form-group row align-items-center">

    <div class="col-sm-12">
      <input (ngModelChange)="modelChanged($event)" min="0" type="number" class="form-control" formControlName="numberOfVehicles" [class.inputError]="TowedForm.controls.numberOfVehicles.errors" placeholder="Number of Vehicles"  />
    </div>
  </div>
  <div class="form-group row">

    <div class="col-sm-12 text-center">
      <p class="success" [class.error]="!towedResponse.success">{{towedResponse.message}}</p>
      <button type="submit" class="commonBtns marginTop15" [disabled]="isValid">Submit</button>
    </div>
  </div>
</form>
<toaster-container [toasterconfig]="towedConfig"></toaster-container>
</div>`
})
export class TowedTxnComponent implements OnInit {
  private toasterService: ToasterService;
  // fleetTypeList:any = [];
  towedTxnId: any = '';
  isTowedOn: Boolean = false;
  towedTxnInitiateResp: any = {};
  TowedForm: FormGroup;
  towedResponse: any = {};
  towedTxnFinishResp: any = {};
  isValid: Boolean = true;
  onTowedTypeAdd = new EventEmitter();
  constructor(
    public dialogRef: MatDialogRef<TowedTxnComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private tollscreenService: TollScreenService,
    private authService: AuthService,
    public dialog: MatDialog,
    toasterService: ToasterService) {
    this.toasterService = toasterService;
  }
  public towedConfig: ToasterConfig =
    new ToasterConfig({
      showCloseButton: true,
      tapToDismiss: false,
      timeout: 3500,
      positionClass: 'toast-top-right',
      animation: 'fade',
      preventDuplicates: true
    });


  ngOnInit() {
    this.towedResponse.message = '';
    this.buildTowedForm();
  }
  buildTowedForm() {
    this.TowedForm = this.fb.group({
      numberOfVehicles: ['', Validators.required]
    });
  }
  modelChanged($event) {
    // console.log($event);
    if ($event < 2) {
      this.isValid = true;
      // console.log($event , this.isValid);
      this.toasterService.pop('error', '', 'Minimum 2 Transactions Needs To be Done to Complete Towed Transaction');
    } else {
      this.isValid = false;
      console.log($event, this.isValid);
    }
  }
  submitTowed() {
    const count = this.TowedForm.controls['numberOfVehicles'].value;
    this.towedResponse = {};
    if (this.TowedForm.invalid) {
      return;
    }
    this.tollscreenService.initiateTowedTxn(count)
      .subscribe((response) => {
        if (response.success) {
          this.towedTxnInitiateResp = response;
          this.toasterService.pop('success', '', 'TowedTxn Started');
          setTimeout(() => {
            this.dialogRef.close();
          }, 500);
        } else {
          this.towedResponse = response;
          this.towedResponse.message = response.description;
          // this.toasterService.pop('error','',response.description);
          setTimeout(() => {
            this.dialogRef.close();
          }, 500);
        }
        this.onTowedTypeAdd.emit(response);
      }, err => {
        // this.toasterService.pop('error','',err.description);
        setTimeout(() => {
          this.dialogRef.close();
        }, 500);
      });
  }
}
export interface DialogData {
  freeVehicleTypeValue: string;
}
@Component({
  selector: 'app-free-txns',
  styleUrls: ['./toll-screen.component.scss'],
  providers: [ToasterService],
  template: `
  <div><i class="fa fa-close crossIcon" (click)="dialogRef.close()"></i>

  <form [formGroup]="freeTxnsForm" (keydown.enter)="submitFreeTxn()" (submit)="submitFreeTxn()" *ngIf="freeTxnsForm && freeTxnsForm.controls" class="freeTxnsForm">
  <h3 class="text-center">Free Transaction</h3>
  <div class="form-group row align-items-center">
    <label class="col-sm-4 m-0">Free Vehicle Types</label>
    <span class="col-1">:</span>
    <div class="col-sm-7">
      <select class="form-control" (change)="selectedFreeVehicleType($event.target.value)" formControlName="freeVehicleTypes" [class.inputError]="freeTxnsForm.controls.freeVehicleTypes.errors">
        <option value="">Select Free Vehicle Type</option>
        <option *ngFor="let freeVehicleType of freeVehicleTypeList"  [value]="freeVehicleType.vehicleType">{{freeVehicleType.vehicleType}}</option>
      </select>

      <p class="error" *ngIf="freeTxnsForm.controls.freeVehicleTypes.dirty && freeTxnsForm.controls.freeVehicleTypes.errors">Please select Free Vehicle Type.</p>
    </div>
  </div>
  <div class="form-group row align-items-center freeTxnLabelsVN" *ngIf="vehicleNoMandate===true">
    <label class="col-sm-4 m-0">Vehicle Number</label>
    <span class="col-1">:</span>
    <div class="col-sm-7">
     <input type="text" maxlength="12" formControlName="vehicleNumber" (keypress)="omit_special_char($event)" class="form-control vehicleNumber" autofocus   [class.inputError]="(freeTxnsForm.controls.vehicleNumber.errors &&  (freeTxnsForm.controls.vehicleNumber.dirty || freeTxnsForm.controls.vehicleNumber.touched) ||freeTxnsForm.controls.vehicleNumber.value==='')" >
    </div>
  </div>

  <div class="form-group row align-items-center freeTxnLabels"
  [ngClass]="[vehicleNoMandate===true ? 'freeTxnLabelsVN' : 'freeTxnLabels']">
    <label class="col-sm-4 m-0">Journey Type</label>
    <span class="col-1">:</span>
    <div class="col-sm-7">
      <label>Free Journey</label>
    </div>
  </div>
  <div class="form-group row align-items-center freeTxnLabels"
  [ngClass]="[vehicleNoMandate===true ? 'freeTxnLabelsVN' : 'freeTxnLabels']">
    <label class="col-sm-4 m-0">Payment Type</label>
    <span class="col-1">:</span>
    <div class="col-sm-7">
      <label>FREE</label>
    </div>
  </div>
  <div class="form-group row align-items-center freeTxnLabels"
  [ngClass]="[vehicleNoMandate===true ? 'freeTxnLabelsVN' : 'freeTxnLabels']">
    <label class="col-sm-4 m-0">Vehicle Number</label>
    <span class="col-1">:</span>
    <div class="col-sm-7 vehicleNo">
      <label *ngIf="data.vehicleNumber!==''">{{data.vehicleNumber}}</label>
      <label *ngIf="data.vehicleNumber===''">N/A</label>
    </div>
  </div>
  <div class="form-group row align-items-center freeTxnLabels"
  [ngClass]="[vehicleNoMandate===true ? 'freeTxnLabelsVN' : 'freeTxnLabels']">
    <label class="col-sm-4 m-0">Operator Class</label>
    <span class="col-1">:</span>
    <div class="col-sm-7">
      <label>{{this.freeTxnsForm.controls.freeVehicleTypes.value}}</label>
    </div>
  </div>

  <div class="form-group row">
    <div class="col-sm-12 text-center">
      <p class="success" [class.error]="!freeTxnsFormResponse.success">{{freeTxnsFormResponse.message}}</p>
      <button type="submit" class="btn btn-primary btnStyle customBtns customFreeBtns" [disabled]="!enableBtn">Finish Free Transaction</button>

    </div>
  </div>
</form> <toaster-container [toasterconfig]="config"></toaster-container></div>`
})
export class FreeTxnsComponent implements OnInit {
  private toasterService: ToasterService;
  freeVehicleTypeList: any = [];
  freeTxnsFormResponse: any = {};
  freeTxnsForm: FormGroup;
  freeTxnsResponse: any = {};
  vehicleNumber: any = '';
  vehicleTypeId: any = '';
  freeTransactionInfo: any;
  vehicleNoMandate: Boolean = false;
  enableBtn: Boolean = false;
  trial: any = {};
  socketRecievedFreeInfo: any = {};
  isFreeActiveVehicleExit: Boolean;
  isValidVehicleNumber: Boolean = true;
  private socketSubscription: Subscription;
  constructor(private socketService: SocketService,
    public dialogRef: MatDialogRef<FreeTxnsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private tollscreenService: TollScreenService,
    private authService: AuthService,
    public dialog: MatDialog,
    toasterService: ToasterService) {
    //  console.log(this.data);
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

  onAdd = new EventEmitter();
  ngOnInit() {
    this.isFreeActiveVehicleExit = this.data.isActiveVehicleExit;
    this.getFreeVehicleTypeList();
    this.buildFreeTxnsForm();
    this.socketSubscription = this.socketService.getSubject()
      .subscribe((event: SocketData) => {
        // console.log(event.data);
        if (event.type === WS_MESSAGE_TYPES.DATA_ERROR) {
          //  console.log(event.data);
        } else if (event.type === WS_MESSAGE_TYPES.DATA_RECEIVED) {
          this.socketRecievedFreeInfo = JSON.parse(event.data);
          //  console.log(this.socketRecievedFreeInfo);
          if (this.socketRecievedFreeInfo.vehicleExitStatus === true || this.socketRecievedFreeInfo.txnId) {
            this.isFreeActiveVehicleExit = true;
            if (this.isFreeActiveVehicleExit && this.freeTxnsForm.controls.vehicleNumber.valid) {
              this.enableBtn = true;
            } else {
              this.enableBtn = false;
            }
          } else {
            this.isFreeActiveVehicleExit = false;
          }
        }
      });
  }
  omit_special_char(event) {
    let k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k === 8 || k !== 32 || (k >= 48 && k <= 57));
  }

  getFreeVehicleTypeList() {
    this.tollscreenService.getFreeTxnVehicleTypes()
      .subscribe((response) => {
        if (response.success) {
          this.freeVehicleTypeList = response.vehicleTypes;
          this.freeTxnsForm.controls['freeVehicleTypes'].setValidators(Validators.required);
          this.freeTxnsForm.controls['freeVehicleTypes'].updateValueAndValidity();
        }
      });
  }

  selectedFreeVehicleType(vehicleType) {
    if (vehicleType !== 'MotorCycle' && vehicleType !== 'Auto') {
      // console.log('lolololo');
      if (this.data.vehicleNumber === '') {
        this.vehicleNoMandate = true;
        this.freeTxnsForm.controls['vehicleNumber'].setValidators([Validators.required, Validators.minLength(2)]);
        this.freeTxnsForm.controls['vehicleNumber'].updateValueAndValidity();
      } else {
        this.vehicleNoMandate = false;
        this.freeTxnsForm.controls['vehicleNumber'].clearValidators();
        this.freeTxnsForm.controls['vehicleNumber'].updateValueAndValidity();
      }
    } else {
      this.vehicleNoMandate = false;
      this.freeTxnsForm.controls['vehicleNumber'].clearValidators();
      this.freeTxnsForm.controls['vehicleNumber'].updateValueAndValidity();
    }
    if (this.isFreeActiveVehicleExit && this.freeTxnsForm.controls.vehicleNumber.valid) {
      this.enableBtn = true;
    } else {
      this.enableBtn = false;
    }
    this.freeTxnsForm.controls['vehicleNumber'].valueChanges.subscribe(value => {
      if (this.isFreeActiveVehicleExit && this.freeTxnsForm.controls.vehicleNumber.valid) {
        this.enableBtn = true;
      } else {
        this.enableBtn = false;
      }
    });
  }



  buildFreeTxnsForm() {
    this.freeTxnsForm = this.fb.group({
      freeVehicleTypes: [''],
      vehicleNumber: ['']
    });
    if (this.data.freeVehicleTypeValue !== '') {
      this.freeTxnsForm.controls['freeVehicleTypes'].setValue(this.data.freeVehicleTypeValue);
    } else {
      this.freeTxnsForm.controls['freeVehicleTypes'].setValue('');
    }
    if (this.isFreeActiveVehicleExit && this.freeTxnsForm.controls.vehicleNumber.valid) {
      this.enableBtn = true;
    } else {
      this.enableBtn = false;
    }
    console.log(this.freeTxnsForm.controls.freeVehicleTypes.value);
    if (this.freeTxnsForm.controls.freeVehicleTypes.value !== '') {
      this.selectedFreeVehicleType(this.freeTxnsForm.controls.freeVehicleTypes.value);
    }
  }
  submitFreeTxn() {
    this.freeTxnsResponse = {};
    if (this.freeTxnsForm.invalid) {
      return;
    } else {
      this.data.vehiclesWithFreeTxnArr.forEach(vehicle => {
        if (vehicle.vehicleType === this.freeTxnsForm.controls.freeVehicleTypes.value) {
          this.vehicleTypeId = vehicle.id;
        }
      });
      const objToClone = {
        sessionId: this.authService.getSessionId(),
        vehicleTypeId: this.vehicleTypeId,
        amountBalance: 0,
        amountTaken: 0,
        paymentTypeId: this.data.paymentTypeId,
        imageData: new Blob()
      };
      const createFreeTxnObj: any = {};
      if (this.data.vehicleNumber !== '') {
        createFreeTxnObj.vehicleNumber = this.data.vehicleNumber.toUpperCase().trim();
      } else {
        if (this.vehicleNoMandate === true) {
          createFreeTxnObj.vehicleNumber = this.freeTxnsForm.controls.vehicleNumber.value.toUpperCase().trim();
        } else {
          createFreeTxnObj.vehicleNumber = null;
        }
      }
      Object.assign(createFreeTxnObj, objToClone);
      this.tollscreenService.createLaneTxn(createFreeTxnObj, this.data.isTowed).toPromise().then((response: HttpResponse<any>) => {
        if (response.body.success) {
          this.freeTransactionInfo = response.body;
          this.onAdd.emit(this.freeTransactionInfo);
        } else {
          this.toasterService.pop('error', '', response.body.description);
        }
      }, err => {
        this.toasterService.pop('error', '', err.message);
      });
      this.dialogRef.close();
    }
  }
}
@Component({
  selector: 'app-barcode-scanner',
  styleUrls: ['./toll-screen.component.scss'],
  template: `
  <div class="text-center BRInfoWrapper">
  <p>Vehicle Number :<span class="highlightText"> {{data.barcodeResp.vehicleNumber}}</span></p>
  <p>Vehicle Type : {{ data.barcodeResp.originalVehicleType}}</p>
  <p>Fare Type : {{ data.barcodeResp.originalFareType}}</p>
  <p>Valid Till : {{ data.barcodeResp.txnValidity}}</p>

  <button mat-raised-button (click)="onBarcodeSubmit()" class="customBtns btnStyle" [disabled]="!isBRActiveVehicleExit">Submit</button>
  <button mat-raised-button (click)="cancelBarcodeDialog()" class="customBtns btnStyle">Cancel</button></div>`
})
export class BarcodeScannerComponent implements OnInit {
  isBRActiveVehicleExit: Boolean;
  socketRecievedBRInfo: any = {};
  barcodeResp: any = {};
  submitBarcodeResp: any = {};
  private socketSubscription: Subscription;
  constructor(private tollscreenService: TollScreenService,
    private socketService: SocketService,
    public dialogRef: MatDialogRef<BarcodeScannerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    // console.log(this.data.barcodeResp);
  }
  onBarcodeResp = new EventEmitter();
  ngOnInit() {
    // console.log(this.data);
    // console.log(this.data.isActiveVehicleExit);
    this.isBRActiveVehicleExit = this.data.isActiveVehicleExit;
    this.socketSubscription = this.socketService.getSubject().subscribe((event: SocketData) => {
      // console.log(event.data);
      if (event.type === WS_MESSAGE_TYPES.DATA_ERROR) {
        console.log(event.data);
        //  / this.toasterService.pop('error','',event.data);
      } else if (event.type === WS_MESSAGE_TYPES.DATA_RECEIVED) {
        this.socketRecievedBRInfo = JSON.parse(event.data);
        // console.log(this.socketRecievedBRInfo);
        if (this.socketRecievedBRInfo.vehicleExitStatus === true || this.socketRecievedBRInfo.txnId) {
          this.isBRActiveVehicleExit = true;
        } else {
          this.isBRActiveVehicleExit = false;
        }
      }
    });


  }
  onBarcodeSubmit() {
    this.tollscreenService.createBarCodeReturnTxn(this.data.barcode, this.data.vehicleNumber, this.data.isTowed).subscribe((response) => {
      this.submitBarcodeResp = response;
      if (response.success) {
        this.isBRActiveVehicleExit = false;
      }
      this.onBarcodeResp.emit(this.submitBarcodeResp);
    });
    this.dialogRef.close();
  }
  cancelBarcodeDialog() {
    const cancelObj = {
      description: 'close'
    };
    this.onBarcodeResp.emit(cancelObj);
    this.dialogRef.close();
  }
}
@Component({
  selector: 'app-sc-info',
  styleUrls: ['./toll-screen.component.scss'],
  template: `
  <div class="text-center SCInfoWrapper">
  <p>Serial Number : {{this.data.SCInfoResp.cardSrNumber}}</p>
  <p>Vehicle Number : <span class="highlightText"> {{this.data.SCInfoResp.vehicleNumber}}</span></p>
  <p>Card Type : {{this.data.SCInfoResp.fareType}}</p>
  <p>Vehicle Type : {{this.data.SCInfoResp.vehicleType}}</p>
  <p class="highlightText">Status : {{this.data.SCInfoResp.status}}</p>
  <p>Valid Till : {{this.data.SCInfoResp.expiryDate}}</p>
  <button mat-raised-button (click)="createSCTxn()" class="customBtns btnStyle" [disabled]="!isSCActiveVehicleExit">Submit</button>
  <button mat-raised-button (click)="cancelSCDialog()" class="customBtns btnStyle">Cancel</button></div>`
})
export class SCInfoComponent implements OnInit {
  scTxnObj: any = {};
  SCInfoResp: any = {};
  submitSCResp: any = {};
  socketRecievedSCInfo: any = {};
  isSCActiveVehicleExit: Boolean;
  private socketSubscription: Subscription;
  constructor(private authService: AuthService,
    private socketService: SocketService,
    private tollscreenService: TollScreenService,
    public dialogRef: MatDialogRef<SCInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  onSCInfoResp = new EventEmitter();
  ngOnInit() {
    // console.log(this.data.isActiveVehicleExit);
    this.isSCActiveVehicleExit = this.data.isActiveVehicleExit;
    this.socketSubscription = this.socketService.getSubject().subscribe((event: SocketData) => {
      // console.log(event.data);
      if (event.type === WS_MESSAGE_TYPES.DATA_ERROR) {
        //  console.log(event.data);
        //  / this.toasterService.pop('error','',event.data);
      } else if (event.type === WS_MESSAGE_TYPES.DATA_RECEIVED) {
        this.socketRecievedSCInfo = JSON.parse(event.data);
        // console.log(this.socketRecievedSCInfo);
        if (this.socketRecievedSCInfo.vehicleExitStatus === true || this.socketRecievedSCInfo.txnId) {
          this.isSCActiveVehicleExit = true;
        } else {
          this.isSCActiveVehicleExit = false;
        }
      }
    });
    // console.log(this.data);
    if (this.data.SCInfoResp.expiryDate === null) {
      this.data.SCInfoResp.expiryDate = 'N/A';
    } else {
      this.data.SCInfoResp.expiryDate = new Date(this.data.SCInfoResp.expiryDate).toString().split(' ').slice(0, 5).join(' ');
    }
    if (this.data.SCInfoResp.migrated === false) {
      this.data.SCInfoResp.migrationDate = 'N/A';
    } else {
      this.data.SCInfoResp.migrationDate = new Date(this.data.SCInfoResp.migrationDate).toString().split(' ').slice(0, 5).join(' ');
    }
  }
  createSCTxn() {
    this.scTxnObj = {
      sessionId: this.authService.getSessionId(),
      cardUid: this.data.SCInfoResp.cardUid,
      vehicleNumber: this.data.vehicleNumber
    };
    this.tollscreenService.createSCTxn(this.scTxnObj, this.data.isTowed).subscribe((response) => {
      this.submitSCResp = response;
      if (response.success) {
        this.isSCActiveVehicleExit = false;
      }
      this.onSCInfoResp.emit(this.submitSCResp);
    });
    this.dialogRef.close();
  }
  cancelSCDialog() {
    const cancelObj = {
      description: 'close'
    };
    this.onSCInfoResp.emit(cancelObj);
    this.dialogRef.close();
  }
}





