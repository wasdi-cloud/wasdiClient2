import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

//Import Services:
import { NotificationDisplayService } from './notification-display.service';

//Import enviornment information: 
import { EnvService } from "../services/env.service";

//Import Models:
import { User } from '../shared/models/user.model';
import { Workspace } from '../shared/models/workspace.model';

//Import Utilities:
import FadeoutUtils from '../lib/utils/FadeoutJSUtils';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  COOKIE_EXPIRE_TIME_DAYS: number = 1;

  URL: string = this.m_oEnvService.url;

  WEBSTOMPURL: string = this.m_oEnvService.webstompUrl;

  APIURL: string = this.URL + 'rest';

  AUTHURL: string = this.m_oEnvService.authUrl;

  BASEURL: string = this.m_oEnvService.baseurl;

  WMSURL: string = this.m_oEnvService.wmsUrl;

  m_bIgnoreWorkspaceApiUrl: boolean = false;

  m_oUser: User = {} as User;

  // m_oActiveWorkspace: Workspace = {} as Workspace;
  m_oActiveWorkspaceSubscription: BehaviorSubject<Workspace> = new BehaviorSubject<Workspace>({} as Workspace);

  _m_oActiveWorkspaceSubscription$ = this.m_oActiveWorkspaceSubscription.asObservable();

  m_oActiveWorkspace: Workspace = {} as Workspace;

  m_sRabbitUser: string = this.m_oEnvService.rabbitUser;

  m_sRabbitPassword: string = this.m_oEnvService.rabbitPassword;

  m_sSelectedApplication: string = "";

  m_sSelectedReviewId: string = "";

  m_oSelectedReview: object = {};

  m_oSelectedComment: object = {};

  m_aoActiveSubscriptions: Array<any> = [];

  m_aoUserProjects: Array<any> = [];

  m_oActiveProject: any = null;

  m_sAccountType: string = "";

  private m_oSkinSubject = new BehaviorSubject<any>(null);
  m_oSkin$ = this.m_oSkinSubject.asObservable();  

  m_oUserSkin: any = {
	  logoImage: "/assets/icons/logo-only.svg",
	  logoText: "/assets/icons/logo-name.svg",
	  helpLink: "",
	  supportLink: "",  
    brandMainColor: "",
    brandSecondaryColor: "",
    defaultCategories: [],
    bLoadedFromServer: false
  };

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oTitleService: Title,
    private m_oTranslate: TranslateService,
    private m_oEnvService: EnvService
  ) { }

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
    this.m_oActiveWorkspace = oWorkspace
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) || !oWorkspace.workspaceId) {
      this.m_oTitleService.setTitle("WASDI 2.0");
    }
    //Set Workspace Subscription for Subscribed Components
    this.m_oActiveWorkspaceSubscription.next(oWorkspace);
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

  getCookie(sCookieName: string) {

    try {

      if (!document.cookie) {
        return "";
      }

      let sName: string = sCookieName + "=";
      let aCookieArray: Array<string> = document.cookie.split(";");

      for (let iIndex: number = 0; iIndex < aCookieArray.length; iIndex++) {
        let sCookie: string = aCookieArray[iIndex];

        sCookie = sCookie.trim()
        if (sCookie.startsWith(sName)) {
          return JSON.parse(sCookie.substring(sName.length, sCookie.length));
        }
      }

      return "";
    } catch (sError) {
      console.log(`${document.cookie} and ${sError}`)
      return "";
    }

  }

  deleteCookie(cookieName: string) {
    this.setCookie(cookieName, "", -1000);
  }

  /*------------- SUBSCRIPTIONS --------------*/

  /**
   * Return array of user's active subscriptions
   * @returns  {aoSubscriptions}
   */
  getActiveSubscriptions() {
    return this.m_aoActiveSubscriptions;
  }

  /**
   * Set the user's active subscriptions
   * @param {sActiveSubscriptions}
   */
  setActiveSubscriptions(asSubscriptions) {
    this.m_aoActiveSubscriptions = asSubscriptions;
  }

  /**
    * Return the array of user's active projects
    * @returns {aoProjects}
    */
  getUserProjects() {
    return this.m_aoUserProjects;
  }

  /**
    * Set the user projects array
    * @param {*} aoProjects 
    */
  setUserProjects(aoProjects) {
    this.m_aoUserProjects = aoProjects;
  }

  /**
   * Set the user's active project
   * @param {*} oProject
   */
  setActiveProject(oProject) {
    this.m_oActiveProject = oProject
  }

  /**
   * Returns the user's active project
   */
  getActiveProject() {
    return this.m_oActiveProject;
  }

  /**
   * Returns boolean representing whether or not the user has a valid subscription AND active Project;
   */
  checkProjectSubscriptionsValid() {
    let sMessage: string;
    if (this.m_aoActiveSubscriptions.length === 0) {
      sMessage = this.m_oTranslate.instant("ACTIVE_SUBSCRIPTION_ERROR_2");
      this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'alert');
      return false;
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveProject) === true || this.m_oActiveProject.projectId === null) {
      sMessage = this.m_oTranslate.instant("ACTIVE_SUBSCRIPTION_ERROR");
      this.m_oNotificationDisplayService.openAlertDialog(sMessage, '', 'alert');
      return false;
    }

    return true;
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


  getSkin() {
    if (this.m_oSkinSubject.value) {
      return this.m_oSkinSubject.value;
    }
    return this.m_oUserSkin;
  }

  setSkin(oSkin: any) {
    this.m_oUserSkin = oSkin;
    this.m_oSkinSubject.next(oSkin);
  }
}
