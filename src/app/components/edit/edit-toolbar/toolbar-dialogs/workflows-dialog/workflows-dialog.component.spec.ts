import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { WorkflowsDialogComponent } from './workflows-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WorkflowsDialogComponent', () => {
  let component: WorkflowsDialogComponent;
  let fixture: ComponentFixture<WorkflowsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [WorkflowsDialogComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowsDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
