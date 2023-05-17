import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpResponse as DefaultResponse } from 'src/app/shared/models/http-response.model';
@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  APIURL: string = this.oConstantsService.getAPIURL();
  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();

  constructor(private oHttp: HttpClient, private oConstantsService: ConstantsService) { }

  findUsersByPartialName(sPartialName: string) {
    return this.oHttp.get(this.APIURL + '/admin/usersByPartialName?partialName=' + sPartialName);
  };

  findWorkspacesByPartialName(sPartialName: string) {
    return this.oHttp.get(this.APIURL + '/admin/workspacesByPartialName?partialName=' + sPartialName);
  };

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

    return this.oHttp.get(sUrl);
  };


  addResourcePermission(sResourceType: string, sResourceId: string, sUserId: string) {
    return this.oHttp.post<DefaultResponse>(this.APIURL + '/admin/resourcePermissions?resourceType=' + sResourceType + "&resourceId=" + sResourceId + "&userId=" + sUserId, {});
  };

  removeResourcePermission(sResourceType: string, sResourceId: string, sUserId: string) {
    return this.oHttp.delete(this.APIURL + '/admin/resourcePermissions?resourceType=' + sResourceType + "&resourceId=" + sResourceId + "&userId=" + sUserId);
  };

  getLatestMetricsEntryByNode(sNodeCode: string) {
    return this.oHttp.get(this.APIURL + '/admin/metrics/latest?nodeCode=' + sNodeCode);
  };
}
