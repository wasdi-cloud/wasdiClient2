import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { StyleService } from 'src/app/services/api/style.service';

@Component({
  selector: 'app-new-style-dialog',
  templateUrl: './new-style-dialog.component.html',
  styleUrls: ['./new-style-dialog.component.css']
})
export class NewStyleDialogComponent {
  faX = faX;

  m_oNewStyle = {} as {
    sStyleName: string,
    sStyleDescription: string,
    bStyleIsPublic: boolean,
    sFileName: string
  }
  //Field with the current uploaded file

  m_oFile: any;
  m_bIsUploadingStyle: boolean = false;

  constructor(
    private m_oDialogRef: MatDialogRef<NewStyleDialogComponent>,
    private m_oStyleService: StyleService) { }

  //Get file info when the form is updated
  onFileSelect(input: any) {
    if (input.files && input.files[0]) {
      this.m_oFile = new FormData();
      this.m_oFile.append('file', input.files[0])
    }
  }

  onUploadStyle() {
    this.uploadStyle(this.m_oNewStyle.sStyleName, this.m_oNewStyle.sStyleDescription, this.m_oNewStyle.bStyleIsPublic, this.m_oFile)
  }

  uploadStyle(sName: string, sDescription: string, bIsPublic: boolean, oBody: any) {
    this.m_bIsUploadingStyle = true;

    this.m_oStyleService.uploadFile(sName, sDescription, oBody, bIsPublic).subscribe(oResponse => {
      console.log(oResponse)
      if (oResponse && oResponse.boolValue == true) {
        //confirmation dialog
        //reload list of styles
      } else {
        //failure dialog
      }

      this.m_bIsUploadingStyle = false;
    })

    return true;
  }
  onDismiss() {
    this.m_oDialogRef.close();
  }
}
