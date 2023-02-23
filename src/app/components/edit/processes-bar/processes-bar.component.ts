import { Component, Inject, Input, OnChanges } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { faArrowUp, faDownload, faRefresh } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-processes-bar',
  templateUrl: './processes-bar.component.html',
  styleUrls: ['./processes-bar.component.css']
})
export class ProcessesBarComponent {
  //Fontawesome Icon Declarations
  faArrowUp = faArrowUp;

  @Input() m_aoProcessesRunning: any[] = [];
  m_iNumberOfProcesses: number = 0;
  m_iWaitingProcesses: number = 0;
  m_oLastProcesses: any = null;

  constructor(private _bottomSheet: MatBottomSheet) {

  }


  openProcessesBar(): void {
    this._bottomSheet.open(ProcessesBarContent, {
      data: this.m_aoProcessesRunning
    })
  }
}

@Component({
  selector: 'processes-bar-content',
  templateUrl: 'processes-bar-content.html',
  styleUrls: ['./processes-bar-content.css']
})
export class ProcessesBarContent {
  faDownload = faDownload;
  faRefresh = faRefresh;

  m_aoProcessesRunning: any[] = this.data;

  constructor(private _bottomSheetRef: MatBottomSheetRef<ProcessesBarComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}