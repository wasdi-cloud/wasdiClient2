import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { ProjectInfoDialogComponent } from './project-info-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProjectInfoDialogComponent', () => {
  let component: ProjectInfoDialogComponent;
  let fixture: ComponentFixture<ProjectInfoDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ProjectInfoDialogComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [FormsModule, TranslateModule.forRoot()],
    providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: { bEditMode: false, subscription: { subscriptionId: 'sub-1', name: 'test-sub' }, project: null } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(ProjectInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
