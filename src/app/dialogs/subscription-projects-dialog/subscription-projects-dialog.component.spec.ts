import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { SubscriptionProjectsDialogComponent } from './subscription-projects-dialog.component';

describe('SubscriptionProjectsDialogComponent', () => {
  let component: SubscriptionProjectsDialogComponent;
  let fixture: ComponentFixture<SubscriptionProjectsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionProjectsDialogComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { subscription: { subscriptionId: 'sub-1', name: 'test-sub' } } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    fixture = TestBed.createComponent(SubscriptionProjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
