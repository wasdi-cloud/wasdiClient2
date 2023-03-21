import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConstantsService } from 'src/app/services/constants.service';
import { StyleService } from 'src/app/services/api/style.service';

import { faEdit, faDownload, faPaintBrush, faX } from '@fortawesome/free-solid-svg-icons';

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
  faX = faX;

  constructor(
    public m_oDialogRef: MatDialogRef<StylesDialogComponent>,
    private m_oConstantsService: ConstantsService,
    private m_oStyleService: StyleService) { }

  ngOnInit() { }

  onDismiss(): void {
    this.m_oDialogRef.close();
  }
}

export class StylesDialogModel {
  constructor() { }
}