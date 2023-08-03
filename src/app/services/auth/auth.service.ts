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

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient, public oJwtHelper: JwtHelperService) { }

  APIURL: string = this.oConstantsService.getAPIURL();
  AUTHURL: string = this.oConstantsService.getAUTHURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

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

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('refresh_token');

    return !this.oJwtHelper.isTokenExpired(token);
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
    return this.oHttp.post<any>(this.APIURL + '/auth/login', oCredentials)
  }
  /**
   * logout
   */

  logout() {
    //CLEAN COOKIE
    return this.oHttp.get(this.APIURL + '/auth/logout')
  }

  /**
   * signingUser
   * @param oUser
   */
  signingUser(oUser: User) {
    return this.oHttp.post(this.APIURL + '/auth/register', oUser);
  }

  /**
   * Create sftp account on node
   * @param sEmailInput
   * @returns {*}
   */
  createAccountUpload(sEmailInput: string) {
    var oWorkspace = this.oConstantsService.getActiveWorkspace();
    var sUrl = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.post(sUrl + '/auth/upload/createaccount', sEmailInput);//JSON.stringify({"sEmail":sEmailInput})
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

    let oWorkspace = this.oConstantsService.getActiveWorkspace();
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

    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl: string = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.post<any>(sUrl + '/auth/upload/updatepassword', sEmailInput);
  };

  /**
   * Test if the sftp account exists
   * @returns {*}
   */
  isCreatedAccountUpload() {
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    var sUrl: string = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get(sUrl + '/auth/upload/existsaccount');
  };

  /**
   * Get the list of sftp files in the node
   * @returns {*}
   */
  getListFilesUpload() {
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl: string = this.APIURL;
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get(sUrl + '/auth/upload/list');
  };

  changePassword(oPasswords: object) {
    return this.oHttp.post(this.APIURL + '/auth/changePassword', oPasswords);
  };

  changeUserInfo(oUserInfo: object) {
    return this.oHttp.post(this.APIURL + '/auth/editUserDetails', oUserInfo);
  };

  validateUser(sEmail: string, sValidationCode: string) {
    return this.oHttp.get(this.APIURL + '/auth/validateNewUser?email=' + sEmail + '&validationCode=' + sValidationCode);
  }

  recoverPassword(sEmail: string) {
    return this.oHttp.get(this.APIURL + '/auth/lostPassword?userId=' + sEmail);
  }
}
