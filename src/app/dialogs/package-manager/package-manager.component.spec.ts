import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { PackageManagerComponent } from './package-manager.component';

describe('PackageManagerComponent', () => {
  let component: PackageManagerComponent;
  let fixture: ComponentFixture<PackageManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackageManagerComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
