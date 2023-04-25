import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { faX } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-payload-dialog',
  templateUrl: './payload-dialog.component.html',
  styleUrls: ['./payload-dialog.component.css']
})
export class PayloadDialogComponent {
  faXmark = faX;
  m_oProcess = this.data.process;
  m_sPayloadString: string = "";

  constructor(
    private m_oDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data)
    this.getPayloadString(); 
  }

  getPayloadString() {
    if (!this.m_oProcess.payload) {
      this.m_sPayloadString = "No payload information is available for the selected process";
    } else {
      this.m_sPayloadString = this.data.process.payload;

      try {
        let oParsed = JSON.parse(this.m_sPayloadString);
        let sPrettyPrint = JSON.stringify(oParsed, null, 2);
        this.m_sPayloadString = sPrettyPrint; 
      } catch (error) { }

    }
  }

  dismiss(event: MouseEvent) {
    this.m_oDialog.closeAll();
  }
}
