import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-labelling-import-dialog',
  templateUrl: './labelling-import-dialog.component.html',
  styleUrl: './labelling-import-dialog.component.css',
  standalone: false
})
export class LabellingImportDialogComponent {
  m_oFile: File | null = null;
  m_sFileName: string = '';

  constructor(private m_oDialogRef: MatDialogRef<LabellingImportDialogComponent>) {}

  getSelectedFile(oEvent: any): void {
    console.log("📦 Raw event from drag-and-drop:", oEvent);

    let actualFile: any = null;

    // 1. Grab the name that the event explicitly gave us
    let actualName = oEvent.name || '';

    // 2. Unpack the File if it's trapped inside a FormData object
    if (oEvent.file instanceof FormData) {
      oEvent.file.forEach((value: any) => {
        // Find the first thing inside the FormData that is an actual File or Blob
        if (value instanceof File || value instanceof Blob) {
          actualFile = value;
        }
      });
    }
    // 3. Handle standard formats
    else if (oEvent.file) {
      actualFile = oEvent.file;
    } else if (Array.isArray(oEvent) && oEvent.length > 0) {
      actualFile = oEvent[0];
    } else {
      actualFile = oEvent;
    }

    if (actualFile) {
      // Prioritize the explicit name, fallback to the file's internal name
      this.m_sFileName = actualName || actualFile.name || 'unknown_file';
      this.m_oFile = actualFile;
      console.log("✅ File successfully unpacked:", this.m_sFileName);
    } else {
      console.error("❌ Could not extract file from event!");
    }
  }

  onDismiss(): void {
    this.m_oDialogRef.close(null); // Close and send nothing
  }

  onImport(): void {
    this.m_oDialogRef.close({
      file: this.m_oFile,
      name: this.m_sFileName
    });// Close and send the file!
  }
}
