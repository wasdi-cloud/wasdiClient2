import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.css']
})
export class TableCellComponent implements OnInit {
  /**
   * Optional: Input for label
   */
  @Input() m_sLabel?: string;

  /**
   * Is the label formatted as a tag? 
   */
  @Input() m_bIsTag?: boolean = false;

  /**
   * What colour is the tag? 
   */
  m_sTagColor?: "green" | "red" | "yellow" = "yellow";

  ngOnInit(): void {
    if (this.m_bIsTag) {
      this.setTagColor();
    }
  }

  setTagColor() {
    if (this.m_sLabel === 'ERROR') {
      this.m_sTagColor = 'red';
    } else if (this.m_sLabel === 'STOPPED') {
      this.m_sTagColor = 'red';
      this.m_sLabel = "DIALOG_PROCESSES_LOGS_STOP";

    } else if (this.m_sLabel === 'DONE') {
      this.m_sTagColor = 'yellow';
      this.m_sLabel = "DIALOG_PROCESSES_LOGS_LOG"
    } else if (this.m_sLabel === 'RUNNING') {
      this.m_sTagColor = 'green';
      this.m_sLabel = "DIALOG_PROCESSES_LOGS_RUNNING";
    } else {
      this.m_sTagColor = 'green';
      this.m_sLabel = "DIALOG_PROCESSES_LOGS_WAIT";
    }
  }

}
