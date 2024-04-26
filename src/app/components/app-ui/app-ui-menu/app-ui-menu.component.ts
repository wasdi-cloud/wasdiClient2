import { AfterViewChecked, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewWorkspaceDialogComponent } from '../../workspaces/new-workspace-dialog/new-workspace-dialog.component';
import { WorkspaceService } from 'src/app/services/api/workspace.service';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ProcessorService } from 'src/app/services/api/processor.service';

@Component({
  selector: 'app-app-ui-menu',
  templateUrl: './app-ui-menu.component.html',
  styleUrls: ['./app-ui-menu.component.css']
})
export class AppUiMenuComponent implements AfterViewChecked {
  @Input() m_aoTabs: Array<any> = [];
  @Input() m_sActiveTab: string = "";
  @Input() m_aoWorkspaces: Array<any> = [];
  @Input() m_bIsPurchased: boolean = true;
  @Output() m_sSelectedTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oSelectedWorkspace: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oExecuteAppEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() m_oExecutePurchaseEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private m_oDialog: MatDialog,
    private m_oWorkspaceService: WorkspaceService
  ) { }

  ngAfterViewChecked(): void {

  }
  openNewWorkspaceDialog() {
    this.m_oDialog.open(NewWorkspaceDialogComponent).afterClosed().subscribe(oResponse => {
      this.m_oWorkspaceService.getWorkspacesInfoListByUser().subscribe(oResponse => {
        this.m_aoWorkspaces = oResponse
      })
    })
  }

  setActiveTab(sTabName: string) {
    this.m_sActiveTab = sTabName;
    this.m_sSelectedTab.emit(this.m_sActiveTab);
  }

  getSelectedWorkspace(oEvent) {
    if (FadeoutUtils.utilsIsObjectNullOrUndefined(oEvent.value) === false) {
      this.m_oSelectedWorkspace.emit(oEvent.value)
    }
  }

  executeApp() {
    this.m_oExecuteAppEmitter.emit(true);
  }

  saveAppPurchase() {
    this.m_oExecutePurchaseEmitter.emit(true);
  }



}
