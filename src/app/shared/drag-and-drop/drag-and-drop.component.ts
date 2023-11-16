import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.css']
})
export class DragAndDropComponent {
  @Output() m_oSelectedFileOutput = new EventEmitter();
  @Input() m_sFormDataType: string = 'file'
  m_sSelectedFileName: string = '';
  m_oSelectedFile: any;

  /**
   * Handle Files selected by the browse feature
   * @param oInput 
   */
  onFileSelect(oInput: any) {
    let oInputFile
  
    if (oInput['0']) {
      oInputFile = oInput['0'];

    } else if (oInput.files['0']) {
      oInputFile = oInput.files['0']
    }
      this.m_sSelectedFileName = oInputFile.name;
      this.m_oSelectedFile = new FormData();
      if (this.m_sFormDataType === 'file') {
        this.m_oSelectedFile.append('file', oInputFile);
      } else if (this.m_sFormDataType === 'image') {
        this.m_oSelectedFile.append('image', oInputFile)
      }
      this.m_oSelectedFileOutput.emit({
        name: this.m_sSelectedFileName,
        file: this.m_oSelectedFile
      });
  }

  /**
   * Hanlde files dropped to the file drop area
   * @param oInput 
   */
  onFileDropped(oInput: any) {
    this.onFileSelect(oInput);
  }


}
