import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faFile, faFolder, faX } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { PackageManagerService } from 'src/app/services/api/package-manager.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
@Component({
  selector: 'app-package-manager',
  templateUrl: './package-manager.component.html',
  styleUrls: ['./package-manager.component.css']
})
export class PackageManagerComponent implements OnInit, OnDestroy {
  //Font Awesome Imports:
  faFolder = faFolder;
  faX = faX;

  m_bIsLoading: boolean = true;
  m_bIsEditing: boolean = false;

  m_sProcessorId: string;
  m_sProcessorName: string;

  m_aoPackages: Array<any> = [];

  m_sPackageManagerName = "";
  m_sPackageManagerVersion = "";
  m_sPackageName: string = "";

  m_iHookIndex: number;
  //SORTING
  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialogRef: MatDialogRef<PackageManagerComponent>,
    private m_oPackageManagerService: PackageManagerService,
    private m_oRabbitStompService: RabbitStompService) { }

  ngOnInit(): void {
    this.m_sProcessorId = this.m_oData.sProcessorId;
    this.m_sProcessorName = this.m_oData.sProcessorName;

    this.fetchPackageManagerInfo(this.m_sProcessorName);
    this.fetchPackages();

    this.m_iHookIndex = this.m_oRabbitStompService.addMessageHook(
      "ENVIRONMENTUPDATE",
      this,
      this.rabbitMessageHook
    );
  }

  ngOnDestroy(): void {
    this.m_oRabbitStompService.removeMessageHook(this.m_iHookIndex);
  }

  /**
   * Fetch Information for Package Manager (Package Manager Name and Version)
   */
  fetchPackageManagerInfo(sWorkspaceName: string) {
    this.m_oPackageManagerService.getPackageManagerInfo(sWorkspaceName).subscribe({
      next: oResponse => {
        console.log(oResponse);
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_sPackageManagerName = oResponse.name;
          this.m_sPackageManagerVersion = oResponse.version;
        }
      },
      error: oError => { }
    });
  }

  /**
   * Fetch Packages
   */
  fetchPackages() {
    this.m_oPackageManagerService.getPackagesList(this.m_sProcessorName).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false) {
          this.m_aoPackages = oResponse;
          this.m_bIsLoading = false;
        }
      },
      error: oError => {
        console.log(oError);
        this.m_bIsLoading = false;
      }
    })
  }

  /**
   * Remove a Package (library): 
   */
  removeLibrary() { }

  /**
   * Add a Package (library): 
   */
  addLibrary() { }

  /**
   * Update the List of Packages:
   */
  updateLibraryList(sProcessorId: string) {
    this.m_oPackageManagerService.addLibrary(sProcessorId, null).subscribe({
      next: oResponse => {
        console.log(oResponse);
        this.m_bIsLoading = true;
      },
      error: oError => {
        console.log("Error in Refresing Packages.")
      }
    })
  }

  /**
   * Update a single package (library): 
   */
  updateLibrary() {

  }

  rabbitMessageHook(oRabbitMessage, oController) {
    oController.fetchPackages();
    oController.m_bIsLoading = false
  }

  /**
   * Close Dialog
   */
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
