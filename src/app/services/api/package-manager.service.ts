import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Workspace } from 'src/app/shared/models/workspace.model';
import { ConstantsService } from '../constants.service';

@Injectable({
  providedIn: 'root'
})
export class PackageManagerService {

  APIURL: string = this.oConstantsService.getAPIURL();
  m_sResource: string = "/packageManager";

  constructor(private oConstantsService: ConstantsService, private oHttp: HttpClient) { }

  /**
   * Fetch Package Manager Info
   */
  getPackageManagerInfo(sProcessorName: string) {
    return this.oHttp.get<any>(this.APIURL + this.m_sResource + "/managerVersion?name=" + sProcessorName)
  };

  /**
   * Return list of packages
   */
  getPackagesList(sProcessorName: string) {
    return this.oHttp.get<any>(this.APIURL + this.m_sResource + "/listPackages?name=" + sProcessorName);
  };

  /**
   * Remove a Library
   */
  deleteLibrary(sProcessorId: string, sLibraryName: string) {
    let oWorkspace: Workspace = this.oConstantsService.getActiveWorkspace();
    let sWorkspaceId = "-";

    if (oWorkspace.workspaceId) {
      sWorkspaceId = oWorkspace.workspaceId;
    }

    return this.oHttp.get(this.APIURL + this.m_sResource + "/environmentupdate?processorId=" + sProcessorId + "&workspace=" + sWorkspaceId + "&updateCommand=removePackage/" + sLibraryName + "/");
  };

  /**
   *  Add a Package
   */
  addLibrary(sProcessorId: string, sLibraryName: string) {
    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sWorkspaceId = "-";
    if (oWorkspace.workspaceId) {
      sWorkspaceId = oWorkspace.workspaceId;
    }

    let sUrl = this.APIURL + this.m_sResource +
      "/environmentupdate?processorId=" +
      sProcessorId +
      "&workspace=" +
      sWorkspaceId;

    if (sLibraryName) {
      sUrl += "&updateCommand=addPackage/" + sLibraryName + "/";
    }

    return this.oHttp.get(sUrl);
  };
  /**
   *   Update a Package
   */
  upgradeLibrary(sProcessorId: string, sLibraryName: string, sLatestVersion: string) {
    let oWorkspace = this.oConstantsService.getActiveWorkspace();
    let sWorkspaceId = "-";

    if (oWorkspace.workspaceId) {
      sWorkspaceId = oWorkspace.workspaceId;
    }

    return this.oHttp.get(this.APIURL + this.m_sResource + "/environmentupdate?processorId=" + sProcessorId + "&workspace=" + sWorkspaceId + "&updateCommand=upgradePackage/" + sLibraryName + "/" + sLatestVersion + "/"
    );
  };
}
