import { Component } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { faArrowUp, faDownload, faRefresh } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-processes-bar',
  templateUrl: './processes-bar.component.html',
  styleUrls: ['./processes-bar.component.css']
})
export class ProcessesBarComponent {
  //Fontawesome Icon Declarations
  faArrowUp = faArrowUp;

  m_aoProcessesRunning: any[] = [];
  m_iNumberOfProcesses: number = 0;
  m_iWaitingProcesses: number = 0;
  m_oLastProcesses: any = null;

  constructor(private _bottomSheet: MatBottomSheet) {

  }



  openProcessesBar(): void {
    this._bottomSheet.open(ProcessesBarContent)
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
  constructor(private _bottomSheetRef: MatBottomSheetRef<ProcessesBarComponent>) { }
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}