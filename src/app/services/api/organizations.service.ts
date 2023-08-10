import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {
  APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(private m_oConstantsService: ConstantsService, private m_oHttp: HttpClient) { }

  getOrganizationsListByUser() {
    return this.m_oHttp.get<any>(this.APIURL + '/organizations/byuser');
  };

  getOrganizationById(sOrganizationId: string) {
    return this.m_oHttp.get(this.APIURL + '/organizations/byId?organization=' + sOrganizationId);
  };

  saveOrganization(oOrganization) {
    if (FadeoutUtils.utilsIsStrNullOrEmpty(oOrganization.organizationId)) {
      return this.createOrganization(oOrganization);
    } else {
      return this.updateOrganization(oOrganization);
    }
  };

  createOrganization = function (oOrganization) {
    return this.m_oHttp.post(this.APIURL + '/organizations/add', oOrganization, { observe: 'response' });
  };

  updateOrganization(oOrganization) {
    return this.m_oHttp.put(this.APIURL + '/organizations/update', oOrganization, { observe: 'response' });
  };

  deleteOrganization(sOrganizationId: string) {
    return this.m_oHttp.delete(this.APIURL + '/organizations/delete?organization=' + sOrganizationId);
  };

  // Get list of shared users by organization id
  getUsersBySharedOrganization(sOrganizationId: string) {
    return this.m_oHttp.get(this.APIURL + '/organizations/share/byorganization?organization=' + sOrganizationId);
  }

  // Add sharing
  addOrganizationSharing(sOrganizationId: string, sUserId: string) {
    return this.m_oHttp.post<any>(this.APIURL + '/organizations/share/add?organization=' + sOrganizationId + '&userId=' + sUserId, {});
  }

  // Remove sharing
  removeOrganizationSharing(sOrganizationId: string, sUserId: string) {
    return this.m_oHttp.delete(this.APIURL + '/organizations/share/delete?organization=' + sOrganizationId + '&userId=' + sUserId);
  }
}