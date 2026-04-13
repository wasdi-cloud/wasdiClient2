import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { WorkspacesListDialogComponent } from './workspaces-list-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WorkspacesListDialogComponent', () => {
  let component: WorkspacesListDialogComponent;
  let fixture: ComponentFixture<WorkspacesListDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [WorkspacesListDialogComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(WorkspacesListDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
