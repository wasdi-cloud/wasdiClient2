import { Component, Inject, OnInit, OnDestroy } from '@angular/core';

//Service Imports:
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { PackageManagerService } from 'src/app/services/api/package-manager.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';

//Mat Dialog Imports:
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

//Font Awesome Imports:
import { faArrowUp, faFolder, faTrashCan, faX } from '@fortawesome/free-solid-svg-icons';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';


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

  m_sPackageSearch: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialog: MatDialog,
    private m_oDialogRef: MatDialogRef<PackageManagerComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService,
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
          console.log(this.m_aoPackages)
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

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oPackageManagerService.deleteLibrary(sProcessorId, sPackageName).subscribe({
          next: oResponse => {
            this.m_bIsLoading = true;
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(`Error removing ${sPackageName}`);
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

    if (FadeoutUtils.utilsIsStrNullOrEmpty(sPackageInfoVersion) === false) {

      let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage);

      sAddCommand = sPackageInfoName + "/" + sPackageInfoVersion;

      bConfirmResult.subscribe(bDialogResult => {
        if (bDialogResult === true) {
          this.m_oPackageManagerService.addLibrary(sProcessorId, sAddCommand).subscribe({
            next: oResponse => {
              this.m_bIsLoading = true;
            },
            error: oError => {
              console.log("Error uploading your package");
            }
          })
        }
      });
    } else {
      let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage);

      bConfirmResult.subscribe(bDialogResult => {
        if (bDialogResult === true) {
          this.m_oPackageManagerService.addLibrary(sProcessorId, sPackageName).subscribe({
            next: oResponse => {
              this.m_bIsLoading = true;
            },
            error: oError => {
              console.log("Error uploading your package");
            }
          })
        }
      });
    }
  }

  /**
   * Update the List of Packages:
   */
  updateLibraryList(sProcessorId: string) {
    this.m_oPackageManagerService.addLibrary(sProcessorId, null).subscribe({
      next: oResponse => {
        this.m_bIsLoading = true;
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog("Error in refreshing your packages");
      }
    })
  }

  /**
   * Update a single package (library): 
   */
  updatePackage(sProcessorId: string, sPackageName: string, sPackageLatestVersion: string) {
    let sConfirmationMessage = `Are you sure you wish to update ${sPackageName}?`
    let sErrorMsg = `Error upgrading ${sPackageName}`

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oPackageManagerService.upgradeLibrary(sProcessorId, sPackageName, sPackageLatestVersion).subscribe({
          next: oResponse => {
            this.m_bIsLoading = true;
          },
          error: oError => {
            this.m_oNotificationDisplayService.openAlertDialog(sErrorMsg);
          }
        })
      }
    });
  }

  /**
   * Add rabbithook - execute function when message recieved
   * @param oRabbitMessage 
   * @param oController 
   */
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
