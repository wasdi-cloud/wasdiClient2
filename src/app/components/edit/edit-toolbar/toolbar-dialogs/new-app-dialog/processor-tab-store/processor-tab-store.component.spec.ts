import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ImageService } from 'src/app/services/api/image.service';
import { NotificationDisplayService } from 'src/app/services/notification-display.service';
import { ProcessorMediaService } from 'src/app/services/api/processor-media.service';
import { ProcessorService } from 'src/app/services/api/processor.service';
import { ProcessorTabStoreComponent } from './processor-tab-store.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProcessorTabStoreComponent', () => {
  let component: ProcessorTabStoreComponent;
  let fixture: ComponentFixture<ProcessorTabStoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ProcessorTabStoreComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [ReactiveFormsModule, RouterTestingModule, TranslateModule.forRoot()],
    providers: [
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatBottomSheetRef, useValue: { dismiss: () => { } } },
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}), snapshot: {} } },
        { provide: ImageService, useValue: { getImageLink: () => '' } },
        { provide: NotificationDisplayService, useValue: { openAlertDialog: () => { }, openSnackBar: () => { } } },
        { provide: ProcessorMediaService, useValue: { getCategories: () => of([]) } },
        { provide: ProcessorService, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(ProcessorTabStoreComponent);
    component = fixture.componentInstance;
    component.m_oProcessorStoreInfo = new FormGroup({
      aoCategories: new FormControl([]),
      sLongDescription: new FormControl('')
    });
    component.m_oProcessor = { processorId: 'processor-1' };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
