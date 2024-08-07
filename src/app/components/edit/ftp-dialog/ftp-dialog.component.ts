import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

//Service Imports:
import { CatalogService } from 'src/app/services/api/catalog.service';
import { ConstantsService } from 'src/app/services/constants.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { Product } from 'src/app/shared/models/product.model';
import { Workspace } from 'src/app/shared/models/workspace.model';

@Component({
  selector: 'app-ftp-dialog',
  templateUrl: './ftp-dialog.component.html',
  styleUrls: ['./ftp-dialog.component.css']
})
export class FTPDialogComponent implements OnInit {
  m_sActiveTab: string = "sendToWorkspace";

  m_oActiveWorkspace: Workspace;
  m_oProduct: Product;

  m_oFTPRequest = {
    user: "",
    password: "",
    serverIp: "",
    port: "22",
    sftp: true,
    destinationAbsolutePath: ""
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oCatalogueService: CatalogService,
    private m_oConstantsService: ConstantsService,
    private m_oDialog: MatDialogRef<FTPDialogComponent>,
    private m_oNotificationDisplayService: NotificationDisplayService
  ) { }

  ngOnInit(): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oData) === false) {
      this.m_oProduct = this.m_oData.product;
    }
    this.m_oActiveWorkspace = this.m_oConstantsService.getActiveWorkspace();
  }

  /**
   * Submission Handler Function that checks the form's validity
   * @param oForm 
   */
  onSubmit(oForm: NgForm): void {
    if (oForm.status === "INVALID") {
      this.m_oNotificationDisplayService.openAlertDialog( "GURU MEDITATION: \n INVALID DATA FTP");
    }

    if (oForm.status === "VALID") {
      this.sendFTPUploadRequest();
    }
  }

  /**
   * Submit FTP Request to Server
   */
  sendFTPUploadRequest(): void {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oActiveWorkspace)) {
      this.m_oNotificationDisplayService.openAlertDialog( "GURU MEDITATION:\nYOU MUST SELECT AN ACTIVE WORKSPACE");
    }

    this.m_oCatalogueService.uploadFTPFile(this.m_oFTPRequest, this.m_oActiveWorkspace.workspaceId).subscribe({
      next: oResponse => {
        if (FadeoutUtils.utilsIsObjectNullOrUndefined(oResponse) === false && oResponse.boolValue === true) {
          this.m_oNotificationDisplayService.openSnackBar("Upload Complete");
        } else {
          this.m_oNotificationDisplayService.openAlertDialog( "GURU MEDITATION\nERROR TRANSFERRING FILE TO FTP");
        }
      },
      error: oError => {
        this.m_oNotificationDisplayService.openAlertDialog( "GURU MEDITATION:\nERROR TRANSFERRING FILE TO FTP")
      }
    })
  }


  setActiveTab(sActiveTab: string): void {
    if (sActiveTab) {
      this.m_sActiveTab = sActiveTab;
    }
  }
  /**
   * Returns the File Name of the Inputted Product
   * @returns {string}
   */
  getFileName(): string {
    return this.m_oProduct.fileName;
  }

  /**
   * Dismiss Dialog Box 
   */
  onDismiss(): void {
    this.m_oDialog.close();
  }
}
