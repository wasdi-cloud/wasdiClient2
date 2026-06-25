import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-labelling-toolbar',
  templateUrl: './labelling-toolbar.component.html',
  styleUrls: ['./labelling-toolbar.component.css'],
  standalone: false
})
export class LabellingToolbarComponent {
  // ── Stats & State (Inputs) ──
  @Input() m_iTotalFeatures: number = 0;
  @Input() m_iValidatedCount: number = 0;
  @Input() m_bCanUndo: boolean = false;
  @Input() m_bRefreshing: boolean = false;
  @Input() m_bSaving: boolean = false;
  @Input() m_aoCollaborators: any[] = [];

  // ── Action Outputs ──
  @Output() m_oUndo = new EventEmitter<void>();
  @Output() m_oRefresh = new EventEmitter<void>();
  @Output() m_oSave = new EventEmitter<void>();
  @Output() m_oFileUpload = new EventEmitter<Event>();

  // ── Two-Way Bound Settings (Input + Output Change Event) ──
  @Input() m_sEditMode: 'draw' | 'vertices' | 'move' = 'move';
  @Output() m_sEditModeChange = new EventEmitter<'vertices' | 'move'>();

  @Input() m_sStyleBy: 'label' | 'annotator' = 'label';
  @Output() m_sStyleByChange = new EventEmitter<'label' | 'annotator'>();

  @Input() m_sFilterCollab: string = 'all';
  @Output() m_sFilterCollabChange = new EventEmitter<string>();

  @Input() m_bShowValidatedOnly: boolean = false;
  @Output() m_bShowValidatedOnlyChange = new EventEmitter<boolean>();

  // Local reference to the hidden file input
  @ViewChild('fileInput') m_oFileInputRef!: ElementRef<HTMLInputElement>;

  // ── Methods ──
  triggerFileUpload() {
    this.m_oFileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event) {
    this.m_oFileUpload.emit(event);
    // Reset the input so the same file can be uploaded again if needed
    this.m_oFileInputRef.nativeElement.value = '';
  }
}
