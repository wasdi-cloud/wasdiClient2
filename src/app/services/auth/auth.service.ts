import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Workspace } from '../../shared/models/workspace.model';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private m_oConstantsService: ConstantsService, private m_oHttp: HttpClient, public m_ooJwtHelper: JwtHelperService) { }

  APIURL: string = this.m_oConstantsService.getAPIURL();
  AUTHURL: string = this.m_oConstantsService.getAUTHURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.m_oConstantsService.getIgnoreWorkspaceApiUrl();

  acSessionChangedEvent: string = 'ac-session-changed';

  acSession = {
    authenticated: false,
    user: {},
    hat: {}
  }

  m_sAuthClientId: string = 'wasdi_client';

  keycloakConfiguration = {
    //'token_endpoint': window.app.url.oidcIssuer + "protocol/openid-connect/token/",
    'token_endpoint': this.m_oConstantsService.getAUTHURL() + "/protocol/openid-connect/token",
    //'end_session_endpoint': window.app.url.oidcIssuer + "protocol/openid-connect/logout/"
    'end_session_endpoint': this.m_oConstantsService.getAUTHURL() + "/protocol/openid-connect/logout"
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('refresh_token');

    return !this.m_ooJwtHelper.isTokenExpired(token);
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
    return this.m_oHttp.post<any>(this.APIURL + '/auth/login', oCredentials)
  }
  /**
   * logout
   */

  logout() {
    //CLEAN COOKIE
    return this.m_oHttp.get(this.APIURL + '/auth/logout')
  }

  /**
   * signingUser
   * @param oUser
   */
  signingUser(oUser: User) {
    return this.m_oHttp.post(this.APIURL + '/auth/register', oUser);
  }

  /**
   * Create sftp account on node
   * @param sEmailInput
   * @returns {*}
   */
  createAccountUpload(sEmailInput: string) {
    var oWorkspace = this.m_oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.post(sUrl + '/auth/upload/createaccount', sEmailInput);//JSON.stringify({"sEmail":sEmailInput})
  }
  /**
    * Delete sftp account
    * @param sIdInput
    * @returns {null|*}
    */
  deleteAccountUpload(sIdInput: string) {
    if (!sIdInput) {
      return null;
    }

    let oWorkspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }
    //TODO: TEST how to add this as delete
    //return this.oHttp.delete(sUrl + '/auth/upload/removeaccount', sIdInput);
  };

  /**
   * Update SFTP Account Password
   * @param sEmailInput
   * @returns {null|*}
   */
  updatePasswordUpload(sEmailInput: string) {
    //check that this is an EMAIL - not truthy expression
    if (sEmailInput)
      return null;

    let oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl: string = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.post<any>(sUrl + '/auth/upload/updatepassword', sEmailInput);
  };

  /**
   * Test if the sftp account exists
   * @returns {*}
   */
  isCreatedAccountUpload() {
    let oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    var sUrl: string = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.get(sUrl + '/auth/upload/existsaccount');
  };

  /**
   * Get the list of sftp files in the node
   * @returns {*}
   */
  getListFilesUpload() {
    let oWorkspace: Workspace = this.m_oConstantsService.getActiveWorkspace();
    let sUrl: string = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.m_oHttp.get(sUrl + '/auth/upload/list');
  };

  changePassword(oPasswords: object) {
    return this.m_oHttp.post(this.APIURL + '/auth/changePassword', oPasswords);
  };

  changeUserInfo(oUserInfo: object) {
    return this.m_oHttp.post(this.APIURL + '/auth/editUserDetails', oUserInfo);
  };

  validateUser(sEmail: string, sValidationCode: string) {
    return this.m_oHttp.get(this.APIURL + '/auth/validateNewUser?email=' + sEmail + '&validationCode=' + sValidationCode);
  }

  recoverPassword(sEmail: string) {
    return this.m_oHttp.get(this.APIURL + '/auth/lostPassword?userId=' + sEmail);
  }

  checkSession() {
      return this.m_oHttp.get(this.APIURL + '/auth/checksession');
  }

  getClientConfig() {
    return this.m_oHttp.get(this.APIURL + "/auth/config");
  }
}
