import { Injectable } from '@angular/core';
import { ConstantsService } from './constants.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oConstantsService: ConstantsService, private oHttpClient: HttpClient) { }

  APIURL: string = this.oConstantsService.getAPIURL();
  AUTHURL: string = this.oConstantsService.getAUTHURL();

  acSessionChangedEvent: string = 'ac-session-changed';

  acSession = {
    authenticated: false,
    user: {},
    hat: {}
  }

  m_sAuthClientId: string = 'wasdi_client';

  keycloakConfiguration = {
    //'token_endpoint': window.app.url.oidcIssuer + "protocol/openid-connect/token/",
    'token_endpoint': this.oConstantsService.getAUTHURL() + "/protocol/openid-connect/token",
    //'end_session_endpoint': window.app.url.oidcIssuer + "protocol/openid-connect/logout/"
    'end_session_endpoint': this.oConstantsService.getAUTHURL() + "/protocol/openid-connect/logout"
  }

  //Get token Object
  getTokenObject() {
    if (localStorage.getItem('access_token') && localStorage.getItem('refresh_token')) {
      return {
        'access_token': localStorage.getItem('access_token'),
        'refresh_token': localStorage.getItem('refresh_token')
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return null;
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token)
    localStorage.setItem('refresh_token', token)
  }
  legacyLogin(oCredentials: any) {
    return this.oHttpClient.post<any>(this.APIURL + '/auth/login', oCredentials)
  }
}
