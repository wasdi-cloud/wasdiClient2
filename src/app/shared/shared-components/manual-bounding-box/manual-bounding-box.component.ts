import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-manual-bounding-box',
  templateUrl: './manual-bounding-box.component.html',
  styleUrls: ['./manual-bounding-box.component.css']
})
export class ManualBoundingBoxComponent {
  m_oBBox = {
    north: "",
    south: "",
    east: "",
    west: ""
  }
  constructor(private m_oConstantsService: ConstantsService,
    private m_oDialogRef: MatDialogRef<ManualBoundingBoxComponent>) { }

  saveBoundingBox() {

      this.m_oDialogRef.close(this.m_oBBox);
    
  }

  onDismiss() {
    this.m_oDialogRef.close(null);
  }
}
