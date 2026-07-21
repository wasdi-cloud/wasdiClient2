import {Component, Inject} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {CatalogService} from "../../services/api/catalog.service";
import { HttpEventType } from "@angular/common/http";

@Component({
    selector: 'app-image-dialog',
    templateUrl: './preview-dialog.component.html',
    styleUrls: ['./preview-dialog.component.css'],
    standalone: false
})
export class PreviewDialogComponent {
  m_oPdfUrl!: SafeResourceUrl;
  m_oImageUrl!: SafeResourceUrl;

  private readonly m_oMimeTypeMap: { [sExtension: string]: string } = {
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    txt: 'text/plain',
    log: 'text/plain',
    dot: 'application/msword',
    dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    csv: 'text/csv',
    htm: 'text/html',
    html: 'text/html',
    md: 'text/markdown',
    json: 'application/json',
    xml: 'application/xml',
    yaml: 'application/yaml',
    yml: 'application/yaml',
    ini: 'text/plain',
    cfg: 'text/plain',
    conf: 'text/plain',
    bat: 'text/plain',
    sh: 'application/x-sh',
    ps1: 'application/x-powershell',
    tex: 'text/x-tex',
    texi: 'application/x-texinfo',
    texinfo: 'application/x-texinfo',
    c: 'text/x-csrc',
    cpp: 'text/x-c++src',
    h: 'text/x-chdr',
    hpp: 'text/x-c++hdr',
    java: 'text/x-java-source',
    py: 'text/x-python',
    rb: 'text/x-ruby',
    pl: 'text/x-perl',
    php: 'application/x-httpd-php',
    js: 'text/javascript',
    ts: 'application/typescript',
    css: 'text/css',
    scss: 'text/x-scss',
    less: 'text/x-less',
    sql: 'application/sql'
  };

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
    if (!sExtension) {
      return 'application/octet-stream';
    }

    return this.m_oMimeTypeMap[sExtension] ?? 'application/octet-stream';
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
