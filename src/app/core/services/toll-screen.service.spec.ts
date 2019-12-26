import { TollScreenService } from './toll-screen.service';
import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppService } from './app.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { RestService } from './rest.service';
import { SocketService } from './socket.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Services } from '@angular/core/src/view';
import { StompRService, StompState } from '@stomp/ng2-stompjs';
import { Message } from '@stomp/stompjs';
import { Subject } from 'rxjs/Subject';
import { LoggerService } from './logger.service';


describe('TollScreenService', () => {
  let injector: TestBed;
  let service: TollScreenService;
  let httpMock: HttpTestingController;
  let appService: AppService;
  let authService: AuthService;
  let restService: RestService;
  let socketService : SocketService;
  let toasterService: ToasterService;
  let loggerService: LoggerService;
  let sessionService :SessionService;
  const page={
    pageSize: 10
  }
 const sessionId= "36d5121e-2bf5-46e1-bc45-63b54ab475d2";
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule,ToasterModule.forRoot()],
      providers: [TollScreenService, AppService, AuthService, RestService, LoggerService, StompRService,SocketService ,SessionService]
    });
    injector = getTestBed();
    service = injector.get(TollScreenService);
    restService=injector.get(RestService);
  });

  it('should be created', inject([TollScreenService], (service: TollScreenService) => {
    expect(service).toBeTruthy();
  }));
  
  it('should call getSystemAvailableDevices',()=>{
    service.getSystemAvailableDevices();
  });
  it('should call readSmartCard',()=>{
    const scObj = {
      cardSrNumber: "00471",
      sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
      vehicleNumber: "DFBFVDSD"
    }
    service.readSmartCard(scObj);
  });
  it('should call createSCTxn',()=>{
    const scObj = {
      cardUid: "07F700B3",
      sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
      towedVehicle: "no",
      vehicleNumber: "TSER45434"
    }
    const isTowed =false;
    service.createSCTxn(scObj,isTowed);
  });

 it('should call createSCTxn',()=>{
    const scObj = {
      cardUid: "07F700B3",
      sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
      towedVehicle: "yes",
      vehicleNumber: "TSER45434"
    }
    const isTowed =true;
    service.createSCTxn(scObj,isTowed);
  });

  it('should call getCardInfoByVehicleNo',()=>{
    const vehicleNumber ='AP12ER4567';
    service.getCardInfoByVehicleNo(vehicleNumber);
  });

  it('should call getVehicleFareInfo',()=>{
    service.getVehicleFareInfo();
  });

  it('should call getThePaymentTypes',()=>{
    service.getThePaymentTypes();
  });

  it('should call getExemptSubTypes',()=>{
    service.getExemptSubTypes();
  });

  it('should call createLaneTxn',()=>{
   const laneObj={
     amountBalance: 0,
     amountTaken: 0,
     description: "gfgvafvafd faw",
     imageData: {size: 0, type: ""},
     paymentTypeId: "0487b0e0-2ec4-11e9-b210-d663bd873d93",
     sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
     vehicleNumber: "DFSGEAFVERS",
     vehicleTypeId: "98f2c83c-72ee-11e9-a923-1681be663d3e"
   };
   const isTowed = true;
   service.createLaneTxn(laneObj,isTowed);
  });

  it('should call createLaneTxn',()=>{
   const laneObj={
     amountBalance: 0,
     amountTaken: 0,
     description: "gfgvafvafd faw",
     imageData: {size: 0, type: ""},
     paymentTypeId: "0487b0e0-2ec4-11e9-b210-d663bd873d93",
     sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
     vehicleNumber: "DFSGEAFVERS",
     vehicleTypeId: "98f2c83c-72ee-11e9-a923-1681be663d3e"
   };
   const isTowed = false;
   service.createLaneTxn(laneObj,isTowed);
  });

   it('should call createLaneTxn with exempt',()=>{
   const laneObj={
     amountBalance: 0,
        amountTaken: 0,
        description: "sfcSCSDC WEDWEF",
        exempt: "exempt",
        exemptEmergencyEntityId: "d1e51276-725d-11e9-a923-1681be663d3e",
        exemptType: "Emergency",
        imageData: {name: "1576129823241.8YHzc.jpeg", lastModified: 1576129823264, lastModifiedDate: 'Thu Dec 12 2019 11:20:23 GMT+0530 (India Standard Time)', webkitRelativePath: "", size: 216204},
        paymentTypeId: "3cdcb14a-fe34-11e8-8eb2-f2801f1b9fd1",
        sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
        vehicleNumber: "SDVADFVACS",
        vehicleTypeId: "469b6464-7ba8-11e9-8f9e-2a86e4085a59"
   };
   const isTowed = false;
   service.createLaneTxn(laneObj,isTowed);
  });

  it('should call createLaneTxn with exempt of exemptArmy',()=>{
   const laneObj={
     amountBalance: 0,
        amountTaken: 0,
        description: "sfcSCSDC WEDWEF",
        exempt: "exempt",
        exemptArmy: "d1e51276-725d-11e9-a923-1681be663d3e",
        exemptType: "exemptArmy",
        imageData: {name: "1576129823241.8YHzc.jpeg", lastModified: 1576129823264, lastModifiedDate: 'Thu Dec 12 2019 11:20:23 GMT+0530 (India Standard Time)', webkitRelativePath: "", size: 216204},
        paymentTypeId: "3cdcb14a-fe34-11e8-8eb2-f2801f1b9fd1",
        sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
        vehicleNumber: "SDVADFVACS",
        vehicleTypeId: "469b6464-7ba8-11e9-8f9e-2a86e4085a59"
   };
   const isTowed = false;
   service.createLaneTxn(laneObj,isTowed);
  });
  it('should call createLaneTxn with exempt of Other',()=>{
   const laneObj={
     amountBalance: 0,
        amountTaken: 0,
        description: "sfcSCSDC WEDWEF",
        exempt: "exempt",
        exemptOtherEntityId: "d1e51276-725d-11e9-a923-1681be663d3e",
        exemptType: "Other",
        imageData: {name: "1576129823241.8YHzc.jpeg", lastModified: 1576129823264, lastModifiedDate: 'Thu Dec 12 2019 11:20:23 GMT+0530 (India Standard Time)', webkitRelativePath: "", size: 216204},
        paymentTypeId: "3cdcb14a-fe34-11e8-8eb2-f2801f1b9fd1",
        sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
        vehicleNumber: "SDVADFVACS",
        vehicleTypeId: "469b6464-7ba8-11e9-8f9e-2a86e4085a59"
   };
   const isTowed = false;
   service.createLaneTxn(laneObj,isTowed);
  });

  it('should call getPlazaInfo',()=>{
    service.getPlazaInfo();
  });
  it('should call getPlazaLogo ',()=>{
    const plazaId = '469b6464-7ba8-11e9-8f9e-2a86e4085a59';
    service.getPlazaLogo(plazaId);
  });
  it('should call getCurrentShiftInfo',()=>{
    service.getCurrentShiftInfo();
  });

  it('should call getAllLaneTxns',()=>{
    const allLaneTxnsPerPageObj = {
        filter: {laneName: null, shiftName: null, fareType: null, createdBy: null},
        page: {pageNumber: 0, pageSize: 1},
        sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3"
    };
    service.getAllLaneTxns(allLaneTxnsPerPageObj);
  });

  it('should call initiateFleetTxn',()=>{
    const initiateFleetTxnObj = {
        fleetTypeEntityId: "7a21b140-72fb-11e9-a923-1681be663d3e",
        sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3"
    };
    service.initiateFleetTxn(initiateFleetTxnObj);
  });

  it('should call finishFleetTxn',()=>{
    const finishFleetTxnObj = {
        fleetTxnId: "TP200157613042306900794",
        fleetVehicleCount: 5,
        sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3"
    };
    service.finishFleetTxn(finishFleetTxnObj);
  });

  it('should call onFirstComponentButtonClick',()=>{
   service.onFirstComponentButtonClick();
  });

  it('should call sendTriggerUFDUpdates',()=>{
    const ufdObj={
       fareType: null,
       paymentTypeEnum: null,
       sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
       ufdTriggerTypes: "ONLY_VEHICLE_TYPE",
       vehicleType: "LCV"
    };
    service.sendTriggerUFDUpdates(ufdObj);
  });

  it('should call getDistinctVehicleTypes',()=>{
     service.getDistinctVehicleTypes();
  });

  it('should call getDistinctFareTypes',()=>{
    const vehicleType='LCV';
    service.getDistinctFareTypes(vehicleType);
  });

   it('should call getDistinctPaymentTypes',()=>{
    const vehicleType='LCV';
    const fareType = 'Single Journey';
    service.getDistinctPaymentTypes(vehicleType,fareType);
  });

  it('should call getVehicleFare',()=>{
    service.getVehicleFare();
  });

  it('should call getLaneCameraInfo',()=>{
    service.getLaneCameraInfo();
  });

  it('should call getExemptOthersList',()=>{
    service.getExemptOthersList();
  });

  it('should call getExemptEmergencyList',()=>{
    service.getExemptEmergencyList();
  });

  it('should call getFleetList',()=>{
    service.getFleetList();
  });

  it('should call getFreeTxnVehicleTypes',()=>{
    service.getFreeTxnVehicleTypes();
  });

  it('should call verifyAndHandleBarCode',()=>{
    const barcode = 'TP200157613042306900794';
    service.verifyAndHandleBarCode(barcode);
  });

  it('should call createBarCodeReturnTxn',()=>{
   const vehicleNumber = 'AP12WE355';
   const barcode = 'TP200157613042306900794';
   const isTowed = true;
   service.createBarCodeReturnTxn(barcode,vehicleNumber,isTowed);
  });

  it('should call createBarCodeReturnTxn',()=>{
   const vehicleNumber = 'AP12WE355';
   const barcode = 'TP200157613042306900794';
   const isTowed = false;
   service.createBarCodeReturnTxn(barcode,vehicleNumber,isTowed);
  });

  it('should call initiateTowedTxn',()=>{
   const count = 4;
   service.initiateTowedTxn(count);
  });

  it('should call finishTowedTxn',()=>{
   const towedObj = {
     listOfTxns: ["TP200157613324101800795"],
     sessionId: "c692c53d-acd0-4686-be77-40c3f6faddc3",
     towedVehicleEntityId: "31423634169530043"
   };
   service.finishTowedTxn(towedObj);
  });

  it('should call resetOHLS',()=>{
    service.resetOHLS();
  });
});



