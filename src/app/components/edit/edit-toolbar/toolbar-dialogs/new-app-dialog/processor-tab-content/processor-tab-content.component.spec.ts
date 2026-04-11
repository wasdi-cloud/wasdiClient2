import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ConstantsService } from 'src/app/services/constants.service';
import { JsonEditorService } from 'src/app/services/json-editor.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { RabbitStompService } from 'src/app/services/rabbit-stomp.service';
import { ProcessorTabContentComponent } from './processor-tab-content.component';

describe('ProcessorTabContentComponent', () => {
  let component: ProcessorTabContentComponent;
  let fixture: ComponentFixture<ProcessorTabContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessorTabContentComponent ],
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatBottomSheetRef, useValue: { dismiss: () => {} } },
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}), snapshot: {} } },
        { provide: Clipboard, useValue: { copy: () => true } },
        { provide: ConstantsService, useValue: { getActiveWorkspace: () => ({ workspaceId: 'ws-1' }) } },
        { provide: JsonEditorService, useValue: { setEditor: () => {}, setReadOnly: () => {}, initEditor: () => {}, setText: () => {} } },
        { provide: NotificationDisplayService, useValue: { openSnackBar: () => {}, openAlertDialog: () => {}, openConfirmationDialog: () => of(false) } },
        { provide: ProcessorService, useValue: { forceLibUpdate: () => of({}), redeployProcessor: () => of({}) } },
        { provide: RabbitStompService, useValue: { addMessageHook: () => 0, removeMessageHook: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessorTabContentComponent);
    component = fixture.componentInstance;
    component.m_oProcessorBasicInfo = new FormGroup({
      bIsPublic: new FormControl(0),
      iMinuteTimeout: new FormControl('180'),
      sJSONSample: new FormControl('{}'),
      sProcessorName: new FormControl('processor'),
      sProcessorVersion: new FormControl('1'),
      oType: new FormControl('python312')
    });
    component.editorRef = new ElementRef(document.createElement('div'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
