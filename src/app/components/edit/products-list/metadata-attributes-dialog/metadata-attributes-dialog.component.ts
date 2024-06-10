import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-metadata-attributes-dialog',
  templateUrl: './metadata-attributes-dialog.component.html',
  styleUrls: ['./metadata-attributes-dialog.component.css']
})
export class MetadataAttributesDialogComponent implements OnInit {
  m_oElement: any = null
  m_aoAttributes: Array<any> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private m_oData: any,
    private m_oDialogRef: MatDialogRef<MetadataAttributesDialogComponent>
  ) { }

  ngOnInit(): void {
    console.log(this.m_oData)
    this.m_oElement = this.m_oData.element.name;
    this.m_aoAttributes = this.m_oData.element.attributes
  }

  onDismiss() {
    this.m_oDialogRef.close()
  }
}
