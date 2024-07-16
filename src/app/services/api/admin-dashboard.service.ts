import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpResponse as DefaultResponse } from 'src/app/shared/models/http-response.model';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  APIURL: string = this.oConstantsService.getAPIURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  constructor(private m_oHttp: HttpClient, private oConstantsService: ConstantsService) { }

  /**
   * Find User from partial name
   * @param sPartialName 
   * @returns 
   */
  findUsersByPartialName(sPartialName: string) {
    return this.m_oHttp.get<any>(this.APIURL + '/admin/usersByPartialName?partialName=' + sPartialName);
  };

  /**
   * Find Workspace from partial name
   * @param sPartialName 
   * @returns 
   */
  findWorkspacesByPartialName(sPartialName: string) {
    return this.m_oHttp.get(this.APIURL + '/admin/workspacesByPartialName?partialName=' + sPartialName);
  };

  /**
   * Find resource permissions.
   * @param sResourceType 
   * @param sResourceId 
   * @param sUserId 
   * @returns 
   */
  findResourcePermissions(sResourceType: string, sResourceId: string, sUserId: string) {
    let sUrl = this.APIURL + '/admin/resourcePermissions?';

    if (sResourceType) {
      sUrl += '&resourceType=' + sResourceType;
    }

    if (sResourceId) {
      sUrl += '&resourceId=' + sResourceId;
    }

    if (sUserId) {
      sUrl += '&userId=' + sUserId;
    }

    return this.m_oHttp.get<any>(sUrl);
  };

  /**
   * Add a resource permission
   * @param sResourceType 
   * @param sResourceId 
   * @param sUserId 
   * @param sRights 
   * @returns 
   */
  addResourcePermission(sResourceType: string, sResourceId: string, sUserId: string, sRights: string) {
    return this.m_oHttp.post<DefaultResponse>(this.APIURL + '/admin/resourcePermissions?resourceType=' + sResourceType + "&resourceId=" + sResourceId + "&userId=" + sUserId + '&rights=' + sRights, {});
  };

  /**
   * Remove a resource permission
   * @param sResourceType 
   * @param sResourceId 
   * @param sUserId 
   * @returns 
   */
  removeResourcePermission(sResourceType: string, sResourceId: string, sUserId: string) {
    return this.m_oHttp.delete(this.APIURL + '/admin/resourcePermissions?resourceType=' + sResourceType + "&resourceId=" + sResourceId + "&userId=" + sUserId);
  };

  /**
   * Get the latest metric for a specific node
   * @param sNodeCode 
   * @returns 
   */
  getLatestMetricsEntryByNode(sNodeCode: string) {
    return this.m_oHttp.get(this.APIURL + '/admin/metrics/latest?nodeCode=' + sNodeCode);
  };

  /**
   * Get a paginated list of users
   * @param sNameFilter Filter to apply to name, surname and user Id
   * @param iOffset Starting index
   * @param iLimit Nuber of elements to return
   * @param sSortedBy Name of the column to use to order by
   * @param sOrder Direction of the order
   * @returns List of View models
   */
  getUsersPaginatedList(sNameFilter: string, iOffset: number, iLimit: number, sSortedBy: string, sOrder: string) {
    let bQuestionMarkAdded = false;
    let sUrl = this.APIURL + "/admin/users/list"

    if (FadeoutUtils.utilsIsStrNullOrEmpty(sNameFilter)) {
      if (!bQuestionMarkAdded) {
        sUrl += "?"
        bQuestionMarkAdded = true;
      }
      else {
        sUrl += "&";
      }
      sUrl += "partialName=" + sNameFilter;
    }

    if (iOffset != null) {
      if (!bQuestionMarkAdded) {
        sUrl += "?"
        bQuestionMarkAdded = true;
      }
      else {
        sUrl += "&";
      }
      sUrl += "offset=" + iOffset;
    }

    if (iLimit != null) {
      if (!bQuestionMarkAdded) {
        sUrl += "?"
        bQuestionMarkAdded = true;
      }
      else {
        sUrl += "&";
      }
      sUrl += "limit=" + iLimit;
    }


    if (!FadeoutUtils.utilsIsStrNullOrEmpty(sSortedBy)) {
      if (!bQuestionMarkAdded) {
        sUrl += "?"
        bQuestionMarkAdded = true;
      }
      else {
        sUrl += "&";
      }
      sUrl += "sortedby=" + sSortedBy;

    }

    if (!FadeoutUtils.utilsIsStrNullOrEmpty(sOrder)) {
      if (!bQuestionMarkAdded) {
        sUrl += "?"
        bQuestionMarkAdded = true;
      }
      else {
        sUrl += "&";
      }
      sUrl += "order=" + sOrder;
    }
    return this.m_oHttp.get(sUrl);
  }

  /**
   * Get an overview of the users (number of users of different categories)
   * @returns UsersSummaryViewModel
   */
  getUsersSummary() {
    return this.m_oHttp.get<any>(this.APIURL + '/admin/users/summary');
  };

  /**
   * Get the details of a user
   * @param sUserId User Id
   * @returns UsersFullViewModel
   */
  getUserDetails(sUserId: string) {
    return this.m_oHttp.get(this.APIURL + '/admin/users?userId=' + sUserId);
  };

  /**
   * Updates one user
   * @param oUser 
   * @returns 
   */
  updateUser(oUser) {
    return this.m_oHttp.put(this.APIURL + '/admin/users', oUser, { observe: 'response' });
  };

  /**
   * Deletes one user
   * @param sUserId 
   * @returns 
   */
  deleteUser(sUserId: string) {
    return this.m_oHttp.delete(this.APIURL + '/admin/users?userId=' + sUserId);
  };

  /**
   * Get an array of strings with the resource types
   * @returns 
   */
  getResourceTypes() {
    return this.m_oHttp.get<any>(this.APIURL + '/admin/resourcePermissions/types');
  };

  /**
   * Find resources by a partial name
   * @returns
   */
  findResourceByPartialName(sSearchName, sResourceType, iOffset, iLimit) {
    return this.m_oHttp.get<any>(this.APIURL + "/admin/resourceByPartialName?resourceType=" + sResourceType + "&partialName=" + sSearchName + "&offset=" + iOffset + "&limit=" + iLimit)
  }
}

