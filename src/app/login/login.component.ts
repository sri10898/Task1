import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WS_MESSAGE_TYPES, SocketService, SocketData } from './../core/services/socket.service';
import { TollScreenService } from './../core/services/toll-screen.service';
import { AuthService } from './../core/services/auth.service';
import { SessionService } from '../core/services/session.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.css']
})

export class LoginComponent implements OnInit {
  toasterService: ToasterService;
  loginForm: FormGroup;
  loading = true;
  address: string;
  logoResponse: any;
  existingLogo: any;
  loginUserInfo: any = {};
  constructor(private socketService: SocketService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private tollscreenService: TollScreenService,
    private sessionService: SessionService,
    toasterService: ToasterService) { this.toasterService = toasterService; }
  public config: ToasterConfig = new ToasterConfig({
    showCloseButton: true,
    tapToDismiss: false,
    timeout: 1500,
    positionClass: 'toast-top-right',
    animation: 'fade',
    preventDuplicates: true
  });

  ngOnInit() {
    this.getPlazaInfo();
    this.buildForm();
  }

  getPlazaInfo() {
    this.tollscreenService.getPlazaInfo().subscribe((response) => {
      if (response.success) {
        // console.log(response);
        this.address = response.info.address;
        this.getExistingLogo(response.info.id);
      }
    });
  }

  getExistingLogo(plazaId) {
    this.tollscreenService.getPlazaLogo(plazaId).subscribe((res) => {
      if (res.success) {
        this.logoResponse = res;
        console.log(this.logoResponse);
        const existingLogo = this.logoResponse.imageData.fileBytes;
        this.existingLogo = 'data:image/jpeg;base64,' + existingLogo;
      }
    });
  }
  omit_special_char(evt) {
    console.log('charcode', evt);
    evt = (evt) ? evt : window.event;
    const charCode = (evt.which) ? evt.which : evt.keyCode;
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || (charCode > 47 && charCode < 58) || charCode === 51) {
      return true;
    }
    return false;
  }

  buildForm() {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required, Validators.pattern('[a-zA-Z0-9\s]{3,20}$')]],
      plainTextPassword: [null, [Validators.required, Validators.pattern(/^(\w{3,20})$/)]]
    });
  }

  onSubmit() {
    this.sessionService.loginAdmin({
      username: this.loginForm.controls.username.value,
      plainTextPassword: this.loginForm.controls.plainTextPassword.value
    }).subscribe((res: any) => {
      if (res.success) {
        // console.log(res);
        this.loading = false;
        this.loginUserInfo = res;
        localStorage.removeItem('lane.sessionId');
        localStorage.removeItem('lane.userInfo');
        localStorage.setItem('lane.sessionId', this.loginUserInfo.sessionId);
        localStorage.setItem('lane.userInfo', JSON.stringify(this.loginUserInfo));
        this.authService.setSessionId(this.loginUserInfo.sessionId);
        this.authService.setUserData(this.loginUserInfo);
        this.router.navigate(['toll-screen']);
        this.toasterService.pop('success', '', 'Your Loggedin successfully!');
        this.socketService.initialize();
      } else {
        this.toasterService.pop('error', '', res.description);
        setTimeout(() => {
          this.toasterService.clear();
        }, 1500);

      }
    });
  }
}
