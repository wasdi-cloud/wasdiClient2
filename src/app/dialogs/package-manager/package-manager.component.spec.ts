import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { PackageManagerComponent } from './package-manager.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PackageManagerComponent', () => {
  let component: PackageManagerComponent;
  let fixture: ComponentFixture<PackageManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [PackageManagerComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(PackageManagerComponent);
    component = fixture.componentInstance;
    component.m_oProcessorInfo = { processorId: 'proc-1', processorName: 'proc-name' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
