import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { WorkspaceInfoDialogComponent } from './workspace-info-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WorkspaceInfoDialogComponent', () => {
  let component: WorkspaceInfoDialogComponent;
  let fixture: ComponentFixture<WorkspaceInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [WorkspaceInfoDialogComponent],
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

    fixture = TestBed.createComponent(WorkspaceInfoDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
