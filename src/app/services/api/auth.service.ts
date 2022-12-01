import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'src/app/shared/user.model';
import { Workspace } from 'src/app/shared/workspace.model';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  APIURL: string = this.oConstantsService.getAPIURL();
  AUTHURL: string = this.oConstantsService.getAUTHURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  acSessionChangedEvent = 'ac-session-changed';
  acSession: {
    authenticated: boolean,
    user: User,
    hat: {}
  } = {
      authenticated: false,
      user: {} as User,
      hat: {}
    }

  m_sAuthClientId = 'wasdi_client';

  keycloakConfiguration = {
    //'token_endpoint': window.app.url.oidcIssuer + "protocol/openid-connect/token/",
    'token_endpoint': this.oConstantsService.getAUTHURL() + "/protocol/openid-connect/token",
    //'end_session_endpoint': window.app.url.oidcIssuer + "protocol/openid-connect/logout/"
    'end_session_endpoint': this.oConstantsService.getAUTHURL() + "/protocol/openid-connect/logout"
  }

  constructor(private oHttp: HttpClient, private oConstantsService: ConstantsService) { }

  /**
   * To Do Check - commented for now to replace $rootScope - doesn't exist in Angualr2
   */
  // raiseSessionChanged() {
  //   $rootScope.acSession = acSession
  //   $rootScope.$broadcast(acSessionChangedEvent, acSession)
  // }

  // resetSession() {
  //   this.acSession = {
  //     authenticated: false,
  //     user: {} as User,
  //     hat: {}
  //   };
  //   //raiseSessionChanged();
  // }
  // clearToken() {
  //   // delete window.localStorage.access_token
  //   // delete window.localStorage.refresh_token
  //   resetSession()
  // }

  getTokenObj() {
    if (localStorage['access_token'] && localStorage['refresh_token'])
      return { 'access_token': localStorage['access_token'], 'refresh_token': localStorage['refresh_token'] }
    delete localStorage['access_token']
    delete localStorage['refresh_token']
    return null;
  }

  //What 'type' is token?
  saveToken(token: any) {
    window.localStorage['access_token'] = token['access_token']
    window.localStorage['refresh_token'] = token['refresh_token']
  }

  login(oCredentials: { userId: string, userPassword: string }) {

    let sParams = 'client_id=' + this.m_sAuthClientId + '&grant_type=password&username=' + oCredentials.userId + '&password=' + oCredentials.userPassword
    let sAddress = this.keycloakConfiguration['token_endpoint'];
    console.log(oCredentials)
    return this.oHttp.post(sAddress,
      sParams,
      { 'headers': { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // return this.m_oHttp.post(this.AUTHURL + '/auth/login', oCredentials);
    //return this.m_oHttp.post('http://localhost:8080/wasdiwebserver/rest//auth/login',oCredentials);
  }
  legacyLogin(oCredentials: { userId: string, userPassword: string }) {
    console.log(oCredentials);
    return this.oHttp.post(this.APIURL + '/auth/login', oCredentials);
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
    
    //return this.oHttp.delete(sUrl + '/auth/upload/removeaccount', sIdInput);
  };

  /**
   * Update SFTP Account Password
   * @param sEmailInput
   * @returns {null|*}
   */
  // updatePasswordUpload(sEmailInput: string) {
  //   //check that this is an EMAIL - not truthy expression
  //   if (sEmailInput)
  //     return null;

  //   let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
  //   let sUrl: string = this.APIURL;
  //   if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
  //     sUrl = oWorkspace.apiUrl;
  //   }

  //   return this.oHttp.post(sUrl + '/auth/upload/updatepassword', sEmailInput);
  // };

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
