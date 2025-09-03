import {Component, Inject} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {CatalogService} from "../../services/api/catalog.service";
import {HttpEventType} from "@angular/common/http";

@Component({
  selector: 'app-image-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.css']
})
export class PreviewDialogComponent {
  m_oPdfUrl!: SafeResourceUrl;
  m_oImageUrl!: SafeResourceUrl;

  constructor(@Inject(MAT_DIALOG_DATA) public m_oData: { oPayload: any },
              private m_oCatalogService: CatalogService,
              private m_oSanitizer: DomSanitizer,
              ) {

    // if (this.m_oData.oPayload.type === "pdf") {
    //   this.m_oCatalogService.newDownloadByName(this.m_oData.oPayload.fileName, this.m_oData.oPayload.workspace.workspaceId, this.m_oData.oPayload.workspace.apiUrl ? this.m_oData.oPayload.workspace.apiUrl : null).subscribe({
    //     next: (oResponse) => {
    //       if (oResponse.type === HttpEventType.Response) {
    //         const unsafeUrl = URL.createObjectURL(oResponse.body); // Generate object URL
    //         this.m_oPdfUrl = this.m_oSanitizer.bypassSecurityTrustResourceUrl(unsafeUrl); // Sanitize
    //       }
    //     },
    //     error: (oError) => {
    //       console.error("Error loading PDF", oError);
    //     }
    //   })
    // } else
      if (this.m_oData.oPayload.type === "image") {
      this.m_oCatalogService.newDownloadByName(
        this.m_oData.oPayload.fileName,
        this.m_oData.oPayload.workspace.workspaceId,
        this.m_oData.oPayload.workspace.apiUrl ? this.m_oData.oPayload.workspace.apiUrl : null
      ).subscribe({
        next: (oResponse) => {
          if (oResponse.type === HttpEventType.Response) {
            const unsafeUrl = URL.createObjectURL(oResponse.body);
            this.m_oImageUrl = this.m_oSanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
          }
        },
        error: (oError) => {
          console.error("Error loading image", oError);
        }
      });
    }
  }


  onDownload(sFileName: string) {
    if (sFileName) {
      this.m_oCatalogService.newDownloadByName(sFileName, this.m_oData.oPayload.workspace.workspaceId, this.m_oData.oPayload.workspace.apiUrl ? this.m_oData.oPayload.workspace.apiUrl : null).subscribe({
        next: (oResponse) => {
          if (oResponse.type === HttpEventType.Response) {
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(oResponse.body);
            a.href = objectUrl;
            a.download = sFileName;
            a.click();
            URL.revokeObjectURL(objectUrl);
          }

        },
        error: (oError) => {
          console.error("Error downloading image", oError);
        }
      });
    }
  }


}
