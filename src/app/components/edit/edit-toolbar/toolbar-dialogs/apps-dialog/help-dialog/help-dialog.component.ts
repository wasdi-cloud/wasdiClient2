import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.css']
})
export class HelpDialogComponent implements OnInit {
  m_sHelpMsg: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<HelpDialogComponent>) { }

    ngOnInit(): void {
        if(this.m_oData.helpMsg) {
          this.m_sHelpMsg = this.m_oData.helpMsg
        }
    }
}
