import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../shared/models/user.model';
import { Workspace } from '../shared/models/workspace.model';
import { secrets } from 'src/environments/secrets'

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  COOKIE_EXPIRE_TIME_DAYS: number = 1;

  URL: string = environment.url;

  WEBSTOMPURL: string = environment.webstompUrl;

  APIURL: string = this.URL + 'rest';

  AUTHURL: string = environment.authUrl;

  BASEURL: string = environment.baseurl;

  WMSURL: string = environment.wmsUrl;

  //IMPORTANT QUESTION HERE -> Check notes
  m_bIgnoreWorkspaceApiUrl: boolean = false;

  m_oUser: User = {} as User;

  m_oActiveWorkspace: Workspace = {} as Workspace;

  m_sRabbitUser: string = secrets.RABBIT_USER;

  m_sRabbitPassword: string = secrets.RABBIT_PASSWORD;

  m_sSelectedApplication: string = "";

  m_sSelectedReviewId: string = "";

  m_oSelectedReview: object = {};

  m_oSelectedComment: object = {};


  // isMobile() {
  //   if (navigator.userAgent.match((/Android)/i)) ||
  //     navigator.userAgent.match(/BlackBerry/i) ||
  //     navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
  //     navigator.userAgent.match(/Opera Mini/i) ||
  //     navigator.userAgent.match(/IEMobile/i)
  //   ) {
  //     return true;
  //   }

  //   return false;
  // }

  getRabbitUser() {
    return this.m_sRabbitUser;
  }

  getRabbitPassword() {
    return this.m_sRabbitPassword
  }

  getURL() {
    return this.URL;
  }

  getAUTHURL() {
    return this.AUTHURL;
  }

  getAPIURL() {
    return this.APIURL;
  }

  /**
  * Get flag ignore workspace's Api Url
  * @returns {boolean}
  */
  getIgnoreWorkspaceApiUrl() {
    return this.m_bIgnoreWorkspaceApiUrl === true;
  }

  getSessionId() {
    if (Object.keys(this.m_oUser).length !== 0) {
      if (this.m_oUser.sessionId !== null) {
        return this.m_oUser.sessionId;
      }
    }
    return "";
  }

  pad(number: number, length: number) {
    let string: string = "" + number;
    while (string.length < length) {
      string = "0" + string;
    }
    return string;
  }


  // getTimezoneOffset() {
  //   let offset: any = new Date().getTimezoneOffset();
  //   offset = ((offset < 0 ? "+" : "-") + this.pad(parseInt(Math.abs(offset / 60)), 2) + this.pad(Math.abs(offset % 60), 2))

  //   return offset
  // }
  /*------------- USER --------------*/
  setUser(oUser: User) {
    this.m_oUser = oUser;

    this.setCookie("oUser", this.m_oUser, this.COOKIE_EXPIRE_TIME_DAYS);
  }

  getUser() {
    if (Object.keys(this.m_oUser).length === 0) {
      let oUser = this.getCookie("oUser");

      if (oUser) {
        this.m_oUser = oUser;
      } else {
        this.m_oUser = {} as User;
      }
    }
    return this.m_oUser;
  }

  getUserId(): string {
    if (!this.m_oUser) {
      return "";
    }
    return this.m_oUser.userId;
  }

  /*------------- WORKSPACES --------------*/
  setActiveWorkspace(oWorkspace: Workspace) {
    this.m_oActiveWorkspace = oWorkspace;
  }

  getActiveWorkspace() {
    return this.m_oActiveWorkspace;
  }

  setSelectedApplication(sProcessorName: string) {
    this.m_sSelectedApplication = sProcessorName
  }

  getSelectedApplication() {
    return this.m_sSelectedApplication;
  }

  setSelectedReviewId(sReviewId: string) {
    this.m_sSelectedReviewId = sReviewId;
  }

  getSelectedReviewId() {
    return this.m_sSelectedReviewId;
  }

  setSelectedReview(oReview: object) {
    this.m_oSelectedReview = oReview;
  }

  getSelectedReview() {
    return this.m_oSelectedReview;
  }

  setSelectedComment(oComment: object) {
    this.m_oSelectedComment = oComment;
  }

  getSelectedComment() {
    return this.m_oSelectedComment;
  }

  getStompUrl() {
    return this.WEBSTOMPURL;
  }
  /*------------- COOKIES --------------*/

  setCookie(cookieName: string, cookieValue: any, exDays: number) {
    let date = new Date();
    date.setTime(date.getTime() + (exDays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();

    //FOR OBJECT ELEMENT I ADD cvalue=JSON.stringify(cvalue);
    cookieValue = JSON.stringify(cookieValue);
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
  }

  getCookie(cookieName: string) {
    // let name: string = cookieName + "=";
    // let cookieArray: Array<string> = document.cookie.split(";");

    // for (let index: number = 0; index < cookieArray.length; index++) {
    //   let cookie: string = cookieArray[index];

    //   while (cookie.charAt(0) === ' ') {
    //     return JSON.parse(cookie.substring(name.length, cookie.length));
    //   }
    // }
    if (!document.cookie) {
      return ""
    }
    return JSON.parse(document.cookie.substring(6));
  }

  deleteCookie(cookieName: string) {
    this.setCookie(cookieName, "", -1000);
  }
  /**************************************************/

  /**
   * LOGOUT
   */
  logOut() {
    this.deleteCookie("oUser");
    this.m_oUser = {} as User;
  }

  /**
     * Logout from google
     */
  /*
  this.logOutGoogle = function ()
  {
      try
      {
          if (_.isNil(gapi) == false)
          {
              var oController = this;
              if (_.isNil(gapi.auth2) === true)
              {
                  gapi.load('auth2', function () {
                      gapi.auth2.init();
                      oController.googleSignOutAPI();
                  });
              }
              else
              {
                  this.googleSignOutAPI();
              }
          }
          else
          {
              throw "Google API null or undefined, cannot perform logout";
          }
      }catch (e)
      {
          console.error("logOutGoogle(): ", e);
      }
  }
  */
  /**
   * Goggle sign out
   */
  /*
  this.googleSignOutAPI = function()
  {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
          console.log('User signed out.');
      });
  };
  */
  /**
   * Get WASDI OGC WMS Server Address
   */
  getWmsUrlGeoserver() {
    return this.WMSURL;
  }

  /* MEMBERS NEED TO USE METHODS*/
  //this.m_oUser = this.getUser();

  checkLocalStorageSupport() {
    if (typeof (Storage) !== "undefined") {
      return true;
    } else {
      console.log("Error - no web storage support")
      return false;
    }
  }

  getItemInLocalStorage(sName: string) {
    if (!sName) {
      return false;
    }
    //retrieve
    return localStorage.getItem(sName);
  }

  removeLocalStorageItem(sName: string) {
    if (!sName) {
      return false;
    }
    return localStorage.removeItem(sName);
  }

  constructor() { }
}
