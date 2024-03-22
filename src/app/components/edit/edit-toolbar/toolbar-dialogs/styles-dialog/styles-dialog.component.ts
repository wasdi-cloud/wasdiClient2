import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { ConstantsService } from 'src/app/services/constants.service';
import { StyleService } from 'src/app/services/api/style.service';

import { faEdit, faDownload, faPaintBrush, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { EditStyleDialogComponent } from './edit-style-dialog/edit-style-dialog.component';
import { NewStyleDialogComponent } from './new-style-dialog/new-style-dialog.component';

interface Style {
  description: string,
  name: string,
  public: boolean,
  sharedWithMe: string,
  styleId: string,
  userId: string
}

@Component({
  selector: 'app-styles-dialog',
  templateUrl: './styles-dialog.component.html',
  styleUrls: ['./styles-dialog.component.css']
})
export class StylesDialogComponent implements OnInit {
  //font awesome icons: 
  faDownload = faDownload;
  faEdit = faEdit;
  faPaintBrush = faPaintBrush;
  faPlus = faPlus;
  faX = faX;

  m_bDisplayInfo: boolean = false;
  m_sSearchString!: string;

  m_sActiveUserId: string;

  m_sFileName: string = "";
  m_oFile: any = null;

  m_aoStyleList: any[] = [];
  m_oSelectedStyle: any = {} as Style;

  m_oStyleFileData = {} as {
    styleName: string,
    styleDescription: string,
    isPublic: boolean;
  }

  m_bIsUploadingStyle: boolean = false;

  m_bIsLoadingStyles: boolean = false;
  m_bIsLoadingStyleList: boolean = false;
  m_bIsJsonEditModeActive: boolean = false;

  m_sJsonString: string = "";

  //Model variable that contains the Xml of the style: 
  m_asStyleXml: string = "";

  //Support variable enabled when the xml is edited in the textarea
  m_bXmlEdited: boolean = false;

  constructor(
    public m_oDialogRef: MatDialogRef<StylesDialogComponent>,
    private m_oDialog: MatDialog,
    private m_oConstantsService: ConstantsService,
    private m_oStyleService: StyleService
  ) {
    this.m_sActiveUserId = m_oConstantsService.getUserId()
    this.getStylesByUser();
  }

  ngOnInit() { }

  onDismiss(): void {
    this.m_oDialogRef.close();
  }

  filterStyles() {
    return this.m_aoStyleList.filter(oStyle => oStyle.name.includes(this.m_sSearchString));
  }

  getStylesByUser() {
    this.m_bIsLoadingStyles = true;
    this.m_oStyleService.getStylesByUser().subscribe(oResponse => {
      if (oResponse !== null && oResponse !== undefined) {
        this.m_aoStyleList = oResponse;
      }
    });
  }

  selectActiveStyle(oStyle: Style) {
    this.m_oSelectedStyle = oStyle;
    this.m_asStyleXml = "";
    this.m_bDisplayInfo = true;
    if (oStyle) {
      if (oStyle.styleId) {
        this.getStyleXml(oStyle.styleId, oStyle.userId);
      }
    }
  }

  getStyleXml(sStyleId: string, sUserId: string) {
    this.m_oStyleService.getStyleXml(sStyleId).subscribe(oResponse => {
      this.m_asStyleXml = oResponse;
    })
  }

  openStyleEditDialog(oStyle) {
    let oDialog = this.m_oDialog.open(EditStyleDialogComponent, {
      height: '80vh',
      width: '80vw',
      data: {
        styleInfo: oStyle,
        styleXML: this.m_asStyleXml
      }
    });
    oDialog.afterClosed().subscribe(() => {
      this.getStylesByUser();
    })
  }

  openNewStyleDialog() {
    let oDialog = this.m_oDialog.open(NewStyleDialogComponent, {
      height: '80vh',
      width: '50vw'
    })

    oDialog.afterClosed().subscribe(() => {
      this.getStylesByUser();
    })
  }

  downloadStyle(sStyleId: string) {
    if (!sStyleId) {
      return false;
    }

    let sUrl: string;
    if (this.m_oConstantsService.getActiveWorkspace().apiUrl) {
      sUrl = this.m_oConstantsService.getActiveWorkspace().apiUrl;
    }

    this.m_oStyleService.downloadStyle(sStyleId, sUrl);
    return true;
  }

  deleteStyle(sStyleId: string) {
    this.m_oStyleService.deleteStyle(sStyleId).subscribe(oResponse => {
      this.getStylesByUser();
      this.m_bDisplayInfo = false;
    });
  }

  handleSearchChange(oEvent) {
    this.m_sSearchString = oEvent.event.target.value;
  }

  handleToolbarClick(oEvent, oStyle) {
    if (oEvent === 'delete') {
      this.deleteStyle(oStyle)
    } else if (oEvent === 'edit') {
      this.openStyleEditDialog(oStyle);
    } else {
      this.downloadStyle(oStyle.styleId);
    }
  }
}