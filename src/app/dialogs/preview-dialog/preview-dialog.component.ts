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
    const oPayload = this.m_oData.oPayload;

    // Inside PreviewDialogComponent's constructor
    if (oPayload.type === "pdf" || oPayload.type === "txt") {
      this.m_oCatalogService.newDownloadByName(
        oPayload.fileName,
        oPayload.workspace.workspaceId,
        oPayload.workspace.apiUrl ? oPayload.workspace.apiUrl : null,
        'inline'
      ).subscribe({
        next: (oResponse) => {
          if (oResponse.type === HttpEventType.Response && oResponse.body) {
            // Get the correct MIME type based on the file name
            const sMimeType = this.getMimeTypeFromFileName(oPayload.fileName);

            // Create a new Blob with the correct type
            const oBlob = new Blob([oResponse.body], { type: sMimeType });

            // Create the URL from the new Blob
            const unsafeUrl = URL.createObjectURL(oBlob);

            this.m_oPdfUrl = this.m_oSanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
          }
        },
        error: (oError) => {
          console.error("Error loading document", oError);
        }
      });
    } else if (oPayload.type === "image") {
      this.m_oCatalogService.newDownloadByName(
        oPayload.fileName,
        oPayload.workspace.workspaceId,
        oPayload.workspace.apiUrl ? oPayload.workspace.apiUrl : null,
        'inline' // Also pass 'inline' for images to be consistent
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

// Add this helper method inside your PreviewDialogComponent
  private getMimeTypeFromFileName(sFileName: string): string {
    const sExtension = sFileName.split('.').pop()?.toLowerCase();
    switch (sExtension) {
      case 'pdf':
        return 'application/pdf';
      case 'txt':
        return 'text/plain';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
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
