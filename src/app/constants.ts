import { Validators } from '@angular/forms';

import { SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';

export const USER_TYPES: any = {
  ADMIN: 'ADMIN',
  END_USER: 'END_USER'
};

export const FORM_VALIDATION_RULES: any = {
  email: {
    pattern: Validators.pattern(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i)
  },
  name: {
    pattern: Validators.pattern(/^[a-zA-Z][a-zA-Z0-9\\S]+$/)
  },
  mobile: {
    pattern: Validators.pattern(/^[6789]\d{9}$/)
  },
  password: {
    pattern: Validators.pattern(/^[a-zA-Z0-9\!\@\$\^\*\(\)\_\+\-\.\~\`\?\=\|\[\]\{\}\;]*$/)
  }
};

export const SNOTIFY_DIALOG_CONFIG: SnotifyToastConfig = {
  bodyMaxLength: 80,
  titleMaxLength: 15,
  backdrop: 0.1,
  position: SnotifyPosition.centerCenter,
  showProgressBar: false,
  closeOnClick: true,
  timeout: 0,
  pauseOnHover: false
};

export const SNOTIFY_TOAST_CONFIG: SnotifyToastConfig = {
  bodyMaxLength: 80,
  titleMaxLength: 15,
  backdrop: 0.1,
  position: SnotifyPosition.rightBottom,
  timeout: 3000,
  showProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false
};

export const SOCIAL_PLATFORM_DOMAIN_TO_FA_ICONS_MAP: any = {
  'facebook.com'   : 'fa-facebook-square',
  'linkedin.com'   : 'fa-linkedin-square',
  'plus.google.com': 'fa-google-plus-square',
  'angel.co'       : 'fa-angellist ',
  'twitter.com'    : 'fa-twitter-square',
  'blogspot.com'   : 'fa-rss-square',
  'xing.com'       : 'fa-xing-square ',
  'klout.com'      : ''
};
