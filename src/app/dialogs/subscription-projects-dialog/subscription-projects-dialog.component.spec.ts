import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { SubscriptionProjectsDialogComponent } from './subscription-projects-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SubscriptionProjectsDialogComponent', () => {
  let component: SubscriptionProjectsDialogComponent;
  let fixture: ComponentFixture<SubscriptionProjectsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [SubscriptionProjectsDialogComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [TranslateModule.forRoot()],
    providers: [
        { provide: MatDialogRef, useValue: { close: () => { } } },
        { provide: MAT_DIALOG_DATA, useValue: { subscription: { subscriptionId: 'sub-1', name: 'test-sub' } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(SubscriptionProjectsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
