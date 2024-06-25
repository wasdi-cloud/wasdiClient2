
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { Ace, config, edit } from 'ace-builds';
import 'ace-builds';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/ext-searchbox'
import FadeoutUtils from 'src/app/lib/utils/FadeoutJSUtils';

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.css']
})
export class JsonEditorComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('editor') editorRef!: ElementRef;
  @Input() m_sText!: string;
  @Input() m_bReadOnly: boolean = false;
  @Input() m_sMode: string = 'json';
  @Input() m_bPrettify: boolean = true;

  @Input() m_sTextToInsert?: string;

  @Output() m_sTextChange = new EventEmitter<string>();

  m_oEditor!: Ace.Editor;
  // All possible options can be found at:
  // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
  options = {
    showPrintMargin: false,
    highlightActiveLine: true,
    tabSize: 2,
    wrap: true,
    fontSize: 14,
    fontFamily: '\'Roboto Mono Regular\', monospace',
  };

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.initEditor_();
  }

  onTextChange(text: string): void {
    this.m_sTextChange.emit(text);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.m_oEditor) {
      return;
    }

    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'text':
            this.onExternalUpdate_();
            break;
          case 'mode':
            this.onEditorModeChange_();
            break;
          default:
        }
      }
    }

    if (!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_sTextToInsert)) {
      let oPosition = this.m_oEditor.getCursorPosition();
      this.m_oEditor.session.insert(oPosition, this.m_sTextToInsert);
      this.m_sTextToInsert = "";
    }
  }

  private initEditor_(): void {
    this.m_oEditor = edit(this.editorRef.nativeElement);
    this.m_oEditor.setOptions(this.options);
    this.m_oEditor.setValue(this.m_sText, -1);
    this.m_oEditor.setReadOnly(this.m_bReadOnly);
    this.m_oEditor.setTheme('ace/theme/dracula');
    this.setEditorMode_();
    this.m_oEditor.session.setUseWorker(false);
    this.m_oEditor.on('change', () => this.onEditorTextChange_());
    // this.m_oEditor.execCommand('find');
  }

  private onExternalUpdate_(): void {
    const point = this.m_oEditor.getCursorPosition();
    this.m_oEditor.setValue(this.m_sText, -1);
    this.m_oEditor.moveCursorToPosition(point);
  }

  private onEditorTextChange_(): void {
    this.m_sText = this.m_oEditor.getValue();
    this.onTextChange(this.m_sText);
  }

  private onEditorModeChange_(): void {
    this.setEditorMode_();
  }

  private setEditorMode_(): void {
    this.m_oEditor.getSession().setMode(`ace/mode/${this.m_sMode}`);
  }


  public emitCursorPosition(oEvent) {

  }
}