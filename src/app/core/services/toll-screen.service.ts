import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { RestService } from './rest.service';
import {HttpClient, HttpParams, HttpRequest, HttpEvent, HttpResponse} from '@angular/common/http';

import { EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class TollScreenService {

  invokeFirstComponentFunction = new EventEmitter();
  subsVar: Subscription;

  hostName: any;
  deviceHostName: any;
  SocketScInfoCD: any = {};
  SocketVExitInfo: any = {};
  constructor(
    private appService: AppService,
    private authService: AuthService,
    private restService: RestService,
    private http: HttpClient
  ) {
    this.hostName = this.hostName = this.appService.getConfigParam('HOST_NAME');
    this.deviceHostName = this.appService.getConfigParam('DEVICE_CHANGES');
}

getSystemAvailableDevices(): Observable<any> {
  return this.restService.post(this.deviceHostName + '/api/v1/device/getstatus/all', {});
}

// setSocketVExitInfo(data) {
//   console.log(data);
//   this.SocketVExitInfo = data;
// }


readSmartCard(SCReadObj: Object): Observable<any> {
  return this.restService.post(this.hostName + '/devices/readSmartCard' , SCReadObj);
}

createSCTxn(SCTxnObj, isTowed): Observable<any>  {
  if (isTowed === true) {
    SCTxnObj.towedVehicle = 'yes';
  } else {
    SCTxnObj.towedVehicle = 'no';
  }
  return this.restService.post(this.hostName + '/smartcard/generateSCTxn' , SCTxnObj);
}
getCardInfoByVehicleNo(vehicleNumber): Observable<any>  {
  return this.restService.post(this.hostName + '/smartcard/getActiveCardInfoByVehicleNumber' , {sessionId : this.authService.getSessionId(), vehicleNumber: vehicleNumber});
}



getVehicleFareInfo(): Observable<any> {
  const sessionId = this.authService.getSessionId();
  return  this.restService.post(this.hostName + '/vehicles/fareInfo', {sessionId});
}
getThePaymentTypes(): Observable<any>  {
  const sessionId = this.authService.getSessionId();
  return this.restService.post(this.hostName + '/vehicles/transactionTypes', {sessionId});
}

getExemptSubTypes(): Observable<any> {
  const sessionId = this.authService.getSessionId();
  return this.restService.post(this.hostName + '/transactions/getExemptSubTypes', {sessionId});
}

createLaneTxn(laneTxnObj, isTowed): Observable<HttpEvent<any>> {
  console.log(laneTxnObj);
  const formData = new FormData();
  if (laneTxnObj.exempt === 'exempt') {
    if (laneTxnObj.exemptType === 'Other') {
      formData.append('exemptOtherEntityId', laneTxnObj.exemptOtherEntityId);

    } else if (laneTxnObj.exemptType === 'Emergency') {
      formData.append('exemptEmergencyEntityId', laneTxnObj.exemptEmergencyEntityId);
    } else {
      formData.append('exemptArmy', laneTxnObj.exemptArmy);
    }
    // if(laneTxnObj.description){
    //   formData.append('description',laneTxnObj.description);
    // }
  }

  formData.append('sessionId', laneTxnObj.sessionId);
  formData.append('vehicleTypeId', laneTxnObj.vehicleTypeId);
  formData.append('vehicleNumber', laneTxnObj.vehicleNumber);
  formData.append('amountBalance', laneTxnObj.amountBalance);
  formData.append('amountTaken', laneTxnObj.amountTaken);
  formData.append('paymentTypeId', laneTxnObj.paymentTypeId);
  formData.append('imageData', laneTxnObj.imageData);
  formData.append('txnDescription', laneTxnObj.description);
  console.log(formData);
  console.log(laneTxnObj.imageData);
  //  if (laneTxnObj.imageData !== null ) {
  //   console.log('how');
  //   formData.append('imageData', laneTxnObj.imageData);
  // }
  if (isTowed === true) {
    formData.append('towedVehicle', 'yes');
  } else {
    formData.append('towedVehicle', 'no');
  }
  const params = new HttpParams();
  const options = {
    params: params,
    reportProgress: true,
  };
  const req = new HttpRequest('POST', this.hostName + '/vehicles/createLaneTxn', formData, options);
  return this.http.request(req);
}

getPlazaInfo(): Observable<any>  {
  // console.log("this is getLaneInfo service function");
  return this.restService.post(this.hostName + '/plaza/getPlazaInfo', {body: null});
}

getPlazaLogo(plazaId): Observable<any> {
  console.log('getplazalogo service', plazaId);
  const payload = {
    tollPlazaEntityId: plazaId
  };
  const params = new HttpParams();
  const options = {
    params: params,
    reportProgress: true,
  };
  // console.log("getplazalogo function",payload);
  return this.restService.post(this.hostName  + '/plaza/getPlazaLogoById', payload , options);


}

  getCurrentShiftInfo(): Observable<any>  {
    const sessionId = this.authService.getSessionId();
    return this.restService.post(this.hostName + '/lanes/getCurrentShiftInfo', {sessionId});
  }

  getAllLaneTxns(allLaneTxnsPerPageObj): Observable<any> {
    return this.restService.post(this.hostName + '/transactions/getLaneTxnList', allLaneTxnsPerPageObj);
  }

  initiateFleetTxn(fleetInitiateObj): Observable<any> {

    return this.restService.post(this.hostName + '/vehicles/initiateFleetTxn', fleetInitiateObj);
  }
  finishFleetTxn(fleetObj): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/finishFleetTxn', fleetObj);
  }
  onFirstComponentButtonClick() {
    this.invokeFirstComponentFunction.emit();
  }

  sendTriggerUFDUpdates(ufdTriggerObj): Observable<any> {
    return this.restService.post(this.hostName + '/lane/triggerUFDUpdates', ufdTriggerObj);
  }

  getDistinctVehicleTypes(): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/getDistinctVehicleTypes' , {sessionId : this.authService.getSessionId()});
  }

  getDistinctFareTypes(vehicleType): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/getDistinctFareTypesByVehicleType' , {sessionId : this.authService.getSessionId(), vehicleType: vehicleType});
  }

  getDistinctPaymentTypes(vehicleType, fareType): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/getDistinctPaymentTypes' , {sessionId : this.authService.getSessionId(), vehicleType: vehicleType, fareType: fareType});
  }
  getVehicleFare(): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/fareInfo' , {sessionId: this.authService.getSessionId()} );
  }

  getLaneCameraInfo(): Observable<any> {
    return this.restService.post(this.deviceHostName + '/api/v1/device/deviceconfig', {deviceType : 'LANE_CAMERA'});
  }

  getExemptOthersList(): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/getExemptOthersList' , {sessionId: this.authService.getSessionId()} );
  }
  getExemptEmergencyList(): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/getExemptEmergencyList', {sessionId: this.authService.getSessionId()} );
  }
  getFleetList(): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/getFleetList', {sessionId: this.authService.getSessionId()} );
  }
  getFreeTxnVehicleTypes(): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/getFreeTxnVehicleTypes', {sessionId: this.authService.getSessionId()} );
  }


  verifyAndHandleBarCode(barcode): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/verifyAndHandleBarCode', {sessionId: this.authService.getSessionId(), barCode: barcode} );
  }

  createBarCodeReturnTxn(barcode, vehicleNumber, isTowed): Observable<any> {
    if (isTowed === true) {
      return this.restService.post(this.hostName + '/vehicles/createBarCodeReturnTxn', {sessionId: this.authService.getSessionId(), barCode: barcode, vehicleNumber: vehicleNumber, towedVehicle: 'yes'} );
    } else {
      return this.restService.post(this.hostName + '/vehicles/createBarCodeReturnTxn', {sessionId: this.authService.getSessionId(), barCode: barcode, vehicleNumber: vehicleNumber , towedVehicle: 'no'} );
    }

  }




  initiateTowedTxn(count): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/initiateTowedTxn', {sessionId: this.authService.getSessionId(), towedInitVehicleCount: count} );
  }

  finishTowedTxn(towedTxnObj): Observable<any> {
    return this.restService.post(this.hostName + '/vehicles/finishTowedTxn', towedTxnObj  );
  }

  resetOHLS(): Observable<any> {
    return this.restService.post(this.hostName + '/lanes/resetOHLS', {sessionId: this.authService.getSessionId() } );
  }
}



















