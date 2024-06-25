import { Component, Inject, Input, OnInit, OnDestroy } from '@angular/core';

//Service Imports:
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { PackageManagerService } from 'src/app/services/api/package-manager.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';

//Utilities Imports:
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';


@Component({
  selector: 'app-package-manager',
  templateUrl: './package-manager.component.html',
  styleUrls: ['./package-manager.component.css']
})
export class PackageManagerComponent implements OnInit, OnDestroy {
  @Input() m_oProcessorInfo: any = null;

  m_bIsLoading: boolean = true;
  m_bIsEditing: boolean = false;

  m_sProcessorId: string;
  m_sProcessorName: string;

  m_aoPackages: Array<any> = [];

  m_sPackageManagerName = "";
  m_sPackageManagerVersion = "";
  m_sPackageName: string = "";
  m_sPackageToAdd: string = "";
  m_sPackageVersion: string = "";
  m_sPackageSearch: string = "";

  m_bShowInputFields: boolean = false;

  m_iHookIndex: number;

  constructor(
    private m_oNotificationDisplayService: NotificationDisplayService,
    private m_oPackageManagerService: PackageManagerService,
    private m_oRabbitStompService: RabbitStompService) { }

  ngOnInit(): void {
    this.m_sProcessorId = this.m_oProcessorInfo.processorId;
    this.m_sProcessorName = this.m_oProcessorInfo.processorName;

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
        this.m_bIsLoading = false;
      }
    })
  }

  /**
   * Remove a Package (library): 
   */
  removeLibrary(sProcessorId: string, sPackageName: string) {
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

  resetActionList(sProcessorId: string) {

    let sConfirmationMessage = `Are you sure you want to reset all your past actions on this app ?`;

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oPackageManagerService.resetActions(sProcessorId).subscribe({
          next: oResponse => {
            this.m_oNotificationDisplayService.openSnackBar("All the past actions on this app have been deleted");
          },
          error: oError => {
            this.m_oNotificationDisplayService.openSnackBar("There was an error resetting the past actions");
          }
        })
      }
    })

  }

  /**
   * Add a Package (library): 
   */
  addLibrary(sProcessorId: string, sPackageName: string, sPackageVersion?: string) {
    if (!sPackageName) {
      this.m_oNotificationDisplayService.openSnackBar("Package name missing, we cannot proceed");
      return;
    }

    let sConfirmationMessage = `Are you sure you wish to add ${sPackageName}?`;

    let sAddCommand = sPackageName;

    if (FadeoutUtils.utilsIsStrNullOrEmpty(sPackageVersion) === false) {
      sAddCommand += ("/" + sPackageVersion);
    }

    let bConfirmResult = this.m_oNotificationDisplayService.openConfirmationDialog(sConfirmationMessage);

    bConfirmResult.subscribe(bDialogResult => {
      if (bDialogResult === true) {
        this.m_oPackageManagerService.addLibrary(sProcessorId, sAddCommand).subscribe({
          next: oResponse => {
            this.m_bIsLoading = true;
            this.m_sPackageName = "";
            this.m_sPackageVersion = "";
          },
          error: oError => {
            this.m_oNotificationDisplayService.openSnackBar("Error adding your package. Are you sure about the name used?");
          }
        })
      }
    });

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
        this.m_oNotificationDisplayService.openAlertDialog("Error refreshing your packages");
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

  toggleShowInput(bShowInputs) {
    this.m_bShowInputFields = bShowInputs;
  }

  /**
   * Add rabbithook - execute function when message recieved
   * @param oRabbitMessage 
   * @param oController 
   */
  rabbitMessageHook(oRabbitMessage, oController) {
    oController.m_oNotificationDisplayService.openSnackBar(oRabbitMessage.payload);
    oController.fetchPackages();
    oController.m_bIsLoading = false
  }
}
