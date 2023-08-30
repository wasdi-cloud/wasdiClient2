import { Component, Inject, OnInit, OnDestroy } from '@angular/core';

//Service Imports:
import { PackageManagerService } from 'src/app/services/api/package-manager.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';

//Mat Dialog Imports:
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

//Font Awesome Imports:
import { faArrowUp, faFolder, faTrashCan, faX } from '@fortawesome/free-solid-svg-icons';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ConfirmationDialogComponent, ConfirmationDialogModel } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-package-manager',
  templateUrl: './package-manager.component.html',
  styleUrls: ['./package-manager.component.css']
})
export class PackageManagerComponent implements OnInit, OnDestroy {
  //Font Awesome Imports:
  faArrowUp = faArrowUp;
  faTrashcan = faTrashCan;
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
  m_sPackageToAdd: string;

  m_iHookIndex: number;
  //SORTING
  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialog: MatDialog,
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
  removeLibrary(sProcessorId: string, sPackageName: string) {
    console.log(sPackageName);
    let sConfirmationMessage = `Are you sure you want to remove ${sPackageName}?`;

    let oDialogData: ConfirmationDialogModel;
    oDialogData = new ConfirmationDialogModel("Confirm Removal", sConfirmationMessage);

    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: oDialogData
    });

    oDialogRef.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oPackageManagerService.deleteLibrary(sProcessorId, sPackageName).subscribe({
          next: oResponse => {
            this.m_bIsLoading = true;
          },
          error: oError => {
            console.log("error removing package");
          }
        })

      }
    })
  }

  /**
   * Add a Package (library): 
   */
  addLibrary(sProcessorId: string, sPackageName: string) {
    if (!sPackageName) {
      return;
    }
    let aPackageInfo = sPackageName.split("==");

    let aPackageInfoTrimmed = aPackageInfo.map((sElement) => {
      return sElement.replace(/["]+/g, "").trim();
    });

    let sPackageInfoName = aPackageInfoTrimmed[0];
    let sPackageInfoVersion = "";
    let sAddCommand = "";
    if (aPackageInfoTrimmed[1]) {
      sPackageInfoVersion = aPackageInfoTrimmed[1];
    }

    let sConfirmationMessage = `Are you sure you wish to add ${sPackageInfoName}?`;
    let oDialogData: ConfirmationDialogModel;

    if (FadeoutUtils.utilsIsStrNullOrEmpty(sPackageInfoVersion) === false) {
      sAddCommand = sPackageInfoName + "/" + sPackageInfoVersion;
      oDialogData = new ConfirmationDialogModel("Confrim Addition", sConfirmationMessage);

      let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
        maxWidth: "400px",
        data: oDialogData
      });

      oDialogRef.afterClosed().subscribe(oDialogResult => {
        this.m_sPackageToAdd = "";
        if (oDialogResult === true) {

          this.m_oPackageManagerService.addLibrary(sProcessorId, sAddCommand).subscribe({
            next: oResponse => {
              this.m_bIsLoading = true;
            },
            error: oError => {
              console.log("Error uploading your package");
            }
          })

        }
      })
    } else {
      oDialogData = new ConfirmationDialogModel("Confirm Addition", sConfirmationMessage); 

      let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
        maxWidth: "400px", 
        data: oDialogData
      }); 

      oDialogRef.afterClosed().subscribe(oDialogResult => {
        this.m_sPackageToAdd = "";
        if(oDialogResult === true) {
          this.m_oPackageManagerService.addLibrary(sProcessorId, sPackageName).subscribe({
            next: oResponse => {
              this.m_bIsLoading = true;
            }, 
            error: oError => {}
          })
        }
      })
    }
  }

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
  updatePackage(sProcessorId: string, sPackageName: string, sPackageLatestVersion: string) {
    let sConfirmationMessage = `Are you sure you wish to update ${sPackageName}?`

    let oDialogData: ConfirmationDialogModel;
    oDialogData = new ConfirmationDialogModel("Confirm Upgrade", sConfirmationMessage);

    let oDialogRef = this.m_oDialog.open(ConfirmationDialogComponent, {
      maxWidth: "400px",
      data: oDialogData
    });

    oDialogRef.afterClosed().subscribe(oDialogResult => {
      if (oDialogResult === true) {
        this.m_oPackageManagerService.upgradeLibrary(sProcessorId, sPackageName, sPackageLatestVersion).subscribe({
          next: oResponse => {
            this.m_bIsLoading = true;
          },
          error: oError => {
            console.log(`Error upgrading ${sPackageName}`);
          }
        })
      }
    })
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
