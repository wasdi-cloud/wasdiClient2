import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//Model Imports
import { Product } from 'src/app/shared/models/product.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

//Service Imports
import { ConstantsService } from '../constants.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  APIURL: string = this.oConstantsService.getAPIURL();

  m_bIgnoreWorkspaceApiUrl: boolean = this.oConstantsService.getIgnoreWorkspaceApiUrl();
  httpOptions = {
    observe: 'response'
  }

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  getProductListByWorkspace(sWorkspaceId: string) {
    return this.oHttp.get<Product[]>(this.APIURL + '/product/byws?workspace=' + sWorkspaceId);
  };

  getProductLightListByWorkspace(sWorkspaceId: string) {
    return this.oHttp.get<Product[]>(this.APIURL + '/product/bywslight?workspace=' + sWorkspaceId);
  };

  deleteProductFromWorkspace(sProductName: string, sWorkspaceId: string, bDeleteFile: boolean, bDeleteLayer: boolean) {

    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl: string = this.APIURL;

    //REFACTOR THIS TO REPRESENT NEW CONSTRUCTION
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    return this.oHttp.get<any>(sUrl + '/product/delete?name=' + sProductName + '&workspace=' + sWorkspaceId + '&deletefile=' + bDeleteFile + '&deletelayer=' + bDeleteLayer);
  };

  deleteProductListFromWorkspace(asProductNameList: string[], sWorkspaceId: string, bDeleteFile: boolean, bDeleteLayer: boolean) {

    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    //REFACTOR THIS TO REPRESENT NEW CONSTRUCTION
    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    // the list is passed in the body request
    return this.oHttp.post<any>(sUrl + '/product/deletelist?workspace=' + sWorkspaceId + '&deletefile=' + bDeleteFile + '&deletelayer=' + bDeleteLayer, asProductNameList);
  };

  updateProduct(oProductViewModel: any, workspaceId: string) {
    return this.oHttp.post<any>(this.APIURL + '/product/update?workspace=' + workspaceId, oProductViewModel, { observe: 'response' });
  };

  getProductMetadata(sProductName: string, sWorkspace: string) {

    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (oWorkspace != null && oWorkspace.apiUrl != null && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }
    return this.oHttp.get<any>(sUrl + "/product/metadatabyname?name=" + sProductName + "&workspace=" + sWorkspace);
  };


  uploadFile(sWorkspaceInput: string, oBody: object, sName: string, sStyle: string, sPlatformType: string) {

    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sUrl = this.APIURL;

    if (!FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace) && !FadeoutUtils.utilsIsObjectNullOrUndefined(oWorkspace.apiUrl) && !this.m_bIgnoreWorkspaceApiUrl) {
      sUrl = oWorkspace.apiUrl;
    }

    sUrl = sUrl + '/product/uploadfile?workspace=' + sWorkspaceInput + '&name=' + sName;
    if (sStyle) {
      sUrl = sUrl + '&style=' + sStyle;
    }

    if (sPlatformType) {
      sUrl = sUrl + "&platform="+sPlatformType
    }

    return this.oHttp.post<any>(sUrl, oBody, { observe: 'response' });
  };
}
